import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { BudgetConfig, BudgetStatus } from '../types/budget.types';
import { db, auth } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { useExpenses } from './ExpenseContext';
import { startOfMonth, endOfMonth, getDaysInMonth, getDate, parseISO } from 'date-fns';

interface BudgetContextType {
  budgetConfig: BudgetConfig | null;
  budgetStatus: BudgetStatus | null;
  setBudgetConfig: (salary: number, savingsGoal: number) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [budgetConfig, setBudgetConfigState] = useState<BudgetConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { expenses } = useExpenses();

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        try {
          const docRef = doc(db, 'budget_configs', `${user.uid}_${currentMonth}`);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setBudgetConfigState(docSnap.data() as BudgetConfig);
          } else {
            setBudgetConfigState(null);
          }
        } catch (err) {
          console.error('Error fetching budget config:', err);
          setError(err instanceof Error ? err.message : 'Failed to load budget');
        } finally {
          setLoading(false);
        }
      } else {
        setBudgetConfigState(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [currentMonth]);
  const setBudgetConfig = async (salary: number, savingsGoal: number) => {
    try {
      const user = auth.currentUser;
      
      const config: BudgetConfig = {
        id: crypto.randomUUID(),
        monthly_salary: salary,
        monthly_savings_goal: savingsGoal,
        month: currentMonth,
      };

      if (!user) {
        setBudgetConfigState(config);
        return;
      }

      const docRef = doc(db, 'budget_configs', `${user.uid}_${currentMonth}`);
      await setDoc(docRef, config);

      setBudgetConfigState(config);
    } catch (err) {
      console.error('Error saving budget config:', err);
      setError(err instanceof Error ? err.message : 'Failed to save budget');
      throw err;
    }
  };

  const calculateBudgetStatus = useMemo((): BudgetStatus | null => {
    if (!budgetConfig) return null;

    const now = new Date();
    const daysInMonth = getDaysInMonth(now);
    const currentDay = getDate(now);
    const daysRemaining = daysInMonth - currentDay + 1;

    const availableForExpenses = budgetConfig.monthly_salary - budgetConfig.monthly_savings_goal;
    
    // Filter expenses for current month
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const monthExpenses = expenses.filter(exp => {
      const expDate = parseISO(exp.date);
      return expDate >= monthStart && expDate <= monthEnd;
    });

    const totalSpent = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const remainingBudget = availableForExpenses - totalSpent;
    
    // Get today's date in YYYY-MM-DD format for comparison
    const todayStr = now.toISOString().split('T')[0];
    const todayExpenses = monthExpenses.filter(exp => exp.date === todayStr);
    const todaySpent = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    const initialDailyBudget = availableForExpenses / daysInMonth;
    
    // Today's limit is the adjusted budget for remaining days INCLUDING today
    // This is fixed for today and won't change as you spend
    const todayLimit = daysRemaining > 0 ? remainingBudget / daysRemaining : 0;
    
    // Tomorrow's adjusted budget accounts for today's spending
    // This changes as you spend today
    const tomorrowAdjustedBudget = daysRemaining > 1 
      ? (remainingBudget - todaySpent) / (daysRemaining - 1) 
      : 0;
    
    const projectedSavings = budgetConfig.monthly_salary - totalSpent;
    
    let status: 'On Track' | 'Behind' | 'Ahead' = 'On Track';
    if (projectedSavings > budgetConfig.monthly_savings_goal) {
      status = 'Ahead';
    } else if (projectedSavings < budgetConfig.monthly_savings_goal) {
      status = 'Behind';
    }

    return {
      monthlySalary: budgetConfig.monthly_salary,
      savingsGoal: budgetConfig.monthly_savings_goal,
      availableForExpenses,
      totalSpent,
      remainingBudget,
      daysInMonth,
      currentDay,
      daysRemaining,
      initialDailyBudget,
      adjustedDailyBudget: tomorrowAdjustedBudget, // This is for remaining days after today
      todaySpent,
      todayLimit, // Fixed for today
      projectedSavings,
      status,
    };
  }, [budgetConfig, expenses]); // Recalculate when budgetConfig or expenses change

  const budgetStatus = calculateBudgetStatus;

  return (
    <BudgetContext.Provider
      value={{
        budgetConfig,
        budgetStatus,
        setBudgetConfig,
        loading,
        error,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within BudgetProvider');
  }
  return context;
}
