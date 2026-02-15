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
      borderColor: 'border-green-200',
      bgLight: 'bg-green-50',
      label: 'LTCG Eligible' 
    },
    harvest_deadline: { 
      icon: AlertTriangle, 
      color: 'bg-orange-500',
      borderColor: 'border-orange-200',
      bgLight: 'bg-orange-50',
      label: 'Harvest Deadline' 
    },
    fy_end: { 
      icon: Calendar, 
      color: 'bg-red-500',
      borderColor: 'border-red-200',
      bgLight: 'bg-red-50',
      label: 'FY End' 
    },
    loss_expiry: { 
      icon: Clock, 
      color: 'bg-yellow-500',
      borderColor: 'border-yellow-200',
      bgLight: 'bg-yellow-50',
      label: 'Loss Expiry' 
    }
  };

  if (consolidatedEvents.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">No critical dates in near future</p>
        <p className="text-gray-500 text-sm mt-1">Your portfolio is on track</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="divide-y divide-gray-100">
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
                isPast ? 'opacity-40' : 'hover:bg-gray-50'
              } ${isUrgent && !isPast ? 'bg-red-50/30' : ''}`}
            >
              <div className={`w-11 h-11 ${config.color} rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm`}>
                <EventIcon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <span className={`inline-block px-2.5 py-1 ${config.bgLight} ${config.borderColor} border text-xs font-semibold rounded-md mb-2`}>
                      {config.label}
                    </span>
                    
                    {event.stock && (
                      <div className="mt-1.5">
                        <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md font-semibold">
                          {event.stock}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right shrink-0">
                    <div className="text-sm font-semibold text-gray-900">
                      {new Date(event.date).toLocaleDateString('en-IN', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    {!isPast && (
                      <div className={`text-xs mt-0.5 ${isUrgent ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                        {daysText}
                      </div>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 font-medium mb-1.5">
                  {event.impact}
                </p>
                
                <div className="flex items-start gap-2 text-sm text-indigo-600">
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
