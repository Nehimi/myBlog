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
   git clone https://github.com/Nehimi/myBlog.git
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

## �️ Development Roadmap & Future Features

This section outlines the planned features and development roadmap for the blog backend project. Features are organized by priority and complexity.

### 🎯 High Priority Features (Quick Wins)

#### Phase 7: Email System
- [ ] **Email Verification** - Verify user email addresses during registration
- [ ] **Password Reset** - Secure password recovery via email
- [ ] **Email Notifications** - Notify users of new comments and likes
- [ ] **Newsletter Subscription** - Allow users to subscribe to blog updates
- [ ] **Email Templates** - Professional email design and layout

#### Phase 8: User Enhancements
- [ ] **User Profile Pages** - Detailed user profiles with bio and social links
- [ ] **Avatar Upload** - Allow users to upload profile pictures
- [ ] **User Dashboard** - Personal statistics and activity tracking
- [ ] **Account Settings** - Privacy and notification preferences
- [ ] **User Statistics** - Post count, views, and engagement metrics

#### Phase 9: Content Management
- [ ] **Post Scheduling** - Schedule posts for future publication
- [ ] **Auto-save Drafts** - Automatically save work in progress
- [ ] **Category Management** - Dynamic category creation and management
- [ ] **Tag Management** - Tag suggestions and management system
- [ ] **Post Templates** - Reusable post templates for consistency

### 🔍 Medium Priority Features

#### Phase 10: Advanced Search & Discovery
- [ ] **Elasticsearch Integration** - Advanced search capabilities
- [ ] **Search Analytics** - Track search trends and popular queries
- [ ] **Related Posts** - AI-powered content recommendations
- [ ] **Advanced Filtering** - Date ranges, author filters, popularity filters
- [ ] **Search History** - User search history and saved searches

#### Phase 11: Social Features
- [ ] **Social Sharing** - Share posts to social media platforms
- [ ] **OAuth Integration** - Login with Google, GitHub, Facebook
- [ ] **User Mentions** - @username mentions in comments
- [ ] **Hashtag Support** - Hashtag creation and tracking
- [ ] **Comment Reactions** - Emoji reactions beyond likes

#### Phase 12: Analytics & Statistics
- [ ] **Analytics Dashboard** - Comprehensive blog statistics
- [ ] **Post Performance** - Views, engagement, and conversion tracking
- [ ] **User Analytics** - User behavior and engagement patterns
- [ ] **Traffic Sources** - Track where visitors come from
- [ ] **Content Insights** - Best performing content analysis

### 🛡️ Security & Moderation

#### Phase 13: Enhanced Security
- [ ] **Two-Factor Authentication** - Additional security layer
- [ ] **Advanced Rate Limiting** - Per-user rate limiting
- [ ] **IP Blocking** - Automatic blocking of suspicious IPs
- [ ] **Security Headers** - Enhanced HTTP security headers
- [ ] **Audit Logging** - Track all administrative actions

#### Phase 14: Content Moderation
- [ ] **Auto-Moderation** - AI-powered spam detection
- [ ] **Reporting System** - Report inappropriate content
- [ ] **Moderator Roles** - Different permission levels
- [ ] **Content Approval** - Manual content review workflow
- [ ] **Community Guidelines** - Clear rules and enforcement

### ⚡ Performance & Scalability

#### Phase 15: Performance Optimization
- [ ] **Redis Caching** - Cache frequent database queries
- [ ] **CDN Integration** - Content delivery network for static assets
- [ ] **Database Optimization** - Query optimization and indexing
- [ ] **Image Optimization** - Automatic image compression and formats
- [ ] **API Response Caching** - Cache API responses

#### Phase 16: Background Processing
- [ ] **Email Queue** - Background email processing
- [ ] **Analytics Processing** - Async data processing
- [ ] **Content Indexing** - Background search indexing
- [ ] **Scheduled Tasks** - Automated maintenance tasks
- [ ] **Job Monitoring** - Monitor background job performance

### 🌐 Advanced Features

#### Phase 17: API Enhancements
- [ ] **GraphQL API** - Modern API alternative to REST
- [ ] **API Documentation** - Interactive Swagger/OpenAPI docs
- [ ] **API Versioning** - Support multiple API versions
- [ ] **Webhook Support** - Real-time integrations
- [ ] **Rate Limiting API** - API for rate limiting management

#### Phase 18: Mobile & Real-time
- [ ] **Mobile API** - Optimized endpoints for mobile apps
- [ ] **Push Notifications** - Real-time notifications
- [ ] **Offline Support** - Offline reading capabilities
- [ ] **Real-time Updates** - WebSocket integration
- [ ] **Progressive Web App** - PWA features and support

### 🛠️ Development Tools

#### Phase 19: Developer Experience
- [ ] **API Testing Suite** - Comprehensive testing framework
- [ ] **Unit Tests** - Test all utility functions
- [ ] **Integration Tests** - Test API endpoints
- [ ] **Load Testing** - Performance and stress testing
- [ ] **Security Testing** - Automated security scans

#### Phase 20: Monitoring & Maintenance
- [ ] **Health Checks** - Comprehensive system health monitoring
- [ ] **Performance Monitoring** - Real-time performance metrics
- [ ] **Error Tracking** - Automated error reporting
- [ ] **Uptime Monitoring** - Service availability tracking
- [ ] **Backup Systems** - Automated backup and recovery

### 📅 Implementation Timeline

**Quarter 1 (Months 1-3):**
- Complete Phases 7-9 (Email, User Enhancements, Content Management)

**Quarter 2 (Months 4-6):**
- Complete Phases 10-12 (Search, Social Features, Analytics)

**Quarter 3 (Months 7-9):**
- Complete Phases 13-14 (Security, Moderation)

**Quarter 4 (Months 10-12):**
- Complete Phases 15-16 (Performance, Background Processing)

**Year 2:**
- Implement Advanced Features (Phases 17-20)

### 🎯 Success Metrics

**Technical Metrics:**
- API response time < 200ms
- 99.9% uptime
- Zero security vulnerabilities
- 100% test coverage

**User Metrics:**
- User registration conversion rate > 80%
- Email open rate > 60%
- User engagement > 40%
- Content creation rate increase > 50%

**Business Metrics:**
- Monthly active users growth > 20%
- Content publishing frequency > 3 posts/week
- Search success rate > 95%
- Mobile adoption rate > 60%

### 🔄 Feature Request Process

1. **Community Feedback** - Gather feature requests from users
2. **Priority Assessment** - Evaluate based on impact and effort
3. **Development Planning** - Assign to appropriate phase
4. **Implementation** - Develop and test features
5. **Release & Monitor** - Deploy and track performance
6. **Iterate & Improve** - Refine based on usage data

---

## 🔄 Version History

- **v1.0.0** - Initial release with all core features (Phases 1-6)
- **v1.1.0** - Planned: Email system and user enhancements (Phases 7-8)
- **v1.2.0** - Planned: Content management improvements (Phase 9)
- **v2.0.0** - Planned: Advanced search and social features (Phases 10-12)
