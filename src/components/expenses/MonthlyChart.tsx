import { useMemo } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { getMonthYearKey, getMonthName } from '../../utils/dateHelpers';
import { formatCurrency } from '../../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function MonthlyChart() {
  const { expenses } = useExpenses();

  const monthlyData = useMemo(() => {
    // Group expenses by month
    const groupedByMonth = expenses.reduce((acc, expense) => {
      const monthKey = getMonthYearKey(expense.date);
      if (!acc[monthKey]) {
        acc[monthKey] = 0;
      }
      acc[monthKey] += expense.amount;
      return acc;
    }, {} as Record<string, number>);

    // Convert to array and sort by date (most recent first)
    const monthlyArray = Object.entries(groupedByMonth)
      .map(([monthKey, amount]) => ({
        monthKey,
        month: getMonthName(monthKey + '-01'),
        amount,
      }))
      .sort((a, b) => b.monthKey.localeCompare(a.monthKey))
      .slice(0, 3) // Last 3 months
      .reverse(); // Oldest to newest for chart

    return monthlyArray;
  }, [expenses]);

  if (monthlyData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Spending</h3>
        <p className="text-gray-500 text-center py-8">No expense data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Monthly Spending (Last 3 Months)
      </h3>
      
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={monthlyData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
          <Tooltip formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ''} />
          <Bar dataKey="amount" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-3 gap-4">
        {monthlyData.map(data => (
          <div key={data.monthKey} className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">{data.month}</p>
            <p className="text-lg font-bold text-blue-600">
              {formatCurrency(data.amount, false)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
