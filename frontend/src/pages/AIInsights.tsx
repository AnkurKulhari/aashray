import React, { useState, useEffect } from 'react';
import { aiService, type AIAnalysisResponse } from '../services/aiService';
import MoodInsightCard from '../components/ai/MoodInsightCard';
import ProgressAnalysisCard from '../components/ai/ProgressAnalysisCard';
import MoodTrendChart from '../components/ai/MoodTrendChart';
import { Brain, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

const AIInsights: React.FC = () => {
  const [analysis, setAnalysis] = useState<AIAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalysis = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      const data = await aiService.getAIAnalysis();
      setAnalysis(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch AI analysis');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
      case 'medium':
        return <AlertTriangle className="h-5 w-5" />;
      case 'low':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <CheckCircle className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">AI Insights</h1>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <Brain className="h-8 w-8 text-blue-600 animate-pulse" />
            <span className="text-lg text-gray-600">Analyzing your mental health data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">AI Insights</h1>
        <div className="card p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load AI Insights</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchAnalysis()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Insights</h1>
          <p className="text-gray-600">Personalized mental health analysis and recommendations</p>
        </div>
        <button
          onClick={() => fetchAnalysis(true)}
          disabled={refreshing}
          className="btn-secondary flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Risk Level & Next Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Assessment */}
        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Brain className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Current Assessment</h2>
          </div>
          <div className={`flex items-center space-x-3 p-4 rounded-lg border ${getRiskLevelColor(analysis.riskLevel)}`}>
            {getRiskIcon(analysis.riskLevel)}
            <div>
              <p className="font-medium capitalize">{analysis.riskLevel} Risk Level</p>
              <p className="text-sm opacity-75">
                {analysis.riskLevel === 'low' && 'You\'re doing great! Keep up the positive habits.'}
                {analysis.riskLevel === 'medium' && 'Some areas need attention. Follow the recommendations below.'}
                {analysis.riskLevel === 'high' && 'Consider reaching out for professional support.'}
              </p>
            </div>
          </div>
        </div>

        {/* Next Actions */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recommended Next Steps</h2>
          <div className="space-y-3">
            {analysis.nextActions.map((action, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <span className="text-sm text-gray-700">{action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mood Trend Chart */}
      <MoodTrendChart trend={analysis.trends} />

      {/* Progress Analysis */}
      <ProgressAnalysisCard progress={analysis.progress} />

      {/* Individual Insights */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Personalized Insights</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {analysis.insights.map((insight) => (
            <MoodInsightCard
              key={insight.id}
              insight={insight}
            />
          ))}
        </div>
      </div>

      {/* Additional Information */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">About AI Analysis</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            Our AI analyzes your mood entries, goal progress, and engagement patterns to provide personalized insights and recommendations.
          </p>
          <p>
            <strong>Privacy Note:</strong> All analysis is performed securely, and your data remains private and encrypted.
          </p>
          <p>
            <strong>Disclaimer:</strong> These insights are for informational purposes and should not replace professional mental health advice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
