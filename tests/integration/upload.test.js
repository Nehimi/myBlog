const request = require('supertest');
const app = require('../../app');
const { createTestUser } = require('../test-utils');

// Mock Cloudinary to avoid actual file uploads during tests
jest.mock('cloudinary', () => ({
  v2: {
    uploader: {
      upload: jest.fn().mockResolvedValue({
        secure_url: 'https://res.cloudinary.com/test/image.jpg',
        public_id: 'test_public_id',
        original_filename: 'test-image',
        format: 'jpg',
        bytes: 1024
      }),
      upload_stream: jest.fn().mockReturnValue({
        end: jest.fn()
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

describe('Upload Endpoints', () => {
  let authHeader;
  let user;

  beforeEach(async () => {
    // Create authenticated user
    const testUser = await createTestUser();
    authHeader = testUser.authHeader;
    user = testUser.user;
  });

  describe('POST /api/upload/image', () => {
    test('should upload a single image successfully', async () => {
      const response = await request(app)
        .post('/api/upload/image')
        .set('Authorization', authHeader)
        .attach('image', Buffer.from('fake image data'), 'test-image.jpg')
        .expect(200);

      expect(response.body.message).toBe('Image uploaded successfully');
      expect(response.body.image.url).toBeDefined();
      expect(response.body.image.publicId).toBeDefined();
      expect(response.body.image.originalName).toBe('test-image.jpg');
      expect(response.body.image.size).toBe(1024);
      expect(response.body.image.format).toBe('jpg');
    });

    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/upload/image')
        .attach('image', Buffer.from('fake image data'), 'test-image.jpg')
        .expect(401);

      expect(response.body.message).toBe('Access denied. No token provided.');
    });

    test('should return 400 when no image is provided', async () => {
      const response = await request(app)
        .post('/api/upload/image')
        .set('Authorization', authHeader)
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    test('should return 400 for invalid file type', async () => {
      const response = await request(app)
        .post('/api/upload/image')
        .set('Authorization', authHeader)
        .attach('image', Buffer.from('fake text data'), 'test-file.txt')
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    test('should handle large files', async () => {
      // Create a large buffer (simulating a large file)
      const largeBuffer = Buffer.alloc(5 * 1024 * 1024); // 5MB

      const response = await request(app)
        .post('/api/upload/image')
        .set('Authorization', authHeader)
        .attach('image', largeBuffer, 'large-image.jpg')
        .expect(400);

      expect(response.body.message).toBeDefined();
    });
  });

  describe('POST /api/upload/images', () => {
    test('should upload multiple images successfully', async () => {
      const response = await request(app)
        .post('/api/upload/images')
        .set('Authorization', authHeader)
        .attach('images', Buffer.from('fake image data 1'), 'test-image-1.jpg')
        .attach('images', Buffer.from('fake image data 2'), 'test-image-2.jpg')
        .attach('images', Buffer.from('fake image data 3'), 'test-image-3.png')
        .expect(200);

      expect(response.body.message).toBe('Images uploaded successfully');
      expect(response.body.images).toBeDefined();
      expect(response.body.images.length).toBe(3);
      
      response.body.images.forEach((image, index) => {
        expect(image.url).toBeDefined();
        expect(image.publicId).toBeDefined();
        expect(image.originalName).toBeDefined();
        expect(image.size).toBe(1024);
      });
    });

    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/upload/images')
        .attach('images', Buffer.from('fake image data'), 'test-image.jpg')
        .expect(401);

      expect(response.body.message).toBe('Access denied. No token provided.');
    });

    test('should return 400 when no images are provided', async () => {
      const response = await request(app)
        .post('/api/upload/images')
        .set('Authorization', authHeader)
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    test('should handle mixed valid and invalid files', async () => {
      const response = await request(app)
        .post('/api/upload/images')
        .set('Authorization', authHeader)
        .attach('images', Buffer.from('fake image data'), 'test-image.jpg')
        .attach('images', Buffer.from('fake text data'), 'test-file.txt')
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    test('should handle maximum number of images', async () => {
      // Test with more than the maximum allowed images
      const response = await request(app)
        .post('/api/upload/images')
        .set('Authorization', authHeader);

      // Attach many images (more than the limit)
      for (let i = 0; i < 15; i++) {
        response.attach('images', Buffer.from(`fake image data ${i}`), `test-image-${i}.jpg`);
      }

      await response.expect(400);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('DELETE /api/upload/image/:publicId', () => {
    test('should delete an image successfully', async () => {
      const publicId = 'test_public_id';

      const response = await request(app)
        .delete(`/api/upload/image/${publicId}`)
        .set('Authorization', authHeader)
        .expect(200);

      expect(response.body.message).toBe('Image deleted successfully');
    });

    test('should return 401 without authentication', async () => {
      const publicId = 'test_public_id';

      const response = await request(app)
        .delete(`/api/upload/image/${publicId}`)
        .expect(401);

      expect(response.body.message).toBe('Access denied. No token provided.');
    });

    test('should return 400 for invalid public ID', async () => {
      const response = await request(app)
        .delete('/api/upload/image/')
        .set('Authorization', authHeader)
        .expect(404);

      // Should return 404 because the route doesn't match
    });

    test('should handle non-existent image deletion', async () => {
      const nonExistentId = 'non_existent_public_id';

      // Mock Cloudinary to return an error for non-existent image
      const cloudinary = require('cloudinary');
      cloudinary.v2.uploader.destroy.mockResolvedValueOnce({ result: 'not found' });

      const response = await request(app)
        .delete(`/api/upload/image/${nonExistentId}`)
        .set('Authorization', authHeader)
        .expect(404);

      expect(response.body.message).toBe('Image not found');
    });

    test('should handle Cloudinary API errors', async () => {
      const publicId = 'error_public_id';

      // Mock Cloudinary to return an error
      const cloudinary = require('cloudinary');
      cloudinary.v2.uploader.destroy.mockRejectedValueOnce(new Error('Cloudinary error'));

      const response = await request(app)
        .delete(`/api/upload/image/${publicId}`)
        .set('Authorization', authHeader)
        .expect(500);

      expect(response.body.message).toBeDefined();
    });
  });

  describe('Upload Edge Cases', () => {
    test('should handle image upload with metadata', async () => {
      const response = await request(app)
        .post('/api/upload/image')
        .set('Authorization', authHeader)
        .attach('image', Buffer.from('fake image data'), 'test-image.jpg')
        .field('folder', 'blog-images')
        .field('tags', 'blog,test')
        .expect(200);

      expect(response.body.message).toBe('Image uploaded successfully');
      expect(response.body.image.url).toBeDefined();
    });

    test('should validate image file extensions', async () => {
      const invalidExtensions = ['test.txt', 'test.pdf', 'test.doc', 'test.exe'];

      for (const filename of invalidExtensions) {
        const response = await request(app)
          .post('/api/upload/image')
          .set('Authorization', authHeader)
          .attach('image', Buffer.from('fake data'), filename)
          .expect(400);

        expect(response.body.message).toBeDefined();
      }
    });

    test('should validate image MIME types', async () => {
      const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      
      for (const mimeType of validMimeTypes) {
        const response = await request(app)
          .post('/api/upload/image')
          .set('Authorization', authHeader)
          .attach('image', Buffer.from('fake image data'), {
            filename: 'test.jpg',
            contentType: mimeType
          })
          .expect(200);

        expect(response.body.message).toBe('Image uploaded successfully');
      }
    });

    test('should handle concurrent uploads', async () => {
      const uploadPromises = [];

      for (let i = 0; i < 5; i++) {
        uploadPromises.push(
          request(app)
            .post('/api/upload/image')
            .set('Authorization', authHeader)
            .attach('image', Buffer.from(`fake image data ${i}`), `test-image-${i}.jpg`)
        );
      }

      const responses = await Promise.all(uploadPromises);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Image uploaded successfully');
        expect(response.body.image.url).toBeDefined();
      });
    });
  });
});
