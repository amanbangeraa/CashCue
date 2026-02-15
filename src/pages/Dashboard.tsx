import { useMemo, useEffect, useState } from 'react';
import { TrendingUp, Wallet, TrendingDown, DollarSign, ArrowRight } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { StatCard } from '../components/shared/StatCard';
import { calculatePortfolioSummary, generateHarvestPlan } from '../utils/taxCalculations';
import { formatLargeNumber, formatWithSign } from '../utils/formatters';
import { generateTaxInsights, generateDemoPortfolio } from '../services/aiAnalyzer';
import type { AIAnalysisResult } from '../services/aiAnalyzer';
import { PortfolioHealthScore } from '../components/ai/PortfolioHealthScore';
import { InsightCard } from '../components/ai/InsightCard';
import { TimelineView } from '../components/ai/TimelineView';
import { ScenarioComparison } from '../components/ai/ScenarioComparison';
import { LoadingSpinner } from '../components/ai/LoadingSpinner';

interface DashboardProps {
  onNavigate: (page: 'portfolio' | 'tax-analysis') => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { stocks, loading: stocksLoading } = usePortfolio();
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summary = useMemo(() => calculatePortfolioSummary(stocks), [stocks]);
  const harvestPlan = useMemo(() => generateHarvestPlan(stocks), [stocks]);

  // Calculate realized gains (you can enhance this with actual data from your context)
  const realizedGains = 0;

  // Trigger AI analysis when stocks are loaded
  useEffect(() => {
    async function analyzePortfolio() {
      if (stocksLoading) {
        setAiLoading(false);
        return;
      }

      try {
        setAiLoading(true);
        setError(null);
        
        // If portfolio is too small, use demo data for testing/hackathon
        const totalValue = stocks.reduce((sum, s) => sum + (s.currentPrice * s.quantity), 0);
        const portfolioToAnalyze = stocks.length < 5 || totalValue < 100000 
          ? generateDemoPortfolio() 
          : stocks;
        
        if (portfolioToAnalyze !== stocks) {
          console.log('📊 Using demo portfolio for AI analysis (your portfolio is small)');
        }
        
        const result = await generateTaxInsights(portfolioToAnalyze, realizedGains);
        setAnalysis(result);
      } catch (err) {
        console.error('AI Analysis failed:', err);
        setError('Unable to generate AI insights. Showing basic portfolio view.');
      } finally {
        setAiLoading(false);
      }
    }

    analyzePortfolio();
  }, [stocks, stocksLoading, realizedGains]);

