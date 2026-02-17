const request = require('supertest');
const app = require('../app');
const User = require('../src/models/User');

// Test user creation utility
const createTestUser = async (userData = {}) => {
  const defaultUserData = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'Password123',
    firstName: 'Test',
    lastName: 'User',
    ...userData
  };

  const response = await request(app)
    .post('/api/auth/register')
    .send(defaultUserData);

  return {
    user: response.body.user,
    token: response.body.token,
    authHeader: `Bearer ${response.body.token}`
  };
};

// Test blog post creation utility
const createTestBlogPost = async (authHeader, postData = {}) => {
  const defaultPostData = {
    title: 'Test Blog Post',
    content: 'This is the content of the test blog post.',
    category: 'Technology',
    status: 'published',
    ...postData
  };

  const response = await request(app)
    .post('/api/blog')
    .set('Authorization', authHeader)
    .send(defaultPostData);

  return response.body.blogPost;
};

// Test comment creation utility
const createTestComment = async (authHeader, blogPostId, commentData = {}) => {
  const defaultCommentData = {
    content: 'This is a test comment.',
    blogPost: blogPostId,
    ...commentData
  };

  const response = await request(app)
    .post('/api/comments')
    .set('Authorization', authHeader)
    .send(defaultCommentData);

  return response.body.comment;
};

// Clean database utility
const cleanDatabase = async () => {
  await User.deleteMany({});
};

// Generate random test data
const generateRandomString = (length = 10) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const generateRandomEmail = () => {
  return `${generateRandomString(8)}@example.com`;
};

const generateRandomUsername = () => {
  return `${generateRandomString(8)}_${Math.floor(Math.random() * 1000)}`;
};

// Authentication utilities
const getAuthHeader = (token) => `Bearer ${token}`;

// Request utilities
const authenticatedRequest = (token) => {
  return request(app).set('Authorization', getAuthHeader(token));
};

// Test data factories
const createUserData = (overrides = {}) => ({
  username: generateRandomUsername(),
  email: generateRandomEmail(),
  password: 'Password123',
  firstName: 'Test',
  lastName: 'User',
  ...overrides
});

const createBlogPostData = (overrides = {}) => ({
  title: `Test Post ${generateRandomString(5)}`,
  content: `This is test content ${generateRandomString(10)}.`,
  category: 'Technology',
  excerpt: `Test excerpt ${generateRandomString(5)}.`,
  tags: ['test', 'blog'],
  status: 'published',
  ...overrides
});

const createCommentData = (blogPostId, overrides = {}) => ({
  content: `Test comment ${generateRandomString(5)}.`,
  blogPost: blogPostId,
  ...overrides
});

module.exports = {
  createTestUser,
  createTestBlogPost,
  createTestComment,
  cleanDatabase,
  generateRandomString,
  generateRandomEmail,
  generateRandomUsername,
  getAuthHeader,
  authenticatedRequest,
  createUserData,
  createBlogPostData,
  createCommentData
};
