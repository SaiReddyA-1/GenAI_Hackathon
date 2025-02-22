import React from 'react';
import MarketGrowthChart from './charts/MarketGrowthChart';
import CompetitorChart from './charts/CompetitorChart';
import FundingChart from './charts/FundingChart';
import UserGrowthChart from './charts/UserGrowthChart';

const StartupAnalysis = ({ analysis }) => {
  return (
    <div className="p-4 space-y-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Startup Analysis Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <MarketGrowthChart data={analysis} />
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <CompetitorChart data={analysis} />
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <FundingChart data={analysis} />
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <UserGrowthChart data={analysis} />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mt-6">
        <h2 className="text-xl font-semibold mb-4">Key Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-gray-700">Market Growth</h3>
            <p className="text-gray-600">
              {analysis?.marketInsights?.summary || 'No market insights available'}
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700">Competitor Analysis</h3>
            <p className="text-gray-600">
              {analysis?.competitorInsights?.summary || 'No competitor insights available'}
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700">Funding Potential</h3>
            <p className="text-gray-600">
              {analysis?.fundingInsights?.summary || 'No funding insights available'}
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700">User Growth Strategy</h3>
            <p className="text-gray-600">
              {analysis?.userGrowthInsights?.summary || 'No user growth insights available'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartupAnalysis;
