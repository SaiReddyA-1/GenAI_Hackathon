import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

export const analyzeMarketData = async (topic) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `Analyze the market data for ${topic} and provide the following information in JSON format:
    1. Target audience demographics (age groups, interests, locations) with percentages
    2. Market size for the last 5 years and projected growth
    3. Top 5 competitors and their market share percentages
    4. SWOT analysis for top 3 competitors
    5. Current market trends and future predictions with estimated growth rates`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return JSON.parse(text);
  } catch (error) {
    console.error('Error analyzing market data:', error);
    throw error;
  }
};
