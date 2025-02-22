import React, { useState } from 'react';
import {
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Box,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  InputAdornment,
} from '@mui/material';
import { db } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { analyzeStartupIdea } from '../services/openai';
import useAuth from '../hooks/useAuth';
import AnalysisDashboard from './AnalysisDashboard';

const INDUSTRIES = [
  'AI',
  'E-commerce',
  'FinTech',
  'Healthcare',
  'EdTech',
  'Other'
];

const TARGET_USERS = [
  'Businesses',
  'Consumers',
  'Enterprises',
  'Students',
  'Other'
];

const BUSINESS_MODELS = [
  'Subscription',
  'Freemium',
  'Ads',
  'One-time Purchase',
  'Other'
];

const USER_ACQUISITION = [
  'Ads',
  'Partnerships',
  'Social Media',
  'SEO',
  'Cold Outreach',
  'Other'
];

const MARKET_SIZES = [
  'Small',
  'Medium',
  'Large',
  'Global'
];

const BREAKEVEN_TIMES = [
  '3 months',
  '6 months',
  '1 year',
  '2 years',
  'More than 2 years'
];

const MARKET_TRENDS = [
  'AI Boom',
  'Remote Work',
  'Sustainability',
  'Digital Payments',
  'Cloud Computing',
  'Other'
];

