import Groq from "groq-sdk";

// Types for AI responses
export interface TaxInsight {
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  potential_saving: number;
  action_items: string[];
  deadline?: string;
  risk_level: 'safe' | 'moderate' | 'risky';
  affected_stocks?: string[];
}

export interface TimelineEvent {
  date: string;
  type: 'ltcg_eligible' | 'harvest_deadline' | 'fy_end' | 'loss_expiry';
  stock?: string;
  impact: string;
  action: string;
  days_remaining: number;
}

export interface TaxScenario {
  name: string;
  tax_liability: number;
  savings?: number;
  transaction_costs?: number;
  net_benefit?: number;
  pros: string[];
  cons: string[];
  actions?: string[];
}

export interface AIAnalysisResult {
  health_score: number;
  total_potential_savings: number;
  insights: TaxInsight[];
  timeline_events: TimelineEvent[];
  scenarios: TaxScenario[];
  recommended_scenario: number;
  urgent_actions: string[];
  strengths: string[];
  weaknesses: string[];
  generated_at: string;
}

// Initialize Groq
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY || '',
  dangerouslyAllowBrowser: true // Required for client-side usage
});

/**
 * CORRECTED TAX CALCULATION LOGIC FOR INDIAN MARKETS
 * 
 * Key Rules:
 * 1. Tax savings CANNOT exceed actual tax liability
 * 2. You can only save tax if you have GAINS to offset
 * 3. STCG losses offset both STCG and LTCG gains
 * 4. LTCG losses only offset LTCG gains
 * 5. Maximum savings = current tax liability on gains
 */

interface TaxCalculationContext {
  realizedGains: {
    stcg: number;  // Short-term gains already realized this FY
    ltcg: number;  // Long-term gains already realized this FY
  };
  unrealizedGains: {
    stcg: number;  // Unrealized short-term gains
    ltcg: number;  // Unrealized long-term gains
  };
  unrealizedLosses: {
    stcg: number;  // Unrealized short-term losses
    ltcg: number;  // Unrealized long-term losses
  };
}

function calculateRealisticTaxSavings(stocks: any[], realizedGainsInput: number = 0): TaxCalculationContext {
  const context: TaxCalculationContext = {
    realizedGains: { stcg: realizedGainsInput, ltcg: 0 },
    unrealizedGains: { stcg: 0, ltcg: 0 },
    unrealizedLosses: { stcg: 0, ltcg: 0 }
  };

  stocks.forEach(stock => {
    const currentValue = stock.currentPrice * stock.quantity;
    const investedValue = stock.buyPrice * stock.quantity;
    const gainLoss = currentValue - investedValue;
    
    const buyDate = new Date(stock.buyDate);
    const holdingDays = Math.floor((new Date().getTime() - buyDate.getTime()) / (1000 * 60 * 60 * 24));
    const isLTCG = holdingDays >= 365;
    
    if (gainLoss > 0) {
      // Unrealized gains
      if (isLTCG) {
        context.unrealizedGains.ltcg += gainLoss;
      } else {
        context.unrealizedGains.stcg += gainLoss;
      }
    } else if (gainLoss < 0) {
      // Unrealized losses (harvestable)
      if (isLTCG) {
        context.unrealizedLosses.ltcg += Math.abs(gainLoss);
      } else {
        context.unrealizedLosses.stcg += Math.abs(gainLoss);
      }
    }
  });

  return context;
}

function calculateCurrentTaxLiability(context: TaxCalculationContext): number {
  // STCG tax: 20% on all STCG gains
  const stcgTax = context.realizedGains.stcg * 0.20;
  
  // LTCG tax: 12.5% on gains above ₹1.25L
  const ltcgTaxableAmount = Math.max(0, context.realizedGains.ltcg - 125000);
  const ltcgTax = ltcgTaxableAmount * 0.125;
  
  return stcgTax + ltcgTax;
}

