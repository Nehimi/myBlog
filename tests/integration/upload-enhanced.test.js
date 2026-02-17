const request = require('supertest');
const app = require('../../app');
const { createTestUser } = require('../test-utils');

// Mock Cloudinary for testing
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn().mockResolvedValue({
        secure_url: 'https://res.cloudinary.com/test/image.jpg',
        public_id: 'test_public_id',
        original_filename: 'test-image',
        format: 'jpg',
        bytes: 1024
      }),
      destroy: jest.fn().mockResolvedValue({ result: 'ok' })
    }
  }
}));

jest.mock('multer-storage-cloudinary', () => ({
  CloudinaryStorage: jest.fn().mockImplementation(() => ({
    _handleFile: jest.fn((req, file, cb) => {
      cb(null, {
        secure_url: 'https://res.cloudinary.com/test/image.jpg',
        public_id: 'test_public_id',
        originalname: file.originalname,
        size: 1024,
        format: 'jpg'
      });
    })
  }))
}));

describe('Upload Endpoints - Enhanced Tests', () => {
  let authHeader;
  let user;

  beforeEach(async () => {
    const testUser = await createTestUser();
    authHeader = testUser.authHeader;
    user = testUser.user;
    jest.clearAllMocks();
  });

  describe('POST /api/upload/image', () => {
    test('should upload PNG image successfully', async () => {
      const pngBuffer = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
      ]);

      const response = await request(app)
        .post('/api/upload/image')
        .set('Authorization', authHeader)
        .attach('image', pngBuffer, 'test-image.png')
        .expect(200);

      expect(response.body.message).toBe('Image uploaded successfully');
      expect(response.body.image.url).toBeDefined();
      expect(response.body.image.publicId).toBeDefined();
      expect(response.body.image.originalName).toBe('test-image.png');
    });

    test('should upload JPEG image successfully', async () => {
      const jpegBuffer = Buffer.from([
        0xFF, 0xD8, 0xFF, 0xE0
      ]);

      const response = await request(app)
        .post('/api/upload/image')
        .set('Authorization', authHeader)
        .attach('image', jpegBuffer, 'test-image.jpg')
        .expect(200);

      expect(response.body.message).toBe('Image uploaded successfully');
      expect(response.body.image.format).toBe('jpg');
    });

    test('should upload GIF image successfully', async () => {
      const gifBuffer = Buffer.from([
        0x47, 0x49, 0x46, 0x38
      ]);

      const response = await request(app)
        .post('/api/upload/image')
        .set('Authorization', authHeader)
        .attach('image', gifBuffer, 'test-image.gif')
        .expect(200);

      expect(response.body.message).toBe('Image uploaded successfully');
      expect(response.body.image.format).toBe('gif');
    });

    test('should return 401 without authentication', async () => {
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47]);

      const response = await request(app)
        .post('/api/upload/image')
        .attach('image', pngBuffer, 'test-image.png')
        .expect(401);

      expect(response.body.message).toBe('Access denied. No token provided.');
    });

    test('should return 400 when no image provided', async () => {
      const response = await request(app)
        .post('/api/upload/image')
        .set('Authorization', authHeader)
        .expect(400);

      expect(response.body.message).toBe('No file uploaded');
    });

    test('should return 400 for invalid file type', async () => {
      const textBuffer = Buffer.from('This is text');

      const response = await request(app)
        .post('/api/upload/image')
        .set('Authorization', authHeader)
        .attach('image', textBuffer, 'test-file.txt')
        .expect(400);

      expect(response.body.message).toBe('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
    });
  });

  describe('POST /api/upload/images', () => {
    test('should upload multiple images successfully', async () => {
      const pngBuffer1 = Buffer.from([0x89, 0x50, 0x4E, 0x47]);
      const pngBuffer2 = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);

      const response = await request(app)
        .post('/api/upload/images')
        .set('Authorization', authHeader)
        .attach('images', pngBuffer1, 'test-image-1.png')
        .attach('images', pngBuffer2, 'test-image-2.jpg')
        .expect(200);

      expect(response.body.message).toBe('Images uploaded successfully');
      expect(response.body.images).toBeDefined();
      expect(response.body.images.length).toBe(2);
    });

    test('should return 401 without authentication', async () => {
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47]);

      const response = await request(app)
        .post('/api/upload/images')
        .attach('images', pngBuffer, 'test-image.png')
        .expect(401);

      expect(response.body.message).toBe('Access denied. No token provided.');
    });

    test('should return 400 when no images provided', async () => {
      const response = await request(app)
        .post('/api/upload/images')
        .set('Authorization', authHeader)
        .expect(400);

      expect(response.body.message).toBe('No files uploaded');
    });
  });

  describe('DELETE /api/upload/image/:publicId', () => {
    test('should delete image successfully', async () => {
      const response = await request(app)
        .delete('/api/upload/image/test_public_id')
        .set('Authorization', authHeader)
        .expect(200);

      expect(response.body.message).toBe('Image deleted successfully');
    });

    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete('/api/upload/image/test_public_id')
        .expect(401);

      expect(response.body.message).toBe('Access denied. No token provided.');
    });

    test('should return 404 for non-existent image', async () => {
      // Mock Cloudinary to return not found
      const cloudinary = require('cloudinary');
      cloudinary.v2.uploader.destroy.mockResolvedValueOnce({ result: 'not found' });

      const response = await request(app)
        .delete('/api/upload/image/non_existent')
        .set('Authorization', authHeader)
        .expect(404);

      expect(response.body.message).toBe('Image not found');
    });
  });
});
