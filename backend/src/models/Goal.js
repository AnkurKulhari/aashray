const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const GoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Basic Goal Information
  title: {
    type: String,
    required: [true, 'Goal title is required'],
    trim: true,
    maxlength: [100, 'Goal title cannot be more than 100 characters']
  },
  
  description: {
    type: String,
    maxlength: [500, 'Goal description cannot be more than 500 characters'],
    trim: true
  },
  
  category: {
    type: String,
    enum: [
      'mood_improvement', 'stress_reduction', 'sleep_quality', 'physical_activity',
      'social_connection', 'academic_performance', 'self_care', 'mindfulness',
      'therapy_engagement', 'medication_adherence', 'crisis_management',
      'habit_building', 'emotional_regulation', 'communication', 'other'
    ],
    required: [true, 'Goal category is required']
  },
  
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'one_time', 'continuous'],
    required: [true, 'Goal type is required']
  },
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  // Goal Metrics and Targets
  targetValue: {
    type: Number,
    min: [0, 'Target value cannot be negative']
  },
  
  currentValue: {
    type: Number,
    default: 0,
    min: [0, 'Current value cannot be negative']
  },
  
  unit: {
    type: String,
    enum: ['times', 'minutes', 'hours', 'days', 'sessions', 'score', 'percentage', 'other'],
    default: 'times'
  },
  
  targetMetric: {
    type: String,
    enum: ['completion', 'frequency', 'duration', 'improvement', 'maintenance'],
    default: 'completion'
  },
  
  // Scheduling and Timing
  startDate: {
    type: Date,
    default: Date.now
  },
  
  endDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  
  deadline: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value > this.startDate;
      },
      message: 'Deadline must be after start date'
    }
  },
  
  // Recurring Goals
  frequency: {
    daily: {
      enabled: { type: Boolean, default: false },
      timesPerDay: { type: Number, min: 1, max: 10, default: 1 }
    },
    weekly: {
      enabled: { type: Boolean, default: false },
      timesPerWeek: { type: Number, min: 1, max: 7, default: 1 },
      preferredDays: [{
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      }]
    },
    monthly: {
      enabled: { type: Boolean, default: false },
      timesPerMonth: { type: Number, min: 1, max: 31, default: 1 },
      preferredDates: [{ type: Number, min: 1, max: 31 }]
    }
  },
  
  // Reminders and Notifications
  reminders: {
    enabled: { type: Boolean, default: true },
    times: [{
      hour: { type: Number, min: 0, max: 23 },
      minute: { type: Number, min: 0, max: 59 },
      days: [{
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      }]
    }],
    customMessage: String
  },
  
  // Progress Tracking
  milestones: [{
    title: { type: String, required: true },
    description: String,
    targetValue: Number,
    achieved: { type: Boolean, default: false },
    achievedDate: Date,
    reward: String
  }],
  
  progressEntries: [{
    date: { type: Date, default: Date.now },
    value: { type: Number, required: true },
    notes: String,
    mood: {
      type: String,
      enum: ['very_happy', 'happy', 'neutral', 'sad', 'very_sad', 'frustrated', 'motivated']
    },
    difficulty: {
      type: Number,
      min: 1,
      max: 5
    },
    confidence: {
      type: Number,
      min: 1,
      max: 10
    }
  }],
  
  // Status and Completion
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'cancelled', 'overdue'],
    default: 'active'
  },
  
  completionDate: Date,
  
  completionRate: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // Support and Motivation
  motivation: {
    personalReason: String,
    benefits: [String],
    consequences: [String]
  },
  
  supportSystem: [{
    name: String,
    relationship: String,
    role: {
      type: String,
      enum: ['accountability_partner', 'cheerleader', 'mentor', 'family', 'friend', 'therapist']
    },
    contactInfo: String
  }],
  
  rewards: [{
    milestone: String,
    reward: { type: String, required: true },
    earned: { type: Boolean, default: false },
    earnedDate: Date
  }],
  
  // Challenges and Barriers
  anticipatedBarriers: [{
    barrier: { type: String, required: true },
    strategies: [String],
    severity: {
      type: String,
      enum: ['low', 'medium', 'high']
    }
  }],
  
  actualChallenges: [{
    date: { type: Date, default: Date.now },
    challenge: { type: String, required: true },
    impact: {
      type: String,
      enum: ['minimal', 'moderate', 'significant', 'severe']
    },
    resolution: String,
    resolved: { type: Boolean, default: false }
  }],
  
  // AI Insights and Recommendations
  aiInsights: {
    successProbability: {
      type: Number,
      min: 0,
      max: 100
    },
    recommendedAdjustments: [String],
    similarGoalOutcomes: [{
      outcome: String,
      probability: Number
    }],
    optimalTiming: {
      bestDays: [String],
      bestTimes: [String]
    },
    personalizedTips: [String]
  },
  
  // Sharing and Community
  isShared: {
    type: Boolean,
    default: false
  },
  
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['view', 'comment', 'support'],
      default: 'view'
    },
    sharedDate: { type: Date, default: Date.now }
  }],
  
  communitySupport: {
    enabled: { type: Boolean, default: false },
    allowComments: { type: Boolean, default: true },
    allowEncouragement: { type: Boolean, default: true }
  },
  
  // Gamification
  points: {
    type: Number,
    default: 0
  },
  
  badges: [{
    type: String,
    earnedDate: { type: Date, default: Date.now }
  }],
  
  streaks: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastUpdate: { type: Date, default: Date.now }
  },
  
  // Metadata
  createdBy: {
    type: String,
    enum: ['user', 'therapist', 'ai_suggestion', 'template'],
    default: 'user'
  },
  
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GoalTemplate'
  },
  
  tags: [String],
  
  isArchived: {
    type: Boolean,
    default: false
  },
  
  archivedDate: Date
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
GoalSchema.index({ user: 1, status: 1 });
GoalSchema.index({ category: 1, type: 1 });
GoalSchema.index({ deadline: 1, status: 1 });
GoalSchema.index({ 'reminders.enabled': 1, 'reminders.times': 1 });
GoalSchema.index({ isShared: 1, 'communitySupport.enabled': 1 });

