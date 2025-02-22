import { db } from '../config/firebase';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import axios from 'axios';

const functions = getFunctions();
const analyzeWithGPT = httpsCallable(functions, 'analyzeStartupIdea');

// Industry categories and their characteristics
const industryCategories = {
  AI_TECH: {
    keywords: ['ai', 'machine learning', 'artificial intelligence', 'deep learning', 'nlp', 'automation'],
    businessModels: ['SaaS', 'API Services', 'Enterprise Solutions', 'B2B', 'B2C'],
    revenueStreams: ['Subscription', 'Usage-based', 'Licensing', 'Professional Services'],
    avgMarketGrowth: 35.6,
    avgFundingRound: 2500000
  },
  E_COMMERCE: {
    keywords: ['online store', 'e-commerce', 'marketplace', 'retail', 'shopping'],
    businessModels: ['B2C Marketplace', 'B2B Platform', 'D2C Brand', 'Subscription Box'],
    revenueStreams: ['Commission', 'Subscription', 'Advertising', 'Premium Listings'],
    avgMarketGrowth: 14.7,
    avgFundingRound: 1500000
  },
  HEALTHCARE: {
    keywords: ['health', 'medical', 'wellness', 'fitness', 'telemedicine'],
    businessModels: ['Telemedicine', 'Health Tech', 'Medical Devices', 'Wellness Platform'],
    revenueStreams: ['Insurance', 'Subscription', 'Per-visit', 'Device Sales'],
    avgMarketGrowth: 15.8,
    avgFundingRound: 3000000
  },
  FINTECH: {
    keywords: ['finance', 'banking', 'payment', 'investment', 'insurance'],
    businessModels: ['P2P Platform', 'Digital Banking', 'Investment App', 'Insurance Tech'],
    revenueStreams: ['Transaction Fees', 'Interest', 'Premium Features', 'Commission'],
    avgMarketGrowth: 23.4,
    avgFundingRound: 4000000
  },
  EDTECH: {
    keywords: ['education', 'learning', 'teaching', 'training', 'courses'],
    businessModels: ['Online Learning', 'B2B Training', 'Tutoring Platform', 'Educational Content'],
    revenueStreams: ['Course Fees', 'Subscription', 'Enterprise Licenses', 'Certification'],
    avgMarketGrowth: 16.3,
    avgFundingRound: 1000000
  }
};

// Enhanced error handling for API calls
const handleAPIError = (error) => {
  console.error('API Error:', error);
  
  if (error.response) {
    const { status, data } = error.response;
    switch (status) {
      case 401:
        throw new Error('API key is invalid or expired');
      case 429:
        throw new Error('Rate limit exceeded. Please try again later');
      case 500:
        throw new Error('OpenAI service is currently unavailable');
      default:
        throw new Error(data.error || 'An unexpected error occurred');
    }
  }
  
  if (error.request) {
    throw new Error('Network error. Please check your connection');
  }
  
  throw error;
};

// Step 1: Detect industry and enrich basic data
export async function detectIndustry(idea) {
  try {
    const ideaLower = idea.toLowerCase();
    let maxMatches = 0;
    let detectedCategory = 'AI_TECH';
    let confidence = 0;

    for (const [category, info] of Object.entries(industryCategories)) {
      const matches = info.keywords.filter(keyword => 
        ideaLower.includes(keyword.toLowerCase())
      ).length;

      if (matches > maxMatches) {
        maxMatches = matches;
        detectedCategory = category;
        confidence = Math.min(matches / info.keywords.length, 1);
      }
    }

    // Enrich with industry data
    const industryData = industryCategories[detectedCategory];

    return {
      category: detectedCategory,
      confidence,
      industryData: {
        avgMarketGrowth: industryData.avgMarketGrowth,
        avgFundingRound: industryData.avgFundingRound,
        suggestedBusinessModels: industryData.businessModels,
        potentialRevenueStreams: industryData.revenueStreams
      },
      reasoning: `Detected ${maxMatches} keyword matches for ${detectedCategory}`
    };
  } catch (error) {
    console.error('Error detecting industry:', error);
    throw error;
  }
}

