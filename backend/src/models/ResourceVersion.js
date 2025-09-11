const mongoose = require('mongoose');

const ResourceVersionSchema = new mongoose.Schema({
  // Reference to the main resource
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
    required: true,
    index: true
  },
  
  // Version information
  version: {
    type: String,
    required: true,
    match: [/^\d+\.\d+\.\d+$/, 'Version must follow semantic versioning (x.y.z)']
  },
  
  versionNumber: {
    type: Number,
    required: true,
    min: 1
  },
  
  // Change tracking
  changeType: {
    type: String,
    enum: ['major', 'minor', 'patch', 'initial'],
    required: true
  },
  
  changeDescription: {
    type: String,
    required: true,
    maxlength: [500, 'Change description cannot exceed 500 characters']
  },
  
  changes: [{
    field: {
      type: String,
      required: true
    },
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    changeType: {
      type: String,
      enum: ['added', 'modified', 'removed'],
      required: true
    }
  }],
  
  // Snapshot of resource data at this version
  snapshot: {
    title: String,
    description: String,
    type: String,
    category: String,
    difficulty: String,
    targetAudience: String,
    content: {
      url: String,
      text: String,
      file: String,
      duration: Number,
      wordCount: Number
    },
    author: {
      name: String,
      credentials: String,
      organization: String,
      bio: String
    },
    tags: [String],
    triggers: [String],
    contentWarning: String,
    accessibility: {
      hasTranscript: Boolean,
      hasSubtitles: Boolean,
      screenReaderFriendly: Boolean,
      alternativeFormats: [String]
    },
    qualityScore: Number,
    isVerified: Boolean
  },
  
  // Version metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  status: {
    type: String,
    enum: ['draft', 'pending_review', 'approved', 'rejected', 'archived'],
    default: 'draft'
  },
  
  isCurrentVersion: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Review and approval workflow
  reviewNotes: String,
  
  reviewHistory: [{
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      enum: ['requested_review', 'approved', 'rejected', 'requested_changes'],
      required: true
    },
    notes: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Publishing information
  publishedAt: Date,
  
  scheduledPublishAt: Date,
  
  // Rollback information
  canRollback: {
    type: Boolean,
    default: true
  },
  
  rollbackReason: String,
  
  rolledBackBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  rolledBackAt: Date,
  
  // Performance tracking for this version
  metrics: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    bookmarks: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    },
    engagementRate: {
      type: Number,
      default: 0
    }
  },
  
  // A/B testing support
  abTestGroup: {
    type: String,
    enum: ['A', 'B', 'control'],
    default: 'control'
  },
  
  abTestActive: {
    type: Boolean,
    default: false
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
ResourceVersionSchema.index({ resourceId: 1, version: 1 }, { unique: true });
ResourceVersionSchema.index({ resourceId: 1, versionNumber: -1 });
ResourceVersionSchema.index({ resourceId: 1, isCurrentVersion: 1 });
ResourceVersionSchema.index({ status: 1, createdAt: -1 });
ResourceVersionSchema.index({ createdBy: 1, status: 1 });
ResourceVersionSchema.index({ scheduledPublishAt: 1 });

// Virtual for formatted version info
ResourceVersionSchema.virtual('versionInfo').get(function() {
  return {
    version: this.version,
    number: this.versionNumber,
    type: this.changeType,
    description: this.changeDescription,
    createdAt: this.createdAt,
    isCurrent: this.isCurrentVersion
  };
});

// Virtual for change summary
ResourceVersionSchema.virtual('changeSummary').get(function() {
  const summary = {
    fieldsModified: this.changes.length,
    changeTypes: {},
    majorChanges: this.changes.filter(c => ['title', 'content.text', 'type'].includes(c.field))
  };
  
  this.changes.forEach(change => {
    summary.changeTypes[change.changeType] = (summary.changeTypes[change.changeType] || 0) + 1;
  });
  
  return summary;
});

// Instance method to create diff between versions
ResourceVersionSchema.methods.createDiff = function(otherVersion) {
  const diff = {
    versionFrom: otherVersion.version,
    versionTo: this.version,
    changes: [],
    summary: {
      added: 0,
      modified: 0,
      removed: 0
    }
  };
  
  // Compare snapshots and identify differences
  const compareObjects = (obj1, obj2, path = '') => {
    const changes = [];
    
    // Get all unique keys from both objects
    const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);
    
    for (const key of allKeys) {
      const fullPath = path ? `${path}.${key}` : key;
      const val1 = obj1?.[key];
      const val2 = obj2?.[key];
      
      if (val1 === undefined && val2 !== undefined) {
        changes.push({
          field: fullPath,
          changeType: 'added',
          oldValue: null,
          newValue: val2
        });
        diff.summary.added++;
      } else if (val1 !== undefined && val2 === undefined) {
        changes.push({
          field: fullPath,
          changeType: 'removed',
          oldValue: val1,
          newValue: null
        });
        diff.summary.removed++;
      } else if (val1 !== val2 && typeof val1 !== 'object') {
        changes.push({
          field: fullPath,
          changeType: 'modified',
          oldValue: val1,
          newValue: val2
        });
        diff.summary.modified++;
      } else if (typeof val1 === 'object' && typeof val2 === 'object') {
        changes.push(...compareObjects(val1, val2, fullPath));
      }
    }
    
    return changes;
  };
  
  diff.changes = compareObjects(otherVersion.snapshot, this.snapshot);
  return diff;
};

