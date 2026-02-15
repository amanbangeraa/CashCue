import { GoogleGenerativeAI } from "@google/generative-ai";

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

// Initialize Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

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
  
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    console.error('Gemini API key not found');
    return getEmptyAnalysis();
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro-latest",
      generationConfig: {
        temperature: 0.3,
      }
    });

    const prompt = buildAnalysisPrompt(stocks, realizedGains, currentDate);
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse JSON from response (gemini-pro doesn't guarantee JSON format)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI');
    }
    
    const analysis: AIAnalysisResult = JSON.parse(jsonMatch[0]);
    
    // Add metadata
    analysis.generated_at = new Date().toISOString();
    
    return analysis;
    
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return getEmptyAnalysis();
  }
}

/**
 * Build the comprehensive prompt for Gemini
 */
function buildAnalysisPrompt(
  stocks: any[],
  realizedGains: number,
  currentDate: Date
): string {
  const currentDateStr = currentDate.toISOString().split('T')[0];
  const fyEndDate = new Date(currentDate.getFullYear(), 2, 31); // March 31
  const daysToFYEnd = Math.ceil((fyEndDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

  // Calculate portfolio stats
  const totalStocks = stocks.length;
  const totalValue = stocks.reduce((sum, s) => sum + (s.currentPrice * s.quantity), 0);
  const totalGains = stocks.reduce((sum, s) => {
    const gain = (s.currentPrice - s.buyPrice) * s.quantity;
    return sum + (gain > 0 ? gain : 0);
  }, 0);
  const totalLosses = stocks.reduce((sum, s) => {
    const gain = (s.currentPrice - s.buyPrice) * s.quantity;
    return sum + (gain < 0 ? Math.abs(gain) : 0);
  }, 0);

  return `You are an expert Indian tax advisor specializing in equity portfolio optimization.

## CURRENT CONTEXT
- Date: ${currentDateStr}
- Financial Year: FY 2024-25 (ends March 31, 2025)
- Days until FY end: ${daysToFYEnd}
- User has already realized gains this FY: ₹${realizedGains.toLocaleString('en-IN')}

## USER'S PORTFOLIO
Total Stocks: ${totalStocks}
Portfolio Value: ₹${totalValue.toLocaleString('en-IN')}
Unrealized Gains: ₹${totalGains.toLocaleString('en-IN')}
Unrealized Losses: ₹${totalLosses.toLocaleString('en-IN')}

Detailed Holdings:
${JSON.stringify(stocks, null, 2)}

## INDIAN TAX RULES (CRITICAL - MUST FOLLOW EXACTLY)
1. **Short-Term Capital Gains (STCG)**: Holding period < 12 months
   - Tax Rate: 20% on gains
   - STCG losses can offset BOTH STCG and LTCG gains

2. **Long-Term Capital Gains (LTCG)**: Holding period ≥ 12 months
   - Tax Rate: 12.5% on gains above ₹1,25,000 exemption
   - LTCG losses can ONLY offset LTCG gains

3. **Transaction Costs** (must deduct from savings):
   - STT (Securities Transaction Tax): 0.1% of transaction value
   - Brokerage: ₹20 per order (flat)
   - GST on brokerage: 18% (₹3.60 per order)
   - Total per transaction: ~₹24 + 0.1% of value

4. **Wash Sale Considerations**:
   - India has no formal wash sale rule, but CBDT Circular 6/2016 addresses sham transactions
   - Recommend 30-day gap before rebuy of same stock
   - Safer: Switch to similar stock in same sector

5. **Loss Carryforward**:
   - Unadjusted losses can be carried forward for 8 years
   - Must file ITR to claim carryforward
   - Losses expire if not utilized within 8 years

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

## ANALYSIS GUIDELINES
1. **Be Specific**: Use exact stock names, quantities, and rupee amounts
2. **Calculate Accurately**: 
   - For each harvesting opportunity, calculate: (loss amount × 0.20 for STCG or 0.125 for LTCG) - transaction costs
   - Transaction cost formula: ₹24 + (sale value × 0.001)
3. **Prioritize by Impact**: High priority = saves >₹5,000 OR deadline <30 days
4. **Consider Timing**: 
   - Warn if stock is within 30 days of becoming LTCG-eligible (tax rate drops)
   - Flag if close to FY end deadline
5. **Risk Assessment**:
   - Safe: Well-established strategy, low wash sale risk
   - Moderate: Requires rebuy timing or sector switch
   - Risky: Close to deadlines, potential for price movement
6. **Scenarios**: Always include at least 3 scenarios:
   - "Do Nothing" (baseline)
   - "Maximum Tax Savings" (harvest all losses)
   - "Balanced Approach" (your recommendation)

## GENERATE 5-7 INSIGHTS covering:
- Tax-loss harvesting opportunities (most important)
- Timing warnings (stocks close to LTCG threshold)
- Deadline urgency (days until March 31)
- Portfolio diversification from tax perspective
- Loss carryforward opportunities

Return ONLY valid JSON, no markdown formatting.`;
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
