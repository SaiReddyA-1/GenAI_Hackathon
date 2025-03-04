import React, { useEffect, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const MarketShareChart = ({ data }) => {
  useEffect(() => {
    console.log('MarketShareChart - Received data:', data);
  }, [data]);

  // Transform data for the pie chart
  const chartData = useMemo(() => {
    if (!data?.competitors || data.competitors.length === 0) {
      return [
        { name: 'Company A', value: 35 },
        { name: 'Company B', value: 25 },
        { name: 'Company C', value: 20 },
        { name: 'Others', value: 20 },
      ];
    }

    const competitorsData = data.competitors.map((competitor) => ({
      name: competitor.name,
      value: parseFloat(competitor.marketShare || 0),
    }));

    // Calculate total market share of known competitors
    const totalKnownShare = competitorsData.reduce((sum, item) => sum + item.value, 0);
    
    // Only add "Others" if the total is less than 100%
    if (totalKnownShare < 100) {
      competitorsData.push({
        name: 'Others',
        value: 100 - totalKnownShare
      });
    }
    
    return competitorsData;
  }, [data]);

  // Ensure values are not too high - normalize if needed
  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);
  if (totalValue > 0 && totalValue !== 100) {
    chartData.forEach(item => {
      item.value = parseFloat(((item.value / totalValue) * 100).toFixed(1));
    });
  }

  console.log('MarketShareChart - Transformed data:', chartData);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <Box sx={{ width: '100%', height: 300, position: 'relative' }}>
      <Typography 
        variant="subtitle2" 
        sx={{ 
          position: 'absolute', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          textAlign: 'center', 
          fontSize: '0.7rem', 
          color: 'text.secondary',
          fontStyle: 'italic',
          padding: '4px'
        }}
      >
        Note: Market share data shows AI-generated estimates and may not reflect exact real-world values
      </Typography>
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
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
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
