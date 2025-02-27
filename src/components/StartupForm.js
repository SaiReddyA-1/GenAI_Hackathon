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
} from '@mui/material';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from 'firebase/firestore';
import { analyzeStartupIdea } from '../services/openai';
import { getCompetitorsWithGemini, getStartupInsightsWithGemini, getLiveInsightWithGemini } from '../services/gemini';
import useAuth from '../hooks/useAuth';
import AnalysisDashboard from './AnalysisDashboard';
import ReactMarkdown from 'react-markdown';

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

const SAMPLE_DATA = {
  startupIdea: "AI-powered health monitoring wearable that predicts potential health issues before they become serious. The device uses advanced machine learning to analyze real-time health data and provides early warnings for various medical conditions.",
  industry: 'Healthcare',
  problemSolution: "Traditional health monitoring is reactive rather than proactive. Our solution uses AI to predict health issues days or weeks before symptoms appear, potentially saving lives through early intervention.",
  operationLocation: 'Global, starting with US and Europe',
  targetUsers: 'Consumers',
  hasCompetitors: 'yes',
  competitors: 'Apple Health, Fitbit, Samsung Health',
  userAcquisition: 'Partnerships',
  needFunding: 'yes',
  initialInvestment: '5000000',
  businessModel: 'Subscription',
  revenuePerUser: '29.99',
  breakEvenTime: '2 years',
  marketSize: 'Large',
  userGrowthRate: '45',
  supportingTrends: ['AI Boom', 'Digital Payments'],
  needAiStrategies: 'yes',
  needBenchmarking: 'yes',
  needPdfReport: 'yes'
};

const STEPS = [
  'Basic Info',
  'Market & Competition',
  'Financial & Growth',
  'AI & Reports',
  'Competitors'
];

const IMPROVEMENT_QUESTIONS = [
  {
    id: 'market_trends',
    question: 'What are the latest market trends that could impact my startup?',
    prompt: (idea) => `Analyze the latest market trends for this startup idea: ${idea}. 
    Format your response in markdown with 2-3 main categories and specific points under each.
    Include market statistics and growth indicators where relevant.
    Focus on current trends and near-future predictions that could directly impact this business.`
  },
  {
    id: 'user_acquisition',
    question: 'How can I improve my user acquisition strategy?',
    prompt: (idea) => `Suggest innovative user acquisition strategies for this startup: ${idea}.
    Format your response in markdown with 2-3 main categories (e.g., Digital Marketing, Partnerships, Growth Hacking).
    Under each category, provide 2-3 specific, actionable tactics.
    Include real-world examples or potential metrics where relevant.`
  },
  {
    id: 'revenue_optimization',
    question: 'What are potential ways to optimize revenue streams?',
    prompt: (idea) => `Recommend ways to optimize and diversify revenue streams for this startup idea: ${idea}.
    Format your response in markdown with 2-3 main revenue categories.
    For each category, provide 2-3 specific monetization strategies or pricing models.
    Include potential revenue projections or industry benchmarks where relevant.`
  },
  {
    id: 'competitive_advantage',
    question: 'How can I strengthen my competitive advantage?',
    prompt: (idea) => `Analyze how to build and maintain a strong competitive advantage for this startup: ${idea}.
    Format your response in markdown with 2-3 main strategic areas.
    For each area, provide 2-3 specific differentiators or unique value propositions.
    Include examples of successful implementations in similar industries.`
  }
];

