export interface Stock {
  id: string;
  stockName: string;
  tickerSymbol: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  buyDate: string; // ISO date string
}

export interface StockWithMetrics extends Stock {
  investedValue: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercentage: number;
  holdingPeriodDays: number;
  taxType: 'STCG' | 'LTCG';
}

export interface TaxCalculation {
  stcgGains: number;
  stcgLosses: number;
  ltcgGains: number;
  ltcgLosses: number;
  netSTCG: number;
  netLTCG: number;
  ltcgTaxable: number;
  stcgTax: number;
  ltcgTax: number;
  totalTax: number;
}

export interface HarvestingRecommendation {
  stock: StockWithMetrics;
  lossAmount: number;
  taxSavings: number;
  action: string;
  rebuySuggestion: string;
}

export interface TaxScenario {
  label: string;
  taxableSTCG: number;
  taxableLTCG: number;
  stcgTax: number;
  ltcgTax: number;
  totalTax: number;
}

export interface HarvestPlan {
  stocksToSell: HarvestingRecommendation[];
  totalLossHarvested: number;
  totalTaxSavings: number;
  beforeScenario: TaxScenario;
  afterScenario: TaxScenario;
}
