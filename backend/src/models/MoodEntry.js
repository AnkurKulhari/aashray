const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

const MoodEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Core Mood Data
  mood: {
    type: String,
    enum: ['very_happy', 'happy', 'neutral', 'sad', 'very_sad', 'angry', 'anxious', 'stressed', 'calm', 'excited'],
    required: [true, 'Mood is required']
  },
  
  intensity: {
    type: Number,
    min: [1, 'Intensity must be at least 1'],
    max: [10, 'Intensity cannot be more than 10'],
    required: [true, 'Mood intensity is required']
  },
  
  // Emotional Dimensions (based on circumplex model)
  valence: {
    type: Number,
    min: -5,
    max: 5,
    default: 0 // negative to positive
  },
  
  arousal: {
    type: Number,
    min: -5,
    max: 5,
    default: 0 // calm to excited
  },
  
  // Context Information
  location: {
    type: String,
    enum: ['home', 'university', 'dormitory', 'library', 'gym', 'outdoors', 'social_event', 'work', 'other'],
    default: 'other'
  },
  
  activity: {
    type: String,
    enum: ['studying', 'socializing', 'exercising', 'sleeping', 'eating', 'working', 'relaxing', 'commuting', 'attending_class', 'other'],
    default: 'other'
  },
  
  socialContext: {
    type: String,
    enum: ['alone', 'with_friends', 'with_family', 'with_partner', 'with_classmates', 'in_group', 'other'],
    default: 'alone'
  },
  
  // Triggers and Factors
  triggers: [{
    type: String,
    enum: [
      'academic_stress', 'financial_stress', 'relationship_issues', 'family_problems',
      'health_concerns', 'social_anxiety', 'loneliness', 'homesickness',
      'career_uncertainty', 'time_pressure', 'conflict', 'rejection',
      'achievement', 'social_connection', 'physical_activity', 'good_news',
      'accomplishment', 'relaxation', 'nature', 'music', 'other'
    ]
  }],
  
  stressLevel: {
    type: Number,
    min: [1, 'Stress level must be at least 1'],
    max: [10, 'Stress level cannot be more than 10'],
    default: 5
  },
  
  energyLevel: {
    type: Number,
    min: [1, 'Energy level must be at least 1'],
    max: [10, 'Energy level cannot be more than 10'],
    default: 5
  },
  
  sleepQuality: {
    type: Number,
    min: [1, 'Sleep quality must be at least 1'],
    max: [10, 'Sleep quality cannot be more than 10']
  },
  
  // Descriptive Information
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  
  gratitude: [{
    type: String,
    maxlength: [200, 'Gratitude entry cannot be more than 200 characters']
  }],
  
  copingStrategiesUsed: [{
    strategy: String,
    effectiveness: {
      type: Number,
      min: 1,
      max: 5
    }
  }],
  
  // Weather and Environmental Factors
  weather: {
    type: String,
    enum: ['sunny', 'cloudy', 'rainy', 'stormy', 'snowy', 'foggy', 'windy', 'other']
  },
  
  temperature: {
    type: String,
    enum: ['very_cold', 'cold', 'cool', 'mild', 'warm', 'hot', 'very_hot']
  },
  
  // Academic Context
  academicPressure: {
    type: Number,
    min: [1, 'Academic pressure must be at least 1'],
    max: [10, 'Academic pressure cannot be more than 10']
  },
  
  upcomingDeadlines: {
    type: Number,
    default: 0
  },
  
  // Physical Health Indicators
  physicalSymptoms: [{
    type: String,
    enum: [
      'headache', 'fatigue', 'muscle_tension', 'stomach_issues',
      'chest_tightness', 'shortness_of_breath', 'dizziness',
      'appetite_changes', 'sleep_disturbance', 'other'
    ]
  }],
  
  // AI Analysis Results
  aiAnalysis: {
    sentimentScore: {
      type: Number,
      min: -1,
      max: 1
    },
    emotionalPatterns: [String],
    riskIndicators: [{
      indicator: String,
      confidence: Number,
      severity: {
        type: String,
        enum: ['low', 'medium', 'high']
      }
    }],
    recommendations: [String],
    similarPatterns: [{
      date: Date,
      similarity: Number
    }],
    trendsIdentified: [String]
  },
  
  // Metadata
  entryType: {
    type: String,
    enum: ['manual', 'prompt_response', 'ai_suggested', 'emergency'],
    default: 'manual'
  },
  
  isPrivate: {
    type: Boolean,
    default: false
  },
  
  responseTime: {
    type: Number, // in seconds
    min: 0
  },
  
  completionPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  
  // Validation and Quality
  flagged: {
    type: Boolean,
    default: false
  },
  
  flagReason: {
    type: String,
    enum: ['inappropriate_content', 'crisis_indicator', 'data_quality', 'spam']
  },
  
  verified: {
    type: Boolean,
    default: false
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance and queries
MoodEntrySchema.index({ user: 1, createdAt: -1 });
MoodEntrySchema.index({ mood: 1, intensity: 1 });
MoodEntrySchema.index({ 'aiAnalysis.riskIndicators.severity': 1 });
MoodEntrySchema.index({ triggers: 1 });
MoodEntrySchema.index({ stressLevel: -1 });
MoodEntrySchema.index({ createdAt: -1 });
MoodEntrySchema.index({ user: 1, mood: 1, createdAt: -1 });

// Compound index for trend analysis
MoodEntrySchema.index({ 
  user: 1, 
  createdAt: -1, 
  mood: 1, 
  intensity: 1 
});

// Virtual for mood category (simplified grouping)
MoodEntrySchema.virtual('moodCategory').get(function() {
  const positiveMonods = ['very_happy', 'happy', 'calm', 'excited'];
  const negativeMonods = ['very_sad', 'sad', 'angry', 'anxious', 'stressed'];
  
  if (positiveMonods.includes(this.mood)) {
    return 'positive';
  } else if (negativeMonods.includes(this.mood)) {
    return 'negative';
  }
  return 'neutral';
});

// Virtual for mood score (numerical representation)
MoodEntrySchema.virtual('moodScore').get(function() {
  const moodScores = {
    'very_sad': 1,
    'sad': 2,
    'anxious': 2.5,
    'stressed': 2.5,
    'angry': 3,
    'neutral': 5,
    'calm': 6,
    'happy': 8,
    'excited': 8.5,
    'very_happy': 10
  };
  return moodScores[this.mood] || 5;
});

// Virtual for overall wellbeing score
MoodEntrySchema.virtual('wellbeingScore').get(function() {
  const moodScore = this.moodScore;
  const stressContribution = (10 - this.stressLevel) * 0.3;
  const energyContribution = this.energyLevel * 0.2;
  const sleepContribution = this.sleepQuality ? this.sleepQuality * 0.2 : 5;
  
  return Math.round(
    (moodScore * 0.4 + stressContribution + energyContribution + sleepContribution) / 1.1
  );
});

// Static method to get mood trends for a user
MoodEntrySchema.statics.getMoodTrends = function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$createdAt'
          }
        },
        averageMood: { $avg: '$intensity' },
        averageStress: { $avg: '$stressLevel' },
        averageEnergy: { $avg: '$energyLevel' },
        entryCount: { $sum: 1 },
        moods: { $push: '$mood' }
      }
    },
    {
      $sort: { '_id': 1 }
    }
  ]);
};

