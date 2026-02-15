import type { TimelineEvent } from '../../services/aiAnalyzer';

interface TimelineViewProps {
  events: TimelineEvent[];
}

export function TimelineView({ events }: TimelineViewProps) {
  const typeConfig = {
    ltcg_eligible: { icon: '📈', color: 'bg-green-500', label: 'LTCG Eligible' },
    harvest_deadline: { icon: '⏰', color: 'bg-orange-500', label: 'Harvest Deadline' },
    fy_end: { icon: '📅', color: 'bg-red-500', label: 'FY End' },
    loss_expiry: { icon: '⚠️', color: 'bg-yellow-500', label: 'Loss Expiry' }
  };

  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-200 via-purple-200 to-pink-200" />

      {/* Events */}
      <div className="space-y-6">
        {sortedEvents.map((event, idx) => {
          const config = typeConfig[event.type];
          const isPast = new Date(event.date) < new Date();
          
          return (
            <div key={idx} className="relative pl-16">
              {/* Timeline marker */}
              <div className={`absolute left-0 w-12 h-12 ${config.color} rounded-full flex items-center justify-center text-2xl shadow-lg ${isPast ? 'opacity-50' : ''}`}>
                {config.icon}
              </div>

              {/* Event card */}
              <div className={`bg-white rounded-xl p-5 shadow-md border-2 ${isPast ? 'border-gray-200 opacity-60' : 'border-indigo-200'}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className={`${config.color} text-white text-xs px-2 py-1 rounded-full font-semibold`}>
                      {config.label}
                    </span>
                    {event.stock && (
                      <span className="ml-2 bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full font-semibold">
                        {event.stock}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-700">
                      {new Date(event.date).toLocaleDateString('en-IN', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    {!isPast && (
                      <div className="text-xs text-gray-500">
                        {event.days_remaining} days
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <div className="font-semibold text-gray-800 mb-1">
                    {event.impact}
                  </div>
                  <div className="text-sm text-indigo-600 font-medium">
                    → {event.action}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
