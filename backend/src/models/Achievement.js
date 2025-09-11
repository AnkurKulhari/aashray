const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Achievement name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Achievement name cannot be more than 100 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Achievement description is required'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  
  category: {
    type: String,
    enum: [
      'mood_tracking', 'goal_achievement', 'community_engagement', 'consistency',
      'milestone', 'support_others', 'self_care', 'crisis_support', 'wellness',
      'learning', 'special', 'seasonal'
    ],
    required: [true, 'Achievement category is required']
  },
  
  type: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum', 'special'],
    default: 'bronze'
  },
  
  icon: {
    type: String,
    default: '🏆'
  },
  
  color: {
    type: String,
    default: '#FFD700'
  },
  
  // Requirements to earn this achievement
  requirements: {
    // Numeric requirements
    moodEntries: Number,
    goalsCompleted: Number,
    communityPosts: Number,
    commentsGiven: Number,
    helpfulComments: Number,
    consecutiveDays: Number,
    totalPoints: Number,
    
    // Specific actions
    specificActions: [{
      action: {
        type: String,
        enum: [
          'first_mood_entry', 'first_goal', 'first_post', 'first_comment',
          'help_in_crisis', 'complete_assessment', 'use_coping_strategy',
          'attend_virtual_session', 'refer_friend', 'update_safety_plan'
        ]
      },
      count: { type: Number, default: 1 }
    }],
    
    // Time-based requirements
    timeframe: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'all_time'],
      default: 'all_time'
    }
  },
  
  // Rewards for earning this achievement
  rewards: {
    points: {
      type: Number,
      default: 0
    },
    badges: [String],
    unlocks: [String], // Features or content unlocked
    specialPerks: [String]
  },
  
  // Achievement metadata
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  isHidden: {
    type: Boolean,
    default: false // Hidden achievements are not shown until earned
  },
  
  order: {
    type: Number,
    default: 0
  },
  
  // Statistics
  earnedCount: {
    type: Number,
    default: 0
  },
  
  // Prerequisites (other achievements that must be earned first)
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement'
  }],
  
  // Series information (for progressive achievements)
  series: {
    name: String,
    level: Number,
    nextInSeries: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Achievement'
    }
  },
  
  // Seasonal or time-limited achievements
  availableFrom: Date,
  availableUntil: Date,
  
  createdBy: {
    type: String,
    default: 'system'
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
AchievementSchema.index({ category: 1, type: 1 });
AchievementSchema.index({ isActive: 1, isHidden: 1 });
AchievementSchema.index({ rarity: 1, order: 1 });

// Virtual for completion rate
AchievementSchema.virtual('completionRate').get(function() {
  // This would need to be calculated based on total users
  return this.earnedCount;
});

// Static method to get achievements by category
AchievementSchema.statics.getByCategory = function(category, includeHidden = false) {
  const query = { category, isActive: true };
  if (!includeHidden) {
    query.isHidden = false;
  }
  return this.find(query).sort({ order: 1, type: 1 });
};

// Static method to get available achievements for user
AchievementSchema.statics.getAvailableForUser = function(userId, userAchievements = []) {
  const earnedIds = userAchievements.map(ach => ach.toString());
  
  return this.find({
    _id: { $nin: earnedIds },
    isActive: true,
    isHidden: false,
    $or: [
      { availableFrom: { $exists: false } },
      { availableFrom: { $lte: new Date() } }
    ],
    $or: [
      { availableUntil: { $exists: false } },
      { availableUntil: { $gte: new Date() } }
    ]
  }).sort({ rarity: 1, order: 1 });
};

module.exports = mongoose.model('Achievement', AchievementSchema);
