const googleTrends = require('google-trends-api');

// Get interest over time for a keyword
const getInterestOverTime = async (keyword) => {
  try {
    const result = await googleTrends.interestOverTime({
      keyword: keyword,
      startTime: new Date(Date.now() - (365 * 24 * 60 * 60 * 1000)), // Last 365 days
    });
    return JSON.parse(result);
  } catch (error) {
    console.error('Error fetching Google Trends data:', error);
    throw error;
  }
};

// Get related queries for a keyword
const getRelatedQueries = async (keyword) => {
  try {
    const result = await googleTrends.relatedQueries({
      keyword: keyword,
    });
    return JSON.parse(result);
  } catch (error) {
    console.error('Error fetching related queries:', error);
    throw error;
  }
};

// Get related topics for a keyword
const getRelatedTopics = async (keyword) => {
  try {
    const result = await googleTrends.relatedTopics({
      keyword: keyword,
    });
    return JSON.parse(result);
  } catch (error) {
    console.error('Error fetching related topics:', error);
    throw error;
  }
};

module.exports = {
  getInterestOverTime,
  getRelatedQueries,
  getRelatedTopics,
};
