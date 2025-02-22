import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid,
  Chip
} from '@mui/material';
import {
  Group,
  Campaign,
  TrendingUp
} from '@mui/icons-material';

const MarketingAnalysis = ({ data }) => {
  if (!data?.marketing) {
    return null;
  }

  const { targetAudience, marketingStrategy, investorAppeal } = data.marketing;

  const MarketingSection = ({ title, items, icon, color }) => (
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
          },
          '& .MuiChip-root': {
            backgroundColor: 'white',
            color: `${color}.main`
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
      
      {Array.isArray(items) ? (
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
      ) : (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {items.split(',').map((item, index) => (
            <Chip
              key={index}
              label={item.trim()}
              color={color}
              variant="outlined"
              size="small"
            />
          ))}
        </Box>
      )}
    </Paper>
  );

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        Marketing Analysis
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <MarketingSection
            title="Target Audience"
            items={targetAudience}
            icon={<Group sx={{ color: 'primary.dark' }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MarketingSection
            title="Marketing Strategy"
            items={marketingStrategy}
            icon={<Campaign sx={{ color: 'success.dark' }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MarketingSection
            title="Investor Appeal"
            items={investorAppeal}
            icon={<TrendingUp sx={{ color: 'info.dark' }} />}
            color="info"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default MarketingAnalysis;
