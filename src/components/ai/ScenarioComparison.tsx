import type { TaxScenario } from '../../services/aiAnalyzer';

interface ScenarioComparisonProps {
  scenarios: TaxScenario[];
  recommendedIndex: number;
}

export function ScenarioComparison({ scenarios, recommendedIndex }: ScenarioComparisonProps) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {scenarios.map((scenario, idx) => {
        const isRecommended = idx === recommendedIndex;
        
        return (
          <div 
            key={idx}
            className={`rounded-2xl p-6 transition-all ${
              isRecommended 
                ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-4 border-indigo-500 shadow-xl scale-105' 
                : 'bg-white border-2 border-gray-200 shadow-md hover:shadow-lg'
            }`}
          >
            {/* Recommended badge */}
            {isRecommended && (
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm px-4 py-2 rounded-full inline-flex items-center gap-2 mb-4 font-semibold">
                <span className="text-lg">🤖</span>
                AI Recommended
              </div>
            )}

            {/* Scenario name */}
            <h3 className="font-bold text-xl mb-4">{scenario.name}</h3>

            {/* Tax liability */}
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-1">Tax Liability</div>
              <div className="text-4xl font-bold text-gray-800">
                ₹{scenario.tax_liability.toLocaleString('en-IN')}
              </div>
              
              {scenario.net_benefit !== undefined && scenario.net_benefit > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-green-600 text-xl font-bold">
                    -₹{scenario.net_benefit.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm text-green-600 font-medium">saved</span>
                </div>
              )}
            </div>

            {/* Transaction costs */}
            {scenario.transaction_costs !== undefined && (
              <div className="text-sm text-gray-600 mb-4">
                Transaction costs: ₹{scenario.transaction_costs.toLocaleString('en-IN')}
              </div>
            )}

            {/* Pros & Cons */}
            <div className="space-y-4 mb-4">
              <div>
                <div className="font-semibold text-green-700 text-sm mb-2">✓ Pros:</div>
                <ul className="space-y-1">
                  {scenario.pros.slice(0, 3).map((pro, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-green-500 mt-0.5 flex-shrink-0">•</span>
                      <span className="line-clamp-2">{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="font-semibold text-red-700 text-sm mb-2">✗ Cons:</div>
                <ul className="space-y-1">
                  {scenario.cons.slice(0, 3).map((con, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-red-500 mt-0.5 flex-shrink-0">•</span>
                      <span className="line-clamp-2">{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actions */}
            {scenario.actions && scenario.actions.length > 0 && (
              <div className="bg-indigo-50 rounded-lg p-3">
                <div className="font-semibold text-sm text-indigo-900 mb-2">Steps:</div>
                <ol className="space-y-1">
                  {scenario.actions.map((action, i) => (
                    <li key={i} className="text-sm text-indigo-800 flex items-start gap-2">
                      <span className="font-semibold">{i + 1}.</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
