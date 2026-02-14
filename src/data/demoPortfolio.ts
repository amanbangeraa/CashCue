import type { Stock } from '../types/portfolio.types';

/**
 * Demo portfolio with pre-configured stocks
 * Designed to show impressive tax savings opportunity
 */
export const demoStocks: Stock[] = [
  // WINNERS (Total gains: ₹97,400)
  {
    id: 'stock_1',
    stockName: 'Infosys',
    tickerSymbol: 'INFY',
    quantity: 100,
    buyPrice: 1400,
    currentPrice: 1720,
    buyDate: '2023-01-15', // LTCG
  },
  {
    id: 'stock_2',
    stockName: 'Reliance Industries',
    tickerSymbol: 'RELIANCE',
    quantity: 50,
    buyPrice: 2200,
    currentPrice: 2550,
    buyDate: '2025-08-01', // STCG
  },
  {
    id: 'stock_3',
    stockName: 'TCS',
    tickerSymbol: 'TCS',
    quantity: 80,
    buyPrice: 3100,
    currentPrice: 3480,
    buyDate: '2023-03-20', // LTCG
  },
  {
    id: 'stock_4',
    stockName: 'HDFC Bank',
    tickerSymbol: 'HDFCBANK',
    quantity: 150,
    buyPrice: 1500,
    currentPrice: 1630,
    buyDate: '2024-05-10', // LTCG
  },
  {
    id: 'stock_5',
    stockName: 'ICICI Bank',
    tickerSymbol: 'ICICIBANK',
    quantity: 120,
    buyPrice: 900,
    currentPrice: 1020,
    buyDate: '2023-07-05', // LTCG
  },
  
  // LOSERS (Total losses: ₹88,000)
  {
    id: 'stock_6',
    stockName: 'Wipro',
    tickerSymbol: 'WIPRO',
    quantity: 200,
    buyPrice: 450,
    currentPrice: 385,
    buyDate: '2025-10-15', // STCG
  },
  {
    id: 'stock_7',
    stockName: 'Paytm',
    tickerSymbol: 'PAYTM',
    quantity: 300,
    buyPrice: 880,
    currentPrice: 720,
    buyDate: '2025-11-01', // STCG
  },
  {
    id: 'stock_8',
    stockName: 'Zomato',
    tickerSymbol: 'ZOMATO',
    quantity: 400,
    buyPrice: 125,
    currentPrice: 95,
    buyDate: '2025-12-05', // STCG
  },
  {
    id: 'stock_9',
    stockName: 'Tech Mahindra',
    tickerSymbol: 'TECHM',
    quantity: 100,
    buyPrice: 1200,
    currentPrice: 1050,
    buyDate: '2024-06-20', // LTCG
  },
];

/**
 * Current stock prices (hardcoded for demo)
 */
export const stockPrices: Record<string, number> = {
  INFY: 1720,
  RELIANCE: 2550,
  TCS: 3480,
  HDFCBANK: 1630,
  ICICIBANK: 1020,
  WIPRO: 385,
  PAYTM: 720,
  ZOMATO: 95,
  TECHM: 1050,
};

/**
 * Get current price for a ticker symbol
 */
export function getCurrentPrice(ticker: string): number {
  return stockPrices[ticker] || 0;
}
