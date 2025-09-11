const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const ResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Resource title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Resource description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  
  type: {
    type: String,
    enum: ['article', 'video', 'podcast', 'worksheet', 'assessment', 'guide', 'infographic', 'audio', 'other'],
    required: [true, 'Resource type is required']
  },
  
  category: {
    type: String,
    enum: [
      'anxiety', 'depression', 'stress', 'sleep', 'relationships', 'self_esteem',
      'trauma', 'addiction', 'eating_disorders', 'academic_stress', 'crisis',
      'mindfulness', 'coping_skills', 'therapy', 'medication', 'self_care',
      'physical_health', 'social_skills', 'communication', 'general'
    ],
    required: [true, 'Resource category is required']
  },
  
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  
  targetAudience: {
    type: String,
    enum: ['students', 'general', 'professionals', 'family', 'specific_condition'],
    default: 'students'
  },
  
  // Content Information
  content: {
    url: String,
    text: String,
    file: String, // file path or cloudinary URL
    duration: Number, // in minutes for videos/audio
    wordCount: Number
  },
  
  // Metadata
  author: {
    name: String,
    credentials: String,
    organization: String,
    bio: String
  },
  
  tags: [String],
  
  // Quality and Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  qualityScore: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  
  // Engagement Metrics
  views: {
    type: Number,
    default: 0
  },
  
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
  
  bookmarks: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  
  // User Feedback
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    review: String,
    helpfulness: {
      type: Number,
      min: 1,
      max: 5
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: {
      type: String,
      required: true,
      maxlength: [500, 'Comment cannot be more than 500 characters']
    },
    date: {
      type: Date,
      default: Date.now
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    isModerated: {
      type: Boolean,
      default: false
    }
  }],
  
  // Personalization
  personalizedFor: [{
    condition: String,
    severity: String,
    demographics: {
      ageGroup: String,
      academicLevel: String
    }
  }],
  
  // Scheduling and Availability
  isActive: {
    type: Boolean,
    default: true
  },
  
  publishDate: {
    type: Date,
    default: Date.now
  },
  
  expiryDate: Date,
  
  language: {
    type: String,
    default: 'en'
  },
  
  // Content Warnings
  triggers: [{
    type: String,
    enum: [
      'self_harm', 'suicide', 'violence', 'abuse', 'eating_disorders',
      'substance_use', 'trauma', 'medical_content', 'graphic_imagery'
    ]
  }],
  
  contentWarning: String,
  
  // Accessibility
  accessibility: {
    hasTranscript: { type: Boolean, default: false },
    hasSubtitles: { type: Boolean, default: false },
    screenReaderFriendly: { type: Boolean, default: true },
    alternativeFormats: [String]
  },
  
  // Administrative
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending'
  },
  
  moderationNotes: String,
  
  reportCount: {
    type: Number,
    default: 0
  },
  
  reports: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['inappropriate', 'inaccurate', 'spam', 'copyright', 'other']
    },
    description: String,
    date: {
      type: Date,
      default: Date.now
    }
  }]
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
ResourceSchema.index({ category: 1, type: 1 });
ResourceSchema.index({ tags: 1 });
ResourceSchema.index({ isActive: 1, publishDate: -1 });
ResourceSchema.index({ 'ratings.rating': 1 });
ResourceSchema.index({ views: -1 });
ResourceSchema.index({ moderationStatus: 1 });

// Virtual for average rating
ResourceSchema.virtual('averageRating').get(function() {
  if (!this.ratings || this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
  return Math.round((sum / this.ratings.length) * 10) / 10; // Round to 1 decimal
});

// Virtual for like count
ResourceSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for bookmark count
ResourceSchema.virtual('bookmarkCount').get(function() {
  return this.bookmarks ? this.bookmarks.length : 0;
});

// Virtual for comment count
ResourceSchema.virtual('commentCount').get(function() {
  return this.comments ? this.comments.length : 0;
});

// Instance method to add view
ResourceSchema.methods.addView = function() {
  this.views += 1;
  return this.save();
};

// Instance method to like/unlike
ResourceSchema.methods.toggleLike = function(userId) {
  const likeIndex = this.likes.findIndex(like => like.user.toString() === userId.toString());
  
  if (likeIndex > -1) {
    this.likes.splice(likeIndex, 1);
    return this.save();
  } else {
    this.likes.push({ user: userId });
    return this.save();
  }
};

// Instance method to bookmark/unbookmark
ResourceSchema.methods.toggleBookmark = function(userId) {
  const bookmarkIndex = this.bookmarks.findIndex(bookmark => bookmark.user.toString() === userId.toString());
  
  if (bookmarkIndex > -1) {
    this.bookmarks.splice(bookmarkIndex, 1);
    return this.save();
  } else {
    this.bookmarks.push({ user: userId });
    return this.save();
  }
};

// Instance method to add rating
ResourceSchema.methods.addRating = function(userId, rating, review, helpfulness) {
  // Remove existing rating from same user
  this.ratings = this.ratings.filter(r => r.user.toString() !== userId.toString());
  
  // Add new rating
  this.ratings.push({
    user: userId,
    rating,
    review,
    helpfulness
  });
  
  return this.save();
};

// Static method to get popular resources
ResourceSchema.statics.getPopular = function(category, limit = 10) {
  const matchStage = { 
    isActive: true, 
    moderationStatus: 'approved' 
  };
  
  if (category) {
    matchStage.category = category;
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $addFields: {
        popularity: {
          $add: [
            '$views',
            { $multiply: [{ $size: '$likes' }, 2] },
            { $multiply: [{ $size: '$bookmarks' }, 3] },
            { $multiply: ['$averageRating', 10] }
          ]
        }
      }
    },
    { $sort: { popularity: -1 } },
    { $limit: limit }
  ]);
};

// Static method to search resources
ResourceSchema.statics.searchResources = function(query, filters = {}) {
  const pipeline = [];
  
  // Match stage
  const matchStage = {
    isActive: true,
    moderationStatus: 'approved'
  };
  
  if (query) {
    matchStage.$text = { $search: query };
  }
  
  if (filters.category) {
    matchStage.category = filters.category;
  }
  
  if (filters.type) {
    matchStage.type = filters.type;
  }
  
  if (filters.difficulty) {
    matchStage.difficulty = filters.difficulty;
  }
  
  pipeline.push({ $match: matchStage });
  
  // Sort by relevance or date
  if (query) {
    pipeline.push({ $sort: { score: { $meta: 'textScore' }, publishDate: -1 } });
  } else {
    pipeline.push({ $sort: { publishDate: -1 } });
  }
  
  return this.aggregate(pipeline);
};

// Text search index
ResourceSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text',
  'author.name': 'text'
});

// Add pagination plugin
ResourceSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Resource', ResourceSchema);
