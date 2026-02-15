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
          content: "You are an expert Indian tax advisor specializing in equity portfolio optimization. You MUST respond with ONLY valid JSON, no markdown formatting or explanations."
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
    
    // POST-PROCESS: Ensure risk levels are varied
    const riskCounts = {
      safe: 0,
      moderate: 0,
      risky: 0
    };
    
    analysis.insights.forEach(insight => {
      riskCounts[insight.risk_level]++;
    });
    
    // If ALL insights are same risk level, log warning
    if (riskCounts.safe === analysis.insights.length ||
        riskCounts.moderate === analysis.insights.length ||
        riskCounts.risky === analysis.insights.length) {
      console.warn('⚠️ AI returned uniform risk levels. Consider prompt adjustment.');
    }
    
    // Debug logging
    console.log('🤖 AI ANALYSIS DEBUG:');
    console.log('Health Score:', analysis.health_score);
    console.log('Total Savings:', analysis.total_potential_savings);
    console.log('Insights:', analysis.insights.length);
    analysis.insights.forEach((insight, i) => {
      console.log(`  ${i+1}. ${insight.title}`);
      console.log(`     Saving: ₹${insight.potential_saving}`);
      console.log(`     Risk: ${insight.risk_level}`);
    });
    
    return analysis;
    
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return getEmptyAnalysis();
  }
}

/**
 * Build the comprehensive prompt for Groq/Llama
 */
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

  return `You are an expert Indian tax advisor specializing in equity portfolio optimization.

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
Stock: AAPL, Loss: ₹15,000, Holding: 280 days (STCG), Sell value: ₹50,000
- Gross tax saving: ₹15,000 × 0.20 = ₹3,000
- Transaction cost: ₹23.6 + (₹50,000 × 0.001) = ₹73.6
- NET SAVING (potential_saving): ₹3,000 - ₹73.6 = ₹2,926.4
- Round to: ₹2,926

## CALCULATION FORMULAS YOU MUST USE

### For Tax-Loss Harvesting:

For each stock with loss (gainLoss < 0):

1. Determine tax rate:
   - If holdingDays < 365: tax_rate = 0.20 (STCG)
   - If holdingDays >= 365: tax_rate = 0.125 (LTCG)

2. Calculate gross tax saving:
   gross_saving = abs(gainLoss) * tax_rate

3. Calculate transaction costs:
   sell_value = currentPrice * quantity
   transaction_cost = 23.6 + (sell_value * 0.001)

4. Calculate NET saving:
   potential_saving = gross_saving - transaction_cost

5. Only include if potential_saving > 0


### For Timing Warnings:

For stocks approaching LTCG threshold:
- If 350 <= holdingDays < 365:
  - Priority: HIGH
  - Warning: "Wait {365 - holdingDays} days for LTCG benefit"
  - Impact: Tax rate drops from 20% to 12.5%


### For Current Tax Liability:

If user has realized gains:
  tax_on_gains = realizedGains * 0.20 (assuming STCG for simplicity)
  
If user harvests losses:
  new_taxable_gains = realizedGains - harvested_losses
  new_tax = new_taxable_gains * 0.20
  tax_saved = tax_on_gains - new_tax


## YOUR TASK
Analyze this portfolio and generate a comprehensive JSON response with the following structure:

{
  "health_score": <number 1-10, based on tax efficiency>,
  "total_potential_savings": <total ₹ that can be saved through all optimizations>,
  
  "insights": [
    {
      "priority": "high" | "medium" | "low",
      "title": "<catchy, specific title>",
      "description": "<detailed explanation with exact numbers>",
      "potential_saving": <₹ amount after transaction costs>,
      "action_items": ["<specific action 1>", "<specific action 2>"],
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
      "action": "<what user should do>",
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
  
  "recommended_scenario": <index of recommended scenario in scenarios array>,
  
  "urgent_actions": ["<action 1>", "<action 2>", "<action 3>"],
  
  "strengths": ["<positive aspect 1>", "<positive aspect 2>"],
  
  "weaknesses": ["<area for improvement 1>", "<area for improvement 2>"]
}

## HEALTH SCORE CALCULATION (0-10 scale)

Calculate health_score using this formula:

health_score = base_score - deductions + bonuses

Where:
- base_score = 10
- Deduct 1.0 point for every ₹10,000 in unharvested losses (max -3 points)
- Deduct 0.5 points for each stock within 15 days of LTCG threshold (max -2 points)
- Deduct 1.0 point if FY end is <30 days away and losses exist (max -1 point)
- Deduct 0.5 points if realized gains exist but no harvesting done (max -1 point)
- Add 0.5 points if portfolio is well-diversified (>8 stocks) (max +1 point)
- Add 0.5 points if >60% holdings are LTCG (lower tax rate) (max +1 point)

Minimum score: 3.0
Maximum score: 10.0

## CRITICAL REQUIREMENTS

1. **potential_saving MUST be calculated using the formula above**
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