function calculateMaxPossibleSavings(context: TaxCalculationContext, stocks: any[]): {
  maxSavings: number;
  currentTaxLiability: number;
  harvestableAmount: number;
  explanation: string;
} {
  const currentTax = calculateCurrentTaxLiability(context);
  
  // STCG losses can offset both STCG and LTCG gains
  const stcgLossValue = context.unrealizedLosses.stcg;
  
  // Calculate how much of realized gains can be offset
  let offsetableSTCG = Math.min(stcgLossValue, context.realizedGains.stcg);
  let offsetableLTCG = Math.min(
    stcgLossValue - offsetableSTCG, 
    Math.max(0, context.realizedGains.ltcg - 125000)
  );
  
  // Calculate tax savings from offsetting
  const stcgSavings = offsetableSTCG * 0.20;
  const ltcgSavings = offsetableLTCG * 0.125;
  
  const grossSavings = stcgSavings + ltcgSavings;
  
  // Calculate transaction costs
  const harvestableStocks = stocks.filter(s => {
    const gainLoss = (s.currentPrice - s.buyPrice) * s.quantity;
    return gainLoss < 0;
  });
  
  const transactionCosts = harvestableStocks.reduce((sum, s) => {
    const sellValue = s.currentPrice * s.quantity;
    return sum + 23.6 + (sellValue * 0.001);
  }, 0);
  
  const netSavings = Math.max(0, grossSavings - transactionCosts);
  
  // CRITICAL: Savings cannot exceed current tax liability
  const realisticSavings = Math.min(netSavings, currentTax);
  
  let explanation = '';
  if (currentTax === 0) {
    explanation = 'No current tax liability. Tax-loss harvesting would create future offset potential if you realize gains later.';
  } else if (realisticSavings === 0) {
    explanation = 'Transaction costs exceed potential tax savings.';
  } else if (realisticSavings < netSavings) {
    explanation = `Savings capped at current tax liability of ₹${Math.round(currentTax).toLocaleString('en-IN')}.`;
  } else {
    explanation = 'Realistic savings calculated after transaction costs.';
  }
  
  return {
    maxSavings: realisticSavings,
    currentTaxLiability: currentTax,
    harvestableAmount: stcgLossValue,
    explanation
  };
}

/**
 * PORTFOLIO TAX HEALTH SCORE CALCULATION
 * 
 * Score Range: 0-10 (higher is better)
 * 
 * FORMULA:
 * Base Score = 10
 * 
 * DEDUCTIONS:
 * - Unharvested Loss Ratio: -3 points max
 *   Formula: (Total Unharvested Losses / Portfolio Value) * 3
 *   Example: ₹20K losses on ₹100K portfolio = -0.6 points
 * 
 * - STCG Heavy Penalty: -2 points max
 *   Formula: (STCG Holdings % - 50%) * 0.04
 *   Example: 80% STCG holdings = -1.2 points
 * 
 * - Near-LTCG Threshold Penalty: -1 point max
 *   Formula: 0.25 points per stock within 30 days of LTCG
 * 
 * - Late FY Urgency: -1 point max
 *   Formula: If <30 days to FY end AND unharvested losses exist = -1
 * 
 * BONUSES:
 * + Diversification: +1 point max
 *   Formula: (Number of stocks / 10) capped at 1
 * 
 * + LTCG Majority: +1 point max
 *   Formula: (LTCG % - 60%) * 0.025
 * 
 * Final Score = Clamped between 3.0 and 10.0
 */

interface HealthScoreBreakdown {
  baseScore: number;
  deductions: {
    unharvestedLosses: number;
    stcgHeavy: number;
    nearThreshold: number;
    fyUrgency: number;
  };
  bonuses: {
    diversification: number;
    ltcgMajority: number;
  };
  finalScore: number;
  explanation: string;
}

