import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Expense } from '../types/expense.types';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, deleteDoc, doc, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';

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

  // Load expenses from Firebase on auth state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        const q = query(
          collection(db, 'expenses'),
          where('userId', '==', user.uid)
        );
        
        const unsubscribeSnapshot = onSnapshot(q, (snapshot: any) => {
          const expensesData = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
          })) as Expense[];
          setExpenses(expensesData);
          setLoading(false);
        }, (err: any) => {
          console.error('Error fetching expenses:', err);
          setError(err.message);
          setExpenses([]);
          setLoading(false);
        });

        return unsubscribeSnapshot;
      } else {
        setExpenses([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const addExpense = async (expense: Expense) => {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        setExpenses(prev => [expense, ...prev]);
        return;
      }

      await addDoc(collection(db, 'expenses'), {
        ...expense,
        userId: user.uid,
        createdAt: new Date()
      });
    } catch (err) {
      console.error('Error adding expense:', err);
      setError(err instanceof Error ? err.message : 'Failed to add expense');
      setExpenses(prev => [expense, ...prev]);
    }
  };

  const removeExpense = async (id: string) => {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        setExpenses(prev => prev.filter(e => e.id !== id));
        return;
      }

      await deleteDoc(doc(db, 'expenses', id));
    } catch (err) {
      console.error('Error removing expense:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove expense');
      setExpenses(prev => prev.filter(e => e.id !== id));
    }
  };

  const loadDemoData = async () => {
    const { demoExpenses } = await import('../data/demoExpenses');
    setExpenses(demoExpenses);
  };

  const clearExpenses = async () => {
    try {
      const user = auth.currentUser;
      
      if (user) {
        const q = query(
          collection(db, 'expenses'),
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (docSnapshot: any) => {
          await deleteDoc(doc(db, 'expenses', docSnapshot.id));
        });
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
