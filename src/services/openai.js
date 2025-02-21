import axios from 'axios';

const HF_API_URL = 'https://api-inference.huggingface.co/models/facebook/opt-1.3b';

const validateApiKey = () => {
  // No API key needed for demo endpoints
  return true;
};

const formatStartupAnalysis = (text) => {
  try {
    // Extract relevant information from the text and format it as JSON
    const analysis = {
      industry: text.match(/industry[:\s]+([^,\n.]+)/i)?.[1] || "General",
      targetMarket: text.match(/market[:\s]+([^,\n.]+)/i)?.[1] || "General consumers",
      competitors: [
        text.match(/competitor[s]?[:\s]+([^,\n.]+)/i)?.[1] || "Local businesses",
        "Other similar services"
      ],
      marketSize: text.match(/size[:\s]+([^,\n.]+)/i)?.[1] || "Variable depending on location",
      risks: [
        text.match(/risk[s]?[:\s]+([^,\n.]+)/i)?.[1] || "Market competition",
        "Economic conditions"
      ],
      strengths: [
        text.match(/strength[s]?[:\s]+([^,\n.]+)/i)?.[1] || "Innovative concept",
        "Market opportunity"
      ],
      recommendations: [
        text.match(/recommend[ation]*[s]?[:\s]+([^,\n.]+)/i)?.[1] || "Develop clear business plan",
        "Focus on customer needs"
      ]
    };
    return analysis;
  } catch (error) {
    console.error('Error formatting analysis:', error);
    return defaultAnalysis(text);
  }
};

const defaultAnalysis = (idea) => ({
  industry: "General",
  targetMarket: "General consumers",
  competitors: ["Local businesses", "Online services"],
  marketSize: "Variable depending on location and execution",
  risks: ["Market competition", "Economic conditions"],
  strengths: ["Innovative concept", "Market opportunity"],
  recommendations: ["Develop clear business plan", "Research target market"]
});

const formatQuestions = (text) => {
  try {
    return {
      questions: [
        {
          id: "1",
          question: text.match(/1[.:\s]+([^,\n.]+)/i)?.[1] || "What is your target customer demographic?",
          type: "text"
        },
        {
          id: "2",
          question: text.match(/2[.:\s]+([^,\n.]+)/i)?.[1] || "What is your initial marketing strategy?",
          type: "text"
        },
        {
          id: "3",
          question: text.match(/3[.:\s]+([^,\n.]+)/i)?.[1] || "What are your startup costs?",
          type: "text"
        }
      ]
    };
  } catch (error) {
    console.error('Error formatting questions:', error);
    return defaultQuestions();
  }
};

const defaultQuestions = () => ({
  questions: [
    {
      id: "1",
      question: "What is your target customer demographic?",
      type: "text"
    },
    {
      id: "2",
      question: "What is your initial marketing strategy?",
      type: "text"
    },
    {
      id: "3",
      question: "What are your startup costs?",
      type: "text"
    }
  ]
});

// Local startup analysis service without API dependencies
const analyzeStartupLocally = (idea) => {
  const ideaLower = idea.toLowerCase();
  
  // Industry detection
  const industries = {
    tech: ['software', 'app', 'digital', 'online', 'tech', 'platform', 'ai', 'web'],
    retail: ['shop', 'store', 'retail', 'commerce', 'market'],
    food: ['restaurant', 'food', 'cafe', 'catering', 'delivery'],
    health: ['health', 'fitness', 'wellness', 'medical', 'healthcare'],
    education: ['education', 'learning', 'teaching', 'school', 'training'],
    transport: ['transport', 'delivery', 'logistics', 'shipping'],
    entertainment: ['entertainment', 'game', 'media', 'content'],
    service: ['service', 'consulting', 'rental', 'maintenance']
  };

  let detectedIndustry = 'General';
  for (const [industry, keywords] of Object.entries(industries)) {
    if (keywords.some(keyword => ideaLower.includes(keyword))) {
      detectedIndustry = industry.charAt(0).toUpperCase() + industry.slice(1);
      break;
    }
  }

  // Generate analysis based on industry
  const analysis = {
    industry: detectedIndustry,
    targetMarket: getTargetMarket(detectedIndustry, ideaLower),
    competitors: getCompetitors(detectedIndustry),
    marketSize: getMarketSize(detectedIndustry),
    risks: getRisks(detectedIndustry),
    strengths: getStrengths(detectedIndustry, ideaLower),
    recommendations: getRecommendations(detectedIndustry)
  };

  return analysis;
};

const getTargetMarket = (industry, idea) => {
  const markets = {
    Tech: 'Tech-savvy users aged 18-45',
    Retail: 'Local consumers and online shoppers',
    Food: 'Local residents and food enthusiasts',
    Health: 'Health-conscious individuals and patients',
    Education: 'Students and lifelong learners',
    Transport: 'Businesses and individual consumers',
    Entertainment: 'Entertainment seekers aged 13-45',
    Service: 'Local businesses and consumers',
    General: 'General consumers and businesses'
  };
  return markets[industry] || markets.General;
};