function calculateHealthScore(stocks: any[], daysToFYEnd: number): HealthScoreBreakdown {
  let baseScore = 10;
  
  const portfolioValue = stocks.reduce((sum, s) => sum + (s.currentPrice * s.quantity), 0);
  const unharvestedLosses = stocks
    .filter(s => (s.currentPrice - s.buyPrice) * s.quantity < 0)
    .reduce((sum, s) => sum + Math.abs((s.currentPrice - s.buyPrice) * s.quantity), 0);
  
  const ltcgStocks = stocks.filter(s => {
    const holdingDays = Math.floor((new Date().getTime() - new Date(s.buyDate).getTime()) / (1000 * 60 * 60 * 24));
    return holdingDays >= 365;
  });
  const ltcgPercentage = stocks.length > 0 ? (ltcgStocks.length / stocks.length) * 100 : 0;
  
  const nearThresholdStocks = stocks.filter(s => {
    const holdingDays = Math.floor((new Date().getTime() - new Date(s.buyDate).getTime()) / (1000 * 60 * 60 * 24));
    return holdingDays >= 335 && holdingDays < 365; // Within 30 days of LTCG
  });
  
  // DEDUCTIONS
  const lossRatioDeduction = portfolioValue > 0 
    ? Math.min(3, (unharvestedLosses / portfolioValue) * 3)
    : 0;
  
  const stcgHeavyDeduction = Math.max(0, ((100 - ltcgPercentage) - 50) * 0.04);
  
  const nearThresholdDeduction = Math.min(1, nearThresholdStocks.length * 0.25);
  
  const fyUrgencyDeduction = (daysToFYEnd < 30 && unharvestedLosses > 0) ? 1 : 0;
  
  // BONUSES
  const diversificationBonus = Math.min(1, stocks.length / 10);
  
  const ltcgMajorityBonus = Math.min(1, Math.max(0, (ltcgPercentage - 60) * 0.025));
  
  // CALCULATE FINAL
  let finalScore = baseScore;
  finalScore -= lossRatioDeduction;
  finalScore -= stcgHeavyDeduction;
  finalScore -= nearThresholdDeduction;
  finalScore -= fyUrgencyDeduction;
  finalScore += diversificationBonus;
  finalScore += ltcgMajorityBonus;
  
  finalScore = Math.max(3.0, Math.min(10.0, finalScore));
  
  return {
    baseScore,
    deductions: {
      unharvestedLosses: lossRatioDeduction,
      stcgHeavy: stcgHeavyDeduction,
      nearThreshold: nearThresholdDeduction,
      fyUrgency: fyUrgencyDeduction
    },
    bonuses: {
      diversification: diversificationBonus,
      ltcgMajority: ltcgMajorityBonus
    },
    finalScore,
    explanation: `Score based on: loss harvesting efficiency (-${lossRatioDeduction.toFixed(1)}), holding period distribution (-${stcgHeavyDeduction.toFixed(1)}), timing optimization (-${nearThresholdDeduction.toFixed(1)}), FY urgency (-${fyUrgencyDeduction.toFixed(1)}), diversification (+${diversificationBonus.toFixed(1)}), LTCG ratio (+${ltcgMajorityBonus.toFixed(1)}).`
  };
}