const StartupForm = () => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState(null);

  const [formData, setFormData] = useState({
    // Basic Startup Info
    startupIdea: '',
    industry: '',
    problemSolution: '',

    // Market & Competition
    operationLocation: '',
    targetUsers: '',
    hasCompetitors: 'no',
    competitors: '',
    uniqueIdea: '',
    userAcquisition: '',

    // Financial & Growth
    needFunding: 'not_sure',
    initialInvestment: '',
    businessModel: '',
    revenuePerUser: '',
    breakEvenTime: '',

    // Growth & Market
    marketSize: '',
    userGrowthRate: '',
    supportingTrends: [],

    // AI & Reports
    needAiStrategies: 'no',
    needBenchmarking: 'no',
    needPdfReport: 'no'
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMultiSelect = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Analyze the startup idea using OpenAI
      const analysisResult = await analyzeStartupIdea(formData);
      setAnalysis(analysisResult);

      // Save to Firestore
      if (user) {
        await addDoc(collection(db, 'startupAnalysis'), {
          ...formData,
          analysis: analysisResult,
          userId: user.uid,
          timestamp: new Date().toISOString()
        });
      }

      handleNext();
    } catch (err) {
      setError('Failed to analyze startup idea. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderBasicInfo = () => (
    <Card sx={{ mt: 2, p: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          1️⃣ Basic Startup Idea & Category Detection
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="What is your startup idea?"
              name="startupIdea"
              value={formData.startupIdea}
              onChange={handleChange}
              multiline
              rows={4}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Industry</InputLabel>
              <Select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                required
              >
                {INDUSTRIES.map(industry => (
                  <MenuItem key={industry} value={industry}>{industry}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="What problem does your startup solve?"
              name="problemSolution"
              value={formData.problemSolution}
              onChange={handleChange}
              multiline
              rows={3}
              required
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderMarketAnalysis = () => (
    <Card sx={{ mt: 2, p: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          2️⃣ Market & Competition Analysis
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Where will your startup operate?"
              name="operationLocation"
              value={formData.operationLocation}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Target Users</InputLabel>
              <Select
                name="targetUsers"
                value={formData.targetUsers}
                onChange={handleChange}
                required
              >
                {TARGET_USERS.map(user => (
                  <MenuItem key={user} value={user}>{user}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Are there existing competitors?</InputLabel>
              <Select
                name="hasCompetitors"
                value={formData.hasCompetitors}
                onChange={handleChange}
                required
              >
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="no">No</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {formData.hasCompetitors === 'yes' ? (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Who are your top competitors?"
                name="competitors"
                value={formData.competitors}
                onChange={handleChange}
                multiline
                rows={2}
              />
            </Grid>
          ) : (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="How is your idea unique?"
                name="uniqueIdea"
                value={formData.uniqueIdea}
                onChange={handleChange}
                multiline
                rows={2}
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>User Acquisition Strategy</InputLabel>
              <Select
                name="userAcquisition"
                value={formData.userAcquisition}
                onChange={handleChange}
                required
              >
                {USER_ACQUISITION.map(strategy => (
                  <MenuItem key={strategy} value={strategy}>{strategy}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderFinancialInfo = () => (
    <Card sx={{ mt: 2, p: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          3️⃣ Financial & Growth Potential
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Do you plan to raise funding?</InputLabel>
              <Select
                name="needFunding"
                value={formData.needFunding}
                onChange={handleChange}
                required
              >
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="no">No</MenuItem>
                <MenuItem value="not_sure">Not Sure</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Estimated Initial Investment"
              name="initialInvestment"
              value={formData.initialInvestment}
              onChange={handleChange}
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Business Model</InputLabel>
              <Select
                name="businessModel"
                value={formData.businessModel}
                onChange={handleChange}
                required
              >
                {BUSINESS_MODELS.map(model => (
                  <MenuItem key={model} value={model}>{model}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Expected Revenue per User"
              name="revenuePerUser"
              value={formData.revenuePerUser}
              onChange={handleChange}
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Estimated Break-even Time</InputLabel>
              <Select
                name="breakEvenTime"
                value={formData.breakEvenTime}
                onChange={handleChange}
                required
              >
                {BREAKEVEN_TIMES.map(time => (
                  <MenuItem key={time} value={time}>{time}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderGrowthTrends = () => (
    <Card sx={{ mt: 2, p: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          4️⃣ Growth & Market Trends
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Market Size</InputLabel>
              <Select
                name="marketSize"
                value={formData.marketSize}
                onChange={handleChange}
                required
              >
                {MARKET_SIZES.map(size => (
                  <MenuItem key={size} value={size}>{size}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Expected User Growth Rate (% per year)"
              name="userGrowthRate"
              value={formData.userGrowthRate}
              onChange={handleChange}
              type="number"
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Supporting Market Trends</InputLabel>
              <Select
                multiple
                name="supportingTrends"
                value={formData.supportingTrends}
                onChange={handleMultiSelect}
                required
              >
                {MARKET_TRENDS.map(trend => (
                  <MenuItem key={trend} value={trend}>{trend}</MenuItem>
                ))}
              </Select>
              <FormHelperText>Select all that apply</FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderAIOptions = () => (
    <Card sx={{ mt: 2, p: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          5️⃣ AI & Report Generation
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.needAiStrategies === 'yes'}
                  onChange={(e) => handleChange({
                    target: {
                      name: 'needAiStrategies',
                      value: e.target.checked ? 'yes' : 'no'
                    }
                  })}
                />
              }
              label="Generate AI-powered business strategies"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.needBenchmarking === 'yes'}
                  onChange={(e) => handleChange({
                    target: {
                      name: 'needBenchmarking',
                      value: e.target.checked ? 'yes' : 'no'
                    }
                  })}
                />
              }
              label="Include competitor benchmarking"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.needPdfReport === 'yes'}
                  onChange={(e) => handleChange({
                    target: {
                      name: 'needPdfReport',
                      value: e.target.checked ? 'yes' : 'no'
                    }
                  })}
                />
              }
              label="Generate PDF report"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const steps = [
    {
      label: 'Basic Info',
      content: renderBasicInfo
    },
    {
      label: 'Market Analysis',
      content: renderMarketAnalysis
    },
    {
      label: 'Financial Info',
      content: renderFinancialInfo
    },
    {
      label: 'Growth Trends',
      content: renderGrowthTrends
    },
    {
      label: 'AI Options',
      content: renderAIOptions
    }
  ];

  return (
    <Box sx={{ width: '100%', mt: 3 }}>
      <Stepper activeStep={activeStep}>
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel>{step.label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {activeStep === steps.length ? (
          <AnalysisDashboard analysis={analysis} />
        ) : (
          <>
            {steps[activeStep].content()}
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                Back
              </Button>
              
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    'Analyze Startup'
                  )}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default StartupForm;
