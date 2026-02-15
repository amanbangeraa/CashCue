import { useMemo, useEffect, useState } from 'react';
import { Loader2, RefreshCw, AlertTriangle, PieChart } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { generateTaxInsights, generateDemoPortfolio } from '../services/aiAnalyzer';
import type { AIAnalysisResult } from '../services/aiAnalyzer';
import { PortfolioHealthScore } from '../components/ai/PortfolioHealthScore';
import { InsightCard } from '../components/ai/InsightCard';
import { TimelineView } from '../components/ai/TimelineView';
import { ScenarioComparison } from '../components/ai/ScenarioComparison';
import { StatsCards } from '../components/dashboard/StatsCards';

interface DashboardProps {
  onNavigate: (page: 'portfolio' | 'tax-analysis') => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { stocks, loading: stocksLoading } = usePortfolio();
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate portfolio stats
  const portfolioStats = useMemo(() => {
    const totalValue = stocks.reduce((sum, s) => sum + (s.currentPrice * s.quantity), 0);
    const totalInvested = stocks.reduce((sum, s) => sum + (s.buyPrice * s.quantity), 0);
    const totalPL = totalValue - totalInvested;
    
    return { totalValue, totalInvested, totalPL };
  }, [stocks]);

  // Calculate realized gains (you can enhance this with actual data from your context)
  const realizedGains = 0;

  const handleRefresh = async () => {
    setAiLoading(true);
    try {
      const totalValue = stocks.reduce((sum, s) => sum + (s.currentPrice * s.quantity), 0);
      const portfolioToAnalyze = stocks.length < 5 || totalValue < 100000 
        ? generateDemoPortfolio() 
        : stocks;
      const result = await generateTaxInsights(portfolioToAnalyze, realizedGains);
      setAnalysis(result);
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setAiLoading(false);
    }
  };

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
          <p className="text-gray-700 font-medium">Analyzing your portfolio</p>
          <p className="text-gray-500 text-sm mt-1">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border-2 border-red-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="font-semibold text-xl text-gray-900 mb-2">Analysis Error</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={handleRefresh}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No stocks state
  if (stocks.length === 0 || !analysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PieChart className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="font-semibold text-2xl text-gray-900 mb-2">No Portfolio Data</h3>
          <p className="text-gray-600 mb-6">Add stocks to get AI-powered tax insights</p>
          <button 
            onClick={() => onNavigate('portfolio')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Add Stocks
          </button>
        </div>
      </div>
    );
  }

  // AI-Powered Dashboard with analysis
  const highPriorityInsights = analysis.insights.filter(i => i.priority === 'high');
  const otherInsights = analysis.insights.filter(i => i.priority !== 'high');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tax Dashboard</h1>
            <p className="text-gray-600 mt-1">AI-powered portfolio optimization</p>
          </div>
          
          <button 
            onClick={handleRefresh}
            disabled={aiLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="space-y-8">
          {/* Stats Cards */}
          <StatsCards
            portfolioValue={portfolioStats.totalValue}
            totalInvested={portfolioStats.totalInvested}
            totalPL={portfolioStats.totalPL}
            taxSavings={analysis.total_potential_savings}
          />

          {/* Health Score */}
          <PortfolioHealthScore
            score={analysis.health_score}
            strengths={analysis.strengths}
            weaknesses={analysis.weaknesses}
            totalSavings={analysis.total_potential_savings}
          />

          {/* Urgent Actions */}
          {analysis.urgent_actions.length > 0 && (
            <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl p-6 shadow-md">
              <h3 className="font-bold text-xl mb-3 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" />
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

          {/* High Priority Insights */}
          {highPriorityInsights.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-8 bg-red-500 rounded-full" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Priority Actions</h2>
                  <p className="text-sm text-gray-600">Immediate attention required</p>
                </div>
              </div>
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
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-8 bg-indigo-500 rounded-full" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Critical Dates</h2>
                  <p className="text-sm text-gray-600">Important deadlines and milestones</p>
                </div>
              </div>
              <TimelineView events={analysis.timeline_events} />
            </section>
          )}

          {/* Scenarios */}
          {analysis.scenarios.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-8 bg-indigo-500 rounded-full" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Tax Scenarios</h2>
                  <p className="text-sm text-gray-600">Compare different strategies</p>
                </div>
              </div>
              <ScenarioComparison 
                scenarios={analysis.scenarios}
                recommendedIndex={analysis.recommended_scenario}
              />
            </section>
          )}

          {/* Other Insights */}
          {otherInsights.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-8 bg-gray-400 rounded-full" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Additional Opportunities</h2>
                  <p className="text-sm text-gray-600">More ways to optimize your taxes</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {otherInsights.map((insight, idx) => (
                  <InsightCard key={idx} insight={insight} />
                ))}
              </div>
            </section>
          )}

          {/* Footer */}
          <div className="text-center pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Powered by Groq (Llama 3.3) • Last updated{' '}
              {new Date(analysis.generated_at).toLocaleString('en-IN', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