const getCompetitors = (industry) => {
  const competitors = {
    Tech: ['Established tech companies', 'Similar software solutions'],
    Retail: ['Local retailers', 'Online marketplaces'],
    Food: ['Local restaurants', 'Food delivery services'],
    Health: ['Local health providers', 'Online health platforms'],
    Education: ['Traditional institutions', 'Online learning platforms'],
    Transport: ['Local transport services', 'Logistics companies'],
    Entertainment: ['Media companies', 'Content platforms'],
    Service: ['Local service providers', 'Online service platforms'],
    General: ['Local businesses', 'Online platforms']
  };
  return competitors[industry] || competitors.General;
};

const getMarketSize = (industry) => {
  const sizes = {
    Tech: 'Large and growing with digital transformation',
    Retail: 'Significant local and online market potential',
    Food: 'Stable local market with growth potential',
    Health: 'Growing market with aging population',
    Education: 'Expanding with online learning trends',
    Transport: 'Steady market with logistics growth',
    Entertainment: 'Growing digital entertainment market',
    Service: 'Varied based on service type',
    General: 'Depends on specific implementation'
  };
  return sizes[industry] || sizes.General;
};

const getRisks = (industry) => {
  const risks = {
    Tech: ['High competition', 'Rapid technology changes'],
    Retail: ['Market saturation', 'Online competition'],
    Food: ['High operational costs', 'Local competition'],
    Health: ['Regulatory requirements', 'High startup costs'],
    Education: ['Market acceptance', 'Content development costs'],
    Transport: ['Fuel costs', 'Regulatory compliance'],
    Entertainment: ['Changing consumer preferences', 'Content costs'],
    Service: ['Service quality maintenance', 'Staff management'],
    General: ['Market competition', 'Economic conditions']
  };
  return risks[industry] || risks.General;
};

const getStrengths = (industry, idea) => {
  const strengths = {
    Tech: ['Digital scalability', 'Low physical overhead'],
    Retail: ['Direct consumer access', 'Product control'],
    Food: ['Essential service', 'Regular customer base'],
    Health: ['Growing demand', 'Essential service'],
    Education: ['Long-term value', 'Recurring revenue'],
    Transport: ['Essential service', 'Network effects'],
    Entertainment: ['Engagement potential', 'Digital distribution'],
    Service: ['Direct value delivery', 'Customer relationships'],
    General: ['Market opportunity', 'Innovation potential']
  };
  return strengths[industry] || strengths.General;
};

const getRecommendations = (industry) => {
  const recommendations = {
    Tech: ['Focus on user experience', 'Ensure scalable infrastructure'],
    Retail: ['Build online presence', 'Optimize inventory management'],
    Food: ['Focus on quality', 'Optimize delivery system'],
    Health: ['Ensure compliance', 'Build trust and credibility'],
    Education: ['Create quality content', 'Focus on user engagement'],
    Transport: ['Optimize routes', 'Focus on reliability'],
    Entertainment: ['Create engaging content', 'Build community'],
    Service: ['Focus on service quality', 'Build customer loyalty'],
    General: ['Research target market', 'Develop clear business plan']
  };
  return recommendations[industry] || recommendations.General;
};

const generateQuestionsLocally = (idea, industry) => {
  const commonQuestions = [
    { id: "1", question: "What is your target customer demographic?", type: "text" },
    { id: "2", question: "What is your initial marketing strategy?", type: "text" },
    { id: "3", question: "What are your startup costs?", type: "text" }
  ];

  const industryQuestions = {
    Tech: [
      { id: "1", question: "What technology stack will you use?", type: "text" },
      { id: "2", question: "How will you handle user data security?", type: "text" },
      { id: "3", question: "What is your scaling strategy?", type: "text" }
    ],
    Retail: [
      { id: "1", question: "How will you manage inventory?", type: "text" },
      { id: "2", question: "What is your pricing strategy?", type: "text" },
      { id: "3", question: "How will you handle shipping?", type: "text" }
    ],
    // Add more industry-specific questions as needed
  };

  return {
    questions: industryQuestions[industry] || commonQuestions
  };
};

// Industry-specific response templates
const templates = {
  technology: {
    marketSize: "The global technology market size is estimated to be...",
    competitors: ["Google", "Microsoft", "Apple", "Amazon"],
    risks: [
      "Rapid technological changes",
      "High competition",
      "Cybersecurity threats",
      "Regulatory compliance"
    ],
    strengths: [
      "Scalability",
      "Digital transformation trend",
      "Remote work enablement",
      "Innovation potential"
    ],
    recommendations: [
      "Focus on unique value proposition",
      "Invest in cybersecurity",
      "Consider freemium model",
      "Build strong tech support"
    ]
  },
  // Add more industries as needed
};

