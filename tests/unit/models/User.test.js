const User = require('../../../src/models/User');

describe('User Model', () => {
  describe('User Creation', () => {
    test('should create a valid user', async () => {
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
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.firstName).toBe(userData.firstName);
      expect(savedUser.lastName).toBe(userData.lastName);
      expect(savedUser.password).not.toBe(userData.password); // Should be hashed
    });

    test('should hash password before saving', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const user = new User(userData);
      await user.save();

      expect(user.password).not.toBe('Password123');
      expect(user.password.length).toBeGreaterThan(20); // Hashed password length
    });

    test('should compare passwords correctly', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const user = new User(userData);
      await user.save();

      const isMatch = await user.comparePassword('Password123');
      const isNotMatch = await user.comparePassword('WrongPassword');

      expect(isMatch).toBe(true);
      expect(isNotMatch).toBe(false);
    });
  });

  describe('User Validation', () => {
    test('should require username', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    test('should require email', async () => {
      const userData = {
        username: 'testuser',
        password: 'Password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    test('should require password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    test('should validate email format', async () => {
      const userData = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'Password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    test('should enforce username length constraints', async () => {
      const userData = {
        username: 'ab', // Too short (min 3)
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });
  });

  describe('User Methods', () => {
    test('should generate JWT token', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const user = new User(userData);
      await user.save();

      const token = user.generateAuthToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    test('should return user object without password', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const user = new User(userData);
      await user.save();

      const userObject = user.toObject();
      expect(userObject.password).toBeDefined();

      const userWithoutPassword = user.toJSON();
      expect(userWithoutPassword.password).toBeUndefined();
    });
  });
});
