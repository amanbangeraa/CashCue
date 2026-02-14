import { PortfolioTable } from '../components/portfolio/PortfolioTable';
import { AddStockForm } from '../components/portfolio/AddStockForm';

export function PortfolioPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolio</h1>
        <p className="text-gray-600">
          Manage your stock holdings and track performance
        </p>
      </div>

      <AddStockForm />
      <PortfolioTable />
    </div>
  );
}
