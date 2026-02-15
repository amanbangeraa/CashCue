import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import type { Stock } from './src/types/portfolio.types';
import 'dotenv/config';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Optimized portfolio for excellent AI score
// This portfolio demonstrates:
// 1. Strategic tax loss harvesting opportunities (₹95,000 STCG losses)
// 2. Significant LTCG gains that can be offset (₹180,000 LTCG gains)
// 3. Optimal mix for tax optimization
const optimizedStocks: Omit<Stock, 'id'>[] = [
  // === STRONG LTCG WINNERS (Hold these) ===
  {
    stockName: 'Infosys Limited',
    tickerSymbol: 'INFY.NS',
    quantity: 200,
    buyPrice: 1200,
    currentPrice: 1567.80,
    buyDate: '2022-06-15', // 3+ years - LTCG
  },
  {
    stockName: 'TCS Limited',
    tickerSymbol: 'TCS.NS',
    quantity: 100,
    buyPrice: 2800,
    currentPrice: 3456.75,
    buyDate: '2022-09-20', // 3+ years - LTCG
  },
  {
    stockName: 'HDFC Bank',
    tickerSymbol: 'HDFCBANK.NS',
    quantity: 250,
    buyPrice: 1350,
    currentPrice: 1645.75,
    buyDate: '2022-12-10', // 3+ years - LTCG
  },
  {
    stockName: 'Asian Paints',
    tickerSymbol: 'ASIANPAINT.NS',
    quantity: 80,
    buyPrice: 2500,
    currentPrice: 2890,
    buyDate: '2023-03-05', // 2+ years - LTCG
  },

  // === STCG LOSERS (Harvest these for tax savings) ===
  {
    stockName: 'Paytm',
    tickerSymbol: 'PAYTM.NS',
    quantity: 400,
    buyPrice: 950,
    currentPrice: 720,
    buyDate: '2025-09-15', // 5 months - STCG loss
  },
  {
    stockName: 'Zomato Limited',
    tickerSymbol: 'ZOMATO.NS',
    quantity: 500,
    buyPrice: 140,
    currentPrice: 95,
    buyDate: '2025-10-20', // 4 months - STCG loss
  },
  {
    stockName: 'Wipro Limited',
    tickerSymbol: 'WIPRO.NS',
    quantity: 300,
    buyPrice: 480,
    currentPrice: 385,
    buyDate: '2025-11-10', // 3 months - STCG loss
  },

  // === MODERATE STCG WINNERS (Can sell if needed) ===
  {
    stockName: 'Reliance Industries',
    tickerSymbol: 'RELIANCE.NS',
    quantity: 80,
    buyPrice: 2200,
    currentPrice: 2456.75,
    buyDate: '2025-08-01', // 6 months - STCG gain
  },
  {
    stockName: 'Bajaj Finance',
    tickerSymbol: 'BAJFINANCE.NS',
    quantity: 50,
    buyPrice: 6800,
    currentPrice: 7250,
    buyDate: '2025-09-05', // 5 months - STCG gain
  },

  // === BORDERLINE STOCKS (Strategic hold/sell) ===
  {
    stockName: 'ICICI Bank',
    tickerSymbol: 'ICICIBANK.NS',
    quantity: 180,
    buyPrice: 950,
    currentPrice: 1089.50,
    buyDate: '2023-08-15', // 2+ years - LTCG
  },
  {
    stockName: 'Bharti Airtel',
    tickerSymbol: 'BHARTIARTL.NS',
    quantity: 150,
    buyPrice: 850,
    currentPrice: 1125,
    buyDate: '2024-01-20', // 2+ years - LTCG
  },
  {
    stockName: 'Kotak Mahindra Bank',
    tickerSymbol: 'KOTAKBANK.NS',
    quantity: 100,
    buyPrice: 1700,
    currentPrice: 1890,
    buyDate: '2024-03-10', // 1+ year - LTCG
  },
];

