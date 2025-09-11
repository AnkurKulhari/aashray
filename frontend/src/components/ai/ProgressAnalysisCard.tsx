import React from 'react';
import { type ProgressAnalysis } from '../../services/aiService';
import { Target, Award, TrendingUp, AlertCircle } from 'lucide-react';

interface ProgressAnalysisCardProps {
  progress: ProgressAnalysis;
  className?: string;
}

const ProgressAnalysisCard: React.FC<ProgressAnalysisCardProps> = ({ progress, className = '' }) => {
  return (
    <div className={`card p-6 ${className}`}>
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Progress Analysis</h3>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
          <div className="flex-shrink-0">
            <Target className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-green-900">Goals Completed</p>
            <p className="text-2xl font-bold text-green-600">{progress.goalsCompleted}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
          <div className="flex-shrink-0">
            <Award className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-900">Active Streaks</p>
            <p className="text-2xl font-bold text-blue-600">{progress.streaksActive}</p>
          </div>
        </div>
      </div>

      {/* Strengths */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <TrendingUp className="h-5 w-5 text-green-600" />
          <h4 className="text-lg font-medium text-gray-900">Your Strengths</h4>
        </div>
        <div className="space-y-2">
          {progress.strengths.map((strength, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">{strength}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Improvement Areas */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <h4 className="text-lg font-medium text-gray-900">Areas for Growth</h4>
        </div>
        <div className="space-y-2">
          {progress.improvementAreas.map((area, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-700">{area}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-3">AI Recommendations</h4>
        <div className="space-y-3">
          {progress.recommendations.map((recommendation, index) => (
            <div key={index} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-blue-900">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressAnalysisCard;
