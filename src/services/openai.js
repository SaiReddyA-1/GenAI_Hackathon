import { functions, db } from '../config/firebase';
import { httpsCallable } from 'firebase/functions';
import { collection, onSnapshot } from 'firebase/firestore';

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
    ],
    questions: {
      market_validation: "Have you conducted any market research or validation? What were the results?",
      tech_stack: "What technology stack are you planning to use?",
      monetization: "What's your monetization strategy?",
      scaling: "How do you plan to scale the technology?",
      security: "How will you handle data security and privacy?"
    }
  },
  retail: {
    marketSize: "The retail market size varies by region and segment...",
    competitors: ["Amazon", "Walmart", "Local retailers", "Online marketplaces"],
    risks: [
      "High competition",
      "Inventory management",
      "Supply chain disruptions",
      "Changing consumer preferences"
    ],
    strengths: [
      "Direct customer interaction",
      "Brand building potential",
      "Multiple revenue streams",
      "Local market presence"
    ],
    recommendations: [
      "Focus on customer experience",
      "Implement omnichannel strategy",
      "Optimize inventory management",
      "Build customer loyalty program"
    ],
    questions: {
      location: "Where do you plan to establish your retail presence?",
      inventory: "How will you manage inventory and suppliers?",
      customer_service: "What's your customer service strategy?",
      competition: "How will you compete with existing retailers?",
      marketing: "What marketing channels will you use?"
    }
  },
  food: {
    marketSize: "The food service industry market size...",
    competitors: ["Local restaurants", "Food chains", "Delivery services"],
    risks: [
      "Food safety regulations",
      "High operational costs",
      "Staff turnover",
      "Supply chain management"
    ],
    strengths: [
      "Essential service",
      "Regular customer base",
      "Multiple revenue streams",
      "Brand potential"
    ],
    recommendations: [
      "Focus on food quality",
      "Optimize operations",
      "Build delivery partnerships",
      "Implement loyalty program"
    ],
    questions: {
      cuisine: "What type of cuisine or food products will you offer?",
      location: "Where will your food business be located?",
      delivery: "Will you offer delivery services? How?",
      sourcing: "How will you source your ingredients?",
      regulations: "How will you handle food safety regulations?"
    }
  },
  healthcare: {
    marketSize: "The healthcare market size continues to grow...",
    competitors: ["Hospitals", "Clinics", "Health tech companies"],
    risks: [
      "Regulatory compliance",
      "Medical liability",
      "Technology integration",
      "Data security"
    ],
    strengths: [
      "Essential service",
      "Growing demand",
      "High value service",
      "Impact potential"
    ],
    recommendations: [
      "Ensure regulatory compliance",
      "Invest in technology",
      "Build professional network",
      "Focus on patient experience"
    ],
    questions: {
      regulations: "How will you handle healthcare regulations and compliance?",
      technology: "What healthcare technology will you use?",
      patients: "Who is your target patient demographic?",
      insurance: "How will you handle insurance and payments?",
      expertise: "What medical expertise do you have access to?"
    }
  },
  other: {
    marketSize: "Market size varies by specific implementation...",
    competitors: ["Established businesses", "New entrants", "Alternative solutions"],
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
    ],
    questions: {
      target_market: "Who is your target market?",
      revenue_model: "How will you generate revenue?",
      competition: "Who are your main competitors?",
      resources: "What resources do you currently have?",
      challenges: "What are your biggest challenges?"
    }
  }
};

const detectIndustry = (idea) => {
  const keywords = {
    technology: ['app', 'software', 'tech', 'digital', 'online', 'platform', 'AI', 'blockchain'],
    retail: ['store', 'shop', 'retail', 'ecommerce', 'products', 'marketplace'],
    food: ['restaurant', 'food', 'delivery', 'catering', 'kitchen'],
    healthcare: ['health', 'medical', 'wellness', 'fitness', 'care']
  };

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
    console.log('Analyzing startup idea...');
    const industry = detectIndustry(idea);
    const template = templates[industry] || templates.other;

    // Extract key information from the idea
    const keywordMap = {
      technology: ['tech', 'software', 'platform', 'app', 'digital', 'online', 'AI', 'automation'],
      market_focus: ['B2B', 'B2C', 'enterprise', 'consumer', 'retail', 'service'],
      innovation: ['innovative', 'unique', 'novel', 'new', 'revolutionary', 'disruptive'],
      scalability: ['scale', 'growth', 'expand', 'global', 'market'],
      problem_solving: ['solve', 'improve', 'enhance', 'optimize', 'streamline']
    };

    const analysis = {
      startupIdea: idea,
      industry: industry,
      marketInsights: {
        marketSize: template.marketSize,
        targetSegments: [],
        growthPotential: 'high'
      },
      competitiveAnalysis: {
        competitors: template.competitors,
        uniqueAdvantages: [],
        marketPosition: 'emerging'
      },
      riskAssessment: {
        keyRisks: template.risks,
        mitigationStrategies: []
      },
      recommendations: template.recommendations,
      keywordAnalysis: {
        technology: [],
        market_focus: [],
        innovation: [],
        scalability: [],
        problem_solving: []
      }
    };

    // Analyze keywords in the idea
    for (const [category, keywords] of Object.entries(keywordMap)) {
      analysis.keywordAnalysis[category] = keywords.filter(keyword => 
        idea.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    return analysis;
  } catch (error) {
    console.error('Error analyzing startup idea:', error);
    throw error;
  }
};

// Essential questions for startup analysis
const essentialQuestions = [
  {
    id: 'startup_idea',
    question: "Describe your startup idea and the main problem it solves.",
    type: 'text'
  },
  {
    id: 'target_market',
    question: "Who is your target market (be specific about demographics, needs, and market size)?",
    type: 'text'
  },
  {
    id: 'unique_value',
    question: "What makes your solution unique compared to existing alternatives? List your key competitive advantages.",
    type: 'text'
  },
  {
    id: 'business_model',
    question: "How will you make money? Describe your revenue streams and pricing strategy.",
    type: 'text'
  },
  {
    id: 'go_to_market',
    question: "What's your go-to-market strategy and what resources (funding, team, technology) do you need to launch?",
    type: 'text'
  }
];

export const generateFollowUpQuestions = async (idea, industry, previousAnswers = {}) => {
  try {
    const currentQuestionCount = Object.keys(previousAnswers).length;
    
    // If we've already asked 5 questions, return empty array to trigger analysis
    if (currentQuestionCount >= 5) {
      return { questions: [] };
    }

    // Return the next essential question
    return {
      questions: [essentialQuestions[currentQuestionCount]]
    };

  } catch (error) {
    console.error('Error generating follow-up questions:', error);
    
    // Use essential questions as fallback
    const currentQuestionCount = Object.keys(previousAnswers).length;
    return {
      questions: [essentialQuestions[currentQuestionCount]]
    };
  }
};
