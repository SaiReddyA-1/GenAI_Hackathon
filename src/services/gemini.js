import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

// Helper function to format startup data for prompt
export const formatStartupDataForPrompt = (formData) => {
  return `
    Startup Idea & Problem: ${formData.startupIdea || 'N/A'}
    Industry: ${formData.industry || 'N/A'}
    Operation Location: ${formData.operationLocation || 'N/A'}
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

    Startup Idea & Problem: ${formData.startupIdea}
    Industry: ${formData.industry}
    Operation Location: ${formData.operationLocation}

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
    3. Only provide the number without any symbols or text (e.g., "30" not "30%" or "~30%")
    4. If possible, consider competitors that operate in or serve ${formData.operationLocation}`;

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

export const generateSwotPrompt = (formData) => {
  return `Perform a comprehensive SWOT analysis for the following startup:

    Startup Idea & Problem: ${formData.startupIdea}
    Industry: ${formData.industry}
    Operation Location: ${formData.operationLocation}

    Please provide a clear and concise analysis in the following format:

    STRENGTHS
    - [1-2 sentence explanation of a key strength]
    - [1-2 sentence explanation of a key strength]
    - [1-2 sentence explanation of a key strength]
    - [1-2 sentence explanation of a key strength]
    - [1-2 sentence explanation of a key strength]

    WEAKNESSES
    - [1-2 sentence explanation of a key weakness]
    - [1-2 sentence explanation of a key weakness]
    - [1-2 sentence explanation of a key weakness]
    - [1-2 sentence explanation of a key weakness]
    - [1-2 sentence explanation of a key weakness]

    OPPORTUNITIES
    - [1-2 sentence explanation of a key opportunity]
    - [1-2 sentence explanation of a key opportunity]
    - [1-2 sentence explanation of a key opportunity]
    - [1-2 sentence explanation of a key opportunity]
    - [1-2 sentence explanation of a key opportunity]

    THREATS
    - [1-2 sentence explanation of a key threat]
    - [1-2 sentence explanation of a key threat]
    - [1-2 sentence explanation of a key threat]
    - [1-2 sentence explanation of a key threat]
    - [1-2 sentence explanation of a key threat]

    IMPORTANT: 
    1. Make all points specific to this particular startup idea, industry, and location
    2. Keep explanations concise but informative (1-2 sentences per point)
    3. Do not use Markdown formatting in your response
    4. Focus on practical, realistic factors rather than theoretical concerns`;
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

    // Get business strategy insights
    const businessStrategyPrompt = generateBusinessStrategyPrompt(formData);
    const businessStrategyResult = await model.generateContent(businessStrategyPrompt);
    const businessStrategyResponse = await businessStrategyResult.response;
    const businessStrategyText = businessStrategyResponse.text();
    const businessStrategyData = parseBusinessStrategyData(businessStrategyText);

    // Get demographic data (using simplified demographic prompt)
    const demographicPrompt = `Analyze the following startup idea and provide detailed demographic insights:
    
    Startup Idea & Problem: ${formData.startupIdea}
    Industry: ${formData.industry}
    Operation Location: ${formData.operationLocation}

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

    // Structure the final insights object
    const insights = {
      swot: swotData,
      demographics: {
        ageGroups,
        genderDistribution,
        geographicDistribution
      },
      marketAnalysis,
      competitorInsights: {
        summary: marketAnalysis?.competitive_landscape || 'Not available'
      },
      fundingInsights: {
        summary: marketAnalysis?.funding_requirements || 'Not available'
      },
      userGrowthInsights: {
        summary: marketAnalysis?.growth_potential || 'Not available'
      },
      businessStrategy: businessStrategyData
    };

    return insights;
  } catch (error) {
    console.error('Error generating insights:', error);
    return {
      swot: {
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: []
      },
      demographics: {},
      marketAnalysis: {},
      competitorInsights: {},
      fundingInsights: {},
      userGrowthInsights: {},
      businessStrategy: {}
    };
  }
};

export const generateBusinessStrategyPrompt = (formData) => {
  return `Analyze the following startup idea and provide detailed business strategy insights:

    Startup Idea & Problem: ${formData.startupIdea}
    Industry: ${formData.industry}
    Operation Location: ${formData.operationLocation}

    Please provide business strategy insights in this exact format using the following headings:

    TARGET_USERS
    [Detailed description of the ideal target users/customers for this startup]

    USER_ACQUISITION_STRATEGY
    [3-5 effective strategies to acquire users/customers for this specific startup]

    BUSINESS_MODELS
    [2-3 appropriate business models that would work well for this startup]

    REVENUE_PER_USER
    [Realistic estimate of average revenue per user in Indian Rupees (₹)]

    MINIMUM_INVESTMENT
    [Minimum investment required in Indian Rupees (₹)]
    
    BREAK_EVEN_TIME
    [Estimated time to break-even, always include the unit (months or years). For example: "18 months" or "2 years"]

    USER_GROWTH_RATE
    [Expected user growth rate percentage per year]

    MARKET_TRENDS
    [3-5 current market trends that support this startup idea]

    For numerical values, provide realistic estimates based on industry standards. For Indian currency values, present them without commas or symbols - just the number. I will format them appropriately.
    
    IMPORTANT: 
    1. Do not use any Markdown formatting (like **, *, or other special characters) in your response. Provide plain text only.
    2. For break-even time, ALWAYS specify the unit (months or years). Never omit the unit.
  `;
};

// Function to parse business strategy data
export const parseBusinessStrategyData = (text) => {
  try {
    console.log('Parsing business strategy text:', text);

    const businessStrategyData = {
      targetUsers: '',
      userAcquisitionStrategy: [],
      businessModels: [],
      revenuePerUser: '',
      minimumInvestment: '',
      breakEvenTime: '',
      userGrowthRate: '',
      marketTrends: []
    };

    // Helper function to remove markdown formatting
    const removeMarkdown = (text) => {
      if (!text) return '';
      // Remove bold/italic markers
      return text.replace(/\*\*/g, '').replace(/\*/g, '');
    };

    // Helper function to format number in Indian format
    const formatIndianCurrency = (num) => {
      if (!num) return '';
      // Convert to number if it's a string
      const number = typeof num === 'string' ? parseFloat(num.replace(/,/g, '')) : num;
      // Format as Indian currency notation (e.g., 10,00,000)
      const formatted = number.toLocaleString('en-IN');
      return `₹${formatted}`;
    };

    // Extract sections using regex patterns
    const targetUsersMatch = text.match(/TARGET_USERS\s+([\s\S]*?)(?=USER_ACQUISITION_STRATEGY|$)/);
    if (targetUsersMatch && targetUsersMatch[1]) {
      businessStrategyData.targetUsers = removeMarkdown(targetUsersMatch[1].trim());
    }

    const acquisitionMatch = text.match(/USER_ACQUISITION_STRATEGY\s+([\s\S]*?)(?=BUSINESS_MODELS|$)/);
    if (acquisitionMatch && acquisitionMatch[1]) {
      const strategies = acquisitionMatch[1].split(/\n+/).filter(line => line.trim().startsWith('-') || line.trim().match(/^\d+\./));
      businessStrategyData.userAcquisitionStrategy = strategies
        .map(s => removeMarkdown(s.replace(/^-|\d+\.\s*/, '').trim()))
        .filter(s => s);
    }

    const modelsMatch = text.match(/BUSINESS_MODELS\s+([\s\S]*?)(?=REVENUE_PER_USER|$)/);
    if (modelsMatch && modelsMatch[1]) {
      const models = modelsMatch[1].split(/\n+/).filter(line => line.trim().startsWith('-') || line.trim().match(/^\d+\./));
      businessStrategyData.businessModels = models
        .map(m => removeMarkdown(m.replace(/^-|\d+\.\s*/, '').trim()))
        .filter(m => m);
    }

    const revenueMatch = text.match(/REVENUE_PER_USER\s+([\s\S]*?)(?=MINIMUM_INVESTMENT|$)/);
    if (revenueMatch && revenueMatch[1]) {
      const revenueText = removeMarkdown(revenueMatch[1].trim());
      // Extract numbers from the revenue text
      const revenueNumber = revenueText.match(/₹?\s*(\d+(?:[,.]\d+)?)/);
      if (revenueNumber) {
        const value = revenueNumber[1].replace(/,/g, '');
        businessStrategyData.revenuePerUser = formatIndianCurrency(parseFloat(value));
      } else {
        businessStrategyData.revenuePerUser = revenueText;
      }
    }

    const investmentMatch = text.match(/MINIMUM_INVESTMENT\s+([\s\S]*?)(?=BREAK_EVEN_TIME|$)/);
    if (investmentMatch && investmentMatch[1]) {
      const investmentText = removeMarkdown(investmentMatch[1].trim());
      // Extract numbers from the investment text
      const investmentNumber = investmentText.match(/₹?\s*(\d+(?:[,.]\d+)?)/);
      if (investmentNumber) {
        const value = investmentNumber[1].replace(/,/g, '');
        businessStrategyData.minimumInvestment = formatIndianCurrency(parseFloat(value));
      } else {
        businessStrategyData.minimumInvestment = investmentText;
      }
    }

    const breakEvenMatch = text.match(/BREAK_EVEN_TIME\s+([\s\S]*?)(?=USER_GROWTH_RATE|$)/);
    if (breakEvenMatch && breakEvenMatch[1]) {
      const breakEvenText = removeMarkdown(breakEvenMatch[1].trim());
      
      // Try to extract months
      const monthsMatch = breakEvenText.match(/(\d+(?:[,.]\d+)?)\s*(?:months|month)/i);
      if (monthsMatch) {
        businessStrategyData.breakEvenTime = `${monthsMatch[1]} months`;
      } else {
        // Try to extract years
        const yearsMatch = breakEvenText.match(/(\d+(?:[,.]\d+)?)\s*(?:years|year)/i);
        if (yearsMatch) {
          businessStrategyData.breakEvenTime = `${yearsMatch[1]} years`;
        } else {
          // If no unit is found, check if it's just a number and assume months
          const numberMatch = breakEvenText.match(/(\d+(?:[,.]\d+)?)/);
          if (numberMatch) {
            businessStrategyData.breakEvenTime = `${numberMatch[1]} months`;
          } else {
            // If no pattern matches, use the original text
            businessStrategyData.breakEvenTime = breakEvenText;
          }
        }
      }
    }

    const growthMatch = text.match(/USER_GROWTH_RATE\s+([\s\S]*?)(?=MARKET_TRENDS|$)/);
    if (growthMatch && growthMatch[1]) {
      const growthText = removeMarkdown(growthMatch[1].trim());
      // Extract percentage
      const growthNumber = growthText.match(/(\d+(?:[,.]\d+)?)/);
      businessStrategyData.userGrowthRate = growthNumber ? `${growthNumber[1]}%` : growthText;
    }

    const trendsMatch = text.match(/MARKET_TRENDS\s+([\s\S]*)/);
    if (trendsMatch && trendsMatch[1]) {
      const trends = trendsMatch[1].split(/\n+/).filter(line => line.trim().startsWith('-') || line.trim().match(/^\d+\./));
      businessStrategyData.marketTrends = trends
        .map(t => removeMarkdown(t.replace(/^-|\d+\.\s*/, '').trim()))
        .filter(t => t);
    }

    console.log('Parsed business strategy data:', businessStrategyData);
    return businessStrategyData;
  } catch (error) {
    console.error('Error parsing business strategy data:', error);
    return {
      targetUsers: 'Not available',
      userAcquisitionStrategy: ['Not available'],
      businessModels: ['Not available'],
      revenuePerUser: 'Not available',
      minimumInvestment: 'Not available',
      breakEvenTime: 'Not available',
      userGrowthRate: 'Not available',
      marketTrends: ['Not available']
    };
  }
};

function parseSwotData(text) {
  try {
    console.log('Parsing SWOT text:', text); // Debug log

    const sections = {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: []
    };

    // Parse each section
    const strengthsMatch = text.match(/STRENGTHS\s+([\s\S]*?)(?=WEAKNESSES|$)/);
    const weaknessesMatch = text.match(/WEAKNESSES\s+([\s\S]*?)(?=OPPORTUNITIES|$)/);
    const opportunitiesMatch = text.match(/OPPORTUNITIES\s+([\s\S]*?)(?=THREATS|$)/);
    const threatsMatch = text.match(/THREATS\s+([\s\S]*?)(?=IMPORTANT|$)/);

    const removeMarkdown = (text) => {
      if (!text) return '';
      return text.replace(/\*\*/g, '').replace(/\*/g, '');
    };

    // Function to extract items from a section
    const extractItems = (sectionText) => {
      if (!sectionText) return [];
      
      const items = [];
      // Match lines that start with a dash followed by content
      const itemRegex = /-\s+(.+?)(?=\n-|\n\n|$)/gs;
      let match;
      
      while ((match = itemRegex.exec(sectionText)) !== null) {
        let item = match[1].trim();
        
        // If the item contains a colon (for the heading:detail format)
        if (item.includes(':')) {
          const [heading, ...detailParts] = item.split(':');
          const detail = detailParts.join(':').trim();
          
          // Format as "Heading: Detail explanation"
          item = `${heading.trim()}: ${detail}`;
        }
        
        items.push(removeMarkdown(item));
      }
      
      return items;
    };

    // Extract items from each section
    if (strengthsMatch && strengthsMatch[1]) {
      sections.strengths = extractItems(strengthsMatch[1]);
    }
    
    if (weaknessesMatch && weaknessesMatch[1]) {
      sections.weaknesses = extractItems(weaknessesMatch[1]);
    }
    
    if (opportunitiesMatch && opportunitiesMatch[1]) {
      sections.opportunities = extractItems(opportunitiesMatch[1]);
    }
    
    if (threatsMatch && threatsMatch[1]) {
      sections.threats = extractItems(threatsMatch[1]);
    }

    // Check if we got real data
    const hasRealData = Object.values(sections).some(arr => arr.length > 0);
    
    // If no real data was parsed, use example data
    if (!hasRealData) {
      console.log('No real SWOT data found, using example data with medium content length');
      return {
        strengths: [
          'Innovative proprietary technology that significantly reduces operational costs compared to existing solutions.',
          'Strong founding team with relevant industry experience and technical expertise.',
          'First-mover advantage in an emerging market segment with high growth potential.',
          'Scalable business model allowing rapid expansion with minimal additional resource requirements.',
          'Clear value proposition addressing a well-defined pain point in the target market.'
        ],
        weaknesses: [
          'Limited initial capital which may restrict marketing efforts and slow customer acquisition.',
          'Small current team size lacking expertise in some specialist areas needed for growth.',
          'Product requires significant customer education for adoption, potentially lengthening sales cycles.',
          'Reliance on third-party technologies for some core functionalities creates external dependencies.',
          'Untested market reception for specific product features that differentiate the offering.'
        ],
        opportunities: [
          'Recent regulatory changes opening new market segments that align perfectly with the product capabilities.',
          'Potential strategic partnerships with established companies to accelerate market penetration.',
          'Growing demand for cost-effective solutions in the target industry due to economic pressures.',
          'International expansion possibilities, particularly in markets with similar regulatory environments.',
          'Additional revenue streams through data analytics and complementary service offerings.'
        ],
        threats: [
          'Large established competitors with significant resources who may develop similar solutions.',
          'Changing regulatory landscape that could require costly compliance modifications.',
          'Economic uncertainty potentially affecting customer budgets and purchasing decisions.',
          'Rapid technology evolution potentially making current approaches obsolete.',
          'Difficulties attracting specialized talent in a competitive hiring market.'
        ]
      };
    }

    console.log('Parsed SWOT data:', sections);
    return sections;
  } catch (error) {
    console.error('Error parsing SWOT data:', error);
    // Fallback
    return {
      strengths: ['Not available'],
      weaknesses: ['Not available'],
      opportunities: ['Not available'],
      threats: ['Not available']
    };
  }
}

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
