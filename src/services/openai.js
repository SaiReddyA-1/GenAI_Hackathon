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
    console.log('Analyzing startup idea locally...');
    
    const detectedIndustry = detectIndustry(idea);
    const template = templates[detectedIndustry];

    return {
      industry: detectedIndustry,
      targetMarket: "Analysis in progress...",
      ...template
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

export const generateFollowUpQuestions = async (idea, industry, previousAnswers = {}) => {
  try {
    const currentQuestionCount = Object.keys(previousAnswers).length;
    
    // If we've already asked 5 questions, return empty array to trigger analysis
    if (currentQuestionCount >= 5) {
      return { questions: [] };
    }

    // Get industry-specific questions
    const template = templates[industry] || templates.other;
    const availableQuestions = Object.entries(template.questions);

    // Filter out questions that have already been asked
    const remainingQuestions = availableQuestions.filter(([id]) => 
      !Object.keys(previousAnswers).includes(id)
    );

    // Select next question based on previous answers
    let nextQuestion;
    if (currentQuestionCount === 0) {
      // First question is always about the basic idea
      nextQuestion = {
        id: 'startup_idea',
        question: "What's your startup idea?",
        type: 'text'
      };
    } else if (remainingQuestions.length > 0) {
      nextQuestion = {
        id: remainingQuestions[0][0],
        question: remainingQuestions[0][1],
        type: 'text'
      };
    }

    return nextQuestion ? { questions: [nextQuestion] } : { questions: [] };
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
