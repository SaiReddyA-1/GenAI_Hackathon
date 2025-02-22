import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

// Helper function to format startup data for prompt
const formatStartupDataForPrompt = (formData) => {
  return `
    Startup Idea: ${formData.startupIdea}
    Industry: ${formData.industry}
    Problem & Solution: ${formData.problemSolution}
    Target Users: ${formData.targetUsers}
    Operation Location: ${formData.operationLocation}
    Competitors: ${formData.competitors}
    Initial Investment: $${formData.initialInvestment}
    Business Model: ${formData.businessModel}
    Revenue per User: $${formData.revenuePerUser}
    Break-even Time: ${formData.breakEvenTime}
    Market Size: ${formData.marketSize}
    User Growth Rate: ${formData.userGrowthRate}%
    Supporting Trends: ${formData.supportingTrends?.join(', ')}
  `;
};

const generatePrompt = (formData) => {
  const startupData = formatStartupDataForPrompt(formData);
  return `
    As a startup analyst, provide a detailed analysis for this startup idea. Consider the provided information carefully and generate realistic, data-driven insights.
    
    ${startupData}
    
    Generate a comprehensive analysis that includes:
    
    1. Market Growth:
    - Project realistic year-over-year growth rates based on the industry (${formData.industry}) and market size (${formData.marketSize})
    - Consider market trends: ${formData.supportingTrends?.join(', ')}
    - Account for the target market and location: ${formData.targetUsers} in ${formData.operationLocation}
    
    2. Competitor Analysis:
    - Analyze the competitive landscape: ${formData.competitors}
    - Estimate realistic market share distribution
    - Consider the startup's unique value proposition
    
    3. Funding Requirements:
    - Initial investment needed: $${formData.initialInvestment}
    - Project future funding needs based on the business model: ${formData.businessModel}
    - Consider break-even timeline: ${formData.breakEvenTime}
    
    4. User Growth:
    - Base growth on provided rate: ${formData.userGrowthRate}%
    - Consider acquisition strategy: ${formData.userAcquisition}
    - Factor in market size and penetration potential
    
    Format the response as a JSON object with this structure:
    {
      "marketGrowth": {
        "years": [next 4 years],
        "values": [realistic growth percentages]
      },
      "competitorComparison": {
        "competitors": [actual competitor names],
        "marketShare": [realistic market share percentages]
      },
      "fundingPrediction": {
        "years": [next 4 years],
        "fundingAmount": [realistic funding amounts in millions]
      },
      "userGrowth": {
        "years": [next 4 years],
        "userBase": [realistic user numbers]
      },
      "marketInsights": {
        "summary": "Detailed market analysis specific to ${formData.industry} and ${formData.startupIdea}"
      },
      "competitorInsights": {
        "summary": "Specific insights about competition with ${formData.competitors}"
      },
      "fundingInsights": {
        "summary": "Funding strategy based on ${formData.businessModel} and ${formData.initialInvestment}"
      },
      "userGrowthInsights": {
        "summary": "Growth strategy focusing on ${formData.targetUsers} through ${formData.userAcquisition}"
      }
    }

    Make the analysis realistic and specific to this startup idea. Avoid generic responses.
    Consider industry-specific challenges and opportunities.
    Base projections on real-world market conditions and industry benchmarks.
    Provide actionable insights and specific recommendations.
  `;
};

