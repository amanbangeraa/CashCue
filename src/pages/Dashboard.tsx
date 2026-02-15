import { useMemo, useEffect, useState } from 'react';
import { Loader2, RefreshCw, AlertTriangle, PieChart } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { generateTaxInsights, generateDemoPortfolio } from '../services/aiAnalyzer';
import type { AIAnalysisResult } from '../services/aiAnalyzer';
import { PortfolioHealthScore } from '../components/ai/PortfolioHealthScore';
import { InsightCard } from '../components/ai/InsightCard';
import { TimelineView } from '../components/ai/TimelineView';
import { ScenarioComparison } from '../components/ai/ScenarioComparison';
import { UrgentActionsBanner } from '../components/ai/UrgentActionsBanner';
import { StatsCards } from '../components/dashboard/StatsCards';

interface DashboardProps {
  onNavigate: (page: 'portfolio') => void;
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center bg-[#111827] rounded-xl px-8 py-10 border border-[#1f2937]">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-full mb-4">
            <Loader2 className="w-8 h-8 text-emerald-200 animate-spin" />
          </div>
          <p className="text-white font-semibold">Analyzing your portfolio</p>
          <p className="text-slate-300 text-sm mt-1">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-[#111827] rounded-xl border border-red-500/30 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-200" />
          </div>
          <h3 className="font-semibold text-xl text-white mb-2">Analysis Error</h3>
          <p className="text-slate-200 mb-6">{error}</p>
          <button 
            onClick={handleRefresh}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
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
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-[#111827] rounded-xl border border-[#1f2937] p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-[#1f2937] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#374151]">
            <PieChart className="w-10 h-10 text-slate-200" />
          </div>
          <h3 className="font-semibold text-2xl text-white mb-2">No Portfolio Data</h3>
          <p className="text-slate-300 mb-6">Add stocks to get AI-powered tax insights</p>
          <button 
            onClick={() => onNavigate('portfolio')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
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
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2">
        <div className="space-y-2">
          <div className="pill w-max">AI TAX DASHBOARD</div>
          <div>
            <h1 className="text-3xl font-bold text-white drop-shadow-sm">Tax Dashboard</h1>
            <p className="text-slate-300 mt-1">AI-powered portfolio optimization</p>
          </div>
        </div>
        
        <button 
          onClick={handleRefresh}
          disabled={aiLoading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#111827] border border-[#1f2937] text-slate-100 hover:bg-[#1f2937] hover:border-emerald-500/30 transition-all font-semibold disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${aiLoading ? 'animate-spin' : ''}`} />
          Refresh Analysis
        </button>
      </div>

      <div className="space-y-12">
        {/* Stats Cards */}
        <section>
          <StatsCards
            portfolioValue={portfolioStats.totalValue}
            totalInvested={portfolioStats.totalInvested}
            totalPL={portfolioStats.totalPL}
            taxSavings={analysis.total_potential_savings}
          />
        </section>

        {/* Health Score */}
        <section>
          <PortfolioHealthScore
            score={analysis.health_score}
            strengths={analysis.strengths}
            weaknesses={analysis.weaknesses}
            totalSavings={analysis.total_potential_savings}
          />
        </section>

        {/* Urgent Actions */}
        {analysis.urgent_actions.length > 0 && (
          <section>
            <UrgentActionsBanner 
              actions={analysis.urgent_actions}
              onViewDetails={() => {/* Future: open modal with detailed actions */}}
            />
          </section>
        )}

        {/* High Priority Insights */}
        {highPriorityInsights.length > 0 && (
          <section className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-9 bg-gradient-to-b from-red-500 to-red-600 rounded-full shadow-lg shadow-red-500/20" />
              <div>
                <h2 className="text-2xl font-bold text-white">Priority Actions</h2>
                <p className="text-sm text-slate-400">Immediate attention required</p>
              </div>
            </div>
            <div className="grid gap-5">
              {highPriorityInsights.map((insight, idx) => (
                <InsightCard key={idx} insight={insight} />
              ))}
            </div>
          </section>
        )}

        {/* Timeline */}
        {analysis.timeline_events.length > 0 && (
          <section className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-9 bg-gradient-to-b from-blue-400 to-cyan-500 rounded-full shadow-lg shadow-cyan-500/20" />
              <div>
                <h2 className="text-2xl font-bold text-white">Critical Dates</h2>
                <p className="text-sm text-slate-400">Important deadlines and milestones</p>
              </div>
            </div>
            <TimelineView events={analysis.timeline_events} />
          </section>
        )}

        {/* Scenarios */}
        {analysis.scenarios.length > 0 && (
          <section className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-9 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-full shadow-lg shadow-emerald-500/20" />
              <div>
                <h2 className="text-2xl font-bold text-white">Tax Strategies</h2>
                <p className="text-sm text-slate-400">Compare scenarios and choose the best approach</p>
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
          <section className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-9 bg-gradient-to-b from-slate-400 to-slate-600 rounded-full shadow-lg shadow-slate-500/10" />
              <div>
                <h2 className="text-2xl font-bold text-white">Additional Opportunities</h2>
                <p className="text-sm text-slate-400">{otherInsights.length} more way{otherInsights.length > 1 ? 's' : ''} to optimize your taxes</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {otherInsights.map((insight, idx) => (
                <InsightCard key={idx} insight={insight} />
              ))}
            </div>
          </section>
        )}

        {/* Important Disclaimers */}
        <section className="bg-[#111827] border border-amber-500/30 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Important Disclaimers
          </h3>
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
              <div>
                <strong className="text-white">Not Investment Advice:</strong>
                <span className="text-slate-300"> This tool provides tax optimization insights based on mathematical analysis. 
                It is not personalized investment advice. Consult a SEBI-registered investment advisor for investment decisions.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
              <div>
                <strong className="text-white">Tax Law Changes:</strong>
                <span className="text-slate-300"> Tax calculations are based on current Indian tax laws as of FY 2024-25. 
                Rates and rules may change. Consult a Chartered Accountant for personalized tax advice.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
              <div>
                <strong className="text-white">Market Risks:</strong>
                <span className="text-slate-300"> Tax-loss harvesting involves selling securities. Market movements may result in 
                opportunity costs if stock prices change after sale. Consider your overall investment strategy.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
              <div>
                <strong className="text-white">Transaction Costs:</strong>
                <span className="text-slate-300"> All calculations include estimated transaction costs (STT, brokerage, GST). 
                Actual costs may vary by broker.</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
              <div>
                <strong className="text-white">No Guarantees:</strong>
                <span className="text-slate-300"> Potential savings are estimates based on current portfolio data and tax rules. 
                Actual outcomes may differ. Always verify calculations with a tax professional.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-[#1f2937] text-slate-400 text-sm">
          <div className="flex items-center justify-center gap-2">
            <span className="text-emerald-400">✦</span>
            Powered by Groq (Llama 3.3)
            <span className="text-slate-600">•</span>
            Last updated{' '}
            {new Date(analysis.generated_at).toLocaleString('en-IN', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
