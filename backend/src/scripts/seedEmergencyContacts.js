const mongoose = require('mongoose');
const { EmergencyContact, CrisisDetectionConfig } = require('../models/Emergency');
require('dotenv').config();

// Connect to database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.DATABASE_URL || 'mongodb://localhost:27017/aashray-dev',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Emergency contacts and helplines data
const emergencyContacts = [
  // US National Crisis Lines
  {
    name: 'National Suicide Prevention Lifeline',
    phoneNumber: '988',
    textNumber: '741741',
    website: 'https://suicidepreventionlifeline.org',
    description: '24/7 free and confidential emotional support for people in suicidal crisis or emotional distress.',
    category: 'suicide_prevention',
    availability: '24/7',
    languages: ['English', 'Spanish'],
    country: 'US',
    priority: 10
  },
  {
    name: 'Crisis Text Line',
    phoneNumber: '741741',
    textNumber: '741741',
    website: 'https://www.crisistextline.org',
    description: 'Free, 24/7 support for those in crisis. Text HOME to 741741 from anywhere in the US.',
    category: 'crisis_counseling',
    availability: '24/7',
    languages: ['English', 'Spanish'],
    country: 'India',
    priority: 9
  },
  {
    name: 'SAMHSA National Helpline',
    phoneNumber: '1-800-662-4357',
    website: 'https://www.samhsa.gov/find-help/national-helpline',
    description: 'Free, confidential, 24/7 treatment referral service for mental health and substance use disorders.',
    category: 'mental_health',
    availability: '24/7',
    languages: ['English', 'Spanish'],
    country: 'India',
    priority: 8
  },
  {
    name: 'National Domestic Violence Hotline',
    phoneNumber: '1-800-799-7233',
    textNumber: '22522',
    website: 'https://www.thehotline.org',
    description: '24/7 confidential support for survivors of domestic violence and their families.',
    category: 'domestic_violence',
    availability: '24/7',
    languages: ['English', 'Spanish'],
    country: 'India',
    priority: 9
  },
  {
    name: 'National Sexual Assault Hotline',
    phoneNumber: '1-800-656-4673',
    website: 'https://www.rainn.org',
    description: 'Free, confidential support for survivors of sexual assault and their families.',
    category: 'crisis_counseling',
    availability: '24/7',
    languages: ['English', 'Spanish'],
    country: 'India',
    priority: 8
  },
  {
    name: 'The Trevor Project',
    phoneNumber: '1-866-488-7386',
    textNumber: '678678',
    website: 'https://www.thetrevorproject.org',
    description: '24/7 crisis support services for LGBTQ+ youth.',
    category: 'lgbtq_support',
    availability: '24/7',
    languages: ['English', 'Spanish'],
    country: 'India',
    priority: 9
  },
  {
    name: 'Trans Lifeline',
    phoneNumber: '877-565-8860',
    website: 'https://translifeline.org',
    description: 'Crisis support specifically for transgender people by transgender people.',
    category: 'lgbtq_support',
    availability: '24/7',
    languages: ['English', 'Spanish'],
    country: 'India',
    priority: 8
  },
  {
    name: 'Veterans Crisis Line',
    phoneNumber: '1-800-273-8255',
    textNumber: '838255',
    website: 'https://www.veteranscrisisline.net',
    description: '24/7 support for veterans in crisis and their families.',
    category: 'veteran_support',
    availability: '24/7',
    languages: ['English'],
    country: 'India',
    priority: 9
  },
  {
    name: 'National Eating Disorders Association',
    phoneNumber: '1-800-931-2237',
    textNumber: '2973',
    website: 'https://www.nationaleatingdisorders.org',
    description: 'Support for people with eating disorders and their families.',
    category: 'eating_disorders',
    availability: 'business_hours',
    customHours: 'Monday-Thursday 9am-9pm ET, Friday 9am-5pm ET',
    languages: ['English', 'Spanish'],
    country: 'India',
    priority: 7
  },
  {
    name: 'Teen Line',
    phoneNumber: '1-800-852-8336',
    textNumber: 'TEEN to 839863',
    website: 'https://teenlineonline.org',
    description: 'Teens helping teens with crisis support and resources.',
    category: 'youth_support',
    availability: 'custom',
    customHours: '6pm-10pm PST daily',
    languages: ['English', 'Spanish'],
    country: 'India',
    priority: 7
  },
  
  // International Crisis Lines
  {
    name: 'Samaritans (UK)',
    phoneNumber: '116123',
    email: 'jo@samaritans.org',
    website: 'https://www.samaritans.org',
    description: 'Free 24/7 emotional support for anyone in the UK and Ireland.',
    category: 'suicide_prevention',
    availability: '24/7',
    languages: ['English', 'Welsh'],
    country: 'India',
    priority: 10
  },
  {
    name: 'Lifeline Australia',
    phoneNumber: '13-11-14',
    textNumber: '0477131114',
    website: 'https://www.lifeline.org.au',
    description: '24/7 crisis support and suicide prevention services.',
    category: 'suicide_prevention',
    availability: '24/7',
    languages: ['English'],
    country: 'AU',
    priority: 10
  },
  {
    name: 'Talk Suicide Canada',
    phoneNumber: '1-833-456-4566',
    textNumber: '45645',
    website: 'https://talksuicide.ca',
    description: '24/7 bilingual support for anyone having thoughts of suicide.',
    category: 'suicide_prevention',
    availability: '24/7',
    languages: ['English', 'French'],
    country: 'CA',
    priority: 10
  },
  {
    name: 'Suicide & Crisis Lifeline New Zealand',
    phoneNumber: '0508-828-865',
    website: 'https://www.lifeline.org.nz',
    description: '24/7 support for anyone in distress.',
    category: 'suicide_prevention',
    availability: '24/7',
    languages: ['English', 'Maori'],
    country: 'NZ',
    priority: 10
  },
  {
    name: 'Befrienders Worldwide',
    phoneNumber: '+1-800-BEFRIEND',
    website: 'https://www.befrienders.org',
    description: 'Global network of emotional support services.',
    category: 'crisis_counseling',
    availability: '24/7',
    languages: ['Multiple'],
    country: 'International',
    priority: 6
  }
];

