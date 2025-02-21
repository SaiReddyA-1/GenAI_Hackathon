import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import html2pdf from 'html2pdf.js';
import { 
  TrendingUp, 
  Group, 
  AttachMoney, 
  Warning,
  Download
} from '@mui/icons-material';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AnalysisDashboard = ({ analysis }) => {
  if (!analysis) return null;

  const marketData = [
    { name: 'Market Size', value: analysis.marketInsights?.marketSize || 0 },
    { name: 'Growth Rate', value: 25 },
    { name: 'Market Share', value: 5 },
    { name: 'Competition', value: 15 }
  ];

  const competitorData = [
    { name: 'Direct', value: 30 },
    { name: 'Indirect', value: 45 },
    { name: 'Potential', value: 25 }
  ];

  const exportToPDF = () => {
    const element = document.getElementById('analysis-dashboard');
    const opt = {
      margin: 1,
      filename: 'startup-analysis.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <Box id="analysis-dashboard" sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Startup Analysis Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={exportToPDF}
        >
          Export PDF
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Key Metrics */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUp color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Market Size</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ mt: 2 }}>
                    {analysis.marketInsights?.marketSize || 'N/A'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Group color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Target Users</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ mt: 2 }}>
                    {analysis.marketInsights?.targetSegments?.length || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AttachMoney color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Revenue Potential</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ mt: 2 }}>High</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Warning color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Risk Level</Typography>
                  </Box>
                  <Typography variant="h4" sx={{ mt: 2 }}>Medium</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Market Analysis Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '400px' }}>
            <Typography variant="h6" gutterBottom>Market Analysis</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={marketData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Competitor Analysis */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '400px' }}>
            <Typography variant="h6" gutterBottom>Competitor Analysis</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={competitorData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {competitorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Keyword Analysis */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Keyword Analysis</Typography>
            <Grid container spacing={2}>
              {Object.entries(analysis.keywordAnalysis || {}).map(([category, keywords]) => (
                <Grid item xs={12} sm={6} md={4} key={category}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" color="primary">
                        {category.replace('_', ' ').toUpperCase()}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        {keywords.map((keyword, index) => (
                          <Typography key={index} variant="body2">
                            • {keyword}
                          </Typography>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Recommendations */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Recommendations</Typography>
            <Grid container spacing={2}>
              {analysis.recommendations?.map((recommendation, index) => (
                <Grid item xs={12} key={index}>
                  <Typography variant="body1">
                    • {recommendation}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Risk Assessment */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Risk Assessment</Typography>
            <Grid container spacing={2}>
              {analysis.riskAssessment?.keyRisks?.map((risk, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" color="error">
                        Risk {index + 1}
                      </Typography>
                      <Typography variant="body1">{risk}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalysisDashboard;
