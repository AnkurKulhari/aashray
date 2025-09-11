const Resource = require('../models/Resource');
const User = require('../models/User');
const mongoose = require('mongoose');

// Advanced search with fuzzy matching and faceted filtering
const advancedSearch = async (req, res) => {
  try {
    const {
      q, // search query
      category,
      type,
      difficulty,
      targetAudience,
      tags,
      author,
      minRating,
      maxRating,
      hasVideo,
      hasAudio,
      hasWorksheet,
      sortBy = 'relevance',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
      includeFacets = 'true'
    } = req.query;

    const pipeline = [];
    const matchStage = {
      isActive: true,
      moderationStatus: 'approved'
    };

    // Text search stage
    if (q) {
      matchStage.$text = { $search: q };
    }

    // Category filter
    if (category) {
      if (Array.isArray(category)) {
        matchStage.category = { $in: category };
      } else {
        matchStage.category = category;
      }
    }

    // Type filter
    if (type) {
      if (Array.isArray(type)) {
        matchStage.type = { $in: type };
      } else {
        matchStage.type = type;
      }
    }

    // Difficulty filter
    if (difficulty) {
      if (Array.isArray(difficulty)) {
        matchStage.difficulty = { $in: difficulty };
      } else {
        matchStage.difficulty = difficulty;
      }
    }

    // Target audience filter
    if (targetAudience) {
      if (Array.isArray(targetAudience)) {
        matchStage.targetAudience = { $in: targetAudience };
      } else {
        matchStage.targetAudience = targetAudience;
      }
    }

    // Tags filter
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      matchStage.tags = { $in: tagArray };
    }

    // Author filter
    if (author) {
      matchStage['author.name'] = new RegExp(author, 'i');
    }

    // Rating filter
    if (minRating || maxRating) {
      const ratingConditions = [];
      if (minRating) ratingConditions.push({ $gte: parseFloat(minRating) });
      if (maxRating) ratingConditions.push({ $lte: parseFloat(maxRating) });
      
      pipeline.push({
        $addFields: {
          averageRating: {
            $cond: {
              if: { $eq: [{ $size: '$ratings' }, 0] },
              then: 0,
              else: { $avg: '$ratings.rating' }
            }
          }
        }
      });
      
      matchStage.averageRating = ratingConditions.length === 1 ? 
        ratingConditions[0] : 
        { $and: ratingConditions };
    }

    // Content type filters
    if (hasVideo === 'true') {
      matchStage.$or = matchStage.$or || [];
      matchStage.$or.push({ type: 'video' });
    }
    if (hasAudio === 'true') {
      matchStage.$or = matchStage.$or || [];
      matchStage.$or.push({ type: 'audio', type: 'podcast' });
    }
    if (hasWorksheet === 'true') {
      matchStage.$or = matchStage.$or || [];
      matchStage.$or.push({ type: 'worksheet' });
    }

    pipeline.push({ $match: matchStage });

    // Add computed fields for sorting
    pipeline.push({
      $addFields: {
        relevanceScore: q ? { $meta: 'textScore' } : 1,
        popularityScore: {
          $add: [
            '$views',
            { $multiply: [{ $size: '$likes' }, 2] },
            { $multiply: [{ $size: '$bookmarks' }, 3] }
          ]
        },
        avgRating: {
          $cond: {
            if: { $eq: [{ $size: '$ratings' }, 0] },
            then: 0,
            else: { $avg: '$ratings.rating' }
          }
        }
      }
    });

    // Sorting
    let sortStage = {};
    switch (sortBy) {
      case 'relevance':
        sortStage = q ? 
          { relevanceScore: -1, popularityScore: -1 } :
          { popularityScore: -1, createdAt: -1 };
        break;
      case 'popularity':
        sortStage = { popularityScore: sortOrder === 'desc' ? -1 : 1 };
        break;
      case 'rating':
        sortStage = { avgRating: sortOrder === 'desc' ? -1 : 1, popularityScore: -1 };
        break;
      case 'newest':
        sortStage = { createdAt: -1 };
        break;
      case 'oldest':
        sortStage = { createdAt: 1 };
        break;
      default:
        sortStage = { createdAt: -1 };
    }
    
    pipeline.push({ $sort: sortStage });

    // Facets for filtering options (if requested)
    let facets = {};
    if (includeFacets === 'true') {
      const facetPipeline = [...pipeline];
      
      facets = await Resource.aggregate([
        ...facetPipeline.slice(0, -1), // Remove sort stage
        {
          $facet: {
            categories: [
              { $group: { _id: '$category', count: { $sum: 1 } } },
              { $sort: { count: -1 } }
            ],
            types: [
              { $group: { _id: '$type', count: { $sum: 1 } } },
              { $sort: { count: -1 } }
            ],
            difficulties: [
              { $group: { _id: '$difficulty', count: { $sum: 1 } } },
              { $sort: { count: -1 } }
            ],
            targetAudiences: [
              { $group: { _id: '$targetAudience', count: { $sum: 1 } } },
              { $sort: { count: -1 } }
            ],
            authors: [
              { $group: { _id: '$author.name', count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 10 }
            ],
            popularTags: [
              { $unwind: '$tags' },
              { $group: { _id: '$tags', count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 20 }
            ],
            ratingRanges: [
              {
                $bucket: {
                  groupBy: '$avgRating',
                  boundaries: [0, 2, 3, 4, 4.5, 5],
                  default: 'Unrated',
                  output: { count: { $sum: 1 } }
                }
              }
            ]
          }
        }
      ]);
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    // Add population stage
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'createdBy',
        foreignField: '_id',
        as: 'createdBy',
        pipeline: [
          { $project: { firstName: 1, lastName: 1, displayName: 1 } }
        ]
      }
    });

    pipeline.push({
      $unwind: {
        path: '$createdBy',
        preserveNullAndEmptyArrays: true
      }
    });

    // Execute search
    const [searchResults, totalCount] = await Promise.all([
      Resource.aggregate(pipeline),
      Resource.aggregate([
        ...pipeline.slice(0, pipeline.findIndex(stage => '$skip' in stage)),
        { $count: 'total' }
      ])
    ]);

    const total = totalCount[0]?.total || 0;
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    // Log search analytics if user is logged in
    if (req.user) {
      await logSearchAnalytics(req.user.id, q, {
        category,
        type,
        difficulty,
        resultCount: searchResults.length,
        totalResults: total
      });
    }

    res.status(200).json({
      status: 'success',
      results: searchResults.length,
      totalResults: total,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      facets: includeFacets === 'true' ? facets[0] : undefined,
      data: {
        resources: searchResults
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get search suggestions based on query
const getSearchSuggestions = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.length < 2) {
      return res.status(200).json({
        status: 'success',
        data: { suggestions: [] }
      });
    }

    const suggestions = await Resource.aggregate([
      {
        $match: {
          isActive: true,
          moderationStatus: 'approved',
          $or: [
            { title: new RegExp(q, 'i') },
            { tags: new RegExp(q, 'i') },
            { 'author.name': new RegExp(q, 'i') }
          ]
        }
      },
      {
        $addFields: {
          suggestion: {
            $cond: [
              { $regexMatch: { input: '$title', regex: new RegExp(q, 'i') } },
              '$title',
              {
                $cond: [
                  { $in: [new RegExp(q, 'i'), '$tags'] },
                  { $arrayElemAt: [{ $filter: { input: '$tags', cond: { $regexMatch: { input: '$$this', regex: new RegExp(q, 'i') } } } }, 0] },
                  '$author.name'
                ]
              }
            ]
          },
          type: {
            $cond: [
              { $regexMatch: { input: '$title', regex: new RegExp(q, 'i') } },
              'title',
              {
                $cond: [
                  { $in: [new RegExp(q, 'i'), '$tags'] },
                  'tag',
                  'author'
                ]
              }
            ]
          }
        }
      },
      {
        $group: {
          _id: '$suggestion',
          type: { $first: '$type' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $project: {
          _id: 0,
          suggestion: '$_id',
          type: 1,
          count: 1
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: { suggestions }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get popular search terms
const getPopularSearches = async (req, res) => {
  try {
    const { limit = 10, timeframe = 'week' } = req.query;

    // Calculate date range based on timeframe
    let dateFilter = {};
    const now = new Date();
    
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
      default:
        dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
    }

    // This would require a SearchAnalytics model to track searches
    // For now, return most popular resource tags as search terms
    const popularSearches = await Resource.aggregate([
      {
        $match: {
          isActive: true,
          moderationStatus: 'approved',
          createdAt: dateFilter
        }
      },
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          searchCount: { $sum: '$views' }, // Using views as proxy for popularity
          resources: { $sum: 1 }
        }
      },
      { $sort: { searchCount: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          _id: 0,
          term: '$_id',
          count: '$searchCount',
          resourceCount: '$resources'
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: { 
        popularSearches,
        timeframe
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Save search for user (for later recommendations)
const saveSearch = async (req, res) => {
  try {
    const { query, filters } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query is required'
      });
    }

    const user = await User.findById(req.user.id);
    
    // Initialize saved searches if it doesn't exist
    if (!user.savedSearches) {
      user.savedSearches = [];
    }

    // Check if search already exists
    const existingSearch = user.savedSearches.find(
      search => search.query === query && 
      JSON.stringify(search.filters) === JSON.stringify(filters)
    );

    if (existingSearch) {
      return res.status(400).json({
        status: 'error',
        message: 'Search is already saved'
      });
    }

    // Add new saved search
    user.savedSearches.push({
      query,
      filters: filters || {},
      savedAt: new Date()
    });

    // Keep only last 10 saved searches
    if (user.savedSearches.length > 10) {
      user.savedSearches = user.savedSearches.slice(-10);
    }

    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Search saved successfully',
      data: {
        savedSearch: user.savedSearches[user.savedSearches.length - 1]
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get user's saved searches
const getSavedSearches = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('savedSearches');

    res.status(200).json({
      status: 'success',
      data: {
        savedSearches: user.savedSearches || []
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Helper function to log search analytics
const logSearchAnalytics = async (userId, query, metadata) => {
  try {
    // This would typically save to a SearchAnalytics model
    // For now, we'll just log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Search Analytics:', {
        userId,
        query,
        timestamp: new Date(),
        metadata
      });
    }

    // TODO: Implement actual analytics storage when SearchAnalytics model is created
  } catch (error) {
    console.error('Error logging search analytics:', error);
  }
};

module.exports = {
  advancedSearch,
  getSearchSuggestions,
  getPopularSearches,
  saveSearch,
  getSavedSearches
};
