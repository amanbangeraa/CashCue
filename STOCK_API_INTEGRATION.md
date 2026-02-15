# Indian Stock Exchange API Integration

## Overview

CashCue now integrates with the Indian Stock Exchange API to provide real-time stock market data for NSE and BSE stocks. This enables live portfolio tracking with current market prices.

## Setup

### Environment Variables

The API key is stored in `.env`:

```
VITE_STOCK_MARKET_API_KEY=sk-live-YxubO9Dnxjeq0jP3MsgV1skKHgdOTRdHpIIiF5oS
```

**Security Note**: Never commit the `.env` file to version control. It should be listed in `.gitignore`.

## Features

### 1. Real-Time Price Updates

- **Auto-refresh**: Stock prices automatically update every 5 minutes
- **Manual refresh**: Click the "Refresh Prices" button in the portfolio table
- **Last update timestamp**: Shows when prices were last updated
- **Batch fetching**: All stock prices are fetched in parallel for efficiency

### 2. Add Stock with Live Price

When adding a new stock:
- Enter the stock name or ticker symbol
- Click the download icon next to "Current Price" to fetch real-time price
- Price is automatically populated from market data

### 3. Market Trends Dashboard

The Portfolio page displays:
- **Top 3 Gainers**: Best performing stocks in the market
- **Top 3 Losers**: Worst performing stocks in the market
- For each stock: current price, % change, high/low, and overall rating
- Auto-refreshes every 10 minutes

## API Service (`src/services/stockMarketAPI.ts`)

### Available Functions

#### Stock Data
- `getStockByName(name)` - Get detailed company data by name or ticker
- `getCurrentStockPrice(stockName)` - Get current price for a single stock
- `batchFetchStockPrices(stockNames)` - Fetch prices for multiple stocks

#### Market Data
- `getTrendingStocks()` - Get top gainers and losers
- `get52WeekHighLowData()` - 52-week high/low data for BSE and NSE
- `getNSEMostActive()` - Most active NSE stocks by volume
- `getBSEMostActive()` - Most active BSE stocks by volume
- `getPriceShockers()` - Stocks with significant price changes

#### Search
- `searchByIndustry(query)` - Search companies by industry
- `searchMutualFunds(query)` - Search mutual funds

#### Other
- `getMutualFunds()` - Get mutual funds data
- `getCommodities()` - Get commodity futures data

### API Response Format

Stock prices are fetched from both NSE and BSE exchanges:

```typescript
{
  currentPrice: {
    NSE: 2195.75,  // National Stock Exchange price
    BSE: 2200.50   // Bombay Stock Exchange price
  }
}
```

The system prefers NSE prices and falls back to BSE if NSE is unavailable.

## Components

### Updated Components

1. **PortfolioContext** (`src/context/PortfolioContext.tsx`)
   - Added `refreshStockPrices()` function
   - Auto-refresh timer (5 minutes)
   - Price update state management
   - Last update timestamp tracking

2. **PortfolioTable** (`src/components/portfolio/PortfolioTable.tsx`)
   - Added "Refresh Prices" button with loading state
   - Shows last price update time
   - Refresh icon animates during updates

3. **AddStockForm** (`src/components/portfolio/AddStockForm.tsx`)
   - Added "Fetch Current Price" button
   - Real-time price lookup by ticker or company name
   - Loading animation during price fetch

### New Components

4. **MarketTrends** (`src/components/portfolio/MarketTrends.tsx`)
   - Displays top 3 gainers and losers
   - Shows current price, % change, high/low
   - Overall market rating for each stock
   - Auto-refreshes every 10 minutes

## Usage Example

### Fetching a single stock price

```typescript
import { getCurrentStockPrice } from '@/services/stockMarketAPI';

const price = await getCurrentStockPrice('RELIANCE');
console.log(`Current price: ₹${price}`);
```

### Fetching multiple stock prices

```typescript
import { batchFetchStockPrices } from '@/services/stockMarketAPI';

const stocks = ['RELIANCE', 'TCS', 'INFY'];
const priceMap = await batchFetchStockPrices(stocks);

stocks.forEach(stock => {
  console.log(`${stock}: ₹${priceMap.get(stock)}`);
});
```

### Getting market trends

```typescript
import { getTrendingStocks } from '@/services/stockMarketAPI';

const trends = await getTrendingStocks();
console.log('Top Gainers:', trends.top_gainers);
console.log('Top Losers:', trends.top_losers);
```

## Rate Limiting

The API has rate limiting. To avoid issues:

- **Batch requests**: Use `batchFetchStockPrices()` with a 200ms delay between requests
- **Caching**: Prices are cached in the application state
- **Auto-refresh interval**: Set to 5 minutes to balance freshness and API usage

## Error Handling

All API functions include error handling:

```typescript
try {
  const price = await getCurrentStockPrice('INVALID');
} catch (error) {
  console.error('Error fetching price:', error);
  // Fallback: Use existing price or show error to user
}
```

When price fetching fails:
- Portfolio uses the last known price
- Add Stock form shows an alert and allows manual entry
- Market Trends displays an error message with retry button

## Supported Stock Identifiers

The API accepts various formats:
- **Ticker symbols**: `RELIANCE`, `TCS`, `INFY`
- **Full company names**: `Reliance Industries`, `Tata Consultancy Services`
- **Shortened names**: Common variations like `Reliance`, `Infosys`

## Future Enhancements

Potential improvements:
1. **Price alerts**: Notify users when stocks reach target prices
2. **Historical charts**: Display price trends over time
3. **Advanced search**: Search stocks by industry, sector, or filters
4. **Portfolio analytics**: AI-powered insights using market data
5. **Compare stocks**: Side-by-side comparison with live data
6. **News integration**: Show recent news from API response
7. **Watchlist**: Track stocks without owning them

## Troubleshooting

### Prices not updating

1. Check `.env` file has the correct API key
2. Verify internet connection
3. Check browser console for errors
4. Try manual refresh button

### API errors

If you see API errors:
- **401 Unauthorized**: API key is invalid or missing
- **429 Too Many Requests**: Rate limit exceeded, wait a minute
- **500 Server Error**: API service is down, try again later

### Market closed

Some endpoints (like 52-week high/low) return empty arrays when markets are closed. This is expected behavior.

## API Documentation

For complete API documentation, refer to:
- Base URL: `https://indian-stock-exchange-api2.p.rapidapi.com`
- Full endpoint list in `src/services/stockMarketAPI.ts`
