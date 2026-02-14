# 🚀 Quick Start Guide - TaxSaver Portfolio Tracker

## Current Status: ✅ RUNNING
**URL**: http://localhost:5173/

---

## 📋 Quick Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Install dependencies (if needed)
npm install
```

---

## 🎯 Demo Flow (3 minutes)

### 1. Open Dashboard (15 sec)
- Show hero with tax savings number
- Point to 4 stat cards
- Click "Analyze My Portfolio for Tax Savings"

### 2. Tax Analysis Page ⭐ (90 sec)
**This is your killer feature!**
- Before card: "Current Tax Liability: ₹3,500"
- After card: "After Harvesting: ₹0"
- Big savings number: "YOU SAVE: ₹3,500"
- Scroll down to harvest plan
- Show individual stock recommendations
- Point out: "Sell Wipro, save ₹2,600"
- Mention rebuy suggestion

### 3. Portfolio Page (30 sec)
- Show table with 9 stocks
- Point to green rows (gains) and red rows (losses)
- Show STCG/LTCG badges
- Demo filters (Gainers, Losers, STCG, LTCG)

### 4. Expenses (15 sec)
- "Bonus: track expenses for complete picture"
- Show monthly chart
- "Back to the main value—tax savings"

---

## 💡 Key Talking Points

### Problem
"Indian investors lose thousands in unnecessary tax because they don't know about tax loss harvesting"

### Solution
"Automated analysis that shows exactly which stocks to sell and how much you'll save"

### Innovation
"First tool to make tax loss harvesting accessible to regular Indian investors, not just HNIs with CAs"

### Impact
"Demo portfolio shows ₹3,500 savings. Scale to millions of Indian investors = crores saved"

---

## 📊 Demo Data Quick Ref

**Portfolio:**
- 9 stocks total
- 5 winners, 4 losers
- Total invested: ~₹6L
- Current value: ~₹6.1L
- Tax savings opportunity: ₹3,500

**Key Losers (for harvesting):**
- Paytm: -₹48,000 (STCG) → saves ₹9,600
- Wipro: -₹13,000 (STCG) → saves ₹2,600
- Zomato: -₹12,000 (STCG) → saves ₹2,400
- Tech Mahindra: -₹15,000 (LTCG) → saves ₹1,875

---

## 🎨 Visual Elements to Highlight

1. **Hero Section**: Large, bold tax savings number
2. **Before/After Cards**: Visual transformation with arrow
3. **Color Coding**: Green = good, Red = loss/tax, Blue = neutral
4. **STCG/LTCG Badges**: Automatic classification
5. **Charts**: Interactive, professional Recharts
6. **Harvest Plan**: Step-by-step instructions

---

## 🔥 Unique Selling Points

1. **Quantified Value**: Shows exact ₹ savings, not just %
2. **Actionable**: Tells you exactly what to do
3. **Indian-Specific**: Implements actual STCG/LTCG rules
4. **Educational**: Explains complex tax rules simply
5. **Complete Solution**: Entry + Analysis in one place
6. **Production-Ready**: Professional UI, not a prototype

---

## ⚡ Quick Fixes (if needed)

### If dev server is down:
```bash
npm run dev
```

### If port 5173 is busy:
```bash
# Vite will auto-assign next available port
```

### If charts don't show:
- Refresh page (F5)
- Check browser console for errors

### If demo data is missing:
- Click "Load Demo Data" in Portfolio page
- Or clear localStorage and refresh

---

## 🎤 30-Second Pitch

"Most Indian investors don't realize they're sitting on hidden tax savings. TaxSaver Portfolio Tracker analyzes your holdings and shows exactly which stocks to sell to minimize capital gains tax. Our demo portfolio reveals ₹3,500 in savings through smart tax loss harvesting—completely automated, completely accurate. Tax-smart investing isn't just for the wealthy anymore."

---

## 📱 Page Shortcuts

- **Dashboard**: Main hero, stat cards, quick links
- **Portfolio**: Stock table, add/manage holdings
- **Tax Analysis**: ⭐ THE KILLER FEATURE - Harvest recommendations
- **Expenses**: Minimal expense tracking

---

## 🎯 Judge Questions - Prepared Answers

**Q: How do you get stock prices?**
A: Currently hardcoded for demo. Production would integrate Alpha Vantage or Yahoo Finance API.

**Q: What about wash sale rules?**
A: Great question! India doesn't have wash sale rules yet, so you can rebuy immediately. When implemented, we'll add a checker.

**Q: Why not just show percentage?**
A: Psychology! ₹3,500 saved is more tangible than "0.5% optimization". We show both.

**Q: How do you handle multiple portfolios?**
A: Current version is single portfolio. V2 would add multi-portfolio support with cloud storage.

**Q: Is the tax calculation accurate?**
A: Yes! Implements actual STCG (20%) and LTCG (12.5% above ₹1.25L) rules with proper loss offsetting.

---

## ✅ Pre-Demo Checklist

- [ ] Dev server running (http://localhost:5173/)
- [ ] Browser window open and ready
- [ ] Demo data loaded (should be automatic)
- [ ] Practiced demo flow (3 min)
- [ ] Know your key talking points
- [ ] Prepared for judge questions
- [ ] Confident smile 😊

---

## 🎊 YOU'RE READY!

**Time to shine! Go win that hackathon!** 🏆

---

**Last Updated**: February 14, 2026  
**Status**: Production Ready  
**Version**: 1.0.0  
**Made with ❤️ for Indian Investors**
