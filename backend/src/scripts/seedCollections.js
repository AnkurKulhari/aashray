const mongoose = require('mongoose');
const Collection = require('../models/Collection');
const Resource = require('../models/Resource');
const User = require('../models/User');
require('dotenv').config();

const sampleCollections = [
  {
    title: 'Anxiety Management Essentials',
    description: 'A comprehensive collection of resources to help you understand and manage anxiety effectively. This curated collection includes breathing exercises, cognitive techniques, and practical strategies for daily life.',
    type: 'curated',
    category: 'anxiety',
    coverImage: {
      url: 'https://example.com/anxiety-collection-cover.jpg',
      alt: 'Anxiety Management Resources'
    },
    color: '#E3F2FD',
    icon: '🧘‍♀️',
    targetAudience: 'students',
    tags: ['anxiety', 'breathing', 'coping', 'mindfulness', 'stress-relief'],
    visibility: 'public',
    status: 'published',
    isFeatured: true,
    isPromoted: true
  },
  
  {
    title: 'Building Mental Resilience: A Learning Path',
    description: 'A structured 4-week learning path designed to help you develop mental resilience through evidence-based techniques and practices. Perfect for students facing academic and life challenges.',
    type: 'learning_path',
    category: 'coping_skills',
    coverImage: {
      url: 'https://example.com/resilience-path-cover.jpg',
      alt: 'Mental Resilience Learning Path'
    },
    color: '#F3E5F5',
    icon: '💪',
    targetAudience: 'students',
    tags: ['resilience', 'coping', 'strength', 'recovery', 'growth'],
    visibility: 'public',
    status: 'published',
    isFeatured: true,
    learningPath: {
      isLearningPath: true,
      difficulty: 'intermediate',
      estimatedDuration: {
        total: 480, // 8 hours total
        sessions: 8,
        sessionLength: 60
      },
      objectives: [
        'Understand the fundamentals of mental resilience',
        'Learn practical resilience-building techniques',
        'Develop a personal resilience action plan',
        'Practice mindfulness and stress management'
      ],
      skills: ['Stress management', 'Emotional regulation', 'Problem-solving', 'Self-awareness'],
      certificate: {
        available: true,
        title: 'Mental Resilience Certification',
        description: 'Certificate of completion for the Building Mental Resilience learning path'
      }
    }
  },
  
  {
    title: 'Sleep Better Tonight',
    description: 'Transform your sleep habits with this targeted collection of sleep hygiene resources, relaxation techniques, and bedtime strategies specifically designed for busy students.',
    type: 'curated',
    category: 'sleep',
    coverImage: {
      url: 'https://example.com/sleep-collection-cover.jpg',
      alt: 'Sleep Health Resources'
    },
    color: '#E8F5E8',
    icon: '😴',
    targetAudience: 'students',
    tags: ['sleep', 'insomnia', 'relaxation', 'bedtime', 'rest'],
    visibility: 'public',
    status: 'published',
    isFeatured: false,
    isPromoted: true
  },
  
  {
    title: 'Depression Support Network',
    description: 'A carefully curated collection of resources for understanding and managing depression, including professional insights, peer stories, and practical coping strategies.',
    type: 'curated',
    category: 'depression',
    coverImage: {
      url: 'https://example.com/depression-support-cover.jpg',
      alt: 'Depression Support Resources'
    },
    color: '#FFF3E0',
    icon: '🌅',
    targetAudience: 'students',
    tags: ['depression', 'support', 'recovery', 'therapy', 'community'],
    visibility: 'public',
    status: 'published',
    isFeatured: true,
    isPromoted: false
  },
  
  {
    title: 'Mindfulness for Students: 21-Day Journey',
    description: 'Embark on a transformative 21-day mindfulness journey designed specifically for students. Learn meditation, mindful breathing, and present-moment awareness techniques.',
    type: 'learning_path',
    category: 'mindfulness',
    coverImage: {
      url: 'https://example.com/mindfulness-journey-cover.jpg',
      alt: 'Mindfulness Journey'
    },
    color: '#E1F5FE',
    icon: '🧘',
    targetAudience: 'students',
    tags: ['mindfulness', 'meditation', 'awareness', 'calm', 'focus'],
    visibility: 'public',
    status: 'published',
    isFeatured: false,
    isPromoted: true,
    learningPath: {
      isLearningPath: true,
      difficulty: 'beginner',
      estimatedDuration: {
        total: 315, // 5.25 hours total
        sessions: 21,
        sessionLength: 15
      },
      objectives: [
        'Establish a daily mindfulness practice',
        'Learn basic meditation techniques',
        'Develop present-moment awareness',
        'Apply mindfulness to daily activities'
      ],
      skills: ['Meditation', 'Stress reduction', 'Focus improvement', 'Emotional awareness']
    }
  },
  
  {
    title: 'Crisis Support Resources',
    description: 'Essential crisis support resources including emergency contacts, immediate coping strategies, and professional help options available 24/7 for students in crisis.',
    type: 'crisis_support',
    category: 'crisis',
    coverImage: {
      url: 'https://example.com/crisis-support-cover.jpg',
      alt: 'Crisis Support Resources'
    },
    color: '#FFEBEE',
    icon: '🆘',
    targetAudience: 'students',
    tags: ['crisis', 'emergency', 'support', 'help', 'safety'],
    visibility: 'public',
    status: 'published',
    isFeatured: true,
    isPromoted: true
  },
  
  {
    title: 'Academic Stress Solutions',
    description: 'Tackle academic stress head-on with proven strategies for time management, study techniques, exam preparation, and maintaining work-life balance.',
    type: 'topic_series',
    category: 'academic_stress',
    coverImage: {
      url: 'https://example.com/academic-stress-cover.jpg',
      alt: 'Academic Stress Management'
    },
    color: '#F9FBE7',
    icon: '📚',
    targetAudience: 'students',
    tags: ['academic', 'stress', 'study', 'exams', 'time-management'],
    visibility: 'public',
    status: 'published',
    isFeatured: false,
    isPromoted: false
  },
  
  {
    title: 'Building Healthy Relationships',
    description: 'Learn to build and maintain healthy relationships during your college years. Covers communication skills, boundary setting, and dealing with relationship challenges.',
    type: 'curated',
    category: 'relationships',
    coverImage: {
      url: 'https://example.com/relationships-cover.jpg',
      alt: 'Healthy Relationships Guide'
    },
    color: '#FCE4EC',
    icon: '💝',
    targetAudience: 'students',
    tags: ['relationships', 'communication', 'boundaries', 'social', 'dating'],
    visibility: 'public',
    status: 'published',
    isFeatured: false,
    isPromoted: true
  },
  
  {
    title: 'Self-Care Fundamentals',
    description: 'Master the art of self-care with practical strategies for physical, emotional, and mental well-being. Essential skills every student needs to thrive.',
    type: 'curated',
    category: 'self_care',
    coverImage: {
      url: 'https://example.com/self-care-cover.jpg',
      alt: 'Self-Care Resources'
    },
    color: '#F1F8E9',
    icon: '🌿',
    targetAudience: 'students',
    tags: ['self-care', 'wellness', 'health', 'balance', 'routine'],
    visibility: 'public',
    status: 'published',
    isFeatured: false,
    isPromoted: false
  },
  
  {
    title: 'Exam Season Survival Kit',
    description: 'Navigate exam periods with confidence using this seasonal collection of stress management techniques, study strategies, and wellness practices.',
    type: 'seasonal',
    category: 'academic_stress',
    coverImage: {
      url: 'https://example.com/exam-season-cover.jpg',
      alt: 'Exam Season Resources'
    },
    color: '#FFF8E1',
    icon: '📝',
    targetAudience: 'students',
    tags: ['exams', 'stress', 'study', 'preparation', 'wellness'],
    visibility: 'public',
    status: 'published',
    isFeatured: false,
    isPromoted: true,
    seasonal: {
      isseasonal: true,
      season: 'exam_period',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-06-30')
    }
  }
];

