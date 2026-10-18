import express from 'express';
import { optionalAuth } from '../middleware/auth.js';
import {
  searchBlogPosts,
  getSearchSuggestions,
  getPopularSearches
} from '../controllers/searchController.js';


const router = express.Router();

router.get('/posts', optionalAuth, searchBlogPosts);
router.get('/suggestions', getSearchSuggestions);
router.get('/popular', getPopularSearches);

export default router;
