import type { TaxInsight } from '../../services/aiAnalyzer';

interface InsightCardProps {
  insight: TaxInsight;
  onTakeAction?: (insight: TaxInsight) => void;
}

export function InsightCard({ insight, onTakeAction }: InsightCardProps) {
  const priorityConfig = {
    high: {
      bg: 'bg-gradient-to-br from-red-50 to-orange-50',
      border: 'border-red-300',
      badge: 'bg-red-600',
      icon: '🔥'
    },
    medium: {
      bg: 'bg-gradient-to-br from-yellow-50 to-amber-50',
      border: 'border-yellow-300',
      badge: 'bg-yellow-600',
      icon: '⚡'
    },
    low: {
      bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
      border: 'border-green-300',
      badge: 'bg-green-600',
      icon: '💡'
    }
  };

  const riskConfig = {
    safe: { icon: '✅', label: 'Safe', color: 'text-green-600' },
    moderate: { icon: '⚠️', label: 'Moderate Risk', color: 'text-yellow-600' },
    risky: { icon: '🚨', label: 'Higher Risk', color: 'text-red-600' }
  };

  const config = priorityConfig[insight.priority];
  const risk = riskConfig[insight.risk_level];

  return (
    <div className={`${config.bg} border-2 ${config.border} rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{config.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className={`${config.badge} text-white text-xs px-2 py-1 rounded-full uppercase font-semibold`}>
                  {insight.priority} Priority
                </span>
                {insight.deadline && (
                  <span className="bg-white/80 text-gray-700 text-xs px-2 py-1 rounded-full">
                    ⏰ {insight.deadline}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-xl mt-2">{insight.title}</h3>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-3xl font-bold text-green-600">
            ₹{insight.potential_saving.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-gray-600 font-medium">Potential Saving</div>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-700 mb-4 leading-relaxed">
        {insight.description}
      </p>

      {/* Risk Level */}
      <div className={`flex items-center gap-2 mb-4 ${risk.color} font-medium text-sm`}>
        <span className="text-lg">{risk.icon}</span>
        <span>{risk.label}</span>
      </div>

      {/* Affected Stocks */}
      {insight.affected_stocks && insight.affected_stocks.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-semibold text-gray-600 mb-1">Stocks:</div>
          <div className="flex flex-wrap gap-2">
            {insight.affected_stocks.map(stock => (
              <span key={stock} className="bg-white/80 px-3 py-1 rounded-full text-sm font-medium">
                {stock}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action Items */}
      <div className="bg-white/60 rounded-lg p-4">
        <div className="font-semibold text-sm text-gray-700 mb-2">📋 Action Items:</div>
        <div className="space-y-2">
          {insight.action_items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-blue-600 font-bold mt-0.5">▸</span>
              <span className="text-sm text-gray-700">{item}</span>
            </div>
          ))}
        </div>
        
        {onTakeAction && (
          <button
            onClick={() => onTakeAction(insight)}
            className="mt-4 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
          >
            Take Action →
          </button>
        )}
      </div>
    </div>
  );
}
