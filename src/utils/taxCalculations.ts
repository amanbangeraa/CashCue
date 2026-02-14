import { differenceInDays } from 'date-fns';
import type { Stock, StockWithMetrics, TaxCalculation, HarvestingRecommendation, HarvestPlan, TaxScenario } from '../types/portfolio.types';

const STCG_TAX_RATE = 0.20; // 20%
const LTCG_TAX_RATE = 0.125; // 12.5%
const LTCG_EXEMPTION = 125000; // ₹1.25 lakh
const LTCG_THRESHOLD_DAYS = 365; // 12 months

/**
 * Calculate holding period in days
 */
export function calculateHoldingPeriod(buyDate: string): number {
  const buy = new Date(buyDate);
  const today = new Date();
  return differenceInDays(today, buy);
}

/**
 * Determine if a stock qualifies for LTCG (held >= 365 days)
 */
export function getTaxType(holdingDays: number): 'STCG' | 'LTCG' {
  return holdingDays >= LTCG_THRESHOLD_DAYS ? 'LTCG' : 'STCG';
}

/**
 * Enrich stock data with calculated metrics
 */
export function calculateStockMetrics(stock: Stock): StockWithMetrics {
  const investedValue = stock.buyPrice * stock.quantity;
  const currentValue = stock.currentPrice * stock.quantity;
  const gainLoss = currentValue - investedValue;
  const gainLossPercentage = (gainLoss / investedValue) * 100;
  const holdingPeriodDays = calculateHoldingPeriod(stock.buyDate);
  const taxType = getTaxType(holdingPeriodDays);

  return {
    ...stock,
    investedValue,
    currentValue,
    gainLoss,
    gainLossPercentage,
    holdingPeriodDays,
    taxType,
  };
}

/**
 * Calculate tax liability for a portfolio
 */
export function calculateTaxLiability(stocks: Stock[]): TaxCalculation {
  let stcgGains = 0;
  let stcgLosses = 0;
  let ltcgGains = 0;
  let ltcgLosses = 0;

  stocks.forEach(stock => {
    const metrics = calculateStockMetrics(stock);
    const gain = metrics.gainLoss;

    if (metrics.taxType === 'STCG') {
      if (gain > 0) {
        stcgGains += gain;
      } else {
        stcgLosses += Math.abs(gain);
      }
    } else {
      // LTCG
      if (gain > 0) {
        ltcgGains += gain;
      } else {
        ltcgLosses += Math.abs(gain);
      }
    }
  });

  // Calculate net gains
  const netSTCG = Math.max(0, stcgGains - stcgLosses);
  const netLTCG = Math.max(0, ltcgGains - ltcgLosses);

  // Calculate taxable amounts
  const ltcgTaxable = Math.max(0, netLTCG - LTCG_EXEMPTION);

  // Calculate taxes
  const stcgTax = netSTCG * STCG_TAX_RATE;
  const ltcgTax = ltcgTaxable * LTCG_TAX_RATE;
  const totalTax = stcgTax + ltcgTax;

  return {
    stcgGains,
    stcgLosses,
    ltcgGains,
    ltcgLosses,
    netSTCG,
    netLTCG,
    ltcgTaxable,
    stcgTax,
    ltcgTax,
    totalTax,
  };
}

/**
 * Calculate tax liability with loss harvesting applied
 */
export function calculateTaxWithHarvesting(
  stocks: Stock[],
  stocksToHarvest: StockWithMetrics[]
): TaxCalculation {
  // Create a new portfolio excluding harvested stocks
  const harvestedIds = new Set(stocksToHarvest.map(s => s.id));
  const remainingStocks = stocks.filter(s => !harvestedIds.has(s.id));

  // Calculate current gains/losses for remaining stocks
  let stcgGains = 0;
  let stcgLosses = 0;
  let ltcgGains = 0;
  let ltcgLosses = 0;

  remainingStocks.forEach(stock => {
    const metrics = calculateStockMetrics(stock);
    const gain = metrics.gainLoss;

    if (metrics.taxType === 'STCG') {
      if (gain > 0) stcgGains += gain;
      else stcgLosses += Math.abs(gain);
    } else {
      if (gain > 0) ltcgGains += gain;
      else ltcgLosses += Math.abs(gain);
    }
  });

  // Add harvested losses
  stocksToHarvest.forEach(stock => {
    const loss = Math.abs(stock.gainLoss);
    if (stock.taxType === 'STCG') {
      stcgLosses += loss;
    } else {
      ltcgLosses += loss;
    }
  });

  // Apply offsetting rules
  // 1. Offset STCG gains with STCG losses
  let remainingSTCGLoss = 0;
  let netSTCG = 0;
  
  if (stcgLosses > stcgGains) {
    remainingSTCGLoss = stcgLosses - stcgGains;
    netSTCG = 0;
  } else {
    netSTCG = stcgGains - stcgLosses;
  }

  // 2. Offset LTCG gains with LTCG losses first
  let netLTCG = 0;
  if (ltcgLosses > ltcgGains) {
    netLTCG = 0;
  } else {
    netLTCG = ltcgGains - ltcgLosses;
  }

  // 3. Use remaining STCG losses to offset LTCG gains
  if (remainingSTCGLoss > 0 && netLTCG > 0) {
    if (remainingSTCGLoss >= netLTCG) {
      netLTCG = 0;
    } else {
      netLTCG -= remainingSTCGLoss;
    }
  }

  // Calculate taxes
  const ltcgTaxable = Math.max(0, netLTCG - LTCG_EXEMPTION);
  const stcgTax = netSTCG * STCG_TAX_RATE;
  const ltcgTax = ltcgTaxable * LTCG_TAX_RATE;
  const totalTax = stcgTax + ltcgTax;

  return {
    stcgGains,
    stcgLosses,
    ltcgGains,
    ltcgLosses,
    netSTCG,
    netLTCG,
    ltcgTaxable,
    stcgTax,
    ltcgTax,
    totalTax,
  };
}

