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

// Initialize admin only if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// Function to generate startup questions using Gemini Chatbot Extension
exports.generateStartupQuestions = functions.https.onCall(async (data, context) => {
  try {
    const { idea, industry, previousAnswers } = data;
    
    // If this is the first question
    if (Object.keys(previousAnswers || {}).length === 0) {
      return {
        questions: [{
          id: 'startup_idea',
          question: "What's your startup idea?",
          type: 'text'
        }]
      };
    }

    // Create conversation history for context
    const conversationHistory = Object.entries(previousAnswers).map(([id, answer]) => ({
      role: id === 'startup_idea' ? 'user_idea' : 'user',
      content: answer
    }));

    // Call the Gemini Chatbot extension
    const chatbotResponse = await admin.firestore()
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
      });

    // Wait for the response
    const responseDoc = await new Promise((resolve) => {
      const unsubscribe = admin.firestore()
        .collection('ext-firestore-gemini-chatbot-responses')
        .doc(chatbotResponse.id)
        .onSnapshot((doc) => {
          if (doc.exists && doc.data()?.response) {
            unsubscribe();
            resolve(doc);
          }
        });
    });

    let question = responseDoc.data().response.trim();

    // Ensure the response is a question
    if (!question.endsWith('?')) {
      question += '?';
    }

    return {
      questions: [{
        id: 'q_' + Object.keys(previousAnswers || {}).length,
        question: question,
        type: 'text'
      }]
    };

  } catch (error) {
    console.error('Error generating question:', error);
    
    // Fallback questions if the extension fails
    const fallbackQuestions = [
      "What is your target market and its size?",
      "How do you plan to monetize your solution?",
      "Who are your main competitors and what's your unique advantage?",
      "What are the key technical challenges in building this solution?",
      "What is your go-to-market strategy?",
      "How do you plan to scale the business?",
      "What are the major risks and how will you mitigate them?",
      "What resources and funding will you need initially?",
      "How will you measure success and key metrics?",
      "What is your timeline for launching the MVP?"
    ];

    const currentCount = Object.keys(previousAnswers || {}).length;
    return {
      questions: [{
        id: 'q_' + currentCount,
        question: fallbackQuestions[currentCount % fallbackQuestions.length],
        type: 'text'
      }]
    };
  }
});
