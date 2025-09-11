const express = require('express');
const {
  getAIAnalysis,
  getMoodInsights,
  getTrendAnalysis,
  getProgressAnalysis,
  analyzeMoodEntry,
  getPersonalizedRecommendations
} = require('../controllers/aiController');

// Import authentication middleware
const { protect } = require('../controllers/authController');
const { validateMoodAnalysis } = require('../middleware/aiValidation');

const router = express.Router();

// Protect all AI routes - require authentication
router.use(protect);

/**
 * @route   GET /api/v1/ai/analysis
 * @desc    Get comprehensive AI analysis including insights, trends, progress, and risk assessment
 * @access  Private
 * @param   {number} days - Number of days to analyze (default: 30)
 */
router.get('/analysis', getAIAnalysis);

/**
 * @route   GET /api/v1/ai/insights
 * @desc    Get mood-specific AI insights
 * @access  Private
 * @param   {number} limit - Maximum number of insights to return (default: 10)
 */
router.get('/insights', getMoodInsights);

/**
 * @route   GET /api/v1/ai/trends
 * @desc    Get mood trend analysis
 * @access  Private
 * @param   {string} period - Analysis period ('7d', '30d', '90d', default: '30d')
 */
router.get('/trends', getTrendAnalysis);

/**
 * @route   GET /api/v1/ai/progress
 * @desc    Get progress analysis including goals, streaks, strengths, and improvement areas
 * @access  Private
 */
router.get('/progress', getProgressAnalysis);

/**
 * @route   POST /api/v1/ai/analyze-mood
 * @desc    Analyze a mood entry for instant insights and risk factors
 * @access  Private
 * @body    {string} mood - Mood value
 * @body    {string} note - Optional mood note
 * @body    {array} triggers - Optional array of triggers
 * @body    {array} activities - Optional array of activities
 */
router.post('/analyze-mood', validateMoodAnalysis, analyzeMoodEntry);

/**
 * @route   GET /api/v1/ai/recommendations
 * @desc    Get personalized recommendations based on mood patterns and goals
 * @access  Private
 */
router.get('/recommendations', getPersonalizedRecommendations);

module.exports = router;
