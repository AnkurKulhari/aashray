const express = require('express');
const {
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
} = require('../controllers/communityController');
const { protect } = require('../controllers/authController');
const { validateCommunityPost } = require('../middleware/validation');

const router = express.Router();

// Protect all community routes - user must be logged in
router.use(protect);

// Post CRUD operations
router
  .route('/posts')
  .get(getPosts)
  .post(validateCommunityPost, createPost);

router
  .route('/posts/:id')
  .get(getPost)
  .patch(updatePost)
  .delete(deletePost);

// Post interactions
router.patch('/posts/:id/like', toggleLike);
router.post('/posts/:id/comments', addComment);
router.post('/posts/:id/comments/:commentId/replies', addReply);
router.post('/posts/:id/report', reportPost);
router.patch('/posts/:id/comments/:commentId/helpful', markCommentHelpful);

// Specialized endpoints
router.get('/trending', getTrendingPosts);
router.get('/category/:category', getPostsByCategory);
router.get('/my-posts', getMyPosts);

// Peer support and matching
router.get('/peer-matching', getPeerMatching);

// Community analytics
router.get('/stats', getCommunityStats);

module.exports = router;
