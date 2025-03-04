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

  // Initialize default values for any potentially undefined properties
  const {
    overview = {},
    marketAnalysis = {},
    financialProjections = {},
    aiRecommendations = {},
    competitorAnalysis = {},
    marketTrends = {},
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
                +{(overview?.growthRate || '0')}%
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
                {overview?.marketSize || 'N/A'}
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
                {overview?.competitorCount || 'N/A'}
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
                {formatCurrency(financialProjections?.estimatedFunding?.initialFunding || 0)}
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
                    <MarketGrowthChart data={marketTrends?.growthProjection || []} />
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, bgcolor: '#e0e7ff', borderRadius: 1, height: '100%' }}>
                    <Typography variant="subtitle1" sx={{ color: '#4338ca', fontWeight: 'bold', mb: 1 }}>
                      Market Insights
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#4338ca' }}>
                      {marketAnalysis?.trendAnalysis || 'N/A'}
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
                    <MarketShareChart data={competitorAnalysis?.marketShare || []} />
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ height: 300 }}>
                    <CompetitorChart data={competitorAnalysis?.competitorData || []} />
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, bgcolor: '#dcfce7', borderRadius: 1, height: '100%' }}>
                    <Typography variant="subtitle1" sx={{ color: '#166534', fontWeight: 'bold', mb: 1 }}>
                      Competition Analysis
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#166534' }}>
                      {competitorAnalysis?.insights || 'N/A'}
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
                      <BarChart data={financialProjections?.projectionCharts?.financial || []}>
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
                      {financialProjections?.insights || 'N/A'}
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
                  {marketAnalysis?.trendAnalysis || 'N/A'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: '#dcfce7', borderRadius: 1 }}>
                <Typography variant="subtitle1" sx={{ color: '#166534', fontWeight: 'bold', mb: 1 }}>
                  Growth Strategy
                </Typography>
                <Typography variant="body1" sx={{ color: '#166534' }}>
                  {aiRecommendations?.growthStrategy || 'N/A'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: '#fef3c7', borderRadius: 1 }}>
                <Typography variant="subtitle1" sx={{ color: '#92400e', fontWeight: 'bold', mb: 1 }}>
                  Risk Mitigation
                </Typography>
                <Typography variant="body1" sx={{ color: '#92400e' }}>
                  {(aiRecommendations?.riskMitigation || []).join(', ') || 'N/A'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Charts */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 3,
                height: '100%',
                minHeight: 400,
                borderRadius: 2,
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            >
              <Typography variant="h6" component="h3" sx={{ mb: 3, fontWeight: 600 }}>
                Projected Market Growth
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={marketTrends?.growthProjection || []}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="projectedGrowth" stroke="#10b981" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="industryAverage" stroke="#6366f1" />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 3,
                height: '100%',
                minHeight: 400,
                borderRadius: 2,
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            >
              <Typography variant="h6" component="h3" sx={{ mb: 3, fontWeight: 600 }}>
                Competitive Landscape
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={competitorAnalysis?.radarData || []}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Your Startup" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                  <Radar name="Competitors Avg" dataKey="B" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* Detailed Analysis */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 2,
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                mb: 4,
              }}
            >
              <Typography variant="h6" component="h3" sx={{ mb: 3, fontWeight: 600 }}>
                SWOT Analysis
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#059669' }}>
                      Strengths
                    </Typography>
                    <ul style={{ paddingLeft: '1.25rem', margin: '0.5rem 0' }}>
                      {(aiRecommendations?.swot?.strengths || []).map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#CA8A04' }}>
                      Opportunities
                    </Typography>
                    <ul style={{ paddingLeft: '1.25rem', margin: '0.5rem 0' }}>
                      {(aiRecommendations?.swot?.opportunities || []).map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#DC2626' }}>
                      Weaknesses
                    </Typography>
                    <ul style={{ paddingLeft: '1.25rem', margin: '0.5rem 0' }}>
                      {(aiRecommendations?.swot?.weaknesses || []).map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#7C3AED' }}>
                      Threats
                    </Typography>
                    <ul style={{ paddingLeft: '1.25rem', margin: '0.5rem 0' }}>
                      {(aiRecommendations?.swot?.threats || []).map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default AnalysisDashboard;
