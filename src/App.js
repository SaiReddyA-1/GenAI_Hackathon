import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box, CircularProgress } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import StartupForm from './components/StartupForm';
import AnalysisDashboard from './components/AnalysisDashboard';
import Auth from './components/Auth';
import Landing from './components/Landing';
import useAuth from './hooks/useAuth';
import ChatBot from './components/ChatBot';
import MarketChartsDashboard from './components/MarketChartsDashboard';
import NavbarWrapper from './components/NavbarWrapper';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// AppContent component to access useLocation
const AppContent = () => {
  const { user, loading } = useAuth();
  const [analysisData, setAnalysisData] = useState(null);
  const location = useLocation();
  
  // Check if we're on the landing page
  const isLandingPage = location.pathname === '/';

  const handleAnalysisComplete = (data) => {
    setAnalysisData(data);
  };

  return (
    <>
      <NavbarWrapper />
      <Box sx={{ 
        // Only apply padding top when not on landing page
        // Increased padding to ensure content starts below navbar
        pt: isLandingPage ? 0 : { xs: '80px', sm: '90px' },
        minHeight: '100vh'
      }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <Container maxWidth="lg">
                  {analysisData ? (
                    <AnalysisDashboard data={analysisData} />
                  ) : (
                    <StartupForm onAnalysisComplete={handleAnalysisComplete} />
                  )}
                </Container>
              </ProtectedRoute>
            }
          />
          <Route
            path="/market-charts"
            element={
              <ProtectedRoute>
                <Container maxWidth="lg">
                  <MarketChartsDashboard 
                    marketData={JSON.parse(localStorage.getItem('marketAnalysisData'))}
                  />
                </Container>
              </ProtectedRoute>
            }
          />
          <Route 
            path="/login" 
            element={
              user ? (
                <Navigate to="/dashboard" />
              ) : (
                <Container maxWidth="lg">
                  <Auth />
                </Container>
              )
            }
          />
        </Routes>
      </Box>
      <ChatBot />
    </>
  );
};

function App() {
  const { loading } = useAuth();
  const [darkMode, setDarkMode] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#0059b3',
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

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
