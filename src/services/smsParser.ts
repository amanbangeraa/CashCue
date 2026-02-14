// SMS Parser for automatic expense detection from payment notifications

export interface ParsedTransaction {
  amount: number;
  merchant?: string;
  category?: string;
  date: string;
  transactionType: 'debit' | 'credit';
  paymentMethod?: 'UPI' | 'Card' | 'NetBanking' | 'Wallet';
  reference?: string;
}

// Common bank SMS patterns
const SMS_PATTERNS = {
  // UPI patterns
  upi: [
    /(?:paid|sent|debited).*?(?:rs\.?|inr|₹)\s*(\d+(?:,\d+)*(?:\.\d{2})?)\s*(?:to|via)\s*([^\s]+)/i,
    /(?:rs\.?|inr|₹)\s*(\d+(?:,\d+)*(?:\.\d{2})?)\s*(?:debited|paid|sent).*?(?:to|via)\s*([^\s]+)/i,
    /upi.*?(?:rs\.?|inr|₹)\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
  ],
  
  // Card transaction patterns
  card: [
    /(?:rs\.?|inr|₹)\s*(\d+(?:,\d+)*(?:\.\d{2})?)\s*(?:spent|debited|used).*?(?:at|on)\s*([^\s]+)/i,
    /(?:spent|debited|used).*?(?:rs\.?|inr|₹)\s*(\d+(?:,\d+)*(?:\.\d{2})?)\s*(?:at|on)\s*([^\s]+)/i,
  ],
  
  // Generic debit patterns
  debit: [
    /(?:debited|withdrawn).*?(?:rs\.?|inr|₹)\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
    /(?:rs\.?|inr|₹)\s*(\d+(?:,\d+)*(?:\.\d{2})?)\s*(?:debited|withdrawn)/i,
  ],
  
  // Credit patterns
  credit: [
    /(?:credited|received).*?(?:rs\.?|inr|₹)\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
    /(?:rs\.?|inr|₹)\s*(\d+(?:,\d+)*(?:\.\d{2})?)\s*(?:credited|received)/i,
  ],
};

// Merchant to category mapping
const MERCHANT_CATEGORY_MAP: Record<string, string> = {
  // Food & Dining
  'swiggy': 'Food',
  'zomato': 'Food',
  'dominos': 'Food',
  'mcdonalds': 'Food',
  'kfc': 'Food',
  'subway': 'Food',
  'starbucks': 'Food',
  'cafe': 'Food',
  'restaurant': 'Food',
  
  // Transport
  'uber': 'Transport',
  'ola': 'Transport',
  'rapido': 'Transport',
  'metro': 'Transport',
  'irctc': 'Transport',
  'petrol': 'Transport',
  'fuel': 'Transport',
  
  // Shopping
  'amazon': 'Shopping',
  'flipkart': 'Shopping',
  'myntra': 'Shopping',
  'ajio': 'Shopping',
  'meesho': 'Shopping',
  'mall': 'Shopping',
  'store': 'Shopping',
  
  // Bills & Utilities
  'electricity': 'Bills',
  'water': 'Bills',
  'gas': 'Bills',
  'recharge': 'Bills',
  'airtel': 'Bills',
  'jio': 'Bills',
  'vodafone': 'Bills',
  'bsnl': 'Bills',
  
  // Entertainment
  'netflix': 'Entertainment',
  'prime': 'Entertainment',
  'hotstar': 'Entertainment',
  'spotify': 'Entertainment',
  'youtube': 'Entertainment',
  'bookmyshow': 'Entertainment',
  'pvr': 'Entertainment',
  'inox': 'Entertainment',
  'movie': 'Entertainment',
};

