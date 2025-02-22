import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Box } from '@mui/material';

ChartJS.register(ArcElement, Tooltip, Legend);

const MarketShareChart = ({ data }) => {
  if (!data?.competitors || !Array.isArray(data.competitors) || data.competitors.length === 0) {
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
        <p>No market share data available</p>
      </Box>
    );
  }

  // Sort competitors by market share in descending order
  const sortedCompetitors = [...data.competitors].sort((a, b) => 
    (b.marketShare || 0) - (a.marketShare || 0)
  );

  // Get top 3 competitors
  const topCompetitors = sortedCompetitors.slice(0, 3);

  // Calculate total market share of top 3
  const topCompetitorsShare = topCompetitors.reduce((acc, comp) => 
    acc + (comp.marketShare || 0), 0
  );

  // Calculate others' share (100% minus top 3)
  const othersShare = Math.max(0, 100 - topCompetitorsShare);

  const chartData = {
    labels: [...topCompetitors.map(comp => comp.name), 'Others'],
    datasets: [
      {
        data: [...topCompetitors.map(comp => comp.marketShare || 0), othersShare],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',   // Blue
          'rgba(255, 206, 86, 0.8)',   // Yellow
          'rgba(75, 192, 192, 0.8)',   // Teal
          'rgba(128, 128, 128, 0.8)',  // Gray for Others
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(128, 128, 128, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            size: 12
          },
          padding: 20,
          generateLabels: (chart) => {
            const datasets = chart.data.datasets;
            return chart.data.labels.map((label, index) => ({
              text: `${label} (${datasets[0].data[index].toFixed(1)}%)`,
              fillStyle: datasets[0].backgroundColor[index],
              strokeStyle: datasets[0].borderColor[index],
              lineWidth: 1,
              hidden: false,
              index: index
            }));
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value.toFixed(1)}%`;
          }
        }
      }
    }
  };

  return (
    <Box sx={{ height: '400px', p: 2 }}>
      <Pie data={chartData} options={options} />
    </Box>
  );
};

export default MarketShareChart;
