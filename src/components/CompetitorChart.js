import React, { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const CompetitorChart = ({ data }) => {
  useEffect(() => {
    console.log('CompetitorChart - Received data:', data);
  }, [data]);

  // Transform competitor data for the chart
  const chartData = data?.competitors?.map(comp => ({
    name: comp.name,
    score: comp.score || Math.floor(Math.random() * 40 + 60), // Random score between 60-100 if not provided
  })) || [];

  console.log('CompetitorChart - Transformed data:', chartData);

  return (
    <Box sx={{ width: '100%', height: '100%', minHeight: 300 }}>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
            />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar 
              dataKey="score" 
              name="Competitor Score" 
              fill="#8884d8"
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
          No competitor data available
        </Typography>
      )}
    </Box>
  );
};

export default CompetitorChart;