// Default responses for unknown industries
const defaultResponse = {
  marketSize: "Market size analysis pending detailed research",
  competitors: ["Various established players", "Local competitors", "Online alternatives"],
  risks: [
    "Market uncertainty",
    "Resource constraints",
    "Competition",
    "Regulatory changes"
  ],
  strengths: [
    "Innovation potential",
    "Market opportunity",
    "Flexibility",
    "First-mover advantage"
  ],
  recommendations: [
    "Conduct market research",
    "Start small and iterate",
    "Focus on customer feedback",
    "Build strong team"
  ]
};

const detectIndustry = (idea) => {
  // Simple keyword-based industry detection
  const keywords = {
    technology: ['app', 'software', 'tech', 'digital', 'online', 'platform', 'AI', 'blockchain'],
    retail: ['store', 'shop', 'retail', 'ecommerce', 'products', 'marketplace'],
    food: ['restaurant', 'food', 'delivery', 'catering', 'kitchen'],
    healthcare: ['health', 'medical', 'wellness', 'fitness', 'care'],
    education: ['education', 'learning', 'teaching', 'school', 'training', 'course']
  };

  // Detect industry based on keywords
  for (const [industry, industryKeywords] of Object.entries(keywords)) {
    if (industryKeywords.some(keyword => 
      idea.toLowerCase().includes(keyword.toLowerCase())
    )) {
      return industry;
    }
  }
  return 'other';
};

export const analyzeStartupIdea = async (idea) => {
  try {
    console.log('Analyzing startup idea locally...');
    
    // Detect industry
    const detectedIndustry = detectIndustry(idea);
    
    // Get response template for the industry
    const response = templates[detectedIndustry] || defaultResponse;

    return {
      industry: detectedIndustry,
      targetMarket: "Analysis in progress...",
      ...response
    };
  } catch (error) {
    console.error('Error analyzing startup idea:', error);
    return {
      industry: 'unknown',
      targetMarket: 'Could not determine target market',
      marketSize: 'Unknown',
      competitors: ['Analysis failed'],
      risks: ['Could not analyze risks'],
      strengths: ['Analysis incomplete'],
      recommendations: ['Please try again']
    };
  }
};

const questions = {
  initial: {
    id: 'startup_idea',
    question: "What's your startup idea?",
    type: 'text'
  },
  market_validation: {
    id: 'market_validation',
    question: "Have you validated this idea with potential customers? If yes, what feedback did you receive?",
    type: 'text'
  },
  unique_value: {
    id: 'unique_value',
    question: "What makes your solution unique compared to existing alternatives?",
    type: 'text'
  },
  revenue_model: {
    id: 'revenue_model',
    question: "How do you plan to generate revenue?",
    type: 'text'
  },
  target_audience: {
    id: 'target_audience',
    question: "Who is your primary target audience?",
    type: 'text'
  },
  resources: {
    id: 'resources',
    question: "What resources (financial, technical, human) do you currently have?",
    type: 'text'
  },
  challenges: {
    id: 'challenges',
    question: "What are the biggest challenges you anticipate?",
    type: 'text'
  },
  timeline: {
    id: 'timeline',
    question: "What's your expected timeline to launch?",
    type: 'text'
  },
  scalability: {
    id: 'scalability',
    question: "How do you plan to scale the business?",
    type: 'text'
  },
  competition: {
    id: 'competition',
    question: "Who are your main competitors and how will you differentiate?",
    type: 'text'
  }
};

const getNextQuestion = (previousAnswers) => {
  // If no previous answers, start with initial question
  if (!previousAnswers || Object.keys(previousAnswers).length === 0) {
    return questions.initial;
  }

  const lastAnswer = Object.keys(previousAnswers).pop();
  const lastAnswerContent = previousAnswers[lastAnswer];

  // Determine next question based on previous answer
  switch (lastAnswer) {
    case 'startup_idea':
      // If idea mentions customers/users, ask about validation
      if (lastAnswerContent.toLowerCase().includes('customer') || 
          lastAnswerContent.toLowerCase().includes('user')) {
        return questions.market_validation;
      }
      // If idea mentions unique/different/better, ask about unique value
      else if (lastAnswerContent.toLowerCase().includes('unique') || 
               lastAnswerContent.toLowerCase().includes('different') ||
               lastAnswerContent.toLowerCase().includes('better')) {
        return questions.unique_value;
      }
      // Default to target audience question
      return questions.target_audience;

    case 'target_audience':
      return questions.revenue_model;

    case 'revenue_model':
      return questions.resources;

    case 'resources':
      return questions.challenges;

    case 'challenges':
      return questions.timeline;

    case 'timeline':
      return questions.scalability;

    case 'scalability':
      return questions.competition;

    default:
      // If we can't determine the next question, ask about unique value
      return questions.unique_value;
  }
};

export const generateFollowUpQuestions = async (idea, industry, previousAnswers = {}) => {
  try {
    const nextQuestion = getNextQuestion(previousAnswers);
    return {
      questions: [nextQuestion]
    };
  } catch (error) {
    console.error('Error generating follow-up questions:', error);
    return {
      questions: [
        {
          id: 'error',
          question: "An error occurred. Please try again.",
          type: 'text'
        }
      ]
    };
  }
};
