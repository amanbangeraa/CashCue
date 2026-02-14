import { useMemo } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { calculateTaxLiability } from '../../utils/taxCalculations';
import { formatCurrency } from '../../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function TaxSummary() {
  const { stocks } = usePortfolio();

  const taxData = useMemo(() => {
    return calculateTaxLiability(stocks);
  }, [stocks]);

  const chartData = [
    {
      name: 'STCG',
      Gains: taxData.stcgGains,
      Losses: -taxData.stcgLosses,
      Tax: taxData.stcgTax,
    },
    {
      name: 'LTCG',
      Gains: taxData.ltcgGains,
      Losses: -taxData.ltcgLosses,
      Tax: taxData.ltcgTax,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tax Liability Card */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-2">Current Tax Liability</h2>
        <div className="text-5xl font-bold mb-4">
          {formatCurrency(taxData.totalTax, false)}
        </div>
        <p className="text-red-100">
          Estimated tax on unrealized gains in your portfolio
        </p>
      </div>

      {/* Tax Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* STCG Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Short Term Capital Gains (STCG)
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Gains</span>
              <span className="text-sm font-semibold text-green-600">
                +{formatCurrency(taxData.stcgGains)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Losses</span>
              <span className="text-sm font-semibold text-red-600">
                -{formatCurrency(taxData.stcgLosses)}
              </span>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-900">Net STCG</span>
              <span className="text-base font-bold text-gray-900">
                {formatCurrency(taxData.netSTCG)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tax @ 20%</span>
              <span className="text-base font-bold text-red-600">
                {formatCurrency(taxData.stcgTax)}
              </span>
            </div>
          </div>
        </div>

        {/* LTCG Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Long Term Capital Gains (LTCG)
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Gains</span>
              <span className="text-sm font-semibold text-green-600">
                +{formatCurrency(taxData.ltcgGains)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Losses</span>
              <span className="text-sm font-semibold text-red-600">
                -{formatCurrency(taxData.ltcgLosses)}
              </span>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-900">Net LTCG</span>
              <span className="text-base font-bold text-gray-900">
                {formatCurrency(taxData.netLTCG)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Less: Exemption</span>
              <span className="text-sm text-gray-500">
                ₹1,25,000
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-900">Taxable LTCG</span>
              <span className="text-base font-bold text-gray-900">
                {formatCurrency(taxData.ltcgTaxable)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tax @ 12.5%</span>
              <span className="text-base font-bold text-red-600">
                {formatCurrency(taxData.ltcgTax)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Gains vs Losses Breakdown
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
            <Tooltip formatter={(value: number | undefined) => value !== undefined ? formatCurrency(Math.abs(value)) : ''} />
            <Legend />
            <Bar dataKey="Gains" fill="#10B981" />
            <Bar dataKey="Losses" fill="#EF4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tax Rules Explanation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          Indian Tax Rules for Equity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">STCG (Short Term)</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Holding period: Less than 12 months</li>
              <li>• Tax rate: 20% on gains</li>
              <li>• Losses can offset STCG and LTCG gains</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">LTCG (Long Term)</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Holding period: 12 months or more</li>
              <li>• Tax rate: 12.5% on gains above ₹1.25L</li>
              <li>• Losses can only offset LTCG gains</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
