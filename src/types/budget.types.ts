export interface BudgetConfig {
  id: string;
  user_id?: string;
  monthly_salary: number;
  monthly_savings_goal: number;
  month: string; // Format: YYYY-MM
  created_at?: string;
  updated_at?: string;
}

export interface BudgetStatus {
  monthlySalary: number;
  savingsGoal: number;
  availableForExpenses: number;
  totalSpent: number;
  remainingBudget: number;
  daysInMonth: number;
  currentDay: number;
  daysRemaining: number;
  initialDailyBudget: number;
  adjustedDailyBudget: number;
  todaySpent: number;
  todayLimit: number;
  projectedSavings: number;
  status: 'On Track' | 'Behind' | 'Ahead';
}
