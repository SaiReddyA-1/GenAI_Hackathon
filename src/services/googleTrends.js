import axios from 'axios';

export const getTrendData = async (keyword) => {
  try {
    // Note: You'll need to set up a proxy server to handle CORS and API key
    const response = await axios.get(`/api/trends`, {
      params: {
        keyword,
        timeRange: '12m' // Last 12 months
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching trend data:', error);
    throw error;
  }
};

export const getCompetitorData = async (industry) => {
  try {
    const response = await axios.get(`/api/competitors`, {
      params: {
        industry
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching competitor data:', error);
    throw error;
  }
};
