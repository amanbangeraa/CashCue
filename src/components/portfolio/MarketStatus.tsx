import { Activity } from 'lucide-react';

export function MarketStatus() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const day = now.getDay();
  
  // Market hours: 9:15 AM to 3:30 PM IST, Monday to Friday
  const isWeekday = day >= 1 && day <= 5;
  const currentTime = hours * 60 + minutes;
  const marketOpen = 9 * 60 + 15; // 9:15 AM
  const marketClose = 15 * 60 + 30; // 3:30 PM
  
  const isMarketOpen = isWeekday && currentTime >= marketOpen && currentTime <= marketClose;
  
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
      isMarketOpen 
        ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-500/30' 
        : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
    }`}>
      <Activity className={`h-4 w-4 ${isMarketOpen ? 'animate-pulse' : ''}`} />
      <span>
        {isMarketOpen ? 'Market Open' : 'Market Closed'}
      </span>
      <span className="text-xs opacity-75">
        (NSE/BSE)
      </span>
    </div>
  );
}
