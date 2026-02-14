import { useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { useIncome } from '../../context/IncomeContext';
import { IncomeSourceModal } from './IncomeSourceModal';
import type { IncomeSource } from '../../types/income.types';

export function IncomeSourcesList() {
  const { incomeSources, removeIncomeSource } = useIncome();
  const [editingSource, setEditingSource] = useState<IncomeSource | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this income source?')) {
      await removeIncomeSource(id);
    }
  };

  if (incomeSources.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-gray-500">No income sources added yet. Add your first income source!</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Income Sources</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Source Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Monthly
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {incomeSources.map(source => (
                <tr key={source.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {source.source_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                    {source.source_type}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                    ₹{source.monthly_amount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      source.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {source.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setEditingSource(source)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(source.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingSource && (
        <IncomeSourceModal
          isOpen={true}
          onClose={() => setEditingSource(null)}
          editSource={editingSource}
        />
      )}
    </>
  );
}
