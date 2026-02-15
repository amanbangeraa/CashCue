import { useMemo, useState } from 'react';
import { Trash2, RefreshCw } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { calculateStockMetrics } from '../../utils/taxCalculations';
import { formatCurrency, formatPercentage, formatWithSign, getGainLossColor } from '../../utils/formatters';
import { formatDate } from '../../utils/dateHelpers';

type FilterType = 'all' | 'gainers' | 'losers' | 'stcg' | 'ltcg';

export function PortfolioTable() {
  const { stocks, removeStock, refreshPrices, refreshing, lastRefresh } = usePortfolio();
  const [filter, setFilter] = useState<FilterType>('all');

  const stocksWithMetrics = useMemo(() => {
    return stocks.map(calculateStockMetrics);
  }, [stocks]);

  const filteredStocks = useMemo(() => {
    return stocksWithMetrics.filter(stock => {
      switch (filter) {
        case 'gainers':
          return stock.gainLoss > 0;
        case 'losers':
          return stock.gainLoss < 0;
        case 'stcg':
          return stock.taxType === 'STCG';
        case 'ltcg':
          return stock.taxType === 'LTCG';
        default:
          return true;
      }
    });
  }, [stocksWithMetrics, filter]);

  if (stocks.length === 0) {
    return (
      <div className="bg-[#111827] rounded-xl border border-[#1f2937] p-8 text-center">
        <p className="text-slate-200">No stocks in portfolio. Add your first stock to get started!</p>
      </div>
    );
  }

  return (
    <div className="bg-[#111827] rounded-xl border border-[#1f2937]">
      {/* Filter Buttons */}
      <div className="p-4 border-b border-[#1f2937] flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {(['all', 'gainers', 'losers', 'stcg', 'ltcg'] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                filter === f
                  ? 'bg-emerald-500 text-white'
                  : 'bg-[#1f2937] text-slate-100 hover:bg-[#374151]'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-xs text-slate-400">
              Updated: {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={refreshPrices}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh stock prices"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Updating...' : 'Refresh Prices'}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#1f2937] text-slate-100">
          <thead className="bg-[#0d1117]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Buy Price
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Current Price
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Invested
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Current Value
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Gain/Loss
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Tax Type
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-[#111827] divide-y divide-[#1f2937]">
            {filteredStocks.map(stock => (
              <tr key={stock.id} className="hover:bg-[#1f2937] transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-semibold text-slate-100">{stock.stockName}</div>
                    <div className="text-xs text-slate-400">{stock.tickerSymbol}</div>
                    <div className="text-xs text-slate-500">{formatDate(stock.buyDate)}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-100">
                  {stock.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-100">
                  {formatCurrency(stock.buyPrice)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-100">
                  {formatCurrency(stock.currentPrice)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-100">
                  {formatCurrency(stock.investedValue)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-100">
                  {formatCurrency(stock.currentValue)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className={`text-sm font-semibold ${getGainLossColor(stock.gainLoss)}`}>
                    {formatWithSign(stock.gainLoss)}
                  </div>
                  <div className={`text-xs ${getGainLossColor(stock.gainLoss)}`}>
                    ({stock.gainLoss > 0 ? '+' : ''}{formatPercentage(stock.gainLossPercentage)})
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      stock.taxType === 'STCG'
                        ? 'bg-red-500/20 text-red-200'
                        : 'bg-emerald-500/20 text-emerald-200'
                    }`}
                  >
                    {stock.taxType}
                  </span>
                  <div className="text-xs text-slate-400 mt-1">
                    {stock.holdingPeriodDays} days
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button
                    onClick={() => removeStock(stock.id)}
                    className="text-red-200 hover:text-red-100"
                    title="Remove stock"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredStocks.length === 0 && (
        <div className="p-8 text-center text-slate-300">
          No stocks match the current filter.
        </div>
      )}
    </div>
  );
}
