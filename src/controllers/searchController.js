const BlogPost = require('../models/BlogPost');
const User = require('../models/User');

const searchBlogPosts = async (req, res) => {
  try {
    const {
      q: query,
      category,
      tags,
      author,
      dateFrom,
      dateTo,
      sortBy = 'relevance',
      page = 1,
      limit = 10
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let searchQuery = { status: 'published' };

    if (query) {
      searchQuery.$text = { $search: query };
    }

    if (category) {
      searchQuery.category = category.toLowerCase();
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      searchQuery.tags = { $in: tagArray };
    }

    if (author) {
      const authorUser = await User.findOne({ username: author });
      if (authorUser) {
        searchQuery.author = authorUser._id;
      }
    }

    if (dateFrom || dateTo) {
      searchQuery.publishedAt = {};
      if (dateFrom) {
        searchQuery.publishedAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        searchQuery.publishedAt.$lte = new Date(dateTo);
      }
    }

    let sortOptions = {};
    switch (sortBy) {
      case 'newest':
        sortOptions = { publishedAt: -1 };
        break;
      case 'oldest':
        sortOptions = { publishedAt: 1 };
        break;
      case 'popular':
        sortOptions = { views: -1 };
        break;
      case 'most_liked':
        sortOptions = { 'likes.length': -1 };
        break;
      case 'relevance':
      default:
        if (query) {
          sortOptions = { score: { $meta: 'textScore' } };
        } else {
          sortOptions = { publishedAt: -1 };
        }
        break;
    }

    const blogPosts = await BlogPost.find(searchQuery)
      .populate('author', 'username firstName lastName avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .select('-content');

    const total = await BlogPost.countDocuments(searchQuery);

    const categories = await BlogPost.distinct('category', { status: 'published' });
    const allTags = await BlogPost.distinct('tags', { status: 'published' });

    res.json({
      blogPosts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      },
      filters: {
        categories: categories.sort(),
        tags: allTags.sort()
      },
      searchQuery: {
        query,
        category,
        tags,
        author,
        dateFrom,
        dateTo,
        sortBy
      }
    });
  } catch (error) {
    console.error('Search blog posts error:', error);
    res.status(500).json({ message: 'Server error during search' });
  }
};

const getSearchSuggestions = async (req, res) => {
  try {
    const { q: query } = req.query;

    if (!query || query.length < 2) {
      return res.json({ suggestions: [] });
    }

    const titleSuggestions = await BlogPost.find({
      status: 'published',
      title: { $regex: query, $options: 'i' }
    })
      .select('title slug')
      .limit(5);

    const tagSuggestions = await BlogPost.distinct('tags', {
      status: 'published',
      tags: { $regex: query, $options: 'i' }
    }).then(tags => tags.slice(0, 5));

    const categorySuggestions = await BlogPost.distinct('category', {
      status: 'published',
      category: { $regex: query, $options: 'i' }
    }).then(categories => categories.slice(0, 3));

    const authorSuggestions = await User.find({
      username: { $regex: query, $options: 'i' }
    })
      .select('username firstName lastName')
      .limit(3);

    res.json({
      suggestions: {
        titles: titleSuggestions,
        tags: tagSuggestions,
        categories: categorySuggestions,
        authors: authorSuggestions
      }
    });
  } catch (error) {
    console.error('Get search suggestions error:', error);
    res.status(500).json({ message: 'Server error getting search suggestions' });
  }
};

const getPopularSearches = async (req, res) => {
  try {
    const popularCategories = await BlogPost.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const popularTags = await BlogPost.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 }
    ]);

    const recentPosts = await BlogPost.find({ status: 'published' })
      .select('title slug publishedAt')
      .sort({ publishedAt: -1 })
      .limit(5);

    res.json({
      popularCategories: popularCategories.map(item => ({
        category: item._id,
        count: item.count
      })),
      popularTags: popularTags.map(item => ({
        tag: item._id,
        count: item.count
      })),
      recentPosts
    });
  } catch (error) {
    console.error('Get popular searches error:', error);
    res.status(500).json({ message: 'Server error getting popular searches' });
  }
};

module.exports = {
  searchBlogPosts,
  getSearchSuggestions,
  getPopularSearches
};
