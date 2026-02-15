const express = require('express');
const { auth } = require('../middleware/auth');
const {
  uploadImage,
  uploadMultipleImages,
  deleteImage
} = require('../controllers/uploadController');

const router = express.Router();

router.post('/image', auth, uploadImage);
router.post('/images', auth, uploadMultipleImages);
router.delete('/image/:publicId', auth, deleteImage);

module.exports = router;
