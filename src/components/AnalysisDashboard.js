import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Tab,
  Tabs,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { jsPDF } from 'jspdf';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ChatIcon from '@mui/icons-material/Chat';
import DownloadIcon from '@mui/icons-material/Download';
import InfoIcon from '@mui/icons-material/Info';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AnalysisDashboard = ({ data }) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);

  const handleExport = () => {
    const doc = new jsPDF();
    doc.text('Startup Analysis Report', 20, 20);
    doc.text(`Startup Idea: ${data.startupIdea}`, 20, 30);
    doc.text(`Industry: ${data.industry}`, 20, 40);
    doc.text(`Target Market: ${data.targetMarket}`, 20, 50);
    doc.text(`Market Size: $${(data.marketInsights.marketSize / 1000000).toFixed(1)}M`, 20, 60);
    doc.save('startup-analysis.pdf');
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: Implement bookmark functionality with Firebase
  };

  const handleMetricClick = (metric) => {
    setSelectedMetric(metric);
  };

  const renderMarketMetrics = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Market Size & Growth
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.marketInsights.growthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Market Share Distribution
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.competitorData}
                dataKey="share"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {data.competitorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderCompetitorAnalysis = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Competitor Analysis
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Competitor</TableCell>
                  <TableCell>Market Share</TableCell>
                  <TableCell>Strengths</TableCell>
                  <TableCell>Weaknesses</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.competitorData.map((competitor) => (
                  <TableRow key={competitor.name}>
                    <TableCell>{competitor.name}</TableCell>
                    <TableCell>{competitor.share}%</TableCell>
                    <TableCell>{competitor.strengths.join(', ')}</TableCell>
                    <TableCell>{competitor.weaknesses.join(', ')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderFinancialInsights = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Revenue Projections
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.marketInsights.revenueProjections}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <RechartsTooltip />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Risk Assessment
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={data.marketInsights.risks}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis angle={30} domain={[0, 1]} />
              <Radar dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">
            Analysis Results
          </Typography>
          <Box>
            <Tooltip title="Chat with AI Assistant">
              <IconButton onClick={() => setChatOpen(true)}>
                <ChatIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={isBookmarked ? "Remove Bookmark" : "Bookmark Analysis"}>
              <IconButton onClick={handleBookmark}>
                {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Export as PDF">
              <IconButton onClick={handleExport}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Typography variant="body1" color="text.secondary">
          {data.startupIdea}
        </Typography>
      </Paper>

      <Tabs
        value={currentTab}
        onChange={(e, newValue) => setCurrentTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Market Metrics" />
        <Tab label="Competitor Analysis" />
        <Tab label="Financial Insights" />
      </Tabs>

      {currentTab === 0 && renderMarketMetrics()}
      {currentTab === 1 && renderCompetitorAnalysis()}
      {currentTab === 2 && renderFinancialInsights()}

      <Dialog open={chatOpen} onClose={() => setChatOpen(false)}>
        <DialogTitle>AI Assistant</DialogTitle>
        <DialogContent>
          <Typography>
            Ask questions about your analysis results and get AI-powered insights.
          </Typography>
          {/* TODO: Implement chat interface */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChatOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(selectedMetric)}
        onClose={() => setSelectedMetric(null)}
      >
        <DialogTitle>{selectedMetric?.title}</DialogTitle>
        <DialogContent>
          <Typography>{selectedMetric?.description}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedMetric(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnalysisDashboard;
