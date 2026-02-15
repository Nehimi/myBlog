const express = require('express');
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const {
  createComment,
  getCommentsByBlogPost,
  updateComment,
  deleteComment,
  toggleCommentLike,
  getMyComments
} = require('../controllers/commentController');

const router = express.Router();

const createCommentValidation = [
  body('content')
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters')
    .trim(),
  body('blogPost')
    .notEmpty()
    .withMessage('Blog post ID is required')
    .isMongoId()
    .withMessage('Invalid blog post ID'),
  body('parent')
    .optional()
    .isMongoId()
    .withMessage('Invalid parent comment ID')
];

const updateCommentValidation = [
  body('content')
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters')
    .trim()
];

router.post('/', auth, createCommentValidation, createComment);
router.get('/blog/:blogPostId', getCommentsByBlogPost);
router.get('/my', auth, getMyComments);
router.put('/:id', auth, updateCommentValidation, updateComment);
router.delete('/:id', auth, deleteComment);
router.post('/:id/like', auth, toggleCommentLike);

module.exports = router;
