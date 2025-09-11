const MoodEntry = require('../models/MoodEntry');
const Goal = require('../models/Goal');
const User = require('../models/User');
const { OpenAI } = require('openai');

// Initialize OpenAI client
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-openai-api-key-here') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Get comprehensive AI analysis for user
const getAIAnalysis = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;

    // Get recent mood entries
    const recentEntries = await MoodEntry.find({
      user: userId,
      createdAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
    }).sort({ createdAt: -1 }).limit(50);

    // Get user's goals for progress analysis
    const goals = await Goal.find({
      user: userId,
      isArchived: false
    });

    const user = await User.findById(userId);

    if (recentEntries.length === 0) {
      return res.status(200).json({
        status: 'success',
        data: {
          insights: [],
          trends: {
            period: `Last ${days} days`,
            averageMood: 0,
            moodVariability: 0,
            improvement: 0,
            patterns: []
          },
          progress: {
            goalsCompleted: 0,
            streaksActive: 0,
            improvementAreas: ['Start logging your mood regularly', 'Set your first goal'],
            strengths: [],
            recommendations: ['Begin your mental health journey by logging your first mood entry']
          },
          riskLevel: 'low',
          nextActions: [
            'Log your first mood entry',
            'Set a wellness goal',
            'Explore mental health resources'
          ]
        }
      });
    }

    // Generate comprehensive analysis
    const insights = await generateMoodInsights(recentEntries, user);
    const trends = await generateTrendAnalysis(recentEntries, days);
    const progress = await generateProgressAnalysis(goals, user);
    const riskLevel = await assessRiskLevel(recentEntries, user);
    const nextActions = generateNextActions(insights, trends, progress, riskLevel);

    res.status(200).json({
      status: 'success',
      data: {
        insights,
        trends,
        progress,
        riskLevel,
        nextActions
      }
    });
  } catch (error) {
    console.error('Error in AI analysis:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate AI analysis'
    });
  }
};

// Get mood-specific insights
const getMoodInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    const recentEntries = await MoodEntry.find({
      user: userId,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }).sort({ createdAt: -1 }).limit(20);

    const user = await User.findById(userId);
    const insights = await generateMoodInsights(recentEntries, user);

    res.status(200).json({
      status: 'success',
      data: insights.slice(0, limit)
    });
  } catch (error) {
    console.error('Error fetching mood insights:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch mood insights'
    });
  }
};

// Get trend analysis
const getTrendAnalysis = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '30d' } = req.query;

    const days = parseInt(period.replace('d', ''));
    const entries = await MoodEntry.find({
      user: userId,
      createdAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
    }).sort({ createdAt: -1 });

    const trends = await generateTrendAnalysis(entries, days);

    res.status(200).json({
      status: 'success',
      data: trends
    });
  } catch (error) {
    console.error('Error fetching trend analysis:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch trend analysis'
    });
  }
};

// Get progress analysis
const getProgressAnalysis = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const goals = await Goal.find({ user: userId, isArchived: false });

    const progress = await generateProgressAnalysis(goals, user);

    res.status(200).json({
      status: 'success',
      data: progress
    });
  } catch (error) {
    console.error('Error fetching progress analysis:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch progress analysis'
    });
  }
};

// Analyze mood entry for instant insights
const analyzeMoodEntry = async (req, res) => {
  try {
    const { mood, note, triggers = [], activities = [] } = req.body;
    const userId = req.user.id;

    // Get user context for better analysis
    const user = await User.findById(userId);
    const recentEntries = await MoodEntry.find({
      user: userId,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).sort({ createdAt: -1 }).limit(10);

    // Analyze the mood entry
    const analysis = await analyzeIndividualMoodEntry({
      mood,
      note,
      triggers,
      activities
    }, recentEntries, user);

    res.status(200).json({
      status: 'success',
      data: analysis
    });
  } catch (error) {
    console.error('Error analyzing mood entry:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to analyze mood entry'
    });
  }
};

