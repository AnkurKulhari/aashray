const express = require('express');
const {
  advancedSearch,
  getSearchSuggestions,
  getPopularSearches,
  saveSearch,
  getSavedSearches
} = require('../controllers/searchController');
const { protect } = require('../controllers/authController');

const router = express.Router();

// Public search routes (don't require authentication)
router.get('/search', advancedSearch);
router.get('/suggestions', getSearchSuggestions);
router.get('/popular', getPopularSearches);

// Protected search routes (require authentication)
router.use(protect);

router.post('/save', saveSearch);
router.get('/saved', getSavedSearches);

module.exports = router;
