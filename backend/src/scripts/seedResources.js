const mongoose = require('mongoose');
const Resource = require('../models/Resource');
const User = require('../models/User');
require('dotenv').config();

// Function to create a system admin user for seeding
const createSystemUser = async () => {
  try {
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
      console.log('System user created for seeding');
    }
    
    return systemUser;
  } catch (error) {
    console.error('Error creating system user:', error);
    throw error;
  }
};

const sampleResources = [
  {
    title: 'Managing Academic Stress: A Student\'s Guide',
    description: 'Comprehensive guide covering effective strategies for managing academic pressure, time management, and maintaining mental wellness during your studies.',
    type: 'article',
    category: 'academic_stress',
    difficulty: 'beginner',
    targetAudience: 'students',
    content: {
      text: 'Academic stress is one of the most common challenges faced by students today...',
      wordCount: 1200
    },
    author: {
      name: 'Dr. Sarah Johnson',
      credentials: 'PhD in Psychology',
      organization: 'Student Wellness Institute',
      bio: 'Clinical psychologist specializing in student mental health'
    },
    tags: ['stress management', 'academic pressure', 'time management', 'study tips'],
    moderationStatus: 'approved',
    qualityScore: 4.5,
    accessibility: {
      hasTranscript: false,
      hasSubtitles: false,
      screenReaderFriendly: true,
      alternativeFormats: ['PDF']
    }
  },
  
  {
    title: '5-Minute Breathing Exercise for Anxiety',
    description: 'Quick and effective breathing technique to help reduce anxiety and promote relaxation. Perfect for use before exams or stressful situations.',
    type: 'audio',
    category: 'anxiety',
    difficulty: 'beginner',
    targetAudience: 'students',
    content: {
      url: 'https://example.com/breathing-exercise.mp3',
      duration: 5
    },
    author: {
      name: 'Mark Thompson',
      credentials: 'Licensed Counselor',
      organization: 'Mindfulness Center',
      bio: 'Certified mindfulness instructor and mental health counselor'
    },
    tags: ['breathing exercises', 'anxiety relief', 'mindfulness', 'quick help'],
    moderationStatus: 'approved',
    qualityScore: 4.8,
    accessibility: {
      hasTranscript: true,
      screenReaderFriendly: true
    }
  },
  
  {
    title: 'Building Healthy Sleep Habits in College',
    description: 'Learn the importance of sleep for mental health and discover practical strategies to improve your sleep quality despite a busy college schedule.',
    type: 'video',
    category: 'sleep',
    difficulty: 'beginner',
    targetAudience: 'students',
    content: {
      url: 'https://example.com/sleep-habits-video',
      duration: 15
    },
    author: {
      name: 'Dr. Emily Chen',
      credentials: 'Sleep Medicine Specialist',
      organization: 'University Health Center',
      bio: 'Sleep researcher and physician specializing in student health'
    },
    tags: ['sleep hygiene', 'college life', 'mental health', 'wellness'],
    moderationStatus: 'approved',
    qualityScore: 4.6,
    accessibility: {
      hasTranscript: true,
      hasSubtitles: true,
      screenReaderFriendly: true
    }
  },
  
  {
    title: 'Depression Screening Self-Assessment',
    description: 'Confidential self-assessment tool to help you understand your mental health status. Please remember this is not a substitute for professional diagnosis.',
    type: 'assessment',
    category: 'depression',
    difficulty: 'intermediate',
    targetAudience: 'students',
    content: {
      text: 'This assessment uses the PHQ-9 screening tool...'
    },
    author: {
      name: 'Mental Health Alliance',
      organization: 'Student Support Services',
      bio: 'Collaborative effort by mental health professionals'
    },
    tags: ['self-assessment', 'depression screening', 'mental health check'],
    triggers: ['depression', 'medical_content'],
    contentWarning: 'This assessment discusses symptoms of depression and may be triggering for some users.',
    moderationStatus: 'approved',
    qualityScore: 4.7
  },
  
  {
    title: 'Mindfulness for Students Podcast Series',
    description: 'Weekly podcast exploring mindfulness practices, stress reduction techniques, and mental wellness strategies specifically designed for student life.',
    type: 'podcast',
    category: 'mindfulness',
    difficulty: 'beginner',
    targetAudience: 'students',
    content: {
      url: 'https://example.com/mindfulness-podcast',
      duration: 25
    },
    author: {
      name: 'Rachel Martinez',
      credentials: 'MBSR Certified Instructor',
      organization: 'Campus Wellness Program',
      bio: 'Mindfulness educator and former college counselor'
    },
    tags: ['mindfulness', 'meditation', 'stress relief', 'student life'],
    moderationStatus: 'approved',
    qualityScore: 4.4,
    accessibility: {
      hasTranscript: true,
      screenReaderFriendly: true
    }
  },
  
  {
    title: 'Crisis Support Resources and Emergency Contacts',
    description: 'Comprehensive list of crisis support resources, emergency contacts, and immediate help options available to students 24/7.',
    type: 'guide',
    category: 'crisis',
    difficulty: 'beginner',
    targetAudience: 'students',
    content: {
      text: 'If you are in immediate danger, please call 911...',
      wordCount: 800
    },
    author: {
      name: 'Student Crisis Support Team',
      organization: 'National Student Mental Health Coalition',
      bio: 'Dedicated team of crisis intervention specialists'
    },
    tags: ['crisis support', 'emergency resources', 'help', 'safety'],
    triggers: ['suicide', 'self_harm', 'crisis'],
    contentWarning: 'This resource discusses crisis situations and may contain triggering content.',
    moderationStatus: 'approved',
    qualityScore: 5.0,
    accessibility: {
      screenReaderFriendly: true,
      alternativeFormats: ['Large Print', 'Audio']
    }
  },
  
  {
    title: 'Social Anxiety Coping Strategies Worksheet',
    description: 'Interactive worksheet with practical exercises and techniques for managing social anxiety in academic and social situations.',
    type: 'worksheet',
    category: 'social_skills',
    difficulty: 'intermediate',
    targetAudience: 'students',
    content: {
      file: 'https://example.com/social-anxiety-worksheet.pdf'
    },
    author: {
      name: 'Dr. Michael Rodriguez',
      credentials: 'Clinical Psychologist',
      organization: 'Anxiety Treatment Center',
      bio: 'Specializes in anxiety disorders and cognitive behavioral therapy'
    },
    tags: ['social anxiety', 'coping skills', 'worksheets', 'CBT techniques'],
    moderationStatus: 'approved',
    qualityScore: 4.3,
    accessibility: {
      screenReaderFriendly: true,
      alternativeFormats: ['Word Document', 'Large Print']
    }
  },
  
  {
    title: 'Understanding and Supporting LGBTQ+ Students',
    description: 'Educational resource for creating inclusive environments and understanding the unique mental health challenges faced by LGBTQ+ students.',
    type: 'article',
    category: 'self_esteem',
    difficulty: 'intermediate',
    targetAudience: 'general',
    content: {
      text: 'Creating inclusive spaces for LGBTQ+ students requires understanding...',
      wordCount: 1500
    },
    author: {
      name: 'LGBTQ+ Student Support Alliance',
      organization: 'Diversity and Inclusion Institute',
      bio: 'Coalition of educators and mental health advocates'
    },
    tags: ['LGBTQ+', 'diversity', 'inclusion', 'support', 'identity'],
    moderationStatus: 'approved',
    qualityScore: 4.7
  },
  
  // Additional comprehensive mental health resources
  {
    title: 'Building Resilience: Bouncing Back from Setbacks',
    description: 'Learn practical strategies for developing psychological resilience and recovering from academic, personal, and social challenges.',
    type: 'guide',
    category: 'coping_skills',
    difficulty: 'intermediate',
    targetAudience: 'students',
    content: {
      text: 'Resilience is the ability to adapt and bounce back when things don\'t go as planned. For students, this skill is crucial for navigating academic challenges, relationship issues, and life transitions...',
      wordCount: 2800
    },
    author: {
      name: 'Dr. Amanda Chen',
      credentials: 'PhD Positive Psychology',
      organization: 'Resilience Research Institute'
    },
    tags: ['resilience', 'coping', 'recovery', 'strength', 'adaptation'],
    moderationStatus: 'approved',
    qualityScore: 4.6
  },
  
  {
    title: 'Nutrition and Mental Health: The Food-Mood Connection',
    description: 'Discover how dietary choices impact mental well-being and learn practical nutrition tips for supporting your mental health.',
    type: 'article',
    category: 'physical_health',
    difficulty: 'beginner',
    targetAudience: 'students',
    content: {
      text: 'The relationship between nutrition and mental health is complex but significant. Research shows that certain nutrients can support brain function and emotional well-being...',
      wordCount: 2200
    },
    author: {
      name: 'Dr. Maria Santos',
      credentials: 'RD, PhD Nutritional Psychiatry',
      organization: 'Nutrition and Mental Health Center'
    },
    tags: ['nutrition', 'diet', 'brain health', 'wellness', 'food'],
    moderationStatus: 'approved',
    qualityScore: 4.4
  },
  
  {
    title: 'Managing Study Burnout: Prevention and Recovery',
    description: 'Recognize the signs of academic burnout and learn evidence-based strategies for prevention and recovery.',
    type: 'video',
    category: 'academic_stress',
    difficulty: 'intermediate',
    targetAudience: 'students',
    content: {
      url: 'https://example.com/burnout-management-video',
      duration: 18
    },
    author: {
      name: 'Dr. James Wilson',
      credentials: 'PhD Educational Psychology',
      organization: 'Academic Wellness Institute'
    },
    tags: ['burnout', 'academic stress', 'recovery', 'prevention'],
    moderationStatus: 'approved',
    qualityScore: 4.7,
    accessibility: {
      hasSubtitles: true,
      hasTranscript: true
    }
  }
];

