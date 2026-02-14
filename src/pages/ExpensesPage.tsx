import { ExpenseList } from '../components/expenses/ExpenseList';
import { AddExpenseForm } from '../components/expenses/AddExpenseForm';
import { MonthlyChart } from '../components/expenses/MonthlyChart';

export function ExpensesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Expenses</h1>
        <p className="text-gray-600">
          Track your daily expenses and monthly spending trends
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ExpenseList />
        </div>
        <div className="space-y-6">
          <AddExpenseForm />
          <MonthlyChart />
        </div>
      </div>
    </div>
  );
}
