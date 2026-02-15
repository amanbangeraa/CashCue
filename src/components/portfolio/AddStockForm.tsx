import React, { useState } from 'react';
import { Plus, Upload, Download } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import type { Stock } from '../../types/portfolio.types';
import { getTodayISO } from '../../utils/dateHelpers';
import { getCurrentPrice } from '../../services/indianStockAPI';

export function AddStockForm() {
  const { addStock } = usePortfolio();
  const [showForm, setShowForm] = useState(false);
  const [fetchingPrice, setFetchingPrice] = useState(false);
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

  const fetchCurrentPrice = async () => {
    if (!formData.tickerSymbol && !formData.stockName) {
      alert('Please enter ticker symbol or stock name first');
      return;
    }

    setFetchingPrice(true);
    try {
      const symbol = formData.tickerSymbol || formData.stockName;
      const price = await getCurrentPrice(symbol);
      
      if (price > 0) {
        setFormData(prev => ({ ...prev, currentPrice: price.toString() }));
      } else {
        alert('Could not fetch price. Please enter manually or check the symbol.');
      }
    } catch (error) {
      console.error('Error fetching price:', error);
      alert('Failed to fetch price. Please enter manually.');
    } finally {
      setFetchingPrice(false);
    }
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
    <div className="bg-[#111827] rounded-xl border border-[#1f2937] p-6 space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-xl font-bold text-white">Add Stock</h2>
        <div className="flex gap-2 flex-wrap">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="hidden"
            />
            <div className="flex items-center px-4 py-2 bg-[#1f2937] text-slate-100 rounded-lg border border-[#374151] hover:bg-[#374151] transition-colors">
              <Upload className="h-4 w-4 mr-2" />
              Upload CSV
            </div>
          </label>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-semibold"
          >
            <Plus className="h-4 w-4 mr-2" />
            {showForm ? 'Cancel' : 'Add Manually'}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'stockName', label: 'Stock Name *', placeholder: 'e.g., Reliance Industries' },
            { key: 'tickerSymbol', label: 'Ticker Symbol *', placeholder: 'e.g., RELIANCE' },
            { key: 'quantity', label: 'Quantity *', placeholder: 'e.g., 100', type: 'number', min: '1' },
            { key: 'buyPrice', label: 'Buy Price (₹) *', placeholder: 'e.g., 2200.50', type: 'number', min: '0.01', step: '0.01' },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-semibold text-emerald-100 mb-1">
                {field.label}
              </label>
              <input
                type={field.type || 'text'}
                required
                min={field.min}
                step={field.step}
                value={(formData as any)[field.key]}
                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#1f2937] text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                placeholder={field.placeholder}
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-semibold text-emerald-100 mb-1">
              Current Price (₹) *
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={formData.currentPrice}
                onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                className="flex-1 px-3 py-2 rounded-lg bg-[#0d1117] border border-[#1f2937] text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                placeholder="e.g., 2550.00"
              />
              <button
                type="button"
                onClick={fetchCurrentPrice}
                disabled={fetchingPrice}
                className="px-3 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                title="Fetch current market price"
              >
                <Download className={`h-4 w-4 ${fetchingPrice ? 'animate-bounce' : ''}`} />
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">Click icon to fetch live price</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-emerald-100 mb-1">
              Buy Date *
            </label>
            <input
              type="date"
              required
              value={formData.buyDate}
              onChange={(e) => setFormData({ ...formData, buyDate: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-[#1f2937] text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full px-4 py-3 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-colors"
            >
              Add Stock to Portfolio
            </button>
          </div>
        </form>
      )}

      <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-50">
        <p className="text-sm font-semibold">
          CSV Format: ticker, quantity, buy_price, buy_date
          <br />
          <span className="text-xs text-emerald-100/80">Example: INFY, 100, 1400, 2023-01-15</span>
        </p>
      </div>
    </div>
  );
}
