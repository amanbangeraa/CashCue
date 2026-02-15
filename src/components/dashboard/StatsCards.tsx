import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import { MetricCard } from '../ui/Card';

interface StatsCardsProps {
  portfolioValue: number;
  totalInvested: number;
  totalPL: number;
  taxSavings: number;
}

export function StatsCards({ portfolioValue, totalInvested, totalPL, taxSavings }: StatsCardsProps) {
  const plPercentage = totalInvested > 0 ? ((totalPL / totalInvested) * 100).toFixed(2) : '0';
  const isProfit = totalPL >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        label="Portfolio Value"
        value={`₹${(portfolioValue / 1000).toFixed(1)}K`}
        icon={<PieChart className="w-6 h-6" />}
      />
      
      <MetricCard
        label="Total Invested"
        value={`₹${(totalInvested / 1000).toFixed(1)}K`}
        icon={<DollarSign className="w-6 h-6" />}
      />
      
      <MetricCard
        label="Total P&L"
        value={`₹${Math.abs(totalPL).toLocaleString('en-IN')}`}
        change={{
          value: `${isProfit ? '+' : '-'}${plPercentage}%`,
          positive: isProfit
        }}
        icon={isProfit ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
      />
      
      {taxSavings > 0 && (
        <MetricCard
          label="Tax Savings"
          value={`₹${taxSavings.toLocaleString('en-IN')}`}
          change={{
            value: 'AI identified',
            positive: true
          }}
          icon={<TrendingUp className="w-6 h-6" />}
        />
      )}
    </div>
  );
}
