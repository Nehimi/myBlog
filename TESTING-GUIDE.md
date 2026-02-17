# Testing Guide for Blog Backend API

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run All Tests
```bash
npm test
```

### 3. Run Specific Test Types
```bash
# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Test Structure

### Unit Tests (`tests/unit/`)
- **Models**: Test data models, validation, and methods
- **Utilities**: Test helper functions and utilities
- **Controllers**: Test business logic in isolation

### Integration Tests (`tests/integration/`)
- **API Endpoints**: Test complete request/response cycles
- **Authentication**: Test auth flows and middleware
- **Database**: Test database operations

## Current Test Coverage

### ✅ Working Tests
- User model validation and methods
- User authentication (register, login, profile)
- Basic blog post creation

### 🔧 Needs Fixing
- Blog post listing (status filtering issue)
- Blog post update/delete operations
- Comment system tests
- File upload tests

## Running Individual Test Files

```bash
# Test specific file
npx jest tests/unit/models/User.test.js

# Test with verbose output
npx jest --verbose tests/integration/auth.test.js

# Test with coverage for specific file
npx jest --coverage tests/unit/models/User.test.js
```

## Test Environment Setup

The test suite automatically:
- Uses in-memory MongoDB (MongoMemoryServer)
- Sets test environment variables
- Cleans database between tests
- Provides test utilities and helpers

## Environment Variables for Tests

```javascript
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.JWT_EXPIRE = '7d';
process.env.FRONTEND_URL = 'http://localhost:3000';
```

## Test Utilities

Available in `tests/test-utils.js`:
- `createTestUser()` - Create authenticated test user
- `createTestBlogPost()` - Create test blog post
- `createTestComment()` - Create test comment
- `generateRandomEmail()` - Generate random email
- `generateRandomUsername()` - Generate random username

## Writing New Tests

### Unit Test Example
```javascript
const User = require('../../../src/models/User');

describe('User Model', () => {
  test('should create valid user', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123',
      firstName: 'Test',
      lastName: 'User'
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser.username).toBe(userData.username);
  });
});
```

### Integration Test Example
```javascript
const request = require('supertest');
const app = require('../../app');

describe('POST /api/auth/register', () => {
  test('should register new user', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123',
      firstName: 'Test',
      lastName: 'User'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body.message).toBe('User registered successfully');
    expect(response.body.token).toBeDefined();
  });
});
```

## Debugging Tests

### 1. Console Logging
```javascript
test('debug example', async () => {
  console.log('Debug info:', someVariable);
  // Your test code
});
```

### 2. Test Specific Output
```bash
# Run with verbose output
npx jest --verbose

# Run with specific reporter
npx jest --notify
```

### 3. Debug Mode
```bash
# Run Node.js in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Common Issues and Solutions

### Issue: "secretOrPrivateKey must have a value"
**Solution**: JWT_SECRET environment variable is set in test setup

### Issue: Database connection errors
**Solution**: MongoMemoryServer is used for isolated test database

### Issue: Tests timing out
**Solution**: Increase timeout in jest.config.js or use `--testTimeout` flag

### Issue: Port conflicts
**Solution**: Tests use in-memory database, no external server needed

## Test Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Use `afterEach` to clean up test data
3. **Assertions**: Be specific with expected results
4. **Error Testing**: Test both success and failure cases
5. **Edge Cases**: Test boundary conditions
6. **Async Handling**: Use proper async/await patterns

## Coverage Goals

- **Statements**: 90%+
- **Branches**: 85%+
- **Functions**: 90%+
- **Lines**: 90%+

## Continuous Integration

Add to your CI pipeline:
```yaml
- name: Run Tests
  run: npm test

- name: Generate Coverage
  run: npm run test:coverage
```

## Next Steps

1. Fix failing integration tests
2. Add missing test coverage for:
   - Comment system
   - File upload
   - Search functionality
   - Error handling
3. Add performance tests
4. Add E2E tests with actual browser

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoMemoryServer](https://github.com/nodkz/mongodb-memory-server)
