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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      <div className="group" title="Total current market value of all holdings">
        <MetricCard
          label="Portfolio Value"
          value={`₹${portfolioValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<PieChart className="w-6 h-6" />}
        />
      </div>
      
      <div className="group" title="Total amount invested across all stocks">
        <MetricCard
          label="Total Invested"
          value={`₹${totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<DollarSign className="w-6 h-6" />}
        />
      </div>
      
      <div className="group" title={`${isProfit ? 'Unrealized gains' : 'Unrealized losses'}: ${plPercentage}% ${isProfit ? 'profit' : 'loss'}`}>
        <MetricCard
          label="Total P&L"
          value={`₹${Math.abs(totalPL).toLocaleString('en-IN')}`}
          change={{
            value: `${isProfit ? '+' : '-'}${plPercentage}%`,
            positive: isProfit
          }}
          icon={isProfit ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
        />
      </div>
      
      {taxSavings > 0 && (
        <div className="group" title="Potential tax savings identified by AI analysis">
          <MetricCard
            label="Tax Savings"
            value={`₹${taxSavings.toLocaleString('en-IN')}`}
            change={{
              value: 'AI identified',
              positive: true
            }}
            icon={<TrendingUp className="w-6 h-6" />}
          />
        </div>
      )}
    </div>
  );
}
