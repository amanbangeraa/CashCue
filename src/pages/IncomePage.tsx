import { useState } from 'react';
import { Plus, DollarSign, TrendingUp } from 'lucide-react';
import { useIncome } from '../context/IncomeContext';
import { IncomeSourceModal } from '../components/income/IncomeSourceModal';
import { IncomeSourcesList } from '../components/income/IncomeSourcesList';
import { IncomeSummaryWidget } from '../components/income/IncomeSummaryWidget';

export function IncomePage() {
  const { incomeSummary } = useIncome();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Income Management</h1>
          <p className="text-gray-600">
            Track all your income sources and tax deductions
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="w-5 h-5" />
          Add Income Source
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <p className="text-sm text-gray-600">Monthly Net Income</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ₹{incomeSummary.totalMonthlyNet.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            After deductions
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-gray-600">Annual Projection</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ₹{incomeSummary.totalYearlyNet.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Projected yearly income
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-purple-600" />
            <p className="text-sm text-gray-600">Active Sources</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {incomeSummary.activeSourcesCount}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Income streams
          </p>
        </div>
      </div>

      {/* Income Summary Widget */}
      <IncomeSummaryWidget />

      {/* Income Sources List */}
      <IncomeSourcesList />

      {/* Add Income Modal */}
      <IncomeSourceModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}