// Virtual for progress percentage
GoalSchema.virtual('progressPercentage').get(function() {
  if (!this.targetValue || this.targetValue === 0) return 0;
  return Math.min(Math.round((this.currentValue / this.targetValue) * 100), 100);
});

// Virtual for days remaining
GoalSchema.virtual('daysRemaining').get(function() {
  if (!this.deadline) return null;
  const today = new Date();
  const deadline = new Date(this.deadline);
  const timeDiff = deadline.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
});

// Virtual for current streak status
GoalSchema.virtual('streakStatus').get(function() {
  const today = new Date();
  const lastUpdate = new Date(this.streaks.lastUpdate);
  const daysSinceUpdate = Math.floor((today - lastUpdate) / (1000 * 3600 * 24));
  
  if (daysSinceUpdate > 1) {
    return 'broken';
  } else if (daysSinceUpdate === 1) {
    return 'at_risk';
  }
  return 'active';
});

// Virtual for next milestone
GoalSchema.virtual('nextMilestone').get(function() {
  return this.milestones.find(milestone => !milestone.achieved);
});

// Instance method to update progress
GoalSchema.methods.updateProgress = function(value, notes, mood, difficulty, confidence) {
  this.progressEntries.push({
    value,
    notes,
    mood,
    difficulty,
    confidence
  });
  
  // Update current value based on goal type
  if (this.targetMetric === 'completion') {
    this.currentValue = Math.min(this.currentValue + value, this.targetValue);
  } else {
    this.currentValue = value;
  }
  
  // Update completion rate
  if (this.targetValue > 0) {
    this.completionRate = Math.min((this.currentValue / this.targetValue) * 100, 100);
  }
  
  // Check for milestone achievements
  this.milestones.forEach(milestone => {
    if (!milestone.achieved && this.currentValue >= milestone.targetValue) {
      milestone.achieved = true;
      milestone.achievedDate = new Date();
    }
  });
  
  // Update streak
  this.updateStreak();
  
  // Mark as completed if target reached
  if (this.currentValue >= this.targetValue && this.status === 'active') {
    this.status = 'completed';
    this.completionDate = new Date();
  }
  
  return this.save();
};

// Instance method to update streak
GoalSchema.methods.updateStreak = function() {
  const today = new Date();
  const lastUpdate = new Date(this.streaks.lastUpdate);
  const daysSinceUpdate = Math.floor((today - lastUpdate) / (1000 * 3600 * 24));
  
  if (daysSinceUpdate === 1) {
    // Consecutive day
    this.streaks.current += 1;
    this.streaks.longest = Math.max(this.streaks.current, this.streaks.longest);
  } else if (daysSinceUpdate > 1) {
    // Streak broken
    this.streaks.current = 1;
  }
  // If daysSinceUpdate === 0, it's the same day, no update needed
  
  this.streaks.lastUpdate = today;
};

// Instance method to add challenge
GoalSchema.methods.addChallenge = function(challenge, impact) {
  this.actualChallenges.push({
    challenge,
    impact
  });
  return this.save();
};

// Instance method to resolve challenge
GoalSchema.methods.resolveChallenge = function(challengeId, resolution) {
  const challenge = this.actualChallenges.id(challengeId);
  if (challenge) {
    challenge.resolution = resolution;
    challenge.resolved = true;
  }
  return this.save();
};

// Static method to get user goals by status
GoalSchema.statics.getUserGoalsByStatus = function(userId, status) {
  return this.find({ user: userId, status, isArchived: false })
    .sort({ priority: -1, createdAt: -1 });
};

// Static method to get overdue goals
GoalSchema.statics.getOverdueGoals = function(userId) {
  const today = new Date();
  return this.find({
    user: userId,
    deadline: { $lt: today },
    status: { $in: ['active', 'paused'] },
    isArchived: false
  });
};

// Pre-save middleware to update status based on deadline
GoalSchema.pre('save', function(next) {
  const today = new Date();
  
  // Update status to overdue if deadline has passed
  if (this.deadline && this.deadline < today && this.status === 'active') {
    this.status = 'overdue';
  }
  
  // Ensure completion date is set when status is completed
  if (this.status === 'completed' && !this.completionDate) {
    this.completionDate = new Date();
  }
  
  next();
});

// Add pagination plugin
GoalSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Goal', GoalSchema);
