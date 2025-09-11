const express = require('express');
const {
  createMoodEntry,
  getMoodEntries,
  getMoodEntry,
  updateMoodEntry,
  deleteMoodEntry,
  getMoodTrends,
  getMoodPatterns,
  getAIInsights,
  generateMoodReport
} = require('../controllers/moodController');
const { protect } = require('../controllers/authController');
const { validateMoodEntry } = require('../middleware/validation');
const { monitorMoodEntry } = require('../middleware/crisisMonitoring');

const router = express.Router();

// Protect all mood routes - user must be logged in
router.use(protect);

// Mood CRUD operations
router
  .route('/')
  .get(getMoodEntries)
  .post(validateMoodEntry, monitorMoodEntry, createMoodEntry);

router
  .route('/:id')
  .get(getMoodEntry)
  .patch(updateMoodEntry)
  .delete(deleteMoodEntry);

// Analytics and insights endpoints
router.get('/analytics/trends', getMoodTrends);
router.get('/analytics/patterns', getMoodPatterns);
router.get('/analytics/insights', getAIInsights);
router.get('/analytics/report', generateMoodReport);

module.exports = router;
