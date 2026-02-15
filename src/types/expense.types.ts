export type ExpenseCategory = 
  | 'Food'
  | 'Transport'
  | 'Shopping'
  | 'Bills'
  | 'Entertainment'
  | 'Healthcare'
  | 'Utilities'
  | 'Other';

export interface Expense {
  id: string;
  date: string; // ISO date string
  category: ExpenseCategory;
  amount: number;
  description?: string;
}

export interface MonthlyExpense {
  month: string;
  amount: number;
}
