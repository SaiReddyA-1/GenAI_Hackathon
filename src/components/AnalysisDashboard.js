import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
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
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupIcon from '@mui/icons-material/Group';
import SearchIcon from '@mui/icons-material/Search';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const AnalysisDashboard = ({ analysis }) => {
  const mockData = [
    { name: 'Jan', marketSize: 4000, competitors: 2000, growthPotential: 2500 },
    { name: 'Feb', marketSize: 3000, competitors: 1500, growthPotential: 2300 },
    { name: 'Mar', marketSize: 2000, competitors: 9800, growthPotential: 2200 },
    { name: 'Apr', marketSize: 2780, competitors: 3908, growthPotential: 2400 },
    { name: 'May', marketSize: 1890, competitors: 4800, growthPotential: 2100 },
    { name: 'Jun', marketSize: 2390, competitors: 3800, growthPotential: 2500 },
  ];

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
              +24.3%
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
              <Typography variant="subtitle1">Target Users</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#6366f1' }}>
              2.4M
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Potential customers
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
              12
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
              <Typography variant="subtitle1">Market Size</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f59e0b' }}>
              $4.2B
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total addressable market
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Market Trends Chart */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Market Trends Analysis</Typography>
        <Box sx={{ height: 300, width: '100%' }}>
          <ResponsiveContainer>
            <LineChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="marketSize"
                stroke="#8b5cf6"
                name="Market Size"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="competitors"
                stroke="#10b981"
                name="Competitors"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="growthPotential"
                stroke="#f59e0b"
                name="Growth Potential"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      {/* AI Insights */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">AI-Generated Insights</Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{ p: 2, bgcolor: '#e0e7ff', borderRadius: 1 }}>
              <Typography variant="subtitle1" sx={{ color: '#4338ca', fontWeight: 'bold', mb: 1 }}>
                Market Opportunity
              </Typography>
              <Typography variant="body1" sx={{ color: '#4338ca' }}>
                Strong growth potential in the target market with increasing demand for innovative solutions.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ p: 2, bgcolor: '#dcfce7', borderRadius: 1 }}>
              <Typography variant="subtitle1" sx={{ color: '#166534', fontWeight: 'bold', mb: 1 }}>
                Competitive Advantage
              </Typography>
              <Typography variant="body1" sx={{ color: '#166534' }}>
                Unique value proposition with limited direct competition in the specific niche.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ p: 2, bgcolor: '#fef3c7', borderRadius: 1 }}>
              <Typography variant="subtitle1" sx={{ color: '#92400e', fontWeight: 'bold', mb: 1 }}>
                Risk Factors
              </Typography>
              <Typography variant="body1" sx={{ color: '#92400e' }}>
                Consider regulatory compliance and initial market penetration challenges.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AnalysisDashboard;
