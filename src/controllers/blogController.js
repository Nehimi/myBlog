const BlogPost = require('../models/BlogPost');
const { validationResult } = require('express-validator');

// Helper function to generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
};

const createBlogPost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation errors', 
        errors: errors.array() 
      });
    }

    const { title, content, excerpt, category, tags, featuredImage, seo, status } = req.body;

    // Generate slug from title
    let slug = generateSlug(title);
    
    // Check if slug already exists and make it unique
    const existingPost = await BlogPost.findOne({ slug });
    if (existingPost) {
      slug = `${slug}-${Date.now()}`;
    }

    const blogPost = new BlogPost({
      title,
      slug,
      content,
      excerpt,
      category,
      tags: tags || [],
      featuredImage: featuredImage || '',
      author: req.user.id,
      status: status || 'draft',
      seo: seo || {}
    });

    await blogPost.save();
    await blogPost.populate('author', 'username firstName lastName avatar');

    res.status(201).json({
      message: 'Blog post created successfully',
      blogPost
    });
  } catch (error) {
    console.error('Create blog post error:', error);
    res.status(500).json({ message: 'Server error creating blog post' });
  }
};

const getAllBlogPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { category, tags, search, author, status = 'published' } = req.query;
    
    let query = { status };
    
    if (category) {
      query.category = category.toLowerCase();
    }
    
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      query.tags = { $in: tagArray };
    }
    
    if (author) {
      query.author = author;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    const blogPosts = await BlogPost.find(query)
      .populate('author', 'username firstName lastName avatar')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-content');

    const total = await BlogPost.countDocuments(query);

    res.json({
      blogPosts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get blog posts error:', error);
    res.status(500).json({ message: 'Server error fetching blog posts' });
  }
};

const getBlogPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const blogPost = await BlogPost.findOne({ slug, status: 'published' })
      .populate('author', 'username firstName lastName avatar bio');

    if (!blogPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Increment view count
    await BlogPost.findOneAndUpdate(
      { slug }, 
      { $inc: { views: 1 } }
    );

    res.json({ blogPost });
  } catch (error) {
    console.error('Get blog post by slug error:', error);
    res.status(500).json({ message: 'Server error fetching blog post' });
  }
};

const getBlogPostById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const blogPost = await BlogPost.findById(id)
      .populate('author', 'username firstName lastName avatar bio');

    if (!blogPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    if (blogPost.status !== 'published' && 
        (!req.user || (req.user.id !== blogPost.author._id.toString() && req.user.role !== 'admin'))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await BlogPost.findByIdAndUpdate(id, { $inc: { views: 1 } });

    res.json({ blogPost });
  } catch (error) {
    console.error('Get blog post error:', error);
    res.status(500).json({ message: 'Server error fetching blog post' });
  }
};

const updateBlogPost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation errors', 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const updates = req.body;

    const blogPost = await BlogPost.findById(id);
    
    if (!blogPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    if (blogPost.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        blogPost[key] = updates[key];
      }
    });

    await blogPost.save();
    await blogPost.populate('author', 'username firstName lastName avatar');

    res.json({
      message: 'Blog post updated successfully',
      blogPost
    });
  } catch (error) {
    console.error('Update blog post error:', error);
    res.status(500).json({ message: 'Server error updating blog post' });
  }
};

