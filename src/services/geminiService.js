import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

if (!API_KEY) {
  console.error('Gemini API key is not set. Please check your .env file.');
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Chat history context to help Gemini understand the domain
const SYSTEM_CONTEXT = `You are an AI assistant for our GenAI Hackathon project focused on startup analysis.

Our project specifically includes:

1. Analysis Dashboard Features:
   - Market Share Chart: Shows the distribution of market share among competitors
   - Market Growth Chart: Displays market growth trends over time
   - Competitor Chart: Visualizes competitor performance metrics

2. Startup Analysis Tools:
   - Startup Form: Where users input their startup details
   - AI-powered analysis of startup viability
   - Risk assessment based on market conditions

3. Current Implementation:
   - React-based frontend with Material-UI components
   - Recharts for data visualization
   - Firebase integration for authentication
   - Gemini AI for intelligent responses

Keep responses brief and focused on our actual implemented features. When users ask questions:
1. Direct them to specific features we have built
2. Reference the actual charts and components we have
3. Keep initial greetings short and friendly
4. Don't mention features we haven't implemented

Remember: Focus only on our actual implementation, not generic startup analysis features.`;

class GeminiService {
  constructor() {
    if (!API_KEY) {
      throw new Error('Gemini API key is not configured');
    }
    this.model = genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async sendMessage(message) {
    try {
      let prompt;
      if (message.toLowerCase() === 'hello' || message.toLowerCase() === 'hi') {
        prompt = 'Provide a brief, friendly greeting and mention that you can help with questions about our startup analysis dashboard, market share charts, and competitor analysis features.';
      } else {
        prompt = `${SYSTEM_CONTEXT}\n\nUser Question: ${message}\n\nProvide a specific response about our implemented features. Focus on the actual charts, forms, and analysis tools we have built.`;
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
