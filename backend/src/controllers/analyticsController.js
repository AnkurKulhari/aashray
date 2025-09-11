const Resource = require('../models/Resource');
const User = require('../models/User');
const MoodEntry = require('../models/MoodEntry');
const Goal = require('../models/Goal');
const mongoose = require('mongoose');

// Get comprehensive resource analytics dashboard
const getResourceAnalytics = async (req, res) => {
  try {
    const { 
      timeframe = 'month',
      category,
      type,
      startDate,
      endDate 
    } = req.query;

    // Calculate date range
    let dateFilter = {};
    const now = new Date();
    
    if (startDate && endDate) {
      dateFilter = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      switch (timeframe) {
        case 'day':
          dateFilter = { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
          break;
        case 'week':
          dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
          break;
        case 'month':
          dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
          break;
        case 'year':
          dateFilter = { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) };
          break;
      }
    }

    const baseMatch = {
      isActive: true,
      moderationStatus: 'approved',
      createdAt: dateFilter
    };

    if (category) baseMatch.category = category;
    if (type) baseMatch.type = type;

    // Run parallel analytics queries
    const [
      totalStats,
      viewsOverTime,
      categoryDistribution,
      typeDistribution,
      topResources,
      engagementMetrics,
      userEngagement,
      contentPerformance
    ] = await Promise.all([
      // Total statistics
      Resource.aggregate([
        { $match: baseMatch },
        {
          $group: {
            _id: null,
            totalResources: { $sum: 1 },
            totalViews: { $sum: '$views' },
            totalLikes: { $sum: { $size: '$likes' } },
            totalBookmarks: { $sum: { $size: '$bookmarks' } },
            totalRatings: { $sum: { $size: '$ratings' } },
            avgRating: { $avg: { $avg: '$ratings.rating' } }
          }
        }
      ]),

      // Views over time
      Resource.aggregate([
        { $match: baseMatch },
        {
          $group: {
            _id: {
              $dateToString: {
                format: timeframe === 'day' ? '%Y-%m-%d %H:00' : '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            views: { $sum: '$views' },
            resources: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ]),

      // Category distribution
      Resource.aggregate([
        { $match: baseMatch },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            views: { $sum: '$views' },
            avgRating: { $avg: { $avg: '$ratings.rating' } },
            totalEngagement: {
              $sum: {
                $add: [
                  '$views',
                  { $size: '$likes' },
                  { $size: '$bookmarks' }
                ]
              }
            }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // Type distribution
      Resource.aggregate([
        { $match: baseMatch },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            views: { $sum: '$views' },
            avgRating: { $avg: { $avg: '$ratings.rating' } }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // Top performing resources
      Resource.aggregate([
        { $match: baseMatch },
        {
          $addFields: {
            engagementScore: {
              $add: [
                '$views',
                { $multiply: [{ $size: '$likes' }, 2] },
                { $multiply: [{ $size: '$bookmarks' }, 3] },
                { $multiply: [{ $avg: '$ratings.rating' }, 10] }
              ]
            }
          }
        },
        { $sort: { engagementScore: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: 'createdBy',
            foreignField: '_id',
            as: 'creator'
          }
        },
        {
          $project: {
            title: 1,
            category: 1,
            type: 1,
            views: 1,
            likes: { $size: '$likes' },
            bookmarks: { $size: '$bookmarks' },
            avgRating: { $avg: '$ratings.rating' },
            engagementScore: 1,
            creator: { $arrayElemAt: ['$creator.firstName', 0] }
          }
        }
      ]),

      // Engagement metrics by time
      Resource.aggregate([
        { $match: baseMatch },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            totalViews: { $sum: '$views' },
            totalLikes: { $sum: { $size: '$likes' } },
            totalBookmarks: { $sum: { $size: '$bookmarks' } },
            totalRatings: { $sum: { $size: '$ratings' } }
          }
        },
        { $sort: { '_id': 1 } }
      ]),

      // User engagement patterns
      Resource.aggregate([
        { $match: baseMatch },
        { $unwind: { path: '$likes', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: '$likes.user',
            totalLikes: { $sum: 1 },
            lastActivity: { $max: '$likes.date' }
          }
        },
        {
          $group: {
            _id: null,
            activeUsers: { $sum: 1 },
            avgLikesPerUser: { $avg: '$totalLikes' }
          }
        }
      ]),

      // Content performance analysis
      Resource.aggregate([
        { $match: baseMatch },
        {
          $group: {
            _id: {
              category: '$category',
              difficulty: '$difficulty'
            },
            avgViews: { $avg: '$views' },
            avgRating: { $avg: { $avg: '$ratings.rating' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { avgViews: -1 } }
      ])
    ]);

    const analytics = {
      summary: {
        totalResources: totalStats[0]?.totalResources || 0,
        totalViews: totalStats[0]?.totalViews || 0,
        totalLikes: totalStats[0]?.totalLikes || 0,
        totalBookmarks: totalStats[0]?.totalBookmarks || 0,
        totalRatings: totalStats[0]?.totalRatings || 0,
        averageRating: Math.round((totalStats[0]?.avgRating || 0) * 10) / 10,
        engagementRate: totalStats[0]?.totalViews > 0 ? 
          Math.round(((totalStats[0]?.totalLikes + totalStats[0]?.totalBookmarks) / totalStats[0]?.totalViews) * 100 * 100) / 100 : 0
      },
      trends: {
        viewsOverTime,
        engagementOverTime: engagementMetrics
      },
      distribution: {
        byCategory: categoryDistribution,
        byType: typeDistribution
      },
      topPerformers: topResources,
      userEngagement: userEngagement[0] || { activeUsers: 0, avgLikesPerUser: 0 },
      contentPerformance,
      timeframe,
      generatedAt: new Date()
    };

    res.status(200).json({
      status: 'success',
      data: { analytics }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get specific resource performance metrics
const getResourcePerformance = async (req, res) => {
  try {
    const { resourceId } = req.params;
    const { timeframe = 'month' } = req.query;

    const resource = await Resource.findById(resourceId)
      .populate('createdBy', 'firstName lastName displayName')
      .populate('ratings.user', 'firstName lastName displayName isAnonymous');

    if (!resource) {
      return res.status(404).json({
        status: 'error',
        message: 'Resource not found'
      });
    }

    // Calculate engagement metrics
    const totalRatings = resource.ratings.length;
    const averageRating = totalRatings > 0 ? 
      resource.ratings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings : 0;
    
    const engagementScore = resource.views + 
      (resource.likes.length * 2) + 
      (resource.bookmarks.length * 3) + 
      (averageRating * 10);

    // Rating distribution
    const ratingDistribution = resource.ratings.reduce((dist, rating) => {
      dist[rating.rating] = (dist[rating.rating] || 0) + 1;
      return dist;
    }, {});

    // Engagement over time (simplified - would need actual tracking data)
    const engagementTimeline = resource.ratings.map(rating => ({
      date: rating.date,
      type: 'rating',
      value: rating.rating
    })).concat(
      resource.likes.map(like => ({
        date: like.date,
        type: 'like',
        value: 1
      }))
    ).concat(
      resource.bookmarks.map(bookmark => ({
        date: bookmark.date,
        type: 'bookmark',
        value: 1
      }))
    ).sort((a, b) => new Date(b.date) - new Date(a.date));

    const performance = {
      resource: {
        id: resource._id,
        title: resource.title,
        category: resource.category,
        type: resource.type,
        author: resource.author,
        creator: resource.createdBy,
        publishDate: resource.publishDate
      },
      metrics: {
        views: resource.views,
        likes: resource.likes.length,
        bookmarks: resource.bookmarks.length,
        comments: resource.comments.length,
        ratings: {
          total: totalRatings,
          average: Math.round(averageRating * 10) / 10,
          distribution: ratingDistribution
        },
        engagementScore: Math.round(engagementScore)
      },
      timeline: engagementTimeline.slice(0, 50), // Last 50 engagement events
      comparisons: {
        // Compare with similar resources
        categoryAverage: await getAverageMetricsForCategory(resource.category),
        typeAverage: await getAverageMetricsForType(resource.type)
      },
      recommendations: generatePerformanceRecommendations(resource, engagementScore)
    };

    res.status(200).json({
      status: 'success',
      data: { performance }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get user engagement analytics
const getUserEngagement = async (req, res) => {
  try {
    const { timeframe = 'month' } = req.query;

    let dateFilter = {};
    const now = new Date();
    
    switch (timeframe) {
      case 'week':
        dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case 'month':
        dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
        break;
      case 'year':
        dateFilter = { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) };
        break;
    }

    const [userStats, engagementPatterns, topContributors] = await Promise.all([
      // Overall user engagement stats
      User.aggregate([
        {
          $match: {
            isActive: true,
            lastLogin: dateFilter
          }
        },
        {
          $lookup: {
            from: 'resources',
            let: { userId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $in: ['$$userId', '$likes.user'] },
                  createdAt: dateFilter
                }
              }
            ],
            as: 'likedResources'
          }
        },
        {
          $lookup: {
            from: 'resources',
            let: { userId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $in: ['$$userId', '$bookmarks.user'] },
                  createdAt: dateFilter
                }
              }
            ],
            as: 'bookmarkedResources'
          }
        },
        {
          $group: {
            _id: null,
            totalActiveUsers: { $sum: 1 },
            avgLikesPerUser: { $avg: { $size: '$likedResources' } },
            avgBookmarksPerUser: { $avg: { $size: '$bookmarkedResources' } }
          }
        }
      ]),

      // Engagement patterns by user characteristics
      User.aggregate([
        {
          $match: {
            isActive: true,
            lastLogin: dateFilter
          }
        },
        {
          $group: {
            _id: {
              year: '$year',
              university: '$university'
            },
            userCount: { $sum: 1 },
            avgPoints: { $avg: '$points' }
          }
        },
        { $sort: { userCount: -1 } }
      ]),

      // Top contributors (users who create content)
      User.aggregate([
        {
          $lookup: {
            from: 'resources',
            localField: '_id',
            foreignField: 'createdBy',
            as: 'createdResources'
          }
        },
        {
          $match: {
            'createdResources.0': { $exists: true },
            'createdResources.createdAt': dateFilter
          }
        },
        {
          $addFields: {
            totalViews: { $sum: '$createdResources.views' },
            totalLikes: { $sum: { $map: { input: '$createdResources', as: 'resource', in: { $size: '$$resource.likes' } } } }
          }
        },
        { $sort: { totalViews: -1 } },
        { $limit: 10 },
        {
          $project: {
            name: { $concat: ['$firstName', ' ', '$lastName'] },
            displayName: 1,
            resourceCount: { $size: '$createdResources' },
            totalViews: 1,
            totalLikes: 1,
            avgRating: { $avg: { $map: { input: '$createdResources', as: 'resource', in: { $avg: '$$resource.ratings.rating' } } } }
          }
        }
      ])
    ]);

    const engagement = {
      overview: userStats[0] || { totalActiveUsers: 0, avgLikesPerUser: 0, avgBookmarksPerUser: 0 },
      patterns: engagementPatterns,
      topContributors,
      timeframe,
      generatedAt: new Date()
    };

    res.status(200).json({
      status: 'success',
      data: { engagement }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Helper function to get average metrics for category
const getAverageMetricsForCategory = async (category) => {
  const result = await Resource.aggregate([
    {
      $match: {
        category,
        isActive: true,
        moderationStatus: 'approved'
      }
    },
    {
      $group: {
        _id: null,
        avgViews: { $avg: '$views' },
        avgLikes: { $avg: { $size: '$likes' } },
        avgBookmarks: { $avg: { $size: '$bookmarks' } },
        avgRating: { $avg: { $avg: '$ratings.rating' } }
      }
    }
  ]);

  return result[0] || { avgViews: 0, avgLikes: 0, avgBookmarks: 0, avgRating: 0 };
};

// Helper function to get average metrics for type
const getAverageMetricsForType = async (type) => {
  const result = await Resource.aggregate([
    {
      $match: {
        type,
        isActive: true,
        moderationStatus: 'approved'
      }
    },
    {
      $group: {
        _id: null,
        avgViews: { $avg: '$views' },
        avgLikes: { $avg: { $size: '$likes' } },
        avgBookmarks: { $avg: { $size: '$bookmarks' } },
        avgRating: { $avg: { $avg: '$ratings.rating' } }
      }
    }
  ]);

  return result[0] || { avgViews: 0, avgLikes: 0, avgBookmarks: 0, avgRating: 0 };
};

// Generate performance recommendations
const generatePerformanceRecommendations = (resource, engagementScore) => {
  const recommendations = [];

  if (resource.views < 100) {
    recommendations.push({
      type: 'visibility',
      message: 'Consider improving the title and description to make the resource more discoverable',
      priority: 'high'
    });
  }

  if (resource.ratings.length < 5) {
    recommendations.push({
      type: 'engagement',
      message: 'Encourage users to rate this resource to improve its credibility',
      priority: 'medium'
    });
  }

  if (resource.tags.length < 3) {
    recommendations.push({
      type: 'discoverability',
      message: 'Add more relevant tags to improve searchability',
      priority: 'medium'
    });
  }

  if (!resource.accessibility.hasTranscript && (resource.type === 'video' || resource.type === 'audio')) {
    recommendations.push({
      type: 'accessibility',
      message: 'Add transcripts to improve accessibility and SEO',
      priority: 'high'
    });
  }

  return recommendations;
};

module.exports = {
  getResourceAnalytics,
  getResourcePerformance,
  getUserEngagement
};
