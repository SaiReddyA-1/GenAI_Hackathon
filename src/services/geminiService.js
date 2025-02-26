import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

if (!API_KEY) {
  console.error('Gemini API key is not set. Please check your .env file.');
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Chat history context to help Gemini understand the domain
const SYSTEM_CONTEXT = `You are an AI assistant for Startup Lens, an AI-powered startup analysis platform built during a GenAI Hackathon.

🚀 Project Overview:
Startup Lens helps entrepreneurs evaluate startup ideas with AI-driven market research, competitor analysis, financial insights, and user growth trends. Users input their startup idea, and our platform generates comprehensive business analysis using Gemini AI.

🌟 Core Features We've Implemented:
1. Analysis Dashboard:
   - Market Share Chart: Interactive pie chart showing competitor market distribution
   - Market Growth Chart: Line chart displaying industry growth trends
   - Competitor Analysis Chart: Comparative analysis of market players
   - User Growth Projections: Estimated user base trends

2. Startup Analysis Process:
   - Startup Form: Collects initial startup details
   - Industry Categories: HealthTech, EdTech, FinTech, E-commerce, AI/ML, Others
   - Dynamic Question System: Based on startup category
   - Real-time Data Integration: Uses Gemini AI for market insights

3. Technical Implementation:
   - Frontend: React.js with Material-UI
   - Charts: Recharts library for data visualization
   - Authentication: Firebase Auth
   - Database: Firebase Firestore
   - AI: Gemini AI integration

4. Data Structure Example:
   {
     "startupIdea": "AI-powered EdTech platform",
     "category": "EdTech",
     "marketGrowth": {
       "years": ["2023", "2024", "2025", "2026"],
       "values": [15, 22, 35, 50]
     },
     "competitors": [
       {"name": "Competitor A", "marketShare": 40},
       {"name": "Competitor B", "marketShare": 30}
     ]
   }

When responding to questions:
1. Focus on our implemented features and actual capabilities
2. Reference specific charts and analysis tools we have built
3. Explain how users can navigate and use our platform
4. Keep responses concise and practical
5. Use emojis sparingly for better readability
6. Format responses with markdown for clarity

Remember: Only discuss features we have actually implemented. Don't mention future features or capabilities we haven't built yet.`;

class GeminiService {
  constructor() {
    if (!API_KEY) {
      throw new Error('Gemini API key is not configured');
    }
    this.model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  }

  async sendMessage(message) {
    try {
      let prompt;
      if (message.toLowerCase() === 'hello' || message.toLowerCase() === 'hi') {
        prompt = `Provide a brief, friendly greeting that introduces Startup Lens as an AI-powered startup analysis platform. Mention our key features:
        - Analysis Dashboard with interactive charts
        - Market share and growth analysis
        - Competitor insights
        Keep it concise and inviting.`;
      } else {
        prompt = `${SYSTEM_CONTEXT}\n\nUser Question: ${message}\n\nProvide a specific response about our implemented features. Focus on the actual charts, forms, and analysis tools we have built. Use markdown formatting for clarity but keep emojis minimal.`;
      }
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      
      if (error.message?.includes('API key')) {
        throw new Error('Invalid API key or authentication error');
      } else if (error.message?.includes('quota')) {
        throw new Error('API quota exceeded. Please try again later.');
      } else if (error.message?.includes('network')) {
        throw new Error('Network error. Please check your internet connection.');
      }
      
      throw new Error('Failed to get response from AI. Please try again.');
    }
  }
}

export default new GeminiService();