// Instance method to promote version to current
ResourceVersionSchema.methods.promoteToCurrentVersion = async function() {
  // Remove current version flag from all versions of this resource
  await this.constructor.updateMany(
    { resourceId: this.resourceId, isCurrentVersion: true },
    { isCurrentVersion: false }
  );
  
  // Set this version as current
  this.isCurrentVersion = true;
  this.status = 'approved';
  this.publishedAt = new Date();
  
  return this.save();
};

// Instance method to add review
ResourceVersionSchema.methods.addReview = function(reviewerId, action, notes) {
  this.reviewHistory.push({
    reviewer: reviewerId,
    action,
    notes,
    timestamp: new Date()
  });
  
  if (action === 'approved') {
    this.status = 'approved';
    this.approvedBy = reviewerId;
  } else if (action === 'rejected') {
    this.status = 'rejected';
  } else if (action === 'requested_changes') {
    this.status = 'draft';
  }
  
  this.reviewNotes = notes;
  return this.save();
};

// Static method to get version history for a resource
ResourceVersionSchema.statics.getVersionHistory = function(resourceId, options = {}) {
  const query = { resourceId };
  
  return this.find(query)
    .populate('createdBy', 'firstName lastName displayName')
    .populate('approvedBy', 'firstName lastName displayName')
    .populate('reviewHistory.reviewer', 'firstName lastName displayName')
    .sort({ versionNumber: -1 })
    .limit(options.limit || 50);
};

// Static method to get current version
ResourceVersionSchema.statics.getCurrentVersion = function(resourceId) {
  return this.findOne({ 
    resourceId, 
    isCurrentVersion: true,
    status: 'approved'
  })
    .populate('createdBy', 'firstName lastName displayName')
    .populate('approvedBy', 'firstName lastName displayName');
};

// Static method to get pending versions for review
ResourceVersionSchema.statics.getPendingReviews = function(options = {}) {
  const query = { status: 'pending_review' };
  
  return this.find(query)
    .populate('resourceId', 'title category type')
    .populate('createdBy', 'firstName lastName displayName')
    .sort({ createdAt: 1 })
    .limit(options.limit || 20);
};

// Static method to create initial version
ResourceVersionSchema.statics.createInitialVersion = async function(resource, createdBy) {
  const snapshot = {
    title: resource.title,
    description: resource.description,
    type: resource.type,
    category: resource.category,
    difficulty: resource.difficulty,
    targetAudience: resource.targetAudience,
    content: resource.content,
    author: resource.author,
    tags: resource.tags,
    triggers: resource.triggers,
    contentWarning: resource.contentWarning,
    accessibility: resource.accessibility,
    qualityScore: resource.qualityScore,
    isVerified: resource.isVerified
  };
  
  const version = await this.create({
    resourceId: resource._id,
    version: '1.0.0',
    versionNumber: 1,
    changeType: 'initial',
    changeDescription: 'Initial version of the resource',
    changes: [{
      field: 'resource',
      oldValue: null,
      newValue: 'created',
      changeType: 'added'
    }],
    snapshot,
    createdBy,
    status: 'approved',
    isCurrentVersion: true,
    publishedAt: new Date()
  });
  
  return version;
};

// Pre-save middleware to auto-increment version number
ResourceVersionSchema.pre('save', async function(next) {
  if (this.isNew && this.changeType !== 'initial') {
    // Get the latest version number for this resource
    const latestVersion = await this.constructor.findOne(
      { resourceId: this.resourceId },
      { versionNumber: 1 }
    ).sort({ versionNumber: -1 });
    
    if (latestVersion) {
      this.versionNumber = latestVersion.versionNumber + 1;
      
      // Auto-generate semantic version based on change type
      const [major, minor, patch] = latestVersion.version.split('.').map(Number);
      
      switch (this.changeType) {
        case 'major':
          this.version = `${major + 1}.0.0`;
          break;
        case 'minor':
          this.version = `${major}.${minor + 1}.0`;
          break;
        case 'patch':
          this.version = `${major}.${minor}.${patch + 1}`;
          break;
      }
    }
  }
  
  next();
});

module.exports = mongoose.model('ResourceVersion', ResourceVersionSchema);
