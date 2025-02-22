import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
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

const AnalysisDashboard = ({ analysis }) => {
  if (!analysis) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  const {
    overview,
    marketAnalysis,
    financialProjections,
    aiRecommendations,
    visualData
  } = analysis;

  // Format currency
  const formatCurrency = (value) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    }
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value}`;
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#fff' }}>
      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingUpIcon sx={{ color: '#10b981', mr: 1 }} />
              <Typography variant="subtitle1">Market Growth</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#10b981' }}>
              +{overview.growthRate}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Year over year
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <GroupIcon sx={{ color: '#6366f1', mr: 1 }} />
              <Typography variant="subtitle1">Target Market</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#6366f1' }}>
              {overview.marketSize}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Market Size
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <SearchIcon sx={{ color: '#8b5cf6', mr: 1 }} />
              <Typography variant="subtitle1">Competitors</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#8b5cf6' }}>
              {overview.competitorCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Direct competitors
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AttachMoneyIcon sx={{ color: '#f59e0b', mr: 1 }} />
              <Typography variant="subtitle1">Initial Investment</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f59e0b' }}>
              {formatCurrency(financialProjections.estimatedFunding.initialFunding)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Required funding
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Market Trends Chart */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Typography variant="h6" sx={{ mb: 2 }}>Revenue & Growth Projections</Typography>
          <Box sx={{ height: 300, width: '100%' }}>
            <ResponsiveContainer>
              <LineChart data={visualData.marketTrendChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  name="Revenue"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="userBase"
                  stroke="#10b981"
                  name="User Base"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ mb: 2 }}>Competitor Analysis</Typography>
          <Box sx={{ height: 300, width: '100%' }}>
            <ResponsiveContainer>
              <RadarChart data={visualData.competitorComparisonData.competitors}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis />
                <Radar
                  name="Score"
                  dataKey="scores"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
      </Grid>

      {/* Financial Projections */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Financial Projections</Typography>
        <Box sx={{ height: 300, width: '100%' }}>
          <ResponsiveContainer>
            <BarChart data={visualData.projectionCharts.financial}>
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
      </Box>

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
  );
};

export default AnalysisDashboard;