const deleteBlogPost = async (req, res) => {
  try {
    const { id } = req.params;

    const blogPost = await BlogPost.findById(id);
    
    if (!blogPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    if (blogPost.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await BlogPost.findByIdAndDelete(id);

    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Delete blog post error:', error);
    res.status(500).json({ message: 'Server error deleting blog post' });
  }
};

const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const blogPost = await BlogPost.findById(id);
    
    if (!blogPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    const likeIndex = blogPost.likes.indexOf(userId);
    
    if (likeIndex > -1) {
      blogPost.likes.splice(likeIndex, 1);
    } else {
      blogPost.likes.push(userId);
    }

    await blogPost.save();

    res.json({
      message: likeIndex > -1 ? 'Post unliked successfully' : 'Post liked successfully',
      likesCount: blogPost.likes.length,
      isLiked: likeIndex === -1
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: 'Server error toggling like' });
  }
};

const getMyBlogPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { status } = req.query;

    let query = { author: req.user.id };
    
    if (status) {
      query.status = status;
    }

    const blogPosts = await BlogPost.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await BlogPost.countDocuments(query);

    res.json({
      blogPosts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get my blog posts error:', error);
    res.status(500).json({ message: 'Server error fetching your blog posts' });
  }
};

const getBlogPostsByYear = async (req, res) => {
  try {
    const { year } = req.query;
    
    // Set timeout for aggregation
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Aggregation timeout')), 8000);
    });

    // Build aggregation pipeline
    let pipeline = [
      {
        $match: { status: 'published' }
      },
      {
        $group: {
          _id: { $year: '$publishedAt' },
          posts: {
            $push: {
              _id: '$$ROOT._id',
              title: '$title',
              slug: '$slug',
              excerpt: '$excerpt',
              featuredImage: '$featuredImage',
              category: '$category',
              tags: '$tags',
              status: '$status',
              publishedAt: '$publishedAt',
              readTime: '$readTime',
              views: '$views',
              likes: { $size: '$likes' },
              commentsCount: '$commentsCount',
              author: '$author'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: -1 }
      }
    ];

    // If specific year is requested, filter for that year
    if (year) {
      pipeline.unshift({
        $match: { 
          status: 'published',
          $expr: { $eq: [{ $year: '$publishedAt' }, parseInt(year)] }
        }
      });
    }

    // Populate author information
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'posts.author',
        foreignField: '_id',
        as: 'authorInfo'
      }
    });

    pipeline.push({
      $unwind: '$posts'
    });

    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'posts.author',
        foreignField: '_id',
        as: 'authorData'
      }
    });

    pipeline.push({
      $unwind: '$authorData'
    });

    pipeline.push({
      $group: {
        _id: '$_id',
        posts: {
          $push: {
            $mergeObjects: [
              '$posts',
              {
                author: {
                  _id: '$authorData._id',
                  username: '$authorData.username',
                  firstName: '$authorData.firstName',
                  lastName: '$authorData.lastName',
                  avatar: '$authorData.avatar'
                }
              }
            ]
          }
        },
        count: { $first: '$count' }
      }
    });

    pipeline.push({
      $sort: { _id: -1 }
    });

    // Try aggregation with timeout
    const result = await Promise.race([
      BlogPost.aggregate(pipeline),
      timeoutPromise
    ]);

    // Format the response
    const blogPostsByYear = result.map(yearGroup => {
      // Extract posts and populate author properly
      const posts = yearGroup.posts.map(post => ({
        _id: post._id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        featuredImage: post.featuredImage,
        category: post.category,
        tags: post.tags,
        status: post.status,
        publishedAt: post.publishedAt,
        readTime: post.readTime,
        views: post.views,
        likes: post.likes || [],
        likesCount: post.likesCount || 0,
        commentsCount: post.commentsCount || 0,
        author: post.author
      }));

      return {
        year: yearGroup._id,
        posts,
        count: yearGroup.count
      };
    });

    res.json({
      blogPostsByYear,
      totalYears: blogPostsByYear.length,
      totalPosts: blogPostsByYear.reduce((sum, year) => sum + year.count, 0)
    });
  } catch (error) {
    console.error('Get blog posts by year error:', error);
    
    // Handle specific errors
    if (error.message === 'Aggregation timeout') {
      res.status(504).json({ 
        message: 'Request timeout - please try again',
        error: 'AGGREGATION_TIMEOUT'
      });
    } else if (error.name === 'MongoError') {
      res.status(503).json({ 
        message: 'Database temporarily unavailable',
        error: 'DATABASE_ERROR'
      });
    } else {
      res.status(500).json({ 
        message: 'Server error fetching blog posts by year',
        error: error.message 
      });
    }
  }
};

module.exports = {
  createBlogPost,
  getAllBlogPosts,
  getBlogPostBySlug,
  getBlogPostById,
  updateBlogPost,
  deleteBlogPost,
  toggleLike,
  getMyBlogPosts,
  getBlogPostsByYear
};
