import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box, CircularProgress } from '@mui/material';
import StartupForm from './components/StartupForm';
import AnalysisDashboard from './components/AnalysisDashboard';
import Auth from './components/Auth';
import useAuth from './hooks/useAuth';

function App() {
  const { user, loading } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#2196f3',
      },
      secondary: {
        main: '#f50057',
      },
    },
  });

  const handleAnalysisComplete = (data) => {
    setAnalysisData(data);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        {!user ? (
          <Auth />
        ) : analysisData ? (
          <AnalysisDashboard data={analysisData} />
        ) : (
          <StartupForm onAnalysisComplete={handleAnalysisComplete} />
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;
