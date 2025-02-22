import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Link,
  Grid,
  Alert,
  Paper
} from '@mui/material';
import { auth } from '../config/firebase';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword 
} from 'firebase/auth';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error("Passwords don't match");
        }
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayVideo = () => {
    // Handle video intro playback
    console.log('Playing video intro');
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <Grid container sx={{ height: '100vh' }}>
      {/* Left side - Image and Text */}
      <Grid item xs={12} md={6} 
        sx={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("https://source.unsplash.com/random?workspace")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          textAlign: 'center',
          p: 4
        }}>
        <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 'bold' }}>
          Better Login
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, maxWidth: '80%' }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua.
        </Typography>
        <Button
          variant="contained"
          onClick={handlePlayVideo}
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            borderRadius: '25px',
            px: 4
          }}
        >
          Play Video Intro
        </Button>
      </Grid>

      {/* Right side - Login Form */}
      <Grid item xs={12} md={6} sx={{ p: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Box sx={{ maxWidth: 400, width: '100%', mx: 'auto' }}>
          <Typography variant="h5" sx={{ mb: 4 }}>
            {isSignUp ? 'Sign Up' : 'Login'}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              sx={{ mb: 2 }}
            />
            
            {isSignUp && (
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                margin="normal"
                required
                sx={{ mb: 2 }}
              />
            )}

            {!isSignUp && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Remember Me"
                />
                <Link href="#" underline="hover" color="primary.main">
                  Forgot Password?
                </Link>
              </Box>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 2,
                mb: 2,
                height: '48px',
                borderRadius: '4px',
                textTransform: 'none'
              }}
              disabled={loading}
            >
              {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Login')}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <Link 
                  component="button"
                  type="button"
                  underline="hover" 
                  color="primary.main"
                  onClick={toggleMode}
                >
                  {isSignUp ? 'Login' : 'Sign Up'}
                </Link>
              </Typography>
            </Box>
          </form>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Auth;
