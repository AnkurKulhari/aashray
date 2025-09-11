const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3001/api/v1';
const TEST_USER = {
  email: 'aitest@example.com',
  password: 'TestPass123!'
};

let authToken = '';

// Helper function to make authenticated requests
const apiCall = async (method, endpoint, data = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
      },
      ...(data && { data })
    };
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ Error calling ${method.toUpperCase()} ${endpoint}:`, 
      error.response?.data || error.message);
    return null;
  }
};

// Test functions
const testHealthCheck = async () => {
  console.log('\n🏥 Testing health check...');
  try {
    const response = await axios.get(`${BASE_URL.replace('/api/v1', '')}/health`);
    console.log('✅ Health check passed:', response.data.message);
    return true;
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return false;
  }
};

const login = async () => {
  console.log('\n🔐 Attempting to login...');
  const result = await apiCall('post', '/auth/login', TEST_USER);
  if (result && result.token) {
    authToken = result.token;
    console.log('✅ Login successful');
    return true;
  } else {
    console.log('❌ Login failed - you may need to register first');
    return false;
  }
};

const registerTestUser = async () => {
  console.log('\n📝 Registering test user...');
  const userData = {
    ...TEST_USER,
    firstName: 'Test',
    lastName: 'User',
    university: 'Test University',
    year: '1st Year',
    major: 'Computer Science',
    dateOfBirth: '2000-01-01',
    gender: 'Prefer not to say'
  };
  
  const result = await apiCall('post', '/auth/register', userData);
  if (result && result.token) {
    authToken = result.token;
    console.log('✅ Registration successful');
    return true;
  } else {
    console.log('❌ Registration failed');
    return false;
  }
};

const testAIAnalysis = async () => {
  console.log('\n🧠 Testing AI Analysis endpoint...');
  const result = await apiCall('get', '/ai/analysis');
  if (result) {
    console.log('✅ AI Analysis successful');
    console.log('📊 Data structure:', {
      insights: result.data.insights?.length || 0,
      riskLevel: result.data.riskLevel,
      trends: result.data.trends ? 'Present' : 'Missing',
      progress: result.data.progress ? 'Present' : 'Missing',
      nextActions: result.data.nextActions?.length || 0
    });
    return result;
  }
  return null;
};

const testMoodInsights = async () => {
  console.log('\n💭 Testing Mood Insights endpoint...');
  const result = await apiCall('get', '/ai/insights');
  if (result) {
    console.log('✅ Mood Insights successful');
    console.log('📝 Insights count:', result.data?.length || 0);
    return result;
  }
  return null;
};

const testMoodAnalysis = async () => {
  console.log('\n🎯 Testing Mood Entry Analysis endpoint...');
  const moodData = {
    mood: 'stressed',
    note: 'Feeling overwhelmed with exams coming up. Having trouble sleeping.',
    triggers: ['academic_stress', 'time_pressure'],
    activities: ['studying']
  };
  
  const result = await apiCall('post', '/ai/analyze-mood', moodData);
  if (result) {
    console.log('✅ Mood Analysis successful');
    console.log('🔍 Analysis results:', {
      insights: result.data.insights?.length || 0,
      riskFactors: result.data.riskFactors?.length || 0
    });
    if (result.data.insights?.length > 0) {
      console.log('💡 Sample insight:', result.data.insights[0]);
    }
    return result;
  }
  return null;
};

const testTrendAnalysis = async () => {
  console.log('\n📈 Testing Trend Analysis endpoint...');
  const result = await apiCall('get', '/ai/trends?period=30d');
  if (result) {
    console.log('✅ Trend Analysis successful');
    console.log('📊 Trend data:', {
      period: result.data.period,
      averageMood: result.data.averageMood,
      improvement: result.data.improvement,
      patterns: result.data.patterns?.length || 0
    });
    return result;
  }
  return null;
};

const testProgressAnalysis = async () => {
  console.log('\n🎯 Testing Progress Analysis endpoint...');
  const result = await apiCall('get', '/ai/progress');
  if (result) {
    console.log('✅ Progress Analysis successful');
    console.log('📈 Progress data:', {
      goalsCompleted: result.data.goalsCompleted,
      streaksActive: result.data.streaksActive,
      strengths: result.data.strengths?.length || 0,
      recommendations: result.data.recommendations?.length || 0
    });
    return result;
  }
  return null;
};

const testRecommendations = async () => {
  console.log('\n💡 Testing Recommendations endpoint...');
  const result = await apiCall('get', '/ai/recommendations');
  if (result) {
    console.log('✅ Recommendations successful');
    console.log('📋 Recommendations count:', result.data?.length || 0);
    if (result.data?.length > 0) {
      console.log('🎯 Sample recommendation:', result.data[0]);
    }
    return result;
  }
  return null;
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting AI Endpoints Test Suite');
  console.log('=====================================');
  
  // Step 1: Health check
  const healthOk = await testHealthCheck();
  if (!healthOk) {
    console.log('\n❌ Server is not running. Please start with: npm run dev');
    process.exit(1);
  }
  
  // Step 2: Authentication
  let authOk = await login();
  if (!authOk) {
    console.log('\n🔄 Trying to register test user...');
    authOk = await registerTestUser();
  }
  
  if (!authOk) {
    console.log('\n❌ Could not authenticate. Tests cannot continue.');
    process.exit(1);
  }
  
  // Step 3: Test all AI endpoints
  console.log('\n🎯 Testing AI Endpoints:');
  console.log('========================');
  
  const results = {};
  results.analysis = await testAIAnalysis();
  results.insights = await testMoodInsights();
  results.moodAnalysis = await testMoodAnalysis();
  results.trends = await testTrendAnalysis();
  results.progress = await testProgressAnalysis();
  results.recommendations = await testRecommendations();
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log('================');
  const passed = Object.values(results).filter(r => r !== null).length;
  const total = Object.keys(results).length;
  
  console.log(`✅ Passed: ${passed}/${total} tests`);
  
  if (passed === total) {
    console.log('🎉 All AI endpoints are working correctly!');
    console.log('\n🔧 To enable OpenAI features:');
    console.log('1. Get an OpenAI API key from https://openai.com/api');
    console.log('2. Update OPENAI_API_KEY in your .env file');
    console.log('3. Restart your server');
  } else {
    console.log('⚠️ Some tests failed. Check the logs above for details.');
  }
  
  console.log('\n🏁 Test suite completed!');
};

// Check if axios is available
const checkDependencies = async () => {
  try {
    require('axios');
    return true;
  } catch (error) {
    console.log('❌ axios not found. Installing...');
    const { execSync } = require('child_process');
    try {
      execSync('npm install axios', { stdio: 'inherit' });
      return true;
    } catch (installError) {
      console.log('❌ Failed to install axios. Please run: npm install axios');
      return false;
    }
  }
};

// Run the tests
checkDependencies().then(ok => {
  if (ok) {
    runTests().catch(console.error);
  } else {
    process.exit(1);
  }
});
