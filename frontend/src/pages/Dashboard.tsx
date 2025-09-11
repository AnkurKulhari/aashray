import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Target, MessageSquare, Trophy, Plus } from 'lucide-react';
import aiService, { type MoodInsight } from '../services/aiService';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [insights, setInsights] = useState<MoodInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'community' | 'goals'>('overview');

  useEffect(() => {
    let isMounted = true;
    aiService.getMoodInsights()
      .then((data) => { if (isMounted) setInsights(data.slice(0, 2)); })
      .finally(() => { if (isMounted) setLoadingInsights(false); });
    return () => { isMounted = false; };
  }, []);

  const mockGoals = [
    { id: '1', title: 'Exercise daily', progress: 65, category: 'Health', dueDate: 'Tomorrow' },
    { id: '2', title: 'Meditate regularly', progress: 40, category: 'Mental Health', dueDate: 'Today' },
    { id: '3', title: 'Study schedule', progress: 80, category: 'Academic', dueDate: 'Next week' }
  ];

  const mockCommunityPosts = [
    { id: '1', author: 'Sarah M.', title: 'How I manage exam stress', replies: 8, time: '2h ago' },
    { id: '2', author: 'Alex K.', title: 'Dealing with social anxiety', replies: 12, time: '5h ago' },
    { id: '3', author: 'Jordan P.', title: 'Morning routine tips', replies: 15, time: '1d ago' }
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* Modern Welcome Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 rounded-3xl blur-xl"></div>
        <div className="relative glass rounded-3xl p-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-2xl flex items-center justify-center animate-pulse">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-gradient">Welcome to Aashray</h1>
            </div>
            <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
              Your personal space for mental wellness, growth, and support. Take a moment to check in with yourself today.
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-white/60">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Online Support Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Safe & Confidential</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Dashboard Tabs */}
      <div className="glass rounded-2xl p-2">
        <nav className="flex space-x-2">
          {[
            { id: 'overview', label: 'Overview', icon: Target, gradient: 'from-blue-500 to-cyan-500' },
            { id: 'community', label: 'Community', icon: Users, gradient: 'from-green-500 to-emerald-500' },
            { id: 'goals', label: 'Goals', icon: Trophy, gradient: 'from-yellow-500 to-orange-500' }
          ].map(({ id, label, icon: Icon, gradient }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`group relative flex items-center space-x-3 py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-300 ${
                activeTab === id
                  ? `bg-gradient-to-r ${gradient} text-white shadow-xl shadow-${gradient.split('-')[1]}-500/30 scale-105`
                  : 'text-white/60 hover:text-white/90 hover:bg-white/10'
              }`}
            >
              {activeTab === id && (
                <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-xl blur opacity-50 animate-pulse`}></div>
              )}
              <Icon className="w-5 h-5 relative z-10" />
              <span className="relative z-10">{label}</span>
              {activeTab === id && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-bounce"></div>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick actions */}
            <div className="lg:col-span-2 card-hover">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  className="group relative btn-primary overflow-hidden"
                  onClick={() => navigate('/mood')}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-violet-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    <span>😊</span>
                    <span>Log Mood</span>
                  </span>
                </button>
                <button 
                  className="group relative btn-secondary overflow-hidden"
                  onClick={() => navigate('/goals')}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    <span>🎯</span>
                    <span>Create Goal</span>
                  </span>
                </button>
                <button 
                  className="group relative btn-secondary overflow-hidden"
                  onClick={() => navigate('/games')}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    <span>🎮</span>
                    <span>Play Games</span>
                  </span>
                </button>
                <button 
                  className="group relative btn-secondary overflow-hidden"
                  onClick={() => navigate('/community')}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    <span>👥</span>
                    <span>Community</span>
                  </span>
                </button>
              </div>
            </div>

            {/* Today summary */}
            <div className="card-hover">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center animate-pulse">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Today's Progress</h2>
              </div>
              <ul className="space-y-4">
                <li className="flex items-center space-x-3 p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                  <span className="text-2xl">😊</span>
                  <span className="text-white font-medium">Mood: Good</span>
                </li>
                <li className="flex items-center space-x-3 p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                  <span className="text-2xl">🎯</span>
                  <span className="text-white font-medium">2 goals in progress</span>
                </li>
                <li className="flex items-center space-x-3 p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                  <span className="text-2xl">👥</span>
                  <span className="text-white font-medium">3 community interactions</span>
                </li>
                <li className="flex items-center space-x-3 p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                  <span className="text-2xl">🎮</span>
                  <span className="text-white font-medium">1 game completed</span>
                </li>
              </ul>
            </div>
          </div>

          {/* AI Insights Preview */}
          <div className="card-hover">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">AI Insights</h2>
              </div>
              <button className="btn-secondary text-sm" onClick={() => navigate('/insights')}>
                View all
              </button>
            </div>
            {loadingInsights ? (
              <div className="flex items-center space-x-3 p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/30 border-t-white"></div>
                <p className="text-white font-medium">Analyzing your patterns...</p>
              </div>
            ) : insights.length === 0 ? (
              <div className="text-center p-8 bg-white/10 rounded-2xl backdrop-blur-md">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-white font-medium mb-2">No insights yet</p>
                <p className="text-white/70 text-sm">Log your mood and update goals to see personalized insights</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {insights.map((insight) => (
                  <li key={insight.id} className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                    <span className="font-semibold text-white">{insight.title}:</span>
                    <span className="text-white/80 ml-2">{insight.description}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card-hover text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-white mb-2">7</div>
              <div className="text-sm text-white/70 font-medium">Days Streak</div>
            </div>
            <div className="card-hover text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-white mb-2">85%</div>
              <div className="text-sm text-white/70 font-medium">Goals Progress</div>
            </div>
            <div className="card-hover text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-white mb-2">12</div>
              <div className="text-sm text-white/70 font-medium">Community Posts</div>
            </div>
            <div className="card-hover text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8a2 2 0 002-2V6a2 2 0 00-2-2H8a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-white mb-2">3.4</div>
              <div className="text-sm text-white/70 font-medium">Avg Mood</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'community' && (
        <div className="space-y-8 pb-20">
          {/* Community Header */}
          <div className="card-hover">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Recent Community Activity</h2>
              </div>
              <button 
                onClick={() => navigate('/community')}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Post</span>
              </button>
            </div>
          </div>

          {/* Recent Posts */}
          <div className="grid grid-cols-1 gap-6">
            {mockCommunityPosts.map((post) => (
              <div key={post.id} className="card-hover cursor-pointer" onClick={() => navigate('/community')}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {post.author.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">{post.author}</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{post.time}</span>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2">{post.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.replies} replies</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Community Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Active Members</h3>
              <p className="text-2xl font-bold text-blue-600">1,234</p>
            </div>
            <div className="card p-6 text-center">
              <MessageSquare className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Posts Today</h3>
              <p className="text-2xl font-bold text-green-600">47</p>
            </div>
            <div className="card p-6 text-center">
              <Trophy className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Support Groups</h3>
              <p className="text-2xl font-bold text-purple-600">8</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'goals' && (
        <div className="space-y-8 pb-20">
          {/* Goals Header */}
          <div className="card-hover">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Your Goals</h2>
              </div>
              <button 
                onClick={() => navigate('/goals')}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Goal</span>
              </button>
            </div>
          </div>

          {/* Goals List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockGoals.map((goal) => (
              <div key={goal.id} className="card p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/goals')}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Target className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                  </div>
                  <span className="bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-600">
                    {goal.category}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Progress</span>
                    <span>{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Due: {goal.dueDate}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Goals Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6 text-center">
              <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Active Goals</h3>
              <p className="text-2xl font-bold text-blue-600">3</p>
            </div>
            <div className="card p-6 text-center">
              <Trophy className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium text-gray-900">Completed</h3>
              <p className="text-2xl font-bold text-green-600">12</p>
            </div>
            <div className="card p-6 text-center">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold text-sm">%</span>
              </div>
              <h3 className="font-medium text-gray-900">Success Rate</h3>
              <p className="text-2xl font-bold text-purple-600">80%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
