import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'gradient';
}

export function Card({ children, className = '', variant = 'default' }: CardProps) {
  const baseStyles = 'rounded-xl p-6 transition-all duration-200 text-slate-100';

  const variantStyles = {
    default: 'bg-[#111827] border border-[#1f2937]',
    gradient: 'bg-[#111827] border border-emerald-500/30'
  };
  
  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: {
    value: string;
    positive: boolean;
  };
  icon?: React.ReactNode;
}

export function MetricCard({ label, value, change, icon }: MetricCardProps) {
  return (
    <Card className="hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 cursor-default">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-bold text-white drop-shadow-sm mb-1">{value}</p>
          
          {change && (
            <div className={`flex items-center gap-1.5 mt-3 text-sm font-semibold ${
              change.positive ? 'text-emerald-400' : 'text-red-400'
            }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {change.positive ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                )}
              </svg>
              <span>{change.value}</span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
