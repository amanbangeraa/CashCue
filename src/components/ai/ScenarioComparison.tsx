import { ArrowRight, Check } from 'lucide-react';
import type { TaxScenario } from '../../services/aiAnalyzer';

interface ScenarioComparisonProps {
  scenarios: TaxScenario[];
  recommendedIndex: number;
}

export function ScenarioComparison({ scenarios, recommendedIndex }: ScenarioComparisonProps) {
  // Calculate savings compared to baseline (first scenario)
  const baselineTax = scenarios[0]?.tax_liability || 0;
  
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {scenarios.map((scenario, idx) => {
        const isRecommended = idx === recommendedIndex;
        const savingsVsBaseline = idx > 0 ? baselineTax - scenario.tax_liability : 0;
        
        return (
          <div 
            key={idx}
            className={`rounded-xl overflow-hidden transition-all ${
              isRecommended 
                ? 'bg-[#111827] border-2 border-emerald-500 shadow-lg shadow-emerald-500/10 scale-[1.02]' 
                : 'bg-[#111827] border border-[#1f2937] opacity-80 hover:opacity-100 hover:border-emerald-500/20'
            }`}
          >
            {/* Header */}
            <div className={`p-6 pb-4 ${isRecommended ? 'bg-emerald-500/10' : 'bg-[#0d1117]'}`}>
              {isRecommended && (
                <div className="bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 mb-3 font-bold uppercase tracking-wide">
                  <Check className="w-3.5 h-3.5" />
                  Best Strategy
                </div>
              )}
              
              <h3 className={`font-bold text-xl mb-2 ${isRecommended ? 'text-white' : 'text-slate-200'}`}>
                {scenario.name}
              </h3>
              
              {/* Savings indicator */}
              {savingsVsBaseline > 0 && (
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-emerald-400 font-bold text-lg">
                    ↓ ₹{savingsVsBaseline.toLocaleString('en-IN')}
                  </div>
                  <span className="text-xs text-emerald-300 font-medium">
                    saved vs {scenarios[0].name}
                  </span>
                </div>
              )}
            </div>

            {/* Body */}
            <div className="p-6 pt-4">
              {/* Tax liability */}
              <div className="mb-6">
                <div className="text-xs text-slate-400 mb-1 uppercase tracking-wide font-semibold">Tax Liability</div>
                <div className={`font-bold ${isRecommended ? 'text-3xl text-white' : 'text-2xl text-slate-200'}`}>
                  ₹{scenario.tax_liability.toLocaleString('en-IN')}
                </div>
                
                {scenario.net_benefit !== undefined && scenario.net_benefit > 0 && (
                  <div className="mt-1.5 text-sm">
                    <span className="text-emerald-400 font-semibold">
                      Net benefit: ₹{scenario.net_benefit.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                
                {scenario.transaction_costs !== undefined && scenario.transaction_costs > 0 && (
                  <div className="text-xs text-slate-400 mt-1">
                    Transaction costs: ₹{scenario.transaction_costs.toLocaleString('en-IN')}
                  </div>
                )}
              </div>

              {/* Pros & Cons */}
              <div className="space-y-4 mb-6">
                <div>
                  <div className="font-semibold text-emerald-400 text-xs mb-2 uppercase tracking-wide">Pros</div>
                  <ul className="space-y-1.5">
                    {scenario.pros.slice(0, 3).map((pro, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                        <span className="line-clamp-2">{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {scenario.cons.length > 0 && (
                  <div>
                    <div className="font-semibold text-red-400 text-xs mb-2 uppercase tracking-wide">Cons</div>
                    <ul className="space-y-1.5">
                      {scenario.cons.slice(0, 2).map((con, i) => (
                        <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                          <span className="line-clamp-2">{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Actions */}
              {scenario.actions && scenario.actions.length > 0 && (
                <div className={`rounded-lg p-4 mb-4 ${isRecommended ? 'bg-[#0d1117] border border-emerald-500/20' : 'bg-[#0d1117] border border-[#1f2937]'}`}>
                  <div className="font-semibold text-xs text-slate-400 mb-2 uppercase tracking-wide">Action Steps</div>
                  <ol className="space-y-1.5">
                    {scenario.actions.map((action, i) => (
                      <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="font-bold text-emerald-400 text-xs">{i + 1}.</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* CTA Button */}
              {isRecommended && (
                <button 
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 group"
                  onClick={() => {/* Future: implement strategy */}}
                >
                  Choose This Strategy
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
              
              {!isRecommended && (
                <button 
                  className="w-full bg-[#1f2937] hover:bg-[#2a3441] text-slate-300 hover:text-white px-4 py-3 rounded-lg font-semibold transition-all border border-[#374151]"
                  onClick={() => {/* Future: implement strategy */}}
                >
                  Select Strategy
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
