import { useIncome } from '../../context/IncomeContext';

export function IncomeSummaryWidget() {
  const { incomeSummary } = useIncome();

  return (
    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-green-100 text-sm mb-1">Gross Income</p>
          <p className="text-3xl font-bold">₹{incomeSummary.totalMonthlyGross.toLocaleString('en-IN')}</p>
          <p className="text-green-100 text-xs mt-1">Monthly</p>
        </div>
        <div>
          <p className="text-green-100 text-sm mb-1">Net Income</p>
          <p className="text-3xl font-bold">₹{incomeSummary.totalMonthlyNet.toLocaleString('en-IN')}</p>
          <p className="text-green-100 text-xs mt-1">After deductions</p>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-green-400">
        <div className="flex justify-between text-sm">
          <span className="text-green-100">Total Deductions:</span>
          <span className="font-semibold">₹{incomeSummary.totalMonthlyDeductions.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-green-100">Effective Rate:</span>
          <span className="font-semibold">{incomeSummary.effectiveTaxRate.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}
