const express = require('express');
const {
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
} = require('../controllers/collectionController');
const { protect, restrictTo } = require('../controllers/authController');
const {
  validateCollection,
  validateCollectionProgress
} = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', getCollections);
router.get('/featured', getFeaturedCollections);
router.get('/category/:category', getCollectionsByCategory);
router.get('/:id', getCollection);

// Protected routes (require authentication)
router.use(protect);

// Collection CRUD operations (restricted to content creators and above)
router.post('/', restrictTo('admin', 'moderator', 'content_creator'), validateCollection, createCollection);
router.patch('/:id', restrictTo('admin', 'moderator', 'content_creator'), validateCollection, updateCollection);
router.delete('/:id', restrictTo('admin', 'moderator'), deleteCollection);

// Collection management (admin/moderator only)
router.patch('/:id/feature', restrictTo('admin', 'moderator'), toggleFeature);

// User interactions
router.patch('/:id/follow', toggleFollow);
router.post('/:id/progress', validateCollectionProgress, updateProgress);

module.exports = router;
