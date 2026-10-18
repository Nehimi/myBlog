# Blog Backend API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "string (3-30 chars, alphanumeric + underscore)",
  "email": "valid email",
  "password": "string (min 6 chars, must contain uppercase, lowercase, and number)",
  "firstName": "string (max 50 chars)",
  "lastName": "string (max 50 chars)"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string"
  },
  "token": "jwt-token"
}
```

### POST /auth/login
Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "valid email",
  "password": "string"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string"
  },
  "token": "jwt-token"
}
```

### GET /auth/profile
Get current user profile. **Requires authentication.**

**Response:**
```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "bio": "string (optional)",
  "createdAt": "date"
}
```

### PUT /auth/profile
Update current user profile. **Requires authentication.**

**Request Body:**
```json
{
  "firstName": "string (optional, max 50 chars)",
  "lastName": "string (optional, max 50 chars)",
  "bio": "string (optional, max 500 chars)"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "bio": "string"
  }
}
```

---

## Blog Posts Endpoints

### POST /blog
Create a new blog post. **Requires authentication.**

**Request Body:**
```json
{
  "title": "string (required, max 200 chars)",
  "content": "string (required)",
  "category": "string (required)",
  "excerpt": "string (optional, max 500 chars)",
  "tags": ["string"] (optional, array),
  "featuredImage": "url (optional)"
}
```

**Response:**
```json
{
  "message": "Blog post created successfully",
  "post": {
    "id": "string",
    "title": "string",
    "content": "string",
    "category": "string",
    "excerpt": "string",
    "tags": ["string"],
    "featuredImage": "url",
    "author": "user-object",
    "createdAt": "date"
  }
}
```

### GET /blog
Get all blog posts with pagination and filtering.

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 10)
- `category`: string (optional)
- `author`: string (optional)
- `search`: string (optional)

**Response:**
```json
{
  "posts": [
    {
      "id": "string",
      "title": "string",
      "excerpt": "string",
      "category": "string",
      "author": "user-object",
      "featuredImage": "url",
      "likes": number,
      "comments": number,
      "createdAt": "date",
      "isLiked": boolean (if authenticated)
    }
  ],
  "pagination": {
    "currentPage": number,
    "totalPages": number,
    "totalPosts": number
  }
}
```

### GET /blog/my
Get current user's blog posts. **Requires authentication.**

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 10)
- `status`: string (optional: draft, published, archived)

**Response:** Same as GET /blog but only user's posts.

### GET /blog/:id
Get a specific blog post by ID.

**Response:**
```json
{
  "id": "string",
  "title": "string",
  "content": "string",
  "category": "string",
  "excerpt": "string",
  "tags": ["string"],
  "featuredImage": "url",
  "author": "user-object",
  "likes": number,
  "comments": ["comment-objects"],
  "createdAt": "date",
  "updatedAt": "date",
  "isLiked": boolean (if authenticated)
}
```

### PUT /blog/:id
Update a blog post. **Requires authentication and ownership.**

**Request Body:**
```json
{
  "title": "string (optional, max 200 chars)",
  "content": "string (optional)",
  "category": "string (optional)",
  "excerpt": "string (optional, max 500 chars)",
  "tags": ["string"] (optional, array),
  "featuredImage": "url (optional)",
  "status": "string (optional: draft, published, archived)"
}
```

**Response:**
```json
{
  "message": "Blog post updated successfully",
  "post": "updated-post-object"
}
```

### DELETE /blog/:id
Delete a blog post. **Requires authentication and ownership.**

**Response:**
```json
{
  "message": "Blog post deleted successfully"
}
```

### POST /blog/:id/like
Toggle like on a blog post. **Requires authentication.**

**Response:**
```json
{
  "message": "Post liked successfully" | "Post unliked successfully",
  "isLiked": boolean,
  "likesCount": number
}
```

---

## Comments Endpoints

### POST /comments
Create a new comment. **Requires authentication.**

**Request Body:**
```json
{
  "content": "string (required, max 1000 chars)",
  "blogPost": "string (required, valid MongoDB ObjectId)",
  "parent": "string (optional, valid MongoDB ObjectId for reply)"
}
```

**Response:**
```json
{
  "message": "Comment created successfully",
  "comment": {
    "id": "string",
    "content": "string",
    "author": "user-object",
    "blogPost": "string",
    "parent": "string (if reply)",
    "likes": number,
    "createdAt": "date"
  }
}
```

### GET /comments/blog/:blogPostId
Get all comments for a specific blog post.

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 20)

