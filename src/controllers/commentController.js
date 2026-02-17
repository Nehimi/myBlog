const Comment = require('../models/Comment');
const BlogPost = require('../models/BlogPost');
const { validationResult } = require('express-validator');

const createComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation errors', 
        errors: errors.array() 
      });
    }

    const { content, blogPost, parent } = req.body;

    const blogPostExists = await BlogPost.findById(blogPost);
    if (!blogPostExists) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    if (parent) {
      const parentComment = await Comment.findById(parent);
      if (!parentComment || parentComment.blogPost.toString() !== blogPost) {
        return res.status(400).json({ message: 'Invalid parent comment' });
      }
    }

    const comment = new Comment({
      content,
      author: req.user.id,
      blogPost,
      parent: parent || null
    });

    await comment.save();
    await comment.populate('author', 'username firstName lastName avatar');
    await comment.populate('parent', 'content author');

    res.status(201).json({
      message: 'Comment created successfully',
      comment
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Server error creating comment' });
  }
};

const getCommentsByBlogPost = async (req, res) => {
  try {
    const { blogPostId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const blogPostExists = await BlogPost.findById(blogPostId);
    if (!blogPostExists) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    const comments = await Comment.find({ 
      blogPost: blogPostId, 
      parent: null,
      isApproved: true 
    })
      .populate('author', 'username firstName lastName avatar')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: 'username firstName lastName avatar'
        },
        match: { isApproved: true },
        options: { sort: { createdAt: 1 } }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Comment.countDocuments({ 
      blogPost: blogPostId, 
      parent: null,
      isApproved: true 
    });

    res.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error fetching comments' });
  }
};

const updateComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation errors', 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const { content } = req.body;

    const comment = await Comment.findById(id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    comment.content = content;
    comment.isEdited = true;
    comment.editedAt = new Date();

    await comment.save();
    await comment.populate('author', 'username firstName lastName avatar');

    res.json({
      message: 'Comment updated successfully',
      comment
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: 'Server error updating comment' });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Comment.findByIdAndDelete(id);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error deleting comment' });
  }
};

const toggleCommentLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const likeIndex = comment.likes.indexOf(userId);
    
    if (likeIndex > -1) {
      comment.likes.splice(likeIndex, 1);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();

    res.json({
      message: likeIndex > -1 ? 'Comment unliked successfully' : 'Comment liked successfully',
      likesCount: comment.likes.length,
      isLiked: likeIndex === -1
    });
  } catch (error) {
    console.error('Toggle comment like error:', error);
    res.status(500).json({ message: 'Server error toggling comment like' });
  }
};

const getMyComments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ author: req.user.id })
      .populate('author', 'username firstName lastName avatar')
      .populate('blogPost', 'title slug')
      .populate('parent', 'content')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Comment.countDocuments({ author: req.user.id });

    res.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get my comments error:', error);
    res.status(500).json({ message: 'Server error fetching your comments' });
  }
};

module.exports = {
  createComment,
  getCommentsByBlogPost,
  updateComment,
  deleteComment,
  toggleCommentLike,
  getMyComments
};