// Get personalized recommendations
const getPersonalizedRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    const recentEntries = await MoodEntry.find({
      user: userId,
      createdAt: { $gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) }
    }).sort({ createdAt: -1 });

    const goals = await Goal.find({ user: userId, isArchived: false });

    const recommendations = await generatePersonalizedRecommendations(recentEntries, goals, user);

    res.status(200).json({
      status: 'success',
      data: recommendations
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch personalized recommendations'
    });
  }
};

// Helper Functions

const generateMoodInsights = async (entries, user) => {
  const insights = [];

  if (entries.length === 0) return insights;

  // Pattern detection
  const patterns = detectMoodPatterns(entries);
  patterns.forEach(pattern => {
    insights.push({
      id: `pattern_${Date.now()}_${Math.random()}`,
      type: 'pattern',
      title: pattern.title,
      description: pattern.description,
      confidence: pattern.confidence,
      createdAt: new Date().toISOString()
    });
  });

  // Trend analysis
  const trends = analyzeTrends(entries);
  if (trends.length > 0) {
    insights.push({
      id: `trend_${Date.now()}_${Math.random()}`,
      type: 'trend',
      title: trends[0].title,
      description: trends[0].description,
      confidence: trends[0].confidence,
      createdAt: new Date().toISOString()
    });
  }

  // Generate AI-powered insights if OpenAI is available
  if (openai && entries.length >= 5) {
    try {
      const aiInsights = await generateAIInsights(entries, user);
      insights.push(...aiInsights);
    } catch (error) {
      console.error('Error generating AI insights:', error);
    }
  }

  // Recommendations
  const recommendations = generateBasicRecommendations(entries, user);
  recommendations.forEach(rec => {
    insights.push({
      id: `rec_${Date.now()}_${Math.random()}`,
      type: 'recommendation',
      title: rec.title,
      description: rec.description,
      confidence: rec.confidence,
      createdAt: new Date().toISOString()
    });
  });

  return insights.slice(0, 10); // Return top 10 insights
};

const generateTrendAnalysis = async (entries, days) => {
  if (entries.length === 0) {
    return {
      period: `Last ${days} days`,
      averageMood: 0,
      moodVariability: 0,
      improvement: 0,
      patterns: []
    };
  }

  const moodScores = entries.map(entry => entry.moodScore || 5);
  const averageMood = moodScores.reduce((a, b) => a + b, 0) / moodScores.length;

  // Calculate variability (standard deviation)
  const variance = moodScores.reduce((acc, score) => acc + Math.pow(score - averageMood, 2), 0) / moodScores.length;
  const moodVariability = Math.sqrt(variance);

  // Calculate improvement (compare first half vs second half)
  const midpoint = Math.floor(entries.length / 2);
  const firstHalf = entries.slice(midpoint);
  const secondHalf = entries.slice(0, midpoint);

  const firstHalfAvg = firstHalf.reduce((sum, entry) => sum + (entry.moodScore || 5), 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, entry) => sum + (entry.moodScore || 5), 0) / secondHalf.length;
  const improvement = (secondHalfAvg - firstHalfAvg) / firstHalfAvg;

  // Detect patterns
  const patterns = detectTimePatterns(entries);

  return {
    period: `Last ${days} days`,
    averageMood: Number(averageMood.toFixed(1)),
    moodVariability: Number(moodVariability.toFixed(1)),
    improvement: Number(improvement.toFixed(2)),
    patterns
  };
};

