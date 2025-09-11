const mongoose = require('mongoose');

// Emergency Contact Schema for helplines and crisis centers
const emergencyContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  textNumber: {
    type: String,
    default: null
  },
  website: {
    type: String,
    default: null
  },
  email: {
    type: String,
    default: null
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: [
      'suicide_prevention',
      'crisis_counseling',
      'domestic_violence',
      'substance_abuse',
      'mental_health',
      'lgbtq_support',
      'eating_disorders',
      'general_emergency',
      'youth_support',
      'veteran_support'
    ],
    required: true
  },
  availability: {
    type: String,
    enum: ['24/7', 'business_hours', 'weekdays', 'weekends', 'custom'],
    default: '24/7'
  },
  customHours: {
    type: String,
    default: null
  },
  languages: [{
    type: String,
    default: ['English']
  }],
  country: {
    type: String,
    default: 'US'
  },
  region: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  }
}, {
  timestamps: true
});

// Emergency Log Schema to track emergency situations
const emergencyLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'emergency_button_press',
      'crisis_text_detected',
      'severe_mood_pattern',
      'user_reported_crisis',
      'system_alert',
      'helpline_call',
      'emergency_contact_reached'
    ],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  triggerData: {
    moodEntryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MoodEntry',
      default: null
    },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal',
      default: null
    },
    communityPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommunityPost',
      default: null
    },
    textContent: String,
    location: {
      latitude: Number,
      longitude: Number
    },
    metadata: mongoose.Schema.Types.Mixed
  },
  responseActions: [{
    action: {
      type: String,
      enum: [
        'resources_provided',
        'emergency_contacts_shown',
        'helpline_suggested',
        'crisis_counselor_notified',
        'emergency_services_called',
        'user_redirected_to_safety',
        'follow_up_scheduled'
      ]
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String,
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmergencyContact',
      default: null
    }
  }],
  isResolved: {
    type: Boolean,
    default: false
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  resolvedBy: {
    type: String,
    enum: ['user', 'system', 'counselor', 'automated'],
    default: null
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Crisis Detection Configuration Schema
const crisisDetectionConfigSchema = new mongoose.Schema({
  keywords: {
    critical: [{
      word: String,
      weight: {
        type: Number,
        min: 1,
        max: 10,
        default: 10
      }
    }],
    warning: [{
      word: String,
      weight: {
        type: Number,
        min: 1,
        max: 10,
        default: 5
      }
    }],
    concerning: [{
      word: String,
      weight: {
        type: Number,
        min: 1,
        max: 10,
        default: 3
      }
    }]
  },
  thresholds: {
    critical: {
      type: Number,
      default: 8
    },
    high: {
      type: Number,
      default: 6
    },
    medium: {
      type: Number,
      default: 4
    }
  },
  patterns: [{
    name: String,
    regex: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    description: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// User Emergency Settings Schema
const userEmergencySettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  emergencyContacts: [{
    name: {
      type: String,
      required: true
    },
    relationship: {
      type: String,
      enum: ['family', 'friend', 'partner', 'therapist', 'doctor', 'other'],
      required: true
    },
    phoneNumber: {
      type: String,
      required: true
    },
    email: String,
    isPrimary: {
      type: Boolean,
      default: false
    },
    canReceiveAlerts: {
      type: Boolean,
      default: true
    }
  }],
  preferences: {
    enableCrisisDetection: {
      type: Boolean,
      default: true
    },
    autoCallEmergencyServices: {
      type: Boolean,
      default: false
    },
    shareLocationInCrisis: {
      type: Boolean,
      default: false
    },
    allowEmergencyContactNotification: {
      type: Boolean,
      default: true
    },
    preferredHelplineLanguage: {
      type: String,
      default: 'English'
    },
    crisisSensitivity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  },
  medicalInfo: {
    allergies: [String],
    medications: [String],
    medicalConditions: [String],
    emergencyMedicalInfo: String
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add indexes for performance
emergencyContactSchema.index({ category: 1, country: 1, isActive: 1 });
emergencyContactSchema.index({ priority: -1 });

emergencyLogSchema.index({ userId: 1, createdAt: -1 });
emergencyLogSchema.index({ type: 1, severity: 1 });
emergencyLogSchema.index({ isResolved: 1, followUpRequired: 1 });

userEmergencySettingsSchema.index({ userId: 1 });

// Create models
const EmergencyContact = mongoose.model('EmergencyContact', emergencyContactSchema);
const EmergencyLog = mongoose.model('EmergencyLog', emergencyLogSchema);
const CrisisDetectionConfig = mongoose.model('CrisisDetectionConfig', crisisDetectionConfigSchema);
const UserEmergencySettings = mongoose.model('UserEmergencySettings', userEmergencySettingsSchema);

module.exports = {
  EmergencyContact,
  EmergencyLog,
  CrisisDetectionConfig,
  UserEmergencySettings
};
