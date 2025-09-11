import React from 'react';
import { type MoodInsight } from '../../services/aiService';
import { TrendingUp, AlertTriangle, Lightbulb, BarChart3 } from 'lucide-react';

interface MoodInsightCardProps {
  insight: MoodInsight;
  className?: string;
}

const MoodInsightCard: React.FC<MoodInsightCardProps> = ({ insight, className = '' }) => {
  const getIcon = (type: MoodInsight['type']) => {
    switch (type) {
      case 'trend':
        return <TrendingUp className="h-5 w-5" />;
      case 'pattern':
        return <BarChart3 className="h-5 w-5" />;
      case 'recommendation':
        return <Lightbulb className="h-5 w-5" />;
      case 'risk_assessment':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <BarChart3 className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: MoodInsight['type']) => {
    switch (type) {
      case 'trend':
        return 'text-blue-600 bg-blue-50';
      case 'pattern':
        return 'text-purple-600 bg-purple-50';
      case 'recommendation':
        return 'text-green-600 bg-green-50';
      case 'risk_assessment':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`card p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 p-2 rounded-lg ${getTypeColor(insight.type)}`}>
          {getIcon(insight.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {insight.title}
            </h3>
            <div className="flex items-center space-x-2">
              {insight.severity && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(insight.severity)}`}>
                  {insight.severity}
                </span>
              )}
              <span className="text-xs text-gray-500">
                {Math.round(insight.confidence * 100)}% confidence
              </span>
            </div>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">
            {insight.description}
          </p>
          <div className="mt-2 text-xs text-gray-500">
            {insight.type.replace('_', ' ').toUpperCase()} • {new Date(insight.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodInsightCard;
