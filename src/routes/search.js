const express = require('express');
const { optionalAuth } = require('../middleware/auth');
const {
  searchBlogPosts,
  getSearchSuggestions,
  getPopularSearches
} = require('../controllers/searchController');

const router = express.Router();

router.get('/posts', optionalAuth, searchBlogPosts);
router.get('/suggestions', getSearchSuggestions);
router.get('/popular', getPopularSearches);

module.exports = router;
