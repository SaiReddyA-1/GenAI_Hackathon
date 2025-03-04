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
import { getCompetitorsWithGemini, getStartupInsightsWithGemini } from '../services/gemini';
import useAuth from '../hooks/useAuth';
import AnalysisDashboard from './AnalysisDashboard';
import ReactMarkdown from 'react-markdown';

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'E-commerce', 'Education', 
  'Entertainment', 'Food & Beverage', 'Real Estate', 'Transportation',
  'Energy', 'Manufacturing', 'Retail', 'Consulting', 'Agriculture',
  'Hospitality', 'Media', 'Fashion', 'Fitness', 'Travel'
];

const STEPS = [
  'Startup Information',
  'Generate Report',
  'View Dashboard'
];

const StartupForm = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    startupIdea: '',
    problemSolution: '',
    industry: ''
  });
  const [errors, setErrors] = useState({});
  const [loadingStage, setLoadingStage] = useState('');
  const [error, setError] = useState('');
  const [competitors, setCompetitors] = useState([]); 
  const [insights, setInsights] = useState(null);
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
          value={formData.startupIdea || ''}
          onChange={(e) => handleFormChange('startupIdea', e.target.value)}
          error={!!errors.startupIdea}
          helperText={errors.startupIdea}
          multiline
          rows={3}
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
          value={formData.problemSolution || ''}
          onChange={(e) => handleFormChange('problemSolution', e.target.value)}
          error={!!errors.problemSolution}
          helperText={errors.problemSolution}
          multiline
          rows={3}
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
            error={!!errors.industry}
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
          {errors.industry && (
            <FormHelperText error>{errors.industry}</FormHelperText>
          )}
        </FormControl>
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

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.startupIdea?.trim()) {
      newErrors.startupIdea = 'Please enter your startup idea';
      isValid = false;
    }

    if (!formData.problemSolution?.trim()) {
      newErrors.problemSolution = 'Please explain what problem your idea solves';
      isValid = false;
    }

    if (!formData.industry?.trim()) {
      newErrors.industry = 'Please select an industry';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
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
          const savedId = await saveToFirebase({
            ...formData,
            competitors: competitorData,
            ...insightsData
          });
          
          console.log('Analysis saved with ID:', savedId);
          
          // Store the reference in localStorage for the dashboard charts
          localStorage.setItem('marketAnalysisData', JSON.stringify({
            ...insightsData,
            analysisId: savedId
          }));
        } catch (err) {
          console.error('Error saving to Firebase:', err);
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
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
          <CircularProgress sx={{ mb: 3, color: '#6c5ce7' }} />
          <Typography variant="h6" sx={{ color: 'white' }}>
            {loadingStage}
          </Typography>
        </Box>
      );
    }

    if (!competitors.length) {
      return (
        <Typography variant="body1" gutterBottom sx={{ color: 'white' }}>
          No competitors found.
        </Typography>
      );
    }

    return (
      <>
        <Typography variant="subtitle2" gutterBottom sx={{ color: '#a0aec0', mb: 3, fontStyle: 'italic', textAlign: 'center' }}>
          Note: The market share data shown below is an AI-generated estimate based on available market information. These values should be considered approximate and used as a starting point for further research.
        </Typography>
        
        <Grid container spacing={3}>
          {competitors.map((competitor, index) => (
            <Grid item xs={12} key={index}>
              <Card sx={{ backgroundColor: '#1e2430', borderRadius: 2, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: '#e2e8f0', mb: 1 }}>
                    {competitor.name}
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#a0aec0', display: 'inline' }}>
                      Market Share: 
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#e2e8f0', display: 'inline', ml: 1 }}>
                      {Math.round(competitor.marketShare)}%
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#a0aec0', display: 'inline' }}>
                      Target Audience: 
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#e2e8f0', display: 'inline', ml: 1 }}>
                      {competitor.targetAudience}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#a0aec0', display: 'inline' }}>
                      Marketing Strategies: 
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#e2e8f0', display: 'inline', ml: 1 }}>
                      {competitor.marketingStrategies}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </>
    );
  };

  const renderAnalysisStep = () => {
    if (loadingStage) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
          <CircularProgress sx={{ mb: 3, color: '#6c5ce7' }} />
          <Typography variant="h6" sx={{ color: 'white' }}>
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
              <Typography variant="h6" color="primary" gutterBottom>
                Market Overview
              </Typography>
              <Typography variant="body1">
                {insights.marketAnalysis?.summary}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }} elevation={2}>
              <Typography variant="h6" color="primary" gutterBottom>
                Competitive Analysis
              </Typography>
              <Typography variant="body1">
                {insights.competitorInsights?.summary}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }} elevation={2}>
              <Typography variant="h6" color="primary" gutterBottom>
                Funding Strategy
              </Typography>
              <Typography variant="body1">
                {insights.fundingInsights?.summary}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }} elevation={2}>
              <Typography variant="h6" color="primary" gutterBottom>
                Growth Strategy
              </Typography>
              <Typography variant="body1">
                {insights.userGrowthInsights?.summary}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Detailed Analysis & Projections
          </Typography>
          <AnalysisDashboard analysisData={insights} />
        </Box>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={() => {
              setActiveStep(0);
              setInsights(null);
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
        </div>
      </div>
    );
  };

  const loadHistoryItem = (item) => {
    const marketData = item.marketData;
    
    if (!marketData) return;
    
    setShowHistory(false);
    
    setInsights({
      demographics: marketData.demographics,
      marketAnalysis: {
        trendAnalysis: marketData.marketAnalysis?.summary || 'No analysis available'
      },
      swot: marketData.swot
    });
    
    setCompetitors(marketData.competitors?.map(comp => ({
      name: comp.name,
      marketShare: comp.marketShare,
      targetAudience: comp.targetMarket,
      marketingStrategies: comp.strategies
    })) || []);
    
    localStorage.setItem('marketAnalysisData', JSON.stringify({
      ...marketData,
      analysisId: item.id
    }));
    
    setActiveStep(4);
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

        {!insights ? (
          <>
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
                  color: 'white',
                },
                '& .MuiStepLabel-root .Mui-active .MuiStepIcon-text': {
                  fill: 'white',
                },
              }}
            >
              {STEPS.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
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
                      color: '#6c5ce7',
                      borderColor: '#6c5ce7',
                      '&:hover': {
                        borderColor: '#5f50e1',
                        backgroundColor: 'rgba(108, 92, 231, 0.1)'
                      }
                    }}
                  >
                    Back
                  </Button>
                  <Button 
                    variant="contained"
                    onClick={() => setActiveStep(2)}
                    sx={{
                      bgcolor: '#6c5ce7',
                      '&:hover': {
                        bgcolor: '#5f50e1'
                      }
                    }}
                  >
                    View Dashboard
                  </Button>
                </Box>
              </Box>
            )}
            
            {activeStep === 2 && (
              <AnalysisDashboard 
                analysis={{
                  overview: {
                    growthRate: insights?.marketAnalysis?.growth_rate || '0',
                    marketSize: insights?.demographics?.market_size || 'N/A',
                    competitorCount: competitors?.length || '0'
                  },
                  marketAnalysis: {
                    trendAnalysis: insights?.marketAnalysis?.summary || 'No analysis available'
                  },
                  financialProjections: {
                    estimatedFunding: {
                      initialFunding: insights?.fundingInsights?.initial_funding || 0
                    },
                    insights: insights?.fundingInsights?.summary || 'No funding insights available',
                    projectionCharts: {
                      financial: []
                    }
                  },
                  competitorAnalysis: {
                    insights: insights?.competitorInsights?.summary || 'No competitor insights available',
                    competitorData: competitors || [],
                    marketShare: competitors || [],
                    radarData: []
                  },
                  marketTrends: {
                    growthProjection: []
                  },
                  aiRecommendations: {
                    growthStrategy: insights?.userGrowthInsights?.summary || 'No growth strategy available',
                    riskMitigation: insights?.risksAndSolutions?.solutions || [],
                    swot: insights?.swot || {
                      strengths: [],
                      weaknesses: [],
                      opportunities: [],
                      threats: []
                    }
                  }
                }}
                competitors={competitors}
                insights={insights}
              />
            )}
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
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
};

export default StartupForm;