export const getCompetitorsWithGemini = async (formData) => {
  try {
    console.log('Fetching detailed competitor information with Gemini API...');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Identify the top three competitors for the startup idea: ${formData.startupIdea}. For each competitor, provide the following details in a simple format:

Competitor 1:
Name: [name]
Market Share: [percentage]
Target Audience: [audience]
Marketing Strategies: [strategies]

(Repeat for competitors 2 and 3)`;

    console.log('Generated detailed competitors prompt:', prompt);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.error('Request timed out');
      controller.abort();
    }, 15000);

    const result = await model.generateContent(prompt, { signal: controller.signal });
    clearTimeout(timeoutId);

    const response = await result.response;
    const text = response.text();

    console.log('Gemini API raw response for detailed competitors:', text);

    // Parse the response using a simpler format
    const competitors = [];
    const sections = text.split('Competitor');
    
    for (let i = 1; i <= 3; i++) {
      if (sections[i]) {
        const section = sections[i];
        const lines = section.split('\n').filter(line => line.trim());
        
        const name = lines.find(line => line.includes('Name:'))?.split('Name:')[1]?.trim() || '';
        const marketShare = lines.find(line => line.includes('Market Share:'))?.split('Market Share:')[1]?.trim() || '';
        const targetAudience = lines.find(line => line.includes('Target Audience:'))?.split('Target Audience:')[1]?.trim() || '';
        const marketingStrategies = lines.find(line => line.includes('Marketing Strategies:'))?.split('Marketing Strategies:')[1]?.trim() || '';

        if (name) {
          competitors.push({
            name: name.replace(/\*\*/g, ''),
            marketShare,
            targetAudience,
            marketingStrategies
          });
        }
      }
    }

    console.log('Parsed competitor details:', competitors);
    return competitors;
  } catch (error) {
    console.error('Gemini API Error:', error);
    return [];
  }
};

export const analyzeWithGemini = async (formData) => {
  try {
    console.log('Starting analysis with Gemini API...');
    const competitors = await getCompetitorsWithGemini(formData);
    formData.competitors = competitors.map(competitor => competitor.name).join(', ');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = generatePrompt(formData);
    console.log('Generated prompt:', prompt);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.error('Request timed out');
      controller.abort();
    }, 15000);

    const result = await model.generateContent(prompt, { signal: controller.signal });
    clearTimeout(timeoutId);

    const response = await result.response;
    const text = response.text();

    console.log('Gemini API raw response:', text);

    try {
      const analysis = JSON.parse(text);
      console.log('Parsed analysis:', analysis);
      return {
        marketGrowth: {
          years: analysis.marketGrowth?.years || generateYearArray(),
          values: analysis.marketGrowth?.values || generateDefaultGrowth(formData)
        },
        competitorComparison: {
          competitors: analysis.competitorComparison?.competitors || parseCompetitors(formData),
          marketShare: analysis.competitorComparison?.marketShare || generateMarketShare(formData)
        },
        fundingPrediction: {
          years: analysis.fundingPrediction?.years || generateYearArray(),
          fundingAmount: analysis.fundingPrediction?.fundingAmount || generateFundingAmounts(formData)
        },
        userGrowth: {
          years: analysis.userGrowth?.years || generateYearArray(),
          userBase: analysis.userGrowth?.userBase || generateUserGrowth(formData)
        },
        marketInsights: {
          summary: analysis.marketInsights?.summary || generateMarketSummary(formData)
        },
        competitorInsights: {
          summary: analysis.competitorInsights?.summary || generateCompetitorSummary(formData)
        },
        fundingInsights: {
          summary: analysis.fundingInsights?.summary || generateFundingSummary(formData)
        },
        userGrowthInsights: {
          summary: analysis.userGrowthInsights?.summary || generateGrowthSummary(formData)
        }
      };
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      return generateFallbackAnalysis(formData);
    }
  } catch (error) {
    console.error('Gemini API Error:', error);
    return generateFallbackAnalysis(formData);
  }
};

export const getStartupInsightsWithGemini = async (formData) => {
  try {
    console.log('Fetching startup insights with Gemini API...');
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Analyze this startup idea and provide insights in the following format:
    Startup Idea: ${formData.startupIdea}

    1. RISKS_AND_SOLUTIONS
    Potential Risks:
    - Risk 1
    - Risk 2
    - Risk 3

    Solutions:
    - Solution 1
    - Solution 2
    - Solution 3

    2. MARKET_ANALYSIS
    Current Growth Rate: [percentage]

    Key Market Trends:
    - Trend 1
    - Trend 2
    - Trend 3

    Projected Growth: [5-year projection]

    3. AUDIENCE_AND_MARKETING
    Target Audience: [specific description]

    Marketing Strategies:
    - Strategy 1
    - Strategy 2
    - Strategy 3

    Investor Appeal Points:
    - Point 1
    - Point 2
    - Point 3

    4. REVENUE_STREAMS
    Primary Revenue Sources:
    - Source 1
    - Source 2
    - Source 3

    Passive Income Opportunities:
    - Opportunity 1
    - Opportunity 2

    Capital Raising Strategies:
    - Strategy 1
    - Strategy 2
    - Strategy 3

    5. STARTUP_NAMES
    Suggested Modern Names:
    - Name 1
    - Name 2
    - Name 3
    - Name 4
    - Name 5

    Please follow this exact format and provide concise, relevant information for each section.`;

    console.log('Generated insights prompt:', prompt);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const result = await model.generateContent(prompt, { signal: controller.signal });
    clearTimeout(timeoutId);

    const response = await result.response;
    const text = response.text();

    console.log('Gemini API raw response for insights:', text);

    // Parse the sections
    const sections = text.split(/\d\.\s+/);
    const insights = {
      risks: parseSection(sections[1], 'RISKS_AND_SOLUTIONS'),
      marketAnalysis: parseSection(sections[2], 'MARKET_ANALYSIS'),
      audienceAndMarketing: parseSection(sections[3], 'AUDIENCE_AND_MARKETING'),
      revenueStreams: parseSection(sections[4], 'REVENUE_STREAMS'),
      startupNames: parseSection(sections[5], 'STARTUP_NAMES')
    };

    console.log('Parsed insights:', insights);
    return insights;
  } catch (error) {
    console.error('Gemini API Error:', error);
    return null;
  }
};

