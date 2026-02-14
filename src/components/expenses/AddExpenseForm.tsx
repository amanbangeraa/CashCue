import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import type { Expense, ExpenseCategory } from '../../types/expense.types';
import { getTodayISO } from '../../utils/dateHelpers';

const categories: ExpenseCategory[] = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Other',
];

export function AddExpenseForm() {
  const { addExpense } = useExpenses();
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Food' as ExpenseCategory,
    date: getTodayISO(),
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(formData.amount);
    if (amount <= 0 || isNaN(amount)) {
      alert('Please enter a valid amount');
      return;
    }

    const newExpense: Expense = {
      id: `exp_${Date.now()}`,
      date: formData.date,
      category: formData.category,
      amount: amount,
      description: formData.description || undefined,
    };

    addExpense(newExpense);

    // Reset form
    setFormData({
      amount: '',
      category: 'Food',
      date: getTodayISO(),
      description: '',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Expense</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount (₹) *
          </label>
          <input
            type="number"
            required
            min="0.01"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date *
          </label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <input
            type="text"
            maxLength={50}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Dinner at restaurant"
          />
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </button>
      </form>
    </div>
  );
}
