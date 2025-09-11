const express = require('express');
const {
  createGoal,
  getGoals,
  getGoal,
  updateGoal,
  deleteGoal,
  updateGoalProgress,
  addGoalChallenge,
  resolveGoalChallenge,
  getGoalAnalytics,
  getGoalsByStatus,
  getOverdueGoals,
  getGoalReminders,
  getGoalRecommendations
} = require('../controllers/goalController');
const { protect } = require('../controllers/authController');
const { validateGoal } = require('../middleware/validation');
const { monitorGoalUpdate } = require('../middleware/crisisMonitoring');

const router = express.Router();

// Protect all goal routes - user must be logged in
router.use(protect);

// Goal CRUD operations
router
  .route('/')
  .get(getGoals)
  .post(validateGoal, monitorGoalUpdate, createGoal);

router
  .route('/:id')
  .get(getGoal)
  .patch(updateGoal)
  .delete(deleteGoal);

// Goal progress and management
router.patch('/:id/progress', monitorGoalUpdate, updateGoalProgress);
router.post('/:id/challenges', addGoalChallenge);
router.patch('/:id/challenges/resolve', resolveGoalChallenge);

// Analytics and insights endpoints
router.get('/analytics/overview', getGoalAnalytics);
router.get('/status/:status', getGoalsByStatus);
router.get('/overdue', getOverdueGoals);
router.get('/reminders', getGoalReminders);
router.get('/recommendations', getGoalRecommendations);

module.exports = router;
