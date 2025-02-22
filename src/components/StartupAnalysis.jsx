import React from 'react';
import MarketGrowthChart from './charts/MarketGrowthChart';
import CompetitorChart from './charts/CompetitorChart';
import FundingChart from './charts/FundingChart';
import UserGrowthChart from './charts/UserGrowthChart';
import NavbarWrapper from './NavbarWrapper';

const StartupAnalysis = ({ analysis }) => {
  const competitors = [
    { name: 'Competitor 1', description: 'Description 1', marketShare: '20%' },
    { name: 'Competitor 2', description: 'Description 2', marketShare: '30%' },
    { name: 'Competitor 3', description: 'Description 3', marketShare: '50%' },
  ];

  const risks = [
    'Risk 1',
    'Risk 2',
    'Risk 3',
  ];

  const marketAnalysis = [
    'Market Analysis 1',
    'Market Analysis 2',
    'Market Analysis 3',
  ];

  const audienceMarketing = [
    'Audience & Marketing 1',
    'Audience & Marketing 2',
    'Audience & Marketing 3',
  ];

  const revenueStreams = [
    'Revenue Stream 1',
    'Revenue Stream 2',
    'Revenue Stream 3',
  ];

  const suggestedNames = [
    'Name 1',
    'Name 2',
    'Name 3',
    'Name 4',
  ];

  return (
    <>
      <NavbarWrapper />
      <div className="p-4 md:p-8" style={{ marginTop: '16px', maxWidth: '1200px', margin: '16px auto' }}>
        <h1 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-4">Startup Analysis Dashboard</h1>
        
        {/* Top Competitors Analysis */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">Top Competitors Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {competitors.map((competitor, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold mb-3 text-blue-600">{competitor.name}</h3>
                <p className="text-gray-600 mb-4">{competitor.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Market Share: {competitor.marketShare}</span>
                  <button className="text-blue-500 hover:text-blue-700">View Details →</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights Analysis */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">Startup Insights Analysis</h2>
          
          {/* Risks & Solutions */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-blue-600">Risks & Solutions</h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <ul className="space-y-4">
                {risks.map((risk, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-4 h-4 mt-1 mr-3 bg-red-100 text-red-600 rounded-full flex items-center justify-center">•</span>
                    <span className="text-gray-700">{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Market Analysis */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-blue-600">Market Analysis</h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <ul className="space-y-4">
                {marketAnalysis.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-4 h-4 mt-1 mr-3 bg-green-100 text-green-600 rounded-full flex items-center justify-center">•</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Audience & Marketing */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-blue-600">Audience & Marketing</h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <ul className="space-y-4">
                {audienceMarketing.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-4 h-4 mt-1 mr-3 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">•</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Revenue Streams */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-blue-600">Revenue Streams</h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <ul className="space-y-4">
                {revenueStreams.map((stream, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-4 h-4 mt-1 mr-3 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">•</span>
                    <span className="text-gray-700">{stream}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Suggested Names */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">Suggested Names</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {suggestedNames.map((name, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors">
                <span className="text-lg font-medium text-gray-700">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default StartupAnalysis;
