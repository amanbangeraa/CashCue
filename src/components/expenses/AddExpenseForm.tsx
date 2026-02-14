import React, { useState } from 'react';
import { Plus, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { useBudget } from '../../context/BudgetContext';
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
  const { budgetStatus } = useBudget();
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Food' as ExpenseCategory,
    date: getTodayISO(),
    description: '',
  });
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<{
    oldDailyBudget: number;
    newDailyBudget: number;
    remainingToday: number;
    status: 'success' | 'warning' | 'danger';
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(formData.amount);
    if (amount <= 0 || isNaN(amount)) {
      alert('Please enter a valid amount');
      return;
    }

    // Capture budget status before adding expense
    const oldDailyBudget = budgetStatus?.adjustedDailyBudget || 0;
    const oldTodayRemaining = budgetStatus ? budgetStatus.todayLimit - budgetStatus.todaySpent : 0;

    const newExpense: Expense = {
      id: `exp_${Date.now()}`,
      date: formData.date,
      category: formData.category,
      amount: amount,
      description: formData.description || undefined,
    };

    addExpense(newExpense);

    // Show feedback if budget is configured
    if (budgetStatus) {
      const isToday = formData.date === getTodayISO();
      const newTodayRemaining = isToday ? oldTodayRemaining - amount : oldTodayRemaining;
      
      // Calculate new daily budget (approximate)
      const newRemainingBudget = budgetStatus.remainingBudget - amount;
      const newDailyBudget = budgetStatus.daysRemaining > 0 
        ? newRemainingBudget / budgetStatus.daysRemaining 
        : 0;

      let status: 'success' | 'warning' | 'danger' = 'success';
      if (isToday && newTodayRemaining < 0) {
        status = 'danger';
      } else if (newDailyBudget < oldDailyBudget * 0.8) {
        status = 'warning';
      }

      setFeedbackData({
        oldDailyBudget,
        newDailyBudget,
        remainingToday: newTodayRemaining,
        status,
      });
      setShowFeedback(true);

      // Auto-hide feedback after 5 seconds
      setTimeout(() => setShowFeedback(false), 5000);
    }

    // Reset form
    setFormData({
      amount: '',
      category: 'Food',
      date: getTodayISO(),
      description: '',
    });
  };

  return (
    <div className="space-y-4">
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

      {/* Budget Impact Feedback */}
      {showFeedback && feedbackData && (
        <div className={`rounded-lg p-4 border ${
          feedbackData.status === 'danger' 
            ? 'bg-red-50 border-red-200' 
            : feedbackData.status === 'warning'
            ? 'bg-yellow-50 border-yellow-200'
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-start gap-3">
            {feedbackData.status === 'danger' ? (
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            ) : feedbackData.status === 'warning' ? (
              <TrendingDown className="w-5 h-5 text-yellow-600 mt-0.5" />
            ) : (
              <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className={`font-semibold mb-2 ${
                feedbackData.status === 'danger' 
                  ? 'text-red-900' 
                  : feedbackData.status === 'warning'
                  ? 'text-yellow-900'
                  : 'text-green-900'
              }`}>
                Expense Added - Budget Updated
              </h4>
              <div className="space-y-1 text-sm">
                <p className={
                  feedbackData.status === 'danger' 
                    ? 'text-red-800' 
                    : feedbackData.status === 'warning'
                    ? 'text-yellow-800'
                    : 'text-green-800'
                }>
                  <span className="font-medium">Daily Budget:</span> ₹{feedbackData.oldDailyBudget.toFixed(2)} → ₹{feedbackData.newDailyBudget.toFixed(2)}
                </p>
                <p className={
                  feedbackData.status === 'danger' 
                    ? 'text-red-800' 
                    : feedbackData.status === 'warning'
                    ? 'text-yellow-800'
                    : 'text-green-800'
                }>
                  <span className="font-medium">Remaining Today:</span> ₹{feedbackData.remainingToday.toFixed(2)}
                </p>
                {feedbackData.status === 'danger' && (
                  <p className="text-red-800 font-medium mt-2">
                    ⚠️ You've exceeded today's budget! Try to reduce spending for the rest of the day.
                  </p>
                )}
                {feedbackData.status === 'warning' && (
                  <p className="text-yellow-800 font-medium mt-2">
                    Your daily budget has decreased. Consider reducing expenses to stay on track.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