const StartupForm = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [loadingStage, setLoadingStage] = useState('');
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [competitors, setCompetitors] = useState([]); 
  const [insights, setInsights] = useState(null);
  const [liveInsights, setLiveInsights] = useState({});
  const [loadingQuestion, setLoadingQuestion] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const { user } = useAuth();

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
        <TextField
          fullWidth
          label="What's your innovative idea?"
          multiline
          rows={4}
          value={formData.startupIdea || ''}
          onChange={(e) => handleFormChange('startupIdea', e.target.value)}
          error={!!errors.startupIdea}
          helperText={errors.startupIdea}
          variant="outlined"
          sx={{
            '& .MuiInputLabel-root': {
              color: '#718096',
              '&.Mui-focused': {
                color: '#6c5ce7'
              }
            },
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#1e2430',
              '& input, & textarea': {
                color: '#4a5568',
                '&::placeholder': {
                  color: '#4a5568',
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
              color: '#718096'
            }
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="What problem does it solve?"
          multiline
          rows={4}
          value={formData.problemSolution || ''}
          onChange={(e) => handleFormChange('problemSolution', e.target.value)}
          error={!!errors.problemSolution}
          helperText={errors.problemSolution}
          variant="outlined"
          sx={{
            '& .MuiInputLabel-root': {
              color: '#718096',
              '&.Mui-focused': {
                color: '#6c5ce7'
              }
            },
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#1e2430',
              '& input, & textarea': {
                color: '#4a5568',
                '&::placeholder': {
                  color: '#4a5568',
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
              color: '#718096'
            }
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel sx={{ 
            color: '#718096',
            '&.Mui-focused': {
              color: '#6c5ce7'
            }
          }}>Industry</InputLabel>
          <Select
            value={formData.industry || ''}
            onChange={(e) => handleFormChange('industry', e.target.value)}
            label="Industry"
            sx={{
              backgroundColor: '#1e2430',
              color: '#4a5568',
              '& .MuiSelect-select': {
                color: '#4a5568'
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
                color: '#4a5568'
              }
            }}
          >
            {INDUSTRIES.map((industry) => (
              <MenuItem key={industry} value={industry}>{industry}</MenuItem>
            ))}
          </Select>
          {errors.industry && <FormHelperText error>{errors.industry}</FormHelperText>}
        </FormControl>
      </Grid>
    </Grid>
  );

  const renderMarketCompetition = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Operation Location"
          value={formData.operationLocation || ''}
          onChange={(e) => handleFormChange('operationLocation', e.target.value)}
          variant="outlined"
          sx={{
            '& .MuiInputLabel-root': {
              color: '#718096',
              '&.Mui-focused': {
                color: '#6c5ce7'
              }
            },
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#1e2430',
              '& input, & textarea': {
                color: '#4a5568',
                '&::placeholder': {
                  color: '#4a5568',
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
              color: '#718096'
            }
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel sx={{ 
            color: '#718096',
            '&.Mui-focused': {
              color: '#6c5ce7'
            }
          }}>Target Users</InputLabel>
          <Select
            value={formData.targetUsers || ''}
            onChange={(e) => handleFormChange('targetUsers', e.target.value)}
            label="Target Users"
            sx={{
              backgroundColor: '#1e2430',
              color: '#4a5568',
              '& .MuiSelect-select': {
                color: '#4a5568'
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
                color: '#4a5568'
              }
            }}
          >
            {TARGET_USERS.map((user) => (
              <MenuItem key={user} value={user}>{user}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={formData.hasCompetitors === 'yes'}
              onChange={(e) => handleFormChange('hasCompetitors', e.target.checked ? 'yes' : 'no')}
              sx={{
                '& .MuiSwitch-switchBase': {
                  color: '#718096'
                }
              }}
            />
          }
          label="Do you have competitors?"
          sx={{
            '& .MuiTypography-root': {
              color: '#718096'
            }
          }}
        />
      </Grid>
      {formData.hasCompetitors === 'yes' && (
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Main Competitors"
            multiline
            rows={2}
            value={formData.competitors || ''}
            onChange={(e) => handleFormChange('competitors', e.target.value)}
            helperText="Separate competitors with commas"
            variant="outlined"
            sx={{
              '& .MuiInputLabel-root': {
                color: '#718096',
                '&.Mui-focused': {
                  color: '#6c5ce7'
                }
              },
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#1e2430',
                '& input, & textarea': {
                  color: '#4a5568',
                  '&::placeholder': {
                    color: '#4a5568',
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
                color: '#718096'
              }
            }}
          />
        </Grid>
      )}
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel sx={{ 
            color: '#718096',
            '&.Mui-focused': {
              color: '#6c5ce7'
            }
          }}>User Acquisition Strategy</InputLabel>
          <Select
            value={formData.userAcquisition || ''}
            onChange={(e) => handleFormChange('userAcquisition', e.target.value)}
            label="User Acquisition Strategy"
            sx={{
              backgroundColor: '#1e2430',
              color: '#4a5568',
              '& .MuiSelect-select': {
                color: '#4a5568'
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
                color: '#4a5568'
              }
            }}
          >
            {USER_ACQUISITION.map((strategy) => (
              <MenuItem key={strategy} value={strategy}>{strategy}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );

  const renderFinancialGrowth = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={formData.needFunding === 'yes'}
              onChange={(e) => handleFormChange('needFunding', e.target.checked ? 'yes' : 'no')}
              sx={{
                '& .MuiSwitch-switchBase': {
                  color: '#718096'
                }
              }}
            />
          }
          label="Do you need funding?"
          sx={{
            '& .MuiTypography-root': {
              color: '#718096'
            }
          }}
        />
      </Grid>
      {formData.needFunding === 'yes' && (
        <Grid item xs={12}>
          <TextField
            fullWidth
            type="number"
            label="Initial Investment Needed ($)"
            value={formData.initialInvestment || ''}
            onChange={(e) => handleFormChange('initialInvestment', e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            variant="outlined"
            sx={{
              '& .MuiInputLabel-root': {
                color: '#718096',
                '&.Mui-focused': {
                  color: '#6c5ce7'
                }
              },
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#1e2430',
                '& input, & textarea': {
                  color: '#4a5568',
                  '&::placeholder': {
                    color: '#4a5568',
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
                color: '#718096'
              }
            }}
          />
        </Grid>
      )}
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel sx={{ 
            color: '#718096',
            '&.Mui-focused': {
              color: '#6c5ce7'
            }
          }}>Business Model</InputLabel>
          <Select
            value={formData.businessModel || ''}
            onChange={(e) => handleFormChange('businessModel', e.target.value)}
            label="Business Model"
            sx={{
              backgroundColor: '#1e2430',
              color: '#4a5568',
              '& .MuiSelect-select': {
                color: '#4a5568'
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
                color: '#4a5568'
              }
            }}
          >
            {BUSINESS_MODELS.map((model) => (
              <MenuItem key={model} value={model}>{model}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          type="number"
          label="Revenue per User ($)"
          value={formData.revenuePerUser || ''}
          onChange={(e) => handleFormChange('revenuePerUser', e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
          variant="outlined"
          sx={{
            '& .MuiInputLabel-root': {
              color: '#718096',
              '&.Mui-focused': {
                color: '#6c5ce7'
              }
            },
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#1e2430',
              '& input, & textarea': {
                color: '#4a5568',
                '&::placeholder': {
                  color: '#4a5568',
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
              color: '#718096'
            }
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel sx={{ 
            color: '#718096',
            '&.Mui-focused': {
              color: '#6c5ce7'
            }
          }}>Break-even Time</InputLabel>
          <Select
            value={formData.breakEvenTime || ''}
            onChange={(e) => handleFormChange('breakEvenTime', e.target.value)}
            label="Break-even Time"
            sx={{
              backgroundColor: '#1e2430',
              color: '#4a5568',
              '& .MuiSelect-select': {
                color: '#4a5568'
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
                color: '#4a5568'
              }
            }}
          >
            {BREAKEVEN_TIMES.map((time) => (
              <MenuItem key={time} value={time}>{time}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );

  const renderAiReports = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel sx={{ 
            color: '#718096',
            '&.Mui-focused': {
              color: '#6c5ce7'
            }
          }}>Market Size</InputLabel>
          <Select
            value={formData.marketSize || ''}
            onChange={(e) => handleFormChange('marketSize', e.target.value)}
            label="Market Size"
            sx={{
              backgroundColor: '#1e2430',
              color: '#4a5568',
              '& .MuiSelect-select': {
                color: '#4a5568'
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
                color: '#4a5568'
              }
            }}
          >
            {MARKET_SIZES.map((size) => (
              <MenuItem key={size} value={size}>{size}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          type="number"
          label="Expected User Growth Rate (%)"
          value={formData.userGrowthRate || ''}
          onChange={(e) => handleFormChange('userGrowthRate', e.target.value)}
          InputProps={{
            endAdornment: <InputAdornment position="end">%</InputAdornment>,
          }}
          variant="outlined"
          sx={{
            '& .MuiInputLabel-root': {
              color: '#718096',
              '&.Mui-focused': {
                color: '#6c5ce7'
              }
            },
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#1e2430',
              '& input, & textarea': {
                color: '#4a5568',
                '&::placeholder': {
                  color: '#4a5568',
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
              color: '#718096'
            }
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel sx={{ 
            color: '#718096',
            '&.Mui-focused': {
              color: '#6c5ce7'
            }
          }}>Supporting Market Trends</InputLabel>
          <Select
            multiple
            value={formData.supportingTrends || []}
            onChange={(e) => handleFormChange('supportingTrends', e.target.value)}
            label="Supporting Market Trends"
            sx={{
              backgroundColor: '#1e2430',
              color: '#4a5568',
              '& .MuiSelect-select': {
                color: '#4a5568'
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
                color: '#4a5568'
              }
            }}
          >
            {MARKET_TRENDS.map((trend) => (
              <MenuItem key={trend} value={trend}>{trend}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderBasicInfo();
      case 1:
        return renderMarketCompetition();
      case 2:
        return renderFinancialGrowth();
      case 3:
        return renderAiReports();
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
        [field]: ''
      }));
    }
  };

  const handleNext = () => {
    if (activeStep === STEPS.length - 2) {
      handleSubmit();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const saveToFirebase = async (marketData) => {
    try {
      const docRef = await addDoc(collection(db, 'marketAnalysis'), {
        userId: user.uid,
        timestamp: serverTimestamp(),
        marketData: {
          ...marketData,
          swot: marketData.swot || {
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
      throw err;
    }
  };

  const handleSubmit = async () => {
    try {
      setLoadingStage('Fetching competitors...');
      const competitorsList = await getCompetitorsWithGemini(formData);
      
      if (!competitorsList || competitorsList.length === 0) {
        throw new Error('Failed to fetch competitors');
      }

      setCompetitors(competitorsList);
      
      setLoadingStage('Generating insights...');
      const insightsList = await getStartupInsightsWithGemini(formData);
      
      if (!insightsList) {
        throw new Error('Failed to generate insights');
      }

      setInsights(insightsList);

      // Transform market data for charts
      const marketData = {
        demographics: insightsList.demographics,
        marketSize: [
          { year: '2020', value: parseFloat(insightsList.marketAnalysis?.current_growth_rate || 0) * 0.6 },
          { year: '2021', value: parseFloat(insightsList.marketAnalysis?.current_growth_rate || 0) * 0.8 },
          { year: '2022', value: parseFloat(insightsList.marketAnalysis?.current_growth_rate || 0) * 0.9 },
          { year: '2023', value: parseFloat(insightsList.marketAnalysis?.current_growth_rate || 0) },
          { year: '2024', value: parseFloat(insightsList.marketAnalysis?.current_growth_rate || 0) * 1.2 },
          { year: '2025', value: parseFloat(insightsList.marketAnalysis?.current_growth_rate || 0) * 1.4 }
        ],
        competitors: competitorsList.map(comp => ({
          name: comp.name,
          marketShare: comp.marketShare || 0,
          targetMarket: comp.targetAudience,
          strategies: comp.marketingStrategies
        })),
        swot: insightsList.swot // Add SWOT data here
      };

      setLoadingStage('Saving analysis...');
      
      // Save to Firebase first
      const analysisId = await saveToFirebase(marketData);
      
      // Store the analysis ID along with the market data
      const dataToStore = {
        ...marketData,
        analysisId
      };
      
      // Store in localStorage for immediate use
      localStorage.setItem('marketAnalysisData', JSON.stringify(dataToStore));

      setLoadingStage('');
      setActiveStep(activeStep + 1);
      
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze startup idea. Please try again.');
      setLoadingStage('');
    }
  };

  const handleQuestionClick = async (questionId) => {
    try {
      setLoadingQuestion(questionId);
      const question = IMPROVEMENT_QUESTIONS.find(q => q.id === questionId);
      const prompt = question.prompt(formData.startupIdea);
      
      const response = await getLiveInsightWithGemini(prompt);
      
      setLiveInsights(prev => ({
        ...prev,
        [questionId]: response
      }));
    } catch (error) {
      console.error('Error getting insights:', error);
      setError('Failed to get insights. Please try again.');
    } finally {
      setLoadingQuestion('');
    }
  };

  const renderLiveInsightsSection = () => {
    if (!insights) return null;

    return (
      <Box sx={{ mt: 8 }}>
        <Typography variant="h5" align="center" gutterBottom sx={{ color: 'white', mb: 3 }}>
          Get Live Insights to Improve Your Startup
        </Typography>
        <Grid container spacing={3}>
          {IMPROVEMENT_QUESTIONS.map((q) => (
            <Grid item xs={12} key={q.id}>
              <Card sx={{ 
                backgroundColor: '#1e2430',
                borderRadius: 2,
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ color: 'white' }}>
                      {q.question}
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => handleQuestionClick(q.id)}
                      disabled={loadingQuestion === q.id}
                      sx={{
                        backgroundColor: '#6c5ce7',
                        '&:hover': {
                          backgroundColor: '#5f50e1'
                        }
                      }}
                    >
                      {loadingQuestion === q.id ? (
                        <CircularProgress size={24} sx={{ color: 'white' }} />
                      ) : (
                        'Get Insights'
                      )}
                    </Button>
                  </Box>
                  
                  {liveInsights[q.id] && (
                    <Box sx={{ 
                      mt: 2, 
                      p: 2, 
                      backgroundColor: '#242936', 
                      borderRadius: 1,
                      '& h1, & h2, & h3, & h4, & h5, & h6': {
                        color: 'white',
                        marginTop: 2,
                        marginBottom: 1
                      },
                      '& p': {
                        color: '#718096',
                        marginBottom: 1
                      },
                      '& ul, & ol': {
                        color: '#718096',
                        paddingLeft: 3,
                        marginBottom: 1
                      },
                      '& li': {
                        marginBottom: 0.5
                      },
                      '& strong': {
                        color: '#a0aec0'
                      }
                    }}>
                      <ReactMarkdown>
                        {liveInsights[q.id]}
                      </ReactMarkdown>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  const renderInsightsCard = (title, data, icon) => {
    if (!data) return null;

    const renderContent = (content) => {
      if (typeof content === 'string') {
        return <p className="text-gray-600">{content}</p>;
      }
      
      if (Array.isArray(content)) {
        return (
          <ul className="list-disc pl-5">
            {content.map((item, index) => (
              <li key={index} className="text-gray-600 mb-2">{item}</li>
            ))}
          </ul>
        );
      }

      if (typeof content === 'object') {
        return Object.entries(content).map(([subTitle, subContent], index) => (
          <div key={index} className="mb-4">
            <h4 className="text-lg font-semibold mb-2">{subTitle}</h4>
            {renderContent(subContent)}
          </div>
        ));
      }

      return null;
    };

    return (
      <Paper 
        sx={{ 
          p: 3, 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.paper',
          boxShadow: 3
        }}
      >
        <Typography variant="h6" color="primary" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" color="text.secondary">
            Summary
          </Typography>
          <Typography variant="body1">
            {renderContent(data)}
          </Typography>
        </Box>
      </Paper>
    );
  };

  const renderCompetitorsStep = () => {
    if (loadingStage) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
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

    return (
      <>
        <Box sx={{ py: 4 }}>
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={{ color: 'white !important', mb: 3 }}
          >
            Top Competitors Analysis
          </Typography>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {competitors.map((competitor, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper 
                  sx={{ 
                    p: 3, 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: 'background.paper',
                    boxShadow: 3
                  }}
                >
                  <Typography variant="h6" color="primary" gutterBottom>
                    {competitor.name}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" color="text.secondary">
                      Market Share
                    </Typography>
                    <Typography variant="body1">
                      {competitor.marketShare}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" color="text.secondary">
                      Target Audience
                    </Typography>
                    <Typography variant="body1">
                      {competitor.targetAudience}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" color="text.secondary">
                      Marketing Strategies
                    </Typography>
                    <Typography variant="body1">
                      {competitor.marketingStrategies}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
        {renderStartupInsights()}
      </>
    );
  };

  const renderAnalysisStep = () => {
    if (loadingStage) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
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

    if (!analysis) {
      return null;
    }

    return (
      <Box>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }} elevation={2}>
              <Typography variant="h6" color="primary" gutterBottom>
                Market Overview
              </Typography>
              <Typography variant="body1">
                {analysis.marketInsights.summary}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }} elevation={2}>
              <Typography variant="h6" color="primary" gutterBottom>
                Competitive Analysis
              </Typography>
              <Typography variant="body1">
                {analysis.competitorInsights.summary}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }} elevation={2}>
              <Typography variant="h6" color="primary" gutterBottom>
                Funding Strategy
              </Typography>
              <Typography variant="body1">
                {analysis.fundingInsights.summary}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }} elevation={2}>
              <Typography variant="h6" color="primary" gutterBottom>
                Growth Strategy
              </Typography>
              <Typography variant="body1">
                {analysis.userGrowthInsights.summary}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Detailed Analysis & Projections
          </Typography>
          <AnalysisDashboard analysisData={analysis} />
        </Box>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={() => {
              setActiveStep(0);
              setAnalysis(null);
            }}
          >
            Start New Analysis
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              console.log('Save/Export analysis');
            }}
          >
            Save Analysis
          </Button>
        </Box>
      </Box>
    );
  };

  const renderStartupInsights = () => {
    if (!insights) return null;

    return (
      <div className="container mx-auto p-6">
        {/* <h1 className="text-3xl font-bold text-center mb-8">Startup Insights Analysis</h1> */}
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/market-charts')}
            size="large"
          >
            View Market Analysis Charts
          </Button>
        </Box>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Risks & Solutions card hidden
          {renderInsightsCard("Risks & Solutions", {
            "Key Risks": insights.risksAndSolutions?.key_risks || [],
            "Solutions": insights.risksAndSolutions?.solutions || []
          }, "🛡️")}
          */}
          {/* Market Analysis card hidden
          {renderInsightsCard("Market Analysis", {
            "Current Growth Rate": insights.marketAnalysis?.current_growth_rate,
            "Market Trends": insights.marketAnalysis?.key_market_trends || [],
            "Projected Growth": insights.marketAnalysis?.projected_growth
          }, "📈")}
          */}
          
          {/* Audience & Marketing card hidden
          {renderInsightsCard("Audience & Marketing", {
            "Target Audience": insights.audienceAndMarketing?.target_audience,
            "Marketing Strategy": insights.audienceAndMarketing?.marketing_strategies || [],
            "Investor Appeal": insights.audienceAndMarketing?.investor_appeal_points || []
          }, "🎯")}
          */}
          
          {/* Revenue Streams card hidden
          {renderInsightsCard("Revenue Streams", {
            "Primary Revenue": insights.revenueStreams?.primary_revenue_sources || [],
            "Passive Income": insights.revenueStreams?.passive_income_opportunities || [],
            "Capital Raising": insights.revenueStreams?.capital_raising_strategies || []
          }, "💰")}
          */}
          
          {/* Suggested Names card hidden
          {renderInsightsCard("Suggested Names", 
            insights.startupNames?.suggested_modern_names || [], 
            "✨")}
          */}
        </div>
      </div>
    );
  };

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
        <Typography variant="h4" align="center" gutterBottom sx={{ color: 'white', mb: 4 }}>
          Startup Idea Analyzer
        </Typography>
        <Typography variant="subtitle1" align="center" sx={{ color: '#718096', mb: 5 }}>
          Transform your idea into a viable business concept
        </Typography>

        {!analysis ? (
          <>
            <Stepper 
              activeStep={activeStep} 
              alternativeLabel
              sx={{ 
                mb: 5,
                '& .MuiStepLabel-label': {
                  color: 'white !important',
                  '&.Mui-completed': {
                    color: 'white !important'
                  },
                  '&.Mui-active': {
                    color: 'white !important'
                  },
                  '&.Mui-disabled': {
                    color: 'rgba(255, 255, 255, 0.7) !important'
                  }
                },
                '& .MuiStepIcon-root': {
                  color: 'white',
                  '&.Mui-completed': {
                    color: '#6c5ce7'
                  },
                  '&.Mui-active': {
                    color: '#6c5ce7'
                  },
                  '& text': {
                    fill: '#000000 !important'
                  }
                },
                '& .MuiStepConnector-line': {
                  borderColor: '#2d3436',
                }
              }}
            >
              {STEPS.map((label) => (
                <Step key={label}>
                  <StepLabel 
                    sx={{
                      '& .MuiStepLabel-label': {
                        color: 'white !important',
                        '&.Mui-completed': {
                          color: 'white !important'
                        },
                        '&.Mui-active': {
                          color: 'white !important'
                        },
                        '&.Mui-disabled': {
                          color: 'rgba(255, 255, 255, 0.7) !important'
                        }
                      },
                      '& .MuiStepIcon-root': {
                        color: 'white',
                        '&.Mui-completed': {
                          color: '#6c5ce7'
                        },
                        '&.Mui-active': {
                          color: '#6c5ce7'
                        },
                        '& text': {
                          fill: '#000000 !important'
                        }
                      }
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

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
                        color: '#6c5ce7',
                        borderColor: '#6c5ce7',
                        '&:hover': {
                          borderColor: '#5f50e1',
                          backgroundColor: 'rgba(108, 92, 231, 0.1)'
                        }
                      }}
                    >
                      History
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setFormData(SAMPLE_DATA)}
                      sx={{
                        color: '#6c5ce7',
                        borderColor: '#6c5ce7',
                        '&:hover': {
                          borderColor: '#5f50e1',
                          backgroundColor: 'rgba(108, 92, 231, 0.1)'
                        }
                      }}
                    >
                      Fill Sample Data
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
                  {activeStep === 1 && (
                    <Box sx={{ 
                      '& .MuiGrid-root': { 
                        '& .MuiFormControl-root': {
                          backgroundColor: '#242936',
                          borderRadius: 1,
                          p: 1
                        }
                      }
                    }}>
                      {renderMarketCompetition()}
                    </Box>
                  )}
                  {activeStep === 2 && (
                    <Box sx={{ 
                      '& .MuiGrid-root': { 
                        '& .MuiFormControl-root': {
                          backgroundColor: '#242936',
                          borderRadius: 1,
                          p: 1
                        }
                      }
                    }}>
                      {renderFinancialGrowth()}
                    </Box>
                  )}
                  {activeStep === 3 && (
                    <Box sx={{ 
                      '& .MuiGrid-root': { 
                        '& .MuiFormControl-root': {
                          backgroundColor: '#242936',
                          borderRadius: 1,
                          p: 1
                        }
                      }
                    }}>
                      {renderAiReports()}
                    </Box>
                  )}
                  {activeStep === 4 && (
                    <Box sx={{ 
                      '& .MuiGrid-root': { 
                        '& .MuiFormControl-root': {
                          backgroundColor: '#242936',
                          borderRadius: 1,
                          p: 1
                        }
                      }
                    }}>
                      {renderCompetitorsStep()}
                    </Box>
                  )}
                </Box>

                {/* Navigation Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                  <Button
                    onClick={handleBack}
                    disabled={activeStep === 0 || loadingStage !== ''}
                    sx={{
                      color: 'white',
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
                        <CircularProgress size={24} sx={{ color: 'white' }} />
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
          <AnalysisDashboard 
            analysis={analysis}
            competitors={competitors}
            insights={insights}
            onReset={() => {
              setAnalysis(null);
              setCompetitors([]);
              setInsights(null);
              setActiveStep(0);
              setFormData({});
            }}
          />
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        {renderLiveInsightsSection()}
        
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
              <Typography variant="h5" sx={{ color: 'white', mb: 3 }}>
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
                          <Typography variant="subtitle1" sx={{ color: 'white' }}>
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
                <Typography sx={{ color: '#a0aec0', textAlign: 'center', my: 4 }}>
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
  
  // Function to load a history item
  const loadHistoryItem = (item) => {
    // Get the market data from the selected history item
    const marketData = item.marketData;
    
    if (!marketData) return;
    
    // Close the history modal
    setShowHistory(false);
    
    // Set the insights and competitors from the history item
    setInsights({
      demographics: marketData.demographics,
      marketAnalysis: {
        current_growth_rate: marketData.marketSize?.[marketData.marketSize.length - 1]?.value
      },
      swot: marketData.swot
    });
    
    setCompetitors(marketData.competitors?.map(comp => ({
      name: comp.name,
      marketShare: comp.marketShare,
      targetAudience: comp.targetMarket,
      marketingStrategies: comp.strategies
    })) || []);
    
    // Move to the competitors step
    setActiveStep(4);
  };
};

export default StartupForm;
