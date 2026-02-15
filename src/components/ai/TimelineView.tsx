import type { TimelineEvent } from '../../services/aiAnalyzer';
import { Calendar, TrendingUp, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

interface TimelineViewProps {
  events: TimelineEvent[];
}

export function TimelineView({ events }: TimelineViewProps) {
  const consolidatedEvents = events
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const typeConfig = {
    ltcg_eligible: { 
      icon: TrendingUp, 
      color: 'bg-green-500',
      borderColor: 'border-green-500/40',
      bgLight: 'bg-green-500/10',
      label: 'LTCG Eligible' 
    },
    harvest_deadline: { 
      icon: AlertTriangle, 
      color: 'bg-orange-500',
      borderColor: 'border-orange-500/40',
      bgLight: 'bg-orange-500/10',
      label: 'Harvest Deadline' 
    },
    fy_end: { 
      icon: Calendar, 
      color: 'bg-red-500',
      borderColor: 'border-red-500/40',
      bgLight: 'bg-red-500/10',
      label: 'FY End' 
    },
    loss_expiry: { 
      icon: Clock, 
      color: 'bg-yellow-500',
      borderColor: 'border-yellow-500/40',
      bgLight: 'bg-yellow-500/10',
      label: 'Loss Expiry' 
    }
  };

  if (consolidatedEvents.length === 0) {
    return (
      <div className="bg-[#111827] rounded-xl border border-[#1f2937] p-12 text-center">
        <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-100 font-medium">No critical dates in near future</p>
        <p className="text-slate-300 text-sm mt-1">Your portfolio is on track</p>
      </div>
    );
  }

  return (
    <div className="bg-[#111827] rounded-xl border border-[#1f2937] overflow-hidden">
      <div className="divide-y divide-[#1f2937]">
        {consolidatedEvents.map((event, idx) => {
          const config = typeConfig[event.type];
          const EventIcon = config.icon;
          const isPast = new Date(event.date) < new Date();
          const isUrgent = event.days_remaining <= 7;
          
          const daysText = event.days_remaining === 0 ? 'Today' : 
                          event.days_remaining === 1 ? 'Tomorrow' :
                          `in ${event.days_remaining} days`;

          return (
            <div 
              key={idx} 
              className={`px-6 py-5 flex items-start gap-4 transition-all ${
                isPast ? 'opacity-40' : 'hover:bg-[#1f2937]/50'
              } ${isUrgent && !isPast ? 'bg-red-500/5' : ''}`}
            >
              <div className={`w-11 h-11 ${config.color} rounded-lg flex items-center justify-center text-white shrink-0`}>
                <EventIcon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <span className={`inline-block px-2.5 py-1 ${config.bgLight} ${config.borderColor} border text-xs font-semibold rounded-md mb-2 text-slate-100`}>
                      {config.label}
                    </span>
                    
                    {event.stock && (
                      <div className="mt-1.5">
                        <span className="text-xs font-mono bg-[#1f2937] text-emerald-100 px-2.5 py-1 rounded-md font-semibold border border-[#374151]">
                          {event.stock}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right shrink-0">
                    <div className="text-sm font-semibold text-white">
                      {new Date(event.date).toLocaleDateString('en-IN', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    {!isPast && (
                      <div className={`text-xs mt-0.5 ${isUrgent ? 'text-red-300 font-semibold' : 'text-slate-300'}`}>
                        {daysText}
                      </div>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-slate-100 font-medium mb-1.5">
                  {event.impact}
                </p>
                
                <div className="flex items-start gap-2 text-sm text-emerald-200">
                  <ArrowRight className="w-4 h-4 mt-0.5 shrink-0" />
                  <span className="font-medium">{event.action}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
