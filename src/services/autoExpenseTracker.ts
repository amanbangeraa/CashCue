import { parseSMS } from './smsParser';
import type { ParsedTransaction } from './smsParser';
import type { Expense, ExpenseCategory } from '../types/expense.types';

export interface AutoExpenseConfig {
  enabled: boolean;
  minAmount: number; // Minimum amount to auto-track
  excludeCategories: string[]; // Categories to exclude from auto-tracking
  requireConfirmation: boolean; // Ask user before adding
}

export class AutoExpenseTracker {
  private config: AutoExpenseConfig;
  private pendingTransactions: ParsedTransaction[] = [];
  
  constructor(config: AutoExpenseConfig) {
    this.config = config;
  }
  
  // Process incoming SMS
  processSMS(smsBody: string, sender: string): ParsedTransaction | null {
    if (!this.config.enabled) {
      return null;
    }
    
    const parsed = parseSMS(smsBody, sender);
    
    if (!parsed) {
      return null;
    }
    
    // Only track debit transactions (expenses)
    if (parsed.transactionType !== 'debit') {
      return null;
    }
    
    // Check minimum amount
    if (parsed.amount < this.config.minAmount) {
      return null;
    }
    
    // Check excluded categories
    if (parsed.category && this.config.excludeCategories.includes(parsed.category)) {
      return null;
    }
    
    if (this.config.requireConfirmation) {
      this.pendingTransactions.push(parsed);
    }
    
    return parsed;
  }
  
  // Convert parsed transaction to expense
  toExpense(transaction: ParsedTransaction): Expense {
    return {
      id: `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: transaction.date,
      category: (transaction.category || 'Other') as ExpenseCategory,
      amount: transaction.amount,
      description: this.generateDescription(transaction),
    };
  }
  
  private generateDescription(transaction: ParsedTransaction): string {
    const parts: string[] = [];
    
    if (transaction.paymentMethod) {
      parts.push(transaction.paymentMethod);
    }
    
    if (transaction.merchant) {
      parts.push(`to ${transaction.merchant}`);
    }
    
    if (transaction.reference) {
      parts.push(`(Ref: ${transaction.reference})`);
    }
    
    return parts.join(' ') || 'Auto-tracked payment';
  }
  
  getPendingTransactions(): ParsedTransaction[] {
    return [...this.pendingTransactions];
  }
  
  confirmTransaction(reference?: string): ParsedTransaction | null {
    const index = reference 
      ? this.pendingTransactions.findIndex(t => t.reference === reference)
      : 0;
    
    if (index === -1) {
      return null;
    }
    
    return this.pendingTransactions.splice(index, 1)[0];
  }
  
  rejectTransaction(reference?: string): void {
    const index = reference 
      ? this.pendingTransactions.findIndex(t => t.reference === reference)
      : 0;
    
    if (index !== -1) {
      this.pendingTransactions.splice(index, 1);
    }
  }
  
  clearPending(): void {
    this.pendingTransactions = [];
  }
  
  updateConfig(config: Partial<AutoExpenseConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Singleton instance
let trackerInstance: AutoExpenseTracker | null = null;

export function getAutoExpenseTracker(config?: AutoExpenseConfig): AutoExpenseTracker {
  if (!trackerInstance) {
    trackerInstance = new AutoExpenseTracker(config || {
      enabled: true,
      minAmount: 10,
      excludeCategories: [],
      requireConfirmation: true,
    });
  }
  return trackerInstance;
}
