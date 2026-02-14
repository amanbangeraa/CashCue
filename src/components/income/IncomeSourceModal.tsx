import { useState } from 'react';
import { X } from 'lucide-react';
import { useIncome } from '../../context/IncomeContext';
import type { IncomeSource, IncomeSourceType } from '../../types/income.types';

interface IncomeSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  editSource?: IncomeSource;
}

const sourceTypes: { value: IncomeSourceType; label: string }[] = [
  { value: 'salary', label: 'Salary' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'rental', label: 'Rental Income' },
  { value: 'investment', label: 'Investment Returns' },
  { value: 'business', label: 'Business Income' },
  { value: 'other', label: 'Other' },
];

export function IncomeSourceModal({ isOpen, onClose, editSource }: IncomeSourceModalProps) {
  const { addIncomeSource, updateIncomeSource } = useIncome();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    source_type: editSource?.source_type || 'salary' as IncomeSourceType,
    source_name: editSource?.source_name || '',
    monthly_amount: editSource?.monthly_amount.toString() || '',
    start_date: editSource?.start_date || new Date().toISOString().split('T')[0],
    is_active: editSource?.is_active ?? true,
    description: editSource?.description || '',
  });

  if (!isOpen) return null;

  const yearlyAmount = Number(formData.monthly_amount) * 12;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const sourceData: IncomeSource = {
        id: editSource?.id || crypto.randomUUID(),
        source_type: formData.source_type,
        source_name: formData.source_name,
        monthly_amount: Number(formData.monthly_amount),
        yearly_amount: yearlyAmount,
        start_date: formData.start_date,
        is_active: formData.is_active,
        description: formData.description,
      };

      if (editSource) {
        await updateIncomeSource(editSource.id, sourceData);
      } else {
        await addIncomeSource(sourceData);
      }
      onClose();
    } catch (err) {
      console.error('Failed to save income source:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {editSource ? 'Edit' : 'Add'} Income Source
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source Type *
            </label>
            <select
              value={formData.source_type}
              onChange={(e) => setFormData({ ...formData, source_type: e.target.value as IncomeSourceType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              required
            >
              {sourceTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source Name *
            </label>
            <input
              type="text"
              value={formData.source_name}
              onChange={(e) => setFormData({ ...formData, source_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="e.g., Monthly Salary - XYZ Company"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Amount (₹) *
            </label>
            <input
              type="number"
              value={formData.monthly_amount}
              onChange={(e) => setFormData({ ...formData, monthly_amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Enter monthly amount"
              required
              min="0"
              step="0.01"
            />
            {formData.monthly_amount && (
              <p className="text-xs text-gray-500 mt-1">
                Yearly: ₹{yearlyAmount.toLocaleString('en-IN')}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date *
            </label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              rows={2}
              placeholder="Additional details..."
              maxLength={500}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="is_active" className="text-sm text-gray-700">
              Active Income Source
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : editSource ? 'Update' : 'Add'} Income
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
