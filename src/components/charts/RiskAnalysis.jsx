import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip
} from '@mui/material';
import {
  Warning,
  CheckCircle,
  TrendingUp,
  Timeline
} from '@mui/icons-material';

const RiskAnalysis = ({ data }) => {
  if (!data?.risks || !data?.solutions) {
    return null;
  }

  const { risks, solutions, marketTrends, growthRate } = data;

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {/* Risks Section */}
        <Paper 
          elevation={3} 
          sx={{ 
            flex: 1, 
            minWidth: '300px',
            p: 2,
            backgroundColor: 'error.light',
            '&:hover': { backgroundColor: 'error.main' }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Warning sx={{ color: 'error.dark', mr: 1 }} />
            <Typography variant="h6" color="error.dark">
              Key Risks
            </Typography>
          </Box>
          <List dense>
            {risks.map((risk, index) => (
              <ListItem key={index}>
                <ListItemIcon sx={{ minWidth: '32px' }}>
                  <Box 
                    sx={{ 
                      width: '6px', 
                      height: '6px', 
                      borderRadius: '50%', 
                      backgroundColor: 'error.dark' 
                    }} 
                  />
                </ListItemIcon>
                <ListItemText 
                  primary={risk} 
                  sx={{ 
                    '& .MuiListItemText-primary': { 
                      color: 'error.dark',
                      fontWeight: 500
                    } 
                  }} 
                />
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Solutions Section */}
        <Paper 
          elevation={3} 
          sx={{ 
            flex: 1, 
            minWidth: '300px',
            p: 2,
            backgroundColor: 'success.light',
            '&:hover': { backgroundColor: 'success.main' }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CheckCircle sx={{ color: 'success.dark', mr: 1 }} />
            <Typography variant="h6" color="success.dark">
              Solutions
            </Typography>
          </Box>
          <List dense>
            {solutions.map((solution, index) => (
              <ListItem key={index}>
                <ListItemIcon sx={{ minWidth: '32px' }}>
                  <Box 
                    sx={{ 
                      width: '6px', 
                      height: '6px', 
                      borderRadius: '50%', 
                      backgroundColor: 'success.dark' 
                    }} 
                  />
                </ListItemIcon>
                <ListItemText 
                  primary={solution} 
                  sx={{ 
                    '& .MuiListItemText-primary': { 
                      color: 'success.dark',
                      fontWeight: 500
                    } 
                  }} 
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>

      {/* Market Trends Section */}
      <Paper 
        elevation={3} 
        sx={{ 
          mt: 2, 
          p: 2,
          backgroundColor: 'info.light',
          '&:hover': { backgroundColor: 'info.main' }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Timeline sx={{ color: 'info.dark', mr: 1 }} />
          <Typography variant="h6" color="info.dark">
            Market Analysis
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: '200px' }}>
            <Typography variant="subtitle2" color="info.dark" gutterBottom>
              Current Growth Rate
            </Typography>
            <Typography variant="h4" color="info.dark">
              {growthRate}%
            </Typography>
          </Box>
          
          <Box sx={{ flex: 2, minWidth: '300px' }}>
            <Typography variant="subtitle2" color="info.dark" gutterBottom>
              Market Trends
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {marketTrends.map((trend, index) => (
                <Chip
                  key={index}
                  label={trend}
                  color="info"
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default RiskAnalysis;
