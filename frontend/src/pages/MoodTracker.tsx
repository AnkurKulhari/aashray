import React, { useState } from 'react';
import aiService from '../services/aiService';
import { AlertCircle, Lightbulb } from 'lucide-react';

const MoodTracker: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [moodInsights, setMoodInsights] = useState<{ insights: string[]; riskFactors: string[] } | null>(null);

  const moods = [
    { id: 'excellent', label: 'Excellent', emoji: '😄', color: 'mood-excellent' },
    { id: 'good', label: 'Good', emoji: '😊', color: 'mood-good' },
    { id: 'okay', label: 'Okay', emoji: '😐', color: 'mood-okay' },
    { id: 'difficult', label: 'Difficult', emoji: '😔', color: 'mood-difficult' },
    { id: 'terrible', label: 'Terrible', emoji: '😢', color: 'mood-terrible' },
  ];

  const handleSaveMood = async () => {
    if (selectedMood) {
      setAnalyzing(true);
      try {
        // Analyze mood entry with AI
        const analysis = await aiService.analyzeMoodEntry({
          mood: selectedMood,
          note: note
        });
        setMoodInsights(analysis);
        
        // In a real app, this would save to the backend
        console.log('Saving mood:', { mood: selectedMood, note, timestamp: new Date() });
        alert(`Mood "${moods.find(m => m.id === selectedMood)?.label}" saved successfully!`);
        
        // Clear form after a short delay to show insights
        setTimeout(() => {
          setSelectedMood(null);
          setNote('');
          setMoodInsights(null);
        }, 5000);
      } catch (error) {
        console.error('Error analyzing mood:', error);
      } finally {
        setAnalyzing(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mood Tracker</h1>
      
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">How are you feeling today?</h2>
        
        {/* Mood Selection */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {moods.map((mood) => (
            <button
              key={mood.id}
              onClick={() => setSelectedMood(mood.id)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                selectedMood === mood.id
                  ? 'border-blue-500 bg-blue-50 scale-105'
                  : 'border-gray-200 hover:border-gray-300 hover:scale-102'
              }`}
            >
              <div className="text-3xl mb-2">{mood.emoji}</div>
              <div className="text-sm font-medium text-gray-900">{mood.label}</div>
            </button>
          ))}
        </div>
        
        {/* Note Input */}
        <div className="mb-6">
          <label className="form-label">Add a note (optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="form-input"
            rows={3}
            placeholder="What's on your mind?"
          />
        </div>
        
        {/* AI Insights */}
        {moodInsights && (
          <div className="mb-6 space-y-3">
            {moodInsights.insights.length > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-start space-x-2">
                  <Lightbulb className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">AI Insights</h4>
                    {moodInsights.insights.map((insight, index) => (
                      <p key={index} className="text-sm text-blue-800">{insight}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {moodInsights.riskFactors.length > 0 && (
              <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900 mb-1">Support Recommendations</h4>
                    {moodInsights.riskFactors.map((factor, index) => (
                      <p key={index} className="text-sm text-yellow-800">{factor}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Save Button */}
        <button
          onClick={handleSaveMood}
          disabled={!selectedMood || analyzing}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            selectedMood && !analyzing
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {analyzing ? 'Analyzing...' : 'Save Mood Entry'}
        </button>
      </div>
    </div>
  );
};

export default MoodTracker;
