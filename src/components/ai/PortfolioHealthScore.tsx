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
  
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Needs Attention';
    return 'Critical';
  };

  return (
    <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl p-8 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">🤖 AI Portfolio Health Score</h2>
          <p className="text-indigo-100 text-sm">Powered by Groq & Llama 3.3</p>
        </div>
        
        <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl p-4">
          <div className={`text-6xl font-bold ${getScoreColor(score)}`} style={{ color: 'white' }}>
            {score.toFixed(1)}
          </div>
          <div className="text-sm font-semibold mt-1">{getScoreLabel(score)}</div>
        </div>
      </div>

      {/* Total Savings Callout */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/20">
        <div className="text-center">
          <div className="text-sm text-indigo-100 mb-1">💰 AI-Identified Tax Optimization Potential</div>
          <div className="text-5xl font-bold text-yellow-300">
            ₹{totalSavings.toLocaleString('en-IN')}
          </div>
          <div className="text-sm text-indigo-100 mt-2">in potential tax savings</div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span className="text-xl">✅</span>
            <span>Strengths</span>
          </h3>
          <ul className="space-y-2">
            {strengths.map((strength, idx) => (
              <li key={idx} className="text-sm text-indigo-50 flex items-start gap-2">
                <span className="text-green-300">•</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <span>Opportunities</span>
          </h3>
          <ul className="space-y-2">
            {weaknesses.map((weakness, idx) => (
              <li key={idx} className="text-sm text-indigo-50 flex items-start gap-2">
                <span className="text-yellow-300">•</span>
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
