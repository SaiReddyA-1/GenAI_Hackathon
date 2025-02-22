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
  Grid
} from '@mui/material';
import {
  MonetizationOn,
  AccountBalance,
  TrendingUp
} from '@mui/icons-material';

const RevenueAnalysis = ({ data }) => {
  if (!data?.revenueStreams) {
    return null;
  }

  const { primaryRevenue, passiveIncome, capitalRaising } = data.revenueStreams;

  const RevenueSection = ({ title, items, icon, color }) => (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2,
        height: '100%',
        backgroundColor: `${color}.light`,
        '&:hover': { 
          backgroundColor: `${color}.main`,
          '& .MuiTypography-root, & .MuiListItemText-primary': {
            color: 'white'
          },
          '& .MuiSvgIcon-root': {
            color: 'white'
          }
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {icon}
        <Typography variant="h6" color={`${color}.dark`} sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Box>
      <List dense>
        {items.map((item, index) => (
          <ListItem key={index}>
            <ListItemIcon sx={{ minWidth: '32px' }}>
              <Box 
                sx={{ 
                  width: '6px', 
                  height: '6px', 
                  borderRadius: '50%', 
                  backgroundColor: `${color}.dark` 
                }} 
              />
            </ListItemIcon>
            <ListItemText 
              primary={item} 
              sx={{ 
                '& .MuiListItemText-primary': { 
                  color: `${color}.dark`,
                  fontWeight: 500
                } 
              }} 
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        Revenue Analysis
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <RevenueSection
            title="Primary Revenue"
            items={primaryRevenue}
            icon={<MonetizationOn sx={{ color: 'success.dark' }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <RevenueSection
            title="Passive Income"
            items={passiveIncome}
            icon={<TrendingUp sx={{ color: 'info.dark' }} />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <RevenueSection
            title="Capital Raising"
            items={capitalRaising}
            icon={<AccountBalance sx={{ color: 'warning.dark' }} />}
            color="warning"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default RevenueAnalysis;
