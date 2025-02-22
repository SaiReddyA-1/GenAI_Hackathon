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

const UserGrowthChart = ({ data }) => {
  // Ensure we have valid data
  if (!data || !data.userGrowth) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Loading user growth data...
      </div>
    );
  }

  const chartData = {
    labels: data.userGrowth.years || [],
    datasets: [
      {
        label: 'User Base Growth',
        data: data.userGrowth.userBase || [],
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
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
        text: 'User Base Growth Projection',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw || 0;
            return `Users: ${value.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Users',
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

export default UserGrowthChart;
