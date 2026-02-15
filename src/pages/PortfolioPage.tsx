import { PortfolioTable } from '../components/portfolio/PortfolioTable';
import { AddStockForm } from '../components/portfolio/AddStockForm';
import { MarketStatus } from '../components/portfolio/MarketStatus';

export function PortfolioPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="pill">Portfolio</div>
          <MarketStatus />
        </div>
        <h1 className="text-3xl font-bold text-white">Manage Holdings</h1>
        <p className="text-slate-300">
          Track your stock holdings with real-time NSE/BSE prices
        </p>
      </div>

      <AddStockForm />
      <PortfolioTable />
    </div>
  );
}
