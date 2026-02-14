import { Calendar, TrendingUp, TrendingDown, DollarSign, Target, AlertCircle } from 'lucide-react';
import { useBudget } from '../../context/BudgetContext';
import { format } from 'date-fns';

export function BudgetDashboard() {
  const { budgetStatus } = useBudget();

  if (!budgetStatus) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <p className="text-yellow-800">Please set up your monthly budget to get started.</p>
        </div>
      </div>
    );
  }

  const statusColors = {
    'On Track': 'bg-green-100 text-green-800 border-green-200',
    'Behind': 'bg-red-100 text-red-800 border-red-200',
    'Ahead': 'bg-blue-100 text-blue-800 border-blue-200',
  };

  const todayProgress = (budgetStatus.todaySpent / budgetStatus.todayLimit) * 100;
  const monthProgress = (budgetStatus.totalSpent / budgetStatus.availableForExpenses) * 100;

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div className={`border rounded-lg p-4 ${statusColors[budgetStatus.status]}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Budget Status</p>
            <p className="text-2xl font-bold">{budgetStatus.status}</p>
          </div>
          <div className="text-right">
            <p className="text-sm">Projected Savings</p>
            <p className="text-2xl font-bold">₹{budgetStatus.projectedSavings.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-gray-600">Monthly Salary</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ₹{budgetStatus.monthlySalary.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-green-600" />
            <p className="text-sm text-gray-600">Savings Goal</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ₹{budgetStatus.savingsGoal.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <p className="text-sm text-gray-600">Days Remaining</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {budgetStatus.daysRemaining} / {budgetStatus.daysInMonth}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {format(new Date(), 'MMMM d, yyyy')}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <p className="text-sm text-gray-600">Remaining Budget</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ₹{budgetStatus.remainingBudget.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Today's Budget */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-blue-100 text-sm">Today's Spending Limit</p>
            <p className="text-4xl font-bold">₹{budgetStatus.todayLimit.toFixed(2)}</p>
            <p className="text-blue-100 text-xs mt-1">For today only</p>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm">Spent Today</p>
            <p className="text-4xl font-bold">₹{budgetStatus.todaySpent.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white bg-opacity-20 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all ${
              todayProgress > 100 ? 'bg-red-300' : 'bg-white'
            }`}
            style={{ width: `${Math.min(todayProgress, 100)}%` }}
          />
        </div>
        <p className="text-blue-100 text-sm mt-2">
          {todayProgress > 100
            ? `Over budget by ₹${(budgetStatus.todaySpent - budgetStatus.todayLimit).toFixed(2)}`
            : `₹${(budgetStatus.todayLimit - budgetStatus.todaySpent).toFixed(2)} remaining today`}
        </p>
      </div>

      {/* Monthly Progress */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-600 text-sm">Total Spent This Month</p>
            <p className="text-3xl font-bold text-gray-900">
              ₹{budgetStatus.totalSpent.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-600 text-sm">Available Budget</p>
            <p className="text-3xl font-bold text-gray-900">
              ₹{budgetStatus.availableForExpenses.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
        <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className={`h-full transition-all ${
              monthProgress > 100 ? 'bg-red-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(monthProgress, 100)}%` }}
          />
        </div>
        <p className="text-gray-600 text-sm mt-2">
          {monthProgress.toFixed(1)}% of monthly budget used
        </p>
      </div>

      {/* Budget Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2">Initial Daily Budget</p>
          <p className="text-2xl font-bold text-gray-900">
            ₹{budgetStatus.initialDailyBudget.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Based on {budgetStatus.daysInMonth} days</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2">Adjusted Daily Budget</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-gray-900">
              ₹{budgetStatus.adjustedDailyBudget.toFixed(2)}
            </p>
            {budgetStatus.adjustedDailyBudget > budgetStatus.initialDailyBudget ? (
              <TrendingUp className="w-5 h-5 text-green-600" />
            ) : budgetStatus.adjustedDailyBudget < budgetStatus.initialDailyBudget ? (
              <TrendingDown className="w-5 h-5 text-red-600" />
            ) : null}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            For remaining {budgetStatus.daysRemaining - 1} days (after today)
          </p>
        </div>
      </div>
    </div>
  );
}
