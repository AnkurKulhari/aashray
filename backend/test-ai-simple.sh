#!/bin/bash

BASE_URL="http://localhost:3001/api/v1"
EMAIL="aitest@example.com"
PASSWORD="TestPass123!"

echo "🚀 Testing AI Endpoints"
echo "======================"

# Step 1: Health Check
echo -e "\n🏥 Testing health check..."
HEALTH=$(curl -s http://localhost:3001/health)
if [[ $HEALTH == *"success"* ]]; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    exit 1
fi

# Step 2: Register test user
echo -e "\n📝 Registering test user..."
REGISTER_DATA='{
    "firstName": "Test",
    "lastName": "User", 
    "email": "'$EMAIL'",
    "password": "'$PASSWORD'",
    "university": "Test University",
    "year": "1st Year",
    "major": "Computer Science",
    "dateOfBirth": "2000-01-01",
    "gender": "Prefer not to say"
}'

REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d "$REGISTER_DATA")

if [[ $REGISTER_RESPONSE == *"token"* ]]; then
    TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo "✅ Registration successful"
else
    # Try to login instead
    echo "🔐 Trying to login..."
    LOGIN_DATA='{"email": "'$EMAIL'", "password": "'$PASSWORD'"}'
    LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d "$LOGIN_DATA")
    
    if [[ $LOGIN_RESPONSE == *"token"* ]]; then
        TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
        echo "✅ Login successful"
    else
        echo "❌ Authentication failed"
        echo "Response: $LOGIN_RESPONSE"
        exit 1
    fi
fi

# Step 3: Test AI Endpoints
echo -e "\n🧠 Testing AI Analysis..."
AI_ANALYSIS=$(curl -s -X GET "$BASE_URL/ai/analysis" \
    -H "Authorization: Bearer $TOKEN")

if [[ $AI_ANALYSIS == *"success"* ]]; then
    echo "✅ AI Analysis endpoint working"
    echo "📊 Response structure:"
    echo $AI_ANALYSIS | jq '.data | keys' 2>/dev/null || echo "   (Structure: insights, trends, progress, riskLevel, nextActions)"
else
    echo "❌ AI Analysis failed"
    echo "Response: $AI_ANALYSIS"
fi

echo -e "\n💭 Testing Mood Insights..."
MOOD_INSIGHTS=$(curl -s -X GET "$BASE_URL/ai/insights" \
    -H "Authorization: Bearer $TOKEN")

if [[ $MOOD_INSIGHTS == *"success"* ]]; then
    echo "✅ Mood Insights endpoint working"
else
    echo "❌ Mood Insights failed"
    echo "Response: $MOOD_INSIGHTS"
fi

echo -e "\n🎯 Testing Mood Entry Analysis..."
MOOD_DATA='{
    "mood": "stressed",
    "note": "Feeling overwhelmed with exams. Having trouble sleeping.",
    "triggers": ["academic_stress", "time_pressure"]
}'

MOOD_ANALYSIS=$(curl -s -X POST "$BASE_URL/ai/analyze-mood" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$MOOD_DATA")

if [[ $MOOD_ANALYSIS == *"success"* ]]; then
    echo "✅ Mood Entry Analysis endpoint working"
    echo "🔍 Sample insight:"
    echo $MOOD_ANALYSIS | jq '.data.insights[0]' 2>/dev/null || echo "   (Analysis completed successfully)"
else
    echo "❌ Mood Entry Analysis failed"
    echo "Response: $MOOD_ANALYSIS"
fi

echo -e "\n📈 Testing Trend Analysis..."
TREND_ANALYSIS=$(curl -s -X GET "$BASE_URL/ai/trends?period=30d" \
    -H "Authorization: Bearer $TOKEN")

if [[ $TREND_ANALYSIS == *"success"* ]]; then
    echo "✅ Trend Analysis endpoint working"
else
    echo "❌ Trend Analysis failed"
fi

echo -e "\n🎯 Testing Progress Analysis..."
PROGRESS_ANALYSIS=$(curl -s -X GET "$BASE_URL/ai/progress" \
    -H "Authorization: Bearer $TOKEN")

if [[ $PROGRESS_ANALYSIS == *"success"* ]]; then
    echo "✅ Progress Analysis endpoint working"
else
    echo "❌ Progress Analysis failed"
fi

echo -e "\n💡 Testing Recommendations..."
RECOMMENDATIONS=$(curl -s -X GET "$BASE_URL/ai/recommendations" \
    -H "Authorization: Bearer $TOKEN")

if [[ $RECOMMENDATIONS == *"success"* ]]; then
    echo "✅ Recommendations endpoint working"
else
    echo "❌ Recommendations failed"
fi

echo -e "\n🏁 Test completed!"
echo -e "\n🔧 To enable OpenAI features:"
echo "1. Get an OpenAI API key from https://openai.com/api"
echo "2. Update OPENAI_API_KEY in your .env file"
echo "3. Restart your server"
echo "4. The AI will provide more advanced insights!"
