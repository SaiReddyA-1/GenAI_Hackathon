/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true }); // Allow all origins for development

// Initialize admin only if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// Function to generate startup questions using Gemini Chatbot Extension
exports.generateStartupQuestions = functions.https.onCall((data, context) => {
  return cors((req, res) => {
    try {
      const { idea, industry, previousAnswers } = data;
      
      // If this is the first question
      if (Object.keys(previousAnswers || {}).length === 0) {
        return res.json({
          questions: [{
            id: 'startup_idea',
            question: "What's your startup idea?",
            type: 'text'
          }]
        });
      }

      // Create conversation history for context
      const conversationHistory = Object.entries(previousAnswers).map(([id, answer]) => ({
        role: id === 'startup_idea' ? 'user_idea' : 'user',
        content: answer
      }));

      // Call the Gemini Chatbot extension
      admin.firestore()
        .collection('ext-firestore-gemini-chatbot-conversations')
        .add({
          prompt: `As a startup advisor, I need you to generate ONE insightful follow-up question about this startup idea. Focus on market validation, business model, technical feasibility, competitive advantage, growth potential, or risk assessment. Format as a single direct question.

Context:
Startup Idea: ${idea}
Industry: ${industry}
Previous Answers: ${JSON.stringify(previousAnswers)}`,
          temperature: 0.7,
          maxTokens: 100,
          conversationHistory: conversationHistory,
          userId: context.auth?.uid || 'anonymous'
        })
        .then(chatbotResponse => {
          // Wait for the response
          const unsubscribe = admin.firestore()
            .collection('ext-firestore-gemini-chatbot-responses')
            .doc(chatbotResponse.id)
            .onSnapshot((doc) => {
              if (doc.exists && doc.data()?.response) {
                unsubscribe();
                let question = doc.data().response.trim();

                // Ensure the response is a question
                if (!question.endsWith('?')) {
                  question += '?';
                }

                res.json({
                  questions: [{
                    id: 'q_' + Object.keys(previousAnswers || {}).length,
                    question: question,
                    type: 'text'
                  }]
                });
              }
            });
        })
        .catch(error => {
          console.error('Error generating questions:', error);
          res.status(500).send('Failed to generate questions');
        });
    } catch (error) {
      console.error('Error generating questions:', error);
      res.status(500).send('Failed to generate questions');
    }
  });
});

// Function to analyze startup idea using Gemini
exports.analyzeStartupIdea = functions.https.onCall((data, context) => {
  return cors((req, res) => {
    try {
      const { idea, category, answers } = data;

      // Create conversation history for context
      const conversationHistory = Object.entries(answers).map(([id, answer]) => ({
        role: id === 'startup_idea' ? 'user_idea' : 'user',
        content: answer
      }));

      // Call the Gemini Chatbot extension for analysis
      admin.firestore()
        .collection('ext-firestore-gemini-chatbot-conversations')
        .add({
          prompt: `As a startup advisor, analyze this startup idea and provide a comprehensive evaluation. 
          
Startup Idea: ${idea}
Category: ${category}
Previous Answers: ${JSON.stringify(answers)}

Provide analysis in the following JSON format:
{
  "businessModel": {
    "recommendedModels": ["model1", "model2"],
    "reasoning": ["reason1", "reason2"],
    "risks": ["risk1", "risk2"],
    "opportunities": ["opportunity1", "opportunity2"]
  },
  "revenueStrategy": {
    "primaryRevenue": "main revenue stream",
    "secondaryRevenue": ["other streams"],
    "pricingStrategy": "pricing approach",
    "monetizationTimeline": "timeline details"
  },
  "marketInsights": {
    "targetSegments": ["segment1", "segment2"],
    "problemStatement": "problem description",
    "marketSize": "market size estimate",
    "competitors": ["competitor1", "competitor2"]
  },
  "executionPlan": {
    "goToMarket": "go to market strategy",
    "resourceNeeds": "required resources"
  }
}`,
          temperature: 0.7,
          maxTokens: 1000,
          conversationHistory: conversationHistory,
          userId: context.auth?.uid || 'anonymous'
        })
        .then(chatbotResponse => {
          // Wait for the response
          const unsubscribe = admin.firestore()
            .collection('ext-firestore-gemini-chatbot-responses')
            .doc(chatbotResponse.id)
            .onSnapshot((doc) => {
              if (doc.exists && doc.data()?.response) {
                unsubscribe();
                let analysis = doc.data().response;

                // Parse the JSON response
                try {
                  if (typeof analysis === 'string') {
                    analysis = JSON.parse(analysis);
                  }
                  
                  res.json({
                    category,
                    ...analysis
                  });
                } catch (error) {
                  console.error('Error parsing Gemini response:', error);
                  res.status(500).send('Failed to parse analysis');
                }
              }
            });
        })
        .catch(error => {
          console.error('Error analyzing startup:', error);
          res.status(500).send('Failed to analyze startup');
        });
    } catch (error) {
      console.error('Error analyzing startup:', error);
      res.status(500).send('Failed to analyze startup');
    }
  });
});
