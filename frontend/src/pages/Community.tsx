import React, { useState, useEffect } from 'react';
import { MessageSquare, Users, Heart, Plus, Bookmark, TrendingUp, Star, Clock } from 'lucide-react';

interface Post {
  id: string;
  author: string;
  avatar: string;
  title: string;
  content: string;
  category: string;
  timestamp: string;
  likes: number;
  replies: number;
  tags: string[];
}

interface SupportGroup {
  id: string;
  name: string;
  description: string;
  members: number;
  category: string;
  meetingTime?: string;
  isJoined: boolean;
}

const Community: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'discussions' | 'groups' | 'resources'>('discussions');
  const [showNewPost, setShowNewPost] = useState(false);

  // Handle URL parameters for tab switching
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab === 'groups' || tab === 'resources') {
      setActiveTab(tab);
    }
  }, []);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: ''
  });

  const [posts] = useState<Post[]>([
    {
      id: '1',
      author: 'Sarah M.',
      avatar: '👩‍🎓',
      title: 'How I manage exam stress',
      content: 'I wanted to share some techniques that have helped me during finals week. Deep breathing exercises and breaking study sessions into 25-minute chunks really made a difference...',
      category: 'Study Tips',
      timestamp: '2 hours ago',
      likes: 15,
      replies: 8,
      tags: ['stress', 'exams', 'study-tips']
    },
    {
      id: '2',
      author: 'Alex K.',
      avatar: '👨‍🎓',
      title: 'Dealing with social anxiety on campus',
      content: 'Starting college was overwhelming for me socially. Here are some small steps that helped me build confidence and make friends...',
      category: 'Social Support',
      timestamp: '5 hours ago',
      likes: 23,
      replies: 12,
      tags: ['social-anxiety', 'campus-life', 'friendship']
    },
    {
      id: '3',
      author: 'Jordan P.',
      avatar: '🧑‍🎓',
      title: 'Morning routine that changed my mental health',
      content: 'I struggled with depression and found that creating a consistent morning routine helped stabilize my mood. Here\'s what worked for me...',
      category: 'Wellness',
      timestamp: '1 day ago',
      likes: 31,
      replies: 15,
      tags: ['depression', 'routine', 'self-care']
    }
  ]);

  const [supportGroups] = useState<SupportGroup[]>([
    {
      id: '1',
      name: 'Study Stress Support',
      description: 'A safe space to discuss academic pressure and share coping strategies',
      members: 127,
      category: 'Academic',
      meetingTime: 'Wednesdays 7 PM',
      isJoined: false
    },
    {
      id: '2',
      name: 'Anxiety Warriors',
      description: 'Supporting each other through anxiety with practical tips and encouragement',
      members: 89,
      category: 'Mental Health',
      meetingTime: 'Sundays 6 PM',
      isJoined: true
    },
    {
      id: '3',
      name: 'Mindful Campus Living',
      description: 'Exploring mindfulness and meditation practices for student life',
      members: 156,
      category: 'Wellness',
      meetingTime: 'Daily check-ins',
      isJoined: false
    },
    {
      id: '4',
      name: 'First Year Friends',
      description: 'Connect with other first-year students navigating college life',
      members: 234,
      category: 'Social',
      isJoined: false
    }
  ]);

  const handleCreatePost = () => {
    if (newPost.title && newPost.content) {
      // In a real app, this would save to backend
      console.log('Creating post:', newPost);
      alert('Post created successfully!');
      setNewPost({ title: '', content: '', category: 'general', tags: '' });
      setShowNewPost(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Community</h1>
          <p className="text-gray-600">Connect, share, and support each other</p>
        </div>
        <button
          onClick={() => setShowNewPost(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Post</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'discussions', label: 'Discussions', icon: MessageSquare },
            { id: 'groups', label: 'Support Groups', icon: Users },
            { id: 'resources', label: 'Resources', icon: Bookmark }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* New Post Modal */}
      {showNewPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl m-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Post</h2>
            <div className="space-y-4">
              <div>
                <label className="form-label">Title</label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="form-input"
                  placeholder="What would you like to discuss?"
                />
              </div>
              <div>
                <label className="form-label">Category</label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                  className="form-input"
                >
                  <option value="general">General</option>
                  <option value="study-tips">Study Tips</option>
                  <option value="social-support">Social Support</option>
                  <option value="wellness">Wellness</option>
                  <option value="mental-health">Mental Health</option>
                </select>
              </div>
              <div>
                <label className="form-label">Content</label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="form-input"
                  rows={4}
                  placeholder="Share your thoughts, experiences, or questions..."
                />
              </div>
              <div>
                <label className="form-label">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newPost.tags}
                  onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                  className="form-input"
                  placeholder="e.g. stress, study-tips, anxiety"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowNewPost(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePost}
                  className="btn-primary"
                >
                  Create Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'discussions' && (
        <div className="space-y-6">
          {/* Featured Discussions */}
          <div className="grid grid-cols-1 gap-4">
            {posts.map((post) => (
              <div key={post.id} className="card p-6">
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">{post.avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{post.author}</h3>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{post.timestamp}</span>
                      </div>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded-full">
                        {post.category}
                      </span>
                    </div>
                    <h2 className="text-lg font-medium text-gray-900 mb-2">{post.title}</h2>
                    <p className="text-gray-600 mb-3">{post.content}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 text-xs rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <button className="flex items-center space-x-1 hover:text-red-500">
                          <Heart className="w-4 h-4" />
                          <span>{post.likes}</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-blue-500">
                          <MessageSquare className="w-4 h-4" />
                          <span>{post.replies}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'groups' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {supportGroups.map((group) => (
            <div key={group.id} className={`card p-6 ${group.isJoined ? 'bg-blue-50 border-blue-200' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Users className={`w-6 h-6 ${group.isJoined ? 'text-blue-600' : 'text-gray-400'}`} />
                  <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                </div>
                {group.isJoined && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded-full">Joined</span>
                )}
              </div>
              <p className="text-gray-600 mb-4">{group.description}</p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{group.members} members</span>
                </div>
                {group.meetingTime && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{group.meetingTime}</span>
                  </div>
                )}
                <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 text-xs rounded">
                  {group.category}
                </span>
              </div>
              <button className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                group.isJoined
                  ? 'bg-green-100 text-green-700 cursor-default'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}>
                {group.isJoined ? 'Already Joined' : 'Join Group'}
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="space-y-6">
          {/* Resource Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card p-6">
              <div className="flex items-center space-x-3 mb-3">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Study Resources</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Effective study techniques</li>
                <li>• Time management tips</li>
                <li>• Exam preparation guides</li>
                <li>• Focus and concentration</li>
              </ul>
              <button 
                onClick={() => window.open('https://www.iasp.info/suicidalthoughts/', '_blank')}
                className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
              >
                View all resources →
              </button>
            </div>

            <div className="card p-6">
              <div className="flex items-center space-x-3 mb-3">
                <Heart className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">Mental Health</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Stress management</li>
                <li>• Anxiety coping strategies</li>
                <li>• Depression support</li>
                <li>• Professional help finder</li>
              </ul>
              <button 
                onClick={() => window.open('https://www.vandrevalafoundation.com/free-counseling', '_blank')}
                className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
              >
                View all resources →
              </button>
            </div>

            <div className="card p-6">
              <div className="flex items-center space-x-3 mb-3">
                <Star className="w-6 h-6 text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-900">Wellness</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Meditation guides</li>
                <li>• Exercise routines</li>
                <li>• Healthy eating tips</li>
                <li>• Sleep improvement</li>
              </ul>
              <button 
                onClick={() => window.location.href = '/games'}
                className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
              >
                View all resources →
              </button>
            </div>
          </div>

          {/* Featured Resources */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured This Week</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">5-Minute Meditation Guide</h4>
                <p className="text-sm text-gray-600 mb-3">Quick mindfulness exercises for busy students</p>
                <button 
                  onClick={() => window.location.href = '/games'}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
                >
                  Start meditation →
                </button>
              </div>
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Study Break Activities</h4>
                <p className="text-sm text-gray-600 mb-3">Refresh your mind with these quick activities</p>
                <button 
                  onClick={() => window.location.href = '/games'}
                  className="text-green-600 hover:text-green-700 text-sm font-medium hover:underline"
                >
                  Explore activities →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
