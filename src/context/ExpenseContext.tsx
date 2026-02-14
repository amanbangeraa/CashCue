import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Expense } from '../types/expense.types';
import { demoExpenses } from '../data/demoExpenses';

interface ExpenseContextType {
  expenses: Expense[];
  addExpense: (expense: Expense) => void;
  removeExpense: (id: string) => void;
  loadDemoData: () => void;
  clearExpenses: () => void;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

const STORAGE_KEY = 'taxsaver_expenses';

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setExpenses(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load expenses from storage:', error);
        // Load demo data if stored data is corrupted
        setExpenses(demoExpenses);
      }
    } else {
      // Load demo data by default for first-time users
      setExpenses(demoExpenses);
    }
  }, []);

  // Save to localStorage whenever expenses change
  useEffect(() => {
    if (expenses.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    }
  }, [expenses]);

  const addExpense = (expense: Expense) => {
    setExpenses(prev => [expense, ...prev]);
  };

  const removeExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const loadDemoData = () => {
    setExpenses(demoExpenses);
  };

  const clearExpenses = () => {
    setExpenses([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        addExpense,
        removeExpense,
        loadDemoData,
        clearExpenses,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within ExpenseProvider');
  }
  return context;
}
