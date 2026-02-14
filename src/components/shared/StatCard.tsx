import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'gray';
  large?: boolean;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  subtitle, 
  color = 'blue',
  large = false,
}: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  const iconColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    gray: 'text-gray-600',
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${colorClasses[color]} p-6`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`mt-2 ${large ? 'text-4xl' : 'text-3xl'} font-bold text-gray-900`}>
            {value}
          </p>
          {subtitle && (
            <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className={`h-6 w-6 ${iconColorClasses[color]}`} />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-4">
          <span
            className={`inline-flex items-center text-sm font-medium ${
              trend === 'up'
                ? 'text-green-600'
                : trend === 'down'
                ? 'text-red-600'
                : 'text-gray-600'
            }`}
          >
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—'}
          </span>
        </div>
      )}
    </div>
  );
}
