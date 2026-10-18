import cloudinaryPackage from 'cloudinary';
import cloudinaryStoragePackage from 'multer-storage-cloudinary';
import multer from 'multer';//middleware for handling multipart/form-data

const { v2: cloudinary } = cloudinaryPackage;
const { CloudinaryStorage } = cloudinaryStoragePackage;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'blog_images', //Organizes images in cloud folder
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    public_id: (req, file) => { //Generates unique ID for each image
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `blog_${uniqueSuffix}`;
    }
  }
});

const upload = multer({
  //middleware configuration
  // Enforces file size limits (5MB max)
  // Validates file types before upload
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },

  fileFilter: (req, file, cb) => {
    //middleware to validate file types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
    }
  }
});

const uploadMultiple = upload.array('images', 5); //middleware to upload multiple images (max 5)

const uploadSingle = upload.single('image'); //middleware to upload single image

export {
  cloudinary,
  uploadSingle,
  uploadMultiple
};
