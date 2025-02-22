import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const FundingChart = ({ data }) => {
  // Ensure we have valid data
  if (!data || !data.fundingPrediction) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Loading funding data...
      </div>
    );
  }

  const chartData = {
    labels: data.fundingPrediction.years || [],
    datasets: [
      {
        label: 'Funding Amount ($M)',
        data: data.fundingPrediction.fundingAmount || [],
        backgroundColor: 'rgba(139, 92, 246, 0.8)', // purple
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 1,
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
        text: 'Funding Projection',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw || 0;
            return `Funding: $${value}M`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount ($ Million)',
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

  return <Bar data={chartData} options={options} />;
};

export default FundingChart;