// Step 2: Enrich missing data using AI and APIs
async function enrichMissingData(formData, industryData) {
  const enrichedData = { ...formData };

  // Enrich market size if unknown
  if (!enrichedData.marketSize || enrichedData.marketSize === "Don't Know") {
    enrichedData.marketSize = await estimateMarketSize(formData.industry);
  }

  // Enrich growth rate if unknown
  if (!enrichedData.userGrowthRate || enrichedData.userGrowthRate === "Don't Know") {
    enrichedData.userGrowthRate = industryData.avgMarketGrowth;
  }

  // Enrich competitor data if minimal
  if (!enrichedData.competitors || enrichedData.competitors.length === 0) {
    enrichedData.competitors = await findCompetitors(formData.startupIdea, formData.industry);
  }

  return enrichedData;
}

// Enhanced market trend analysis
async function analyzeTrends(industry) {
  try {
    const trends = await axios.get(`/api/trends/${industry}`);
    return trends.data;
  } catch (error) {
    console.warn('Failed to fetch market trends, using estimated data');
    return {
      marketGrowth: industryCategories[industry]?.avgMarketGrowth || 10,
      marketSize: await estimateMarketSize(industry),
      trendData: generateMarketTrendData({ industry })
    };
  }
}

// Enhanced competitor analysis
async function benchmarkCompetitors(competitors) {
  try {
    const results = await Promise.allSettled(
      competitors.map(async (competitor) => {
        const data = await axios.get(`/api/company/${competitor}`);
        return data;
      })
    );
    
    return results
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value.data);
  } catch (error) {
    console.warn('Failed to fetch competitor data, using basic analysis');
    return competitors.map(competitor => ({
      name: competitor,
      estimated: true,
      marketShare: Math.random() * 20,
      strength: Math.random() * 5
    }));
  }
}

// Calculate break-even point
function calculateBreakEven(data) {
  const monthlyRevenue = parseFloat(data.revenuePerUser) * estimateUserGrowth(data, 1);
  const monthlyExpenses = parseFloat(data.initialInvestment) / 12;
  const monthlyGrowthRate = 1.1; // Assume 10% monthly growth

  let month = 1;
  let totalRevenue = 0;
  let totalExpenses = data.initialInvestment;

  while (totalRevenue < totalExpenses && month <= 60) {
    totalRevenue += monthlyRevenue * Math.pow(monthlyGrowthRate, month);
    totalExpenses += monthlyExpenses;
    month++;
  }

  return {
    months: month,
    initialInvestment: data.initialInvestment,
    monthlyRevenue: monthlyRevenue,
    monthlyExpenses: monthlyExpenses
  };
}

// Recommend business model
function recommendBusinessModel(data, industryData) {
  const { industry, targetUsers, marketSize } = data;
  const models = industryData.businessModels;

  // Simple logic to recommend business model based on target users and market size
  if (targetUsers === 'Enterprises' && marketSize === 'Large') {
    return models.find(m => m.includes('Enterprise')) || models[0];
  }
  if (targetUsers === 'Consumers' && marketSize === 'Global') {
    return models.find(m => m.includes('B2C')) || models[0];
  }
  if (targetUsers === 'Businesses') {
    return models.find(m => m.includes('B2B')) || models[0];
  }

  return models[0];
}

// Generate market trend chart data
function generateMarketTrendData(data) {
  const months = 24; // 2 years projection
  const baseMarketSize = 1000000; // $1M base market size
  const growthRate = parseFloat(data.userGrowthRate) / 100 / 12; // Monthly growth rate

  return Array.from({ length: months }, (_, i) => ({
    month: i + 1,
    marketSize: Math.round(baseMarketSize * Math.pow(1 + growthRate, i)),
    userBase: Math.round(100 * Math.pow(1 + growthRate, i)),
    revenue: Math.round(parseFloat(data.revenuePerUser) * 100 * Math.pow(1 + growthRate, i))
  }));
}

// Generate competitor comparison data
function generateCompetitorComparisonData(data) {
  const metrics = ['Market Share', 'Technology', 'User Base', 'Pricing'];
  const competitors = data.competitors.split(',').map(c => c.trim());

  return {
    metrics,
    competitors: competitors.map(name => ({
      name,
      scores: metrics.map(() => Math.floor(Math.random() * 40) + 60) // Random scores between 60-100
    }))
  };
}

