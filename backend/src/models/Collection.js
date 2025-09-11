const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const CollectionSchema = new mongoose.Schema({
  // Basic Collection Information
  title: {
    type: String,
    required: [true, 'Collection title is required'],
    trim: true,
    maxlength: [200, 'Collection title cannot be more than 200 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Collection description is required'],
    trim: true,
    maxlength: [1000, 'Collection description cannot be more than 1000 characters']
  },
  
  slug: {
    type: String,
    unique: true,
    required: true,
    lowercase: true
  },
  
  // Collection Type and Category
  type: {
    type: String,
    enum: ['curated', 'learning_path', 'topic_series', 'featured', 'seasonal', 'crisis_support'],
    required: [true, 'Collection type is required']
  },
  
  category: {
    type: String,
    enum: [
      'anxiety', 'depression', 'stress', 'sleep', 'relationships', 'self_esteem',
      'trauma', 'addiction', 'eating_disorders', 'academic_stress', 'crisis',
      'mindfulness', 'coping_skills', 'therapy', 'medication', 'self_care',
      'physical_health', 'social_skills', 'communication', 'general'
    ],
    required: [true, 'Collection category is required']
  },
  
  // Visual and Branding
  coverImage: {
    url: String,
    publicId: String, // Cloudinary public ID
    alt: String
  },
  
  color: {
    type: String,
    default: '#3B82F6', // Blue color
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color']
  },
  
  icon: {
    type: String,
    default: '📚'
  },
  
  // Resources in Collection
  resources: [{
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true
    },
    order: {
      type: Number,
      default: 0
    },
    isOptional: {
      type: Boolean,
      default: false
    },
    completionCriteria: {
      mustView: { type: Boolean, default: true },
      mustRate: { type: Boolean, default: false },
      mustComment: { type: Boolean, default: false }
    },
    notes: String, // Admin notes about why this resource is included
    estimatedTime: Number // Time in minutes to complete
  }],
  
  // Learning Path Specific Fields
  learningPath: {
    isLearningPath: { type: Boolean, default: false },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    estimatedDuration: {
      total: Number, // Total minutes
      sessions: Number, // Recommended number of sessions
      sessionLength: Number // Average minutes per session
    },
    prerequisites: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collection'
    }],
    objectives: [String], // Learning objectives
    skills: [String], // Skills gained
    certificate: {
      available: { type: Boolean, default: false },
      title: String,
      description: String
    }
  },
  
  // Curation and Quality
  curator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['editor', 'reviewer', 'contributor'],
      default: 'contributor'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Status and Visibility
  status: {
    type: String,
    enum: ['draft', 'review', 'published', 'archived'],
    default: 'draft'
  },
  
  visibility: {
    type: String,
    enum: ['public', 'unlisted', 'private'],
    default: 'public'
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  isPromoted: {
    type: Boolean,
    default: false
  },
  
  // Targeting and Personalization
  targetAudience: {
    type: String,
    enum: ['students', 'general', 'professionals', 'family', 'specific_condition'],
    default: 'students'
  },
  
  tags: [String],
  
  personalizedFor: [{
    condition: String,
    severity: String,
    demographics: {
      ageGroup: String,
      academicLevel: String,
      interests: [String]
    }
  }],
  
  // Scheduling and Availability
  publishDate: {
    type: Date,
    default: Date.now
  },
  
  expiryDate: Date,
  
  seasonal: {
    isseasonal: { type: Boolean, default: false },
    season: {
      type: String,
      enum: ['spring', 'summer', 'fall', 'winter', 'exam_period', 'new_semester', 'holidays']
    },
    startDate: Date,
    endDate: Date
  },
  
  // Engagement and Analytics
  views: {
    type: Number,
    default: 0
  },
  
  followers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    followedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  completions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      resourcesCompleted: Number,
      totalResources: Number,
      percentage: Number
    },
    timeSpent: Number, // Total minutes spent
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String
  }],
  
  // User Progress Tracking
  userProgress: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    lastAccessedAt: Date,
    completedResources: [{
      resource: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource'
      },
      completedAt: {
        type: Date,
        default: Date.now
      },
      timeSpent: Number,
      rating: Number
    }],
    currentResource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource'
    },
    notes: [String], // User's personal notes
    bookmarked: {
      type: Boolean,
      default: false
    }
  }],
  
  // Reviews and Ratings
  reviews: [{
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
    helpful: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      isHelpful: Boolean,
      date: {
        type: Date,
        default: Date.now
      }
    }],
    date: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Administrative
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending'
  },
  
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  moderationNotes: String,
  
  isActive: {
    type: Boolean,
    default: true
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
CollectionSchema.index({ slug: 1 });
CollectionSchema.index({ type: 1, category: 1 });
CollectionSchema.index({ status: 1, visibility: 1 });
CollectionSchema.index({ isFeatured: 1, isPromoted: 1 });
CollectionSchema.index({ tags: 1 });
CollectionSchema.index({ publishDate: -1 });
CollectionSchema.index({ 'seasonal.isseasonal': 1, 'seasonal.season': 1 });

// Compound indexes
CollectionSchema.index({ category: 1, type: 1, status: 1 });
CollectionSchema.index({ targetAudience: 1, difficulty: 1 });

// Text search index
CollectionSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text'
});

