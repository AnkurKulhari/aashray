import React, { useState } from 'react';
import { BookOpen, Video, FileText, ExternalLink, Search, Star, Clock, User } from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'blog' | 'guide';
  url: string;
  author?: string;
  duration?: string;
  rating: number;
  tags: string[];
  category: string;
}

const Resources: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const resources: Resource[] = [
    {
      id: '1',
      title: '10 Minute Guided Meditation for Anxiety',
      description: 'A calming meditation session specifically designed to help reduce anxiety and promote relaxation.',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=ZToicYcHIOU',
      author: 'Headspace',
      duration: '10 min',
      rating: 4.8,
      tags: ['meditation', 'anxiety', 'relaxation'],
      category: 'Mental Health'
    },
    {
      id: '2',
      title: 'Understanding Depression: A Complete Guide',
      description: 'Comprehensive guide to understanding depression symptoms, causes, and effective treatment options.',
      type: 'article',
      url: 'https://www.mayoclinic.org/diseases-conditions/depression/symptoms-causes/syc-20356007',
      author: 'Mayo Clinic',
      duration: '15 min read',
      rating: 4.9,
      tags: ['depression', 'mental health', 'treatment'],
      category: 'Education'
    },
    {
      id: '3',
      title: 'Stress Management Techniques for Students',
      description: 'Practical strategies and techniques specifically designed to help students manage academic stress effectively.',
      type: 'blog',
      url: 'https://www.apa.org/science/about/psa/2013/02/managing-stress',
      author: 'American Psychological Association',
      duration: '12 min read',
      rating: 4.7,
      tags: ['stress', 'students', 'academic'],
      category: 'Wellness'
    },
    {
      id: '4',
      title: 'Breathing Exercises for Panic Attacks',
      description: 'Step-by-step video guide showing effective breathing techniques to manage and reduce panic attacks.',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=tEmt1Znux58',
      author: 'Therapy in a Nutshell',
      duration: '8 min',
      rating: 4.9,
      tags: ['breathing', 'panic attacks', 'techniques'],
      category: 'Crisis Support'
    },
    {
      id: '5',
      title: 'Building Self-Esteem: A Practical Guide',
      description: 'Evidence-based strategies for improving self-esteem and developing a positive self-image.',
      type: 'guide',
      url: 'https://www.nhs.uk/mental-health/self-help/tips-and-support/raise-low-self-esteem/',
      author: 'NHS Mental Health',
      duration: '20 min read',
      rating: 4.6,
      tags: ['self-esteem', 'confidence', 'self-help'],
      category: 'Personal Growth'
    },
    {
      id: '6',
      title: 'The Science of Happiness',
      description: 'Explore the psychological and neuroscientific research behind happiness and well-being.',
      type: 'article',
      url: 'https://www.health.harvard.edu/mind-and-mood/the-science-of-well-being',
      author: 'Harvard Health',
      duration: '18 min read',
      rating: 4.8,
      tags: ['happiness', 'science', 'well-being'],
      category: 'Education'
    },
    {
      id: '7',
      title: 'Progressive Muscle Relaxation Tutorial',
      description: 'Learn progressive muscle relaxation technique with this comprehensive video tutorial.',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=ihO02wUzgkc',
      author: 'University of California',
      duration: '15 min',
      rating: 4.7,
      tags: ['relaxation', 'muscle tension', 'stress relief'],
      category: 'Wellness'
    },
    {
      id: '8',
      title: 'Mindfulness in Daily Life',
      description: 'Personal blog sharing practical tips on incorporating mindfulness practices into your daily routine.',
      type: 'blog',
      url: 'https://www.mindful.org/meditation/mindfulness-getting-started/',
      author: 'Mindful.org',
      duration: '10 min read',
      rating: 4.5,
      tags: ['mindfulness', 'daily life', 'meditation'],
      category: 'Wellness'
    },
    {
      id: '9',
      title: 'Dealing with Social Anxiety',
      description: 'Comprehensive guide on understanding and managing social anxiety in various situations.',
      type: 'guide',
      url: 'https://adaa.org/understanding-anxiety/social-anxiety-disorder',
      author: 'ADAA',
      duration: '25 min read',
      rating: 4.8,
      tags: ['social anxiety', 'social situations', 'coping'],
      category: 'Mental Health'
    },
    {
      id: '10',
      title: 'Sleep Hygiene for Better Mental Health',
      description: 'Learn how proper sleep habits can significantly improve your mental health and overall well-being.',
      type: 'article',
      url: 'https://www.sleepfoundation.org/how-sleep-works/why-do-we-need-sleep',
      author: 'Sleep Foundation',
      duration: '14 min read',
      rating: 4.6,
      tags: ['sleep', 'mental health', 'hygiene'],
      category: 'Wellness'
    }
  ];

  const categories = ['all', 'Mental Health', 'Wellness', 'Education', 'Personal Growth', 'Crisis Support'];
  const types = [
    { key: 'all', label: 'All Types', icon: BookOpen },
    { key: 'article', label: 'Articles', icon: FileText },
    { key: 'video', label: 'Videos', icon: Video },
    { key: 'blog', label: 'Blogs', icon: FileText },
    { key: 'guide', label: 'Guides', icon: BookOpen }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesFilter = activeFilter === 'all' || resource.category === activeFilter || resource.type === activeFilter;
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'article': return FileText;
      case 'blog': return FileText;
      case 'guide': return BookOpen;
      default: return BookOpen;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-100 text-red-800';
      case 'article': return 'bg-blue-100 text-blue-800';
      case 'blog': return 'bg-green-100 text-green-800';
      case 'guide': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mental Health Resources</h1>
        <p className="text-gray-600">Curated articles, videos, and guides to support your mental health journey</p>
      </div>

      {/* Search and Filters */}
      <div className="card p-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>

          {/* Type Filters */}
          <div className="flex flex-wrap gap-2">
            {types.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveFilter(category)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  activeFilter === category
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
              >
                {category === 'all' ? 'All Categories' : category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resource Results */}
      <div className="text-sm text-gray-600 mb-4">
        Showing {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''}
        {activeFilter !== 'all' && ` in ${activeFilter}`}
        {searchTerm && ` for "${searchTerm}"`}
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => {
          const TypeIcon = getTypeIcon(resource.type);
          return (
            <div key={resource.id} className="card p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <TypeIcon className="w-5 h-5 text-gray-600" />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(resource.type)}`}>
                      {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">{resource.rating}</span>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{resource.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">{resource.description}</p>
                </div>

                {/* Meta Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{resource.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{resource.duration}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {resource.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                        #{tag}
                      </span>
                    ))}
                    {resource.tags.length > 3 && (
                      <span className="text-gray-400 text-xs">+{resource.tags.length - 3} more</span>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => window.open(resource.url, '_blank')}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <span>
                    {resource.type === 'video' ? 'Watch' : 'Read'}
                  </span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredResources.length === 0 && (
        <div className="card p-8 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No resources found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search terms or filters to find what you're looking for.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setActiveFilter('all');
            }}
            className="btn-secondary"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Featured Resources Section */}
      <div className="card p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Crisis Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">24/7 Crisis Text Line</h3>
            <p className="text-sm text-gray-600 mb-3">Free, 24/7 support for those in crisis</p>
            <button
              onClick={() => window.open('https://www.crisistextline.org', '_blank')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Get Help Now →
            </button>
          </div>
          <div className="p-4 bg-white rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">National Suicide Prevention Lifeline</h3>
            <p className="text-sm text-gray-600 mb-3">Call 988 for immediate support</p>
            <button
              onClick={() => window.open('https://suicidepreventionlifeline.org', '_blank')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Learn More →
            </button>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="card p-4 bg-yellow-50 border border-yellow-200">
        <p className="text-sm text-yellow-800">
          <strong>Disclaimer:</strong> These resources are for informational purposes only and should not replace professional medical advice. 
          If you're experiencing a mental health crisis, please contact emergency services or a mental health professional immediately.
        </p>
      </div>
    </div>
  );
};

export default Resources;