// Crisis detection configuration
const crisisDetectionConfig = {
  keywords: {
    critical: [
      { word: 'suicide', weight: 10 },
      { word: 'kill myself', weight: 10 },
      { word: 'end my life', weight: 10 },
      { word: 'no reason to live', weight: 9 },
      { word: 'self-harm', weight: 9 },
      { word: 'want to die', weight: 10 },
      { word: 'ending it all', weight: 9 },
      { word: 'not worth living', weight: 8 },
      { word: 'take my own life', weight: 10 }
    ],
    warning: [
      { word: 'hurt myself', weight: 6 },
      { word: 'can\'t go on', weight: 6 },
      { word: 'overwhelmed', weight: 5 },
      { word: 'panic attack', weight: 5 },
      { word: 'hopeless', weight: 6 },
      { word: 'cutting', weight: 7 },
      { word: 'pills', weight: 6 },
      { word: 'rope', weight: 7 },
      { word: 'gun', weight: 7 },
      { word: 'bridge', weight: 6 }
    ],
    concerning: [
      { word: 'very sad', weight: 3 },
      { word: 'depressed', weight: 3 },
      { word: 'anxious', weight: 3 },
      { word: 'scared', weight: 3 },
      { word: 'alone', weight: 3 },
      { word: 'worthless', weight: 4 },
      { word: 'tired of everything', weight: 4 },
      { word: 'no one cares', weight: 4 },
      { word: 'give up', weight: 4 }
    ]
  },
  thresholds: {
    critical: 8,
    high: 6,
    medium: 4
  },
  patterns: [
    {
      name: 'Suicide method mentions',
      regex: '(hang|hanging|overdose|jump|jumping|drown|drowning)',
      severity: 'critical',
      description: 'Mentions of specific suicide methods'
    },
    {
      name: 'Immediate danger expressions',
      regex: '(tonight|today|now|right now|immediately).*(?:die|kill|end)',
      severity: 'critical',
      description: 'Expressions indicating immediate danger'
    },
    {
      name: 'Goodbye messages',
      regex: '(goodbye|farewell|this is it|final|last time)',
      severity: 'high',
      description: 'Potential goodbye or final messages'
    }
  ],
  isActive: true
};

const seedEmergencyData = async () => {
  try {
    console.log('🌱 Starting emergency data seeding...');
    
    // Clear existing data
    await EmergencyContact.deleteMany({});
    await CrisisDetectionConfig.deleteMany({});
    console.log('✅ Cleared existing emergency data');
    
    // Insert emergency contacts
    const insertedContacts = await EmergencyContact.insertMany(emergencyContacts);
    console.log(`✅ Inserted ${insertedContacts.length} emergency contacts`);
    
    // Insert crisis detection config
    const insertedConfig = await CrisisDetectionConfig.create(crisisDetectionConfig);
    console.log('✅ Inserted crisis detection configuration');
    
    console.log('🎉 Emergency data seeding completed successfully!');
    
    // Display summary
    console.log('\\n📊 Summary:');
    console.log(`- Emergency Contacts: ${insertedContacts.length}`);
    console.log(`- Crisis Keywords: ${crisisDetectionConfig.keywords.critical.length} critical, ${crisisDetectionConfig.keywords.warning.length} warning, ${crisisDetectionConfig.keywords.concerning.length} concerning`);
    console.log(`- Detection Patterns: ${crisisDetectionConfig.patterns.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding emergency data:', error);
    process.exit(1);
  }
};

// Run the seeding function
const main = async () => {
  await connectDB();
  await seedEmergencyData();
};

if (require.main === module) {
  main();
}

module.exports = { seedEmergencyData };
