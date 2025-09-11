const CommunityPost = require('../models/Community');
const User = require('../models/User');

// Create a new community post
const createPost = async (req, res) => {
  try {
    const {
      title,
      content,
      type,
      category,
      tags,
      isAnonymous,
      visibility,
      triggerWarnings
    } = req.body;

    // Check for crisis content
    const crisisKeywords = ['suicide', 'self-harm', 'kill myself', 'end it all', 'not worth living'];
    const isCrisisPost = crisisKeywords.some(keyword => 
      content.toLowerCase().includes(keyword) || title.toLowerCase().includes(keyword)
    );

    const post = await CommunityPost.create({
      author: req.user.id,
      title,
      content,
      type,
      category,
      tags: tags || [],
      isAnonymous: isAnonymous || false,
      visibility: visibility || 'public',
      triggerWarnings: triggerWarnings || [],
      isCrisisPost
    });

    // Award points for community engagement
    const user = await User.findById(req.user.id);
    user.addPoints(15, 'Community post creation');
    await user.save();

    // Auto-alert for crisis posts
    if (isCrisisPost) {
      await post.markAsCrisis(req.user.id, 'Auto-detected crisis content. Support resources have been notified.');
    }

    res.status(201).json({
      status: 'success',
      data: {
        post
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get community posts with filtering and pagination
const getPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      type,
      sortBy = 'lastActivity',
      sortOrder = 'desc',
      search
    } = req.query;

    let query = { isModerated: false };

    // Apply visibility filtering based on user
    if (req.user) {
      query.$or = [
        { visibility: 'public' },
        { visibility: 'university_only', author: req.user.id }
      ];
      
      // Add university matching for university_only posts
      if (req.user.university) {
        query.$or.push({
          visibility: 'university_only',
          'author.university': req.user.university
        });
      }
    } else {
      query.visibility = 'public';
    }

    // Apply filters
    if (category) query.category = category;
    if (type) query.type = type;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
      populate: [
        {
          path: 'author',
          select: 'firstName lastName displayName isAnonymous university year'
        },
        {
          path: 'comments.author',
          select: 'firstName lastName displayName isAnonymous'
        }
      ]
    };

    let posts;
    if (search) {
      posts = await CommunityPost.searchPosts(search, { category, type });
    } else {
      posts = await CommunityPost.paginate(query, options);
    }

    res.status(200).json({
      status: 'success',
      results: posts.docs?.length || posts.length,
      pagination: posts.docs ? {
        currentPage: posts.page,
        totalPages: posts.totalPages,
        totalPosts: posts.totalDocs,
        hasNextPage: posts.hasNextPage,
        hasPrevPage: posts.hasPrevPage
      } : null,
      data: {
        posts: posts.docs || posts
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get a specific post
const getPost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id)
      .populate('author', 'firstName lastName displayName isAnonymous university year')
      .populate('comments.author', 'firstName lastName displayName isAnonymous')
      .populate('comments.replies.author', 'firstName lastName displayName isAnonymous');

    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }

    // Check visibility permissions
    if (post.visibility === 'private' && post.author._id.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    // Add view
    await post.addView();

    res.status(200).json({
      status: 'success',
      data: {
        post
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update a post (only by author)
const updatePost = async (req, res) => {
  try {
    const post = await CommunityPost.findOneAndUpdate(
      { _id: req.params.id, author: req.user.id },
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'firstName lastName displayName isAnonymous');

    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found or you do not have permission to edit it'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        post
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Delete a post (only by author)
const deletePost = async (req, res) => {
  try {
    const post = await CommunityPost.findOneAndDelete({
      _id: req.params.id,
      author: req.user.id
    });

    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found or you do not have permission to delete it'
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

// Like/unlike a post
const toggleLike = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }

    await post.toggleLike(req.user.id);

    // Award points to post author for engagement
    if (post.author.toString() !== req.user.id) {
      const author = await User.findById(post.author);
      author.addPoints(2, 'Post liked');
      await author.save();
    }

    res.status(200).json({
      status: 'success',
      data: {
        liked: post.likes.some(like => like.user.toString() === req.user.id),
        likeCount: post.likeCount
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Add a comment to a post
const addComment = async (req, res) => {
  try {
    const { content, isAnonymous } = req.body;

    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }

    await post.addComment(req.user.id, content, isAnonymous || false);

    // Award points for community engagement
    const user = await User.findById(req.user.id);
    user.addPoints(5, 'Comment added');
    await user.save();

    // Award points to post author for engagement
    if (post.author.toString() !== req.user.id) {
      const author = await User.findById(post.author);
      author.addPoints(3, 'Post commented on');
      await author.save();
    }

    const updatedPost = await CommunityPost.findById(req.params.id)
      .populate('comments.author', 'firstName lastName displayName isAnonymous');

    res.status(201).json({
      status: 'success',
      data: {
        post: updatedPost
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Add a reply to a comment
const addReply = async (req, res) => {
  try {
    const { content, isAnonymous } = req.body;
    const { commentId } = req.params;

    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        status: 'error',
        message: 'Comment not found'
      });
    }

    comment.replies.push({
      author: req.user.id,
      content,
      isAnonymous: isAnonymous || false
    });

    await post.save();

    // Award points
    const user = await User.findById(req.user.id);
    user.addPoints(3, 'Reply added');
    await user.save();

    const updatedPost = await CommunityPost.findById(req.params.id)
      .populate('comments.author', 'firstName lastName displayName isAnonymous')
      .populate('comments.replies.author', 'firstName lastName displayName isAnonymous');

    res.status(201).json({
      status: 'success',
      data: {
        post: updatedPost
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Report a post
const reportPost = async (req, res) => {
  try {
    const { reason, description } = req.body;

    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }

    await post.addReport(req.user.id, reason, description);

    res.status(200).json({
      status: 'success',
      message: 'Post reported successfully. Thank you for helping keep our community safe.'
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get trending posts
const getTrendingPosts = async (req, res) => {
  try {
    const { timeframe = 24, limit = 20 } = req.query;

    const trendingPosts = await CommunityPost.getTrending(
      parseInt(timeframe),
      parseInt(limit)
    );

    res.status(200).json({
      status: 'success',
      results: trendingPosts.length,
      data: {
        posts: trendingPosts
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get posts by category
const getPostsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const posts = await CommunityPost.getByCategory(
      category,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      status: 'success',
      results: posts.length,
      data: {
        posts
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get user's own posts
const getMyPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = 'all'
    } = req.query;

    let query = { author: req.user.id };

    if (status !== 'all') {
      query.status = status;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: {
        path: 'author',
        select: 'firstName lastName displayName isAnonymous'
      }
    };

    const posts = await CommunityPost.paginate(query, options);

    res.status(200).json({
      status: 'success',
      results: posts.docs.length,
      pagination: {
        currentPage: posts.page,
        totalPages: posts.totalPages,
        totalPosts: posts.totalDocs,
        hasNextPage: posts.hasNextPage,
        hasPrevPage: posts.hasPrevPage
      },
      data: {
        posts: posts.docs
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Mark comment as helpful
const markCommentHelpful = async (req, res) => {
  try {
    const { commentId } = req.params;

    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        status: 'error',
        message: 'Post not found'
      });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        status: 'error',
        message: 'Comment not found'
      });
    }

    // Check if already marked as helpful by this user
    const alreadyMarked = comment.isHelpful.markedBy.includes(req.user.id);

    if (alreadyMarked) {
      // Remove helpful mark
      comment.isHelpful.markedBy = comment.isHelpful.markedBy.filter(
        id => id.toString() !== req.user.id
      );
    } else {
      // Add helpful mark
      comment.isHelpful.markedBy.push(req.user.id);
      
      // Award points to comment author
      if (comment.author.toString() !== req.user.id) {
        const commentAuthor = await User.findById(comment.author);
        commentAuthor.addPoints(5, 'Helpful comment');
        await commentAuthor.save();
      }
    }

    await post.save();

    res.status(200).json({
      status: 'success',
      data: {
        helpful: !alreadyMarked,
        helpfulCount: comment.isHelpful.markedBy.length
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get peer matching suggestions
const getPeerMatching = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    
    // Find users with similar profiles for peer matching
    const matchCriteria = {
      _id: { $ne: req.user.id },
      university: currentUser.university,
      isActive: true,
      'privacySettings.allowPeerMatching': true
    };

    // Optional additional matching criteria
    if (req.query.sameYear === 'true') {
      matchCriteria.year = currentUser.year;
    }

    if (req.query.sameMajor === 'true') {
      matchCriteria.major = currentUser.major;
    }

    const potentialMatches = await User.find(matchCriteria)
      .select('firstName lastName displayName university year major isAnonymous')
      .limit(10);

    // Get their recent helpful community contributions
    const matchesWithActivity = await Promise.all(
      potentialMatches.map(async (user) => {
        const recentPosts = await CommunityPost.find({
          author: user._id,
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }).limit(3);

        const helpfulComments = await CommunityPost.aggregate([
          { $unwind: '$comments' },
          { $match: { 'comments.author': user._id } },
          { $match: { 'comments.isHelpful.markedBy.1': { $exists: true } } },
          { $limit: 3 }
        ]);

        return {
          user,
          recentActivity: {
            postsCount: recentPosts.length,
            helpfulCommentsCount: helpfulComments.length
          },
          matchScore: calculateMatchScore(currentUser, user)
        };
      })
    );

    // Sort by match score
    matchesWithActivity.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      status: 'success',
      results: matchesWithActivity.length,
      data: {
        matches: matchesWithActivity
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get community statistics
const getCommunityStats = async (req, res) => {
  try {
    const stats = await getCommunityStatistics();

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Helper function to calculate peer match score
const calculateMatchScore = (user1, user2) => {
  let score = 0;

  // Same university (base requirement)
  if (user1.university === user2.university) score += 30;

  // Same year
  if (user1.year === user2.year) score += 20;

  // Same major
  if (user1.major === user2.major) score += 15;

  // Similar age (approximate from year)
  const yearDiff = Math.abs(
    parseInt(user1.year.charAt(0)) - parseInt(user2.year.charAt(0))
  );
  if (yearDiff <= 1) score += 10;

  // Random factor for diversity
  score += Math.floor(Math.random() * 25);

  return score;
};

// Helper function to get community statistics
const getCommunityStatistics = async () => {
  const totalPosts = await CommunityPost.countDocuments({ isModerated: false });
  const totalComments = await CommunityPost.aggregate([
    { $match: { isModerated: false } },
    { $project: { commentCount: { $size: '$comments' } } },
    { $group: { _id: null, total: { $sum: '$commentCount' } } }
  ]);

  const activeUsers = await CommunityPost.distinct('author', {
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  });

  const categoryStats = await CommunityPost.aggregate([
    { $match: { isModerated: false } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const typeStats = await CommunityPost.aggregate([
    { $match: { isModerated: false } },
    { $group: { _id: '$type', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  return {
    totalPosts,
    totalComments: totalComments[0]?.total || 0,
    activeUsersThisWeek: activeUsers.length,
    categoryDistribution: categoryStats,
    typeDistribution: typeStats,
    lastUpdated: new Date().toISOString()
  };
};

module.exports = {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  addReply,
  reportPost,
  getTrendingPosts,
  getPostsByCategory,
  getMyPosts,
  markCommentHelpful,
  getPeerMatching,
  getCommunityStats
};
