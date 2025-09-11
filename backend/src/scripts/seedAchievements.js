const mongoose = require('mongoose');
const Achievement = require('../models/Achievement');
require('dotenv').config();

const achievements = [
  // First Steps
  {
    name: 'First Steps',
    description: 'Log your first mood entry and begin your mental health journey',
    category: 'mood_tracking',
    type: 'bronze',
    icon: '🌱',
    color: '#90EE90',
    requirements: { moodEntries: 1 },
    rewards: { points: 25 },
    rarity: 'common',
    order: 1
  },
  
  // Consistency Achievements
  {
    name: 'Week Warrior',
    description: 'Log your mood for 7 consecutive days',
    category: 'consistency',
    type: 'silver',
    icon: '📅',
    color: '#C0C0C0',
    requirements: { consecutiveDays: 7 },
    rewards: { points: 100 },
    rarity: 'uncommon',
    order: 2
  },
  {
    name: 'Dedication Master',
    description: 'Log your mood for 30 consecutive days',
    category: 'consistency',
    type: 'gold',
    icon: '🏅',
    color: '#FFD700',
    requirements: { consecutiveDays: 30 },
    rewards: { points: 500 },
    rarity: 'rare',
    order: 3
  },
  
  // Mood Tracking Milestones
  {
    name: 'Mood Explorer',
    description: 'Record 10 different mood entries',
    category: 'mood_tracking',
    type: 'bronze',
    icon: '🔍',
    color: '#CD7F32',
    requirements: { moodEntries: 10 },
    rewards: { points: 50 },
    rarity: 'common',
    order: 4
  },
  {
    name: 'Emotional Architect',
    description: 'Record 100 mood entries',
    category: 'mood_tracking',
    type: 'gold',
    icon: '🏗️',
    color: '#FFD700',
    requirements: { moodEntries: 100 },
    rewards: { points: 300 },
    rarity: 'rare',
    order: 5
  },
  
  // Goal Achievement
  {
    name: 'Goal Getter',
    description: 'Complete your first mental health goal',
    category: 'goal_achievement',
    type: 'bronze',
    icon: '🎯',
    color: '#CD7F32',
    requirements: { goalsCompleted: 1 },
    rewards: { points: 75 },
    rarity: 'common',
    order: 6
  },
  {
    name: 'Achievement Ace',
    description: 'Complete 10 mental health goals',
    category: 'goal_achievement',
    type: 'gold',
    icon: '🏆',
    color: '#FFD700',
    requirements: { goalsCompleted: 10 },
    rewards: { points: 400 },
    rarity: 'rare',
    order: 7
  },
  
  // Community Engagement
  {
    name: 'Community Voice',
    description: 'Make your first community post',
    category: 'community_engagement',
    type: 'bronze',
    icon: '💬',
    color: '#CD7F32',
    requirements: { communityPosts: 1 },
    rewards: { points: 50 },
    rarity: 'common',
    order: 8
  },
  {
    name: 'Helper Hero',
    description: 'Have 5 of your comments marked as helpful',
    category: 'support_others',
    type: 'silver',
    icon: '🦸',
    color: '#C0C0C0',
    requirements: { helpfulComments: 5 },
    rewards: { points: 200 },
    rarity: 'uncommon',
    order: 9
  },
  {
    name: 'Community Champion',
    description: 'Make 25 community posts',
    category: 'community_engagement',
    type: 'gold',
    icon: '👑',
    color: '#FFD700',
    requirements: { communityPosts: 25 },
    rewards: { points: 500 },
    rarity: 'rare',
    order: 10
  },
  
  // Milestone Points
  {
    name: 'Point Pioneer',
    description: 'Earn your first 100 points',
    category: 'milestone',
    type: 'bronze',
    icon: '💎',
    color: '#CD7F32',
    requirements: { totalPoints: 100 },
    rewards: { points: 25 },
    rarity: 'common',
    order: 11
  },
  {
    name: 'Rising Star',
    description: 'Earn 1,000 points',
    category: 'milestone',
    type: 'silver',
    icon: '⭐',
    color: '#C0C0C0',
    requirements: { totalPoints: 1000 },
    rewards: { points: 100 },
    rarity: 'uncommon',
    order: 12
  },
  {
    name: 'Wellness Legend',
    description: 'Earn 5,000 points',
    category: 'milestone',
    type: 'platinum',
    icon: '🌟',
    color: '#E5E4E2',
    requirements: { totalPoints: 5000 },
    rewards: { points: 500 },
    rarity: 'legendary',
    order: 13
  },
  
  // Special Achievements
  {
    name: 'Early Adopter',
    description: 'One of the first 100 users to join Aashray',
    category: 'special',
    type: 'special',
    icon: '🚀',
    color: '#9400D3',
    requirements: {},
    rewards: { points: 150 },
    rarity: 'legendary',
    isHidden: true,
    order: 14
  },
  
  // Wellness & Self-Care
  {
    name: 'Self-Care Sunday',
    description: 'Complete a self-care goal on a Sunday',
    category: 'self_care',
    type: 'bronze',
    icon: '🛁',
    color: '#FFB6C1',
    requirements: {},
    rewards: { points: 30 },
    rarity: 'common',
    isHidden: true,
    order: 15
  }
];

const seedAchievements = async () => {
  try {
    // Connect to MongoDB
    const mongoUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/aashray-dev';
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB');

    // Clear existing achievements
    await Achievement.deleteMany({});
    console.log('Cleared existing achievements');

    // Insert new achievements
    await Achievement.insertMany(achievements);
    console.log(`Seeded ${achievements.length} achievements`);

    console.log('Achievement seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding achievements:', error);
    process.exit(1);
  }
};

// Run the seed function
seedAchievements();