function parseSection(text, sectionType) {
  if (!text) return {};
  
  const lines = text.split('\n').filter(line => line.trim());
  const result = {};
  
  switch (sectionType) {
    case 'RISKS_AND_SOLUTIONS':
      result.potential_risks = lines
        .filter(line => line.startsWith('- '))
        .slice(0, 3)
        .map(line => line.replace('- ', ''));
      result.solutions = lines
        .filter(line => line.startsWith('- '))
        .slice(3)
        .map(line => line.replace('- ', ''));
      break;

    case 'MARKET_ANALYSIS':
      result.current_growth_rate = lines.find(line => line.includes('**Current Growth Rate**'))?.split(':')[1]?.trim() || '';
      result.key_market_trends = lines
        .filter(line => line.startsWith('- '))
        .map(line => line.replace('- ', ''));
      result.projected_growth = lines.find(line => line.includes('**Projected Growth**'))?.split(':')[1]?.trim() || '';
      break;

    case 'AUDIENCE_AND_MARKETING':
      result.target_audience = lines.find(line => line.includes('**Target Audience**'))?.split(':')[1]?.trim() || '';
      result.marketing_strategies = lines
        .filter(line => line.startsWith('- '))
        .map(line => line.replace('- ', ''));
      result.investor_appeal_points = lines
        .filter(line => line.startsWith('- '))
        .map(line => line.replace('- ', ''));
      break;

    case 'REVENUE_STREAMS':
      result.primary_revenue_sources = lines
        .filter(line => line.startsWith('- '))
        .map(line => line.replace('- ', ''));
      result.passive_income_opportunities = lines
        .filter(line => line.startsWith('- '))
        .map(line => line.replace('- ', ''));
      result.capital_raising_strategies = lines
        .filter(line => line.startsWith('- '))
        .map(line => line.replace('- ', ''));
      break;

    case 'STARTUP_NAMES':
      result.suggested_modern_names = lines
        .filter(line => line.startsWith('- '))
        .map(line => line.replace('- ', ''));
      break;
  }
  
  return result;
}

// Helper functions for generating realistic fallback data
const generateYearArray = () => {
  const currentYear = new Date().getFullYear();
  return [currentYear, currentYear + 1, currentYear + 2, currentYear + 3];
};

const generateDefaultGrowth = (formData) => {
  const baseGrowth = parseFloat(formData.userGrowthRate) || 30;
  return [baseGrowth, baseGrowth * 1.2, baseGrowth * 1.4, baseGrowth * 1.6];
};

const parseCompetitors = (formData) => {
  if (!formData.competitors) return ["Market Leader", "Competitor A", "Your Startup"];
  return [...formData.competitors.split(',').map(c => c.trim()), "Your Startup"];
};

const generateMarketShare = (formData) => {
  const competitors = parseCompetitors(formData);
  return competitors.map((_, index) => {
    if (index === competitors.length - 1) return 25; // Your startup
    if (index === 0) return 40; // Market leader
    return Math.floor(35 / (competitors.length - 2)); // Split remaining share
  });
};

const generateFundingAmounts = (formData) => {
  const baseAmount = parseFloat(formData.initialInvestment) / 1000000 || 2.5;
  return [baseAmount, baseAmount * 1.5, baseAmount * 2, baseAmount * 2.5];
};

const generateUserGrowth = (formData) => {
  const baseUsers = 1000;
  const growthRate = parseFloat(formData.userGrowthRate) / 100 || 0.45;
  return [0, 1, 2, 3].map(year => 
    Math.round(baseUsers * Math.pow(1 + growthRate, year))
  );
};

const generateMarketSummary = (formData) => {
  return `Analysis shows strong potential for ${formData.startupIdea} in the ${formData.industry} sector. 
  The ${formData.marketSize} market size and trends like ${formData.supportingTrends?.join(', ')} 
  provide favorable conditions for growth.`;
};

const generateCompetitorSummary = (formData) => {
  const competitors = formData.competitors?.split(',').map(c => c.trim()).join(', ') || 'existing players';
  return `While ${competitors} dominate the market, there's opportunity for differentiation through 
  innovative features and superior user experience. Focus on ${formData.problemSolution}`;
};

const generateFundingSummary = (formData) => {
  return `Initial investment of $${(parseFloat(formData.initialInvestment)/1000000).toFixed(1)}M aligns with 
  industry standards for ${formData.businessModel} model. ${formData.breakEvenTime} break-even timeline 
  suggests a balanced growth strategy.`;
};

const generateGrowthSummary = (formData) => {
  return `Targeting ${formData.targetUsers} through ${formData.userAcquisition}, we project 
  ${formData.userGrowthRate}% user growth rate in ${formData.operationLocation}. Focus on user 
  acquisition and retention to achieve market penetration.`;
};

const generateFallbackAnalysis = (formData) => {
  return {
    marketGrowth: {
      years: generateYearArray(),
      values: generateDefaultGrowth(formData)
    },
    competitorComparison: {
      competitors: parseCompetitors(formData),
      marketShare: generateMarketShare(formData)
    },
    fundingPrediction: {
      years: generateYearArray(),
      fundingAmount: generateFundingAmounts(formData)
    },
    userGrowth: {
      years: generateYearArray(),
      userBase: generateUserGrowth(formData)
    },
    marketInsights: {
      summary: generateMarketSummary(formData)
    },
    competitorInsights: {
      summary: generateCompetitorSummary(formData)
    },
    fundingInsights: {
      summary: generateFundingSummary(formData)
    },
    userGrowthInsights: {
      summary: generateGrowthSummary(formData)
    }
  };
};