export function parseSMS(smsBody: string, sender: string): ParsedTransaction | null {
  const smsLower = smsBody.toLowerCase();
  
  // Check if it's a bank/payment SMS
  if (!isPaymentSMS(sender, smsBody)) {
    return null;
  }
  
  let amount: number | null = null;
  let merchant: string | undefined;
  let transactionType: 'debit' | 'credit' = 'debit';
  let paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'Wallet' | undefined;
  
  // Determine transaction type
  if (smsLower.includes('credit') || smsLower.includes('received')) {
    transactionType = 'credit';
  }
  
  // Determine payment method
  if (smsLower.includes('upi') || smsLower.includes('paytm') || smsLower.includes('phonepe') || smsLower.includes('gpay')) {
    paymentMethod = 'UPI';
  } else if (smsLower.includes('card') || smsLower.includes('visa') || smsLower.includes('mastercard')) {
    paymentMethod = 'Card';
  } else if (smsLower.includes('wallet')) {
    paymentMethod = 'Wallet';
  }
  
  // Try to parse amount and merchant
  if (transactionType === 'debit') {
    // Try UPI patterns first
    for (const pattern of SMS_PATTERNS.upi) {
      const match = smsBody.match(pattern);
      if (match) {
        amount = parseAmount(match[1]);
        merchant = match[2]?.trim();
        paymentMethod = 'UPI';
        break;
      }
    }
    
    // Try card patterns
    if (!amount) {
      for (const pattern of SMS_PATTERNS.card) {
        const match = smsBody.match(pattern);
        if (match) {
          amount = parseAmount(match[1]);
          merchant = match[2]?.trim();
          paymentMethod = 'Card';
          break;
        }
      }
    }
    
    // Try generic debit patterns
    if (!amount) {
      for (const pattern of SMS_PATTERNS.debit) {
        const match = smsBody.match(pattern);
        if (match) {
          amount = parseAmount(match[1]);
          break;
        }
      }
    }
  } else {
    // Parse credit transactions
    for (const pattern of SMS_PATTERNS.credit) {
      const match = smsBody.match(pattern);
      if (match) {
        amount = parseAmount(match[1]);
        break;
      }
    }
  }
  
  if (!amount || amount <= 0) {
    return null;
  }
  
  // Determine category from merchant
  const category = merchant ? getCategoryFromMerchant(merchant) : undefined;
  
  // Extract reference number if available
  const refMatch = smsBody.match(/(?:ref|txn|utr|rrn)[\s:]*([a-z0-9]+)/i);
  const reference = refMatch?.[1];
  
  return {
    amount,
    merchant,
    category,
    date: new Date().toISOString().split('T')[0],
    transactionType,
    paymentMethod,
    reference,
  };
}

function isPaymentSMS(sender: string, body: string): boolean {
  const senderLower = sender.toLowerCase();
  const bodyLower = body.toLowerCase();
  
  // Common bank/payment sender IDs
  const paymentSenders = [
    'paytm', 'phonepe', 'gpay', 'googlepay', 'amazonpay',
    'sbi', 'hdfc', 'icici', 'axis', 'kotak', 'pnb', 'bob',
    'upi', 'imps', 'neft', 'rtgs'
  ];
  
  // Check sender
  if (paymentSenders.some(s => senderLower.includes(s))) {
    return true;
  }
  
  // Check body for payment keywords
  const paymentKeywords = [
    'debited', 'credited', 'paid', 'sent', 'received',
    'upi', 'transaction', 'payment', 'spent', 'withdrawn'
  ];
  
  return paymentKeywords.some(keyword => bodyLower.includes(keyword)) &&
         (bodyLower.includes('rs') || bodyLower.includes('inr') || bodyLower.includes('₹'));
}

function parseAmount(amountStr: string): number {
  // Remove commas and parse
  const cleaned = amountStr.replace(/,/g, '');
  return parseFloat(cleaned);
}

function getCategoryFromMerchant(merchant: string): string {
  const merchantLower = merchant.toLowerCase();
  
  for (const [keyword, category] of Object.entries(MERCHANT_CATEGORY_MAP)) {
    if (merchantLower.includes(keyword)) {
      return category;
    }
  }
  
  return 'Other';
}

// Test function to validate SMS parsing
export function testSMSParser() {
  const testMessages = [
    "Rs 500.00 debited from A/c XX1234 on 15-02-24 to VPA swiggy@paytm UPI Ref 405678901234",
    "Your A/c XX5678 debited with Rs.1,250.50 on 15-Feb-24 for UPI/phonepe/9876543210/zomato",
    "Rs 350 spent on your HDFC Card XX9012 at DOMINOS PIZZA on 15-02-2024",
    "INR 2500.00 credited to A/c XX3456 on 15-02-24 from SALARY",
    "You have paid Rs.150.00 to Uber India via Google Pay UPI",
  ];
  
  console.log('Testing SMS Parser:');
  testMessages.forEach((msg, i) => {
    const result = parseSMS(msg, 'HDFC');
    console.log(`\nTest ${i + 1}:`, msg);
    console.log('Parsed:', result);
  });
}
