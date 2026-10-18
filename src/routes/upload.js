import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  uploadImage,
  uploadMultipleImages,
  deleteImage
} from '../controllers/uploadController.js';

const router = express.Router();

router.post('/image', auth, uploadImage);
router.post('/images', auth, uploadMultipleImages);
router.delete('/image/:publicId', auth, deleteImage);

export default router;
