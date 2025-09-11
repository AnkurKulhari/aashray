import React, { useState } from 'react';
import { Target, Plus, Clock, CheckCircle } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  category: string;
  progress: number;
  completed: boolean;
}

const Goals: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Exercise daily',
      description: 'Go for a 30-minute walk or workout every day',
      targetDate: '2024-01-30',
      category: 'Health',
      progress: 65,
      completed: false,
    },
    {
      id: '2',
      title: 'Meditate regularly',
      description: 'Practice mindfulness meditation for 10 minutes daily',
      targetDate: '2024-01-25',
      category: 'Mental Health',
      progress: 40,
      completed: false,
    },
  ]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetDate: '',
    category: 'Health',
  });

  const handleCreateGoal = () => {
    if (newGoal.title && newGoal.description && newGoal.targetDate) {
      const goal: Goal = {
        id: Date.now().toString(),
        ...newGoal,
        progress: 0,
        completed: false,
      };
      setGoals([...goals, goal]);
      setNewGoal({ title: '', description: '', targetDate: '', category: 'Health' });
      setShowCreateForm(false);
    }
  };

  const handleToggleComplete = (id: string) => {
    setGoals(goals.map(goal => 
      goal.id === id 
        ? { ...goal, completed: !goal.completed, progress: goal.completed ? goal.progress : 100 }
        : goal
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Goals</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Goal</span>
        </button>
      </div>

      {/* Create Goal Form */}
      {showCreateForm && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Goal</h2>
          <div className="space-y-4">
            <div>
              <label className="form-label">Title</label>
              <input
                type="text"
                value={newGoal.title}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                className="form-input"
                placeholder="Enter goal title"
              />
            </div>
            <div>
              <label className="form-label">Description</label>
              <textarea
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                className="form-input"
                rows={3}
                placeholder="Describe your goal"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Category</label>
                <select
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                  className="form-input"
                >
                  <option value="Health">Health</option>
                  <option value="Mental Health">Mental Health</option>
                  <option value="Education">Education</option>
                  <option value="Social">Social</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>
              <div>
                <label className="form-label">Target Date</label>
                <input
                  type="date"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleCreateGoal}
                className="btn-primary"
              >
                Create Goal
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {goals.map((goal) => (
          <div key={goal.id} className={`card ${goal.completed ? 'bg-green-50 border-green-200' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-3">
                <Target className={`w-5 h-5 mt-0.5 ${goal.completed ? 'text-green-600' : 'text-blue-600'}`} />
                <div>
                  <h3 className={`font-semibold ${goal.completed ? 'text-green-900 line-through' : 'text-gray-900'}`}>
                    {goal.title}
                  </h3>
                  <p className="text-sm text-gray-600">{goal.description}</p>
                </div>
              </div>
              <button
                onClick={() => handleToggleComplete(goal.id)}
                className={`p-1 rounded-full ${goal.completed ? 'text-green-600' : 'text-gray-400 hover:text-green-600'}`}
              >
                <CheckCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span className="inline-flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(goal.targetDate).toLocaleDateString()}</span>
                </span>
                <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">{goal.category}</span>
              </div>
              
              {!goal.completed && (
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {goals.length === 0 && (
        <div className="card text-center py-8">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No goals yet</h3>
          <p className="text-gray-600 mb-4">Create your first goal to get started on your journey!</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary"
          >
            Create Your First Goal
          </button>
        </div>
      )}
    </div>
  );
};

export default Goals;
