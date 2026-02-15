# Blog Backend API

A comprehensive, phase-based blog backend system built with Node.js, Express, and MongoDB. This API provides complete functionality for managing blog posts, user authentication, comments, file uploads, and advanced search capabilities.

## 🚀 Features

### Core Features
- **User Authentication & Authorization** - JWT-based auth with role-based access
- **Blog Post Management** - Full CRUD operations with draft/published status
- **Comment System** - Nested comments with likes and moderation
- **File Upload** - Cloudinary integration for image management
- **Advanced Search** - Full-text search with filtering and suggestions
- **Rate Limiting** - Built-in protection against abuse
- **Input Validation** - Comprehensive data validation and sanitization

### Technical Features
- RESTful API design
- MongoDB with Mongoose ODM
- Cloudinary for image storage
- JWT authentication
- Express middleware for security
- Comprehensive error handling
- Structured project organization

## 📋 Phase-Based Development

This project is organized into development phases for systematic implementation:

### Phase 1: Foundation (✅ Completed)
- [x] Project structure setup
- [x] Package.json configuration
- [x] Environment variables setup
- [x] Database connection
- [x] Basic server configuration

### Phase 2: User System (✅ Completed)
- [x] User model with validation
- [x] Authentication middleware
- [x] JWT token generation
- [x] Registration and login endpoints
- [x] Profile management
- [x] Role-based access control

### Phase 3: Blog Management (✅ Completed)
- [x] Blog post model with relationships
- [x] CRUD operations for posts
- [x] Draft/published status management
- [x] Author permissions
- [x] Post categorization and tagging
- [x] SEO metadata support

### Phase 4: Interaction System (✅ Completed)
- [x] Comment model with nested replies
- [x] Comment CRUD operations
- [x] Like/unlike functionality
- [x] Comment moderation
- [x] User interaction tracking

### Phase 5: Media Management (✅ Completed)
- [x] Cloudinary integration
- [x] Image upload endpoints
- [x] Multiple file upload support
- [x] Image deletion
- [x] File validation and security

### Phase 6: Search & Discovery (✅ Completed)
- [x] Full-text search implementation
- [x] Advanced filtering options
- [x] Search suggestions
- [x] Popular content tracking
- [x] Category and tag management

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Cloudinary account (for image uploads)

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Blog/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Configure the following environment variables:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/blog_db

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **For production**
   ```bash
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "Password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

#### Get Profile
```http
GET /auth/profile
Authorization: Bearer <token>
```

### Blog Post Endpoints

#### Create Blog Post
```http
POST /blog
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My First Blog Post",
  "content": "This is the content of my blog post...",
  "excerpt": "A brief excerpt of the post",
  "category": "technology",
  "tags": ["nodejs", "mongodb", "api"],
  "featuredImage": "https://example.com/image.jpg"
}
```

#### Get All Blog Posts
```http
GET /blog?page=1&limit=10&category=technology&search=nodejs
```

#### Get Single Blog Post
```http
GET /blog/:id
```

#### Update Blog Post
```http
PUT /blog/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Blog Post Title",
  "status": "published"
}
```

#### Delete Blog Post
```http
DELETE /blog/:id
Authorization: Bearer <token>
```

### Comment Endpoints

#### Create Comment
```http
POST /comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Great blog post!",
  "blogPost": "blog_post_id",
  "parent": "parent_comment_id" // optional for replies
}
```

#### Get Comments for Blog Post
```http
GET /comments/blog/:blogPostId?page=1&limit=20
```

### Search Endpoints

#### Search Blog Posts
```http
GET /search/posts?q=nodejs&category=technology&sortBy=newest&page=1&limit=10
```

#### Get Search Suggestions
```http
GET /search/suggestions?q=node
```

### Upload Endpoints

#### Upload Single Image
```http
POST /upload/image
Authorization: Bearer <token>
Content-Type: multipart/form-data

image: <file>
```

#### Upload Multiple Images
```http
POST /upload/images
Authorization: Bearer <token>
Content-Type: multipart/form-data

images: <files>
```

## 🗄️ Database Schema

### User Model
```javascript
{
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  firstName: String (required),
  lastName: String (required),
  bio: String (optional),
  avatar: String (optional),
  role: String ('user' | 'admin', default: 'user'),
  isActive: Boolean (default: true),
  lastLogin: Date
}
```

### Blog Post Model
```javascript
{
  title: String (required),
  slug: String (unique, auto-generated),
  content: String (required),
  excerpt: String (optional),
  author: ObjectId (ref: 'User', required),
  featuredImage: String (optional),
  images: [String],
  tags: [String],
  category: String (required),
  status: String ('draft' | 'published' | 'archived', default: 'draft'),
  isPublished: Boolean (default: false),
  publishedAt: Date,
  readTime: Number (auto-calculated),
  views: Number (default: 0),
  likes: [ObjectId] (ref: 'User'),
  commentsCount: Number (default: 0),
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  }
}
```

### Comment Model
```javascript
{
  content: String (required),
  author: ObjectId (ref: 'User', required),
  blogPost: ObjectId (ref: 'BlogPost', required),
  parent: ObjectId (ref: 'Comment', optional),
  replies: [ObjectId] (ref: 'Comment'),
  isApproved: Boolean (default: true),
  likes: [ObjectId] (ref: 'User'),
  isEdited: Boolean (default: false),
  editedAt: Date
}
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcrypt for secure password storage
- **Input Validation** - Express-validator for data sanitization
- **Rate Limiting** - Express-rate-limit for DDoS protection
- **CORS Configuration** - Cross-origin resource sharing setup
- **Helmet.js** - Security headers and protections
- **File Upload Security** - File type and size validation

## 🚦 Error Handling

The API implements comprehensive error handling with appropriate HTTP status codes:

- **200** - Success
- **201** - Created
- **400** - Bad Request (validation errors)
- **401** - Unauthorized (authentication required)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **429** - Too Many Requests (rate limit exceeded)
- **500** - Internal Server Error

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📦 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-production-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the API documentation above
- Review the error responses for debugging

## 🔄 Version History

- **v1.0.0** - Initial release with all core features
- Phase-based development approach for systematic implementation
- Comprehensive API with authentication, blog management, and search capabilities
