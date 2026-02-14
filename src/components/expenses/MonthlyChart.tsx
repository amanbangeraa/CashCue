import { useMemo } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = {
  Food: '#10B981',
  Transport: '#3B82F6',
  Shopping: '#F59E0B',
  Bills: '#EF4444',
  Entertainment: '#8B5CF6',
  Other: '#6B7280',
};

export function MonthlyChart() {
  const { expenses } = useExpenses();

  const categoryData = useMemo(() => {
    // Get current month expenses
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthExpenses = expenses.filter(e => e.date.startsWith(currentMonth));

    // Group by category
    const groupedByCategory = monthExpenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = 0;
      }
      acc[expense.category] += expense.amount;
      return acc;
    }, {} as Record<string, number>);

    // Calculate total
    const total = Object.values(groupedByCategory).reduce((sum, val) => sum + val, 0);

    // Convert to array with percentages
    return Object.entries(groupedByCategory)
      .map(([category, amount]) => ({
        name: category,
        value: amount,
        percentage: total > 0 ? ((amount / total) * 100).toFixed(1) : '0',
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const totalSpent = categoryData.reduce((sum, item) => sum + item.value, 0);

  if (categoryData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
        <p className="text-gray-500 text-center py-8">No expense data for this month</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Spending by Category
      </h3>
      
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600">Total This Month</p>
        <p className="text-2xl font-bold text-gray-900">
          ₹{totalSpent.toLocaleString('en-IN')}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={categoryData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry) => entry.percent ? `${(entry.percent * 100).toFixed(1)}%` : ''}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {categoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.Other} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number | undefined) => value !== undefined ? `₹${value.toLocaleString('en-IN')}` : ''}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry: any) => `${value} (${entry.payload.percentage}%)`}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 space-y-2">
        {categoryData.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[item.name as keyof typeof COLORS] || COLORS.Other }}
              />
              <span className="text-gray-700">{item.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-900">
                ₹{item.value.toLocaleString('en-IN')}
              </span>
              <span className="text-gray-500 w-12 text-right">
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
