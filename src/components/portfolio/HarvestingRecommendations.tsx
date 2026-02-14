import { useMemo } from 'react';
import { TrendingDown, TrendingUp, ArrowRight, AlertCircle } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { generateHarvestPlan } from '../../utils/taxCalculations';
import { formatCurrency, formatWithSign } from '../../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function HarvestingRecommendations() {
  const { stocks } = usePortfolio();

  const harvestPlan = useMemo(() => {
    return generateHarvestPlan(stocks);
  }, [stocks]);

  const comparisonData = [
    {
      name: 'Before',
      'STCG Tax': harvestPlan.beforeScenario.stcgTax,
      'LTCG Tax': harvestPlan.beforeScenario.ltcgTax,
      Total: harvestPlan.beforeScenario.totalTax,
    },
    {
      name: 'After',
      'STCG Tax': harvestPlan.afterScenario.stcgTax,
      'LTCG Tax': harvestPlan.afterScenario.ltcgTax,
      Total: harvestPlan.afterScenario.totalTax,
    },
  ];

  if (harvestPlan.stocksToSell.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <TrendingUp className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          All Stocks Are In Profit!
        </h3>
        <p className="text-gray-600">
          You don't have any losses to harvest at the moment. Great job!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section - Tax Savings Opportunity */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Your Tax Savings Opportunity</h2>
            <div className="text-6xl font-bold mb-4">
              {formatCurrency(harvestPlan.totalTaxSavings, false)}
            </div>
            <p className="text-green-100 text-lg">
              Potential savings by harvesting losses
            </p>
          </div>
          <TrendingDown className="h-32 w-32 text-green-200 opacity-50" />
        </div>
      </div>

      {/* Before/After Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Before Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-red-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Current Scenario
            </h3>
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">STCG Tax</span>
              <span className="font-semibold">{formatCurrency(harvestPlan.beforeScenario.stcgTax)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">LTCG Tax</span>
              <span className="font-semibold">{formatCurrency(harvestPlan.beforeScenario.ltcgTax)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="font-medium text-gray-900">Total Tax</span>
              <span className="text-xl font-bold text-red-600">
                {formatCurrency(harvestPlan.beforeScenario.totalTax)}
              </span>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center">
          <div className="bg-green-100 rounded-full p-4">
            <ArrowRight className="h-8 w-8 text-green-600" />
          </div>
        </div>

        {/* After Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-green-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              After Harvesting
            </h3>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingDown className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">STCG Tax</span>
              <span className="font-semibold">{formatCurrency(harvestPlan.afterScenario.stcgTax)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">LTCG Tax</span>
              <span className="font-semibold">{formatCurrency(harvestPlan.afterScenario.ltcgTax)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="font-medium text-gray-900">Total Tax</span>
              <span className="text-xl font-bold text-green-600">
                {formatCurrency(harvestPlan.afterScenario.totalTax)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tax Liability: Before vs After
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
            <Tooltip formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ''} />
            <Legend />
            <Bar dataKey="STCG Tax" stackId="a" fill="#EF4444" />
            <Bar dataKey="LTCG Tax" stackId="a" fill="#F59E0B" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Harvest Plan Details */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Your Harvest Plan
        </h3>
        
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-blue-700 mb-1">Stocks to Sell</p>
              <p className="text-2xl font-bold text-blue-900">
                {harvestPlan.stocksToSell.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-700 mb-1">Total Loss Harvested</p>
              <p className="text-2xl font-bold text-blue-900">
                {formatCurrency(harvestPlan.totalLossHarvested, false)}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-700 mb-1">Tax Savings</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(harvestPlan.totalTaxSavings, false)}
              </p>
            </div>
          </div>
        </div>

        {/* Recommendations List */}
        <div className="space-y-4">
          {harvestPlan.stocksToSell.map((rec, index) => (
            <div
              key={rec.stock.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full font-semibold">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {rec.stock.stockName}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {rec.stock.tickerSymbol} • {rec.stock.taxType}
                      </p>
                    </div>
                  </div>

                  <div className="ml-11 space-y-2">
                    <div className="flex items-center space-x-4 text-sm">
                      <div>
                        <span className="text-gray-600">Loss Amount:</span>
                        <span className="ml-2 font-semibold text-red-600">
                          {formatWithSign(-rec.lossAmount)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Tax Savings:</span>
                        <span className="ml-2 font-semibold text-green-600">
                          {formatCurrency(rec.taxSavings)}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded p-3 space-y-1">
                      <p className="text-sm">
                        <span className="font-medium text-gray-900">Action:</span>{' '}
                        <span className="text-gray-700">{rec.action}</span>
                      </p>
                      <p className="text-sm">
                        <span className="font-medium text-gray-900">Rebuy:</span>{' '}
                        <span className="text-gray-700">{rec.rebuySuggestion}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-yellow-800">
          <p className="font-medium mb-1">Important Disclaimer</p>
          <p>
            This is an educational tool. Tax loss harvesting involves selling securities at a loss to offset capital gains.
            Always consult with a qualified tax advisor or financial planner before making investment decisions.
            Market conditions and individual circumstances vary.
          </p>
        </div>
      </div>
    </div>
  );
}
