# Automatic Expense Tracking via Phone Payments

## Overview
The system automatically tracks expenses when you make payments via your phone by reading payment SMS notifications from banks and payment apps.

## How It Works

### 1. SMS Detection
- Monitors incoming SMS messages from banks and payment apps
- Identifies payment notifications using smart pattern matching
- Extracts transaction details (amount, merchant, payment method)

### 2. Supported Payment Methods
- **UPI**: Google Pay, PhonePe, Paytm, Amazon Pay
- **Cards**: Debit/Credit card transactions
- **Net Banking**: Bank transfers
- **Wallets**: Digital wallet payments

### 3. Supported Banks & Apps
- All major Indian banks (HDFC, SBI, ICICI, Axis, Kotak, etc.)
- UPI apps (GPay, PhonePe, Paytm)
- Payment gateways

## Features

### Intelligent Parsing
- Extracts amount, merchant name, and transaction reference
- Auto-categorizes expenses based on merchant
- Detects payment method (UPI, Card, etc.)

### Smart Categorization
Automatically assigns categories based on merchant:
- **Food**: Swiggy, Zomato, restaurants
- **Transport**: Uber, Ola, fuel stations
- **Shopping**: Amazon, Flipkart, Myntra
- **Bills**: Electricity, recharge, utilities
- **Entertainment**: Netflix, movie tickets

### Confirmation Mode
- Review transactions before adding
- Accept or reject auto-detected expenses
- Edit category or amount if needed

### Auto Mode
- Instantly add expenses without confirmation
- Set minimum amount threshold
- Exclude specific categories

## Setup Instructions

### Step 1: Enable Auto-Tracking
1. Go to Expenses page
2. Click "Auto-Track Setup" button
3. Toggle "Enable Auto-Tracking" ON

### Step 2: Configure Settings
- **Minimum Amount**: Only track transactions above this amount (default: ₹10)
- **Require Confirmation**: Review before adding (recommended: ON)

### Step 3: Grant Permissions
- SMS read permission required
- Data stays private and local
- Only payment SMS are processed

## SMS Simulator (Demo Mode)

For testing without actual SMS:
1. Click "Show SMS Simulator"
2. Select a sample message or paste your own
3. Click "Simulate SMS Received"
4. Review the parsed transaction

### Sample SMS Formats

**UPI Transaction:**
```
Rs 500.00 debited from A/c XX1234 on 15-02-24 to VPA swiggy@paytm UPI Ref 405678901234
```

**Card Transaction:**
```
Rs 350 spent on your HDFC Card XX9012 at DOMINOS PIZZA on 15-02-2024
```

**Generic Debit:**
```
Your A/c XX5678 debited with Rs.1,250.50 on 15-Feb-24 for UPI/phonepe/zomato
```

## Privacy & Security

### Data Protection
- SMS data processed locally on your device
- No SMS content sent to external servers
- Only transaction details stored in database

### Permissions
- SMS read permission used only for payment detection
- Can be revoked anytime from settings
- No access to personal messages

### What We Don't Track
- Credit/refund transactions (only debits)
- Transactions below minimum amount
- Non-payment SMS
- Personal messages

## Integration with Budget

Auto-tracked expenses:
- Automatically update daily budget calculations
- Count towards monthly spending
- Trigger budget alerts if overspending
- Show in expense reports and charts

## Troubleshooting

### Transaction Not Detected
- Check if SMS is from recognized bank/payment app
- Verify SMS contains amount and payment keywords
- Check minimum amount threshold
- Ensure auto-tracking is enabled

### Wrong Category Assigned
- Manually edit the expense after confirmation
- Category learning improves over time
- Add custom merchant mappings

### Duplicate Entries
- System checks for duplicate reference numbers
- Manual entries won't duplicate auto-tracked ones
- Review pending transactions before confirming

## Future Enhancements

### Planned Features
- Bank statement integration
- Receipt scanning via camera
- Voice-based expense entry
- Recurring payment detection
- Split payment tracking
- Multi-currency support

### AI Improvements
- Better merchant recognition
- Context-aware categorization
- Spending pattern analysis
- Anomaly detection

## Technical Details

### SMS Pattern Matching
Uses regex patterns to identify:
- Amount (₹, Rs, INR formats)
- Merchant names
- Transaction references
- Payment methods
- Date and time

### Category Mapping
Merchant keywords mapped to categories:
```typescript
{
  'swiggy': 'Food',
  'uber': 'Transport',
  'amazon': 'Shopping',
  'netflix': 'Entertainment',
  'electricity': 'Bills'
}
```

### Transaction Structure
```typescript
{
  amount: number,
  merchant: string,
  category: string,
  date: string,
  transactionType: 'debit' | 'credit',
  paymentMethod: 'UPI' | 'Card' | 'NetBanking',
  reference: string
}
```

## Support

For issues or questions:
- Check SMS format matches expected patterns
- Verify permissions are granted
- Test with SMS simulator first
- Review auto-tracking settings

---

**Note**: This feature requires SMS read permission and works best with standard bank/payment app notification formats used in India.