// Generate projection charts
function generateProjectionCharts(data) {
  const months = 36; // 3 years projection
  const monthlyData = Array.from({ length: months }, (_, i) => {
    const month = i + 1;
    const revenue = calculateMonthlyRevenue(data, month);
    const expenses = calculateMonthlyExpenses(data, month);
    const profit = revenue - expenses;
    const users = estimateUserGrowth(data, month);

    return {
      month,
      revenue,
      expenses,
      profit,
      users
    };
  });

  return {
    financial: monthlyData.map(d => ({
      month: d.month,
      revenue: d.revenue,
      expenses: d.expenses,
      profit: d.profit
    })),
    users: monthlyData.map(d => ({
      month: d.month,
      users: d.users
    })),
    metrics: {
      totalRevenue: monthlyData.reduce((sum, d) => sum + d.revenue, 0),
      totalProfit: monthlyData.reduce((sum, d) => sum + d.profit, 0),
      peakUsers: Math.max(...monthlyData.map(d => d.users)),
      averageGrowth: (monthlyData[months - 1].users / monthlyData[0].users - 1) * 100
    }
  };
}

// Step 3: Process and analyze the enriched data
async function processAndAnalyzeData(enrichedData, industryData, gptAnalysis) {
  try {
    // Generate comprehensive analysis
    return {
      overview: {
        industry: enrichedData.industry,
        marketSize: enrichedData.marketSize,
        growthRate: enrichedData.userGrowthRate,
        competitorCount: enrichedData.competitors.length
      },
      marketAnalysis: {
        trendAnalysis: await analyzeTrends(enrichedData.industry),
        competitorBenchmark: await benchmarkCompetitors(enrichedData.competitors),
        marketOpportunities: gptAnalysis.opportunities,
        marketThreats: gptAnalysis.threats
      },
      financialProjections: {
        estimatedFunding: calculateFundingNeeds(enrichedData, industryData),
        revenueProjections: generateRevenueProjections(enrichedData),
        breakEvenAnalysis: calculateBreakEven(enrichedData)
      },
      aiRecommendations: {
        businessModel: recommendBusinessModel(enrichedData, industryData),
        growthStrategy: gptAnalysis.growthStrategy,
        riskMitigation: gptAnalysis.risks
      },
      visualData: {
        marketTrendChart: generateMarketTrendData(enrichedData),
        competitorComparisonData: generateCompetitorComparisonData(enrichedData),
        projectionCharts: generateProjectionCharts(enrichedData)
      }
    };
  } catch (error) {
    console.error('Error in data processing:', error);
    return generateFallbackAnalysis(enrichedData, industryData);
  }
}

// Helper functions for data analysis
async function estimateMarketSize(industry) {
  // Implement market size estimation logic
  const industryData = industryCategories[industry];
  return {
    value: industryData.avgMarketSize || 1000000000,
    unit: 'USD',
    growthRate: industryData.avgMarketGrowth,
    source: 'Industry Average'
  };
}

async function findCompetitors(idea, industry) {
  // Implement competitor search logic
  return [
    {
      name: 'Example Competitor 1',
      fundingRound: '$5M',
      marketShare: '15%',
      strengths: ['Strong brand', 'Technology'],
      weaknesses: ['Limited market reach']
    },
    {
      name: 'Example Competitor 2',
      fundingRound: '$2M',
      marketShare: '10%',
      strengths: ['Innovation', 'Customer base'],
      weaknesses: ['High costs']
    }
  ];
}

function calculateFundingNeeds(data, industryData) {
  return {
    initialFunding: data.initialInvestment || industryData.avgFundingRound,
    projectedRounds: [
      { round: 'Seed', amount: industryData.avgFundingRound * 0.5 },
      { round: 'Series A', amount: industryData.avgFundingRound * 2 },
      { round: 'Series B', amount: industryData.avgFundingRound * 4 }
    ]
  };
}

function generateRevenueProjections(data) {
  const monthlyProjections = Array.from({ length: 36 }, (_, i) => ({
    month: i + 1,
    revenue: calculateMonthlyRevenue(data, i + 1),
    expenses: calculateMonthlyExpenses(data, i + 1),
    profit: calculateMonthlyProfit(data, i + 1)
  }));

  return {
    monthly: monthlyProjections,
    yearly: aggregateYearlyProjections(monthlyProjections)
  };
}

