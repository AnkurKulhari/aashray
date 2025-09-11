const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot be more than 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  
  // Educational Information
  university: {
    type: String,
    required: [true, 'University is required'],
    trim: true
  },
  year: {
    type: String,
    enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'PhD'],
    required: [true, 'Academic year is required']
  },
  major: {
    type: String,
    required: [true, 'Major/Field of study is required'],
    trim: true
  },
  studentId: {
    type: String,
    trim: true
  },
  
  // Profile Information
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Non-binary', 'Prefer not to say'],
    required: [true, 'Gender is required']
  },
  phoneNumber: {
    type: String,
    match: [/^\+?[\d\s\-\(\)]{10,}$/, 'Please provide a valid phone number']
  },
  profilePicture: {
    type: String,
    default: ''
  },
  
  // Privacy & Preferences
  isAnonymous: {
    type: Boolean,
    default: false
  },
  displayName: {
    type: String,
    trim: true
  },
  privacySettings: {
    shareProgress: {
      type: Boolean,
      default: false
    },
    shareMoodTrends: {
      type: Boolean,
      default: false
    },
    allowPeerMatching: {
      type: Boolean,
      default: true
    },
    publicProfile: {
      type: Boolean,
      default: false
    }
  },
  
  // Notification Preferences
  notificationSettings: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    dailyReminders: {
      type: Boolean,
      default: true
    },
    weeklyReports: {
      type: Boolean,
      default: true
    },
    emergencyAlerts: {
      type: Boolean,
      default: true
    }
  },
  
  // Mental Health Information
  mentalHealthHistory: {
    previousTherapy: {
      type: Boolean,
      default: false
    },
    currentMedication: {
      type: Boolean,
      default: false
    },
    diagnosedConditions: [{
      condition: String,
      diagnosedDate: Date,
      isActive: { type: Boolean, default: true }
    }],
    emergencyContact: {
      name: String,
      relationship: String,
      phoneNumber: String,
      email: String
    },
    therapistContact: {
      name: String,
      phoneNumber: String,
      email: String
    }
  },
  
  // Crisis Management
  crisisHistory: [{
    date: { type: Date, default: Date.now },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true
    },
    action: String,
    resolved: { type: Boolean, default: false },
    notes: String
  }],
  
  safetyPlan: {
    warningSignsPersonal: [String],
    copingStrategies: [String],
    socialSupports: [{
      name: String,
      relationship: String,
      phoneNumber: String
    }],
    professionalContacts: [{
      name: String,
      type: String, // therapist, counselor, doctor
      phoneNumber: String,
      available24h: { type: Boolean, default: false }
    }],
    environmentalSafety: [String],
    reasonsForLiving: [String]
  },
  
  // Gamification
  points: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  achievements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement'
  }],
  streaks: {
    currentMoodLogging: { type: Number, default: 0 },
    longestMoodLogging: { type: Number, default: 0 },
    currentGoalCompletion: { type: Number, default: 0 },
    longestGoalCompletion: { type: Number, default: 0 }
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: Date,
  
  // Account Recovery
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  // AI Insights
  aiInsights: {
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    lastAssessment: Date,
    personalityProfile: {
      openness: Number,
      conscientiousness: Number,
      extraversion: Number,
      agreeableness: Number,
      neuroticism: Number
    },
    recommendedActivities: [String],
    triggerPatterns: [{
      trigger: String,
      frequency: Number,
      lastOccurrence: Date
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
UserSchema.index({ email: 1 });
UserSchema.index({ university: 1 });
UserSchema.index({ 'aiInsights.riskScore': -1 });
UserSchema.index({ points: -1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
UserSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
  // Only run if password was modified
  if (!this.isModified('password')) return next();
  
  // Hash password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Pre-save middleware to set display name for anonymous users
UserSchema.pre('save', function(next) {
  if (this.isAnonymous && !this.displayName) {
    this.displayName = `Anonymous${Math.floor(Math.random() * 10000)}`;
  }
  next();
});

// Instance method to check password
UserSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to check if password was changed after JWT was issued
UserSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Instance method to create password reset token
UserSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Instance method to create email verification token
UserSchema.methods.createEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
    
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return verificationToken;
};

// Instance method to calculate points for level
UserSchema.methods.calculateLevel = function() {
  // Level up every 1000 points
  return Math.floor(this.points / 1000) + 1;
};

// Instance method to add points
UserSchema.methods.addPoints = function(points, reason) {
  this.points += points;
  const newLevel = this.calculateLevel();
  
  // Check if level up occurred
  const leveledUp = newLevel > this.level;
  this.level = newLevel;
  
  return { leveledUp, newLevel, totalPoints: this.points };
};

module.exports = mongoose.model('User', UserSchema);
