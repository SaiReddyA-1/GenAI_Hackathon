import React, { useState, useEffect } from 'react';
import { analyzeMarketData } from '../utils/geminiApi';
import TargetAudienceChart from './charts/TargetAudienceChart';
import MarketGrowthLineChart from './charts/MarketGrowthLineChart';
import CompetitorsBarChart from './charts/CompetitorsBarChart';
import SwotAnalysis from './charts/SwotAnalysis';

const MarketAnalysisDashboard = ({ topic }) => {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await analyzeMarketData(topic);
        setMarketData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (topic) {
      fetchData();
    }
  }, [topic]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Loading market analysis...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
        <h2>Error: {error}</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
        Market Analysis Dashboard: {topic}
      </h1>
      
      <div style={{ display: 'grid', gap: '30px' }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2>Target Audience Demographics</h2>
          <TargetAudienceChart data={marketData} />
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2>Market Size & Growth Rate</h2>
          <MarketGrowthLineChart data={marketData} />
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2>Top Competitors Market Share</h2>
          <CompetitorsBarChart data={marketData} />
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <SwotAnalysis data={marketData} />
        </div>
      </div>
    </div>
  );
};

export default MarketAnalysisDashboard;
