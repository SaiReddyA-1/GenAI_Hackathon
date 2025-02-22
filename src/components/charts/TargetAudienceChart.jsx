import React, { useState, useEffect } from 'react';
import { Box, ToggleButton, ToggleButtonGroup, CircularProgress, Alert } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { db } from '../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TargetAudienceChart = ({ analysisId }) => {
  const [selectedView, setSelectedView] = useState('age');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [demographicData, setDemographicData] = useState(null);

  useEffect(() => {
    const fetchDemographicData = async () => {
      try {
        if (!analysisId) {
          throw new Error('No analysis ID provided');
        }

        const docRef = doc(db, 'marketAnalysis', analysisId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          throw new Error('Analysis data not found');
        }

        const data = docSnap.data();
        setDemographicData(data.marketData.demographics);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching demographic data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDemographicData();
  }, [analysisId]);

  if (loading) {
    return (
      <Box 
        sx={{ 
          height: '300px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          margin: '20px 0'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !demographicData) {
    return (
      <Box 
        sx={{ 
          padding: 2,
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          margin: '20px 0'
        }}
      >
        <Alert severity="error">
          {error || 'No demographic data available'}
        </Alert>
      </Box>
    );
  }

  const { ageGroups = {}, genderDistribution = {}, geographicDistribution = [] } = demographicData;

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setSelectedView(newView);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: false
        }
      },
      x: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Percentage (%)'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.raw.toFixed(1)}%`;
          }
        }
      }
    }
  };

  const getChartData = () => {
    switch (selectedView) {
      case 'age': {
        const labels = Object.keys(ageGroups);
        const values = Object.values(ageGroups);
        return {
          labels,
          datasets: [{
            data: values,
            backgroundColor: 'rgba(54, 162, 235, 0.8)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          }]
        };
      }
      case 'gender': {
        const labels = Object.keys(genderDistribution);
        const values = Object.values(genderDistribution);
        return {
          labels,
          datasets: [{
            data: values,
            backgroundColor: [
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 99, 132, 0.8)',
              'rgba(255, 206, 86, 0.8)',
            ],
            borderColor: [
              'rgba(54, 162, 235, 1)',
              'rgba(255, 99, 132, 1)',
              'rgba(255, 206, 86, 1)',
            ],
            borderWidth: 1,
          }]
        };
      }
      case 'location': {
        return {
          labels: geographicDistribution.map(r => r.name),
          datasets: [{
            data: geographicDistribution.map(r => r.percentage),
            backgroundColor: 'rgba(75, 192, 192, 0.8)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          }]
        };
      }
      default:
        return {
          labels: [],
          datasets: [{
            data: [],
            backgroundColor: 'rgba(54, 162, 235, 0.8)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          }]
        };
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
        <ToggleButtonGroup
          value={selectedView}
          exclusive
          onChange={handleViewChange}
          aria-label="demographic view"
        >
          <ToggleButton value="age" aria-label="age groups">
            Age Groups
          </ToggleButton>
          <ToggleButton value="gender" aria-label="gender distribution">
            Gender
          </ToggleButton>
          <ToggleButton value="location" aria-label="geographic distribution">
            Location
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ height: '400px', p: 2 }}>
        <Bar data={getChartData()} options={chartOptions} />
      </Box>
    </Box>
  );
};

export default TargetAudienceChart;
