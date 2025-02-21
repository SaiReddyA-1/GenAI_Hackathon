import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import { saveStartupAnalysis } from '../services/firebase';
import { analyzeStartupIdea, generateFollowUpQuestions } from '../services/openai';
import useAuth from '../hooks/useAuth';

const StartupForm = ({ onAnalysisComplete }) => {
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  // Initialize with first question
  useEffect(() => {
    getNextQuestion();
  }, []);

  const getNextQuestion = async () => {
    try {
      const response = await generateFollowUpQuestions('', '', answers);
      if (response.questions && response.questions.length > 0) {
        setCurrentQuestion(response.questions[0]);
      } else {
        // No more questions, complete the analysis
        finalizeAnalysis();
      }
    } catch (error) {
      console.error('Error getting next question:', error);
      setError('Failed to generate next question');
    }
  };

  const handleAnswerSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Save the current answer
      const updatedAnswers = {
        ...answers,
        [currentQuestion.id]: currentAnswer
      };
      setAnswers(updatedAnswers);

      // If this is the first answer (startup idea), perform initial analysis
      if (currentQuestion.id === 'startup_idea') {
        const analysisResult = await analyzeStartupIdea(currentAnswer);
        setAnalysis(analysisResult);
      }

      // Clear current answer
      setCurrentAnswer('');

      // Get next question
      const response = await generateFollowUpQuestions(
        answers.startup_idea || '',
        analysis?.industry || '',
        updatedAnswers
      );

      if (response.questions && response.questions.length > 0) {
        setCurrentQuestion(response.questions[0]);
      } else {
        // No more questions, complete the analysis
        await finalizeAnalysis();
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const finalizeAnalysis = async () => {
    try {
      setLoading(true);
      
      // Save final analysis
      const finalAnalysis = {
        ...analysis,
        answers,
        userId: user.uid,
        timestamp: new Date().toISOString()
      };

      await saveStartupAnalysis(finalAnalysis);
      onAnalysisComplete(finalAnalysis);
      setIsComplete(true);
    } catch (error) {
      console.error('Error saving analysis:', error);
      setError('Failed to save analysis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Startup Analysis
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!isComplete ? (
        <Box>
          {currentQuestion && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label={currentQuestion.question}
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                variant="outlined"
                disabled={loading}
              />
            </Box>
          )}

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={handleAnswerSubmit}
              disabled={!currentAnswer || loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Next'}
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Analysis Results
          </Typography>
          {analysis && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Industry</Typography>
                <Typography>{analysis.industry}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Market Size</Typography>
                <Typography>{analysis.marketSize}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Target Market</Typography>
                <Typography>{analysis.targetMarket}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Competitors</Typography>
                <Typography>{analysis.competitors.join(', ')}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Risks</Typography>
                <Typography>{analysis.risks.join(', ')}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Strengths</Typography>
                <Typography>{analysis.strengths.join(', ')}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Recommendations</Typography>
                <Typography>{analysis.recommendations.join(', ')}</Typography>
              </Grid>
            </Grid>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default StartupForm;
