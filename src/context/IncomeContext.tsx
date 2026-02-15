import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { IncomeSource, TaxDeduction, IncomeSummary } from '../types/income.types';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc, query, where, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';

interface IncomeContextType {
  incomeSources: IncomeSource[];
  taxDeductions: TaxDeduction[];
  incomeSummary: IncomeSummary;
  addIncomeSource: (source: IncomeSource) => Promise<void>;
  updateIncomeSource: (id: string, source: Partial<IncomeSource>) => Promise<void>;
  removeIncomeSource: (id: string) => Promise<void>;
  addTaxDeduction: (deduction: TaxDeduction) => Promise<void>;
  updateTaxDeduction: (id: string, deduction: Partial<TaxDeduction>) => Promise<void>;
  removeTaxDeduction: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const IncomeContext = createContext<IncomeContextType | undefined>(undefined);

export function IncomeProvider({ children }: { children: ReactNode }) {
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [taxDeductions, setTaxDeductions] = useState<TaxDeduction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        const incomeQuery = query(
          collection(db, 'income_sources'),
          where('userId', '==', user.uid)
        );
        
        const unsubscribeIncome = onSnapshot(incomeQuery, (snapshot: any) => {
          const data = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
          })) as IncomeSource[];
          setIncomeSources(data);
          setLoading(false);
        }, (err: any) => {
          console.error('Error fetching income sources:', err);
          setError(err.message);
          setIncomeSources([]);
          setLoading(false);
        });

        const deductionsQuery = query(
          collection(db, 'tax_deductions'),
          where('userId', '==', user.uid)
        );
        
        const unsubscribeDeductions = onSnapshot(deductionsQuery, (snapshot: any) => {
          const data = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
          })) as TaxDeduction[];
          setTaxDeductions(data);
        }, (err: any) => {
          console.error('Error fetching tax deductions:', err);
          setTaxDeductions([]);
        });

        return () => {
          unsubscribeIncome();
          unsubscribeDeductions();
        };
      } else {
        setIncomeSources([]);
        setTaxDeductions([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);
  const addIncomeSource = async (source: IncomeSource) => {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        setIncomeSources(prev => [...prev, source]);
        return;
      }

      await addDoc(collection(db, 'income_sources'), {
        ...source,
        userId: user.uid,
        createdAt: new Date()
      });
    } catch (err) {
      console.error('Error adding income source:', err);
      setError(err instanceof Error ? err.message : 'Failed to add income source');
      throw err;
    }
  };

  const updateIncomeSource = async (id: string, updates: Partial<IncomeSource>) => {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        setIncomeSources(prev =>
          prev.map(s => (s.id === id ? { ...s, ...updates } : s))
        );
        return;
      }

      await updateDoc(doc(db, 'income_sources', id), updates);
    } catch (err) {
      console.error('Error updating income source:', err);
      setError(err instanceof Error ? err.message : 'Failed to update income source');
      throw err;
    }
  };

  const removeIncomeSource = async (id: string) => {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        setIncomeSources(prev => prev.filter(s => s.id !== id));
        return;
      }

      await deleteDoc(doc(db, 'income_sources', id));
    } catch (err) {
      console.error('Error removing income source:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove income source');
      throw err;
    }
  };

  const addTaxDeduction = async (deduction: TaxDeduction) => {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        setTaxDeductions(prev => [...prev, deduction]);
        return;
      }

      await addDoc(collection(db, 'tax_deductions'), {
        ...deduction,
        userId: user.uid,
        createdAt: new Date()
      });
    } catch (err) {
      console.error('Error adding tax deduction:', err);
      setError(err instanceof Error ? err.message : 'Failed to add tax deduction');
      throw err;
    }
  };

  const updateTaxDeduction = async (id: string, updates: Partial<TaxDeduction>) => {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        setTaxDeductions(prev =>
          prev.map(d => (d.id === id ? { ...d, ...updates } : d))
        );
        return;
      }

      await updateDoc(doc(db, 'tax_deductions', id), updates);
    } catch (err) {
      console.error('Error updating tax deduction:', err);
      setError(err instanceof Error ? err.message : 'Failed to update tax deduction');
      throw err;
    }
  };

  const removeTaxDeduction = async (id: string) => {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        setTaxDeductions(prev => prev.filter(d => d.id !== id));
        return;
      }

      await deleteDoc(doc(db, 'tax_deductions', id));
    } catch (err) {
      console.error('Error removing tax deduction:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove tax deduction');
      throw err;
    }
  };

  const incomeSummary = useMemo((): IncomeSummary => {
    const activeSources = incomeSources.filter(s => s.is_active);
    const totalMonthlyGross = activeSources.reduce((sum, s) => sum + s.monthly_amount, 0);
    const totalYearlyGross = activeSources.reduce((sum, s) => sum + s.yearly_amount, 0);
    
    const applicableDeductions = taxDeductions.filter(d => d.is_applicable);
    const totalMonthlyDeductions = applicableDeductions.reduce((sum, d) => sum + d.monthly_amount, 0);
    const totalYearlyDeductions = applicableDeductions.reduce((sum, d) => sum + d.yearly_amount, 0);
    
    const totalMonthlyNet = totalMonthlyGross - totalMonthlyDeductions;
    const totalYearlyNet = totalYearlyGross - totalYearlyDeductions;
    
    const effectiveTaxRate = totalMonthlyGross > 0 
      ? (totalMonthlyDeductions / totalMonthlyGross) * 100 
      : 0;

    return {
      totalMonthlyGross,
      totalYearlyGross,
      totalMonthlyDeductions,
      totalYearlyDeductions,
      totalMonthlyNet,
      totalYearlyNet,
      activeSourcesCount: activeSources.length,
      effectiveTaxRate,
    };
  }, [incomeSources, taxDeductions]);

  return (
    <IncomeContext.Provider
      value={{
        incomeSources,
        taxDeductions,
        incomeSummary,
        addIncomeSource,
        updateIncomeSource,
        removeIncomeSource,
        addTaxDeduction,
        updateTaxDeduction,
        removeTaxDeduction,
        loading,
        error,
      }}
    >
      {children}
    </IncomeContext.Provider>
  );
}

export function useIncome() {
  const context = useContext(IncomeContext);
  if (!context) {
    throw new Error('useIncome must be used within IncomeProvider');
  }
  return context;
}