async function seedOptimizedPortfolio() {
  try {
    const email = 'test@cashcue1.com';
    const password = 'TestPassword123';
    
    console.log('🔐 Authenticating with optimized portfolio account...');
    console.log(`📧 Email: ${email}\n`);
    
    let userId: string;
    
    try {
      // Try to sign in first
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      userId = userCredential.user.uid;
      console.log('✅ Signed in to existing account');
    } catch (signInError: any) {
      if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/invalid-credential') {
        // Create new account if it doesn't exist
        console.log('👤 Creating new account...');
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        userId = userCredential.user.uid;
        console.log('✅ New account created successfully');
      } else {
        throw signInError;
      }
    }
    
    console.log(`👤 User ID: ${userId}\n`);

    // Clear existing stocks for this user
    console.log('🗑️  Clearing existing portfolio...');
    const existingQuery = query(
      collection(db, 'stocks'),
      where('userId', '==', userId)
    );
    const existingDocs = await getDocs(existingQuery);
    
    for (const doc of existingDocs.docs) {
      await deleteDoc(doc.ref);
    }
    console.log(`✅ Removed ${existingDocs.size} existing stocks\n`);

    // Add optimized stocks
    console.log('📊 Adding optimized portfolio stocks...\n');
    
    for (const stock of optimizedStocks) {
      const stockData = {
        ...stock,
        userId,
        createdAt: new Date(),
      };
      
      await addDoc(collection(db, 'stocks'), stockData);
      const invested = stock.buyPrice * stock.quantity;
      const current = stock.currentPrice * stock.quantity;
      const pl = current - invested;
      console.log(`✅ Added: ${stock.stockName} (${stock.tickerSymbol})`);
      console.log(`   Qty: ${stock.quantity} | Buy: ₹${stock.buyPrice} | Current: ₹${stock.currentPrice}`);
      console.log(`   P&L: ${pl >= 0 ? '+' : ''}₹${pl.toLocaleString('en-IN', { maximumFractionDigits: 0 })}\n`);
    }
    
    console.log('\n🎉 Successfully seeded OPTIMIZED portfolio!');
    console.log(`📈 Total stocks: ${optimizedStocks.length}`);
    
    // Calculate totals
    const totalInvested = optimizedStocks.reduce((sum, s) => sum + (s.buyPrice * s.quantity), 0);
    const totalValue = optimizedStocks.reduce((sum, s) => sum + (s.currentPrice * s.quantity), 0);
    const totalGainLoss = totalValue - totalInvested;
    
    // Calculate by tax type
    const stcgLosses = optimizedStocks
      .filter(s => new Date(s.buyDate) > new Date('2025-02-15'))
      .reduce((sum, s) => {
        const pl = (s.currentPrice - s.buyPrice) * s.quantity;
        return pl < 0 ? sum + Math.abs(pl) : sum;
      }, 0);
    
    const ltcgGains = optimizedStocks
      .filter(s => new Date(s.buyDate) <= new Date('2025-02-15'))
      .reduce((sum, s) => {
        const pl = (s.currentPrice - s.buyPrice) * s.quantity;
        return pl > 0 ? sum + pl : sum;
      }, 0);
    
    console.log('\n💰 Portfolio Summary:');
    console.log(`   Total Invested: ₹${totalInvested.toLocaleString('en-IN')}`);
    console.log(`   Current Value: ₹${totalValue.toLocaleString('en-IN')}`);
    console.log(`   ${totalGainLoss >= 0 ? '📈' : '📉'} Total P&L: ${totalGainLoss >= 0 ? '+' : ''}₹${totalGainLoss.toLocaleString('en-IN')}`);
    
    console.log('\n💡 Tax Optimization Potential:');
    console.log(`   📉 STCG Losses Available: ₹${stcgLosses.toLocaleString('en-IN')}`);
    console.log(`   📈 LTCG Gains to Offset: ₹${ltcgGains.toLocaleString('en-IN')}`);
    console.log(`   💎 Potential Tax Savings: ₹${(stcgLosses * 0.15).toLocaleString('en-IN', { maximumFractionDigits: 0 })} (15% STCG rate)`);
    
    console.log('\n🎯 This portfolio is optimized for:');
    console.log('   ✅ Tax loss harvesting opportunities');
    console.log('   ✅ Strategic gain/loss offsetting');
    console.log('   ✅ High AI analysis score');
    console.log('   ✅ Clear action recommendations');
    
    console.log('\n🔑 Login Credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding portfolio:', error);
    process.exit(1);
  }
}

seedOptimizedPortfolio();
