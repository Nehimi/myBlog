import express from 'express';
import { body } from 'express-validator';
import { auth, optionalAuth } from '../middleware/auth.js';
import {
  createBlogPost,
  getAllBlogPosts,
  getBlogPostBySlug,
  getBlogPostById,
  updateBlogPost,
  deleteBlogPost,
  toggleLike,
  getMyBlogPosts,
  getBlogPostsByYear
} from '../controllers/blogController.js';

const router = express.Router();

const createBlogPostValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters')
    .trim(),
  body('content')
    .notEmpty()
    .withMessage('Content is required')
    .trim(),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .trim(),
  body('excerpt')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Excerpt cannot exceed 500 characters')
    .trim(),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('featuredImage')
    .optional()
    .isURL()
    .withMessage('Featured image must be a valid URL'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be draft, published, or archived')
];

const updateBlogPostValidation = [
  body('title')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters')
    .trim(),
  body('content')
    .optional()
    .trim(),
  body('category')
    .optional()
    .trim(),
  body('excerpt')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Excerpt cannot exceed 500 characters')
    .trim(),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('featuredImage')
    .optional()
    .isURL()
    .withMessage('Featured image must be a valid URL'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be draft, published, or archived')
];

router.post('/', auth, createBlogPostValidation, createBlogPost);
router.get('/', optionalAuth, getAllBlogPosts);
router.get('/by-year', optionalAuth, getBlogPostsByYear);
router.get('/my', auth, getMyBlogPosts);
router.get('/slug/:slug', optionalAuth, getBlogPostBySlug);
router.get('/:id', optionalAuth, getBlogPostById);
router.put('/:id', auth, updateBlogPostValidation, updateBlogPost);
router.delete('/:id', auth, deleteBlogPost);
router.post('/:id/like', auth, toggleLike);

export default router;
