import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
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

// Demo stocks data
const demoStocks: Omit<Stock, 'id'>[] = [
  // WINNERS (Total gains: ₹97,400)
  {
    stockName: 'Infosys Limited',
    tickerSymbol: 'INFY.NS',
    quantity: 100,
    buyPrice: 1400,
    currentPrice: 1567.80,
    buyDate: '2023-01-15', // LTCG
  },
  {
    stockName: 'Reliance Industries',
    tickerSymbol: 'RELIANCE.NS',
    quantity: 50,
    buyPrice: 2200,
    currentPrice: 2456.75,
    buyDate: '2025-08-01', // STCG
  },
  {
    stockName: 'TCS Limited',
    tickerSymbol: 'TCS.NS',
    quantity: 80,
    buyPrice: 3100,
    currentPrice: 3456.75,
    buyDate: '2023-03-20', // LTCG
  },
  {
    stockName: 'HDFC Bank',
    tickerSymbol: 'HDFCBANK.NS',
    quantity: 150,
    buyPrice: 1500,
    currentPrice: 1645.75,
    buyDate: '2024-05-10', // LTCG
  },
  {
    stockName: 'ICICI Bank',
    tickerSymbol: 'ICICIBANK.NS',
    quantity: 120,
    buyPrice: 900,
    currentPrice: 1089.50,
    buyDate: '2023-07-05', // LTCG
  },
  
  // LOSERS (Total losses: ₹88,000)
  {
    stockName: 'Wipro Limited',
    tickerSymbol: 'WIPRO.NS',
    quantity: 200,
    buyPrice: 450,
    currentPrice: 385,
    buyDate: '2025-10-15', // STCG
  },
  {
    stockName: 'Paytm',
    tickerSymbol: 'PAYTM.NS',
    quantity: 300,
    buyPrice: 880,
    currentPrice: 720,
    buyDate: '2025-11-01', // STCG
  },
  {
    stockName: 'Zomato Limited',
    tickerSymbol: 'ZOMATO.NS',
    quantity: 400,
    buyPrice: 125,
    currentPrice: 95,
    buyDate: '2025-12-05', // STCG
  },
  {
    stockName: 'Tech Mahindra',
    tickerSymbol: 'TECHM.NS',
    quantity: 100,
    buyPrice: 1200,
    currentPrice: 1050,
    buyDate: '2024-06-20', // LTCG
  },
];

async function seedPortfolio() {
  try {
    console.log('🔐 Authenticating...');
    
    // You can either:
    // 1. Sign in with an existing user
    // 2. Or manually set the userId below
    
    const email = process.argv[2];
    const password = process.argv[3];
    
    if (!email || !password) {
      console.error('❌ Usage: npm run seed-portfolio <email> <password>');
      console.log('\nExample: npm run seed-portfolio user@example.com mypassword');
      process.exit(1);
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;
    
    console.log(`✅ Authenticated as: ${email}`);
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

    // Add demo stocks
    console.log('📊 Adding demo portfolio stocks...\n');
    
    for (const stock of demoStocks) {
      const stockData = {
        ...stock,
        userId,
        createdAt: new Date(),
      };
      
      const docRef = await addDoc(collection(db, 'stocks'), stockData);
      console.log(`✅ Added: ${stock.stockName} (${stock.tickerSymbol})`);
      console.log(`   Qty: ${stock.quantity} | Buy: ₹${stock.buyPrice} | Current: ₹${stock.currentPrice}`);
    }
    
    console.log('\n🎉 Successfully seeded portfolio with demo data!');
    console.log(`📈 Total stocks: ${demoStocks.length}`);
    
    // Calculate totals
    const totalInvested = demoStocks.reduce((sum, s) => sum + (s.buyPrice * s.quantity), 0);
    const totalValue = demoStocks.reduce((sum, s) => sum + (s.currentPrice * s.quantity), 0);
    const totalGainLoss = totalValue - totalInvested;
    
    console.log(`💰 Total Invested: ₹${totalInvested.toLocaleString('en-IN')}`);
    console.log(`💎 Current Value: ₹${totalValue.toLocaleString('en-IN')}`);
    console.log(`${totalGainLoss >= 0 ? '📈' : '📉'} Total P&L: ${totalGainLoss >= 0 ? '+' : ''}₹${totalGainLoss.toLocaleString('en-IN')}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding portfolio:', error);
    process.exit(1);
  }
}

seedPortfolio();