**Response:**
```json
{
  "comments": [
    {
      "id": "string",
      "content": "string",
      "author": "user-object",
      "parent": "string",
      "likes": number,
      "replies": ["comment-objects"],
      "createdAt": "date",
      "isLiked": boolean (if authenticated)
    }
  ],
  "pagination": {
    "currentPage": number,
    "totalPages": number,
    "totalComments": number
  }
}
```

### GET /comments/my
Get current user's comments. **Requires authentication.**

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 20)

**Response:** Same structure as above but only user's comments.

### PUT /comments/:id
Update a comment. **Requires authentication and ownership.**

**Request Body:**
```json
{
  "content": "string (required, max 1000 chars)"
}
```

**Response:**
```json
{
  "message": "Comment updated successfully",
  "comment": "updated-comment-object"
}
```

### DELETE /comments/:id
Delete a comment. **Requires authentication and ownership.**

**Response:**
```json
{
  "message": "Comment deleted successfully"
}
```

### POST /comments/:id/like
Toggle like on a comment. **Requires authentication.**

**Response:**
```json
{
  "message": "Comment liked successfully" | "Comment unliked successfully",
  "isLiked": boolean,
  "likesCount": number
}
```

---

## Upload Endpoints

### POST /upload/image
Upload a single image. **Requires authentication.**

**Request:** `multipart/form-data`
- `image`: image file

**Response:**
```json
{
  "message": "Image uploaded successfully",
  "image": {
    "url": "string",
    "publicId": "string",
    "originalName": "string",
    "size": number,
    "format": "string"
  }
}
```

### POST /upload/images
Upload multiple images. **Requires authentication.**

**Request:** `multipart/form-data`
- `images`: array of image files

**Response:**
```json
{
  "message": "Images uploaded successfully",
  "images": [
    {
      "url": "string",
      "publicId": "string",
      "originalName": "string",
      "size": number,
      "format": "string"
    }
  ]
}
```

### DELETE /upload/image/:publicId
Delete an image by public ID. **Requires authentication.**

**Response:**
```json
{
  "message": "Image deleted successfully"
}
```

---

## Search Endpoints

### GET /search/posts
Search blog posts. **Authentication optional.**

**Query Parameters:**
- `q`: search query string
- `page`: number (default: 1)
- `limit`: number (default: 10)
- `category`: string (optional)
- `author`: string (optional)

**Response:**
```json
{
  "posts": [
    {
      "id": "string",
      "title": "string",
      "excerpt": "string",
      "category": "string",
      "author": "user-object",
      "featuredImage": "url",
      "relevanceScore": number,
      "createdAt": "date"
    }
  ],
  "pagination": {
    "currentPage": number,
    "totalPages": number,
    "totalResults": number
  },
  "searchQuery": "string"
}
```

### GET /search/suggestions
Get search suggestions based on query.

**Query Parameters:**
- `q`: partial search query

**Response:**
```json
{
  "suggestions": ["string"],
  "query": "string"
}
```

### GET /search/popular
Get popular search terms.

**Response:**
```json
{
  "popularSearches": [
    {
      "term": "string",
      "frequency": number
    }
  ]
}
```

---

## Health Check

### GET /health
Check API health status.

**Response:**
```json
{
  "status": "OK",
  "message": "Blog Backend API is running",
  "timestamp": "ISO-date-string"
}
```

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "message": "Validation Error",
  "errors": ["error-message-1", "error-message-2"]
}
```

### 401 Unauthorized
```json
{
  "message": "Access denied. No token provided."
}
```

### 403 Forbidden
```json
{
  "message": "Access denied. You don't have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "message": "Too many requests from this IP, please try again later."
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

---

## Rate Limiting

API endpoints are rate-limited to 100 requests per 15 minutes per IP address.

---

## Data Models

### User
```json
{
  "_id": "ObjectId",
  "username": "string",
  "email": "string",
  "password": "hashed-string",
  "firstName": "string",
  "lastName": "string",
  "bio": "string (optional)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Blog Post
```json
{
  "_id": "ObjectId",
  "title": "string",
  "content": "string",
  "excerpt": "string",
  "category": "string",
  "tags": ["string"],
  "featuredImage": "url",
  "author": "ObjectId (ref: User)",
  "status": "string (draft|published|archived)",
  "likes": ["ObjectId"] (ref: User),
  "comments": ["ObjectId"] (ref: Comment),
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Comment
```json
{
  "_id": "ObjectId",
  "content": "string",
  "author": "ObjectId (ref: User)",
  "blogPost": "ObjectId (ref: BlogPost)",
  "parent": "ObjectId (ref: Comment) (optional)",
  "likes": ["ObjectId"] (ref: User),
  "replies": ["ObjectId"] (ref: Comment),
  "createdAt": "Date",
  "updatedAt": "Date"
}
```
