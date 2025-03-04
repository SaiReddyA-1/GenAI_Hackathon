import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, IconButton, Fab, TextField, Typography, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { BsChatSquareTextFill } from 'react-icons/bs';
import ReactMarkdown from 'react-markdown';
import geminiService from '../services/geminiService';
import '../styles/ChatBot.css';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: 'Hi! I\'m your StartupLens assistant powered by Gemini AI. How can I help you today?', isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Show toast notification after 3 seconds
    const timer = setTimeout(() => {
      setShowToast(true);
    }, 15000);

    // Hide toast after 8 seconds total (visible for 5 seconds)
    const hideTimer = setTimeout(() => {
      setShowToast(false);
    }, 20000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await geminiService.sendMessage(userMessage);
      
      if (!response || typeof response !== 'string' || response.trim().length === 0) {
        throw new Error('Invalid response received');
      }

      const cleanResponse = response
        .trim()
        .replace(/^\s*[\r\n]/gm, '\n')
        .replace(/\n\s*\n/g, '\n\n');

      setMessages(prev => [...prev, { 
        text: cleanResponse,
        isBot: true 
      }]);
    } catch (error) {
      console.error('Error getting response:', error);
      let errorMessage = 'I apologize, but I encountered an error. Please try again in a moment.';
      
      if (error.message.includes('API key')) {
        errorMessage = 'I\'m currently unable to access my AI capabilities. Please contact support.';
      } else if (error.message.includes('quota')) {
        errorMessage = 'I\'ve reached my limit for now. Please try again in a few minutes.';
      } else if (error.message.includes('network')) {
        errorMessage = 'I\'m having trouble connecting. Please check your internet connection.';
      }
      
      setMessages(prev => [...prev, { 
        text: errorMessage,
        isBot: true,
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="chat-bot-container">
      {showToast && (
        <div className="chat-toast">
          <p>👋 Hi! I'm StartupLens Bot. Need help with your startup idea?</p>
        </div>
      )}
      <Fab
        aria-label="chat"
        className="chat-fab"
        onClick={toggleChat}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          display: isOpen ? 'none' : 'flex',
          zIndex: 1000,
          bgcolor: '#0059b3', // Primary color
          '&:hover': {
            bgcolor: '#006dd9', // Slightly darker on hover
          }
        }}
      >
        <BsChatSquareTextFill size={24} color="white" />
      </Fab>

      <Paper
        className={`chat-window ${isOpen ? 'visible' : ''}`}
        sx={{
          display: isOpen ? 'flex' : 'none',
          flexDirection: 'column',
          position: 'fixed',
          bottom: 20,
          right: 20,
          width: 350,
          height: 500,
          boxShadow: 3,
          borderRadius: 2,
          overflow: 'hidden',
          zIndex: 1000,
        }}
      >
        <Box
          sx={{
            p: 2,
            bgcolor: 'primary.main',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6">StartupLens Assistant</Typography>
          <IconButton color="inherit" onClick={() => setIsOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box
          className="chat-messages"
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              className="chat-message"
              sx={{
                alignSelf: message.isBot ? 'flex-start' : 'flex-end',
                maxWidth: '80%',
              }}
            >
              <Paper
                sx={{
                  p: 1,
                  px: 2,
                  bgcolor: message.isError ? 'error.light' : 
                          message.isBot ? 'grey.100' : 'primary.main',
                  color: message.isError ? 'error.contrastText' :
                         message.isBot ? 'text.primary' : 'white',
                  borderRadius: message.isBot ? '0 15px 15px 15px' : '15px 0 15px 15px',
                }}
              >
                {message.isBot ? (
                  <Box className="markdown-content">
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                  </Box>
                ) : (
                  <Typography variant="body2">{message.text}</Typography>
                )}
              </Paper>
            </Box>
          ))}
          {isLoading && (
            <Box
              className="chat-message"
              sx={{
                alignSelf: 'flex-start',
                maxWidth: '80%',
              }}
            >
              <Paper
                sx={{
                  p: 1,
                  px: 2,
                  bgcolor: 'grey.100',
                  borderRadius: '0 15px 15px 15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <CircularProgress size={20} />
                <Typography variant="body2">Thinking...</Typography>
              </Paper>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        <Box className="chat-input" sx={{ p: 2, bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              sx={{ flex: 1 }}
            />
            <IconButton 
              color="primary" 
              onClick={handleSend}
              disabled={isLoading}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>
    </div>
  );
};

export default ChatBot;
