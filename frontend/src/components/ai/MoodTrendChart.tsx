import React from 'react';
import { type MoodTrend } from '../../services/aiService';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface MoodTrendChartProps {
  trend: MoodTrend;
  className?: string;
}

const MoodTrendChart: React.FC<MoodTrendChartProps> = ({ trend, className = '' }) => {
  // Mock data for chart visualization
  const moodData = [
    { day: 'Mon', mood: 3.2, label: 'Mon' },
    { day: 'Tue', mood: 3.8, label: 'Tue' },
    { day: 'Wed', mood: 3.5, label: 'Wed' },
    { day: 'Thu', mood: 4.1, label: 'Thu' },
    { day: 'Fri', mood: 4.3, label: 'Fri' },
    { day: 'Sat', mood: 3.9, label: 'Sat' },
    { day: 'Sun', mood: 3.6, label: 'Sun' },
  ];

  const maxMood = 5;
  const getBarHeight = (mood: number) => `${(mood / maxMood) * 100}%`;
  const getBarColor = (mood: number) => {
    if (mood >= 4) return 'bg-green-500';
    if (mood >= 3.5) return 'bg-blue-500';
    if (mood >= 3) return 'bg-yellow-500';
    if (mood >= 2.5) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const formatMoodLabel = (mood: number) => {
    if (mood >= 4.5) return 'Excellent';
    if (mood >= 3.5) return 'Good';
    if (mood >= 2.5) return 'Okay';
    if (mood >= 1.5) return 'Difficult';
    return 'Terrible';
  };

  const improvementIcon = trend.improvement >= 0 ? (
    <TrendingUp className="h-5 w-5 text-green-600" />
  ) : (
    <TrendingDown className="h-5 w-5 text-red-600" />
  );

  const improvementColor = trend.improvement >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <div className={`card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Mood Trends</h3>
        <div className="flex items-center space-x-2">
          {improvementIcon}
          <span className={`text-sm font-medium ${improvementColor}`}>
            {trend.improvement >= 0 ? '+' : ''}{Math.round(trend.improvement * 100)}%
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6">
        <div className="flex items-end justify-between h-40 px-2">
          {moodData.map((data, index) => (
            <div key={index} className="flex flex-col items-center flex-1 mx-1">
              <div className="relative w-full max-w-8 bg-gray-100 rounded-t-lg overflow-hidden">
                <div
                  className={`absolute bottom-0 w-full transition-all duration-500 ${getBarColor(data.mood)} rounded-t-lg`}
                  style={{ height: getBarHeight(data.mood) }}
                  title={`${data.day}: ${data.mood}/5 (${formatMoodLabel(data.mood)})`}
                ></div>
              </div>
              <span className="text-xs text-gray-600 mt-2">{data.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{trend.averageMood.toFixed(1)}</div>
          <div className="text-sm text-gray-600">Average Mood</div>
          <div className="text-xs text-gray-500 mt-1">{formatMoodLabel(trend.averageMood)}</div>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{trend.moodVariability.toFixed(1)}</div>
          <div className="text-sm text-gray-600">Variability</div>
          <div className="text-xs text-gray-500 mt-1">Consistency Score</div>
        </div>
        
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{trend.period}</div>
          <div className="text-sm text-gray-600">Time Period</div>
          <div className="text-xs text-gray-500 mt-1">Data Range</div>
        </div>
      </div>

      {/* Patterns */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Activity className="h-5 w-5 text-purple-600" />
          <h4 className="text-lg font-medium text-gray-900">Detected Patterns</h4>
        </div>
        <div className="space-y-2">
          {trend.patterns.map((pattern, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-700">{pattern}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoodTrendChart;
