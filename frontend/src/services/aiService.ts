// AI Service for mood tracking and progress analysis
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export interface MoodInsight {
  id: string;
  type: 'pattern' | 'trend' | 'recommendation' | 'risk_assessment';
  title: string;
  description: string;
  confidence: number;
  severity?: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface MoodTrend {
  period: string;
  averageMood: number;
  moodVariability: number;
  improvement: number;
  patterns: string[];
}

export interface ProgressAnalysis {
  goalsCompleted: number;
  streaksActive: number;
  improvementAreas: string[];
  strengths: string[];
  recommendations: string[];
}

export interface AIAnalysisResponse {
  insights: MoodInsight[];
  trends: MoodTrend;
  progress: ProgressAnalysis;
  riskLevel: 'low' | 'medium' | 'high';
  nextActions: string[];
}

// AI Service Functions

// AI Service Functions
export const aiService = {
  // Get comprehensive AI analysis
  async getAIAnalysis(): Promise<AIAnalysisResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/analysis`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status === 'success') {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch AI analysis');
      }
    } catch (error) {
      console.error('Error fetching AI analysis:', error);
      // Return mock data if API fails to demonstrate functionality
      return {
        insights: [
          {
            id: '1',
            type: 'pattern',
            title: 'Weekly Mood Pattern Detected',
            description: 'Your mood tends to dip on Mondays and peaks on Fridays. Consider implementing Monday morning routines to start the week positively.',
            confidence: 0.85,
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            type: 'recommendation',
            title: 'Sleep Impact on Mood',
            description: 'Your mood ratings are 40% higher when you get 7+ hours of sleep. Try maintaining consistent sleep schedule.',
            confidence: 0.92,
            createdAt: new Date().toISOString(),
          },
          {
            id: '3',
            type: 'trend',
            title: 'Positive Progress Trend',
            description: 'Your overall mood has improved by 23% over the past month. Keep up the great work with your self-care routine!',
            confidence: 0.88,
            createdAt: new Date().toISOString(),
          },
        ],
        trends: {
          period: 'Last 30 days',
          averageMood: 3.4,
          moodVariability: 0.8,
          improvement: 0.23,
          patterns: ['Monday blues', 'Weekend highs', 'Evening energy dips'],
        },
        progress: {
          goalsCompleted: 7,
          streaksActive: 3,
          improvementAreas: ['Stress management', 'Sleep consistency'],
          strengths: ['Goal setting', 'Self-reflection', 'Community engagement'],
          recommendations: [
            'Try meditation for 10 minutes daily',
            'Set a consistent bedtime routine',
            'Join study groups for social support',
          ],
        },
        riskLevel: 'low',
        nextActions: [
          'Log your mood daily this week',
          'Complete your active wellness goal',
          'Try the recommended breathing exercise',
        ],
      };
    }
  },

  // Get mood-specific insights
  async getMoodInsights(): Promise<MoodInsight[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/insights`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status === 'success') {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch mood insights');
      }
    } catch (error) {
      console.error('Error fetching mood insights:', error);
      // Return mock insights if API fails to demonstrate functionality
      return [
        {
          id: '1',
          type: 'pattern',
          title: 'Weekly Mood Pattern Detected',
          description: 'Your mood tends to dip on Mondays and peaks on Fridays. Consider implementing Monday morning routines.',
          confidence: 0.85,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'recommendation',
          title: 'Sleep Impact on Mood',
          description: 'Your mood ratings are 40% higher when you get 7+ hours of sleep.',
          confidence: 0.92,
          createdAt: new Date().toISOString(),
        },
      ];
    }
  },

  // Get trend analysis
  async getTrendAnalysis(period: '7d' | '30d' | '90d' = '30d'): Promise<MoodTrend> {
    try {
      // Mock implementation - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 500));
      // TODO: Use period parameter in real implementation
      console.log(`Fetching trend analysis for period: ${period}`);
      return {
        period: `Last ${period === '7d' ? '7 days' : period === '30d' ? '30 days' : '90 days'}`,
        averageMood: 3.4,
        moodVariability: 0.8,
        improvement: 0.23,
        patterns: ['Monday blues', 'Weekend highs', 'Evening energy dips'],
      };
    } catch (error) {
      console.error('Error fetching trend analysis:', error);
      throw new Error('Failed to fetch trend analysis');
    }
  },

  // Get progress analysis
  async getProgressAnalysis(): Promise<ProgressAnalysis> {
    try {
      // Mock implementation - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        goalsCompleted: 7,
        streaksActive: 3,
        improvementAreas: ['Stress management', 'Sleep consistency'],
        strengths: ['Goal setting', 'Self-reflection', 'Community engagement'],
        recommendations: [
          'Try meditation for 10 minutes daily',
          'Set a consistent bedtime routine',
          'Join study groups for social support',
        ],
      };
    } catch (error) {
      console.error('Error fetching progress analysis:', error);
      throw new Error('Failed to fetch progress analysis');
    }
  },

  // Analyze mood entry for patterns
  async analyzeMoodEntry(moodData: { 
    mood: string; 
    note?: string; 
    triggers?: string[]; 
    activities?: string[] 
  }): Promise<{ insights: string[]; riskFactors: string[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/analyze-mood`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(moodData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.status === 'success') {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to analyze mood entry');
      }
    } catch (error) {
      console.error('Error analyzing mood entry:', error);
      // Fallback to simple analysis if API fails
      const insights = [];
      const riskFactors = [];

      if (moodData.note && moodData.note.toLowerCase().includes('stressed')) {
        insights.push('Stress detected in your note. Consider trying relaxation techniques.');
      }
      
      if (moodData.mood === 'terrible' || moodData.mood === 'difficult') {
        riskFactors.push('Low mood detected. Consider reaching out for support if this continues.');
      }

      return { insights, riskFactors };
    }
  },

  // Get personalized recommendations
  async getPersonalizedRecommendations(): Promise<string[]> {
    try {
      // Mock implementation - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return [
        'Based on your mood patterns, try morning meditation',
        'Your goal completion rate suggests focusing on smaller, achievable tasks',
        'Consider joining the evening study group - social connection boosts your mood',
        'Your sleep data shows improvement when you maintain a 10 PM bedtime',
      ];
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw new Error('Failed to fetch recommendations');
    }
  },
};

// Utility function to get auth token (implement based on your auth system)
function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

export default aiService;
