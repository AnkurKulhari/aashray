const express = require('express');
const versionController = require('../controllers/versionController');
const { protect, restrictTo } = require('../controllers/authController');
const { 
  validateVersion,
  validateVersionReview,
  validateRollback,
  validateSchedulePublication 
} = require('../middleware/validation');

const router = express.Router();

// Protect all routes - require authentication
router.use(protect);

// Resource version routes
router
  .route('/resources/:resourceId/versions')
  .get(versionController.getVersionHistory)
  .post(
    restrictTo('admin', 'moderator', 'content_creator'),
    validateVersion,
    versionController.createVersion
  );

// Get specific version
router
  .route('/resources/:resourceId/versions/:versionId')
  .get(versionController.getVersion);

// Compare versions
router
  .route('/resources/:resourceId/versions/:versionId/compare/:targetVersionId')
  .get(versionController.compareVersions);

// Version approval/rejection - moderators and admins only
router
  .route('/versions/:versionId/approve')
  .post(
    restrictTo('admin', 'moderator'),
    validateVersionReview,
    versionController.approveVersion
  );

router
  .route('/versions/:versionId/reject')
  .post(
    restrictTo('admin', 'moderator'),
    validateVersionReview,
    versionController.rejectVersion
  );

// Rollback to version - admin only
router
  .route('/resources/:resourceId/rollback/:versionId')
  .post(
    restrictTo('admin'),
    validateRollback,
    versionController.rollbackToVersion
  );

// Schedule publication - moderators and admins
router
  .route('/versions/:versionId/schedule')
  .post(
    restrictTo('admin', 'moderator'),
    validateSchedulePublication,
    versionController.schedulePublication
  )
  .delete(
    restrictTo('admin', 'moderator'),
    versionController.cancelScheduledPublication
  );

// Pending versions for moderation
router
  .route('/versions/pending')
  .get(
    restrictTo('admin', 'moderator'),
    versionController.getPendingVersions
  );

// Version metrics and analytics - admin only
router
  .route('/versions/metrics')
  .get(
    restrictTo('admin'),
    versionController.getVersionMetrics
  );

// Get scheduled versions - admin and moderator
router
  .route('/versions/scheduled')
  .get(
    restrictTo('admin', 'moderator'),
    versionController.getScheduledVersions
  );

// Version activity feed - admin only
router
  .route('/versions/activity')
  .get(
    restrictTo('admin'),
    versionController.getVersionActivity
  );

module.exports = router;