const seedResources = async () => {
  try {
    // Connect to MongoDB
    const mongoUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/aashray-dev';
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB for resource seeding');

    // Create system user
    const systemUser = await createSystemUser();

    // Clear existing resources (optional - comment out in production)
    await Resource.deleteMany({});
    console.log('Cleared existing resources');

    // Add createdBy field to all resources
    const processedResources = sampleResources.map(resource => ({
      ...resource,
      createdBy: systemUser._id,
      moderationStatus: 'approved', // Pre-approve seeded resources
      publishDate: new Date(),
      isActive: true,
      isVerified: true,
      verifiedBy: systemUser._id
    }));

    // Insert new resources
    const insertedResources = await Resource.insertMany(processedResources);
    console.log(`Successfully seeded ${insertedResources.length} mental health resources`);

    // Add some sample ratings and views for demonstration
    for (const resource of insertedResources) {
      // Add some views
      resource.views = Math.floor(Math.random() * 1000) + 50;
      await resource.save();
    }

    // Log summary by category
    const categorySummary = {};
    const typeSummary = {};
    insertedResources.forEach(resource => {
      categorySummary[resource.category] = (categorySummary[resource.category] || 0) + 1;
      typeSummary[resource.type] = (typeSummary[resource.type] || 0) + 1;
    });

    console.log('\nResource seeding completed successfully!');
    console.log('\nResources by category:');
    Object.entries(categorySummary).forEach(([category, count]) => {
      console.log(`- ${category}: ${count} resources`);
    });
    
    console.log('\nResources by type:');
    Object.entries(typeSummary).forEach(([type, count]) => {
      console.log(`- ${type}: ${count} resources`);
    });
    
    console.log('\nAll seeded resources:');
    insertedResources.forEach(resource => {
      console.log(`- ${resource.title} (${resource.type} - ${resource.category})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding resources:', error);
    process.exit(1);
  }
};

// Run the seed function
seedResources();
