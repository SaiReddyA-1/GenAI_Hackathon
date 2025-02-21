import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box, CircularProgress } from '@mui/material';
import StartupForm from './components/StartupForm';
import AnalysisDashboard from './components/AnalysisDashboard';
import Header from './components/Header';
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
      <Header darkMode={darkMode} setDarkMode={setDarkMode} />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          {!user ? (
            <Auth />
          ) : !analysisData ? (
            <StartupForm onAnalysisComplete={handleAnalysisComplete} />
          ) : (
            <AnalysisDashboard data={analysisData} />
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
