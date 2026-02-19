const request = require('supertest');
const app = require('../../app');
const { createTestUser, createTestBlogPost } = require('../test-utils');

describe('Blog Posts by Year', () => {
  let authHeader;
  let user;

  beforeEach(async () => {
    // Create authenticated user
    const testUser = await createTestUser();
    authHeader = testUser.authHeader;
    user = testUser.user;
  });

  describe('GET /api/blog/by-year', () => {
    test('should get blog posts grouped by year', async () => {
      // Create blog posts from different years
      const posts = [
        {
          title: '2023 Blog Post',
          content: 'Content from 2023',
          category: 'Technology',
          status: 'published',
          publishedAt: new Date('2023-06-15')
        },
        {
          title: '2024 Blog Post 1',
          content: 'Content from 2024',
          category: 'Programming',
          status: 'published',
          publishedAt: new Date('2024-03-10')
        },
        {
          title: '2024 Blog Post 2',
          content: 'More content from 2024',
          category: 'JavaScript',
          status: 'published',
          publishedAt: new Date('2024-08-20')
        },
        {
          title: 'Draft Post',
          content: 'This should not appear',
          category: 'Technology',
          status: 'draft', // Draft posts should be excluded
          publishedAt: new Date('2024-01-01')
        }
      ];

      // Create all test posts
      for (const postData of posts) {
        await createTestBlogPost(authHeader, postData);
      }

      const response = await request(app)
        .get('/api/blog/by-year')
        .expect(200);

      expect(response.body.blogPostsByYear).toBeDefined();
      expect(Array.isArray(response.body.blogPostsByYear)).toBe(true);
      expect(response.body.totalYears).toBeGreaterThan(0);
      expect(response.body.totalPosts).toBeGreaterThan(0);

      // Check that posts are grouped by year
      const years = response.body.blogPostsByYear.map(item => item.year);
      expect(years).toContain(2023);
      expect(years).toContain(2024);

      // Check that draft posts are excluded
      const allPosts = response.body.blogPostsByYear.flatMap(year => year.posts);
      const draftPosts = allPosts.filter(post => post.status === 'draft');
      expect(draftPosts).toHaveLength(0);
    });

    test('should filter blog posts by specific year', async () => {
      // Create posts from different years
      await createTestBlogPost(authHeader, {
        title: '2023 Post',
        content: 'Content from 2023',
        category: 'Technology',
        status: 'published',
        publishedAt: new Date('2023-06-15')
      });

      await createTestBlogPost(authHeader, {
        title: '2024 Post',
        content: 'Content from 2024',
        category: 'Programming',
        status: 'published',
        publishedAt: new Date('2024-03-10')
      });

      const response = await request(app)
        .get('/api/blog/by-year?year=2024')
        .expect(200);

      expect(response.body.blogPostsByYear).toBeDefined();
      expect(response.body.blogPostsByYear).toHaveLength(1);
      expect(response.body.blogPostsByYear[0].year).toBe(2024);
      expect(response.body.blogPostsByYear[0].posts).toHaveLength(1);
      expect(response.body.blogPostsByYear[0].posts[0].title).toBe('2024 Post');
      expect(response.body.totalPosts).toBe(1);
    });

    test('should return empty result for year with no posts', async () => {
      const response = await request(app)
        .get('/api/blog/by-year?year=2025')
        .expect(200);

      expect(response.body.blogPostsByYear).toEqual([]);
      expect(response.body.totalYears).toBe(0);
      expect(response.body.totalPosts).toBe(0);
    });

    test('should include author information in grouped posts', async () => {
      await createTestBlogPost(authHeader, {
        title: 'Test Post',
        content: 'Test content',
        category: 'Technology',
        status: 'published',
        publishedAt: new Date('2024-06-15')
      });

      const response = await request(app)
        .get('/api/blog/by-year')
        .expect(200);

      expect(response.body.blogPostsByYear[0].posts[0].author).toBeDefined();
      expect(response.body.blogPostsByYear[0].posts[0].author._id).toBe(user.id);
      expect(response.body.blogPostsByYear[0].posts[0].author.username).toBe(user.username);
    });

    test('should work without authentication', async () => {
      await createTestBlogPost(authHeader, {
        title: 'Public Post',
        content: 'Public content',
        category: 'Technology',
        status: 'published',
        publishedAt: new Date('2024-06-15')
      });

      const response = await request(app)
        .get('/api/blog/by-year')
        .expect(200);

      expect(response.body.blogPostsByYear).toBeDefined();
      expect(response.body.totalPosts).toBeGreaterThan(0);
    });

    test('should handle invalid year parameter', async () => {
      const response = await request(app)
        .get('/api/blog/by-year?year=invalid')
        .expect(200);

      // Should return empty results for invalid year
      expect(response.body.blogPostsByYear).toEqual([]);
      expect(response.body.totalYears).toBe(0);
      expect(response.body.totalPosts).toBe(0);
    });

    test('should sort years in descending order', async () => {
      // Create posts from multiple years
      const years = [2021, 2023, 2022, 2024];
      for (let i = 0; i < years.length; i++) {
        await createTestBlogPost(authHeader, {
          title: `Post from ${years[i]}`,
          content: `Content from ${years[i]}`,
          category: 'Technology',
          status: 'published',
          publishedAt: new Date(`${years[i]}-06-15`)
        });
      }

      const response = await request(app)
        .get('/api/blog/by-year')
        .expect(200);

      const yearNumbers = response.body.blogPostsByYear.map(item => item.year);
      
      // Should be sorted in descending order
      for (let i = 0; i < yearNumbers.length - 1; i++) {
        expect(yearNumbers[i]).toBeGreaterThan(yearNumbers[i + 1]);
      }
    });

    test('should include correct post metadata', async () => {
      await createTestBlogPost(authHeader, {
        title: 'Test Post',
        content: 'Test content with proper excerpt',
        excerpt: 'This is a test excerpt',
        category: 'JavaScript',
        tags: ['test', 'blog', 'api'],
        status: 'published',
        publishedAt: new Date('2024-06-15')
      });

      const response = await request(app)
        .get('/api/blog/by-year')
        .expect(200);

      const post = response.body.blogPostsByYear[0].posts[0];
      
      expect(post.title).toBe('Test Post');
      expect(post.content).toBe('Test content with proper excerpt');
      expect(post.excerpt).toBe('This is a test excerpt');
      expect(post.category).toBe('JavaScript');
      expect(post.tags).toEqual(['test', 'blog', 'api']);
      expect(post.status).toBe('published');
      expect(post.publishedAt).toBeDefined();
      expect(post.readTime).toBeDefined();
      expect(post.views).toBeDefined();
      expect(post.likesCount).toBeDefined();
      expect(post.commentsCount).toBeDefined();
    });

    test('should handle database errors gracefully', async () => {
      // Mock a database error
      const originalAggregate = require('mongoose').model('BlogPost').aggregate;
      require('mongoose').model('BlogPost').aggregate = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/blog/by-year')
        .expect(500);

      expect(response.body.message).toBe('Server error fetching blog posts by year');

      // Restore original function
      require('mongoose').model('BlogPost').aggregate = originalAggregate;
    });
  });
});
