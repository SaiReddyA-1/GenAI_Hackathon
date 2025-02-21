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
} from '@mui/material';
import { db } from '../config/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { analyzeStartupIdea, generateFollowUpQuestions } from '../services/openai';
import useAuth from '../hooks/useAuth';
import AnalysisDashboard from './AnalysisDashboard';

// Sample test responses for different question types
const testAnswers = {
  startup_idea: {
    answer: "An AI-powered personal finance app that helps users manage their investments, track expenses, and provides personalized financial advice using machine learning algorithms.",
  },
  target_market: {
    answer: "Primary target market includes young professionals (25-40 years) in urban areas who are tech-savvy and interested in personal finance. Market size estimated at 50M users in the US alone. Secondary market includes small business owners looking for financial management tools.",
  },
  unique_value: {
    answer: "1. AI-driven personalized investment strategies based on user's risk profile and goals\n2. Real-time expense tracking with predictive analytics\n3. Integration with multiple financial institutions\n4. Automated tax optimization suggestions\n5. Community features for financial learning",
  },
  business_model: {
    answer: "Freemium model with three tiers:\n1. Basic (Free): Essential tracking and budgeting\n2. Pro ($9.99/month): Advanced analytics and personalized advice\n3. Enterprise ($49.99/month): Business features and team management\nAdditional revenue from partnership referrals with financial institutions.",
  },
  go_to_market: {
    answer: "Initial launch strategy:\n1. Start with iOS app in major US cities\n2. Partner with financial influencers for marketing\n3. Offer 3-month free Pro trial for early adopters\n4. Digital marketing focused on LinkedIn and Instagram\nRequired resources: $500K initial funding, team of 5 developers, 2 ML engineers, and 2 financial advisors.",
  }
};

const StartupForm = () => {
  const { user } = useAuth();
  const [startupIdea, setStartupIdea] = useState('');
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [isTestMode, setIsTestMode] = useState(false);

  const steps = ['Initial Idea', 'Follow-up Questions', 'Analysis Results'];

  const handleStartupIdeaSubmit = async (e) => {
    e.preventDefault();
    
    // In test mode, use the sample startup idea
    const ideaToAnalyze = isTestMode ? testAnswers.startup_idea.answer : startupIdea;
    if (!ideaToAnalyze.trim()) return;

    try {
      setLoading(true);
      setError('');

      // Get initial analysis
      const initialAnalysis = await analyzeStartupIdea(ideaToAnalyze);
      setAnalysis(initialAnalysis);

      // Get first set of questions
      const response = await generateFollowUpQuestions(ideaToAnalyze);
      setQuestions(response.questions);
      setCurrentQuestion(response.questions[0]);
      setActiveStep(1);

      // If in test mode, automatically submit the first answer after a short delay
      if (isTestMode) {
        setTimeout(() => {
          handleAnswerSubmit(testAnswers[response.questions[0].id]?.answer || "Test answer");
        }, 1000);
      }
    } catch (error) {
      console.error('Error analyzing startup idea:', error);
      setError('Failed to analyze startup idea. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async (answer) => {
    try {
      setLoading(true);
      setError('');

      // Save the answer
      const updatedAnswers = {
        ...answers,
        [currentQuestion.id]: answer
      };
      setAnswers(updatedAnswers);

      // Get next questions
      const response = await generateFollowUpQuestions(
        startupIdea,
        analysis.industry,
        updatedAnswers
      );

      if (response.questions.length === 0) {
        // No more questions, finalize analysis
        await finalizeAnalysis();
        setActiveStep(2);
      } else {
        // Set next question
        setQuestions([...questions, ...response.questions]);
        setCurrentQuestion(response.questions[0]);

        // If in test mode, automatically submit the next answer after a short delay
        if (isTestMode) {
          setTimeout(() => {
            const nextAnswer = testAnswers[response.questions[0].id]?.answer || "Test answer";
            handleAnswerSubmit(nextAnswer);
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error processing answer:', error);
      setError('Failed to process answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const finalizeAnalysis = async () => {
    try {
      setLoading(true);
      setError('');

      const finalAnalysis = {
        ...analysis,
        answers,
        userId: user?.uid || 'anonymous',
        timestamp: new Date().toISOString()
      };

      // Save to Firestore
      await addDoc(collection(db, 'startupAnalysis'), finalAnalysis);
      
      setAnalysis(finalAnalysis);
      setIsComplete(true);
    } catch (error) {
      console.error('Error finalizing analysis:', error);
      setError('Failed to save analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderQuestionForm = () => {
    // In test mode, automatically submit the answer after a short delay
    if (isTestMode && currentQuestion) {
      const testAnswer = testAnswers[currentQuestion.id]?.answer;
      if (testAnswer) {
        setTimeout(() => {
          handleAnswerSubmit(testAnswer);
        }, 1000);
        return (
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {currentQuestion?.question}
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                value={testAnswer}
                disabled
                sx={{ mt: 2 }}
              />
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={20} sx={{ mr: 2 }} />
                <Typography>Auto-submitting answer in test mode...</Typography>
              </Box>
            </CardContent>
          </Card>
        );
      }
    }

    return (
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {currentQuestion?.question}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            placeholder="Type your answer here..."
            sx={{ mt: 2 }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAnswerSubmit(e.target.value);
                e.target.value = '';
              }
            }}
          />
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={(e) => {
              const input = e.target.parentElement.querySelector('textarea');
              handleAnswerSubmit(input.value);
              input.value = '';
            }}
          >
            Submit Answer
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Startup Analyzer</Typography>
        <FormControlLabel
          control={
            <Switch
              checked={isTestMode}
              onChange={(e) => {
                setIsTestMode(e.target.checked);
                // Reset form when toggling test mode
                if (e.target.checked) {
                  setStartupIdea(testAnswers.startup_idea.answer);
                } else {
                  setStartupIdea('');
                  setAnswers({});
                  setCurrentQuestion(null);
                  setQuestions([]);
                  setAnalysis(null);
                  setActiveStep(0);
                }
              }}
              color="primary"
            />
          }
          label="Test Mode"
        />
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {activeStep === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            What's your startup idea?
          </Typography>
          <form onSubmit={handleStartupIdeaSubmit}>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="Describe your startup idea..."
              value={isTestMode ? testAnswers.startup_idea.answer : startupIdea}
              onChange={(e) => setStartupIdea(e.target.value)}
              disabled={isTestMode}
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || (!isTestMode && !startupIdea.trim())}
            >
              {loading ? <CircularProgress size={24} /> : 'Analyze Idea'}
            </Button>
          </form>
        </Paper>
      )}

      {activeStep === 1 && !loading && currentQuestion && renderQuestionForm()}

      {activeStep === 2 && analysis && (
        <AnalysisDashboard analysis={analysis} />
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default StartupForm;
