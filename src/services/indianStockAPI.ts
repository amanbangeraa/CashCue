/**
 * Indian Stock Market API Service
 * Free API for NSE & BSE real-time stock data
 * Base URL: https://military-jobye-haiqstudios-14f59639.koyeb.app
 */

const API_BASE_URL = 'https://military-jobye-haiqstudios-14f59639.koyeb.app';

// Types for API responses
export interface StockData {
  symbol: string;
  exchange: 'NSE' | 'BSE';
  ticker: string;
  company_name: string;
  last_price: number;
  change: number;
  percent_change: number;
  previous_close: number;
  open: number;
  day_high: number;
  day_low: number;
  year_high: number;
  year_low: number;
  volume: number;
  market_cap: number;
  pe_ratio: number;
  dividend_yield: number;
  book_value: number;
  earnings_per_share: number;
  sector: string;
  industry: string;
  currency: string;
  last_update: string;
  timestamp: string;
}

export interface StockResponse {
  status: 'success' | 'error';
  symbol: string;
  exchange: 'NSE' | 'BSE';
  ticker: string;
  response_format: string;
  data: StockData;
  alternate_exchange?: {
    exchange: string;
    ticker: string;
    api_url: string;
  };
  message?: string;
  hint?: string;
}

export interface MultiStockResponse {
  status: 'success' | 'error';
  response_format: string;
  count: number;
  stocks: Array<Omit<StockData, 'previous_close' | 'open' | 'day_high' | 'day_low' | 'year_high' | 'year_low' | 'dividend_yield' | 'book_value' | 'earnings_per_share' | 'industry' | 'currency' | 'last_update' | 'timestamp'>>;
  timestamp: string;
}

export interface SearchResult {
  symbol: string;
  company_name: string;
  match_type: string;
  source: string;
  api_url: string;
  nse_url: string;
  bse_url: string;
}

export interface SearchResponse {
  status: 'success' | 'error';
  query: string;
  total_results: number;
  results: SearchResult[];
  note: string;
  timestamp: string;
}

/**
 * Search for stocks by company name
 * @param query Company name or partial name
 */
export async function searchStocks(query: string): Promise<SearchResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching stocks:', error);
    throw error;
  }
}

/**
 * Get detailed stock data for a single symbol
 * @param symbol Stock symbol (e.g., "RELIANCE", "RELIANCE.NS", "RELIANCE.BO")
 * @param exchange Optional: 'NSE' or 'BSE'. Default is NSE
 */
export async function getStockData(symbol: string, exchange: 'NSE' | 'BSE' = 'NSE'): Promise<StockResponse> {
  try {
    // Add exchange suffix if not present
    let fullSymbol = symbol;
    if (!symbol.includes('.')) {
      fullSymbol = exchange === 'BSE' ? `${symbol}.BO` : `${symbol}.NS`;
    }
    
    const response = await fetch(`${API_BASE_URL}/stock?symbol=${encodeURIComponent(fullSymbol)}&res=num`);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching stock data for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Get data for multiple stocks in one request
 * @param symbols Array of stock symbols
 * @param exchange Optional: 'NSE' or 'BSE'. Default is NSE
 */
export async function getMultipleStocks(symbols: string[], exchange: 'NSE' | 'BSE' = 'NSE'): Promise<MultiStockResponse> {
  try {
    // Add exchange suffix to symbols if not present
    const fullSymbols = symbols.map(symbol => {
      if (symbol.includes('.')) return symbol;
      return exchange === 'BSE' ? `${symbol}.BO` : `${symbol}.NS`;
    });
    
    const symbolsParam = fullSymbols.join(',');
    const response = await fetch(`${API_BASE_URL}/stock/list?symbols=${encodeURIComponent(symbolsParam)}&res=num`);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching multiple stocks:', error);
    throw error;
  }
}

/**
 * Get current price for a stock
 * @param symbol Stock symbol
 * @param exchange Optional: 'NSE' or 'BSE'
 */
export async function getCurrentPrice(symbol: string, exchange: 'NSE' | 'BSE' = 'NSE'): Promise<number> {
  try {
    const data = await getStockData(symbol, exchange);
    if (data.status === 'success') {
      return data.data.last_price;
    }
    return 0;
  } catch (error) {
    console.error(`Error fetching current price for ${symbol}:`, error);
    return 0;
  }
}

/**
 * Batch fetch prices for portfolio stocks
 * @param symbols Array of stock symbols
 */
export async function batchFetchPrices(symbols: string[]): Promise<Map<string, number>> {
  const priceMap = new Map<string, number>();
  
  try {
    // Try to fetch all at once using the batch endpoint
    const response = await getMultipleStocks(symbols);
    
    if (response.status === 'success') {
      response.stocks.forEach(stock => {
        // Store by symbol without exchange suffix for easy lookup
        const cleanSymbol = stock.symbol;
        priceMap.set(cleanSymbol, stock.last_price);
        priceMap.set(stock.ticker, stock.last_price); // Also store with full ticker
      });
    }
  } catch (error) {
    console.error('Error in batch fetch, falling back to individual fetches:', error);
    
    // Fallback: Fetch individually with delay
    for (let i = 0; i < symbols.length; i++) {
      try {
        // Add small delay to avoid rate limiting
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        const price = await getCurrentPrice(symbols[i]);
        if (price > 0) {
          priceMap.set(symbols[i], price);
        }
      } catch (err) {
        console.error(`Failed to fetch price for ${symbols[i]}:`, err);
      }
    }
  }
  
  return priceMap;
}

/**
 * Update portfolio stocks with latest prices
 * @param stocks Array of stock objects with symbol and current price
 */
export async function updatePortfolioPrices(
  stocks: Array<{ id: string; tickerSymbol: string; stockName: string; currentPrice: number }>
): Promise<Array<{ id: string; newPrice: number }>> {
  const updates: Array<{ id: string; newPrice: number }> = [];
  
  try {
    // Extract unique symbols
    const symbols = stocks.map(s => s.tickerSymbol || s.stockName);
    
    // Batch fetch prices
    const priceMap = await batchFetchPrices(symbols);
    
    // Map prices back to stocks
    stocks.forEach(stock => {
      const symbol = stock.tickerSymbol || stock.stockName;
      const newPrice = priceMap.get(symbol) || priceMap.get(symbol.replace('.NS', '').replace('.BO', ''));
      
      if (newPrice && newPrice > 0) {
        updates.push({
          id: stock.id,
          newPrice: newPrice,
        });
      }
    });
  } catch (error) {
    console.error('Error updating portfolio prices:', error);
  }
  
  return updates;
}
