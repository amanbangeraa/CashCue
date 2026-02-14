import { useState, useEffect } from 'react';
import { X, IndianRupee, TrendingUp } from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { useIncome } from '../../context/IncomeContext';

interface BudgetSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BudgetSetupModal({ isOpen, onClose }: BudgetSetupModalProps) {
  const { budgetConfig, setBudgetConfig } = useBudget();
  const { incomeSummary } = useIncome();
  
  const [salary, setSalary] = useState(budgetConfig?.monthly_salary.toString() || '');
  const [savingsGoal, setSavingsGoal] = useState(budgetConfig?.monthly_savings_goal.toString() || '');
  const [loading, setLoading] = useState(false);
  const [useIncomeData, setUseIncomeData] = useState(true);

  // Auto-fill from income data
  useEffect(() => {
    if (useIncomeData && incomeSummary.totalMonthlyNet > 0) {
      setSalary(incomeSummary.totalMonthlyNet.toString());
    }
  }, [useIncomeData, incomeSummary.totalMonthlyNet]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setBudgetConfig(Number(salary), Number(savingsGoal));
      onClose();
    } catch (err) {
      console.error('Failed to save budget config:', err);
    } finally {
      setLoading(false);
    }
  };

  const availableForExpenses = Number(salary) - Number(savingsGoal);
  const hasIncomeData = incomeSummary.totalMonthlyNet > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Budget Setup</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {hasIncomeData && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2">
              <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900">Income Data Available</p>
                <p className="text-xs text-green-700 mt-1">
                  Your net monthly income: ₹{incomeSummary.totalMonthlyNet.toLocaleString('en-IN')}
                </p>
                <label className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    checked={useIncomeData}
                    onChange={(e) => setUseIncomeData(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-xs text-green-800">Use income data automatically</span>
                </label>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Income {useIncomeData && hasIncomeData && '(from Income Management)'}
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={salary}
                onChange={(e) => {
                  setSalary(e.target.value);
                  setUseIncomeData(false);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter monthly income"
                required
                min="0"
                step="0.01"
                disabled={useIncomeData && hasIncomeData}
              />
            </div>
            {useIncomeData && hasIncomeData && (
              <p className="text-xs text-gray-500 mt-1">
                Automatically synced from your income sources
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Savings Goal
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={savingsGoal}
                onChange={(e) => setSavingsGoal(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter savings goal"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {salary && savingsGoal && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Available for Expenses</p>
              <p className="text-2xl font-bold text-blue-600">
                ₹{availableForExpenses.toLocaleString('en-IN')}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