  // Loading state
  if (stocksLoading || (aiLoading && !analysis)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="🤖 AI is analyzing your portfolio..." />
      </div>
    );
  }

  // No stocks state
  if (stocks.length === 0) {
    return (
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-xl p-12 text-white">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-4">
              Welcome to CashCue! 📊
            </h1>
            <p className="text-xl text-blue-100 mb-6">
              Add stocks to your portfolio to get AI-powered tax optimization insights
            </p>
            <button
              onClick={() => onNavigate('portfolio')}
              className="inline-flex items-center px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              Add Your First Stock
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // AI-Powered Dashboard with analysis
  if (analysis && !error) {
    const highPriorityInsights = analysis.insights.filter(i => i.priority === 'high');
    const mediumPriorityInsights = analysis.insights.filter(i => i.priority === 'medium');
    const lowPriorityInsights = analysis.insights.filter(i => i.priority === 'low');

    return (
      <div className="space-y-8">
        {/* Portfolio Health Score - Hero Section */}
        <PortfolioHealthScore
          score={analysis.health_score}
          strengths={analysis.strengths}
          weaknesses={analysis.weaknesses}
          totalSavings={analysis.total_potential_savings}
        />

        {/* Urgent Actions Alert */}
        {analysis.urgent_actions.length > 0 && (
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl p-6 shadow-lg">
            <h3 className="font-bold text-xl mb-3 flex items-center gap-2">
              <span className="text-2xl">🚨</span>
              Urgent Actions Required
            </h3>
            <ul className="space-y-2">
              {analysis.urgent_actions.map((action, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="font-bold mt-0.5">•</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Portfolio Value"
            value={formatLargeNumber(summary.totalCurrent)}
            icon={Wallet}
            color="blue"
          />
          <StatCard
            title="Total Invested"
            value={formatLargeNumber(summary.totalInvested)}
            icon={DollarSign}
            color="green"
          />
          <StatCard
            title="Total P&L"
            value={formatWithSign(summary.totalGainLoss)}
            icon={summary.totalGainLoss >= 0 ? TrendingUp : TrendingDown}
            color={summary.totalGainLoss >= 0 ? 'green' : 'red'}
          />
          <StatCard
            title="Tax Savings"
            value={formatLargeNumber(harvestPlan.totalTaxSavings)}
            icon={TrendingUp}
            color="green"
          />
        </div>

        {/* High Priority Insights */}
        {highPriorityInsights.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
              🔥 High Priority Actions
            </h2>
            <div className="grid gap-6">
              {highPriorityInsights.map((insight, idx) => (
                <InsightCard key={idx} insight={insight} />
              ))}
            </div>
          </section>
        )}

        {/* Timeline */}
        {analysis.timeline_events.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold mb-6">📅 Critical Dates</h2>
            <TimelineView events={analysis.timeline_events} />
          </section>
        )}

        {/* Scenarios */}
        {analysis.scenarios.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold mb-6">💡 Tax Optimization Scenarios</h2>
            <ScenarioComparison 
              scenarios={analysis.scenarios}
              recommendedIndex={analysis.recommended_scenario}
            />
          </section>
        )}

        {/* Medium Priority Insights */}
        {mediumPriorityInsights.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold mb-4">⚡ Medium Priority Opportunities</h2>
            <div className="grid gap-6">
              {mediumPriorityInsights.map((insight, idx) => (
                <InsightCard key={idx} insight={insight} />
              ))}
            </div>
          </section>
        )}

        {/* Low Priority Insights */}
        {lowPriorityInsights.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold mb-4">💡 Additional Optimizations</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {lowPriorityInsights.map((insight, idx) => (
                <InsightCard key={idx} insight={insight} />
              ))}
            </div>
          </section>
        )}

        {/* Metadata Footer */}
        <div className="text-center text-sm text-gray-500 pt-8 border-t">
          Analysis generated by Groq (Llama 3.3) on{' '}
          {new Date(analysis.generated_at).toLocaleString('en-IN')}
        </div>
      </div>
    );
  }

  // Fallback to basic dashboard if AI fails

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-xl p-12 text-white">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-bold mb-4">
            Your portfolio has {formatLargeNumber(harvestPlan.totalTaxSavings)} in hidden tax savings
          </h1>
          <p className="text-xl text-blue-100 mb-6">
            Unlock them with smart tax loss harvesting
          </p>
          <button
            onClick={() => onNavigate('tax-analysis')}
            className="inline-flex items-center px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
          >
            Analyze My Portfolio for Tax Savings
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Portfolio Value"
          value={formatLargeNumber(summary.totalCurrent)}
          icon={Wallet}
          color="blue"
        />
        <StatCard
          title="Total Invested"
          value={formatLargeNumber(summary.totalInvested)}
          icon={DollarSign}
          color="gray"
        />
        <StatCard
          title="Unrealized Gain/Loss"
          value={formatWithSign(summary.totalGainLoss)}
          icon={summary.totalGainLoss >= 0 ? TrendingUp : TrendingDown}
          color={summary.totalGainLoss >= 0 ? 'green' : 'red'}
          subtitle={`${summary.totalGainLoss >= 0 ? '+' : ''}${summary.totalGainLossPercentage.toFixed(2)}%`}
        />
        <StatCard
          title="Potential Tax Savings"
          value={formatLargeNumber(harvestPlan.totalTaxSavings)}
          icon={TrendingDown}
          color="green"
          large
        />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => onNavigate('portfolio')}
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow text-left border-2 border-transparent hover:border-blue-300"
        >
          <Wallet className="h-8 w-8 text-blue-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">View Portfolio</h3>
          <p className="text-sm text-gray-600">
            See all your holdings with real-time gains and losses
          </p>
          <div className="mt-4 text-blue-600 font-medium flex items-center">
            View Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        </button>

        <button
          onClick={() => onNavigate('tax-analysis')}
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow text-left border-2 border-transparent hover:border-green-300"
        >
          <TrendingDown className="h-8 w-8 text-green-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Tax Analysis</h3>
          <p className="text-sm text-gray-600">
            Get personalized tax loss harvesting recommendations
          </p>
          <div className="mt-4 text-green-600 font-medium flex items-center">
            Analyze Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        </button>

        <button
          onClick={() => onNavigate('portfolio')}
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow text-left border-2 border-transparent hover:border-blue-300"
        >
          <TrendingUp className="h-8 w-8 text-blue-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Stock</h3>
          <p className="text-sm text-gray-600">
            Add stocks manually or upload CSV to build your portfolio
          </p>
          <div className="mt-4 text-blue-600 font-medium flex items-center">
            Add Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        </button>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          What is Tax Loss Harvesting?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <div className="bg-blue-100 rounded-lg p-3 mb-3 inline-block">
              <span className="text-2xl">📉</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Identify Losses</h3>
            <p className="text-gray-600">
              Find stocks in your portfolio that are currently at a loss
            </p>
          </div>
          <div>
            <div className="bg-green-100 rounded-lg p-3 mb-3 inline-block">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Offset Gains</h3>
            <p className="text-gray-600">
              Use these losses to offset your capital gains and reduce tax liability
            </p>
          </div>
          <div>
            <div className="bg-yellow-100 rounded-lg p-3 mb-3 inline-block">
              <span className="text-2xl">🔄</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Rebuy & Save</h3>
            <p className="text-gray-600">
              Rebuy the same stocks to maintain your position while saving on taxes
            </p>
          </div>
        </div>
      </div>

      {/* Portfolio Stats */}
      {stocks.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Portfolio Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Holdings</p>
              <p className="text-2xl font-bold text-gray-900">{summary.numberOfHoldings}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Current Value</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatLargeNumber(summary.totalCurrent)}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Invested</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatLargeNumber(summary.totalInvested)}
              </p>
            </div>
            <div className={`text-center p-4 rounded-lg ${
              summary.totalGainLoss >= 0 ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <p className="text-sm text-gray-600 mb-1">Returns</p>
              <p className={`text-2xl font-bold ${
                summary.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {summary.totalGainLossPercentage.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