// Virtual for average rating
CollectionSchema.virtual('averageRating').get(function() {
  if (!this.reviews || this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / this.reviews.length) * 10) / 10;
});

// Virtual for completion rate
CollectionSchema.virtual('completionRate').get(function() {
  if (!this.completions || this.completions.length === 0) return 0;
  return Math.round((this.completions.length / Math.max(this.views, 1)) * 100);
});

// Virtual for follower count
CollectionSchema.virtual('followerCount').get(function() {
  return this.followers ? this.followers.length : 0;
});

// Virtual for resource count
CollectionSchema.virtual('resourceCount').get(function() {
  return this.resources ? this.resources.length : 0;
});

// Virtual for estimated completion time
CollectionSchema.virtual('estimatedTime').get(function() {
  if (this.learningPath.isLearningPath && this.learningPath.estimatedDuration) {
    return this.learningPath.estimatedDuration.total;
  }
  
  // Calculate from resources
  return this.resources.reduce((total, item) => {
    return total + (item.estimatedTime || 10); // Default 10 minutes per resource
  }, 0);
});

// Instance method to add resource to collection
CollectionSchema.methods.addResource = function(resourceId, options = {}) {
  const resourceItem = {
    resource: resourceId,
    order: options.order || this.resources.length,
    isOptional: options.isOptional || false,
    completionCriteria: options.completionCriteria || {},
    notes: options.notes,
    estimatedTime: options.estimatedTime
  };
  
  this.resources.push(resourceItem);
  return this.save();
};

// Instance method to remove resource from collection
CollectionSchema.methods.removeResource = function(resourceId) {
  this.resources = this.resources.filter(
    item => item.resource.toString() !== resourceId.toString()
  );
  return this.save();
};

// Instance method to reorder resources
CollectionSchema.methods.reorderResources = function(resourceOrder) {
  resourceOrder.forEach((resourceId, index) => {
    const resourceItem = this.resources.find(
      item => item.resource.toString() === resourceId.toString()
    );
    if (resourceItem) {
      resourceItem.order = index;
    }
  });
  
  this.resources.sort((a, b) => a.order - b.order);
  return this.save();
};

// Instance method to track user progress
CollectionSchema.methods.updateUserProgress = function(userId, resourceId, data) {
  let userProgress = this.userProgress.find(
    progress => progress.user.toString() === userId.toString()
  );
  
  if (!userProgress) {
    userProgress = {
      user: userId,
      startedAt: new Date(),
      completedResources: [],
      notes: []
    };
    this.userProgress.push(userProgress);
  }
  
  userProgress.lastAccessedAt = new Date();
  userProgress.currentResource = resourceId;
  
  if (data.completed) {
    const existingIndex = userProgress.completedResources.findIndex(
      cr => cr.resource.toString() === resourceId.toString()
    );
    
    if (existingIndex === -1) {
      userProgress.completedResources.push({
        resource: resourceId,
        completedAt: new Date(),
        timeSpent: data.timeSpent,
        rating: data.rating
      });
    }
  }
  
  return this.save();
};

// Static method to get featured collections
CollectionSchema.statics.getFeatured = function(limit = 5) {
  return this.find({
    isFeatured: true,
    status: 'published',
    visibility: 'public',
    isActive: true
  })
  .populate('resources.resource', 'title type category difficulty')
  .populate('curator', 'firstName lastName displayName')
  .sort({ views: -1, createdAt: -1 })
  .limit(limit);
};

// Static method to get collections by category
CollectionSchema.statics.getByCategory = function(category, options = {}) {
  const query = {
    category,
    status: 'published',
    visibility: 'public',
    isActive: true
  };
  
  if (options.type) query.type = options.type;
  if (options.difficulty) query['learningPath.difficulty'] = options.difficulty;
  
  return this.find(query)
    .populate('resources.resource', 'title type category difficulty views')
    .populate('curator', 'firstName lastName displayName')
    .sort({ isPromoted: -1, views: -1, createdAt: -1 });
};

// Static method to get seasonal collections
CollectionSchema.statics.getSeasonal = function(season) {
  const query = {
    'seasonal.isseasonal': true,
    status: 'published',
    visibility: 'public',
    isActive: true
  };
  
  if (season) {
    query['seasonal.season'] = season;
  }
  
  const now = new Date();
  query.$or = [
    { 'seasonal.startDate': { $exists: false } },
    { 'seasonal.startDate': { $lte: now } }
  ];
  query.$or = [
    { 'seasonal.endDate': { $exists: false } },
    { 'seasonal.endDate': { $gte: now } }
  ];
  
  return this.find(query)
    .populate('resources.resource', 'title type category')
    .populate('curator', 'firstName lastName displayName')
    .sort({ createdAt: -1 });
};

// Pre-save middleware to generate slug
CollectionSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim('-'); // Remove leading/trailing hyphens
    
    // Ensure uniqueness (basic approach - could be enhanced)
    if (this.isNew) {
      const timestamp = Date.now().toString().slice(-4);
      this.slug = `${this.slug}-${timestamp}`;
    }
  }
  
  next();
});

// Add pagination plugin
CollectionSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Collection', CollectionSchema);
