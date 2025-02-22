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
  Filler
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

const MarketGrowthLineChart = ({ data }) => {
  const chartData = {
    labels: data?.marketSize?.map(item => item.year) || [],
    datasets: [
      {
        label: 'Market Size',
        data: data?.marketSize?.map(item => item.value) || [],
        fill: true,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgb(75, 192, 192)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Market Size Growth Trend',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Market Size: $${context.raw.toFixed(2)}M`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Market Size (Millions USD)',
          font: {
            size: 12
          }
        },
        ticks: {
          callback: function(value) {
            return '$' + value + 'M';
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Year',
          font: {
            size: 12
          }
        }
      }
    },
    layout: {
      padding: 20
    }
  };

  if (!data?.marketSize?.length) {
    return (
      <div style={{ 
        height: '300px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
      }}>
        <p>No market size data available</p>
      </div>
    );
  }

  return (
    <div style={{ height: '400px', padding: '20px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default MarketGrowthLineChart;
