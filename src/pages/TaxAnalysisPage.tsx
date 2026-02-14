import { TaxSummary } from '../components/portfolio/TaxSummary';
import { HarvestingRecommendations } from '../components/portfolio/HarvestingRecommendations';

export function TaxAnalysisPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-red-600 mb-2">Tax Analysis</h1>
        <p className="text-red-600">
          Discover tax-saving opportunities through loss harvesting
        </p>
      </div>

      <HarvestingRecommendations />
      <TaxSummary />
    </div>
  );
}
