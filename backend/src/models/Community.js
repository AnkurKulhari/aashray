const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const CommunityPostSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  title: {
    type: String,
    required: [true, 'Post title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  
  content: {
    type: String,
    required: [true, 'Post content is required'],
    maxlength: [5000, 'Content cannot be more than 5000 characters']
  },
  
  type: {
    type: String,
    enum: ['discussion', 'support_request', 'success_story', 'question', 'resource_share', 'check_in'],
    required: [true, 'Post type is required']
  },
  
  category: {
    type: String,
    enum: [
      'general', 'anxiety', 'depression', 'stress', 'relationships',
      'academic', 'career', 'family', 'self_care', 'therapy',
      'medication', 'crisis', 'achievement', 'advice', 'other'
    ],
    required: [true, 'Post category is required']
  },
  
  tags: [{
    type: String,
    trim: true
  }],
  
  // Privacy and Visibility
  isAnonymous: {
    type: Boolean,
    default: false
  },
  
  visibility: {
    type: String,
    enum: ['public', 'university_only', 'year_only', 'private'],
    default: 'public'
  },
  
  // Engagement
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [2000, 'Comment cannot be more than 2000 characters']
    },
    isAnonymous: {
      type: Boolean,
      default: false
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    replies: [{
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      content: {
        type: String,
        required: true,
        maxlength: [1000, 'Reply cannot be more than 1000 characters']
      },
      isAnonymous: {
        type: Boolean,
        default: false
      },
      date: {
        type: Date,
        default: Date.now
      },
      likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    }],
    isHelpful: {
      markedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    },
    date: {
      type: Date,
      default: Date.now
    },
    isModerated: {
      type: Boolean,
      default: false
    }
  }],
  
  views: {
    type: Number,
    default: 0
  },
  
  // Support Features
  supportRequests: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['emotional_support', 'advice', 'resource_help', 'accountability']
    },
    message: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  
  helpfulComments: [{
    comment: {
      type: mongoose.Schema.Types.ObjectId
    },
    votedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  
  // Status and Resolution
  status: {
    type: String,
    enum: ['open', 'answered', 'resolved', 'closed'],
    default: 'open'
  },
  
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  resolvedDate: Date,
  
  bestAnswer: {
    comment: {
      type: mongoose.Schema.Types.ObjectId
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  
  // Crisis and Safety
  isCrisisPost: {
    type: Boolean,
    default: false
  },
  
  triggerWarnings: [{
    type: String,
    enum: [
      'self_harm', 'suicide', 'abuse', 'trauma', 'eating_disorders',
      'substance_use', 'violence', 'medical_content'
    ]
  }],
  
  crisisResponse: {
    alerted: { type: Boolean, default: false },
    alertedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    alertDate: Date,
    response: String,
    responder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Moderation
  isModerated: {
    type: Boolean,
    default: false
  },
  
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  moderationReason: String,
  moderationDate: Date,
  
  reports: [{
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'harmful', 'off_topic', 'misinformation', 'other']
    },
    description: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  
  reportCount: {
    type: Number,
    default: 0
  },
  
  // Scheduling
  isScheduled: {
    type: Boolean,
    default: false
  },
  
  scheduledDate: Date,
  
  expiryDate: Date,
  
  isPinned: {
    type: Boolean,
    default: false
  },
  
  pinnedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Activity Tracking
  lastActivity: {
    type: Date,
    default: Date.now
  },
  
  activityScore: {
    type: Number,
    default: 0
  },
  
  // Peer Matching Related
  peerMatchingEnabled: {
    type: Boolean,
    default: false
  },
  
  matchingCriteria: {
    university: String,
    year: String,
    interests: [String],
    location: String
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
CommunityPostSchema.index({ category: 1, type: 1 });
CommunityPostSchema.index({ author: 1, createdAt: -1 });
CommunityPostSchema.index({ tags: 1 });
CommunityPostSchema.index({ status: 1, lastActivity: -1 });
CommunityPostSchema.index({ isPinned: -1, activityScore: -1 });
CommunityPostSchema.index({ isCrisisPost: 1 });
CommunityPostSchema.index({ isModerated: 1, reportCount: -1 });

// Virtual for like count
CommunityPostSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for comment count
CommunityPostSchema.virtual('commentCount').get(function() {
  return this.comments ? this.comments.length : 0;
});

// Virtual for total engagement
CommunityPostSchema.virtual('engagementScore').get(function() {
  const likes = this.likeCount;
  const comments = this.commentCount;
  const views = this.views;
  
  return (likes * 3) + (comments * 5) + (views * 1);
});

// Instance method to add view
CommunityPostSchema.methods.addView = function() {
  this.views += 1;
  return this.save();
};

// Instance method to toggle like
CommunityPostSchema.methods.toggleLike = function(userId) {
  const likeIndex = this.likes.findIndex(like => like.user.toString() === userId.toString());
  
  if (likeIndex > -1) {
    this.likes.splice(likeIndex, 1);
  } else {
    this.likes.push({ user: userId });
  }
  
  this.lastActivity = new Date();
  this.calculateActivityScore();
  return this.save();
};

// Instance method to add comment
CommunityPostSchema.methods.addComment = function(userId, content, isAnonymous = false) {
  this.comments.push({
    author: userId,
    content,
    isAnonymous
  });
  
  this.lastActivity = new Date();
  this.calculateActivityScore();
  return this.save();
};

// Instance method to calculate activity score
CommunityPostSchema.methods.calculateActivityScore = function() {
  const now = new Date();
  const hoursOld = (now - this.createdAt) / (1000 * 60 * 60);
  const engagement = this.engagementScore;
  
  // Activity score decreases over time but increases with engagement
  this.activityScore = Math.max(0, engagement - (hoursOld * 0.1));
};

// Instance method to mark as crisis post
CommunityPostSchema.methods.markAsCrisis = function(alertedBy, response) {
  this.isCrisisPost = true;
  this.crisisResponse = {
    alerted: true,
    alertedBy,
    alertDate: new Date(),
    response
  };
  return this.save();
};

// Instance method to add report
CommunityPostSchema.methods.addReport = function(reporterId, reason, description) {
  this.reports.push({
    reporter: reporterId,
    reason,
    description
  });
  
  this.reportCount += 1;
  
  // Auto-moderate if too many reports
  if (this.reportCount >= 5) {
    this.isModerated = true;
    this.moderationReason = 'Auto-moderated due to multiple reports';
    this.moderationDate = new Date();
  }
  
  return this.save();
};

// Instance method to resolve post
CommunityPostSchema.methods.resolve = function(resolvedBy) {
  this.status = 'resolved';
  this.resolvedBy = resolvedBy;
  this.resolvedDate = new Date();
  return this.save();
};

// Static method to get trending posts
CommunityPostSchema.statics.getTrending = function(timeframe = 24, limit = 20) {
  const since = new Date(Date.now() - (timeframe * 60 * 60 * 1000));
  
  return this.find({
    createdAt: { $gte: since },
    isModerated: false,
    status: { $in: ['open', 'answered'] }
  })
  .sort({ activityScore: -1 })
  .limit(limit)
  .populate('author', 'firstName lastName displayName isAnonymous')
  .populate('comments.author', 'firstName lastName displayName isAnonymous');
};

// Static method to get posts by category
CommunityPostSchema.statics.getByCategory = function(category, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  return this.find({
    category,
    isModerated: false,
    status: { $in: ['open', 'answered', 'resolved'] }
  })
  .sort({ isPinned: -1, lastActivity: -1 })
  .skip(skip)
  .limit(limit)
  .populate('author', 'firstName lastName displayName isAnonymous')
  .populate('comments.author', 'firstName lastName displayName isAnonymous');
};

// Static method to search posts
CommunityPostSchema.statics.searchPosts = function(query, filters = {}) {
  const searchConditions = {
    $text: { $search: query },
    isModerated: false
  };
  
  if (filters.category) {
    searchConditions.category = filters.category;
  }
  
  if (filters.type) {
    searchConditions.type = filters.type;
  }
  
  return this.find(searchConditions)
    .sort({ score: { $meta: 'textScore' }, lastActivity: -1 })
    .populate('author', 'firstName lastName displayName isAnonymous');
};

// Pre-save middleware to update activity score
CommunityPostSchema.pre('save', function(next) {
  this.calculateActivityScore();
  next();
});

// Text search index
CommunityPostSchema.index({
  title: 'text',
  content: 'text',
  tags: 'text'
});

// Add pagination plugin
CommunityPostSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('CommunityPost', CommunityPostSchema);