const generateProgressAnalysis = async (goals, user) => {
  const completedGoals = goals.filter(goal => 
    goal.status === 'completed' || 
    (goal.progress && goal.progress.percentage >= 100)
  ).length;

  const activeStreaks = user.streaks ? 
    Object.values(user.streaks).filter(streak => streak > 0).length : 0;

  // Analyze strengths and improvement areas
  const strengths = [];
  const improvementAreas = [];

  if (user.streaks?.currentMoodLogging > 7) {
    strengths.push('Consistent mood tracking');
  } else {
    improvementAreas.push('Mood tracking consistency');
  }

  if (completedGoals > 3) {
    strengths.push('Goal achievement');
  } else {
    improvementAreas.push('Goal completion');
  }

  if (user.points > 1000) {
    strengths.push('Platform engagement');
  }

  // Generate recommendations based on analysis
  const recommendations = [];
  
  if (improvementAreas.includes('Mood tracking consistency')) {
    recommendations.push('Set daily reminders to log your mood');
  }
  
  if (improvementAreas.includes('Goal completion')) {
    recommendations.push('Break larger goals into smaller, manageable tasks');
  }

  if (activeStreaks < 2) {
    recommendations.push('Focus on building one consistent habit at a time');
  }

  return {
    goalsCompleted: completedGoals,
    streaksActive: activeStreaks,
    improvementAreas: improvementAreas.length > 0 ? improvementAreas : ['Continue current positive habits'],
    strengths: strengths.length > 0 ? strengths : ['Building healthy habits'],
    recommendations: recommendations.length > 0 ? recommendations : ['Keep up your current progress!']
  };
};

const assessRiskLevel = async (entries, user) => {
  if (entries.length === 0) return 'low';

  const recentEntries = entries.slice(0, 7); // Last week
  const lowMoodCount = recentEntries.filter(entry => (entry.moodScore || 5) <= 3).length;
  const highStressCount = recentEntries.filter(entry => entry.stressLevel >= 8).length;
  
  // Check for crisis indicators
  const crisisIndicators = recentEntries.filter(entry => 
    entry.triggers && entry.triggers.some(trigger => 
      ['self_harm', 'suicidal_thoughts'].includes(trigger)
    )
  ).length;

  if (crisisIndicators > 0) return 'high';
  if (lowMoodCount > recentEntries.length * 0.5 || highStressCount > recentEntries.length * 0.4) return 'medium';
  return 'low';
};

const generateNextActions = (insights, trends, progress, riskLevel) => {
  const actions = [];

  if (riskLevel === 'high') {
    actions.push('Consider reaching out to a mental health professional');
    actions.push('Contact your emergency support network');
    actions.push('Use crisis management resources');
  } else if (riskLevel === 'medium') {
    actions.push('Schedule time for stress-reduction activities');
    actions.push('Review your coping strategies');
    actions.push('Consider talking to a counselor');
  } else {
    if (trends.improvement < 0) {
      actions.push('Focus on activities that have improved your mood before');
    }
    
    if (progress.streaksActive < 2) {
      actions.push('Build consistency in one wellness habit');
    }
    
    actions.push('Continue logging your mood regularly');
  }

  return actions.slice(0, 3);
};

