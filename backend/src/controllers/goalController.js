const Goal = require('../models/Goal');
const User = require('../models/User');

// Create a new goal
const createGoal = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      type,
      priority,
      targetValue,
      unit,
      targetMetric,
      deadline,
      frequency,
      reminders,
      milestones,
      motivation,
      supportSystem,
      rewards,
      anticipatedBarriers
    } = req.body;

    const goal = await Goal.create({
      user: req.user.id,
      title,
      description,
      category,
      type,
      priority: priority || 'medium',
      targetValue,
      unit: unit || 'times',
      targetMetric: targetMetric || 'completion',
      deadline,
      frequency,
      reminders,
      milestones: milestones || [],
      motivation,
      supportSystem: supportSystem || [],
      rewards: rewards || [],
      anticipatedBarriers: anticipatedBarriers || [],
      createdBy: 'user'
    });

    // Award points for goal creation
    const user = await User.findById(req.user.id);
    user.addPoints(25, 'Goal creation');
    await user.save();

    res.status(201).json({
      status: 'success',
      data: {
        goal
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get user's goals with filtering and pagination
const getGoals = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      category,
      type,
      priority,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { user: req.user.id, isArchived: false };

    // Filtering
    if (status) query.status = status;
    if (category) query.category = category;
    if (type) query.type = type;
    if (priority) query.priority = priority;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
      populate: {
        path: 'user',
        select: 'firstName lastName displayName isAnonymous'
      }
    };

    const goals = await Goal.paginate(query, options);

    // Get goal statistics
    const statistics = await getGoalStatistics(req.user.id);

    res.status(200).json({
      status: 'success',
      results: goals.docs.length,
      pagination: {
        currentPage: goals.page,
        totalPages: goals.totalPages,
        totalGoals: goals.totalDocs,
        hasNextPage: goals.hasNextPage,
        hasPrevPage: goals.hasPrevPage
      },
      statistics,
      data: {
        goals: goals.docs
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get a specific goal
const getGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!goal) {
      return res.status(404).json({
        status: 'error',
        message: 'Goal not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        goal
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update a goal
const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!goal) {
      return res.status(404).json({
        status: 'error',
        message: 'Goal not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        goal
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Delete/Archive a goal
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isArchived: true, archivedDate: new Date() },
      { new: true }
    );

    if (!goal) {
      return res.status(404).json({
        status: 'error',
        message: 'Goal not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Goal archived successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update goal progress
const updateGoalProgress = async (req, res) => {
  try {
    const { value, notes, mood, difficulty, confidence } = req.body;

    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!goal) {
      return res.status(404).json({
        status: 'error',
        message: 'Goal not found'
      });
    }

    // Update progress
    const result = await goal.updateProgress(value, notes, mood, difficulty, confidence);

    // Award points for progress
    const user = await User.findById(req.user.id);
    const pointsEarned = calculateProgressPoints(goal, value);
    if (pointsEarned > 0) {
      user.addPoints(pointsEarned, 'Goal progress');
      await user.save();
    }

    // Check if goal completed and award bonus points
    if (goal.status === 'completed') {
      user.addPoints(100, 'Goal completion');
      await user.save();
    }

    res.status(200).json({
      status: 'success',
      data: {
        goal: result,
        pointsEarned
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Add challenge to goal
const addGoalChallenge = async (req, res) => {
  try {
    const { challenge, impact } = req.body;

    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!goal) {
      return res.status(404).json({
        status: 'error',
        message: 'Goal not found'
      });
    }

    await goal.addChallenge(challenge, impact);

    res.status(200).json({
      status: 'success',
      data: {
        goal
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Resolve goal challenge
const resolveGoalChallenge = async (req, res) => {
  try {
    const { challengeId, resolution } = req.body;

    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!goal) {
      return res.status(404).json({
        status: 'error',
        message: 'Goal not found'
      });
    }

    await goal.resolveChallenge(challengeId, resolution);

    res.status(200).json({
      status: 'success',
      data: {
        goal
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get goal analytics and insights
const getGoalAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { timeframe = '30d' } = req.query;

    const analytics = await generateGoalAnalytics(userId, timeframe);

    res.status(200).json({
      status: 'success',
      data: {
        analytics
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get goals by status
const getGoalsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const userId = req.user.id;

    const goals = await Goal.getUserGoalsByStatus(userId, status);

    res.status(200).json({
      status: 'success',
      results: goals.length,
      data: {
        goals
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get overdue goals
const getOverdueGoals = async (req, res) => {
  try {
    const userId = req.user.id;
    const overdueGoals = await Goal.getOverdueGoals(userId);

    res.status(200).json({
      status: 'success',
      results: overdueGoals.length,
      data: {
        goals: overdueGoals
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get goal reminders
const getGoalReminders = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    
    const goalsWithReminders = await Goal.find({
      user: userId,
      status: 'active',
      'reminders.enabled': true,
      isArchived: false
    }).populate('user', 'firstName lastName');

    const reminders = [];
    
    goalsWithReminders.forEach(goal => {
      if (goal.reminders && goal.reminders.times) {
        goal.reminders.times.forEach(reminderTime => {
          const currentDay = today.toLocaleDateString('en', { weekday: 'lowercase' });
          
          if (reminderTime.days.includes(currentDay)) {
            reminders.push({
              goalId: goal._id,
              goalTitle: goal.title,
              time: `${reminderTime.hour}:${reminderTime.minute.toString().padStart(2, '0')}`,
              message: goal.reminders.customMessage || `Time to work on: ${goal.title}`,
              priority: goal.priority
            });
          }
        });
      }
    });

    res.status(200).json({
      status: 'success',
      results: reminders.length,
      data: {
        reminders
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Generate goal recommendations
const getGoalRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    const recommendations = await generateGoalRecommendations(user);

    res.status(200).json({
      status: 'success',
      data: {
        recommendations
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Helper function to get goal statistics
const getGoalStatistics = async (userId) => {
  const totalGoals = await Goal.countDocuments({ user: userId, isArchived: false });
  const activeGoals = await Goal.countDocuments({ user: userId, status: 'active', isArchived: false });
  const completedGoals = await Goal.countDocuments({ user: userId, status: 'completed', isArchived: false });
  const overdueGoals = await Goal.countDocuments({ 
    user: userId, 
    status: 'overdue', 
    isArchived: false 
  });

  const completionRate = totalGoals > 0 ? ((completedGoals / totalGoals) * 100).toFixed(1) : 0;

  // Get category distribution
  const categoryStats = await Goal.aggregate([
    { $match: { user: userId, isArchived: false } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  return {
    total: totalGoals,
    active: activeGoals,
    completed: completedGoals,
    overdue: overdueGoals,
    completionRate: parseFloat(completionRate),
    categoryDistribution: categoryStats
  };
};

// Helper function to calculate progress points
const calculateProgressPoints = (goal, progressValue) => {
  let points = 0;
  
  // Base points for any progress
  points += 5;
  
  // Bonus points based on goal type
  switch (goal.type) {
    case 'daily':
      points += 5;
      break;
    case 'weekly':
      points += 10;
      break;
    case 'monthly':
      points += 15;
      break;
  }

  // Bonus for consistent progress
  if (goal.streaks && goal.streaks.current >= 7) {
    points += 10; // Weekly streak bonus
  }

  // Bonus for high-priority goals
  if (goal.priority === 'high' || goal.priority === 'critical') {
    points += 5;
  }

  return points;
};

// Helper function to generate goal analytics
const generateGoalAnalytics = async (userId, timeframe) => {
  const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const goals = await Goal.find({
    user: userId,
    createdAt: { $gte: startDate },
    isArchived: false
  });

  const progressEntries = goals.reduce((acc, goal) => {
    return acc.concat(goal.progressEntries.filter(entry => entry.date >= startDate));
  }, []);

  const analytics = {
    timeframe: `${days} days`,
    totalGoals: goals.length,
    averageProgress: 0,
    mostActiveCategory: null,
    progressTrend: 'stable',
    consistencyScore: 0,
    challengesEncountered: 0,
    milestonesAchieved: 0
  };

  if (goals.length > 0) {
    // Calculate average progress
    const totalProgress = goals.reduce((sum, goal) => sum + goal.completionRate, 0);
    analytics.averageProgress = (totalProgress / goals.length).toFixed(1);

    // Find most active category
    const categoryCount = {};
    goals.forEach(goal => {
      categoryCount[goal.category] = (categoryCount[goal.category] || 0) + 1;
    });
    analytics.mostActiveCategory = Object.keys(categoryCount).reduce((a, b) => 
      categoryCount[a] > categoryCount[b] ? a : b
    );

    // Calculate consistency score (based on progress entries frequency)
    const daysWithProgress = new Set(progressEntries.map(entry => 
      entry.date.toISOString().split('T')[0]
    )).size;
    analytics.consistencyScore = ((daysWithProgress / days) * 100).toFixed(1);

    // Count challenges and milestones
    analytics.challengesEncountered = goals.reduce((sum, goal) => 
      sum + goal.actualChallenges.length, 0
    );
    analytics.milestonesAchieved = goals.reduce((sum, goal) => 
      sum + goal.milestones.filter(m => m.achieved).length, 0
    );

    // Determine progress trend
    if (progressEntries.length >= 2) {
      const recent = progressEntries.slice(-Math.ceil(progressEntries.length / 2));
      const earlier = progressEntries.slice(0, Math.floor(progressEntries.length / 2));
      
      const recentAvg = recent.reduce((sum, entry) => sum + entry.value, 0) / recent.length;
      const earlierAvg = earlier.reduce((sum, entry) => sum + entry.value, 0) / earlier.length;
      
      if (recentAvg > earlierAvg * 1.1) {
        analytics.progressTrend = 'improving';
      } else if (recentAvg < earlierAvg * 0.9) {
        analytics.progressTrend = 'declining';
      }
    }
  }

  return analytics;
};

// Helper function to generate goal recommendations
const generateGoalRecommendations = async (user) => {
  const recommendations = [];

  // Get user's current goals
  const currentGoals = await Goal.find({
    user: user._id,
    status: { $in: ['active', 'paused'] },
    isArchived: false
  });

  const categoryCount = {};
  currentGoals.forEach(goal => {
    categoryCount[goal.category] = (categoryCount[goal.category] || 0) + 1;
  });

  // Recommend categories with fewer goals
  const underrepresentedCategories = [
    'mood_improvement',
    'stress_reduction',
    'sleep_quality',
    'physical_activity',
    'social_connection',
    'self_care',
    'mindfulness'
  ].filter(category => (categoryCount[category] || 0) < 2);

  underrepresentedCategories.forEach(category => {
    recommendations.push({
      type: 'category',
      category,
      title: getCategoryRecommendation(category),
      description: getCategoryDescription(category),
      priority: 'medium',
      estimatedDuration: '2-4 weeks'
    });
  });

  // Add personalized recommendations based on user profile
  if (user.year === '1st Year') {
    recommendations.push({
      type: 'adjustment',
      title: 'College Transition Goal',
      description: 'Set a goal to help with adjusting to college life',
      category: 'academic_performance',
      priority: 'high',
      estimatedDuration: '1 month'
    });
  }

  // Limit to top 5 recommendations
  return recommendations.slice(0, 5);
};

const getCategoryRecommendation = (category) => {
  const recommendations = {
    mood_improvement: 'Practice daily gratitude journaling',
    stress_reduction: 'Learn and practice stress management techniques',
    sleep_quality: 'Establish a consistent sleep routine',
    physical_activity: 'Incorporate regular exercise into your routine',
    social_connection: 'Build stronger relationships with peers',
    self_care: 'Develop a regular self-care routine',
    mindfulness: 'Practice mindfulness and meditation'
  };
  return recommendations[category] || 'Set a new wellness goal';
};

const getCategoryDescription = (category) => {
  const descriptions = {
    mood_improvement: 'Focus on activities that boost your emotional well-being',
    stress_reduction: 'Learn techniques to manage academic and life stress',
    sleep_quality: 'Improve your sleep habits for better mental health',
    physical_activity: 'Regular exercise can significantly improve mood and energy',
    social_connection: 'Strong relationships are vital for mental health',
    self_care: 'Regular self-care practices prevent burnout',
    mindfulness: 'Mindfulness can help manage anxiety and improve focus'
  };
  return descriptions[category] || 'Work on improving this aspect of your wellness';
};

module.exports = {
  createGoal,
  getGoals,
  getGoal,
  updateGoal,
  deleteGoal,
  updateGoalProgress,
  addGoalChallenge,
  resolveGoalChallenge,
  getGoalAnalytics,
  getGoalsByStatus,
  getOverdueGoals,
  getGoalReminders,
  getGoalRecommendations
};
