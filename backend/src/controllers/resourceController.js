const Resource = require('../models/Resource');
const User = require('../models/User');

// Create a new resource (admin/moderator only)
const createResource = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      category,
      difficulty,
      targetAudience,
      content,
      author,
      tags,
      triggers,
      contentWarning,
      accessibility,
      personalizedFor
    } = req.body;

    // Process content object
    let processedContent = content || {};
    
    // If there's an uploaded file, add it to content
    if (req.uploadedFile) {
      processedContent.file = req.uploadedFile.url;
      processedContent.duration = req.uploadedFile.duration || null;
      
      // Calculate word count for text content
      if (processedContent.text) {
        processedContent.wordCount = processedContent.text.split(/\s+/).length;
      }
    }

    const resource = await Resource.create({
      title,
      description,
      type,
      category,
      difficulty: difficulty || 'beginner',
      targetAudience: targetAudience || 'students',
      content: processedContent,
      author,
      tags: tags || [],
      triggers: triggers || [],
      contentWarning,
      accessibility,
      personalizedFor: personalizedFor || [],
      createdBy: req.user.id,
      moderationStatus: req.user.role === 'admin' ? 'approved' : 'pending' // Admins can auto-approve
    });

    res.status(201).json({
      status: 'success',
      data: {
        resource
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get resources with filtering, search, and pagination
const getResources = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      type,
      difficulty,
      targetAudience,
      search,
      sortBy = 'publishDate',
      sortOrder = 'desc'
    } = req.query;

    let query = { 
      isActive: true, 
      moderationStatus: 'approved' 
    };

    // Apply filters
    if (category) query.category = category;
    if (type) query.type = type;
    if (difficulty) query.difficulty = difficulty;
    if (targetAudience) query.targetAudience = targetAudience;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
      populate: {
        path: 'createdBy',
        select: 'firstName lastName displayName'
      }
    };

    let resources;
    if (search) {
      resources = await Resource.searchResources(search, { category, type, difficulty });
      // Convert to paginated format for consistency
      resources = {
        docs: resources.slice((page - 1) * limit, page * limit),
        totalDocs: resources.length,
        limit: parseInt(limit),
        page: parseInt(page),
        totalPages: Math.ceil(resources.length / limit),
        hasNextPage: page * limit < resources.length,
        hasPrevPage: page > 1
      };
    } else {
      resources = await Resource.paginate(query, options);
    }

    res.status(200).json({
      status: 'success',
      results: resources.docs.length,
      pagination: {
        currentPage: resources.page,
        totalPages: resources.totalPages,
        totalResources: resources.totalDocs,
        hasNextPage: resources.hasNextPage,
        hasPrevPage: resources.hasPrevPage
      },
      data: {
        resources: resources.docs
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get a specific resource
const getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('createdBy', 'firstName lastName displayName')
      .populate('ratings.user', 'firstName lastName displayName isAnonymous')
      .populate('comments.user', 'firstName lastName displayName isAnonymous');

    if (!resource || !resource.isActive || resource.moderationStatus !== 'approved') {
      return res.status(404).json({
        status: 'error',
        message: 'Resource not found'
      });
    }

    // Add view
    await resource.addView();

    res.status(200).json({
      status: 'success',
      data: {
        resource
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update a resource (creator or admin only)
const updateResource = async (req, res) => {
  try {
    const resource = await Resource.findOneAndUpdate(
      { 
        _id: req.params.id,
        $or: [
          { createdBy: req.user.id },
          { $and: [{ moderationStatus: { $ne: 'approved' } }] }, // Allow admins/moderators to edit
        ]
      },
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName displayName');

    if (!resource) {
      return res.status(404).json({
        status: 'error',
        message: 'Resource not found or you do not have permission to edit it'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        resource
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Delete a resource (creator or admin only)
const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findOneAndUpdate(
      { 
        _id: req.params.id,
        $or: [
          { createdBy: req.user.id },
          { $and: [{ moderationStatus: { $ne: 'approved' } }] }, // Allow admins/moderators to delete
        ]
      },
      { isActive: false },
      { new: true }
    );

    if (!resource) {
      return res.status(404).json({
        status: 'error',
        message: 'Resource not found or you do not have permission to delete it'
      });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Like/unlike a resource
const toggleLike = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        status: 'error',
        message: 'Resource not found'
      });
    }

    await resource.toggleLike(req.user.id);

    // Award points to creator for engagement
    if (resource.createdBy.toString() !== req.user.id) {
      const creator = await User.findById(resource.createdBy);
      if (creator) {
        creator.addPoints(2, 'Resource liked');
        await creator.save();
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        liked: resource.likes.some(like => like.user.toString() === req.user.id),
        likeCount: resource.likeCount
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Bookmark/unbookmark a resource
const toggleBookmark = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        status: 'error',
        message: 'Resource not found'
      });
    }

    await resource.toggleBookmark(req.user.id);

    res.status(200).json({
      status: 'success',
      data: {
        bookmarked: resource.bookmarks.some(bookmark => bookmark.user.toString() === req.user.id),
        bookmarkCount: resource.bookmarkCount
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Rate a resource
const rateResource = async (req, res) => {
  try {
    const { rating, review, helpfulness } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        status: 'error',
        message: 'Rating must be between 1 and 5'
      });
    }

    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        status: 'error',
        message: 'Resource not found'
      });
    }

    await resource.addRating(req.user.id, rating, review, helpfulness);

    // Award points for rating
    const user = await User.findById(req.user.id);
    user.addPoints(5, 'Resource rating');
    await user.save();

    // Award points to creator for feedback
    if (resource.createdBy.toString() !== req.user.id) {
      const creator = await User.findById(resource.createdBy);
      if (creator) {
        creator.addPoints(3, 'Resource rated');
        await creator.save();
      }
    }

    res.status(201).json({
      status: 'success',
      data: {
        averageRating: resource.averageRating,
        totalRatings: resource.ratings.length
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Add comment to resource
const addComment = async (req, res) => {
  try {
    const { content } = req.body;

    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        status: 'error',
        message: 'Resource not found'
      });
    }

    resource.comments.push({
      user: req.user.id,
      content
    });

    await resource.save();

    // Award points for engagement
    const user = await User.findById(req.user.id);
    user.addPoints(3, 'Resource comment');
    await user.save();

    const updatedResource = await Resource.findById(req.params.id)
      .populate('comments.user', 'firstName lastName displayName isAnonymous');

    res.status(201).json({
      status: 'success',
      data: {
        resource: updatedResource
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Report a resource
const reportResource = async (req, res) => {
  try {
    const { reason, description } = req.body;

    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        status: 'error',
        message: 'Resource not found'
      });
    }

    resource.reports.push({
      user: req.user.id,
      reason,
      description
    });

    resource.reportCount += 1;

    // Auto-flag if too many reports
    if (resource.reportCount >= 5) {
      resource.moderationStatus = 'flagged';
    }

    await resource.save();

    res.status(200).json({
      status: 'success',
      message: 'Resource reported successfully. Thank you for helping maintain quality content.'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get popular resources
const getPopularResources = async (req, res) => {
  try {
    const { category, limit = 10 } = req.query;

    const popularResources = await Resource.getPopular(category, parseInt(limit));

    res.status(200).json({
      status: 'success',
      results: popularResources.length,
      data: {
        resources: popularResources
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get user's bookmarked resources
const getBookmarkedResources = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const resources = await Resource.find({
      'bookmarks.user': req.user.id,
      isActive: true,
      moderationStatus: 'approved'
    })
    .populate('createdBy', 'firstName lastName displayName')
    .sort({ 'bookmarks.date': -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

    const totalBookmarked = await Resource.countDocuments({
      'bookmarks.user': req.user.id,
      isActive: true,
      moderationStatus: 'approved'
    });

    res.status(200).json({
      status: 'success',
      results: resources.length,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalBookmarked / parseInt(limit)),
        totalResources: totalBookmarked,
        hasNextPage: parseInt(page) * parseInt(limit) < totalBookmarked,
        hasPrevPage: parseInt(page) > 1
      },
      data: {
        resources
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get personalized resource recommendations
const getRecommendations = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const user = await User.findById(req.user.id);

    const recommendations = await generatePersonalizedRecommendations(user, parseInt(limit));

    res.status(200).json({
      status: 'success',
      results: recommendations.length,
      data: {
        resources: recommendations
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get resources by category
const getResourcesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20, difficulty, type } = req.query;

    const query = {
      category,
      isActive: true,
      moderationStatus: 'approved'
    };

    if (difficulty) query.difficulty = difficulty;
    if (type) query.type = type;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { views: -1, publishDate: -1 },
      populate: {
        path: 'createdBy',
        select: 'firstName lastName displayName'
      }
    };

    const resources = await Resource.paginate(query, options);

    res.status(200).json({
      status: 'success',
      results: resources.docs.length,
      pagination: {
        currentPage: resources.page,
        totalPages: resources.totalPages,
        totalResources: resources.totalDocs,
        hasNextPage: resources.hasNextPage,
        hasPrevPage: resources.hasPrevPage
      },
      data: {
        resources: resources.docs
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Helper function to generate personalized recommendations
const generatePersonalizedRecommendations = async (user, limit) => {
  try {
    // Get user's interaction history
    const likedResources = await Resource.find({
      'likes.user': user._id
    }).select('category type difficulty tags');

    const bookmarkedResources = await Resource.find({
      'bookmarks.user': user._id
    }).select('category type difficulty tags');

    // Extract preferences
    const preferences = {
      categories: {},
      types: {},
      difficulties: {},
      tags: {}
    };

    const allInteracted = [...likedResources, ...bookmarkedResources];

    allInteracted.forEach(resource => {
      preferences.categories[resource.category] = (preferences.categories[resource.category] || 0) + 1;
      preferences.types[resource.type] = (preferences.types[resource.type] || 0) + 1;
      preferences.difficulties[resource.difficulty] = (preferences.difficulties[resource.difficulty] || 0) + 1;
      
      resource.tags.forEach(tag => {
        preferences.tags[tag] = (preferences.tags[tag] || 0) + 1;
      });
    });

    // Get top preferences
    const topCategories = Object.keys(preferences.categories).sort((a, b) => 
      preferences.categories[b] - preferences.categories[a]
    ).slice(0, 3);

    const topTypes = Object.keys(preferences.types).sort((a, b) => 
      preferences.types[b] - preferences.types[a]
    ).slice(0, 2);

    // Build recommendation query
    const query = {
      isActive: true,
      moderationStatus: 'approved',
      'likes.user': { $ne: user._id },
      'bookmarks.user': { $ne: user._id }
    };

    // Add preference-based filtering
    if (topCategories.length > 0) {
      query.$or = [
        { category: { $in: topCategories } },
        { targetAudience: user.year || 'students' },
        { tags: { $in: Object.keys(preferences.tags).slice(0, 5) } }
      ];
    }

    const recommendations = await Resource.find(query)
      .populate('createdBy', 'firstName lastName displayName')
      .sort({ views: -1, averageRating: -1, publishDate: -1 })
      .limit(limit);

    return recommendations;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    
    // Fallback to popular resources
    return await Resource.getPopular(null, limit);
  }
};

// MODERATION CONTROLLERS

// List pending resources for moderation
const listPendingResources = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, type } = req.query;
    
    const query = {
      moderationStatus: 'pending',
      isActive: true
    };
    
    if (category) query.category = category;
    if (type) query.type = type;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: 1 }, // Oldest first for FIFO processing
      populate: {
        path: 'createdBy',
        select: 'firstName lastName displayName email'
      }
    };
    
    const resources = await Resource.paginate(query, options);
    
    res.status(200).json({
      status: 'success',
      results: resources.docs.length,
      pagination: {
        currentPage: resources.page,
        totalPages: resources.totalPages,
        totalResources: resources.totalDocs,
        hasNextPage: resources.hasNextPage,
        hasPrevPage: resources.hasPrevPage
      },
      data: {
        resources: resources.docs
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Approve a resource
const approveResource = async (req, res) => {
  try {
    const { moderationNotes } = req.body;
    
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      {
        moderationStatus: 'approved',
        moderatedBy: req.user.id,
        moderationNotes: moderationNotes || 'Approved without notes',
        isVerified: true,
        verifiedBy: req.user.id
      },
      { new: true }
    ).populate('createdBy', 'firstName lastName displayName');
    
    if (!resource) {
      return res.status(404).json({
        status: 'error',
        message: 'Resource not found'
      });
    }
    
    // Award points to creator for approved resource
    const creator = await User.findById(resource.createdBy._id);
    if (creator) {
      creator.addPoints(50, 'Resource approved');
      await creator.save();
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Resource approved successfully',
      data: {
        resource
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Reject a resource
const rejectResource = async (req, res) => {
  try {
    const { moderationNotes } = req.body;
    
    if (!moderationNotes || moderationNotes.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Moderation notes are required when rejecting a resource'
      });
    }
    
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      {
        moderationStatus: 'rejected',
        moderatedBy: req.user.id,
        moderationNotes,
        isActive: false // Hide rejected resources
      },
      { new: true }
    ).populate('createdBy', 'firstName lastName displayName');
    
    if (!resource) {
      return res.status(404).json({
        status: 'error',
        message: 'Resource not found'
      });
    }
    
    // TODO: Send notification to creator about rejection
    
    res.status(200).json({
      status: 'success',
      message: 'Resource rejected',
      data: {
        resource
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

module.exports = {
  createResource,
  getResources,
  getResource,
  updateResource,
  deleteResource,
  toggleLike,
  toggleBookmark,
  rateResource,
  addComment,
  reportResource,
  getPopularResources,
  getBookmarkedResources,
  getRecommendations,
  getResourcesByCategory,
  listPendingResources,
  approveResource,
  rejectResource
};
