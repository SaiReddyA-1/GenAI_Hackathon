import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

// Helper function to format startup data for prompt
const formatStartupDataForPrompt = (formData) => {
  return `
    Startup Idea: ${formData.startupIdea}
    Industry: ${formData.industry}
    Problem & Solution: ${formData.problemSolution}
  `;
};

const generatePrompt = (formData) => {
  const startupData = formatStartupDataForPrompt(formData);
  return `
    As a startup analyst, provide a detailed analysis for this startup idea. Consider the provided information carefully and generate realistic, data-driven insights.
    
    ${startupData}
    
    Generate a comprehensive analysis that includes:
    
    1. Market Growth:
    - Project realistic year-over-year growth rates based on the industry (${formData.industry})
    - Consider potential market trends related to this industry
    - Analyze the target market for this solution
    
    2. Competitor Analysis:
    - Analyze the competitive landscape for this type of startup
    - Estimate realistic market share distribution
    - Consider the startup's unique value proposition
    
    3. Funding Requirements:
    - Estimate initial investment needed based on industry standards
    - Project future funding needs based on typical business models for this industry
    - Consider break-even timeline for this type of startup
    
    4. User Growth:
    - Estimate reasonable growth rate based on industry benchmarks
    - Consider typical user acquisition strategies for this type of business
    - Factor in market size and penetration potential
    
    Format the response as a JSON object with this structure:
    {
      "marketGrowth": {
        "years": [next 4 years],
        "values": [realistic growth percentages]
      },
      "competitorComparison": {
        "competitors": [realistic competitor names],
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
        "summary": "Specific insights about competition in this industry"
      },
      "fundingInsights": {
        "summary": "Funding strategy based on industry standards"
      },
      "userGrowthInsights": {
        "summary": "Growth strategy focusing on potential users"
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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const prompt = `Identify the top three competitors for the following startup idea:

Startup Idea: ${formData.startupIdea}
Industry: ${formData.industry}

For each competitor, provide the following details in a simple format:

Competitor 1:
Name: [name of a real company in this space]
Market Share: [realistic percentage between 5-40%]
Target Audience: [audience]
Marketing Strategies: [strategies]

Competitor 2:
Name: [name of a real company in this space]
Market Share: [realistic percentage between 5-30%]
Target Audience: [audience]
Marketing Strategies: [strategies]

Competitor 3:
Name: [name of a real company in this space]
Market Share: [realistic percentage between 5-20%]
Target Audience: [audience]
Marketing Strategies: [strategies]

Important: 
1. For Market Share, provide realistic estimates based on actual market research when possible
2. The three competitors should NOT add up to 100% as there are many smaller players in the market
3. Only provide the number without any symbols or text (e.g., "30" not "30%" or "~30%")`;

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

        // Clean market share value - remove any non-numeric characters except dots
        const cleanedMarketShare = marketShare.replace(/[^0-9.]/g, '');
        const marketShareValue = parseFloat(cleanedMarketShare) || 0;

        if (name) {
          competitors.push({
            name: name.replace(/\*\*/g, '').trim(),
            marketShare: marketShareValue,
            targetAudience: targetAudience.replace(/\*\*/g, '').trim(),
            marketingStrategies: marketingStrategies.replace(/\*\*/g, '').trim()
          });
        }
      }
    }

    // Normalize market share values to ensure total is 100%
    const totalMarketShare = competitors.reduce((acc, competitor) => acc + competitor.marketShare, 0);
    
    // If total exceeds 100 or is very close to it, normalize to 100
    // Otherwise, leave room for "Others" category
    if (totalMarketShare > 90) {
      competitors.forEach(competitor => {
        competitor.marketShare = (competitor.marketShare / totalMarketShare) * 100;
      });
    }
    
    // Ensure we have reasonable values
    competitors.forEach(competitor => {
      // Cap extremely high values
      if (competitor.marketShare > 60) {
        competitor.marketShare = Math.min(60, competitor.marketShare);
      }
      
      // Round to one decimal place for cleaner display
      competitor.marketShare = parseFloat(competitor.marketShare.toFixed(1));
    });

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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
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

const generateSwotPrompt = (formData) => `
Analyze the following startup idea and generate a detailed SWOT analysis. Focus on specific, actionable insights based on current market trends and industry data.

Startup Idea: ${formData.startupIdea}
Industry: ${formData.industry}
Problem & Solution: ${formData.problemSolution}

Format your response EXACTLY as follows, with each point being specific and actionable:

STRENGTHS
- [List a specific strength related to the startup's unique value proposition]
- [List a specific strength related to technology or innovation]
- [List a specific strength related to market positioning]
- [List a specific strength related to team or resources]
- [List a specific strength related to competitive advantage]

WEAKNESSES
- [List a specific internal challenge or limitation]
- [List a specific resource constraint]
- [List a specific market-related weakness]
- [List a specific operational weakness]
- [List a specific competitive weakness]

OPPORTUNITIES
- [List a specific market opportunity]
- [List a specific technology opportunity]
- [List a specific growth opportunity]
- [List a specific partnership opportunity]
- [List a specific timing or trend-based opportunity]

THREATS
- [List a specific competitive threat]
- [List a specific market risk]
- [List a specific regulatory or compliance risk]
- [List a specific technology risk]
- [List a specific economic or market condition threat]

Important Guidelines:
1. Each point must be specific to this startup and industry
2. Do not use generic statements
3. Focus on actionable insights
4. Base analysis on current market trends
5. Consider both immediate and long-term factors
6. Remove all placeholder brackets [] from your response
7. Each point should be a complete, clear statement

Example format for a point:
STRENGTHS
- Proprietary AI algorithm reduces processing time by 60% compared to competitors
(NOT: "Good technology" or "[Strong technology]")`;

const parseSwotData = (text) => {
  try {
    console.log('Parsing SWOT text:', text); // Debug log

    const sections = {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: []
    };

    let currentSection = null;

    // Split by lines and process each line
    const lines = text.split('\n');
    console.log('Split lines:', lines); // Debug log

    lines.forEach(line => {
      line = line.trim();
      if (!line) return;

      // Check for section headers
      if (line === 'STRENGTHS') {
        currentSection = 'strengths';
        console.log('Found strengths section');
      } else if (line === 'WEAKNESSES') {
        currentSection = 'weaknesses';
        console.log('Found weaknesses section');
      } else if (line === 'OPPORTUNITIES') {
        currentSection = 'opportunities';
        console.log('Found opportunities section');
      } else if (line === 'THREATS') {
        currentSection = 'threats';
        console.log('Found threats section');
      } else if (line.startsWith('-') && currentSection) {
        const item = line.substring(1).trim();
        if (item && item !== '[Strength 1]' && !item.includes('[') && !item.includes(']')) {
          sections[currentSection].push(item);
          console.log(`Added to ${currentSection}:`, item);
        }
      }
    });

    // If no real data was parsed, use test data
    const hasRealData = Object.values(sections).some(arr => arr.length > 0);
    if (!hasRealData) {
      console.log('No real SWOT data found, using test data');
      return {
        strengths: [
          'Strong market presence',
          'Innovative technology',
          'Experienced team',
          'Scalable solution',
          'Clear value proposition'
        ],
        weaknesses: [
          'Limited resources',
          'New market entrant',
          'High initial costs',
          'Complex implementation',
          'Dependency on third-party services'
        ],
        opportunities: [
          'Growing market demand',
          'Technology advancement',
          'Partnership possibilities',
          'International expansion',
          'New market segments'
        ],
        threats: [
          'Intense competition',
          'Regulatory changes',
          'Market volatility',
          'Technology disruption',
          'Economic uncertainty'
        ]
      };
    }

    console.log('Final parsed SWOT data:', sections);
    return sections;
  } catch (error) {
    console.error('Error parsing SWOT data:', error);
    // Return default structure with empty arrays
    return {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: []
    };
  }
};

export const getStartupInsightsWithGemini = async (formData) => {
  try {
    console.log('Fetching startup insights with Gemini API...');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Get SWOT Analysis
    const swotPrompt = generateSwotPrompt(formData);
    const swotResult = await model.generateContent(swotPrompt);
    const swotResponse = await swotResult.response;
    const swotText = swotResponse.text();
    const swotData = parseSwotData(swotText);

    // Get demographic data (using simplified demographic prompt)
    const demographicPrompt = `Analyze the following startup idea and provide detailed demographic insights:
    
    Startup Idea: ${formData.startupIdea}
    Industry: ${formData.industry}
    Problem & Solution: ${formData.problemSolution}

    Please provide demographic insights in this exact format (use numbers only, no symbols):

    AGE_GROUPS
    18-24: [number]
    25-34: [number]
    35-44: [number]
    45-54: [number]
    55+: [number]

    GENDER_DISTRIBUTION
    Male: [number]
    Female: [number]
    Other: [number]

    GEOGRAPHIC_DISTRIBUTION
    Region 1: [region name] ([number])
    Region 2: [region name] ([number])
    Region 3: [region name] ([number])
    Region 4: [region name] ([number])
    Region 5: [region name] ([number])

    MARKET_ANALYSIS
    Current Market Size: [size in billions USD]
    Growth Rate: [number]
    Key Trends: [comma separated list]

    Important: 
    1. All percentages should add up to 100 within each category
    2. Use only numbers, no % symbols or text in the numbers
    3. For regions, specify the region name followed by the percentage in parentheses
    4. Base your analysis on current market research and industry trends`;

    const result = await model.generateContent(demographicPrompt);
    const response = await result.response;
    const text = response.text();

    // Parse demographic data (using existing parsing logic)
    const parsePercentage = (str) => {
      const num = str.replace(/[^0-9.]/g, '');
      return parseFloat(num) || 0;
    };

    // Parse age groups
    const ageGroupsSection = text.split('AGE_GROUPS')[1]?.split('GENDER_DISTRIBUTION')[0];
    const ageGroups = {
      '18-24': 0,
      '25-34': 0,
      '35-44': 0,
      '45-54': 0,
      '55+': 0
    };
    if (ageGroupsSection) {
      const lines = ageGroupsSection.split('\n').filter(line => line.trim());
      lines.forEach(line => {
        const [range, value] = line.split(':').map(s => s.trim());
        if (range && value && ageGroups.hasOwnProperty(range)) {
          ageGroups[range] = parsePercentage(value);
        }
      });
    }

    // Parse gender distribution
    const genderSection = text.split('GENDER_DISTRIBUTION')[1]?.split('GEOGRAPHIC_DISTRIBUTION')[0];
    const genderDistribution = {
      'Male': 0,
      'Female': 0,
      'Other': 0
    };
    if (genderSection) {
      const lines = genderSection.split('\n').filter(line => line.trim());
      lines.forEach(line => {
        const [gender, value] = line.split(':').map(s => s.trim());
        if (gender && value && genderDistribution.hasOwnProperty(gender)) {
          genderDistribution[gender] = parsePercentage(value);
        }
      });
    }

    // Parse geographic distribution
    const geoSection = text.split('GEOGRAPHIC_DISTRIBUTION')[1]?.split('MARKET_ANALYSIS')[0];
    const geographicDistribution = [];
    if (geoSection) {
      const lines = geoSection.split('\n').filter(line => line.trim());
      lines.forEach(line => {
        if (line.includes('Region')) {
          const [_, regionInfo] = line.split(':').map(s => s.trim());
          if (regionInfo) {
            const match = regionInfo.match(/(.*?)\s*\((\d+(?:\.\d+)?)\)/);
            if (match) {
              geographicDistribution.push({
                name: match[1].trim(),
                percentage: parseFloat(match[2]) || 0
              });
            }
          }
        }
      });
    }

    // Parse market analysis
    const marketSection = text.split('MARKET_ANALYSIS')[1];
    const marketAnalysis = {
      current_market_size: '',
      current_growth_rate: 0,
      key_trends: []
    };
    if (marketSection) {
      const lines = marketSection.split('\n').filter(line => line.trim());
      lines.forEach(line => {
        if (line.includes('Current Market Size:')) {
          marketAnalysis.current_market_size = line.split(':')[1]?.trim() || '';
        } else if (line.includes('Growth Rate:')) {
          marketAnalysis.current_growth_rate = parsePercentage(line.split(':')[1]);
        } else if (line.includes('Key Trends:')) {
          marketAnalysis.key_trends = line.split(':')[1]?.split(',').map(t => t.trim()) || [];
        }
      });
    }

    return {
      demographics: {
        ageGroups,
        genderDistribution,
        geographicDistribution
      },
      marketAnalysis,
      swot: swotData
    };

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
