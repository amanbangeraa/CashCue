import { useState } from 'react';
import { Check, X, Smartphone, Edit2 } from 'lucide-react';
import type { ParsedTransaction } from '../../services/smsParser';
import type { ExpenseCategory } from '../../types/expense.types';

interface PendingTransactionsProps {
  transactions: ParsedTransaction[];
  onConfirm: (transaction: ParsedTransaction, category?: ExpenseCategory) => void;
  onReject: (transaction: ParsedTransaction) => void;
}

const categories: ExpenseCategory[] = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Healthcare',
  'Utilities',
  'Other',
];

export function PendingTransactions({ transactions, onConfirm, onReject }: PendingTransactionsProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<Record<number, ExpenseCategory>>({});

  if (transactions.length === 0) {
    return null;
  }

  const handleCategoryChange = (index: number, category: ExpenseCategory) => {
    setSelectedCategories({ ...selectedCategories, [index]: category });
  };

  const handleConfirm = (transaction: ParsedTransaction, index: number) => {
    const category = selectedCategories[index] || (transaction.category as ExpenseCategory);
    onConfirm(transaction, category);
    setEditingIndex(null);
    // Clean up the selected category for this transaction
    const newCategories = { ...selectedCategories };
    delete newCategories[index];
    setSelectedCategories(newCategories);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Smartphone className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Pending Auto-Tracked Expenses
        </h3>
        <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
          {transactions.length}
        </span>
      </div>

      <div className="space-y-3">
        {transactions.map((transaction, index) => {
          const isEditing = editingIndex === index;
          const currentCategory = selectedCategories[index] || transaction.category || 'Other';

          return (
            <div
              key={transaction.reference || index}
              className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-gray-900">
                      ₹{transaction.amount.toFixed(2)}
                    </span>
                    {transaction.paymentMethod && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                        {transaction.paymentMethod}
                      </span>
                    )}
                  </div>
                  
                  {transaction.merchant && (
                    <p className="text-sm text-gray-600 mb-2">
                      To: <span className="font-medium">{transaction.merchant}</span>
                    </p>
                  )}

                  {/* Category Selection */}
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-xs text-gray-600 font-medium">Category:</label>
                    {isEditing ? (
                      <select
                        value={currentCategory}
                        onChange={(e) => handleCategoryChange(index, e.target.value as ExpenseCategory)}
                        className="text-xs px-2 py-1 border border-purple-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        autoFocus
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    ) : (
                      <>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded font-medium">
                          {currentCategory}
                        </span>
                        <button
                          onClick={() => setEditingIndex(index)}
                          className="text-purple-600 hover:text-purple-700"
                          title="Change category"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    {transaction.date}
                    {transaction.reference && ` • Ref: ${transaction.reference}`}
                  </p>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleConfirm(transaction, index)}
                    className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    title="Confirm and add"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      onReject(transaction);
                      setEditingIndex(null);
                    }}
                    className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    title="Reject"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Review and confirm auto-detected transactions • Click the edit icon to change category
      </div>
    </div>
  );
}
