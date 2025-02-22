import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  CircularProgress, 
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Lightbulb,
  Warning
} from '@mui/icons-material';
import { db } from '../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

const SwotAnalysis = ({ analysisId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [swotData, setSwotData] = useState(null);

  useEffect(() => {
    const fetchSwotData = async () => {
      try {
        if (!analysisId) {
          throw new Error('No analysis ID provided');
        }

        console.log('Fetching SWOT data for analysisId:', analysisId); // Debug log
        const docRef = doc(db, 'marketAnalysis', analysisId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          throw new Error('Analysis data not found');
        }

        const data = docSnap.data();
        console.log('Firebase document data:', data); // Debug log

        if (!data.marketData?.swot) {
          throw new Error('No SWOT analysis data available');
        }

        console.log('SWOT data:', data.marketData.swot); // Debug log
        setSwotData(data.marketData.swot);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching SWOT data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (analysisId) {
      fetchSwotData();
    } else {
      setError('No analysis ID provided');
      setLoading(false);
    }
  }, [analysisId]);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !swotData) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          {error || 'No SWOT analysis data available'}
        </Alert>
      </Box>
    );
  }

  // Ensure all SWOT sections exist with default empty arrays
  const normalizedSwotData = {
    strengths: swotData.strengths || [],
    weaknesses: swotData.weaknesses || [],
    opportunities: swotData.opportunities || [],
    threats: swotData.threats || []
  };

  const SwotSection = ({ title, items, icon, color }) => (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2, 
        height: '100%',
        backgroundColor: `${color}.light`,
        '&:hover': {
          backgroundColor: `${color}.main`,
          '& .MuiTypography-root': {
            color: 'white'
          },
          '& .MuiSvgIcon-root': {
            color: 'white'
          },
          '& .MuiListItemText-root': {
            color: 'white'
          }
        },
        transition: 'all 0.3s ease'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {icon}
        <Typography variant="h6" sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Box>
      <List dense>
        {items.length > 0 ? (
          items.map((item, index) => (
            <ListItem key={index}>
              <ListItemIcon sx={{ minWidth: '32px' }}>
                <Box 
                  sx={{ 
                    width: '6px', 
                    height: '6px', 
                    borderRadius: '50%', 
                    backgroundColor: `${color}.main` 
                  }} 
                />
              </ListItemIcon>
              <ListItemText 
                primary={item} 
                sx={{ 
                  '& .MuiListItemText-primary': { 
                    fontSize: '0.9rem' 
                  } 
                }} 
              />
            </ListItem>
          ))
        ) : (
          <ListItem>
            <ListItemText 
              primary="No data available" 
              sx={{ 
                '& .MuiListItemText-primary': { 
                  fontSize: '0.9rem',
                  fontStyle: 'italic',
                  color: 'text.secondary'
                } 
              }} 
            />
          </ListItem>
        )}
      </List>
    </Paper>
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        SWOT Analysis
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <SwotSection
            title="Strengths"
            items={normalizedSwotData.strengths}
            icon={<TrendingUp sx={{ color: 'success.main' }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <SwotSection
            title="Weaknesses"
            items={normalizedSwotData.weaknesses}
            icon={<TrendingDown sx={{ color: 'error.main' }} />}
            color="error"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <SwotSection
            title="Opportunities"
            items={normalizedSwotData.opportunities}
            icon={<Lightbulb sx={{ color: 'info.main' }} />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <SwotSection
            title="Threats"
            items={normalizedSwotData.threats}
            icon={<Warning sx={{ color: 'warning.main' }} />}
            color="warning"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default SwotAnalysis;
