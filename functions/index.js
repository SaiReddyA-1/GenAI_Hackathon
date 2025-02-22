/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

admin.initializeApp();

const db = admin.firestore();

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const cors = require('cors')({ origin: true }); // Allow all origins for development

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
exports.analyzeStartupIdea = functions.https.onCall(async (data) => {
  try {
    const startupIdea = data.startupIdea;
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    // Store the startup idea in Firestore
    const docRef = await db.collection("startupIdeas").add({
      idea: startupIdea,
      timestamp: timestamp,
      status: "pending"
    });

    // Return the document ID
    return {
      success: true,
      message: "Startup idea submitted successfully",
      docId: docRef.id
    };
  } catch (error) {
    console.error("Error analyzing startup idea:", error);
    return {
      success: false,
      message: "Error processing startup idea"
    };
  }
});

exports.getStartupAnalysis = functions.https.onCall(async (data) => {
  try {
    const docId = data.docId;
    
    // Get the analysis from Firestore
    const doc = await db.collection("startupIdeas").doc(docId).get();
    
    if (!doc.exists) {
      return {
        success: false,
        message: "Analysis not found"
      };
    }

    const analysis = doc.data();
    return {
      success: true,
      analysis: analysis
    };

  } catch (error) {
    console.error("Error fetching startup analysis:", error);
    return {
      success: false,
      message: "Error retrieving analysis"
    };
  }
});

// Function to analyze startup idea using Gemini
exports.analyzeStartupIdeaOld = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    try {
      // Set CORS headers
      response.set('Access-Control-Allow-Origin', '*');
      response.set('Access-Control-Allow-Methods', 'GET, POST');
      response.set('Access-Control-Allow-Headers', 'Content-Type');

      // Handle preflight requests
      if (request.method === 'OPTIONS') {
        response.status(204).send('');
        return;
      }

      const { startupIdea, industry, marketSize, competitors, businessModel } = request.body;

      // Your analysis logic here
      const analysis = {
        marketGrowth: {
          years: ["2024", "2025", "2026", "2027"],
          values: [10, 15, 25, 40]
        },
        competitorComparison: {
          competitors: competitors || ["Competitor A", "Competitor B", "Your Startup"],
          marketShare: [35, 40, 25]
        },
        fundingPrediction: {
          years: ["2024", "2025", "2026", "2027"],
          fundingAmount: [1, 5, 12, 20]
        },
        userGrowth: {
          years: ["2024", "2025", "2026", "2027"],
          userBase: [1000, 5000, 20000, 80000]
        },
        marketInsights: {
          summary: `Analysis for ${startupIdea} in ${industry} industry shows promising growth potential.`
        },
        competitorInsights: {
          summary: `Main competitors identified: ${competitors ? competitors.join(', ') : 'None specified'}`
        },
        fundingInsights: {
          summary: "Based on market trends, initial seed funding of $1-2M recommended."
        },
        userGrowthInsights: {
          summary: "Projected user growth shows strong adoption potential in first 24 months."
        }
      };

      response.json(analysis);
    } catch (error) {
      console.error('Error:', error);
      response.status(500).json({ error: error.message });
    }
  });
});