// Enhanced analysis function with retries and fallback
export async function analyzeStartupIdea(formData) {
  let retries = 3;
  let lastError = null;

  while (retries > 0) {
    try {
      // Step 1: Detect industry and enrich data
      const industryData = await detectIndustry(formData.startupIdea);
      
      // Step 2: Enrich missing data
      const enrichedData = await enrichMissingData(formData, industryData);
      
      // Step 3: Get AI analysis
      const gptAnalysis = await analyzeWithGPT({
        idea: enrichedData,
        industry: industryData
      });
      
      // Step 4: Process and combine all data
      const analysis = await processAndAnalyzeData(enrichedData, industryData, gptAnalysis.data);
      
      // Step 5: Store analysis in Firestore
      await addDoc(collection(db, 'analyses'), {
        ...analysis,
        timestamp: new Date(),
        userId: formData.userId
      });

      return analysis;

    } catch (error) {
      lastError = error;
      retries--;
      
      if (retries === 0) {
        console.warn('All retries failed, using fallback analysis');
        return generateFallbackAnalysis(formData, await detectIndustry(formData.startupIdea));
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// Generate fallback analysis if AI analysis fails
function generateFallbackAnalysis(data, industryData) {
  const marketSize = data.marketSize || 'Large';
  const growthRate = parseFloat(data.userGrowthRate) || industryData.avgMarketGrowth;
  const competitors = data.competitors ? data.competitors.split(',').map(c => c.trim()) : [];
  
  return {
    overview: {
      industry: data.industry,
      marketSize: marketSize,
      growthRate: growthRate,
      competitorCount: competitors.length
    },
    marketAnalysis: {
      trendAnalysis: {
        trend: industryData.trend || 'Growing',
        keyDrivers: industryData.keyDrivers || ['Market demand', 'Technology adoption'],
        riskFactors: industryData.riskFactors || ['Market competition', 'Regulatory changes']
      },
      competitorBenchmark: competitors.map(comp => ({
        name: comp,
        metrics: {
          marketShare: '10%',
          userBase: '100,000+',
          funding: '$1M-5M',
          growth: '20%'
        }
      })),
      marketOpportunities: [
        'Growing market demand',
        'Technology advancement',
        'Changing consumer behavior'
      ],
      marketThreats: [
        'Intense competition',
        'Regulatory challenges',
        'Market uncertainty'
      ]
    },
    financialProjections: {
      estimatedFunding: {
        initialFunding: parseFloat(data.initialInvestment) || industryData.avgFundingRound,
        projectedRunway: '18 months',
        fundingMilestones: ['MVP Development', 'Market Entry', 'Scale Operations']
      },
      revenueProjections: generateRevenueProjections(data),
      breakEvenAnalysis: calculateBreakEven(data)
    },
    aiRecommendations: {
      businessModel: recommendBusinessModel(data, industryData),
      growthStrategy: [
        'Focus on product development',
        'Build strong market presence',
        'Develop strategic partnerships'
      ],
      riskMitigation: [
        'Diversify revenue streams',
        'Build strong team',
        'Monitor market trends'
      ]
    },
    visualData: {
      marketTrendChart: generateMarketTrendData(data),
      competitorComparisonData: generateCompetitorComparisonData(data),
      projectionCharts: generateProjectionCharts(data)
    }
  };
}

// Utility functions for calculations
function calculateMonthlyRevenue(data, month) {
  const baseRevenue = data.revenuePerUser * estimateUserGrowth(data, month);
  return Math.round(baseRevenue * (1 + (month * 0.1)));
}

function calculateMonthlyExpenses(data, month) {
  const baseExpenses = data.initialInvestment / 12;
  return Math.round(baseExpenses * (1 + (month * 0.05)));
}

function calculateMonthlyProfit(data, month) {
  return calculateMonthlyRevenue(data, month) - calculateMonthlyExpenses(data, month);
}

function estimateUserGrowth(data, month) {
  const monthlyGrowthRate = (1 + (data.userGrowthRate / 100)) ** (1/12);
  return Math.round(100 * (monthlyGrowthRate ** month));
}

function aggregateYearlyProjections(monthlyData) {
  return Array.from({ length: 3 }, (_, i) => ({
    year: i + 1,
    revenue: monthlyData.slice(i * 12, (i + 1) * 12).reduce((sum, m) => sum + m.revenue, 0),
    expenses: monthlyData.slice(i * 12, (i + 1) * 12).reduce((sum, m) => sum + m.expenses, 0),
    profit: monthlyData.slice(i * 12, (i + 1) * 12).reduce((sum, m) => sum + m.profit, 0)
  }));
}
