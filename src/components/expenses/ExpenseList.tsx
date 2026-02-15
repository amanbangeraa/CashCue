import { Trash2 } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { formatCurrency } from '../../utils/formatters';
import { formatDate } from '../../utils/dateHelpers';

export function ExpenseList() {
  const { expenses, removeExpense } = useExpenses();

  // Show only last 50 expenses
  const recentExpenses = expenses.slice(0, 50);

  // Calculate monthly total (current month)
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const monthlyTotal = expenses
    .filter(e => e.date.startsWith(currentMonth))
    .reduce((sum, e) => sum + e.amount, 0);

  if (expenses.length === 0) {
    return (
      <div className="bg-[#111827] rounded-xl border border-[#1f2937] p-8 text-center">
        <p className="text-slate-400">No expenses recorded yet. Add your first expense!</p>
      </div>
    );
  }

  return (
    <div className="bg-[#111827] rounded-xl border border-[#1f2937]">
      <div className="p-4 border-b border-[#1f2937]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Recent Expenses</h3>
          <div className="text-right">
            <p className="text-sm text-slate-400">This Month</p>
            <p className="text-xl font-bold text-emerald-400">{formatCurrency(monthlyTotal, false)}</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#1f2937]">
          <thead className="bg-[#0d1117]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-transparent divide-y divide-[#1f2937]">
            {recentExpenses.map(expense => (
              <tr key={expense.id} className="hover:bg-[#1f2937]/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {formatDate(expense.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-100">
                    {expense.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-white">
                  {formatCurrency(expense.amount)}
                </td>
                <td className="px-6 py-4 text-sm text-slate-300">
                  {expense.description || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button
                    onClick={() => removeExpense(expense.id)}
                    className="text-red-400 hover:text-red-300"
                    title="Delete expense"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
