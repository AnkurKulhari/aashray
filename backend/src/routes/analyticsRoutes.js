const express = require('express');
const {
  getResourceAnalytics,
  getResourcePerformance,
  getUserEngagement
} = require('../controllers/analyticsController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

// Protect all analytics routes - require authentication
router.use(protect);

// Analytics dashboard - accessible to admins and moderators
router.get('/resources', restrictTo('admin', 'moderator'), getResourceAnalytics);
router.get('/users/engagement', restrictTo('admin', 'moderator'), getUserEngagement);

// Resource performance - accessible to creators and admins
router.get('/resources/:resourceId', getResourcePerformance);

module.exports = router;
