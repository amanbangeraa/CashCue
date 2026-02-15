import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Stock } from '../types/portfolio.types';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { updatePortfolioPrices } from '../services/indianStockAPI';

interface PortfolioContextType {
  stocks: Stock[];
  addStock: (stock: Stock) => void;
  removeStock: (id: string) => void;
  updateStock: (id: string, stock: Partial<Stock>) => void;
  clearPortfolio: () => void;
  refreshPrices: () => Promise<void>;
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  lastRefresh: Date | null;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Load stocks from Firebase on auth state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        const q = query(
          collection(db, 'stocks'),
          where('userId', '==', user.uid)
        );
        
        const unsubscribeSnapshot = onSnapshot(q, (snapshot: any) => {
          const stocksData = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
          })) as Stock[];
          setStocks(stocksData);
          setLoading(false);
        }, (err: any) => {
          console.error('Error fetching stocks:', err);
          setError(err.message);
          setStocks([]);
          setLoading(false);
        });

        return unsubscribeSnapshot;
      } else {
        setStocks([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const addStock = async (stock: Stock) => {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        setStocks(prev => [...prev, stock]);
        return;
      }

      await addDoc(collection(db, 'stocks'), {
        ...stock,
        userId: user.uid,
        createdAt: new Date()
      });
    } catch (err) {
      console.error('Error adding stock:', err);
      setError(err instanceof Error ? err.message : 'Failed to add stock');
      setStocks(prev => [...prev, stock]);
    }
  };

  const removeStock = async (id: string) => {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        setStocks(prev => prev.filter(s => s.id !== id));
        return;
      }

      await deleteDoc(doc(db, 'stocks', id));
    } catch (err) {
      console.error('Error removing stock:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove stock');
      setStocks(prev => prev.filter(s => s.id !== id));
    }
  };

  const updateStock = async (id: string, updates: Partial<Stock>) => {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        setStocks(prev =>
          prev.map(s => (s.id === id ? { ...s, ...updates } : s))
        );
        return;
      }

      await updateDoc(doc(db, 'stocks', id), updates);
    } catch (err) {
      console.error('Error updating stock:', err);
      setError(err instanceof Error ? err.message : 'Failed to update stock');
      setStocks(prev =>
        prev.map(s => (s.id === id ? { ...s, ...updates } : s))
      );
    }
  };

  const refreshPrices = useCallback(async () => {
    if (stocks.length === 0 || refreshing) return;

    setRefreshing(true);
    setError(null);

    try {
      const updates = await updatePortfolioPrices(stocks);
      
      const user = auth.currentUser;
      
      for (const update of updates) {
        if (user) {
          await updateDoc(doc(db, 'stocks', update.id), {
            currentPrice: update.newPrice,
          });
        } else {
          setStocks(prev =>
            prev.map(s => (s.id === update.id ? { ...s, currentPrice: update.newPrice } : s))
          );
        }
      }

      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error refreshing prices:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh prices');
    } finally {
      setRefreshing(false);
    }
  }, [stocks, refreshing]);

  const clearPortfolio = async () => {
    try {
      const user = auth.currentUser;
      
      if (user) {
        const q = query(
          collection(db, 'stocks'),
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (docSnapshot: any) => {
          await deleteDoc(doc(db, 'stocks', docSnapshot.id));
        });
      }

      setStocks([]);
    } catch (err) {
      console.error('Error clearing portfolio:', err);
      setError(err instanceof Error ? err.message : 'Failed to clear portfolio');
      setStocks([]);
    }
  };

  // Auto-refresh prices every 5 minutes
  useEffect(() => {
    if (stocks.length === 0) return;

    // Initial refresh after 3 seconds
    const initialTimer = setTimeout(() => {
      refreshPrices();
    }, 3000);

    // Periodic refresh every 5 minutes
    const interval = setInterval(() => {
      refreshPrices();
    }, 5 * 60 * 1000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [stocks.length, refreshPrices]);

  return (
    <PortfolioContext.Provider
      value={{
        stocks,
        addStock,
        removeStock,
        updateStock,
        clearPortfolio,
        refreshPrices,
        loading,
        error,
        refreshing,
        lastRefresh,
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
