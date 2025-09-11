const MoodEntry = require('../models/MoodEntry');
const User = require('../models/User');
const { OpenAI } = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create a new mood entry
const createMoodEntry = async (req, res) => {
  try {
    const {
      mood,
      intensity,
      stressLevel,
      energyLevel,
      sleepQuality,
      location,
      activity,
      socialContext,
      triggers,
      notes,
      gratitude,
      copingStrategiesUsed,
      weather,
      temperature,
      academicPressure,
      upcomingDeadlines,
      physicalSymptoms
    } = req.body;

    // Create mood entry
    const moodEntry = await MoodEntry.create({
      user: req.user.id,
      mood,
      intensity,
      stressLevel: stressLevel || 5,
      energyLevel: energyLevel || 5,
      sleepQuality,
      location,
      activity,
      socialContext,
      triggers: triggers || [],
      notes,
      gratitude: gratitude || [],
      copingStrategiesUsed: copingStrategiesUsed || [],
      weather,
      temperature,
      academicPressure,
      upcomingDeadlines: upcomingDeadlines || 0,
      physicalSymptoms: physicalSymptoms || [],
      entryType: 'manual'
    });

    // Generate AI insights asynchronously
    generateAIInsights(moodEntry);

    // Update user streaks and points
    await updateUserStreaks(req.user.id);

    res.status(201).json({
      status: 'success',
      data: {
        moodEntry
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get user's mood entries with filtering and pagination
const getMoodEntries = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      startDate,
      endDate,
      mood,
      minIntensity,
      maxIntensity,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { user: req.user.id };

    // Date filtering
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Mood filtering
    if (mood) {
      query.mood = Array.isArray(mood) ? { $in: mood } : mood;
    }

    // Intensity filtering
    if (minIntensity || maxIntensity) {
      query.intensity = {};
      if (minIntensity) query.intensity.$gte = parseInt(minIntensity);
      if (maxIntensity) query.intensity.$lte = parseInt(maxIntensity);
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
      populate: {
        path: 'user',
        select: 'firstName lastName displayName isAnonymous'
      }
    };

    const moodEntries = await MoodEntry.paginate(query, options);

    res.status(200).json({
      status: 'success',
      results: moodEntries.docs.length,
      pagination: {
        currentPage: moodEntries.page,
        totalPages: moodEntries.totalPages,
        totalEntries: moodEntries.totalDocs,
        hasNextPage: moodEntries.hasNextPage,
        hasPrevPage: moodEntries.hasPrevPage
      },
      data: {
        moodEntries: moodEntries.docs
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get a specific mood entry
const getMoodEntry = async (req, res) => {
  try {
    const moodEntry = await MoodEntry.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!moodEntry) {
      return res.status(404).json({
        status: 'error',
        message: 'Mood entry not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        moodEntry
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update a mood entry
const updateMoodEntry = async (req, res) => {
  try {
    const moodEntry = await MoodEntry.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!moodEntry) {
      return res.status(404).json({
        status: 'error',
        message: 'Mood entry not found'
      });
    }

    // Regenerate AI insights if significant changes
    if (req.body.mood || req.body.intensity || req.body.notes) {
      generateAIInsights(moodEntry);
    }

    res.status(200).json({
      status: 'success',
      data: {
        moodEntry
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Delete a mood entry
const deleteMoodEntry = async (req, res) => {
  try {
    const moodEntry = await MoodEntry.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!moodEntry) {
      return res.status(404).json({
        status: 'error',
        message: 'Mood entry not found'
      });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get mood trends and analytics
const getMoodTrends = async (req, res) => {
  try {
    const { days = 30, groupBy = 'day' } = req.query;
    const userId = req.user.id;

    const trends = await MoodEntry.getMoodTrends(userId, parseInt(days));
    
    // Get additional analytics
    const analytics = await getMoodAnalytics(userId, parseInt(days));

    res.status(200).json({
      status: 'success',
      data: {
        trends,
        analytics,
        period: {
          days: parseInt(days),
          groupBy
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get mood patterns and insights
const getMoodPatterns = async (req, res) => {
  try {
    const { days = 90 } = req.query;
    const userId = req.user.id;

    const patterns = await MoodEntry.identifyPatterns(userId, parseInt(days));
    const riskAssessment = await MoodEntry.getRiskAssessment(userId, 7);

    res.status(200).json({
      status: 'success',
      data: {
        patterns,
        riskAssessment: riskAssessment[0] || {
          averageMood: 5,
          averageStress: 5,
          lowMoodDays: 0,
          highStressDays: 0,
          crisisIndicators: 0,
          totalEntries: 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get AI-powered insights and recommendations
const getAIInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;

    // Get recent mood entries
    const recentEntries = await MoodEntry.find({
      user: userId,
      createdAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
    }).sort({ createdAt: -1 }).limit(50);

    if (recentEntries.length === 0) {
      return res.status(200).json({
        status: 'success',
        data: {
          insights: {
            summary: "Not enough data yet. Log a few mood entries to get personalized insights!",
            recommendations: [
              "Start by logging your daily mood consistently",
              "Include context like location, activity, and triggers",
              "Note what coping strategies work best for you"
            ],
            patterns: [],
            riskLevel: 'low'
          }
        }
      });
    }

    // Generate comprehensive AI insights
    const insights = await generateComprehensiveInsights(recentEntries, req.user);

    res.status(200).json({
      status: 'success',
      data: {
        insights
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Generate mood report
const generateMoodReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate = new Date(),
      includeInsights = true 
    } = req.query;

    const query = {
      user: userId,
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    const entries = await MoodEntry.find(query).sort({ createdAt: 1 });
    
    if (entries.length === 0) {
      return res.status(200).json({
        status: 'success',
        data: {
          report: {
            period: { startDate, endDate },
            summary: "No mood entries found for this period",
            entries: [],
            statistics: null
          }
        }
      });
    }

    const statistics = calculateMoodStatistics(entries);
    const insights = includeInsights ? await generateComprehensiveInsights(entries, req.user) : null;

    const report = {
      period: { startDate, endDate },
      summary: `Analyzed ${entries.length} mood entries over ${Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))} days`,
      entries: entries.slice(-20), // Last 20 entries for detail
      statistics,
      insights,
      generatedAt: new Date().toISOString()
    };

    res.status(200).json({
      status: 'success',
      data: {
        report
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Helper function to generate AI insights
const generateAIInsights = async (moodEntry) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.log('OpenAI API key not configured, skipping AI insights');
      return;
    }

    const prompt = `
    Analyze this mood entry and provide insights:
    
    Mood: ${moodEntry.mood}
    Intensity: ${moodEntry.intensity}/10
    Stress Level: ${moodEntry.stressLevel}/10
    Energy Level: ${moodEntry.energyLevel}/10
    Location: ${moodEntry.location}
    Activity: ${moodEntry.activity}
    Triggers: ${moodEntry.triggers.join(', ')}
    Notes: ${moodEntry.notes || 'None'}
    
    Please provide:
    1. Brief emotional pattern analysis
    2. 2-3 personalized recommendations
    3. Risk level (low/medium/high)
    
    Keep response concise and supportive.
    `;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a supportive mental health AI assistant. Provide helpful, empathetic insights about mood patterns. Always encourage professional help for serious concerns.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 300,
      temperature: 0.7
    });

    const aiResponse = completion.choices[0].message.content;
    
    // Parse and structure the AI response
    const insights = parseAIResponse(aiResponse);
    
    // Update mood entry with AI insights
    moodEntry.aiAnalysis = {
      ...moodEntry.aiAnalysis,
      ...insights,
      lastUpdated: new Date()
    };

    await moodEntry.save();
  } catch (error) {
    console.error('Error generating AI insights:', error);
  }
};

// Helper function to parse AI response
const parseAIResponse = (response) => {
  try {
    const insights = {
      emotionalPatterns: [],
      recommendations: [],
      riskIndicators: []
    };

    // Simple parsing - in production, use more sophisticated NLP
    const lines = response.split('\n').filter(line => line.trim());
    
    let currentSection = '';
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('pattern') || lowerLine.includes('analysis')) {
        currentSection = 'patterns';
      } else if (lowerLine.includes('recommend') || lowerLine.includes('suggest')) {
        currentSection = 'recommendations';
      } else if (lowerLine.includes('risk')) {
        currentSection = 'risk';
      } else if (line.trim() && currentSection) {
        switch (currentSection) {
          case 'patterns':
            insights.emotionalPatterns.push(line.trim());
            break;
          case 'recommendations':
            insights.recommendations.push(line.trim());
            break;
        }
      }
    });

    return insights;
  } catch (error) {
    return {
      emotionalPatterns: ['Analysis in progress'],
      recommendations: ['Continue logging your mood consistently'],
      riskIndicators: []
    };
  }
};

// Helper function to generate comprehensive insights
const generateComprehensiveInsights = async (entries, user) => {
  try {
    const recentEntries = entries.slice(-14); // Last 2 weeks
    const averageMood = recentEntries.reduce((sum, entry) => sum + entry.moodScore, 0) / recentEntries.length;
    const averageStress = recentEntries.reduce((sum, entry) => sum + entry.stressLevel, 0) / recentEntries.length;
    
    // Identify trends
    const trends = identifyMoodTrends(entries);
    const patterns = identifyContextPatterns(entries);
    const riskLevel = assessRiskLevel(recentEntries);

    return {
      summary: `Your average mood score is ${averageMood.toFixed(1)}/10 over the last ${recentEntries.length} entries.`,
      trends,
      patterns,
      recommendations: generateRecommendations(entries, averageMood, averageStress),
      riskLevel,
      lastAnalyzed: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error generating comprehensive insights:', error);
    return {
      summary: 'Analysis temporarily unavailable',
      recommendations: ['Continue logging your mood regularly'],
      riskLevel: 'unknown'
    };
  }
};

// Helper functions for analytics
const getMoodAnalytics = async (userId, days) => {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const entries = await MoodEntry.find({
    user: userId,
    createdAt: { $gte: startDate }
  });

  return calculateMoodStatistics(entries);
};

const calculateMoodStatistics = (entries) => {
  if (entries.length === 0) return null;

  const moodScores = entries.map(entry => entry.moodScore);
  const stressLevels = entries.map(entry => entry.stressLevel);
  const energyLevels = entries.map(entry => entry.energyLevel);

  return {
    totalEntries: entries.length,
    averageMood: (moodScores.reduce((a, b) => a + b, 0) / moodScores.length).toFixed(1),
    averageStress: (stressLevels.reduce((a, b) => a + b, 0) / stressLevels.length).toFixed(1),
    averageEnergy: (energyLevels.reduce((a, b) => a + b, 0) / energyLevels.length).toFixed(1),
    moodDistribution: getMoodDistribution(entries),
    commonTriggers: getTopTriggers(entries),
    mostCommonLocation: getMostCommon(entries, 'location'),
    mostCommonActivity: getMostCommon(entries, 'activity')
  };
};

const identifyMoodTrends = (entries) => {
  if (entries.length < 7) return ['Need more data for trend analysis'];

  const recentWeek = entries.slice(-7);
  const previousWeek = entries.slice(-14, -7);

  if (previousWeek.length === 0) return ['Building baseline data'];

  const recentAvg = recentWeek.reduce((sum, e) => sum + e.moodScore, 0) / recentWeek.length;
  const previousAvg = previousWeek.reduce((sum, e) => sum + e.moodScore, 0) / previousWeek.length;

  const trends = [];
  const diff = recentAvg - previousAvg;

  if (Math.abs(diff) < 0.5) {
    trends.push('Your mood has been stable over the past two weeks');
  } else if (diff > 0.5) {
    trends.push('Your mood has been improving recently');
  } else {
    trends.push('Your mood has been declining recently');
  }

  return trends;
};

const identifyContextPatterns = (entries) => {
  const patterns = [];
  
  // Analyze location patterns
  const locationMoods = {};
  entries.forEach(entry => {
    if (!locationMoods[entry.location]) locationMoods[entry.location] = [];
    locationMoods[entry.location].push(entry.moodScore);
  });

  const bestLocation = Object.keys(locationMoods).reduce((best, location) => {
    const avgMood = locationMoods[location].reduce((a, b) => a + b, 0) / locationMoods[location].length;
    return !best || avgMood > locationMoods[best].reduce((a, b) => a + b, 0) / locationMoods[best].length 
      ? location : best;
  }, null);

  if (bestLocation) {
    patterns.push(`You tend to feel better when at: ${bestLocation}`);
  }

  return patterns;
};

const assessRiskLevel = (entries) => {
  if (entries.length === 0) return 'unknown';

  const lowMoodCount = entries.filter(e => e.moodScore <= 3).length;
  const highStressCount = entries.filter(e => e.stressLevel >= 8).length;
  const crisisIndicators = entries.filter(e => 
    e.triggers.some(t => ['self_harm', 'suicidal_thoughts'].includes(t))
  ).length;

  if (crisisIndicators > 0) return 'high';
  if (lowMoodCount > entries.length * 0.5 || highStressCount > entries.length * 0.3) return 'medium';
  return 'low';
};

const generateRecommendations = (entries, averageMood, averageStress) => {
  const recommendations = [];

  if (averageMood < 4) {
    recommendations.push('Consider reaching out to a mental health professional for support');
    recommendations.push('Try engaging in activities that have boosted your mood in the past');
  } else if (averageMood < 6) {
    recommendations.push('Focus on stress reduction techniques like deep breathing or meditation');
    recommendations.push('Maintain a consistent sleep schedule');
  } else {
    recommendations.push('Keep up the great work! Continue your positive habits');
    recommendations.push('Share your successful strategies with others who might benefit');
  }

  if (averageStress > 7) {
    recommendations.push('Consider stress management techniques or talking to a counselor');
    recommendations.push('Try to identify and address your main stress triggers');
  }

  return recommendations;
};

// Helper functions for statistics
const getMoodDistribution = (entries) => {
  const distribution = {};
  entries.forEach(entry => {
    distribution[entry.mood] = (distribution[entry.mood] || 0) + 1;
  });
  return distribution;
};

const getTopTriggers = (entries) => {
  const triggerCount = {};
  entries.forEach(entry => {
    entry.triggers.forEach(trigger => {
      triggerCount[trigger] = (triggerCount[trigger] || 0) + 1;
    });
  });
  
  return Object.entries(triggerCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([trigger, count]) => ({ trigger, count }));
};

const getMostCommon = (entries, field) => {
  const counts = {};
  entries.forEach(entry => {
    const value = entry[field];
    if (value) counts[value] = (counts[value] || 0) + 1;
  });
  
  return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, null);
};

const updateUserStreaks = async (userId) => {
  try {
    const user = await User.findById(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayEntry = await MoodEntry.findOne({
      user: userId,
      createdAt: { $gte: today }
    });

    if (todayEntry) {
      // Update mood logging streak
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const yesterdayEntry = await MoodEntry.findOne({
        user: userId,
        createdAt: { 
          $gte: yesterday,
          $lt: today
        }
      });

      if (yesterdayEntry) {
        user.streaks.currentMoodLogging += 1;
      } else {
        user.streaks.currentMoodLogging = 1;
      }

      user.streaks.longestMoodLogging = Math.max(
        user.streaks.longestMoodLogging, 
        user.streaks.currentMoodLogging
      );

      // Award points for consistency
      const pointsEarned = user.addPoints(10, 'Daily mood logging');
      
      await user.save();
    }
  } catch (error) {
    console.error('Error updating user streaks:', error);
  }
};

module.exports = {
  createMoodEntry,
  getMoodEntries,
  getMoodEntry,
  updateMoodEntry,
  deleteMoodEntry,
  getMoodTrends,
  getMoodPatterns,
  getAIInsights,
  generateMoodReport
};
