import { useState } from 'react';
import { Settings } from 'lucide-react';
import { BudgetDashboard } from '../components/budget/BudgetDashboard';
import { BudgetSetupModal } from '../components/budget/BudgetSetupModal';
import { useBudget } from '../context/BudgetContext';

export function BudgetPage() {
  const [showSetupModal, setShowSetupModal] = useState(false);
  const { budgetConfig } = useBudget();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Daily Budget Manager</h1>
          <p className="text-gray-600">
            Smart budget tracking with dynamic daily spending limits
          </p>
        </div>
        <button
          onClick={() => setShowSetupModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Settings className="w-5 h-5" />
          {budgetConfig ? 'Update Budget' : 'Setup Budget'}
        </button>
      </div>

      <BudgetDashboard />

      <BudgetSetupModal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
      />
    </div>
  );
}
