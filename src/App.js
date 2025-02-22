import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box, CircularProgress } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import StartupForm from './components/StartupForm';
import AnalysisDashboard from './components/AnalysisDashboard';
import Header from './components/Header';
import Auth from './components/Auth';
import Landing from './components/Landing';
import useAuth from './hooks/useAuth';

function App() {
  const { user, loading } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#00ADB5',
      },
      secondary: {
        main: '#AC7DD2',
      },
      background: {
        default: darkMode ? '#222831' : '#fdf6fd',
        paper: darkMode ? '#393E46' : '#fff4ff',
      },
      text: {
        primary: darkMode ? '#EEEEEE' : '#222831',
        secondary: darkMode ? '#C5C5C5' : '#393E46',
      },
    },
    typography: {
      fontFamily: "'Inter', sans-serif",
    },
  });

  const handleAnalysisComplete = (data) => {
    setAnalysisData(data);
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
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
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/dashboard"
            element={
              <>
                <Header darkMode={darkMode} setDarkMode={setDarkMode} />
                <Container maxWidth="lg">
                  {!user ? (
                    <Navigate to="/login" />
                  ) : analysisData ? (
                    <AnalysisDashboard data={analysisData} />
                  ) : (
                    <StartupForm onAnalysisComplete={handleAnalysisComplete} />
                  )}
                </Container>
              </>
            }
          />
          <Route 
            path="/login" 
            element={
              <>
                <Header darkMode={darkMode} setDarkMode={setDarkMode} />
                <Container maxWidth="lg">
                  {!user ? <Auth /> : <Navigate to="/dashboard" />}
                </Container>
              </>
            } 
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
