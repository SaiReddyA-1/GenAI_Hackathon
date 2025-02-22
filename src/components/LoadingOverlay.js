import React from 'react';
import { Backdrop, CircularProgress, Typography, Box } from '@mui/material';

const LoadingOverlay = ({ open, message = "Loading..." }) => {
  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.modal + 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        backgroundColor: 'rgba(0, 0, 0, 0.8)'
      }}
      open={open}
    >
      <CircularProgress 
        color="inherit" 
        size={60}
        thickness={4}
      />
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h5" component="div" gutterBottom>
          {message}
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 400, mx: 'auto', opacity: 0.9 }}>
          We're analyzing your startup data and preparing comprehensive insights...
        </Typography>
      </Box>
    </Backdrop>
  );
};

export default LoadingOverlay;