/**
 * Generate tax loss harvesting recommendations
 */
export function generateHarvestingRecommendations(stocks: Stock[]): HarvestingRecommendation[] {
  const stocksWithMetrics = stocks.map(calculateStockMetrics);
  
  // Filter only stocks with losses
  const losers = stocksWithMetrics.filter(stock => stock.gainLoss < 0);

  // Calculate tax savings for each losing stock
  const recommendations: HarvestingRecommendation[] = losers.map(stock => {
    const lossAmount = Math.abs(stock.gainLoss);
    
    // Tax savings depends on tax type
    // STCG losses save 20%, LTCG losses save 12.5% (simplified)
    const taxRate = stock.taxType === 'STCG' ? STCG_TAX_RATE : LTCG_TAX_RATE;
    const taxSavings = lossAmount * taxRate;

    const action = `Sell ${stock.quantity} shares at ₹${stock.currentPrice.toFixed(2)}`;
    const rebuySuggestion = 'Rebuy tomorrow at market price to maintain position';

    return {
      stock,
      lossAmount,
      taxSavings,
      action,
      rebuySuggestion,
    };
  });

  // Sort by tax savings (highest first)
  return recommendations.sort((a, b) => b.taxSavings - a.taxSavings);
}

/**
 * Generate a complete harvest plan
 */
export function generateHarvestPlan(stocks: Stock[]): HarvestPlan {
  const recommendations = generateHarvestingRecommendations(stocks);
  
  // Calculate before scenario (current state)
  const beforeTax = calculateTaxLiability(stocks);
  const beforeScenario: TaxScenario = {
    label: 'Current Tax Liability',
    taxableSTCG: beforeTax.netSTCG,
    taxableLTCG: beforeTax.ltcgTaxable,
    stcgTax: beforeTax.stcgTax,
    ltcgTax: beforeTax.ltcgTax,
    totalTax: beforeTax.totalTax,
  };

  // Calculate after scenario (with all losses harvested)
  const stocksToHarvest = recommendations.map(r => r.stock);
  const afterTax = calculateTaxWithHarvesting(stocks, stocksToHarvest);
  const afterScenario: TaxScenario = {
    label: 'After Loss Harvesting',
    taxableSTCG: afterTax.netSTCG,
    taxableLTCG: afterTax.ltcgTaxable,
    stcgTax: afterTax.stcgTax,
    ltcgTax: afterTax.ltcgTax,
    totalTax: afterTax.totalTax,
  };

  // Calculate totals
  const totalLossHarvested = recommendations.reduce((sum, r) => sum + r.lossAmount, 0);
  const totalTaxSavings = beforeScenario.totalTax - afterScenario.totalTax;

  return {
    stocksToSell: recommendations,
    totalLossHarvested,
    totalTaxSavings,
    beforeScenario,
    afterScenario,
  };
}

/**
 * Calculate portfolio summary metrics
 */
export function calculatePortfolioSummary(stocks: Stock[]) {
  const stocksWithMetrics = stocks.map(calculateStockMetrics);
  
  const totalInvested = stocksWithMetrics.reduce((sum, s) => sum + s.investedValue, 0);
  const totalCurrent = stocksWithMetrics.reduce((sum, s) => sum + s.currentValue, 0);
  const totalGainLoss = totalCurrent - totalInvested;
  const totalGainLossPercentage = (totalGainLoss / totalInvested) * 100;

  return {
    totalInvested,
    totalCurrent,
    totalGainLoss,
    totalGainLossPercentage,
    numberOfHoldings: stocks.length,
  };
}
