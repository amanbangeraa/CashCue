import { useState } from 'react';
import { Smartphone, AlertCircle } from 'lucide-react';

interface AutoExpenseSettingsProps {
  onConfigChange: (config: {
    enabled: boolean;
    minAmount: number;
    requireConfirmation: boolean;
  }) => void;
}

export function AutoExpenseSettings({ onConfigChange }: AutoExpenseSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    enabled: true, // Default to enabled
    minAmount: 10,
    requireConfirmation: true,
  });

  const handleSave = () => {
    onConfigChange(config);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          config.enabled 
            ? 'bg-purple-600 text-white hover:bg-purple-700' 
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        <Smartphone className="w-5 h-5" />
        Auto-Track {config.enabled ? 'ON' : 'OFF'}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Auto Expense Tracking</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Info Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">How it works:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Reads payment SMS from your phone</li>
                      <li>Automatically detects UPI, Card, and Bank transactions</li>
                      <li>Categorizes expenses intelligently</li>
                      <li>Adds to your expense tracker instantly</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Enable Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Enable Auto-Tracking
                  </label>
                  <p className="text-xs text-gray-500">Automatically track expenses from SMS</p>
                </div>
                <button
                  onClick={() => setConfig({ ...config, enabled: !config.enabled })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    config.enabled ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      config.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Minimum Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Amount (₹)
                </label>
                <input
                  type="number"
                  value={config.minAmount}
                  onChange={(e) => setConfig({ ...config, minAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  min="0"
                  step="10"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Only track transactions above this amount
                </p>
              </div>

              {/* Require Confirmation */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Require Confirmation
                  </label>
                  <p className="text-xs text-gray-500">Review before adding to expenses</p>
                </div>
                <button
                  onClick={() => setConfig({ ...config, requireConfirmation: !config.requireConfirmation })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    config.requireConfirmation ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      config.requireConfirmation ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Permissions Notice */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Permissions Required:</p>
                    <p>This feature requires SMS read permission. Your data stays private and is only used for expense tracking.</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