// Static method to identify patterns
MoodEntrySchema.statics.identifyPatterns = function(userId, days = 90) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          trigger: '$triggers',
          location: '$location',
          activity: '$activity',
          dayOfWeek: { $dayOfWeek: '$createdAt' },
          hourOfDay: { $hour: '$createdAt' }
        },
        averageMood: { $avg: '$intensity' },
        count: { $sum: 1 }
      }
    },
    {
      $match: { count: { $gte: 3 } } // Only patterns with at least 3 occurrences
    },
    {
      $sort: { count: -1, averageMood: 1 }
    }
  ]);
};

// Static method to get risk assessment
MoodEntrySchema.statics.getRiskAssessment = function(userId, days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        averageMood: { $avg: '$intensity' },
        averageStress: { $avg: '$stressLevel' },
        lowMoodDays: {
          $sum: {
            $cond: [{ $lte: ['$intensity', 3] }, 1, 0]
          }
        },
        highStressDays: {
          $sum: {
            $cond: [{ $gte: ['$stressLevel', 8] }, 1, 0]
          }
        },
        crisisIndicators: {
          $sum: {
            $cond: [
              {
                $or: [
                  { $in: ['self_harm', '$triggers'] },
                  { $in: ['suicidal_thoughts', '$triggers'] },
                  { $and: [{ $lte: ['$intensity', 2] }, { $gte: ['$stressLevel', 9] }] }
                ]
              },
              1,
              0
            ]
          }
        },
        totalEntries: { $sum: 1 }
      }
    }
  ]);
};

// Pre-save middleware to calculate AI analysis if not provided
MoodEntrySchema.pre('save', function(next) {
  if (!this.aiAnalysis.sentimentScore) {
    // Simple sentiment calculation based on mood and intensity
    const moodScore = this.moodScore;
    this.aiAnalysis.sentimentScore = (moodScore - 5.5) / 4.5; // Normalize to -1 to 1
  }
  
  // Set valence and arousal if not provided
  if (this.valence === 0 && this.arousal === 0) {
    const moodMap = {
      'very_happy': { valence: 4, arousal: 3 },
      'happy': { valence: 3, arousal: 1 },
      'excited': { valence: 3, arousal: 4 },
      'calm': { valence: 2, arousal: -3 },
      'neutral': { valence: 0, arousal: 0 },
      'sad': { valence: -3, arousal: -2 },
      'very_sad': { valence: -4, arousal: -3 },
      'anxious': { valence: -2, arousal: 3 },
      'stressed': { valence: -2, arousal: 2 },
      'angry': { valence: -3, arousal: 4 }
    };
    
    if (moodMap[this.mood]) {
      this.valence = moodMap[this.mood].valence;
      this.arousal = moodMap[this.mood].arousal;
    }
  }
  
  next();
});

// Apply pagination plugin
MoodEntrySchema.plugin(aggregatePaginate);

module.exports = mongoose.model('MoodEntry', MoodEntrySchema);
