import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Stock } from '../types/portfolio.types';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, deleteDoc, doc, updateDoc, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';

interface PortfolioContextType {
  stocks: Stock[];
  addStock: (stock: Stock) => void;
  removeStock: (id: string) => void;
  updateStock: (id: string, stock: Partial<Stock>) => void;
  clearPortfolio: () => void;
  loading: boolean;
  error: string | null;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <PortfolioContext.Provider
      value={{
        stocks,
        addStock,
        removeStock,
        updateStock,
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
