import React, { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const MarketGrowthChart = ({ data }) => {
  useEffect(() => {
    console.log('MarketGrowthChart - Received data:', data);
  }, [data]);

  // Sample data points for market growth
  const chartData = data?.growthData || [
    { year: '2024', value: 100 },
    { year: '2025', value: 124 },
    { year: '2026', value: 154 },
    { year: '2027', value: 191 },
    { year: '2028', value: 237 },
  ];

  console.log('MarketGrowthChart - Using data:', chartData);

  return (
    <Box sx={{ width: '100%', height: '100%', minHeight: 300 }}>
      <Typography variant="h6" component="h3" sx={{ mb: 2, textAlign: 'center' }}>
        Market Growth Trend
      </Typography>
      {data ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip formatter={(value) => `$${value}B`} />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              name="Market Size ($B)"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
          No market growth data available
        </Typography>
      )}
    </Box>
  );
};

export default MarketGrowthChart;
