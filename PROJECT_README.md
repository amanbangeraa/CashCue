# TaxSaver Portfolio Tracker

**Your portfolio has hidden tax savings. Here's how to unlock them.**

A smart tax-loss harvesting tool designed for Indian salaried employees to optimize their capital gains tax liability through intelligent portfolio analysis.

## 🎯 The Hook

This isn't just another portfolio tracker. **TaxSaver Portfolio Tracker** identifies TAX OPTIMIZATION OPPORTUNITIES through intelligent loss harvesting analysis, potentially saving you thousands of rupees in capital gains tax.

## ✨ Key Features

### 1. 📊 Portfolio Management
- **Manual Entry**: Add stocks with ticker, quantity, buy price, and purchase date
- **CSV Upload**: Bulk import your portfolio (format: ticker, quantity, buy_price, buy_date)
- **Real-time Tracking**: View all holdings with live gains/losses
- **Tax Classification**: Automatic STCG (< 12 months) vs LTCG (≥ 12 months) categorization
- **Pre-loaded Demo**: Instant testing with realistic demo data

### 2. 💰 Tax Calculation Engine
Smart calculation following Indian tax rules:

**STCG (Short Term Capital Gains)**
- Holdings < 12 months
- Tax rate: 20% on gains
- Losses can offset both STCG and LTCG gains

**LTCG (Long Term Capital Gains)**
- Holdings ≥ 12 months
- Tax rate: 12.5% on gains exceeding ₹1.25 lakh
- Losses can only offset LTCG gains

### 3. 🎯 Tax Loss Harvesting (THE KILLER FEATURE)
- **Smart Recommendations**: Identify which stocks to sell for maximum tax savings
- **Before/After Analysis**: Visual comparison of tax liability
- **Actionable Plan**: Step-by-step instructions for each stock
- **Rebuy Suggestions**: Maintain your positions while saving on taxes
- **Real Savings**: Demo portfolio shows potential tax savings

### 4. 📈 Visual Analytics
- Interactive charts showing gains vs losses
- Tax breakdown (STCG vs LTCG)
- Before/After tax liability comparison
- Monthly spending trends (expense feature)

### 5. 💵 Minimal Expense Tracking
Simple cash flow monitoring:
- Quick expense entry by category
- Monthly spending overview
- Last 3 months trend chart

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the app in action!

### Build for Production

```bash
npm run build
npm run preview
```

## 🎨 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **State**: React Context API
- **Storage**: localStorage

## 🧮 Tax Calculation Logic

The app implements Indian equity tax rules:

### Loss Offsetting Rules
1. STCG losses can offset STCG gains
2. STCG losses can offset LTCG gains
3. LTCG losses can offset LTCG gains
4. **LTCG losses CANNOT offset STCG gains** ⚠️

### Tax Rates
- **STCG**: 20% flat on net gains
- **LTCG**: 12.5% on (net gains - ₹1,25,000)

## 🎯 Hackathon Demo Script

### Opening (15 seconds)
"Most Indian investors don't realize they're sitting on hidden tax savings. Our demo portfolio shows significant potential tax savings through smart loss harvesting. Let me show you how."

### Feature Demo (2 minutes)
1. **Dashboard** (20s): "Here's the hook—immediate visibility into tax savings opportunity"
2. **Portfolio View** (30s): "Real-time tracking with automatic STCG/LTCG classification"
3. **Tax Analysis** (60s): "THE killer feature—personalized harvesting recommendations with before/after comparison"
4. **Expense Tracking** (10s): "Bonus: simple expense tracking for complete financial picture"

### Closing (15 seconds)
"Tax-smart investing isn't just for the wealthy. We're democratizing tax optimization for every Indian investor."

## 🔮 Future Enhancements

- Integration with live stock price APIs
- User authentication and cloud storage
- Multiple portfolio support
- Tax report generation (ITR-2 ready)
- Automated rebalancing suggestions
- Tax calendar with important dates

## ⚠️ Disclaimer

This is an educational tool. Tax loss harvesting involves selling securities at a loss to offset capital gains. Always consult with a qualified tax advisor or financial planner before making investment decisions.

---

**Made for hackathons. Optimized for demos. Built for impact.**
