import React from 'react';
import { Bar } from 'react-chartjs-2';
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

const CompetitorsBarChart = ({ data }) => {
  const chartData = {
    labels: data?.competitors?.map(comp => comp.name) || [],
    datasets: [
      {
        label: 'Market Share (%)',
        data: data?.competitors?.map(comp => comp.marketShare) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
        borderRadius: 5,
      },
    ],
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
        text: 'Competitor Market Share Analysis',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const comp = data.competitors[context.dataIndex];
            return [
              `Market Share: ${context.raw.toFixed(1)}%`,
              `Target Market: ${comp.targetMarket}`,
              `Strategy: ${comp.strategies}`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Market Share (%)',
          font: {
            size: 12
          }
        },
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Competitors',
          font: {
            size: 12
          }
        }
      }
    },
    layout: {
      padding: 20
    },
    barThickness: 50
  };

  if (!data?.competitors?.length) {
    return (
      <div style={{ 
        height: '300px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
      }}>
        <p>No competitor data available</p>
      </div>
    );
  }

  return (
    <div style={{ height: '400px', padding: '20px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default CompetitorsBarChart;
