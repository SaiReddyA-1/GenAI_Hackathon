import React, { useState } from 'react';
import {
  TextField,
  Button,
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
  IconButton,
  Tooltip,
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

// Sample test data for quick form filling
const SAMPLE_DATA = {
  // Basic Startup Info
  startupIdea: "AI-powered health monitoring wearable that predicts potential health issues before they become serious. The device uses advanced machine learning to analyze real-time health data and provides early warnings for various medical conditions.",
  industry: 'Healthcare',
  problemSolution: "Traditional health monitoring is reactive rather than proactive. Our solution uses AI to predict health issues days or weeks before symptoms appear, potentially saving lives through early intervention.",

  // Market & Competition
  operationLocation: 'Global, starting with US and Europe',
  targetUsers: 'Consumers',
  hasCompetitors: 'yes',
  competitors: 'Apple Health, Fitbit, Samsung Health',
  userAcquisition: 'Partnerships',

  // Financial & Growth
  needFunding: 'yes',
  initialInvestment: '5000000',
  businessModel: 'Subscription',
  revenuePerUser: '29.99',
  breakEvenTime: '2 years',

  // Growth & Market
  marketSize: 'Large',
  userGrowthRate: '45',
  supportingTrends: ['AI Boom', 'Digital Payments'],

  // AI & Reports
  needAiStrategies: 'yes',
  needBenchmarking: 'yes',
  needPdfReport: 'yes'
};

const StartupForm = () => {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [formErrors, setFormErrors] = useState({});

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
    let errors = {};
    
    switch (activeStep) {
      case 0:
        errors = validateBasicInfo(formData);
        break;
      case 1:
        errors = validateMarketInfo(formData);
        break;
      case 2:
        errors = validateFinancialInfo(formData);
        break;
      default:
        break;
    }

    if (Object.keys(errors).length === 0) {
      setActiveStep((prevStep) => prevStep + 1);
      setFormErrors({});
    } else {
      setFormErrors(errors);
    }
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
      
      if (!analysisResult) {
        throw new Error('Failed to generate analysis');
      }

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

      // Move to analysis step
      setActiveStep(STEPS.length);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze startup idea. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to fill form with sample data
  const fillWithSampleData = () => {
    setFormData(SAMPLE_DATA);
  };

  // Validation helper functions
  const validateBasicInfo = (data) => {
    const errors = {};
    if (!data.startupIdea?.trim()) errors.startupIdea = 'Startup idea is required';
    if (!data.industry) errors.industry = 'Industry is required';
    if (!data.problemSolution?.trim()) errors.problemSolution = 'Problem & solution is required';
    if (data.problemSolution?.length < 50) errors.problemSolution = 'Problem & solution should be at least 50 characters';
    return errors;
  };

  const validateMarketInfo = (data) => {
    const errors = {};
    if (!data.operationLocation?.trim()) errors.operationLocation = 'Operation location is required';
    if (!data.targetUsers) errors.targetUsers = 'Target users is required';
    if (!data.userAcquisition) errors.userAcquisition = 'User acquisition strategy is required';
    return errors;
  };

  const validateFinancialInfo = (data) => {
    const errors = {};
    if (!data.needFunding || data.needFunding === 'not_sure') {
      errors.needFunding = 'Please select if you need funding';
    }
    if (data.needFunding === 'yes' && (!data.initialInvestment || data.initialInvestment <= 0)) {
      errors.initialInvestment = 'Initial investment must be greater than 0';
    }
    if (!data.businessModel) errors.businessModel = 'Business model is required';
    if (!data.revenuePerUser || data.revenuePerUser <= 0) {
      errors.revenuePerUser = 'Revenue per user must be greater than 0';
    }
    return errors;
  };

  const renderBasicInfo = () => (
    <Card sx={{ mt: 2, p: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          1️⃣ Basic Startup Information
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Startup Idea"
              name="startupIdea"
              value={formData.startupIdea}
              onChange={handleChange}
              multiline
              rows={4}
              required
              helperText="Describe your startup idea in detail"
              error={!!formErrors.startupIdea}
              helperText={formErrors.startupIdea}
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
                error={!!formErrors.industry}
              >
                {INDUSTRIES.map(industry => (
                  <MenuItem key={industry} value={industry}>{industry}</MenuItem>
                ))}
              </Select>
              <FormHelperText>{formErrors.industry}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Problem & Solution"
              name="problemSolution"
              value={formData.problemSolution}
              onChange={handleChange}
              multiline
              rows={4}
              required
              helperText="Describe the problem you're solving and your solution"
              error={!!formErrors.problemSolution}
              helperText={formErrors.problemSolution}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderMarketInfo = () => (
    <Card sx={{ mt: 2, p: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          2️⃣ Market & Competition
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Operation Location"
              name="operationLocation"
              value={formData.operationLocation}
              onChange={handleChange}
              required
              helperText="Where will your startup operate?"
              error={!!formErrors.operationLocation}
              helperText={formErrors.operationLocation}
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
                error={!!formErrors.targetUsers}
              >
                {TARGET_USERS.map(user => (
                  <MenuItem key={user} value={user}>{user}</MenuItem>
                ))}
              </Select>
              <FormHelperText>{formErrors.targetUsers}</FormHelperText>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>User Acquisition Strategy</InputLabel>
              <Select
                name="userAcquisition"
                value={formData.userAcquisition}
                onChange={handleChange}
                required
                error={!!formErrors.userAcquisition}
              >
                {USER_ACQUISITION.map(strategy => (
                  <MenuItem key={strategy} value={strategy}>{strategy}</MenuItem>
                ))}
              </Select>
              <FormHelperText>{formErrors.userAcquisition}</FormHelperText>
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
          3️⃣ Financial & Growth
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.needFunding === 'yes'}
                  onChange={(e) => handleChange({
                    target: {
                      name: 'needFunding',
                      value: e.target.checked ? 'yes' : 'no'
                    }
                  })}
                />
              }
              label="Do you need funding?"
            />
            {formErrors.needFunding && (
              <FormHelperText error={true}>{formErrors.needFunding}</FormHelperText>
            )}
          </Grid>
          {formData.needFunding === 'yes' && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Initial Investment Needed"
                name="initialInvestment"
                value={formData.initialInvestment}
                onChange={handleChange}
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                required
                error={!!formErrors.initialInvestment}
                helperText={formErrors.initialInvestment}
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Business Model</InputLabel>
              <Select
                name="businessModel"
                value={formData.businessModel}
                onChange={handleChange}
                required
                error={!!formErrors.businessModel}
              >
                {BUSINESS_MODELS.map(model => (
                  <MenuItem key={model} value={model}>{model}</MenuItem>
                ))}
              </Select>
              <FormHelperText>{formErrors.businessModel}</FormHelperText>
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
              error={!!formErrors.revenuePerUser}
              helperText={formErrors.revenuePerUser}
            />
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
              <FormHelperText>Select trends that support your startup</FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderAiOptions = () => (
    <Card sx={{ mt: 2, p: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          5️⃣ AI & Reports
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
              label="Generate AI-powered growth strategies"
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

  const STEPS = [
    {
      label: 'Basic Info',
      content: renderBasicInfo
    },
    {
      label: 'Market & Competition',
      content: renderMarketInfo
    },
    {
      label: 'Financial & Growth',
      content: renderFinancialInfo
    },
    {
      label: 'Growth & Market Trends',
      content: renderGrowthTrends
    },
    {
      label: 'AI & Reports',
      content: renderAiOptions
    }
  ];

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Startup Analysis Platform
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {STEPS.map((step, index) => (
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

        {activeStep === STEPS.length ? (
          analysis ? (
            <AnalysisDashboard analysis={analysis} />
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
              <CircularProgress />
            </Box>
          )
        ) : (
          <>
            {STEPS[activeStep].content()}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button
                onClick={fillWithSampleData}
                variant="outlined"
                color="secondary"
              >
                Fill Test Data
              </Button>
              
              <Box>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  Back
                </Button>
                
                {activeStep === STEPS.length - 1 ? (
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
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default StartupForm;
