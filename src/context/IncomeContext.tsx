import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { IncomeSource, TaxDeduction, IncomeSummary } from '../types/income.types';
import { supabase } from '../lib/supabase';

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
    fetchIncomeSources();
    fetchTaxDeductions();
  }, []);

  const fetchIncomeSources = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIncomeSources([]);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('income_sources')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setIncomeSources(data || []);
    } catch (err) {
      console.error('Error fetching income sources:', err);
      setError(err instanceof Error ? err.message : 'Failed to load income sources');
      setIncomeSources([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTaxDeductions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setTaxDeductions([]);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('tax_deductions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setTaxDeductions(data || []);
    } catch (err) {
      console.error('Error fetching tax deductions:', err);
      setTaxDeductions([]);
    }
  };

  const addIncomeSource = async (source: IncomeSource) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIncomeSources(prev => [...prev, source]);
        return;
      }

      const { data, error: insertError } = await supabase
        .from('income_sources')
        .insert([{
          user_id: user.id,
          ...source,
        }])
        .select()
        .single();

      if (insertError) throw insertError;
      setIncomeSources(prev => [data, ...prev]);
    } catch (err) {
      console.error('Error adding income source:', err);
      setError(err instanceof Error ? err.message : 'Failed to add income source');
      throw err;
    }
  };

  const updateIncomeSource = async (id: string, updates: Partial<IncomeSource>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIncomeSources(prev =>
          prev.map(s => (s.id === id ? { ...s, ...updates } : s))
        );
        return;
      }

      const { error: updateError } = await supabase
        .from('income_sources')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;
      setIncomeSources(prev =>
        prev.map(s => (s.id === id ? { ...s, ...updates } : s))
      );
    } catch (err) {
      console.error('Error updating income source:', err);
      setError(err instanceof Error ? err.message : 'Failed to update income source');
      throw err;
    }
  };

  const removeIncomeSource = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIncomeSources(prev => prev.filter(s => s.id !== id));
        return;
      }

      const { error: deleteError } = await supabase
        .from('income_sources')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;
      setIncomeSources(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Error removing income source:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove income source');
      throw err;
    }
  };

  const addTaxDeduction = async (deduction: TaxDeduction) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setTaxDeductions(prev => [...prev, deduction]);
        return;
      }

      const { data, error: insertError } = await supabase
        .from('tax_deductions')
        .insert([{
          user_id: user.id,
          ...deduction,
        }])
        .select()
        .single();

      if (insertError) throw insertError;
      setTaxDeductions(prev => [data, ...prev]);
    } catch (err) {
      console.error('Error adding tax deduction:', err);
      setError(err instanceof Error ? err.message : 'Failed to add tax deduction');
      throw err;
    }
  };

  const updateTaxDeduction = async (id: string, updates: Partial<TaxDeduction>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setTaxDeductions(prev =>
          prev.map(d => (d.id === id ? { ...d, ...updates } : d))
        );
        return;
      }

      const { error: updateError } = await supabase
        .from('tax_deductions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;
      setTaxDeductions(prev =>
        prev.map(d => (d.id === id ? { ...d, ...updates } : d))
      );
    } catch (err) {
      console.error('Error updating tax deduction:', err);
      setError(err instanceof Error ? err.message : 'Failed to update tax deduction');
      throw err;
    }
  };

  const removeTaxDeduction = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setTaxDeductions(prev => prev.filter(d => d.id !== id));
        return;
      }

      const { error: deleteError } = await supabase
        .from('tax_deductions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;
      setTaxDeductions(prev => prev.filter(d => d.id !== id));
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
