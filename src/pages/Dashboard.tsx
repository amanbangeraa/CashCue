import { useMemo } from 'react';
import { TrendingUp, Wallet, TrendingDown, DollarSign, ArrowRight } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { StatCard } from '../components/shared/StatCard';
import { calculatePortfolioSummary, generateHarvestPlan } from '../utils/taxCalculations';
import { formatLargeNumber, formatWithSign } from '../utils/formatters';

interface DashboardProps {
  onNavigate: (page: 'portfolio' | 'tax-analysis') => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { stocks } = usePortfolio();

  const summary = useMemo(() => calculatePortfolioSummary(stocks), [stocks]);
  const harvestPlan = useMemo(() => generateHarvestPlan(stocks), [stocks]);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-xl p-12 text-white">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-bold mb-4">
            Your portfolio has {formatLargeNumber(harvestPlan.totalTaxSavings)} in hidden tax savings
          </h1>
          <p className="text-xl text-blue-100 mb-6">
            Unlock them with smart tax loss harvesting
          </p>
          <button
            onClick={() => onNavigate('tax-analysis')}
            className="inline-flex items-center px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
          >
            Analyze My Portfolio for Tax Savings
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Portfolio Value"
          value={formatLargeNumber(summary.totalCurrent)}
          icon={Wallet}
          color="blue"
        />
        <StatCard
          title="Total Invested"
          value={formatLargeNumber(summary.totalInvested)}
          icon={DollarSign}
          color="gray"
        />
        <StatCard
          title="Unrealized Gain/Loss"
          value={formatWithSign(summary.totalGainLoss)}
          icon={summary.totalGainLoss >= 0 ? TrendingUp : TrendingDown}
          color={summary.totalGainLoss >= 0 ? 'green' : 'red'}
          subtitle={`${summary.totalGainLoss >= 0 ? '+' : ''}${summary.totalGainLossPercentage.toFixed(2)}%`}
        />
        <StatCard
          title="Potential Tax Savings"
          value={formatLargeNumber(harvestPlan.totalTaxSavings)}
          icon={TrendingDown}
          color="green"
          large
        />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => onNavigate('portfolio')}
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow text-left border-2 border-transparent hover:border-blue-300"
        >
          <Wallet className="h-8 w-8 text-blue-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">View Portfolio</h3>
          <p className="text-sm text-gray-600">
            See all your holdings with real-time gains and losses
          </p>
          <div className="mt-4 text-blue-600 font-medium flex items-center">
            View Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        </button>

        <button
          onClick={() => onNavigate('tax-analysis')}
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow text-left border-2 border-transparent hover:border-green-300"
        >
          <TrendingDown className="h-8 w-8 text-green-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Tax Analysis</h3>
          <p className="text-sm text-gray-600">
            Get personalized tax loss harvesting recommendations
          </p>
          <div className="mt-4 text-green-600 font-medium flex items-center">
            Analyze Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        </button>

        <button
          onClick={() => onNavigate('portfolio')}
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow text-left border-2 border-transparent hover:border-blue-300"
        >
          <TrendingUp className="h-8 w-8 text-blue-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Stock</h3>
          <p className="text-sm text-gray-600">
            Add stocks manually or upload CSV to build your portfolio
          </p>
          <div className="mt-4 text-blue-600 font-medium flex items-center">
            Add Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        </button>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          What is Tax Loss Harvesting?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <div className="bg-blue-100 rounded-lg p-3 mb-3 inline-block">
              <span className="text-2xl">📉</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Identify Losses</h3>
            <p className="text-gray-600">
              Find stocks in your portfolio that are currently at a loss
            </p>
          </div>
          <div>
            <div className="bg-green-100 rounded-lg p-3 mb-3 inline-block">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Offset Gains</h3>
            <p className="text-gray-600">
              Use these losses to offset your capital gains and reduce tax liability
            </p>
          </div>
          <div>
            <div className="bg-yellow-100 rounded-lg p-3 mb-3 inline-block">
              <span className="text-2xl">🔄</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Rebuy & Save</h3>
            <p className="text-gray-600">
              Rebuy the same stocks to maintain your position while saving on taxes
            </p>
          </div>
        </div>
      </div>

      {/* Portfolio Stats */}
      {stocks.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Portfolio Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Holdings</p>
              <p className="text-2xl font-bold text-gray-900">{summary.numberOfHoldings}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Current Value</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatLargeNumber(summary.totalCurrent)}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Invested</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatLargeNumber(summary.totalInvested)}
              </p>
            </div>
            <div className={`text-center p-4 rounded-lg ${
              summary.totalGainLoss >= 0 ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <p className="text-sm text-gray-600 mb-1">Returns</p>
              <p className={`text-2xl font-bold ${
                summary.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {summary.totalGainLossPercentage.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
