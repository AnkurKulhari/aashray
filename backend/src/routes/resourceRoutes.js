const express = require('express');
const {
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
  approveResource,
  rejectResource,
  listPendingResources
} = require('../controllers/resourceController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

// Validation
const { 
  validateResource, 
  validateResourceRating, 
  validateResourceComment, 
  validateResourceReport 
} = require('../middleware/validation');

// File upload middleware
const {
  uploadResourceFile,
  handleResourceUpload,
  validateFileUpload,
  handleMulterError
} = require('../middleware/fileUpload');

// Protect all resource routes - user must be logged in
router.use(protect);

// File upload route
router.post('/upload', 
  restrictTo('admin','moderator','content_creator'), 
  uploadResourceFile, 
  validateFileUpload, 
  handleResourceUpload,
  (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'File uploaded successfully',
      data: {
        file: req.uploadedFile
      }
    });
  }
);

// Resource CRUD operations
router
  .route('/')
  .get(getResources)
  .post(restrictTo('admin','moderator','content_creator'), validateResource, createResource);

router
  .route('/:id')
  .get(getResource)
  .patch(restrictTo('admin','moderator','content_creator'), validateResource, updateResource)
  .delete(restrictTo('admin','moderator'), deleteResource);

// Resource interactions
router.patch('/:id/like', toggleLike);
router.patch('/:id/bookmark', toggleBookmark);
router.post('/:id/rate', validateResourceRating, rateResource);
router.post('/:id/comments', validateResourceComment, addComment);
router.post('/:id/report', validateResourceReport, reportResource);

// Moderation endpoints
router.get('/moderation/pending', restrictTo('admin','moderator'), listPendingResources);
router.patch('/:id/approve', restrictTo('admin','moderator'), approveResource);
router.patch('/:id/reject', restrictTo('admin','moderator'), rejectResource);

// Discovery and recommendations
router.get('/discover/popular', getPopularResources);
router.get('/discover/recommendations', getRecommendations);
router.get('/my/bookmarks', getBookmarkedResources);
router.get('/category/:category', getResourcesByCategory);

// Apply error handling for file uploads
router.use(handleMulterError);

module.exports = router;
