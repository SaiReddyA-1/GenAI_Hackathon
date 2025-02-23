import React, { useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Alert, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import TargetAudienceChart from './charts/TargetAudienceChart';
import MarketGrowthLineChart from './charts/MarketGrowthLineChart';
import MarketShareChart from './charts/MarketShareChart';
import SwotAnalysis from './charts/SwotAnalysis';
import RiskAnalysis from './charts/RiskAnalysis';
import RevenueAnalysis from './charts/RevenueAnalysis';
import MarketingAnalysis from './charts/MarketingAnalysis';
import useAuth from '../hooks/useAuth';
import StartupAnalysis from './StartupAnalysis';
const MarketChartsDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [marketData, setMarketData] = useState(null);
  const [analysisId, setAnalysisId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedData = localStorage.getItem('marketAnalysisData');
        if (!storedData) {
          setError('No market analysis data found. Please complete the analysis first.');
          setLoading(false);
          return;
        }

        const parsedData = JSON.parse(storedData);
        
        if (parsedData.analysisId) {
          setAnalysisId(parsedData.analysisId);
          const docRef = doc(db, 'marketAnalysis', parsedData.analysisId);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const firebaseData = docSnap.data();
            console.log('Firebase data:', firebaseData);
            setMarketData(firebaseData.marketData);
          } else {
            console.log('Document not found, using localStorage data');
            setMarketData(parsedData);
          }
        } else {
          console.log('No analysisId found, using localStorage data');
          setMarketData(parsedData);
        }
      } catch (err) {
        console.error('Error fetching market data:', err);
        setError('Error loading market analysis data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }


  if (!marketData || !analysisId) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="warning"
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </Button>
          }
        >
          No market analysis data available. Please complete the analysis first.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3 
      }}>
        <h1 style={{ margin: 0, textAlign: 'center', width: '100%' }}>Market Analysis Dashboard</h1>
        {/* <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </Button> */}
      </Box>
      
      <Box sx={{ display: 'grid', gap: 4 }}>
        {/* Market Share and Competitors */}
        <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
          <h2>Market Share Distribution</h2>
          <MarketShareChart data={marketData} />
        </Box>

        {/* Demographics */}
        <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
          <h2>Target Audience Demographics</h2>
          <TargetAudienceChart analysisId={analysisId} />
        </Box>

        {/* Market Growth */}
        <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
          <h2>Market Size & Growth Rate</h2>
          <MarketGrowthLineChart data={marketData} />
        </Box>

        {/* SWOT Analysis */}
        <Box sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
          {/* <h2>SWOT Analysis</h2> */}
          <SwotAnalysis analysisId={analysisId} />
        </Box>

        {/* Risk Analysis */}
      {/* <StartupAnalysis /> */}
      </Box>  
    </Box>
  );
};

export default MarketChartsDashboard;
