const request = require('supertest');
const app = require('../../app');
const User = require('../../src/models/User');
const BlogPost = require('../../src/models/BlogPost');

describe('Blog Posts Endpoints', () => {
  let authHeader;
  let user;

  beforeEach(async () => {
    // Create and authenticate user
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123',
      firstName: 'Test',
      lastName: 'User'
    };

    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(userData);

    authHeader = `Bearer ${registerResponse.body.token}`;
    user = registerResponse.body.user;
  });

  describe('POST /api/blog', () => {
    test('should create a blog post successfully', async () => {
      const postData = {
        title: 'Test Blog Post',
        content: 'This is the content of the test blog post.',
        category: 'Technology',
        excerpt: 'This is a test excerpt',
        tags: ['test', 'blog', 'nodejs']
      };

      const response = await request(app)
        .post('/api/blog')
        .set('Authorization', authHeader)
        .send(postData)
        .expect(201);

      expect(response.body.message).toBe('Blog post created successfully');
      expect(response.body.blogPost.title).toBe(postData.title);
      expect(response.body.blogPost.content).toBe(postData.content);
      expect(response.body.blogPost.author._id).toBe(user.id);
    });

    test('should return 401 without authentication', async () => {
      const postData = {
        title: 'Test Blog Post',
        content: 'This is the content.',
        category: 'Technology'
      };

      const response = await request(app)
        .post('/api/blog')
        .send(postData)
        .expect(401);

      expect(response.body.message).toBe('Access denied. No token provided.');
    });

    test('should return 400 for missing required fields', async () => {
      const postData = {
        title: 'Test Blog Post'
        // Missing content and category
      };

      const response = await request(app)
        .post('/api/blog')
        .set('Authorization', authHeader)
        .send(postData)
        .expect(400);

      expect(response.body.message).toBe('Validation errors');
    });
  });

  describe('GET /api/blog', () => {
    beforeEach(async () => {
      // Create test blog posts
      const postData = {
        title: 'Test Blog Post',
        content: 'This is the content of the test blog post.',
        category: 'Technology',
        status: 'published'
      };

      await request(app)
        .post('/api/blog')
        .set('Authorization', authHeader)
        .send(postData);

      await request(app)
        .post('/api/blog')
        .set('Authorization', authHeader)
        .send({
          ...postData,
          title: 'Another Test Post',
          category: 'Programming'
        });
    });

    test('should get all blog posts', async () => {
      const response = await request(app)
        .get('/api/blog')
        .expect(200);

      expect(response.body.blogPosts).toBeDefined();
      expect(response.body.blogPosts.length).toBe(2);
      expect(response.body.pagination).toBeDefined();
    });

    test('should filter posts by category', async () => {
      const response = await request(app)
        .get('/api/blog?category=Technology')
        .expect(200);

      expect(response.body.blogPosts.length).toBe(1);
      expect(response.body.blogPosts[0].category).toBe('technology');
    });

    test('should paginate results', async () => {
      const response = await request(app)
        .get('/api/blog?page=1&limit=1')
        .expect(200);

      expect(response.body.blogPosts.length).toBe(1);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.pages).toBe(2);
    });
  });

  describe('GET /api/blog/:id', () => {
    let postId;

    beforeEach(async () => {
      const postData = {
        title: 'Test Blog Post',
        content: 'This is the content of the test blog post.',
        category: 'Technology',
        status: 'published'
      };

      const response = await request(app)
        .post('/api/blog')
        .set('Authorization', authHeader)
        .send(postData);

      postId = response.body.blogPost._id;
    });

    test('should get a single blog post', async () => {
      const response = await request(app)
        .get(`/api/blog/${postId}`)
        .expect(200);

      expect(response.body.blogPost._id).toBe(postId);
      expect(response.body.blogPost.title).toBe('Test Blog Post');
    });

    test('should return 404 for non-existent post', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/blog/${fakeId}`)
        .expect(404);

      expect(response.body.message).toBe('Blog post not found');
    });
  });

  describe('PUT /api/blog/:id', () => {
    let postId;

    beforeEach(async () => {
      const postData = {
        title: 'Test Blog Post',
        content: 'This is the content of the test blog post.',
        category: 'Technology'
      };

      const response = await request(app)
        .post('/api/blog')
        .set('Authorization', authHeader)
        .send(postData);

      postId = response.body.blogPost._id;
    });

    test('should update blog post successfully', async () => {
      const updateData = {
        title: 'Updated Blog Post',
        content: 'Updated content',
        category: 'Programming'
      };

      const response = await request(app)
        .put(`/api/blog/${postId}`)
        .set('Authorization', authHeader)
        .send(updateData)
        .expect(200);

      expect(response.body.blogPost.title).toBe(updateData.title);
      expect(response.body.blogPost.content).toBe(updateData.content);
    });

    test('should return 401 without authentication', async () => {
      const updateData = {
        title: 'Updated Blog Post'
      };

      const response = await request(app)
        .put(`/api/blog/${postId}`)
        .send(updateData)
        .expect(401);

      expect(response.body.message).toBe('Access denied. No token provided.');
    });
  });

  describe('DELETE /api/blog/:id', () => {
    let postId;

    beforeEach(async () => {
      const postData = {
        title: 'Test Blog Post',
        content: 'This is the content of the test blog post.',
        category: 'Technology'
      };

      const response = await request(app)
        .post('/api/blog')
        .set('Authorization', authHeader)
        .send(postData);

      postId = response.body.blogPost._id;
    });

    test('should delete blog post successfully', async () => {
      const response = await request(app)
        .delete(`/api/blog/${postId}`)
        .set('Authorization', authHeader)
        .expect(200);

      expect(response.body.message).toBe('Blog post deleted successfully');

      // Verify post is deleted
      await request(app)
        .get(`/api/blog/${postId}`)
        .expect(404);
    });

    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete(`/api/blog/${postId}`)
        .expect(401);

      expect(response.body.message).toBe('Access denied. No token provided.');
    });
  });

  describe('POST /api/blog/:id/like', () => {
    let postId;

    beforeEach(async () => {
      const postData = {
        title: 'Test Blog Post',
        content: 'This is the content of the test blog post.',
        category: 'Technology',
        status: 'published'
      };

      const response = await request(app)
        .post('/api/blog')
        .set('Authorization', authHeader)
        .send(postData);

      postId = response.body.blogPost._id;
    });

    test('should like blog post successfully', async () => {
      const response = await request(app)
        .post(`/api/blog/${postId}/like`)
        .set('Authorization', authHeader)
        .expect(200);

      expect(response.body.message).toBe('Post liked successfully');
      expect(response.body.isLiked).toBe(true);
      expect(response.body.likesCount).toBe(1);
    });

    test('should unlike blog post when called again', async () => {
      // First like
      await request(app)
        .post(`/api/blog/${postId}/like`)
        .set('Authorization', authHeader);

      // Then unlike
      const response = await request(app)
        .post(`/api/blog/${postId}/like`)
        .set('Authorization', authHeader)
        .expect(200);

      expect(response.body.message).toBe('Post unliked successfully');
      expect(response.body.isLiked).toBe(false);
      expect(response.body.likesCount).toBe(0);
    });
  });
});
