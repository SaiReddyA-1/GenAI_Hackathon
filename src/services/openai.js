import { db } from '../config/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const generateQuestions = httpsCallable(functions, 'generateStartupQuestions');
const analyzeWithGemini = httpsCallable(functions, 'analyzeStartupIdea');

// Industry categories for initial categorization
const industryCategories = {
  AI_TECH: {
    keywords: ['ai', 'machine learning', 'artificial intelligence', 'deep learning', 'nlp', 'automation'],
    businessModels: ['SaaS', 'API Services', 'Enterprise Solutions', 'B2B', 'B2C'],
    revenueStreams: ['Subscription', 'Usage-based', 'Licensing', 'Professional Services']
  },
  E_COMMERCE: {
    keywords: ['online store', 'e-commerce', 'marketplace', 'retail', 'shopping'],
    businessModels: ['B2C Marketplace', 'B2B Platform', 'D2C Brand', 'Subscription Box'],
    revenueStreams: ['Commission', 'Subscription', 'Advertising', 'Premium Listings']
  },
  HEALTHCARE: {
    keywords: ['health', 'medical', 'wellness', 'fitness', 'telemedicine'],
    businessModels: ['Telemedicine', 'Health Tech', 'Medical Devices', 'Wellness Platform'],
    revenueStreams: ['Insurance', 'Subscription', 'Per-visit', 'Device Sales']
  },
  FINTECH: {
    keywords: ['finance', 'banking', 'payment', 'investment', 'insurance'],
    businessModels: ['P2P Platform', 'Digital Banking', 'Investment App', 'Insurance Tech'],
    revenueStreams: ['Transaction Fees', 'Interest', 'Premium Features', 'Commission']
  },
  EDTECH: {
    keywords: ['education', 'learning', 'teaching', 'training', 'courses'],
    businessModels: ['Online Learning', 'B2B Training', 'Tutoring Platform', 'Educational Content'],
    revenueStreams: ['Course Fees', 'Subscription', 'Enterprise Licenses', 'Certification']
  }
};

// Detect industry category
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

    return {
      category: detectedCategory,
      subcategories: Object.keys(industryCategories).filter(cat => cat !== detectedCategory),
      confidence: confidence,
      reasoning: `Detected ${maxMatches} keyword matches for ${detectedCategory}`
    };
  } catch (error) {
    console.error('Error detecting industry:', error);
    throw error;
  }
}

// Analyze startup idea using Gemini
export async function analyzeStartupIdea(idea, category = 'AI_TECH', answers = {}) {
  try {
    const result = await analyzeWithGemini({
      idea,
      category,
      answers
    });

    // If Gemini analysis fails, fall back to template-based analysis
    if (!result.data) {
      return generateTemplateAnalysis(idea, category, answers);
    }

    return result.data;
  } catch (error) {
    console.error('Error analyzing with Gemini:', error);
    // Fallback to template analysis on error
    return generateTemplateAnalysis(idea, category, answers);
  }
}

// Generate dynamic follow-up questions using Gemini
export async function generateFollowUpQuestions(idea, category, previousAnswers = {}) {
  try {
    const result = await generateQuestions({
      idea,
      industry: category,
      previousAnswers
    });

    const response = result.data;

    // Ensure we have valid questions
    if (!response || !response.questions || response.questions.length === 0) {
      return generateDefaultQuestions(category);
    }

    return {
      questions: response.questions,
      currentStage: determineCurrentStage(previousAnswers)
    };
  } catch (error) {
    console.error('Error generating questions:', error);
    return generateDefaultQuestions(category);
  }
}

// Fallback function for template-based analysis
function generateTemplateAnalysis(idea, category, answers) {
  const categoryInfo = industryCategories[category] || industryCategories.AI_TECH;
  
  return {
    category: category,
    businessModel: {
      recommendedModels: categoryInfo.businessModels.slice(0, 2),
      reasoning: [
        'Based on industry trends and market demand',
        'Aligned with target audience needs'
      ],
      risks: [
        'Market competition',
        'Technology adoption barriers',
        'Regulatory compliance'
      ],
      opportunities: [
        'Growing market demand',
        'Digital transformation trends',
        'Innovation potential'
      ]
    },
    revenueStrategy: {
      primaryRevenue: categoryInfo.revenueStreams[0],
      secondaryRevenue: categoryInfo.revenueStreams.slice(1),
      pricingStrategy: 'Tiered pricing with freemium model',
      monetizationTimeline: 'Short-term: Freemium, Medium-term: Premium features, Long-term: Enterprise solutions'
    },
    marketInsights: {
      targetSegments: answers.target_audience ? answers.target_audience.split(',').map(s => s.trim()) : [],
      problemStatement: answers.problem_validation || '',
      marketSize: answers.market_size || 'To be determined',
      competitors: answers.competition ? answers.competition.split(',').map(s => s.trim()) : []
    },
    executionPlan: {
      goToMarket: answers.go_to_market || 'To be determined',
      resourceNeeds: answers.resource_needs || 'To be determined'
    }
  };
}

// Generate default questions if Gemini fails
function generateDefaultQuestions(category) {
  const stage = 'IDEATION';
  const questions = [
    {
      id: 'problem_validation',
      question: 'What specific problem does your startup solve?',
      type: 'text',
      required: true
    },
    {
      id: 'target_audience',
      question: 'Who is your primary target audience?',
      type: 'text',
      required: true
    }
  ];

  return {
    questions: questions,
    currentStage: stage
  };
}

// Determine the current stage based on previous answers
function determineCurrentStage(answers) {
  if (!answers.problem_validation || !answers.target_audience) {
    return 'IDEATION';
  }
  if (!answers.market_size || !answers.competition) {
    return 'VALIDATION';
  }
  if (!answers.revenue_model || !answers.pricing_strategy) {
    return 'BUSINESS_MODEL';
  }
  return 'EXECUTION';
}
