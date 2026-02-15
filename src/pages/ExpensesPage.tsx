import { useState } from 'react';
import { ExpenseList } from '../components/expenses/ExpenseList';
import { AddExpenseForm } from '../components/expenses/AddExpenseForm';
import { MonthlyChart } from '../components/expenses/MonthlyChart';
import { AutoExpenseSettings } from '../components/expenses/AutoExpenseSettings';
import { PendingTransactions } from '../components/expenses/PendingTransactions';
import { SMSSimulator } from '../components/expenses/SMSSimulator';
import { getAutoExpenseTracker } from '../services/autoExpenseTracker';
import { useExpenses } from '../context/ExpenseContext';
import type { ParsedTransaction } from '../services/smsParser';
import type { ExpenseCategory } from '../types/expense.types';

export function ExpensesPage() {
  const { addExpense } = useExpenses();
  const [pendingTransactions, setPendingTransactions] = useState<ParsedTransaction[]>([]);
  const [autoConfig, setAutoConfig] = useState({
    enabled: true, // Enable by default for demo
    minAmount: 10,
    requireConfirmation: true,
  });
  const [simulatorFeedback, setSimulatorFeedback] = useState<string | null>(null);

  const tracker = getAutoExpenseTracker({
    ...autoConfig,
    excludeCategories: [],
  });

  const handleSMSReceived = (smsBody: string, sender: string) => {
    const parsed = tracker.processSMS(smsBody, sender);
    
    if (parsed) {
      if (autoConfig.requireConfirmation) {
        setPendingTransactions([...tracker.getPendingTransactions()]);
        setSimulatorFeedback(`✓ Transaction detected: ₹${parsed.amount} to ${parsed.merchant || 'Unknown'}`);
      } else {
        // Auto-add without confirmation
        const expense = tracker.toExpense(parsed);
        addExpense(expense);
        setSimulatorFeedback(`✓ Expense added automatically: ₹${parsed.amount}`);
      }
    } else {
      setSimulatorFeedback('✗ No valid transaction found in SMS. Check the format.');
    }

    // Clear feedback after 5 seconds
    setTimeout(() => setSimulatorFeedback(null), 5000);
  };

  const handleConfirm = (transaction: ParsedTransaction, category?: ExpenseCategory) => {
    const expense = tracker.toExpense(transaction);
    // Override category if user selected a different one
    if (category) {
      expense.category = category;
    }
    addExpense(expense);
    tracker.confirmTransaction(transaction.reference);
    setPendingTransactions([...tracker.getPendingTransactions()]);
  };

  const handleReject = (transaction: ParsedTransaction) => {
    tracker.rejectTransaction(transaction.reference);
    setPendingTransactions([...tracker.getPendingTransactions()]);
  };

  const handleConfigChange = (config: typeof autoConfig) => {
    setAutoConfig(config);
    tracker.updateConfig(config);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="space-y-2">
          <div className="pill w-max">Expenses</div>
          <h1 className="text-3xl font-bold text-white">Expense Control</h1>
          <p className="text-slate-300">
            Track your daily expenses automatically via SMS or manually
          </p>
        </div>
        <AutoExpenseSettings onConfigChange={handleConfigChange} />
      </div>

      {/* SMS Simulator for Demo */}
      <SMSSimulator onSMSReceived={handleSMSReceived} />

      {/* Simulator Feedback */}
      {simulatorFeedback && (
        <div className={`rounded-lg p-4 ${
          simulatorFeedback.startsWith('✓') 
            ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-100' 
            : 'bg-red-500/20 border border-red-500/30 text-red-100'
        }`}>
          <p className="text-sm font-medium">{simulatorFeedback}</p>
        </div>
      )}

      {/* Pending Transactions */}
      {pendingTransactions.length > 0 && (
        <PendingTransactions
          transactions={pendingTransactions}
          onConfirm={handleConfirm}
          onReject={handleReject}
        />
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-6">
          <AddExpenseForm />
          <ExpenseList />
        </div>
        <div>
          <MonthlyChart />
        </div>
      </div>
    </div>
  );
}