// Pattern detection functions
const detectMoodPatterns = (entries) => {
  const patterns = [];

  // Weekly pattern detection
  const dayOfWeekMoods = {};
  entries.forEach(entry => {
    const dayOfWeek = new Date(entry.createdAt).getDay();
    if (!dayOfWeekMoods[dayOfWeek]) dayOfWeekMoods[dayOfWeek] = [];
    dayOfWeekMoods[dayOfWeek].push(entry.moodScore || 5);
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let bestDay = 0;
  let worstDay = 0;
  let bestAvg = 0;
  let worstAvg = 10;

  Object.keys(dayOfWeekMoods).forEach(day => {
    const avg = dayOfWeekMoods[day].reduce((a, b) => a + b, 0) / dayOfWeekMoods[day].length;
    if (avg > bestAvg) {
      bestAvg = avg;
      bestDay = parseInt(day);
    }
    if (avg < worstAvg) {
      worstAvg = avg;
      worstDay = parseInt(day);
    }
  });

  if (Object.keys(dayOfWeekMoods).length >= 4 && Math.abs(bestAvg - worstAvg) > 1) {
    patterns.push({
      title: 'Weekly Mood Pattern',
      description: `You tend to feel better on ${dayNames[bestDay]}s and lower on ${dayNames[worstDay]}s. Consider planning positive activities for ${dayNames[worstDay]}s.`,
      confidence: 0.75
    });
  }

  return patterns;
};

const analyzeTrends = (entries) => {
  const trends = [];
  
  if (entries.length < 7) return trends;

  const recent = entries.slice(0, 7);
  const previous = entries.slice(7, 14);

  if (previous.length === 0) return trends;

  const recentAvg = recent.reduce((sum, entry) => sum + (entry.moodScore || 5), 0) / recent.length;
  const previousAvg = previous.reduce((sum, entry) => sum + (entry.moodScore || 5), 0) / previous.length;

  const change = recentAvg - previousAvg;

  if (Math.abs(change) > 0.5) {
    trends.push({
      title: change > 0 ? 'Improving Trend' : 'Declining Trend',
      description: `Your mood has ${change > 0 ? 'improved' : 'declined'} by ${Math.abs(change).toFixed(1)} points over the past week.`,
      confidence: 0.8
    });
  }

  return trends;
};

const detectTimePatterns = (entries) => {
  const patterns = [];

  // Time of day analysis
  const hourMoods = {};
  entries.forEach(entry => {
    const hour = new Date(entry.createdAt).getHours();
    if (!hourMoods[hour]) hourMoods[hour] = [];
    hourMoods[hour].push(entry.moodScore || 5);
  });

  // Simple pattern detection
  if (Object.keys(hourMoods).length >= 3) {
    patterns.push('Mood varies by time of day');
  }

  // Location pattern
  const locationMoods = {};
  entries.forEach(entry => {
    if (entry.location && entry.location !== 'other') {
      if (!locationMoods[entry.location]) locationMoods[entry.location] = [];
      locationMoods[entry.location].push(entry.moodScore || 5);
    }
  });

  if (Object.keys(locationMoods).length >= 2) {
    const bestLocation = Object.keys(locationMoods).reduce((best, location) => {
      const avgMood = locationMoods[location].reduce((a, b) => a + b, 0) / locationMoods[location].length;
      const bestAvg = locationMoods[best] ? locationMoods[best].reduce((a, b) => a + b, 0) / locationMoods[best].length : 0;
      return avgMood > bestAvg ? location : best;
    });
    patterns.push(`Better mood when at: ${bestLocation.replace('_', ' ')}`);
  }

  return patterns;
};

const generateBasicRecommendations = (entries, user) => {
  const recommendations = [];
  
  if (entries.length === 0) return recommendations;

  const avgMood = entries.reduce((sum, entry) => sum + (entry.moodScore || 5), 0) / entries.length;
  const avgStress = entries.reduce((sum, entry) => sum + (entry.stressLevel || 5), 0) / entries.length;

  if (avgMood < 4) {
    recommendations.push({
      title: 'Focus on Self-Care',
      description: 'Your recent mood scores suggest focusing on self-care activities and considering professional support.',
      confidence: 0.8
    });
  } else if (avgMood > 7) {
    recommendations.push({
      title: 'Maintain Positive Habits',
      description: 'Keep up the great work! Continue the activities and routines that are working well for you.',
      confidence: 0.9
    });
  }

  if (avgStress > 7) {
    recommendations.push({
      title: 'Stress Management',
      description: 'Try incorporating stress-reduction techniques like deep breathing, meditation, or regular exercise.',
      confidence: 0.85
    });
  }

  return recommendations;
};

const analyzeIndividualMoodEntry = async (moodData, recentEntries, user) => {
  const insights = [];
  const riskFactors = [];

  // Analyze mood entry content
  if (moodData.note) {
    const noteText = moodData.note.toLowerCase();
    
    // Simple keyword analysis
    const stressKeywords = ['stressed', 'overwhelmed', 'pressure', 'anxious', 'worried'];
    const positiveKeywords = ['happy', 'good', 'great', 'excited', 'grateful'];
    const riskKeywords = ['hopeless', 'worthless', 'hurt', 'harm', 'end'];

    const hasStressKeywords = stressKeywords.some(keyword => noteText.includes(keyword));
    const hasPositiveKeywords = positiveKeywords.some(keyword => noteText.includes(keyword));
    const hasRiskKeywords = riskKeywords.some(keyword => noteText.includes(keyword));

    if (hasStressKeywords) {
      insights.push('Stress indicators detected in your note. Consider trying relaxation techniques.');
    }

    if (hasPositiveKeywords) {
      insights.push('Positive emotions detected! Great to see you focusing on what\'s going well.');
    }

    if (hasRiskKeywords) {
      riskFactors.push('Your note contains concerning language. Please consider reaching out for support if you\'re struggling.');
    }
  }

  // Mood analysis
  const moodScores = {
    'very_sad': 1, 'sad': 2, 'anxious': 2.5, 'stressed': 2.5, 'angry': 3,
    'neutral': 5, 'calm': 6, 'happy': 8, 'excited': 8.5, 'very_happy': 10
  };

  const currentMoodScore = moodScores[moodData.mood] || 5;

  if (currentMoodScore <= 3) {
    riskFactors.push('Low mood detected. Consider reaching out for support if this continues or worsens.');
  }

  // Pattern comparison with recent entries
  if (recentEntries.length > 0) {
    const recentAvg = recentEntries.reduce((sum, entry) => sum + (entry.moodScore || 5), 0) / recentEntries.length;
    
    if (currentMoodScore > recentAvg + 1) {
      insights.push('Your mood seems to be improving compared to recent entries. Keep up what you\'re doing!');
    } else if (currentMoodScore < recentAvg - 1) {
      insights.push('Your mood is lower than usual. Consider what might be different today and how you can support yourself.');
    }
  }

  return { insights, riskFactors };
};

const generateAIInsights = async (entries, user) => {
  if (!openai) return [];

  try {
    const recentMoods = entries.slice(0, 10).map(entry => ({
      mood: entry.mood,
      intensity: entry.intensity,
      triggers: entry.triggers || [],
      notes: entry.notes || ''
    }));

    const prompt = `
    Analyze these recent mood entries for a student and provide 2-3 personalized insights:
    
    ${JSON.stringify(recentMoods, null, 2)}
    
    Provide insights in this JSON format:
    [
      {
        "title": "Insight Title",
        "description": "Detailed description with actionable advice",
        "confidence": 0.8
      }
    ]
    
    Focus on patterns, triggers, and helpful recommendations. Keep tone supportive and professional.
    `;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful mental health AI assistant. Provide supportive, evidence-based insights for students. Always encourage professional help for serious concerns.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 500,
      temperature: 0.7
    });

    const response = completion.choices[0].message.content;
    const aiInsights = JSON.parse(response);

    return aiInsights.map((insight, index) => ({
      id: `ai_${Date.now()}_${index}`,
      type: 'recommendation',
      title: insight.title,
      description: insight.description,
      confidence: insight.confidence,
      createdAt: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return [];
  }
};

const generatePersonalizedRecommendations = async (entries, goals, user) => {
  const recommendations = [];

  // Basic rule-based recommendations
  if (entries.length > 0) {
    const avgMood = entries.reduce((sum, entry) => sum + (entry.moodScore || 5), 0) / entries.length;
    
    if (avgMood < 5) {
      recommendations.push('Consider scheduling regular check-ins with a counselor or therapist');
      recommendations.push('Try mood-boosting activities like exercise or spending time in nature');
    } else {
      recommendations.push('Continue your current positive habits and routines');
    }
  }

  if (user.streaks?.currentMoodLogging < 7) {
    recommendations.push('Set a daily reminder to log your mood for better insights');
  }

  if (goals.length === 0) {
    recommendations.push('Set a small, achievable wellness goal to work towards');
  } else {
    const completedGoals = goals.filter(goal => goal.status === 'completed').length;
    if (completedGoals / goals.length < 0.5) {
      recommendations.push('Break your current goals into smaller, more manageable steps');
    }
  }

  return recommendations.slice(0, 4);
};

module.exports = {
  getAIAnalysis,
  getMoodInsights,
  getTrendAnalysis,
  getProgressAnalysis,
  analyzeMoodEntry,
  getPersonalizedRecommendations
};
