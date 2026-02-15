import { TrendingUp, AlertCircle, CheckCircle2, Sparkles, Info } from 'lucide-react';
import { useState } from 'react';

interface PortfolioHealthScoreProps {
  score: number;
  strengths: string[];
  weaknesses: string[];
  totalSavings: number;
}

export function PortfolioHealthScore({ 
  score, 
  strengths, 
  weaknesses, 
  totalSavings 
}: PortfolioHealthScoreProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  
  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Fair';
    return 'Needs Attention';
  };

  const getScoreBg = (score: number) => {
    if (score >= 8) return 'from-green-500 to-emerald-600';
    if (score >= 6) return 'from-yellow-500 to-amber-600';
    return 'from-orange-500 to-red-600';
  };

  return (
    <div className="bg-[#111827] rounded-xl border border-[#1f2937] overflow-hidden">
      {/* Header Section */}
      <div className={`bg-gradient-to-r ${getScoreBg(score)} px-6 py-8 text-white`}> 
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center relative">
              <div 
                className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${getScoreBg(score)} flex items-center justify-center shadow-lg cursor-help`}
                onMouseEnter={() => setShowBreakdown(true)}
                onMouseLeave={() => setShowBreakdown(false)}
              >
                <div className="text-center">
                  <div className="text-4xl font-bold text-white">{score.toFixed(1)}</div>
                  <div className="text-xs text-white/80 font-medium">/ 10</div>
                </div>
              </div>
              
              {/* Score Breakdown Tooltip */}
              {showBreakdown && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-4 z-50 text-left">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-700">
                    <Info className="w-4 h-4 text-blue-400" />
                    <h4 className="text-sm font-bold text-white">Score Breakdown</h4>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Base Score:</span>
                      <span className="font-semibold text-white">10.0</span>
                    </div>
                    <div className="text-slate-400 text-xs mt-2 mb-1 font-medium">Deductions:</div>
                    <div className="flex justify-between items-center pl-2">
                      <span className="text-slate-300">• Unharvested Losses</span>
                      <span className="font-semibold text-red-400">-0.0 to -3.0</span>
                    </div>
                    <div className="flex justify-between items-center pl-2">
                      <span className="text-slate-300">• STCG Heavy Portfolio</span>
                      <span className="font-semibold text-red-400">-0.0 to -2.0</span>
                    </div>
                    <div className="flex justify-between items-center pl-2">
                      <span className="text-slate-300">• Near LTCG Threshold</span>
                      <span className="font-semibold text-red-400">-0.0 to -1.0</span>
                    </div>
                    <div className="flex justify-between items-center pl-2">
                      <span className="text-slate-300">• FY End Urgency</span>
                      <span className="font-semibold text-red-400">-0.0 to -1.0</span>
                    </div>
                    <div className="text-slate-400 text-xs mt-2 mb-1 font-medium">Bonuses:</div>
                    <div className="flex justify-between items-center pl-2">
                      <span className="text-slate-300">• Diversification</span>
                      <span className="font-semibold text-green-400">+0.0 to +1.0</span>
                    </div>
                    <div className="flex justify-between items-center pl-2">
                      <span className="text-slate-300">• LTCG Majority</span>
                      <span className="font-semibold text-green-400">+0.0 to +1.0</span>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-700 flex justify-between items-center">
                      <span className="text-white font-semibold">Your Score:</span>
                      <span className="font-bold text-lg text-white">{score.toFixed(1)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-3 pt-2 border-t border-slate-700">
                    Score reflects tax optimization efficiency based on transparent criteria. Hover to see formula.
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Portfolio Tax Health</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{getScoreLabel(score)}</h3>
              <p className="text-sm text-slate-300">{strengths.length} strengths • {weaknesses.length} opportunities</p>
            </div>
          </div>

          {totalSavings > 0 && (
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5 mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">Potential Savings</span>
              </div>
              <div className="text-3xl font-bold text-white">
                ₹{(totalSavings / 1000).toFixed(1)}K
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                ₹{totalSavings.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Estimated savings
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="px-6 py-5 border-t border-[#1f2937] bg-[#0d1117]">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-semibold text-white">What's Working</h4>
            </div>
            <ul className="space-y-2">
              {strengths.slice(0, 2).map((strength, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                  <div className="w-1 h-1 rounded-full bg-emerald-400 mt-2 shrink-0" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Opportunities */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-semibold text-white">Opportunities</h4>
            </div>
            <ul className="space-y-2">
              {weaknesses.slice(0, 2).map((weakness, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                  <div className="w-1 h-1 rounded-full bg-amber-400 mt-2 shrink-0" />
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
