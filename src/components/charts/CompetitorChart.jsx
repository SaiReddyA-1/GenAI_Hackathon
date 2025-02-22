import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const CompetitorChart = ({ data }) => {
  // Ensure we have valid data
  if (!data || !data.competitorComparison) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Loading competitor data...
      </div>
    );
  }

  const chartData = {
    labels: data.competitorComparison.competitors || [],
    datasets: [
      {
        data: data.competitorComparison.marketShare || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)', // blue
          'rgba(239, 68, 68, 0.8)',  // red
          'rgba(34, 197, 94, 0.8)',  // green
          'rgba(168, 85, 247, 0.8)', // purple
          'rgba(251, 146, 60, 0.8)', // orange
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(251, 146, 60, 1)',
        ],
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
        text: 'Market Share Distribution',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value}%`;
          }
        }
      }
    },
  };

  return <Pie data={chartData} options={options} />;
};

export default CompetitorChart;
