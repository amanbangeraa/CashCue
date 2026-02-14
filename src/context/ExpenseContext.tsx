import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Expense } from '../types/expense.types';
import { supabase } from '../lib/supabase';

interface ExpenseContextType {
  expenses: Expense[];
  addExpense: (expense: Expense) => void;
  removeExpense: (id: string) => void;
  loadDemoData: () => void;
  clearExpenses: () => void;
  loading: boolean;
  error: string | null;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load expenses from Supabase on mount
  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // If no user is logged in, show empty state
        setExpenses([]);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;

      setExpenses(data || []);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError(err instanceof Error ? err.message : 'Failed to load expenses');
      // Use empty array on error
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expense: Expense) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // If not logged in, just update local state
        setExpenses(prev => [expense, ...prev]);
        return;
      }

      const { data, error: insertError } = await supabase
        .from('expenses')
        .insert([{
          id: expense.id,
          user_id: user.id,
          date: expense.date,
          category: expense.category,
          amount: expense.amount,
          description: expense.description,
        }] as any)
        .select()
        .single();

      if (insertError) throw insertError;

      setExpenses(prev => [data as Expense, ...prev]);
    } catch (err) {
      console.error('Error adding expense:', err);
      setError(err instanceof Error ? err.message : 'Failed to add expense');
      // Still update local state as fallback
      setExpenses(prev => [expense, ...prev]);
    }
  };

  const removeExpense = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // If not logged in, just update local state
        setExpenses(prev => prev.filter(e => e.id !== id));
        return;
      }

      const { error: deleteError } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      setExpenses(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error('Error removing expense:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove expense');
      // Still update local state as fallback
      setExpenses(prev => prev.filter(e => e.id !== id));
    }
  };

  const loadDemoData = async () => {
    // Import demo data only when explicitly requested
    const { demoExpenses } = await import('../data/demoExpenses');
    setExpenses(demoExpenses);
  };

  const clearExpenses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error: deleteError } = await supabase
          .from('expenses')
          .delete()
          .eq('user_id', user.id);

        if (deleteError) throw deleteError;
      }

      setExpenses([]);
    } catch (err) {
      console.error('Error clearing expenses:', err);
      setError(err instanceof Error ? err.message : 'Failed to clear expenses');
      setExpenses([]);
    }
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        addExpense,
        removeExpense,
        loadDemoData,
        clearExpenses,
        loading,
        error,
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
