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
      badge: 'bg-red-500/10 text-red-200 border-red-500/30',
      icon: AlertTriangle,
      iconBg: 'bg-red-500/20 text-red-200',
      label: 'High Priority'
    },
    medium: {
      badge: 'bg-yellow-400/10 text-yellow-200 border-yellow-400/30',
      icon: AlertCircle,
      iconBg: 'bg-yellow-400/20 text-yellow-200',
      label: 'Medium Priority'
    },
    low: {
      badge: 'bg-emerald-400/10 text-emerald-100 border-emerald-400/30',
      icon: TrendingDown,
      iconBg: 'bg-emerald-400/20 text-emerald-100',
      label: 'Low Priority'
    }
  };

  const riskConfig = {
    safe: { 
      icon: CheckCircle2, 
      label: 'Low Risk', 
      color: 'text-emerald-200',
      bg: 'bg-emerald-500/15'
    },
    moderate: { 
      icon: AlertCircle, 
      label: 'Moderate Risk', 
      color: 'text-yellow-200',
      bg: 'bg-yellow-500/15'
    },
    risky: { 
      icon: XCircle, 
      label: 'Higher Risk', 
      color: 'text-red-200',
      bg: 'bg-red-500/15'
    }
  };

  const config = priorityConfig[insight.priority] || priorityConfig.medium;
  const risk = riskConfig[insight.risk_level] || riskConfig.moderate;
  
  const PriorityIcon = config.icon;
  const RiskIcon = risk.icon;

  return (
    <div className="bg-[#111827] rounded-xl border border-[#1f2937] hover:border-emerald-500/30 transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#1f2937]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className={`w-10 h-10 rounded-lg ${config.iconBg} flex items-center justify-center shrink-0`}> 
              <PriorityIcon className="w-5 h-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${config.badge}`}>
                  {config.label}
                </span>
                
                {insight.deadline && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-slate-100 flex items-center gap-1 border border-white/10">
                    <Clock className="w-3 h-3" />
                    {new Date(insight.deadline).toLocaleDateString('en-IN', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                )}
              </div>
              
              <h3 className="font-semibold text-lg text-white leading-tight">
                {insight.title}
              </h3>
            </div>
          </div>
          
          {/* Savings Amount */}
          {insight.potential_saving > 0 && (
            <div className="text-right shrink-0">
              <div className="text-2xl font-bold text-emerald-200">
                ₹{insight.potential_saving.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-slate-300 font-medium">
                tax saving
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-5 space-y-4">
        {/* Description */}
        <p className="text-sm text-slate-200 leading-relaxed">
          {insight.description}
        </p>

        {/* Meta Info: Risk + Stocks */}
        <div className="flex items-center justify-between py-3 px-4 bg-[#0d1117] border border-[#1f2937] rounded-lg">
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
                  className="px-2.5 py-1 bg-white/5 border border-white/10 text-slate-100 rounded-md text-xs font-mono font-semibold"
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
              <div className="w-px h-4 bg-emerald-300" />
              <span className="text-xs font-semibold text-emerald-100 uppercase tracking-wide">
                Action Steps
              </span>
            </div>
            
            <div className="space-y-2.5">
              {insight.action_items.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 group">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-200 flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    {idx + 1}
                  </div>
                  <span className="text-sm text-slate-200 leading-relaxed">
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
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 group"
          >
            <span>Take Action</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
}
