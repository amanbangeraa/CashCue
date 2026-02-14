import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Stock } from '../types/portfolio.types';
import { demoStocks } from '../data/demoPortfolio';

interface PortfolioContextType {
  stocks: Stock[];
  addStock: (stock: Stock) => void;
  removeStock: (id: string) => void;
  updateStock: (id: string, stock: Partial<Stock>) => void;
  loadDemoData: () => void;
  clearPortfolio: () => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

const STORAGE_KEY = 'taxsaver_portfolio';

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [stocks, setStocks] = useState<Stock[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setStocks(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load portfolio from storage:', error);
        // Load demo data if stored data is corrupted
        setStocks(demoStocks);
      }
    } else {
      // Load demo data by default for first-time users
      setStocks(demoStocks);
    }
  }, []);

  // Save to localStorage whenever stocks change
  useEffect(() => {
    if (stocks.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stocks));
    }
  }, [stocks]);

  const addStock = (stock: Stock) => {
    setStocks(prev => [...prev, stock]);
  };

  const removeStock = (id: string) => {
    setStocks(prev => prev.filter(s => s.id !== id));
  };

  const updateStock = (id: string, updates: Partial<Stock>) => {
    setStocks(prev =>
      prev.map(s => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const loadDemoData = () => {
    setStocks(demoStocks);
  };

  const clearPortfolio = () => {
    setStocks([]);
    localStorage.removeItem(STORAGE_KEY);
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
