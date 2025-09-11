const Collection = require('../models/Collection');
const Resource = require('../models/Resource');
const User = require('../models/User');

// Create a new collection (admin/moderator/content_creator)
const createCollection = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      category,
      coverImage,
      color,
      icon,
      resources = [],
      learningPath = {},
      targetAudience = 'students',
      tags = [],
      visibility = 'public',
      status = 'draft',
      isFeatured = false,
      isPromoted = false
    } = req.body;

    const collection = await Collection.create({
      title,
      description,
      type,
      category,
      coverImage,
      color,
      icon,
      resources,
      learningPath: {
        isLearningPath: type === 'learning_path',
        ...learningPath
      },
      targetAudience,
      tags,
      visibility,
      status,
      isFeatured,
      isPromoted,
      curator: req.user.id,
      moderationStatus: req.user.role === 'admin' ? 'approved' : 'pending'
    });

    res.status(201).json({ status: 'success', data: { collection } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Get collections with filters and pagination
const getCollections = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      category,
      difficulty,
      targetAudience,
      q,
      onlyFeatured = 'false'
    } = req.query;

    const query = { isActive: true, status: 'published', visibility: 'public' };
    if (type) query.type = type;
    if (category) query.category = category;
    if (targetAudience) query.targetAudience = targetAudience;
    if (difficulty) query['learningPath.difficulty'] = difficulty;
    if (onlyFeatured === 'true') query.isFeatured = true;
    if (q) query.$text = { $search: q };

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { isPromoted: -1, views: -1, createdAt: -1 },
      populate: [
        { path: 'resources.resource', select: 'title type category difficulty views' },
        { path: 'curator', select: 'firstName lastName displayName' }
      ]
    };

    const collections = await Collection.paginate(query, options);

    res.status(200).json({
      status: 'success',
      results: collections.docs.length,
      pagination: {
        currentPage: collections.page,
        totalPages: collections.totalPages,
        totalCollections: collections.totalDocs,
        hasNextPage: collections.hasNextPage,
        hasPrevPage: collections.hasPrevPage
      },
      data: { collections: collections.docs }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get a single collection (and increment views)
const getCollection = async (req, res) => {
  try {
    const collection = await Collection.findOne({ _id: req.params.id, isActive: true })
      .populate('resources.resource', 'title type category difficulty views')
      .populate('curator', 'firstName lastName displayName')
      .populate('reviews.user', 'firstName lastName displayName isAnonymous');

    if (!collection || collection.status !== 'published' || collection.visibility === 'private') {
      return res.status(404).json({ status: 'error', message: 'Collection not found' });
    }

    collection.views += 1;
    await collection.save();

    res.status(200).json({ status: 'success', data: { collection } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Update a collection (curator or admin/moderator)
const updateCollection = async (req, res) => {
  try {
    const collection = await Collection.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [
          { curator: req.user.id },
          { moderationStatus: { $ne: 'approved' } }
        ]
      },
      req.body,
      { new: true, runValidators: true }
    )
      .populate('resources.resource', 'title type category difficulty views')
      .populate('curator', 'firstName lastName displayName');

    if (!collection) {
      return res.status(404).json({ status: 'error', message: 'Collection not found or no permission' });
    }

    res.status(200).json({ status: 'success', data: { collection } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Delete (archive) a collection
const deleteCollection = async (req, res) => {
  try {
    const collection = await Collection.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [
          { curator: req.user.id },
          { moderationStatus: { $ne: 'approved' } }
        ]
      },
      { isActive: false, status: 'archived' },
      { new: true }
    );

    if (!collection) {
      return res.status(404).json({ status: 'error', message: 'Collection not found or no permission' });
    }

    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Feature/unfeature a collection (admin/moderator)
const toggleFeature = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) return res.status(404).json({ status: 'error', message: 'Collection not found' });

    collection.isFeatured = !collection.isFeatured;
    await collection.save();

    res.status(200).json({ status: 'success', data: { isFeatured: collection.isFeatured } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Follow/unfollow a collection
const toggleFollow = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    if (!collection) return res.status(404).json({ status: 'error', message: 'Collection not found' });

    const index = collection.followers.findIndex(f => f.user.toString() === req.user.id);
    if (index > -1) {
      collection.followers.splice(index, 1);
    } else {
      collection.followers.push({ user: req.user.id });
    }
    await collection.save();

    res.status(200).json({
      status: 'success',
      data: { following: index === -1, followers: collection.followerCount }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Update user progress on a collection (learning paths)
const updateProgress = async (req, res) => {
  try {
    const { resourceId, completed, timeSpent, rating } = req.body;
    const collection = await Collection.findById(req.params.id);
    if (!collection) return res.status(404).json({ status: 'error', message: 'Collection not found' });

    await collection.updateUserProgress(req.user.id, resourceId, { completed, timeSpent, rating });
    const updated = await Collection.findById(req.params.id)
      .populate('userProgress.user', 'firstName lastName displayName')
      .populate('resources.resource', 'title');

    res.status(200).json({ status: 'success', data: { collection: updated } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Get featured collections
const getFeaturedCollections = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const collections = await Collection.getFeatured(parseInt(limit));
    res.status(200).json({ status: 'success', results: collections.length, data: { collections } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get collections by category (with optional type/difficulty)
const getCollectionsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { type, difficulty } = req.query;
    const collections = await Collection.getByCategory(category, { type, difficulty });
    res.status(200).json({ status: 'success', results: collections.length, data: { collections } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = {
  createCollection,
  getCollections,
  getCollection,
  updateCollection,
  deleteCollection,
  toggleFeature,
  toggleFollow,
  updateProgress,
  getFeaturedCollections,
  getCollectionsByCategory
};
