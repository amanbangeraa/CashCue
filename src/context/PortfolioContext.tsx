import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Stock } from '../types/portfolio.types';
import { supabase } from '../lib/supabase';

interface PortfolioContextType {
  stocks: Stock[];
  addStock: (stock: Stock) => void;
  removeStock: (id: string) => void;
  updateStock: (id: string, stock: Partial<Stock>) => void;
  loadDemoData: () => void;
  clearPortfolio: () => void;
  loading: boolean;
  error: string | null;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load stocks from Supabase on mount
  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // If no user is logged in, show empty state
        setStocks([]);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('stocks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setStocks(data || []);
    } catch (err) {
      console.error('Error fetching stocks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load portfolio');
      // Use empty array on error
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  const addStock = async (stock: Stock) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // If not logged in, just update local state
        setStocks(prev => [...prev, stock]);
        return;
      }

      const { data, error: insertError } = await supabase
        .from('stocks')
        .insert([{
          id: stock.id,
          user_id: user.id,
          stock_name: stock.stockName,
          ticker_symbol: stock.tickerSymbol,
          quantity: stock.quantity,
          buy_price: stock.buyPrice,
          current_price: stock.currentPrice,
          buy_date: stock.buyDate,
        }] as any)
        .select()
        .single();

      if (insertError) throw insertError;

      // Transform database response to Stock type
      const dbData = data as any;
      const newStock: Stock = {
        id: dbData.id,
        stockName: dbData.stock_name,
        tickerSymbol: dbData.ticker_symbol,
        quantity: dbData.quantity,
        buyPrice: dbData.buy_price,
        currentPrice: dbData.current_price,
        buyDate: dbData.buy_date,
      };

      setStocks(prev => [...prev, newStock]);
    } catch (err) {
      console.error('Error adding stock:', err);
      setError(err instanceof Error ? err.message : 'Failed to add stock');
      // Still update local state as fallback
      setStocks(prev => [...prev, stock]);
    }
  };

  const removeStock = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // If not logged in, just update local state
        setStocks(prev => prev.filter(s => s.id !== id));
        return;
      }

      const { error: deleteError } = await supabase
        .from('stocks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      setStocks(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Error removing stock:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove stock');
      // Still update local state as fallback
      setStocks(prev => prev.filter(s => s.id !== id));
    }
  };

  const updateStock = async (id: string, updates: Partial<Stock>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // If not logged in, just update local state
        setStocks(prev =>
          prev.map(s => (s.id === id ? { ...s, ...updates } : s))
        );
        return;
      }

      // Transform camelCase to snake_case for database
      const dbUpdates: any = {};
      if (updates.stockName !== undefined) dbUpdates.stock_name = updates.stockName;
      if (updates.tickerSymbol !== undefined) dbUpdates.ticker_symbol = updates.tickerSymbol;
      if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
      if (updates.buyPrice !== undefined) dbUpdates.buy_price = updates.buyPrice;
      if (updates.currentPrice !== undefined) dbUpdates.current_price = updates.currentPrice;
      if (updates.buyDate !== undefined) dbUpdates.buy_date = updates.buyDate;

      const { error: updateError } = await supabase
        .from('stocks')
        .update(dbUpdates as any)
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setStocks(prev =>
        prev.map(s => (s.id === id ? { ...s, ...updates } : s))
      );
    } catch (err) {
      console.error('Error updating stock:', err);
      setError(err instanceof Error ? err.message : 'Failed to update stock');
      // Still update local state as fallback
      setStocks(prev =>
        prev.map(s => (s.id === id ? { ...s, ...updates } : s))
      );
    }
  };

  const loadDemoData = async () => {
    // Import demo data only when explicitly requested
    const { demoStocks } = await import('../data/demoPortfolio');
    setStocks(demoStocks);
  };

  const clearPortfolio = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error: deleteError } = await supabase
          .from('stocks')
          .delete()
          .eq('user_id', user.id);

        if (deleteError) throw deleteError;
      }

      setStocks([]);
    } catch (err) {
      console.error('Error clearing portfolio:', err);
      setError(err instanceof Error ? err.message : 'Failed to clear portfolio');
      setStocks([]);
    }
  };

  return (
    <PortfolioContext.Provider
      value={{
        stocks,
        addStock,
        removeStock,
        updateStock,
        loadDemoData,
        clearPortfolio,
        loading,
        error,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within PortfolioProvider');
  }
  return context;
}
