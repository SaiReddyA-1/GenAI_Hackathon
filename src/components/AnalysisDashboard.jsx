import React from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import MarketGrowthChart from './charts/MarketGrowthChart';
import CompetitorChart from './charts/CompetitorChart';
import FundingChart from './charts/FundingChart';
import UserGrowthChart from './charts/UserGrowthChart';

const AnalysisDashboard = ({ analysisData }) => {
  if (!analysisData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No analysis data available yet. Please submit a startup idea to get started.
        </Typography>
      </Box>
    );
  }

  // Extract insights from analysis data
  const {
    marketInsights = { summary: 'No market insights available' },
    competitorInsights = { summary: 'No competitor insights available' },
    fundingInsights = { summary: 'No funding insights available' },
    userGrowthInsights = { summary: 'No user growth insights available' }
  } = analysisData;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        {/* Market Growth Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }} elevation={2}>
            <Typography variant="h6" gutterBottom>
              Market Growth Projection
            </Typography>
            <Box sx={{ height: 300 }}>
              <MarketGrowthChart data={analysisData} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {marketInsights.summary}
            </Typography>
          </Paper>
        </Grid>

        {/* Competitor Analysis Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }} elevation={2}>
            <Typography variant="h6" gutterBottom>
              Market Share Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              <CompetitorChart data={analysisData} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {competitorInsights.summary}
            </Typography>
          </Paper>
        </Grid>

        {/* Funding Projection Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }} elevation={2}>
            <Typography variant="h6" gutterBottom>
              Funding Projection
            </Typography>
            <Box sx={{ height: 300 }}>
              <FundingChart data={analysisData} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {fundingInsights.summary}
            </Typography>
          </Paper>
        </Grid>

        {/* User Growth Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }} elevation={2}>
            <Typography variant="h6" gutterBottom>
              User Growth Projection
            </Typography>
            <Box sx={{ height: 300 }}>
              <UserGrowthChart data={analysisData} />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {userGrowthInsights.summary}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalysisDashboard;