// Function to get system user
const getSystemUser = async () => {
  let systemUser = await User.findOne({ email: 'system@aashray.com' });
  
  if (!systemUser) {
    systemUser = await User.create({
      firstName: 'System',
      lastName: 'Admin',
      email: 'system@aashray.com',
      password: 'SystemPassword123!',
      role: 'admin',
      university: 'System',
      year: 'Graduate',
      major: 'System Administration',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'Prefer not to say',
      isVerified: true
    });
    console.log('System user created for collection seeding');
  }
  
  return systemUser;
};

// Function to get random resources by category
const getResourcesByCategory = async (category, limit = 3) => {
  const resources = await Resource.find({
    category,
    isActive: true,
    moderationStatus: 'approved'
  }).limit(limit);
  
  return resources;
};

// Main seeding function
const seedCollections = async () => {
  try {
    // Connect to MongoDB
    const mongoUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/aashray-dev';
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB for collection seeding');

    // Get system user
    const systemUser = await getSystemUser();

    // Clear existing collections (optional - comment out in production)
    await Collection.deleteMany({});
    console.log('Cleared existing collections');

    // Process collections and add resources
    const processedCollections = [];
    
    for (const collectionData of sampleCollections) {
      // Get relevant resources for this collection's category
      const categoryResources = await getResourcesByCategory(collectionData.category, 5);
      
      const resources = categoryResources.map((resource, index) => ({
        resource: resource._id,
        order: index,
        isOptional: index >= 3, // First 3 are required, rest are optional
        completionCriteria: {
          mustView: true,
          mustRate: collectionData.type === 'learning_path',
          mustComment: false
        },
        notes: `Resource ${index + 1} in the ${collectionData.title} collection`,
        estimatedTime: collectionData.type === 'learning_path' ? 30 : 10
      }));

      processedCollections.push({
        ...collectionData,
        curator: systemUser._id,
        moderationStatus: 'approved',
        resources: resources,
        publishDate: new Date(),
        isActive: true
      });
    }

    // Insert collections
    const insertedCollections = await Collection.insertMany(processedCollections);
    console.log(`Successfully seeded ${insertedCollections.length} collections`);

    // Log summary by type and category
    const typeSummary = {};
    const categorySummary = {};
    
    insertedCollections.forEach(collection => {
      typeSummary[collection.type] = (typeSummary[collection.type] || 0) + 1;
      categorySummary[collection.category] = (categorySummary[collection.category] || 0) + 1;
    });

    console.log('\nCollections by type:');
    Object.entries(typeSummary).forEach(([type, count]) => {
      console.log(`- ${type}: ${count} collections`);
    });
    
    console.log('\nCollections by category:');
    Object.entries(categorySummary).forEach(([category, count]) => {
      console.log(`- ${category}: ${count} collections`);
    });

    console.log('\nFeatured collections:');
    insertedCollections.filter(c => c.isFeatured).forEach(collection => {
      console.log(`- ${collection.title} (${collection.type} - ${collection.category})`);
    });

    console.log('\nCollection seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding collections:', error);
    process.exit(1);
  }
};

// Run the seeding function
if (require.main === module) {
  seedCollections();
}

module.exports = { seedCollections };
