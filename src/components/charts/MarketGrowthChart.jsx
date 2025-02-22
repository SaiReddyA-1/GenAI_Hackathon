import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MarketGrowthChart = ({ data }) => {
  // Ensure we have valid data
  if (!data || !data.marketGrowth) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Loading market growth data...
      </div>
    );
  }

  const chartData = {
    labels: data.marketGrowth.years || [],
    datasets: [
      {
        label: 'Market Growth (%)',
        data: data.marketGrowth.values || [],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Market Growth Projection',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Growth Rate (%)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Year',
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default MarketGrowthChart;
