import { TrendingUp, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

interface PortfolioHealthScoreProps {
  score: number;
  strengths: string[];
  weaknesses: string[];
  totalSavings: number;
}

export function PortfolioHealthScore({ 
  score, 
  strengths, 
  weaknesses, 
  totalSavings 
}: PortfolioHealthScoreProps) {
  
  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Fair';
    return 'Needs Attention';
  };

  const getScoreBg = (score: number) => {
    if (score >= 8) return 'from-green-500 to-emerald-600';
    if (score >= 6) return 'from-yellow-500 to-amber-600';
    return 'from-orange-500 to-red-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      {/* Header Section */}
      <div className={`bg-gradient-to-r ${getScoreBg(score)} px-6 py-8 text-white`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium opacity-90">AI Portfolio Health Score</span>
            </div>
            
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-6xl font-bold tracking-tight">{score.toFixed(1)}</span>
              <span className="text-2xl opacity-75">/ 10</span>
            </div>
            
            <span className="text-base font-medium opacity-90">{getScoreLabel(score)}</span>
          </div>

          {/* Savings Badge */}
          {totalSavings > 0 && (
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-6 py-5 border border-white/20 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium opacity-90">Potential Tax Savings</span>
              </div>
              <div className="text-4xl font-bold">
                ₹{(totalSavings / 1000).toFixed(1)}K
              </div>
              <div className="text-xs opacity-75 mt-1">
                ₹{totalSavings.toLocaleString('en-IN')}
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${(score / 10) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="grid md:grid-cols-2 divide-x divide-gray-200">
        {/* Strengths */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">What's Working</h3>
          </div>
          
          <ul className="space-y-3">
            {strengths.slice(0, 3).map((strength, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Opportunities */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Opportunities</h3>
          </div>
          
          <ul className="space-y-3">
            {weaknesses.slice(0, 3).map((weakness, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 shrink-0" />
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
