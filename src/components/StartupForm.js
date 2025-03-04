import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from 'firebase/firestore';
import { analyzeStartupIdea } from '../services/openai';
import { getCompetitorsWithGemini, getStartupInsightsWithGemini } from '../services/gemini';
import useAuth from '../hooks/useAuth';
import ReactMarkdown from 'react-markdown';

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'E-commerce', 'Education', 
  'Entertainment', 'Food & Beverage', 'Real Estate', 'Transportation',
  'Energy', 'Manufacturing', 'Retail', 'Consulting', 'Agriculture',
  'Hospitality', 'Media', 'Fashion', 'Fitness', 'Travel'
];

const STEPS = [
  'Startup Information',
  'Generate Report'
];

const StartupForm = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    startupIdea: '',
    industry: '',
    operationLocation: ''
  });
  const [errors, setErrors] = useState({
    startupIdea: false,
    industry: false,
    operationLocation: false
  });
  const [loadingStage, setLoadingStage] = useState('');
  const [error, setError] = useState('');
  const [competitors, setCompetitors] = useState([]); 
  const [insights, setInsights] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const { user } = useAuth();

  // Check for returnToStep in localStorage when component mounts
  useEffect(() => {
    const savedStep = localStorage.getItem('returnToStep');
    if (savedStep) {
      setActiveStep(parseInt(savedStep));
      
      // Also retrieve saved insights and formData if available
      const savedInsights = localStorage.getItem('savedInsights');
      const savedFormData = localStorage.getItem('savedFormData');
      const savedCompetitors = localStorage.getItem('savedCompetitors');
      
      if (savedInsights) {
        setInsights(JSON.parse(savedInsights));
      }
      
      if (savedFormData) {
        setFormData(JSON.parse(savedFormData));
      }
      
      if (savedCompetitors) {
        setCompetitors(JSON.parse(savedCompetitors));
      }
      
      // Clear localStorage after using
      localStorage.removeItem('returnToStep');
    }
  }, []);

  // Function to fetch analysis history from Firestore
  const fetchAnalysisHistory = async () => {
    if (!user) return;
    
    try {
      setLoadingHistory(true);
      setShowHistory(true);
      
      const analysisQuery = query(
        collection(db, 'marketAnalysis'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(analysisQuery);
      const historyItems = [];
      
      querySnapshot.forEach((doc) => {
        historyItems.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setHistoryData(historyItems);
    } catch (error) {
      console.error('Error fetching history:', error);
      setError('Failed to load analysis history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const renderBasicInfo = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h5" component="h2" sx={{ mb: 3, color: '#e2e8f0' }}>
          Tell us about your startup
        </Typography>
        
        <TextField
          fullWidth
          id="startupIdea"
          label="What's your innovative idea and problem it solves?"
          variant="outlined"
          multiline
          rows={4}
          value={formData.startupIdea}
          onChange={(e) => handleFormChange('startupIdea', e.target.value)}
          error={errors.startupIdea}
          helperText={errors.startupIdea ? 'Please describe your startup idea and the problem it solves' : ''}
          sx={{
            mb: 4,
            '& .MuiInputLabel-root': {
              color: '#a0aec0',
              '&.Mui-focused': {
                color: '#6c5ce7'
              }
            },
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#1e2430',
              '& input, & textarea': {
                color: '#000000',
                '&::placeholder': {
                  color: '#a0aec0',
                  opacity: 0.7
                }
              },
              '& fieldset': {
                borderColor: 'transparent'
              },
              '&:hover fieldset': {
                borderColor: '#6c5ce7'
              },
              '&.Mui-focused fieldset': {
                borderColor: '#6c5ce7'
              }
            },
            '& .MuiFormHelperText-root': {
              color: '#a0aec0'
            }
          }}
        />

        <FormControl 
          fullWidth 
          variant="outlined" 
          error={errors.industry}
          sx={{ 
            mb: 4,
            '& .MuiInputLabel-root': {
              color: '#a0aec0',
              '&.Mui-focused': {
                color: '#6c5ce7'
              }
            },
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#1e2430',
              '& .MuiSelect-select': {
                color: '#000000'
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'transparent'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#6c5ce7'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#6c5ce7'
              },
              '& .MuiSelect-icon': {
                color: '#a0aec0'
              }
            },
            '& .MuiFormHelperText-root': {
              color: '#a0aec0'
            }
          }}
        >
          <InputLabel id="industry-label">Industry</InputLabel>
          <Select
            labelId="industry-label"
            id="industry"
            value={formData.industry}
            onChange={(e) => handleFormChange('industry', e.target.value)}
            label="Industry"
          >
            <MenuItem value="">
              <em>Select an industry</em>
            </MenuItem>
            {INDUSTRIES.map((industry) => (
              <MenuItem key={industry} value={industry}>{industry}</MenuItem>
            ))}
          </Select>
          {errors.industry && (
            <FormHelperText>Please select an industry</FormHelperText>
          )}
        </FormControl>
        
        <TextField
          fullWidth
          id="operationLocation"
          label="Primary operation location (city/country)"
          variant="outlined"
          value={formData.operationLocation}
          onChange={(e) => handleFormChange('operationLocation', e.target.value)}
          error={errors.operationLocation}
          helperText={errors.operationLocation ? 'Please enter your operation location' : ''}
          sx={{
            mb: 4,
            '& .MuiInputLabel-root': {
              color: '#a0aec0',
              '&.Mui-focused': {
                color: '#6c5ce7'
              }
            },
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#1e2430',
              '& input, & textarea': {
                color: '#000000',
                '&::placeholder': {
                  color: '#a0aec0',
                  opacity: 0.7
                }
              },
              '& fieldset': {
                borderColor: 'transparent'
              },
              '&:hover fieldset': {
                borderColor: '#6c5ce7'
              },
              '&.Mui-focused fieldset': {
                borderColor: '#6c5ce7'
              }
            },
            '& .MuiFormHelperText-root': {
              color: '#a0aec0'
            }
          }}
        />
      </Grid>
    </Grid>
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderBasicInfo();
      default:
        return null;
    }
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: false
      }));
    }
  };

  const handleNext = () => {
    if (activeStep === STEPS.length - 2) {
      handleSubmit();
    } else {
      const nextStep = activeStep + 1;
      
      // Update step
      setActiveStep(nextStep);
      
      // Update browser history (this will be redundant with the useEffect,
      // but ensures the formData in history state is current)
      const stateName = nextStep === 0 ? 'startup-information' : 'generate-report';
      window.history.pushState(
        { step: nextStep, formData: JSON.stringify(formData) },
        '',
        `${window.location.pathname}#${stateName}`
      );
    }
  };

  const handleBack = () => {
    // If on the first step, navigate to landing page
    if (activeStep === 0) {
      navigate('/');
      return;
    }
    
    // Calculate previous step
    const prevStep = activeStep - 1;
    
    // Reset insights when going back to form to ensure form questions are displayed
    if (activeStep === 1) {
      // Keep a copy of form data to ensure values are preserved
      const formDataCopy = { ...formData };
      setInsights(null);
      // Restore form data after resetting insights
      setFormData(formDataCopy);
    }
    
    // Update step state
    setActiveStep(prevStep);
    
    // Update browser history
    const stateName = prevStep === 0 ? 'startup-information' : 'generate-report';
    window.history.pushState(
      { step: prevStep, formData: JSON.stringify(formData) },
      '',
      `${window.location.pathname}#${stateName}`
    );
  };

  const saveToFirebase = async (marketData) => {
    try {
      // Prepare business strategy data to ensure arrays are properly handled
      let preparedData = { ...marketData };
      
      // Ensure businessStrategy exists
      if (preparedData.businessStrategy) {
        // Convert arrays to strings to avoid issues with Firebase
        if (Array.isArray(preparedData.businessStrategy.userAcquisitionStrategy)) {
          preparedData.businessStrategy.userAcquisitionStrategy = 
            preparedData.businessStrategy.userAcquisitionStrategy.join('|||');
        }
        
        if (Array.isArray(preparedData.businessStrategy.marketTrends)) {
          preparedData.businessStrategy.marketTrends = 
            preparedData.businessStrategy.marketTrends.join('|||');
        }
        
        if (Array.isArray(preparedData.businessStrategy.businessModels)) {
          preparedData.businessStrategy.businessModels = 
            preparedData.businessStrategy.businessModels.join('|||');
        }
      }
      
      const docRef = await addDoc(collection(db, 'marketAnalysis'), {
        userId: user.uid,
        timestamp: serverTimestamp(),
        marketData: {
          ...preparedData,
          swot: preparedData.swot || {
            strengths: [],
            weaknesses: [],
            opportunities: [],
            threats: []
          }
        }
      });
      return docRef.id;
    } catch (err) {
      console.error('Error saving to Firebase:', err);
      // Check for connection refused error (common when emulator isn't running)
      if (err.message && (err.message.includes('ERR_CONNECTION_REFUSED') || 
                          err.message.includes('Failed to fetch'))) {
        throw new Error('Could not connect to Firebase. If you are in development mode, please make sure the Firebase emulator is running.');
      }
      throw err;
    }
  };

  const removeMarkdown = (text) => {
    if (!text) return '';
    return text
      .replace(/\*\*/g, '') // Remove bold
      .replace(/\*/g, '')   // Remove italic
      .replace(/^-\s+/gm, '') // Remove list bullets
      .replace(/^\d+\.\s+/gm, '') // Remove numbered lists
      .replace(/`/g, ''); // Remove code blocks
  };

  const validateForm = () => {
    const newErrors = {
      startupIdea: !formData.startupIdea.trim(),
      industry: !formData.industry.trim(),
      operationLocation: !formData.operationLocation.trim(),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Start loading sequence for competitor analysis
    setLoadingStage('Analyzing Startup Idea...');
    setError('');

    try {
      // Get competitors using Gemini
      const competitorData = await getCompetitorsWithGemini(formData);
      setCompetitors(competitorData);

      // Get startup insights using Gemini
      setLoadingStage('Generating Market Analysis...');
      const insightsData = await getStartupInsightsWithGemini(formData);
      setInsights(insightsData);

      // Proceed to showing results
      setLoadingStage('');
      setActiveStep(1);

      // Save analysis to Firebase
      if (user) {
        try {
          // Ensure competitors have consistent property names
          const mappedCompetitors = competitorData.map(comp => ({
            name: comp.name || '',
            marketShare: typeof comp.marketShare === 'number' ? comp.marketShare : 0,
            // Handle different possible property names for these fields
            targetAudience: comp.targetAudience || comp.targetMarket || '',
            marketingStrategies: comp.marketingStrategies || comp.strategies || ''
          }));
          
          const completeData = {
            ...formData,
            competitors: mappedCompetitors,
            ...insightsData
          };
          
          const savedId = await saveToFirebase(completeData);
          
          console.log('Analysis saved with ID:', savedId);
          
          // Store the complete data in localStorage for the dashboard charts
          localStorage.setItem('marketAnalysisData', JSON.stringify({
            ...completeData,
            analysisId: savedId
          }));
        } catch (err) {
          console.error('Error saving to Firebase:', err);
          
          // Handle Firebase connection errors but still show analysis
          if (err.message && err.message.includes('Firebase emulator')) {
            setError('Firebase connection error: ' + err.message + 
              ' Your analysis has been generated but could not be saved.');
          } else {
            setError('Your analysis has been generated but could not be saved to the database.');
          }
          
          // Still store data in localStorage for dashboard charts even if Firebase save fails
          localStorage.setItem('marketAnalysisData', JSON.stringify({
            ...formData,
            competitors: competitorData,
            ...insightsData,
          }));
        }
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setError('Failed to complete analysis. Please try again.');
      setLoadingStage('');
    }
  };

  const renderCompetitorsStep = () => {
    if (loadingStage) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2, color: '#e2e8f0' }}>
            {loadingStage}
          </Typography>
        </Box>
      );
    }

    if (!competitors.length) {
      return (
        <Typography variant="body1" gutterBottom sx={{ color: '#a0aec0' }}>
          No competitors found.
        </Typography>
      );
    }

    return (
      <>
        <Typography variant="h5" sx={{ mb: 3, color: '#e2e8f0', borderBottom: '1px solid #3d4655', pb: 1 }}>
          Top Competitors
        </Typography>
        
        <Typography variant="subtitle2" gutterBottom sx={{ fontStyle: 'italic', textAlign: 'center', color: '#a0aec0' }}>
          Note: The market share data shown below is an AI-generated estimate based on available market information. These values should be considered approximate and used as a starting point for further research.
        </Typography>
        
        <Grid container spacing={3} direction="row">
          {competitors.map((competitor, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ 
                backgroundColor: '#1e2430', 
                borderRadius: 2, 
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ mb: 1, color: '#e2e8f0', borderBottom: '1px solid #3d4655', pb: 1 }}>
                    {competitor.name}
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#a0aec0' }}>
                      Market Share: 
                      <Typography component="span" variant="body2" sx={{ ml: 1, color: '#e2e8f0' }}>
                        {Math.round(competitor.marketShare)}%
                      </Typography>
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#a0aec0' }}>
                      Target Audience: 
                      <Typography component="span" variant="body2" sx={{ ml: 1, color: '#e2e8f0' }}>
                        {competitor.targetAudience}
                      </Typography>
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#a0aec0' }}>
                      Marketing Strategies: 
                      <Typography component="span" variant="body2" sx={{ ml: 1, color: '#e2e8f0' }}>
                        {competitor.marketingStrategies}
                      </Typography>
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Business Strategy Section */}
        {insights && insights.businessStrategy && (
          <Box sx={{ mt: 5 }}>
            <Typography variant="h5" sx={{ mb: 3, color: '#e2e8f0', borderBottom: '1px solid #3d4655', pb: 1 }}>
              Business Strategy Insights
            </Typography>
            
            <Grid container spacing={3}>
              {/* Target Users */}
              <Grid item xs={12}>
                <Card sx={{ backgroundColor: '#1e2430', borderRadius: 2, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: '#e2e8f0' }}>
                      Target Users
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#a0aec0' }}>
                      {removeMarkdown(insights.businessStrategy.targetUsers || 'No data available')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* User Acquisition Strategy */}
              <Grid item xs={12} md={6}>
                <Card sx={{ backgroundColor: '#1e2430', borderRadius: 2, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: '#e2e8f0' }}>
                      User Acquisition Strategy
                    </Typography>
                    {(() => {
                      // Handle both array and string formats
                      const strategies = insights.businessStrategy.userAcquisitionStrategy;
                      let strategyArray = [];
                      
                      if (Array.isArray(strategies) && strategies.length > 0) {
                        strategyArray = strategies;
                      } else if (typeof strategies === 'string' && strategies.trim()) {
                        strategyArray = strategies.split('|||').filter(Boolean);
                      }
                      
                      if (strategyArray.length > 0) {
                        return (
                          <List dense>
                            {strategyArray.map((strategy, index) => (
                              <ListItem key={index} sx={{ py: 0.5 }}>
                                <ListItemIcon sx={{ minWidth: 30 }}>
                                  <ArrowRightIcon sx={{ color: '#6c5ce7' }} />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={removeMarkdown(strategy)} 
                                  primaryTypographyProps={{ 
                                    variant: 'body2', 
                                    color: '#a0aec0' 
                                  }} 
                                />
                              </ListItem>
                            ))}
                          </List>
                        );
                      } else {
                        return (
                          <Typography variant="body2" sx={{ color: '#a0aec0' }}>
                            No strategies available
                          </Typography>
                        );
                      }
                    })()}
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Business Models */}
              <Grid item xs={12} md={6}>
                <Card sx={{ backgroundColor: '#1e2430', borderRadius: 2, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: '#e2e8f0' }}>
                      Business Models
                    </Typography>
                    {(() => {
                      // Handle both array and string formats
                      const models = insights.businessStrategy.businessModels;
                      let modelArray = [];
                      
                      if (Array.isArray(models) && models.length > 0) {
                        modelArray = models;
                      } else if (typeof models === 'string' && models.trim()) {
                        modelArray = models.split('|||').filter(Boolean);
                      }
                      
                      if (modelArray.length > 0) {
                        return (
                          <List dense>
                            {modelArray.map((model, index) => (
                              <ListItem key={index} sx={{ py: 0.5 }}>
                                <ListItemIcon sx={{ minWidth: 30 }}>
                                  <ArrowRightIcon sx={{ color: '#6c5ce7' }} />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={removeMarkdown(model)} 
                                  primaryTypographyProps={{ 
                                    variant: 'body2', 
                                    color: '#a0aec0' 
                                  }} 
                                />
                              </ListItem>
                            ))}
                          </List>
                        );
                      } else {
                        return (
                          <Typography variant="body2" sx={{ color: '#a0aec0' }}>
                            No business models available
                          </Typography>
                        );
                      }
                    })()}
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Metrics Row */}
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  {/* Revenue Per User */}
                  <Grid item xs={6} md={3}>
                    <Card sx={{ backgroundColor: '#1e2430', borderRadius: 2, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', height: '100%' }}>
                      <CardContent>
                        <Typography variant="subtitle2" sx={{ mb: 1, color: '#a0aec0' }}>
                          Revenue per User
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#6c5ce7' }}>
                          {removeMarkdown(insights.businessStrategy.revenuePerUser || 'N/A')}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Minimum Investment */}
                  <Grid item xs={6} md={3}>
                    <Card sx={{ backgroundColor: '#1e2430', borderRadius: 2, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', height: '100%' }}>
                      <CardContent>
                        <Typography variant="subtitle2" sx={{ mb: 1, color: '#a0aec0' }}>
                          Minimum Investment
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#6c5ce7' }}>
                          {removeMarkdown(insights.businessStrategy.minimumInvestment || 'N/A')}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Break-even Time */}
                  <Grid item xs={6} md={3}>
                    <Card sx={{ backgroundColor: '#1e2430', borderRadius: 2, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', height: '100%' }}>
                      <CardContent>
                        <Typography variant="subtitle2" sx={{ mb: 1, color: '#a0aec0' }}>
                          Break-even Time
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#6c5ce7' }}>
                          {removeMarkdown(insights.businessStrategy.breakEvenTime || 'N/A')}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* User Growth Rate */}
                  <Grid item xs={6} md={3}>
                    <Card sx={{ backgroundColor: '#1e2430', borderRadius: 2, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', height: '100%' }}>
                      <CardContent>
                        <Typography variant="subtitle2" sx={{ mb: 1, color: '#a0aec0' }}>
                          User Growth Rate
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#6c5ce7' }}>
                          {removeMarkdown(insights.businessStrategy.userGrowthRate || 'N/A')}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
              
              {/* Market Trends */}
              <Grid item xs={12}>
                <Card sx={{ backgroundColor: '#1e2430', borderRadius: 2, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: '#e2e8f0' }}>
                      Supporting Market Trends
                    </Typography>
                    {(() => {
                      // Handle both array and string formats
                      const trends = insights.businessStrategy.marketTrends;
                      let trendArray = [];
                      
                      if (Array.isArray(trends) && trends.length > 0) {
                        trendArray = trends;
                      } else if (typeof trends === 'string' && trends.trim()) {
                        trendArray = trends.split('|||').filter(Boolean);
                      }
                      
                      if (trendArray.length > 0) {
                        return (
                          <List dense>
                            {trendArray.map((trend, index) => (
                              <ListItem key={index} sx={{ py: 0.5 }}>
                                <ListItemIcon sx={{ minWidth: 30 }}>
                                  <TrendingUpIcon sx={{ color: '#6c5ce7' }} />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={removeMarkdown(trend)} 
                                  primaryTypographyProps={{ 
                                    variant: 'body2', 
                                    color: '#a0aec0' 
                                  }} 
                                />
                              </ListItem>
                            ))}
                          </List>
                        );
                      } else {
                        return (
                          <Typography variant="body2" sx={{ color: '#a0aec0' }}>
                            No market trends available
                          </Typography>
                        );
                      }
                    })()}
                  </CardContent>
                </Card>
              </Grid>
              
              {/* SWOT Analysis */}
              {insights && insights.swot && (
                <Grid item xs={12}>
                  <Box sx={{ mt: 5 }}>
                    <Typography variant="h5" sx={{ mb: 3, color: '#e2e8f0', borderBottom: '1px solid #3d4655', pb: 1 }}>
                      SWOT Analysis
                    </Typography>
                    
                    <Grid container spacing={3}>
                      {/* Strengths */}
                      <Grid item xs={12} md={6}>
                        <Card sx={{ backgroundColor: '#1e2430', borderRadius: 2, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', height: '100%' }}>
                          <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, color: '#4caf50' }}>
                              Strengths
                            </Typography>
                            {insights.swot.strengths && insights.swot.strengths.length > 0 ? (
                              <List dense>
                                {insights.swot.strengths.map((strength, index) => (
                                  <ListItem key={index} sx={{ py: 0.5 }}>
                                    <ListItemIcon sx={{ minWidth: 30 }}>
                                      <ArrowRightIcon sx={{ color: '#4caf50' }} />
                                    </ListItemIcon>
                                    <ListItemText 
                                      primary={removeMarkdown(strength)} 
                                      primaryTypographyProps={{ 
                                        variant: 'body2', 
                                        color: '#a0aec0' 
                                      }} 
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            ) : (
                              <Typography variant="body2" sx={{ color: '#a0aec0' }}>
                                No strengths identified
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      {/* Weaknesses */}
                      <Grid item xs={12} md={6}>
                        <Card sx={{ backgroundColor: '#1e2430', borderRadius: 2, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', height: '100%' }}>
                          <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, color: '#f44336' }}>
                              Weaknesses
                            </Typography>
                            {insights.swot.weaknesses && insights.swot.weaknesses.length > 0 ? (
                              <List dense>
                                {insights.swot.weaknesses.map((weakness, index) => (
                                  <ListItem key={index} sx={{ py: 0.5 }}>
                                    <ListItemIcon sx={{ minWidth: 30 }}>
                                      <ArrowRightIcon sx={{ color: '#f44336' }} />
                                    </ListItemIcon>
                                    <ListItemText 
                                      primary={removeMarkdown(weakness)} 
                                      primaryTypographyProps={{ 
                                        variant: 'body2', 
                                        color: '#a0aec0' 
                                      }} 
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            ) : (
                              <Typography variant="body2" sx={{ color: '#a0aec0' }}>
                                No weaknesses identified
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      {/* Opportunities */}
                      <Grid item xs={12} md={6}>
                        <Card sx={{ backgroundColor: '#1e2430', borderRadius: 2, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', height: '100%' }}>
                          <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, color: '#2196f3' }}>
                              Opportunities
                            </Typography>
                            {insights.swot.opportunities && insights.swot.opportunities.length > 0 ? (
                              <List dense>
                                {insights.swot.opportunities.map((opportunity, index) => (
                                  <ListItem key={index} sx={{ py: 0.5 }}>
                                    <ListItemIcon sx={{ minWidth: 30 }}>
                                      <ArrowRightIcon sx={{ color: '#2196f3' }} />
                                    </ListItemIcon>
                                    <ListItemText 
                                      primary={removeMarkdown(opportunity)} 
                                      primaryTypographyProps={{ 
                                        variant: 'body2', 
                                        color: '#a0aec0' 
                                      }} 
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            ) : (
                              <Typography variant="body2" sx={{ color: '#a0aec0' }}>
                                No opportunities identified
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      {/* Threats */}
                      <Grid item xs={12} md={6}>
                        <Card sx={{ backgroundColor: '#1e2430', borderRadius: 2, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', height: '100%' }}>
                          <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, color: '#ff9800' }}>
                              Threats
                            </Typography>
                            {insights.swot.threats && insights.swot.threats.length > 0 ? (
                              <List dense>
                                {insights.swot.threats.map((threat, index) => (
                                  <ListItem key={index} sx={{ py: 0.5 }}>
                                    <ListItemIcon sx={{ minWidth: 30 }}>
                                      <ArrowRightIcon sx={{ color: '#ff9800' }} />
                                    </ListItemIcon>
                                    <ListItemText 
                                      primary={removeMarkdown(threat)} 
                                      primaryTypographyProps={{ 
                                        variant: 'body2', 
                                        color: '#a0aec0' 
                                      }} 
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            ) : (
                              <Typography variant="body2" sx={{ color: '#a0aec0' }}>
                                No threats identified
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        )}
      </>
    );
  };

  const renderAnalysisStep = () => {
    if (loadingStage) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2, color: '#e2e8f0' }}>
            {loadingStage}
          </Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      );
    }

    if (!insights) {
      return null;
    }

    return (
      <Box>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }} elevation={2}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ color: '#e2e8f0' }}>
                Market Overview
              </Typography>
              <Typography variant="body1" sx={{ color: '#a0aec0' }}>
                {insights.marketAnalysis?.summary}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }} elevation={2}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ color: '#e2e8f0' }}>
                Competitive Analysis
              </Typography>
              <Typography variant="body1" sx={{ color: '#a0aec0' }}>
                {insights.competitorInsights?.summary}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }} elevation={2}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ color: '#e2e8f0' }}>
                Funding Strategy
              </Typography>
              <Typography variant="body1" sx={{ color: '#a0aec0' }}>
                {insights.fundingInsights?.summary}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }} elevation={2}>
              <Typography variant="h6" color="primary" gutterBottom sx={{ color: '#e2e8f0' }}>
                Growth Strategy
              </Typography>
              <Typography variant="body1" sx={{ color: '#a0aec0' }}>
                {insights.userGrowthInsights?.summary}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ color: '#e2e8f0' }}>
            Detailed Analysis & Projections
          </Typography>
        </Box>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            onClick={handleBack}
            variant="outlined"
            sx={{
              color: '#e2e8f0',
              borderColor: '#e2e8f0',
              '&:hover': {
                borderColor: '#5f50e1',
                backgroundColor: 'rgba(108, 92, 231, 0.1)'
              }
            }}
          >
            Back
          </Button>
        </Box>
      </Box>
    );
  };

  const renderStartupInsights = () => {
    if (!insights) return null;

    return (
      <div className="container mx-auto p-6">
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        </div>
        
        {/* Moved the button lower on the page with increased top margin */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8, mb: 4 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              // Save the current insights and formData in localStorage
              localStorage.setItem('savedInsights', JSON.stringify(insights));
              localStorage.setItem('savedFormData', JSON.stringify(formData));
              localStorage.setItem('savedCompetitors', JSON.stringify(competitors));
              navigate('/market-charts');
            }}
            size="large"
            sx={{
              color: '#e2e8f0',
              '&:hover': {
                backgroundColor: '#5f50e1'
              }
            }}
          >
            View Market Analysis Charts
          </Button>
        </Box>
      </div>
    );
  };

  const loadHistoryItem = (item) => {
    const marketData = item.marketData;
    
    if (!marketData) {
      console.error('No market data available in history item');
      return;
    }
    
    console.log('Loading history item:', item);
    console.log('Market data structure:', marketData);
    
    setShowHistory(false);
    
    // Set the form data if available in the history item
    if (marketData.startupIdea || marketData.industry || marketData.operationLocation) {
      setFormData({
        startupIdea: marketData.startupIdea || '',
        industry: marketData.industry || '',
        operationLocation: marketData.operationLocation || ''
      });
    }
    
    // Process the market data to ensure consistent format
    try {
      // Clone the marketData to avoid mutations
      const processedData = JSON.parse(JSON.stringify(marketData));
      
      // If businessStrategy exists, process array fields
      if (processedData.businessStrategy) {
        const bs = processedData.businessStrategy;
        
        // Handle userAcquisitionStrategy field
        try {
          // Convert string back to array for userAcquisitionStrategy
          if (typeof bs.userAcquisitionStrategy === 'string' && bs.userAcquisitionStrategy.trim()) {
            bs.userAcquisitionStrategy = bs.userAcquisitionStrategy.split('|||').filter(Boolean);
            console.log('Converted userAcquisitionStrategy from string to array:', bs.userAcquisitionStrategy);
          } else if (!Array.isArray(bs.userAcquisitionStrategy)) {
            bs.userAcquisitionStrategy = [];
            console.log('Set empty array for userAcquisitionStrategy');
          }
        } catch (err) {
          console.error('Error processing userAcquisitionStrategy:', err);
          bs.userAcquisitionStrategy = [];
        }
        
        // Handle marketTrends field
        try {
          // Convert string back to array for marketTrends
          if (typeof bs.marketTrends === 'string' && bs.marketTrends.trim()) {
            bs.marketTrends = bs.marketTrends.split('|||').filter(Boolean);
            console.log('Converted marketTrends from string to array:', bs.marketTrends);
          } else if (!Array.isArray(bs.marketTrends)) {
            bs.marketTrends = [];
            console.log('Set empty array for marketTrends');
          }
        } catch (err) {
          console.error('Error processing marketTrends:', err);
          bs.marketTrends = [];
        }
        
        // Handle businessModels field
        try {
          // Convert string back to array for businessModels
          if (typeof bs.businessModels === 'string' && bs.businessModels.trim()) {
            bs.businessModels = bs.businessModels.split('|||').filter(Boolean);
            console.log('Converted businessModels from string to array:', bs.businessModels);
          } else if (!Array.isArray(bs.businessModels)) {
            bs.businessModels = [];
            console.log('Set empty array for businessModels');
          }
        } catch (err) {
          console.error('Error processing businessModels:', err);
          bs.businessModels = [];
        }
      } else {
        // Create empty businessStrategy object if missing
        processedData.businessStrategy = {
          targetUsers: 'N/A',
          userAcquisitionStrategy: [],
          businessModels: [],
          revenuePerUser: 'N/A',
          minimumInvestment: 'N/A',
          breakEvenTime: 'N/A',
          userGrowthRate: 'N/A',
          marketTrends: []
        };
        console.log('Created default businessStrategy object');
      }
      
      // Ensure SWOT data exists
      if (!processedData.swot) {
        processedData.swot = {
          strengths: [],
          weaknesses: [],
          opportunities: [],
          threats: []
        };
        console.log('Created default SWOT object');
      }
      
      // Log the processed data
      console.log('Processed marketData for display:', processedData);
      setInsights(processedData);
    } catch (error) {
      console.error('Error processing market data:', error);
      // Fallback if for some reason the data structure is different
      setInsights({
        demographics: marketData.demographics || {},
        marketAnalysis: {
          trendAnalysis: marketData.marketAnalysis?.summary || 'No analysis available',
          riskLevel: marketData.marketAnalysis?.riskLevel || 'Medium',
          growthPotential: marketData.marketAnalysis?.growthPotential || 'Medium'
        },
        swot: marketData.swot || {
          strengths: [],
          weaknesses: [],
          opportunities: [],
          threats: []
        },
        marketOverview: marketData.marketOverview || '',
        targetAudience: marketData.targetAudience || '',
        businessModel: marketData.businessModel || '',
        valueProposition: marketData.valueProposition || '',
        fundingOptions: marketData.fundingOptions || '',
        businessStrategy: marketData.businessStrategy || {
          revenueModel: 'N/A',
          pricingStrategy: 'N/A',
          marketingChannels: [],
          revenuePerUser: 'N/A',
          minimumInvestment: 'N/A',
          breakEvenTime: 'N/A',
          userGrowthRate: 'N/A',
          marketTrends: [],
          customerAcquisition: 'N/A',
          valueProp: 'N/A',
          userAcquisitionStrategy: [],
          businessModels: []
        }
      });
    }
    
    // Set competitors with all their data
    try {
      if (marketData.competitors && marketData.competitors.length > 0) {
        // Deep clone the competitor objects to ensure we have all properties
        const mappedCompetitors = marketData.competitors.map(comp => {
          return {
            name: comp.name || '',
            marketShare: typeof comp.marketShare === 'number' ? comp.marketShare : 0,
            // Handle different possible property names for these fields
            targetAudience: comp.targetAudience || comp.targetMarket || '',
            marketingStrategies: comp.marketingStrategies || comp.strategies || ''
          };
        });
        
        console.log('Mapped competitors:', mappedCompetitors);
        setCompetitors(mappedCompetitors);
      } else {
        setCompetitors([]);
      }
    } catch (error) {
      console.error('Error processing competitors data:', error);
      setCompetitors([]);
    }
    
    // Save complete market data to localStorage
    try {
      localStorage.setItem('marketAnalysisData', JSON.stringify({
        ...marketData,
        analysisId: item.id
      }));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
    
    // Display the analysis
    setActiveStep(1); // Set to "Generate Report" step (index 1)
  };

  // Add browser history listener for back/forward buttons
  useEffect(() => {
    // Save current step to browser history state
    const updateBrowserHistory = (step) => {
      // Create a meaningful history state name based on the step
      const stateName = step === 0 ? 'startup-information' : 'generate-report';
      
      // Push a new history state when changing steps (except on initial load)
      window.history.pushState(
        { step, formData: JSON.stringify(formData) },
        '',
        `${window.location.pathname}#${stateName}`
      );
    };

    // Handle popstate event (when browser back/forward buttons are clicked)
    const handlePopState = (event) => {
      // Handle navigation to landing page when going back from step 0
      if (!event.state && activeStep === 0) {
        // Navigate to landing page
        navigate('/');
        return;
      }
      
      // If we have state in the history event, restore it
      if (event.state && typeof event.state.step === 'number') {
        // Don't navigate away from the form - handle it internally
        event.preventDefault();
        
        // Restore previous step
        setActiveStep(event.state.step);
        
        // If coming back to step 0 from step 1, reset insights to show the form
        if (event.state.step === 0 && activeStep === 1) {
          const previousFormData = event.state.formData ? JSON.parse(event.state.formData) : formData;
          setInsights(null);
          setFormData(previousFormData);
        }
      }
    };

    // Add event listener
    window.addEventListener('popstate', handlePopState);

    // Initialize history state for the current step if not already set
    if (!window.history.state || window.history.state.step !== activeStep) {
      updateBrowserHistory(activeStep);
    }

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [activeStep, formData, navigate]);

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      minWidth: '100vw',
      backgroundColor: '#1a1f2e',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflowY: 'auto',
      p: 4,
      color: 'white'
    }}>
      <Paper 
        elevation={0}
        sx={{
          maxWidth: 1200,
          margin: '0 auto',
          backgroundColor: 'transparent',
          p: 3
        }}
      >
        <Typography variant="h4" align="center" gutterBottom sx={{ mb: 4, color: '#e2e8f0' }}>
          Startup Idea Analyzer
        </Typography>
        <Typography variant="subtitle1" align="center" sx={{ mb: 5, color: '#a0aec0' }}>
          Transform your idea into a viable business concept
        </Typography>

        <Stepper 
          activeStep={activeStep} 
          alternativeLabel
          sx={{ 
            mb: 5,
            '& .MuiStepLabel-root .Mui-completed': {
              color: '#6c5ce7',
            },
            '& .MuiStepLabel-label.Mui-completed.MuiStepLabel-alternativeLabel': {
              color: '#a0aec0',
            },
            '& .MuiStepLabel-root .Mui-active': {
              color: '#6c5ce7',
            },
            '& .MuiStepLabel-label.Mui-active.MuiStepLabel-alternativeLabel': {
              color: '#e2e8f0',
            },
            '& .MuiStepLabel-root .Mui-active .MuiStepIcon-text': {
              fill: '#e2e8f0',
            },
          }}
        >
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              '& .MuiAlert-message': { color: '#000' },
              '& .MuiAlert-icon': { color: '#f44336' }
            }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}
        
        {!insights ? (
          <>
            <Card sx={{ 
              backgroundColor: '#1e2430',
              borderRadius: 2,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              mb: 3
            }}>
              <CardContent sx={{ p: 4 }}>
                {/* Sample Data and History Buttons */}
                {!insights && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3, gap: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => fetchAnalysisHistory()}
                      sx={{
                        color: '#e2e8f0',
                        borderColor: '#e2e8f0',
                        '&:hover': {
                          borderColor: '#5f50e1',
                          backgroundColor: 'rgba(108, 92, 231, 0.1)'
                        }
                      }}
                    >
                      History
                    </Button>
                  </Box>
                )}
                {/* Form Content */}
                <Box sx={{ mt: 2 }}>
                  {activeStep === 0 && (
                    <Box sx={{ 
                      '& .MuiGrid-root': { 
                        '& .MuiFormControl-root': {
                          backgroundColor: '#242936',
                          borderRadius: 1,
                          p: 1
                        }
                      }
                    }}>
                      {renderBasicInfo()}
                    </Box>
                  )}
                </Box>

                {/* Navigation Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                  <Button
                    onClick={handleBack}
                    disabled={loadingStage !== ''}
                    sx={{
                      color: '#e2e8f0',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    Back
                  </Button>
                  {!insights && (
                    <Button
                      variant="contained"
                      onClick={activeStep === STEPS.length - 1 ? handleSubmit : handleNext}
                      disabled={loadingStage !== ''}
                      sx={{
                        backgroundColor: '#6c5ce7',
                        '&:hover': {
                          backgroundColor: '#5f50e1'
                        }
                      }}
                    >
                      {loadingStage !== '' ? (
                        <CircularProgress size={24} sx={{ color: '#e2e8f0' }} />
                      ) : activeStep === STEPS.length - 1 ? (
                        'Analyze'
                      ) : (
                        'Next'
                      )}
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </>
        ) : (
          <Box>
            {activeStep === 1 && (
              <Box>
                {renderCompetitorsStep()}
                {renderStartupInsights()}
                
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    onClick={handleBack}
                    variant="outlined"
                    sx={{
                      color: '#e2e8f0',
                      borderColor: '#e2e8f0',
                      '&:hover': {
                        borderColor: '#5f50e1',
                        backgroundColor: 'rgba(108, 92, 231, 0.1)'
                      }
                    }}
                  >
                    Back
                  </Button>
                </Box>
              </Box>
            )}
            
            {activeStep === 2 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h4" color="#e2e8f0" gutterBottom>
                  Analysis Complete
                </Typography>
                <Typography variant="body1" color="#a0aec0">
                  Your startup analysis is now complete. You can go back to view the details.
                </Typography>
                <Button
                  onClick={handleBack}
                  variant="outlined"
                  sx={{
                    mt: 3,
                    color: '#e2e8f0',
                    borderColor: '#e2e8f0',
                    '&:hover': {
                      borderColor: '#5f50e1',
                      backgroundColor: 'rgba(108, 92, 231, 0.1)'
                    }
                  }}
                >
                  Back to Analysis
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* History Modal */}
        {showHistory && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999
            }}
            onClick={() => setShowHistory(false)}
          >
            <Box
              sx={{
                backgroundColor: '#1e2430',
                borderRadius: 2,
                p: 4,
                maxWidth: '800px',
                width: '90%',
                maxHeight: '80vh',
                overflowY: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Typography variant="h5" sx={{ mb: 3, color: '#e2e8f0' }}>
                Analysis History
              </Typography>
              
              {loadingHistory ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : historyData.length > 0 ? (
                historyData.map((item, index) => (
                  <Card 
                    key={index} 
                    sx={{ 
                      mb: 2, 
                      backgroundColor: '#242936',
                      '&:hover': {
                        backgroundColor: '#2d3748',
                        cursor: 'pointer'
                      }
                    }}
                    onClick={() => loadHistoryItem(item)}
                  >
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle1" sx={{ color: '#e2e8f0' }}>
                            {item.marketData?.competitors?.[0]?.name ? `${item.marketData.competitors[0].name} Analysis` : 'Startup Analysis'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#a0aec0' }}>
                            {item.timestamp?.toDate().toLocaleString() || 'No date'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body2" sx={{ color: '#a0aec0' }}>
                            {item.marketData?.competitors?.length || 0} competitors analyzed
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#a0aec0' }}>
                            Market size: {item.marketData?.marketSize?.[item.marketData.marketSize.length - 1]?.value || 'N/A'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Typography sx={{ textAlign: 'center', my: 4, color: '#a0aec0' }}>
                  No analysis history found
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button 
                  variant="contained" 
                  onClick={() => setShowHistory(false)}
                  sx={{
                    backgroundColor: '#6c5ce7',
                    '&:hover': {
                      backgroundColor: '#5f50e1'
                    }
                  }}
                >
                  Close
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default StartupForm;
