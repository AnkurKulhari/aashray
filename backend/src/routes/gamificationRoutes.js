const express = require('express');
const {
  getProfile,
  getAvailableAchievements,
  listAchievements,
  evaluateAndAward,
  getLeaderboard,
  grantPoints
} = require('../controllers/gamificationController');
const { protect } = require('../controllers/authController');

const router = express.Router();

// Protect all gamification routes
router.use(protect);

// User gamification profile
router.get('/profile', getProfile);

// Achievements
router.get('/achievements', listAchievements);
router.get('/achievements/available', getAvailableAchievements);
router.post('/achievements/evaluate', evaluateAndAward);

// Leaderboard
router.get('/leaderboard', getLeaderboard);

// Admin/Manual point management (TODO: add admin role check)
router.post('/points/grant', grantPoints);

module.exports = router;
