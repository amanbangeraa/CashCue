import { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

interface UrgentActionsBannerProps {
  actions: string[];
  onViewDetails?: () => void;
}

export function UrgentActionsBanner({ actions, onViewDetails }: UrgentActionsBannerProps) {
  const [expanded, setExpanded] = useState(false);

  if (actions.length === 0) return null;

  return (
    <div className="bg-[#111827] border-l-4 border-amber-500 rounded-lg overflow-hidden">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#1f2937]/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-white">Time-Sensitive Opportunities</h3>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full">
                {actions.length} {actions.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <p className="text-sm text-slate-300">Tax optimization opportunities with approaching deadlines</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {onViewDetails && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails();
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Review Details
            </button>
          )}
          <button className="p-2 hover:bg-[#1f2937] rounded-lg transition-colors">
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-slate-300" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-300" />
            )}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-[#1f2937]">
          <ul className="space-y-2 mt-3">
            {actions.map((action, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-200">
                <span className="text-amber-400 mt-1 shrink-0">•</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-3 border-t border-slate-700">
            <p className="text-xs text-slate-400">
              <strong>Note:</strong> These are tax optimization insights, not investment recommendations. 
              Consider consulting your tax advisor before taking action.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
