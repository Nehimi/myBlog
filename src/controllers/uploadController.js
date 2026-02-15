const { cloudinary, uploadSingle, uploadMultiple } = require('../config/cloudinary');

const uploadImage = async (req, res) => {
  try {
    uploadSingle(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File size too large. Maximum size is 5MB.' });
          }
          return res.status(400).json({ message: 'File upload error: ' + err.message });
        }
        return res.status(400).json({ message: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      res.json({
        message: 'Image uploaded successfully',
        image: {
          url: req.file.path,
          publicId: req.file.filename,
          originalName: req.file.originalname
        }
      });
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ message: 'Server error uploading image' });
  }
};

const uploadMultipleImages = async (req, res) => {
  try {
    uploadMultiple(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'One or more files are too large. Maximum size is 5MB per file.' });
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ message: 'Too many files. Maximum is 5 files.' });
          }
          return res.status(400).json({ message: 'File upload error: ' + err.message });
        }
        return res.status(400).json({ message: err.message });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }

      const images = req.files.map(file => ({
        url: file.path,
        publicId: file.filename,
        originalName: file.originalname
      }));

      res.json({
        message: 'Images uploaded successfully',
        images
      });
    });
  } catch (error) {
    console.error('Upload multiple images error:', error);
    res.status(500).json({ message: 'Server error uploading images' });
  }
};

const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({ message: 'Public ID is required' });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      res.json({ message: 'Image deleted successfully' });
    } else if (result.result === 'not found') {
      res.status(404).json({ message: 'Image not found' });
    } else {
      res.status(400).json({ message: 'Failed to delete image' });
    }
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ message: 'Server error deleting image' });
  }
};

module.exports = {
  uploadImage,
  uploadMultipleImages,
  deleteImage
};
