import React, { useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import type { Stock } from '../../types/portfolio.types';
import { getTodayISO } from '../../utils/dateHelpers';

export function AddStockForm() {
  const { addStock } = usePortfolio();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    stockName: '',
    tickerSymbol: '',
    quantity: '',
    buyPrice: '',
    currentPrice: '',
    buyDate: getTodayISO(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newStock: Stock = {
      id: `stock_${Date.now()}`,
      stockName: formData.stockName,
      tickerSymbol: formData.tickerSymbol.toUpperCase(),
      quantity: parseInt(formData.quantity),
      buyPrice: parseFloat(formData.buyPrice),
      currentPrice: parseFloat(formData.currentPrice),
      buyDate: formData.buyDate,
    };

    addStock(newStock);
    
    // Reset form
    setFormData({
      stockName: '',
      tickerSymbol: '',
      quantity: '',
      buyPrice: '',
      currentPrice: '',
      buyDate: getTodayISO(),
    });
    
    setShowForm(false);
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target?.result as string;
      const lines = csv.split('\n');
      
      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const [ticker, quantity, buyPrice, buyDate] = line.split(',');
        
        if (ticker && quantity && buyPrice && buyDate) {
          const newStock: Stock = {
            id: `stock_${Date.now()}_${i}`,
            stockName: ticker.trim(),
            tickerSymbol: ticker.trim().toUpperCase(),
            quantity: parseInt(quantity.trim()),
            buyPrice: parseFloat(buyPrice.trim()),
            currentPrice: parseFloat(buyPrice.trim()), // Default to buy price
            buyDate: buyDate.trim(),
          };
          
          addStock(newStock);
        }
      }
    };
    
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Add Stock</h2>
        <div className="flex space-x-2">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="hidden"
            />
            <div className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
              <Upload className="h-4 w-4 mr-2" />
              Upload CSV
            </div>
          </label>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            {showForm ? 'Cancel' : 'Add Manually'}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Name *
            </label>
            <input
              type="text"
              required
              value={formData.stockName}
              onChange={(e) => setFormData({ ...formData, stockName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Reliance Industries"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ticker Symbol *
            </label>
            <input
              type="text"
              required
              value={formData.tickerSymbol}
              onChange={(e) => setFormData({ ...formData, tickerSymbol: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., RELIANCE"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity *
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buy Price (₹) *
            </label>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              value={formData.buyPrice}
              onChange={(e) => setFormData({ ...formData, buyPrice: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 2200.50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Price (₹) *
            </label>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              value={formData.currentPrice}
              onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 2550.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buy Date *
            </label>
            <input
              type="date"
              required
              value={formData.buyDate}
              onChange={(e) => setFormData({ ...formData, buyDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Add Stock to Portfolio
            </button>
          </div>
        </form>
      )}

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>CSV Format:</strong> ticker, quantity, buy_price, buy_date
          <br />
          <span className="text-xs">Example: INFY, 100, 1400, 2023-01-15</span>
        </p>
      </div>
    </div>
  );
}
