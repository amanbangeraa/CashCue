import type { TaxInsight } from '../../services/aiAnalyzer';
import { 
  AlertTriangle, 
  TrendingDown, 
  Clock, 
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  XCircle
} from 'lucide-react';

interface InsightCardProps {
  insight: TaxInsight;
  onTakeAction?: (insight: TaxInsight) => void;
}

export function InsightCard({ insight, onTakeAction }: InsightCardProps) {
  const priorityConfig = {
    high: {
      badge: 'bg-red-50 text-red-700 border-red-200',
      icon: AlertTriangle,
      iconBg: 'bg-red-100 text-red-600',
      label: 'High Priority'
    },
    medium: {
      badge: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      icon: AlertCircle,
      iconBg: 'bg-yellow-100 text-yellow-600',
      label: 'Medium Priority'
    },
    low: {
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: TrendingDown,
      iconBg: 'bg-blue-100 text-blue-600',
      label: 'Low Priority'
    }
  };

  const riskConfig = {
    safe: { 
      icon: CheckCircle2, 
      label: 'Low Risk', 
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    moderate: { 
      icon: AlertCircle, 
      label: 'Moderate Risk', 
      color: 'text-yellow-600',
      bg: 'bg-yellow-50'
    },
    risky: { 
      icon: XCircle, 
      label: 'Higher Risk', 
      color: 'text-red-600',
      bg: 'bg-red-50'
    }
  };

  const config = priorityConfig[insight.priority];
  const risk = riskConfig[insight.risk_level];
  
  const PriorityIcon = config.icon;
  const RiskIcon = risk.icon;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className={`w-10 h-10 rounded-lg ${config.iconBg} flex items-center justify-center shrink-0`}>
              <PriorityIcon className="w-5 h-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${config.badge}`}>
                  {config.label}
                </span>
                
                {insight.deadline && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(insight.deadline).toLocaleDateString('en-IN', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                )}
              </div>
              
              <h3 className="font-semibold text-lg text-gray-900 leading-tight">
                {insight.title}
              </h3>
            </div>
          </div>
          
          {/* Savings Amount */}
          {insight.potential_saving > 0 && (
            <div className="text-right shrink-0">
              <div className="text-2xl font-bold text-green-600">
                ₹{insight.potential_saving.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-gray-500 font-medium">
                tax saving
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-4">
        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed">
          {insight.description}
        </p>

        {/* Meta Info: Risk + Stocks */}
        <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
          <div className={`flex items-center gap-2 ${risk.color}`}>
            <div className={`w-7 h-7 rounded-lg ${risk.bg} flex items-center justify-center`}>
              <RiskIcon className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">{risk.label}</span>
          </div>
          
          {insight.affected_stocks && insight.affected_stocks.length > 0 && (
            <div className="flex gap-1.5">
              {insight.affected_stocks.map(stock => (
                <span 
                  key={stock} 
                  className="px-2.5 py-1 bg-white border border-gray-200 text-gray-700 rounded-md text-xs font-mono font-semibold"
                >
                  {stock}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Items */}
        {insight.action_items && insight.action_items.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-px h-4 bg-indigo-300" />
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                Action Steps
              </span>
            </div>
            
            <div className="space-y-2.5">
              {insight.action_items.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 group">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    {idx + 1}
                  </div>
                  <span className="text-sm text-gray-700 leading-relaxed">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Button */}
        {onTakeAction && (
          <button
            onClick={() => onTakeAction(insight)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 group"
          >
            <span>Take Action</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
}
