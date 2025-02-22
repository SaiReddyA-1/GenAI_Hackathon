import React, { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const MarketShareChart = ({ data }) => {
  useEffect(() => {
    console.log('MarketShareChart - Received data:', data);
  }, [data]);

  // Transform data for the pie chart
  const chartData = data?.competitors?.map((competitor) => ({
    name: competitor.name,
    value: parseFloat(competitor.marketShare || 0),
  })) || [
    { name: 'Company A', value: 35 },
    { name: 'Company B', value: 25 },
    { name: 'Company C', value: 20 },
    { name: 'Others', value: 20 },
  ];

  console.log('MarketShareChart - Transformed data:', chartData);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <Box sx={{ width: '100%', height: '100%', minHeight: 300 }}>
      <Typography variant="h6" component="h3" sx={{ mb: 2, textAlign: 'center' }}>
        Market Share Distribution
      </Typography>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
          No market share data available
        </Typography>
      )}
    </Box>
  );
};

export default MarketShareChart;
