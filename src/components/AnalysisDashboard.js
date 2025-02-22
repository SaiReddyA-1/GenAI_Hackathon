import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Backdrop,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupIcon from '@mui/icons-material/Group';
import SearchIcon from '@mui/icons-material/Search';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import NavbarWrapper from './NavbarWrapper';
import MarketGrowthChart from './MarketGrowthChart';
import CompetitorChart from './CompetitorChart';
import MarketShareChart from './MarketShareChart';
import LoadingOverlay from './LoadingOverlay';

const AnalysisDashboard = ({ analysis }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);

  useEffect(() => {
    if (analysis) {
      setAnalysisData(analysis);
    }
  }, [analysis]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Sample data - replace with actual API call
      const data = analysis;

      setAnalysisData(data);
    } catch (error) {
      console.error('Error during analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!analysisData) {
    return (
      <>
        <NavbarWrapper />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Startup Analysis Dashboard
          </Typography>
          <Box sx={{ position: 'relative', minWidth: 120 }}>
            <CircularProgress
              size={24}
              sx={{
                color: 'primary.light',
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: '-12px',
                marginLeft: '-12px',
              }}
            />
          </Box>
        </Box>

        <LoadingOverlay 
          open={true} 
          message="Analyzing Your Market..."
        />
      </>
    );
  }

  const {
    overview,
    marketAnalysis,
    financialProjections,
    aiRecommendations,
    competitorAnalysis,
    marketTrends,
  } = analysisData;

  console.log('AnalysisDashboard - Full analysis data:', analysisData);
  console.log('AnalysisDashboard - Market Trends:', marketTrends);
  console.log('AnalysisDashboard - Competitor Analysis:', competitorAnalysis);

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return '$0';
    return `$${value}`;
  };

  return (
    <>
      <NavbarWrapper />
      <LoadingOverlay 
        open={isAnalyzing} 
        message="Analyzing Your Market..."
      />
      <Box sx={{ 
        p: { xs: 2, md: 4 }, 
        bgcolor: '#f8fafc', 
        mt: 2,
        mx: 'auto',
        maxWidth: '1200px'
      }}>
        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                bgcolor: '#fff',
                borderRadius: 2,
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon sx={{ color: '#10b981', mr: 1 }} />
                <Typography variant="h6" component="h2" sx={{ mb: 2, color: '#1e40af', fontWeight: 600 }}>
                  Market Growth
                </Typography>
              </Box>
              <Typography variant="h4" component="p" sx={{ mb: 1, fontWeight: 700 }}>
                +{overview.growthRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Year over year
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                bgcolor: '#fff',
                borderRadius: 2,
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <GroupIcon sx={{ color: '#6366f1', mr: 1 }} />
                <Typography variant="h6" component="h2" sx={{ mb: 2, color: '#1e40af', fontWeight: 600 }}>
                  Target Market
                </Typography>
              </Box>
              <Typography variant="h4" component="p" sx={{ mb: 1, fontWeight: 700 }}>
                {overview.marketSize}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Market Size
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                bgcolor: '#fff',
                borderRadius: 2,
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SearchIcon sx={{ color: '#8b5cf6', mr: 1 }} />
                <Typography variant="h6" component="h2" sx={{ mb: 2, color: '#1e40af', fontWeight: 600 }}>
                  Competitors
                </Typography>
              </Box>
              <Typography variant="h4" component="p" sx={{ mb: 1, fontWeight: 700 }}>
                {overview.competitorCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Direct competitors
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                bgcolor: '#fff',
                borderRadius: 2,
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoneyIcon sx={{ color: '#f59e0b', mr: 1 }} />
                <Typography variant="h6" component="h2" sx={{ mb: 2, color: '#1e40af', fontWeight: 600 }}>
                  Initial Investment
                </Typography>
              </Box>
              <Typography variant="h4" component="p" sx={{ mb: 1, fontWeight: 700 }}>
                {formatCurrency(financialProjections.estimatedFunding.initialFunding)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Required funding
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Market Analysis Section - Combining Graphs with Insights */}
        <Grid container spacing={4}>
          {/* Market Growth and Trends */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, bgcolor: '#fff', borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Market Growth & Trends</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Box sx={{ height: 300 }}>
                    <MarketGrowthChart data={marketTrends} />
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, bgcolor: '#e0e7ff', borderRadius: 1, height: '100%' }}>
                    <Typography variant="subtitle1" sx={{ color: '#4338ca', fontWeight: 'bold', mb: 1 }}>
                      Market Insights
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#4338ca' }}>
                      {marketAnalysis.trendAnalysis}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Market Share and Competition */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, bgcolor: '#fff', borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Market Share & Competition</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ height: 300 }}>
                    <MarketShareChart data={competitorAnalysis} />
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ height: 300 }}>
                    <CompetitorChart data={competitorAnalysis} />
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, bgcolor: '#dcfce7', borderRadius: 1, height: '100%' }}>
                    <Typography variant="subtitle1" sx={{ color: '#166534', fontWeight: 'bold', mb: 1 }}>
                      Competition Analysis
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#166534' }}>
                      {competitorAnalysis.insights}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Financial Projections */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, bgcolor: '#fff', borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Financial Analysis</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer>
                      <BarChart data={financialProjections.projectionCharts.financial}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                        <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                        <Bar dataKey="profit" fill="#8b5cf6" name="Profit" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, bgcolor: '#fef3c7', borderRadius: 1, height: '100%' }}>
                    <Typography variant="subtitle1" sx={{ color: '#92400e', fontWeight: 'bold', mb: 1 }}>
                      Financial Insights
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#92400e' }}>
                      {financialProjections.insights}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* AI Insights */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>AI-Generated Insights</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: '#e0e7ff', borderRadius: 1 }}>
                <Typography variant="subtitle1" sx={{ color: '#4338ca', fontWeight: 'bold', mb: 1 }}>
                  Market Opportunity
                </Typography>
                <Typography variant="body1" sx={{ color: '#4338ca' }}>
                  {marketAnalysis.trendAnalysis}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: '#dcfce7', borderRadius: 1 }}>
                <Typography variant="subtitle1" sx={{ color: '#166534', fontWeight: 'bold', mb: 1 }}>
                  Growth Strategy
                </Typography>
                <Typography variant="body1" sx={{ color: '#166534' }}>
                  {aiRecommendations.growthStrategy}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: '#fef3c7', borderRadius: 1 }}>
                <Typography variant="subtitle1" sx={{ color: '#92400e', fontWeight: 'bold', mb: 1 }}>
                  Risk Mitigation
                </Typography>
                <Typography variant="body1" sx={{ color: '#92400e' }}>
                  {aiRecommendations.riskMitigation.join(', ')}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
};

export default AnalysisDashboard;
