const request = require('supertest');
const app = require('../../app');
const { createTestUser, createTestBlogPost } = require('../test-utils');

describe('Comments Endpoints', () => {
  let authHeader;
  let user;
  let blogPost;

  beforeEach(async () => {
    // Create authenticated user and blog post
    const testUser = await createTestUser();
    authHeader = testUser.authHeader;
    user = testUser.user;

    blogPost = await createTestBlogPost(authHeader, {
      title: 'Test Blog Post for Comments',
      content: 'This is a test blog post for comments.',
      category: 'Technology',
      status: 'published'
    });
  });

  describe('POST /api/comments', () => {
    test('should create a comment successfully', async () => {
      const commentData = {
        content: 'This is a test comment.',
        blogPost: blogPost._id
      };

      const response = await request(app)
        .post('/api/comments')
        .set('Authorization', authHeader)
        .send(commentData)
        .expect(201);

      expect(response.body.message).toBe('Comment created successfully');
      expect(response.body.comment.content).toBe(commentData.content);
      expect(response.body.comment.blogPost).toBe(blogPost._id);
      expect(response.body.comment.author.username).toBe(user.username);
    });

    test('should create a reply comment successfully', async () => {
      // First create a parent comment
      const parentCommentData = {
        content: 'This is a parent comment.',
        blogPost: blogPost._id
      };

      const parentResponse = await request(app)
        .post('/api/comments')
        .set('Authorization', authHeader)
        .send(parentCommentData);

      // Now create a reply
      const replyData = {
        content: 'This is a reply comment.',
        blogPost: blogPost._id,
        parent: parentResponse.body.comment._id
      };

      const response = await request(app)
        .post('/api/comments')
        .set('Authorization', authHeader)
        .send(replyData)
        .expect(201);

      expect(response.body.comment.content).toBe(replyData.content);
      expect(response.body.comment.parent._id).toBe(parentResponse.body.comment._id);
    });

    test('should return 400 for missing content', async () => {
      const commentData = {
        blogPost: blogPost._id
        // Missing content
      };

      const response = await request(app)
        .post('/api/comments')
        .set('Authorization', authHeader)
        .send(commentData)
        .expect(400);

      expect(response.body.message).toBe('Validation errors');
    });

    test('should return 400 for missing blog post ID', async () => {
      const commentData = {
        content: 'This is a test comment.'
        // Missing blogPost
      };

      const response = await request(app)
        .post('/api/comments')
        .set('Authorization', authHeader)
        .send(commentData)
        .expect(400);

      expect(response.body.message).toBe('Validation errors');
    });

    test('should return 401 without authentication', async () => {
      const commentData = {
        content: 'This is a test comment.',
        blogPost: blogPost._id
      };

      const response = await request(app)
        .post('/api/comments')
        .send(commentData)
        .expect(401);

      expect(response.body.message).toBe('Access denied. No token provided.');
    });

    test('should return 400 for invalid blog post ID', async () => {
      const commentData = {
        content: 'This is a test comment.',
        blogPost: 'invalid-id'
      };

      const response = await request(app)
        .post('/api/comments')
        .set('Authorization', authHeader)
        .send(commentData)
        .expect(400);

      expect(response.body.message).toBe('Validation errors');
    });
  });

  describe('GET /api/comments/blog/:blogPostId', () => {
    beforeEach(async () => {
      // Create test comments
      const comments = [
        { content: 'First comment', blogPost: blogPost._id },
        { content: 'Second comment', blogPost: blogPost._id },
        { content: 'Third comment', blogPost: blogPost._id }
      ];

      for (const comment of comments) {
        await request(app)
          .post('/api/comments')
          .set('Authorization', authHeader)
          .send(comment);
      }
    });

    test('should get comments for a blog post', async () => {
      const response = await request(app)
        .get(`/api/comments/blog/${blogPost._id}`)
        .expect(200);

      expect(response.body.comments).toBeDefined();
      expect(response.body.comments.length).toBe(3);
      expect(response.body.pagination).toBeDefined();
    });

    test('should paginate comments', async () => {
      const response = await request(app)
        .get(`/api/comments/blog/${blogPost._id}?page=1&limit=2`)
        .expect(200);

      expect(response.body.comments.length).toBe(2);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.pages).toBe(2);
    });

    test('should return empty array for blog post with no comments', async () => {
      // Create a new blog post with no comments
      const emptyBlogPost = await createTestBlogPost(authHeader, {
        title: 'Empty Blog Post',
        content: 'No comments here',
        category: 'Technology',
        status: 'published'
      });

      const response = await request(app)
        .get(`/api/comments/blog/${emptyBlogPost._id}`)
        .expect(200);

      expect(response.body.comments).toEqual([]);
      expect(response.body.comments.length).toBe(0);
    });
  });

  describe('PUT /api/comments/:id', () => {
    let comment;

    beforeEach(async () => {
      // Create a test comment
      const commentData = {
        content: 'Original comment content.',
        blogPost: blogPost._id
      };

      const response = await request(app)
        .post('/api/comments')
        .set('Authorization', authHeader)
        .send(commentData);

      comment = response.body.comment;
    });

    test('should update comment successfully', async () => {
      const updateData = {
        content: 'Updated comment content.'
      };

      const response = await request(app)
        .put(`/api/comments/${comment._id}`)
        .set('Authorization', authHeader)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Comment updated successfully');
      expect(response.body.comment.content).toBe(updateData.content);
    });

    test('should return 401 without authentication', async () => {
      const updateData = {
        content: 'Updated comment content.'
      };

      const response = await request(app)
        .put(`/api/comments/${comment._id}`)
        .send(updateData)
        .expect(401);

      expect(response.body.message).toBe('Access denied. No token provided.');
    });

    test('should return 404 for non-existent comment', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const updateData = {
        content: 'Updated comment content.'
      };

      const response = await request(app)
        .put(`/api/comments/${fakeId}`)
        .set('Authorization', authHeader)
        .send(updateData)
        .expect(404);

      expect(response.body.message).toBe('Comment not found');
    });

    test('should return 400 for missing content', async () => {
      const response = await request(app)
        .put(`/api/comments/${comment._id}`)
        .set('Authorization', authHeader)
        .send({})
        .expect(400);

      expect(response.body.message).toBe('Validation errors');
    });
  });

  describe('DELETE /api/comments/:id', () => {
    let comment;

    beforeEach(async () => {
      // Create a test comment
      const commentData = {
        content: 'Comment to be deleted.',
        blogPost: blogPost._id
      };

      const response = await request(app)
        .post('/api/comments')
        .set('Authorization', authHeader)
        .send(commentData);

      comment = response.body.comment;
    });

    test('should delete comment successfully', async () => {
      const response = await request(app)
        .delete(`/api/comments/${comment._id}`)
        .set('Authorization', authHeader)
        .expect(200);

      expect(response.body.message).toBe('Comment deleted successfully');

      // Verify comment is deleted
      await request(app)
        .get(`/api/comments/${comment._id}`)
        .expect(404);
    });

    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete(`/api/comments/${comment._id}`)
        .expect(401);

      expect(response.body.message).toBe('Access denied. No token provided.');
    });

    test('should return 404 for non-existent comment', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .delete(`/api/comments/${fakeId}`)
        .set('Authorization', authHeader)
        .expect(404);

      expect(response.body.message).toBe('Comment not found');
    });
  });

  describe('POST /api/comments/:id/like', () => {
    let comment;

    beforeEach(async () => {
      // Create a test comment
      const commentData = {
        content: 'Comment to be liked.',
        blogPost: blogPost._id
      };

      const response = await request(app)
        .post('/api/comments')
        .set('Authorization', authHeader)
        .send(commentData);

      comment = response.body.comment;
    });

    test('should like comment successfully', async () => {
      const response = await request(app)
        .post(`/api/comments/${comment._id}/like`)
        .set('Authorization', authHeader)
        .expect(200);

      expect(response.body.message).toBe('Comment liked successfully');
      expect(response.body.isLiked).toBe(true);
      expect(response.body.likesCount).toBe(1);
    });

    test('should unlike comment when called again', async () => {
      // First like
      await request(app)
        .post(`/api/comments/${comment._id}/like`)
        .set('Authorization', authHeader);

      // Then unlike
      const response = await request(app)
        .post(`/api/comments/${comment._id}/like`)
        .set('Authorization', authHeader)
        .expect(200);

      expect(response.body.message).toBe('Comment unliked successfully');
      expect(response.body.isLiked).toBe(false);
      expect(response.body.likesCount).toBe(0);
    });

    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .post(`/api/comments/${comment._id}/like`)
        .expect(401);

      expect(response.body.message).toBe('Access denied. No token provided.');
    });

    test('should return 404 for non-existent comment', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .post(`/api/comments/${fakeId}/like`)
        .set('Authorization', authHeader)
        .expect(404);

      expect(response.body.message).toBe('Comment not found');
    });
  });

  describe('GET /api/comments/my', () => {
    beforeEach(async () => {
      // Create test comments
      const comments = [
        { content: 'My first comment', blogPost: blogPost._id },
        { content: 'My second comment', blogPost: blogPost._id }
      ];

      for (const comment of comments) {
        await request(app)
          .post('/api/comments')
          .set('Authorization', authHeader)
          .send(comment);
      }
    });

    test('should get current user comments', async () => {
      const response = await request(app)
        .get('/api/comments/my')
        .set('Authorization', authHeader)
        .expect(200);

      expect(response.body.comments).toBeDefined();
      expect(response.body.comments.length).toBe(2);
      expect(response.body.comments[0].author.username).toBe(user.username);
    });

    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/comments/my')
        .expect(401);

      expect(response.body.message).toBe('Access denied. No token provided.');
    });

    test('should paginate user comments', async () => {
      const response = await request(app)
        .get('/api/comments/my?page=1&limit=1')
        .set('Authorization', authHeader)
        .expect(200);

      expect(response.body.comments.length).toBe(1);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.pages).toBe(2);
    });
  });
});