function validateAIResponse(
  analysis: AIAnalysisResult, 
  portfolioValue: number, 
  _currentTaxLiability: number, 
  maxSavings: number
): {
  valid: boolean;
  errors: string[];
  correctedAnalysis: AIAnalysisResult;
} {
  const errors: string[] = [];
  const corrected = { ...analysis };
  
  // VALIDATION 1: Total savings cannot exceed portfolio value
  if (analysis.total_potential_savings > portfolioValue) {
    errors.push(`Invalid: Tax savings (₹${analysis.total_potential_savings}) exceeds portfolio value (₹${portfolioValue})`);
    corrected.total_potential_savings = Math.min(analysis.total_potential_savings, maxSavings);
  }
  
  // VALIDATION 2: Total savings cannot exceed maximum possible savings
  if (analysis.total_potential_savings > maxSavings) {
    errors.push(`Invalid: Tax savings (₹${analysis.total_potential_savings}) exceeds max possible (₹${Math.round(maxSavings)})`);
    corrected.total_potential_savings = maxSavings;
  }
  
  // VALIDATION 3: Individual insight savings should be reasonable
  corrected.insights = analysis.insights.map(insight => {
    if (insight.potential_saving > portfolioValue * 0.5) {
      errors.push(`Invalid insight: "${insight.title}" shows saving of ₹${insight.potential_saving}`);
      return {
        ...insight,
        potential_saving: Math.min(insight.potential_saving, maxSavings * 0.3)
      };
    }
    return insight;
  });
  
  // VALIDATION 4: Health score must be 3-10
  if (corrected.health_score < 3 || corrected.health_score > 10) {
    errors.push(`Invalid health score: ${corrected.health_score}`);
    corrected.health_score = Math.max(3, Math.min(10, corrected.health_score));
  }
  
  // VALIDATION 5: Check for US wash sale references
  const allText = JSON.stringify(analysis).toLowerCase();
  if (allText.includes('30 day') || allText.includes('wash sale')) {
    errors.push('Warning: Found references to US wash sale rules');
  }
  
  // VALIDATION 6: Check for directive language
  const directivePatterns = ['sell now', 'you should sell', 'must sell', 'urgent: sell'];
  directivePatterns.forEach(pattern => {
    if (allText.includes(pattern)) {
      errors.push(`Warning: Found directive language: "${pattern}"`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
    correctedAnalysis: corrected
  };
}

/**
 * Main function to generate comprehensive tax insights
 * @param stocks - Array of user's stock holdings
 * @param realizedGains - Total realized gains for current FY
 * @param currentDate - Current date for deadline calculations
 */
export async function generateTaxInsights(
  stocks: any[],
  realizedGains: number = 0,
  currentDate: Date = new Date()
): Promise<AIAnalysisResult> {
  if (!import.meta.env.VITE_GROQ_API_KEY) {
    console.error('Groq API key not found');
    return getEmptyAnalysis();
  }

  try {
    const prompt = buildAnalysisPrompt(stocks, realizedGains, currentDate);
    
    // Call Groq/Llama for analysis
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Fast and powerful model
      messages: [
        {
          role: "system",
          content: "You are an expert Indian tax analyst specializing in equity portfolio tax optimization. You provide analytical insights, NOT investment advice. You MUST respond with ONLY valid JSON, no markdown formatting or explanations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 4096,
      top_p: 1,
      stream: false,
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0]?.message?.content || '';
    
    if (!responseText) {
      throw new Error('Empty response from AI');
    }
    
    const analysis: AIAnalysisResult = JSON.parse(responseText);
    
    // Add metadata
    analysis.generated_at = new Date().toISOString();
    
    // VALIDATE BEFORE RETURNING
    const portfolioValue = stocks.reduce((sum, s) => sum + (s.currentPrice * s.quantity), 0);
    const taxContext = calculateRealisticTaxSavings(stocks, realizedGains);
    const savingsCalc = calculateMaxPossibleSavings(taxContext, stocks);
    
    const validation = validateAIResponse(analysis, portfolioValue, savingsCalc.currentTaxLiability, savingsCalc.maxSavings);
    
    if (!validation.valid) {
      console.warn('⚠️ AI Response Validation Errors:', validation.errors);
      // Return corrected version
      return validation.correctedAnalysis;
    }
    
    // Debug logging
    console.log('🤖 AI ANALYSIS DEBUG:');
    console.log('Health Score:', analysis.health_score);
    console.log('Total Savings:', analysis.total_potential_savings);
    console.log('Max Possible Savings:', savingsCalc.maxSavings);
    console.log('Current Tax Liability:', savingsCalc.currentTaxLiability);
    console.log('Insights:', analysis.insights.length);
    
    return analysis;
    
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return getEmptyAnalysis();
  }
}

function buildAnalysisPrompt(
  stocks: any[],
  realizedGains: number,
  currentDate: Date
): string {
  const currentDateStr = currentDate.toISOString().split('T')[0];
  const fyEndDate = new Date(currentDate.getFullYear(), 2, 31); // March 31
  const daysToFYEnd = Math.ceil((fyEndDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

  // Calculate portfolio stats WITH ACTUAL NUMBERS
  const totalStocks = stocks.length;
  const portfolioDetails = stocks.map(s => {
    const currentValue = s.currentPrice * s.quantity;
    const investedValue = s.buyPrice * s.quantity;
    const gainLoss = currentValue - investedValue;
    const gainLossPct = ((s.currentPrice - s.buyPrice) / s.buyPrice) * 100;
    
    // Calculate holding period
    const buyDate = new Date(s.buyDate);
    const holdingDays = Math.floor((currentDate.getTime() - buyDate.getTime()) / (1000 * 60 * 60 * 24));
    const isLTCG = holdingDays >= 365;
    
    return {
      ticker: s.ticker || s.symbol || s.name,
      quantity: s.quantity,
      buyPrice: s.buyPrice,
      currentPrice: s.currentPrice,
      investedValue: investedValue,
      currentValue: currentValue,
      gainLoss: gainLoss,
      gainLossPct: gainLossPct.toFixed(2),
      buyDate: s.buyDate,
      holdingDays: holdingDays,
      type: isLTCG ? 'LTCG' : 'STCG',
      daysToLTCG: isLTCG ? 0 : (365 - holdingDays)
    };
  });

  const totalValue = portfolioDetails.reduce((sum, s) => sum + s.currentValue, 0);
  const totalInvested = portfolioDetails.reduce((sum, s) => sum + s.investedValue, 0);
  const totalGainLoss = totalValue - totalInvested;
  const unrealizedGains = portfolioDetails.filter(s => s.gainLoss > 0).reduce((sum, s) => sum + s.gainLoss, 0);
  const unrealizedLosses = portfolioDetails.filter(s => s.gainLoss < 0).reduce((sum, s) => sum + Math.abs(s.gainLoss), 0);
  const harvestableStocks = portfolioDetails.filter(s => s.gainLoss < 0);

  // Calculate realistic tax context
  const taxContext = calculateRealisticTaxSavings(stocks, realizedGains);
  const savingsCalc = calculateMaxPossibleSavings(taxContext, stocks);
  const healthScoreCalc = calculateHealthScore(stocks, daysToFYEnd);

  return `You are an expert Indian tax analyst specializing in equity portfolio tax optimization.

## CRITICAL CONSTRAINTS - READ CAREFULLY

ABSOLUTE RULES FOR TAX SAVINGS CALCULATION:

1. **Current Tax Liability**: ₹${Math.round(savingsCalc.currentTaxLiability).toLocaleString('en-IN')}
   - This is the MAXIMUM possible savings
   - You CANNOT show savings higher than this

2. **Harvestable Losses**: ₹${Math.round(savingsCalc.harvestableAmount).toLocaleString('en-IN')}
   - These are losses that can be used for offsetting

3. **Realistic Max Savings**: ₹${Math.round(savingsCalc.maxSavings).toLocaleString('en-IN')}
   - After transaction costs and constraints

4. **VALIDATION RULE**: 
   - total_potential_savings MUST be ≤ ₹${Math.round(savingsCalc.maxSavings)}
   - If user has NO realized gains (₹${realizedGains}), show LOW savings or "potential future savings"

5. **Context for AI**:
   - ${savingsCalc.explanation}

DO NOT show tax savings of ₹10,000 if portfolio is only ₹8,000.
DO NOT show savings that exceed current tax liability.
BE REALISTIC. BE CONSERVATIVE.

## CURRENT CONTEXT
- Date: ${currentDateStr}
- Financial Year: FY 2024-25 (ends March 31, 2025)
- Days until FY end: ${daysToFYEnd}
- User has already realized gains this FY: ₹${realizedGains.toLocaleString('en-IN')}

## USER'S PORTFOLIO SUMMARY
- Total Stocks: ${totalStocks}
- Portfolio Value: ₹${totalValue.toLocaleString('en-IN')}
- Total Invested: ₹${totalInvested.toLocaleString('en-IN')}
- Net P&L: ₹${totalGainLoss.toLocaleString('en-IN')} (${((totalGainLoss/totalInvested)*100).toFixed(2)}%)
- Unrealized Gains: ₹${unrealizedGains.toLocaleString('en-IN')}
- Unrealized Losses: ₹${unrealizedLosses.toLocaleString('en-IN')} ⚠️ HARVESTABLE
- Stocks with losses: ${harvestableStocks.length}

## DETAILED HOLDINGS
${JSON.stringify(portfolioDetails, null, 2)}

## INDIAN TAX RULES (CRITICAL - CALCULATE EXACTLY)

### Tax Rates:
1. **STCG (holding < 365 days)**: 20% flat on gains
2. **LTCG (holding ≥ 365 days)**: 12.5% on gains above ₹1,25,000 exemption

### Loss Offsetting Rules:
- STCG losses can offset BOTH STCG and LTCG gains
- LTCG losses can ONLY offset LTCG gains
- Losses must be realized (sold) in same FY to offset

### Transaction Costs (MUST DEDUCT FROM SAVINGS):
For each sell transaction:
- STT: 0.1% of sell value
- Brokerage: ₹20 flat
- GST on brokerage: 18% (₹3.6)
- Total per trade = ₹23.6 + (sell_value × 0.001)

Example calculation:
Stock: RELIANCE, Loss: ₹15,000, Holding: 280 days (STCG), Sell value: ₹50,000
- Gross tax saving: ₹15,000 × 0.20 = ₹3,000
- Transaction cost: ₹23.6 + (₹50,000 × 0.001) = ₹73.6
- NET SAVING (potential_saving): ₹3,000 - ₹73.6 = ₹2,926.4
- Round to: ₹2,926

## INDIAN TAX RULES FOR LOSS HARVESTING

**Critical Legal Context:**

1. **NO Wash Sale Rule in India**
   - Unlike the US, India has NO specific 30-day wash sale rule
   - You CAN legally rebuy immediately after selling for loss

2. **BUT - Tax Department Scrutiny**
   - CBDT Circular 6/2016 addresses "sham transactions"
   - If you sell and rebuy SAME DAY to create artificial losses, it may be questioned
   - Best practice: Wait 24-48 hours OR switch to similar stock

3. **Safe Rebuy Strategies:**
   a) **Wait 24-48 hours** before rebuying same stock (conservative approach)
   b) **Switch stocks** immediately (e.g., sell TATAMOTORS → buy M&M in same sector)
   c) **Buy different sector** temporarily

4. **What to Tell Users:**
   - "Consider waiting 1-2 days before rebuying to avoid scrutiny"
   - "Or switch to similar stock in same sector"
   - NOT "Wait 30 days for wash sale rule" (THIS IS WRONG - US RULE ONLY)

5. **Risk Levels:**
   - Same day rebuy: Risky (may trigger scrutiny)
   - 1-2 day gap: Safe
   - Different stock: Safest

## LEGAL COMPLIANCE - LANGUAGE GUIDELINES

YOU ARE A TAX ANALYTICS TOOL, NOT AN INVESTMENT ADVISOR.

**NEVER use these phrases:**
❌ "Sell RELIANCE"
❌ "You should sell"
❌ "We recommend selling"
❌ "Urgent: Sell now"
❌ "Must sell"
❌ "Guaranteed savings"
❌ "100% tax-free"
❌ "You're not really losing money"
❌ "Risk-free strategy"
❌ "Always works"

**ALWAYS use these phrases:**
✅ "Tax-loss harvesting opportunity identified in RELIANCE"
✅ "Consider harvesting loss from RELIANCE for tax optimization"
✅ "RELIANCE shows potential for tax-loss harvesting"
✅ "Opportunity to offset gains by harvesting RELIANCE loss"
✅ "Potential savings" (not "guaranteed")
✅ "May reduce tax liability" (not "will eliminate")
✅ "Based on current tax rules" (acknowledges change)
✅ "Consider consulting tax advisor" (disclaimer)
✅ "Align with investment goals" (holistic view)

**Title Format:**
❌ "Urgent Action Required: Sell TATAMOTORS"
✅ "Tax-Loss Harvesting Opportunity: TATAMOTORS"
✅ "Consider Harvesting: TATAMOTORS Loss"

**Action Items Format:**
❌ "Sell 50 shares of TATAMOTORS"
✅ "Consider selling 50 shares of TATAMOTORS to harvest ₹15,000 loss"
✅ "Potential action: Harvest TATAMOTORS loss (50 shares)"

**Risk Level Language:**
❌ "This is a safe trade"
✅ "This is a low-risk tax optimization strategy"

**Always include disclaimer phrases:**
- "Consult with your tax advisor"
- "Align with your investment goals"
- "Consider your investment strategy"
- "Based on current tax laws"

## HEALTH SCORE CALCULATION

Use this EXACT formula:

health_score = ${healthScoreCalc.finalScore.toFixed(1)}

This was calculated using:
- Base Score: ${healthScoreCalc.baseScore}
- Unharvested Loss Deduction: -${healthScoreCalc.deductions.unharvestedLosses.toFixed(1)}
- STCG Heavy Deduction: -${healthScoreCalc.deductions.stcgHeavy.toFixed(1)}
- Near LTCG Threshold Deduction: -${healthScoreCalc.deductions.nearThreshold.toFixed(1)}
- FY End Urgency Deduction: -${healthScoreCalc.deductions.fyUrgency.toFixed(1)}
- Diversification Bonus: +${healthScoreCalc.bonuses.diversification.toFixed(1)}
- LTCG Majority Bonus: +${healthScoreCalc.bonuses.ltcgMajority.toFixed(1)}

USE THIS EXACT SCORE: ${healthScoreCalc.finalScore.toFixed(1)}

## YOUR TASK
Analyze this portfolio and generate a comprehensive JSON response with the following structure:

{
  "health_score": ${healthScoreCalc.finalScore.toFixed(1)},
  "total_potential_savings": <total ₹ MUST be ≤ ${Math.round(savingsCalc.maxSavings)}>,
  
  "insights": [
    {
      "priority": "high" | "medium" | "low",
      "title": "<analytical title, not directive>",
      "description": "<detailed explanation with exact numbers>",
      "potential_saving": <₹ amount after transaction costs>,
      "action_items": ["<use 'consider' language, not 'sell'>"],
      "deadline": "<optional: date string if time-sensitive>",
      "risk_level": "safe" | "moderate" | "risky",
      "affected_stocks": ["<ticker1>", "<ticker2>"]
    }
  ],
  
  "timeline_events": [
    {
      "date": "<YYYY-MM-DD>",
      "type": "ltcg_eligible" | "harvest_deadline" | "fy_end" | "loss_expiry",
      "stock": "<optional: ticker symbol>",
      "impact": "<what happens on this date>",
      "action": "<what user should consider>",
      "days_remaining": <number>
    }
  ],
  
  "scenarios": [
    {
      "name": "<scenario name>",
      "tax_liability": <total tax ₹>,
      "savings": <optional: ₹ saved vs baseline>,
      "transaction_costs": <optional: ₹ in transaction fees>,
      "net_benefit": <optional: savings minus costs>,
      "pros": ["<benefit 1>", "<benefit 2>"],
      "cons": ["<drawback 1>", "<drawback 2>"],
      "actions": ["<optional: step 1>", "<optional: step 2>"]
    }
  ],
  
  "recommended_scenario": <index of recommended scenario>,
  
  "urgent_actions": ["<time-sensitive opportunity 1>", "<opportunity 2>"],
  
  "strengths": ["<positive aspect 1>", "<positive aspect 2>"],
  
  "weaknesses": ["<area for improvement 1>", "<area for improvement 2>"]
}

## CRITICAL REQUIREMENTS

1. **potential_saving MUST be calculated using the formula above**
2. **potential_saving MUST be a NUMBER (not 0 unless truly no benefit)**
3. **ONLY generate insights for stocks that actually exist in the portfolio**
4. **Use EXACT stock tickers, prices, and quantities from the data**
5. **total_potential_savings = SUM of all positive potential_saving values, CAPPED at ₹${Math.round(savingsCalc.maxSavings)}**
6. **Each insight MUST reference specific stocks by ticker**
7. **Vary risk_level based on rebuy timing and urgency**
8. **Keep pros/cons under 10 words each**
9. **Keep action_items under 15 words each**
10. **Use analytical language, NOT investment advice**
11. **NEVER mention "30-day wash sale rule" - it doesn't exist in India**

## GENERATE INSIGHTS FOR:

### Priority Levels:
- **HIGH**: potential_saving > 2000 OR deadline < 30 days OR stock within 15 days of LTCG
- **MEDIUM**: 500 < potential_saving <= 2000 OR 30-60 days to deadline
- **LOW**: potential_saving <= 500 OR informational

### Risk Levels:
- **SAFE**: Wait 1-2 days OR switch stocks, not near LTCG threshold, >45 days to deadline
- **MODERATE**: Same day rebuy consideration OR 30-45 days to deadline
- **RISKY**: Very near LTCG threshold OR <30 days to deadline

### Generate 5-7 insights covering:
1. Tax-loss harvesting for stocks with losses (MOST IMPORTANT)
2. LTCG timing warnings for stocks 15 days before/after 365-day threshold
3. FY-end deadline urgency
4. Portfolio tax efficiency observations
5. Loss offset opportunities

2. **potential_saving MUST be a NUMBER (not 0 unless truly no benefit)**
3. **ONLY generate insights for stocks that actually exist in the portfolio**
4. **Use EXACT stock tickers, prices, and quantities from the data**
5. **total_potential_savings = SUM of all positive potential_saving values**
6. **Each insight MUST reference specific stocks by ticker**
7. **Vary risk_level based on wash sale risk and timing urgency**
8. **Keep pros/cons under 10 words each**
9. **Keep action_items under 15 words each**

## GENERATE INSIGHTS FOR:

### Priority Levels:
- **HIGH**: potential_saving > 2000 OR deadline < 30 days OR stock within 15 days of LTCG
- **MEDIUM**: 500 < potential_saving <= 2000 OR 30-60 days to deadline
- **LOW**: potential_saving <= 500 OR informational

### Risk Levels:
- **SAFE**: No wash sale concern, not near LTCG threshold, >45 days to deadline
- **MODERATE**: Some rebuy timing needed OR 30-45 days to deadline
- **RISKY**: Rebuy same stock OR <30 days to deadline OR ±15 days from LTCG threshold

### Generate 5-7 insights covering:
1. Tax-loss harvesting for stocks with losses (MOST IMPORTANT)
2. LTCG timing warnings for stocks 15 days before/after 365-day threshold
3. FY-end deadline urgency
4. Portfolio tax efficiency observations
5. Loss carryforward opportunities

RETURN ONLY THE JSON. NO MARKDOWN FORMATTING. NO EXPLANATIONS. JUST VALID JSON.`;
}

/**
 * Generate a realistic demo portfolio for testing
 * Use this if user has empty/small portfolio
 */
export function generateDemoPortfolio() {
  const today = new Date();
  
  return [
    {
      ticker: 'RELIANCE',
      quantity: 50,
      buyPrice: 2450,
      currentPrice: 2380,
      buyDate: new Date(today.getFullYear(), today.getMonth() - 8, 15).toISOString(),
      type: 'STCG'
    },
    {
      ticker: 'TCS',
      quantity: 30,
      buyPrice: 3200,
      currentPrice: 3450,
      buyDate: new Date(today.getFullYear() - 2, 3, 20).toISOString(),
      type: 'LTCG'
    },
    {
      ticker: 'INFY',
      quantity: 100,
      buyPrice: 1450,
      currentPrice: 1580,
      buyDate: new Date(today.getFullYear() - 1, 1, 10).toISOString(),
      type: 'LTCG'
    },
    {
      ticker: 'TATAMOTORS',
      quantity: 200,
      buyPrice: 650,
      currentPrice: 575,
      buyDate: new Date(today.getFullYear(), today.getMonth() - 6, 5).toISOString(),
      type: 'STCG'
    },
    {
      ticker: 'HDFCBANK',
      quantity: 40,
      buyPrice: 1680,
      currentPrice: 1720,
      buyDate: new Date(today.getFullYear() - 1, 6, 12).toISOString(),
      type: 'LTCG'
    },
    {
      ticker: 'WIPRO',
      quantity: 150,
      buyPrice: 420,
      currentPrice: 385,
      buyDate: new Date(today.getFullYear(), today.getMonth() - 4, 18).toISOString(),
      type: 'STCG'
    },
    {
      ticker: 'BHARTIARTL',
      quantity: 80,
      buyPrice: 850,
      currentPrice: 920,
      buyDate: new Date(today.getFullYear() - 1, 8, 25).toISOString(),
      type: 'LTCG'
    },
    {
      ticker: 'ASIANPAINT',
      quantity: 25,
      buyPrice: 3100,
      currentPrice: 2950,
      buyDate: new Date(today.getFullYear(), today.getMonth() - 10, 8).toISOString(),
      type: 'STCG'
    },
    {
      ticker: 'MARUTI',
      quantity: 15,
      buyPrice: 9500,
      currentPrice: 10200,
      buyDate: new Date(today.getFullYear() - 2, 10, 3).toISOString(),
      type: 'LTCG'
    },
    {
      ticker: 'SBIN',
      quantity: 300,
      buyPrice: 580,
      currentPrice: 625,
      buyDate: new Date(today.getFullYear() - 1, 4, 15).toISOString(),
      type: 'LTCG'
    }
  ];
}

/**
 * Fallback empty analysis if AI fails
 */
function getEmptyAnalysis(): AIAnalysisResult {
  return {
    health_score: 5,
    total_potential_savings: 0,
    insights: [],
    timeline_events: [],
    scenarios: [{
      name: "Current State",
      tax_liability: 0,
      pros: ["No changes needed"],
      cons: ["Unable to generate AI insights"]
    }],
    recommended_scenario: 0,
    urgent_actions: [],
    strengths: [],
    weaknesses: ["AI analysis temporarily unavailable"],
    generated_at: new Date().toISOString()
  };
}

/**
 * Helper to refresh analysis (call this when portfolio changes)
 */
export async function refreshAnalysis(
  stocks: any[],
  realizedGains: number
): Promise<AIAnalysisResult> {
  return generateTaxInsights(stocks, realizedGains, new Date());
}
