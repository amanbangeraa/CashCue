import { useMemo } from 'react';
import { useExpenses } from '../../context/ExpenseContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = {
  Food: '#10B981',
  Transport: '#3B82F6',
  Shopping: '#F59E0B',
  Bills: '#EF4444',
  Entertainment: '#8B5CF6',
  Healthcare: '#6B7280',
  Utilities: '#64748B',
  Other: '#94A3B8',
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
      <div className="bg-[#111827] rounded-xl border border-[#1f2937] p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Spending by Category</h3>
        <p className="text-slate-400 text-center py-8">No expense data for this month</p>
      </div>
    );
  }

  return (
    <div className="bg-[#111827] rounded-xl border border-[#1f2937] p-6">
      <h3 className="text-lg font-semibold text-white mb-2">
        Spending by Category
      </h3>
      
      <div className="text-center mb-4">
        <p className="text-sm text-slate-400">Total This Month</p>
        <p className="text-3xl font-bold text-white">
          ₹{totalSpent.toFixed(2)}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={categoryData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry: any) => `${entry.percentage}%`}
            outerRadius={100}
            innerRadius={60}
            fill="#8884d8"
            dataKey="value"
            paddingAngle={2}
          >
            {categoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.Other} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              color: '#fff'
            }}
            formatter={(value: number | undefined) => value !== undefined ? `₹${value.toFixed(2)}` : ''}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 space-y-2">
        {categoryData.map((item) => (
          <div key={item.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-[#1f2937]/50 transition-colors">
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0" 
                style={{ backgroundColor: COLORS[item.name as keyof typeof COLORS] || COLORS.Other }}
              />
              <span className="text-slate-200 text-sm font-medium">{item.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold text-white text-sm">
                ₹{item.value.toFixed(2)}
              </span>
              <span className="text-slate-400 text-sm font-medium min-w-[3rem] text-right">
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
