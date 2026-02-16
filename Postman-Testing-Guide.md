# Postman Testing Guide for Blog Backend API

This guide shows how to test all endpoints of your blog backend using Postman.

## 🚀 Setup Instructions

### 1. Install Postman
Download and install Postman from [https://www.postman.com](https://www.postman.com)

### 2. Import Collection
1. Open Postman
2. Click "Import" 
3. Choose "Raw text" and paste the collection JSON below
4. Save as "Blog Backend API"

### 3. Environment Variables
Create an environment with these variables:
```
baseUrl = http://localhost:5000/api
token = {{authToken}}  // Will be set after login
```

## 📋 Postman Collection JSON

Copy this entire JSON and import into Postman:

```json
{
  "info": {
    "name": "Blog Backend API",
    "description": "Complete API testing collection for blog backend",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/health",
          "host": ["{{baseUrl}}"],
          "path": ["health"]
        }
      }
    },
    {
      "name": "Register User",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"username\": \"testuser\",\n  \"email\": \"test@example.com\",\n  \"password\": \"Password123!\",\n  \"firstName\": \"Test\",\n  \"lastName\": \"User\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/auth/register",
          "host": ["{{baseUrl}}"],
          "path": ["auth", "register"]
        }
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"Password123!\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/auth/login",
          "host": ["{{baseUrl}}"],
          "path": ["auth", "login"]
        },
        "event": [
          {
            "listen": "test",
            "script": {
              "exec": [
                "if (pm.response.code === 200) {",
                "    const response = pm.response.json();",
                "    pm.environment.set(\"token\", response.token);",
                "    console.log('Token set:', response.token);",
                "}"
              ]
            }
          }
        ]
      }
    },
    {
      "name": "Get Profile",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/auth/profile",
          "host": ["{{baseUrl}}"],
          "path": ["auth", "profile"]
        }
      }
    },
    {
      "name": "Create Blog Post",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"title\": \"My Test Post\",\n  \"content\": \"This is a test blog post content. It should be at least a few sentences long to demonstrate the functionality properly.\",\n  \"excerpt\": \"A brief excerpt of my test post\",\n  \"category\": \"technology\",\n  \"tags\": [\"test\", \"api\", \"postman\"]\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/blog",
          "host": ["{{baseUrl}}"],
          "path": ["blog"]
        }
      }
    },
    {
      "name": "Get All Blog Posts",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/blog?page=1&limit=10",
          "host": ["{{baseUrl}}"],
          "path": ["blog"],
          "query": [
            {
              "key": "page",
              "value": "1"
            },
            {
              "key": "limit",
              "value": "10"
            }
          ]
        }
      }
    },
    {
      "name": "Get Single Blog Post",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/blog/{{postId}}",
          "host": ["{{baseUrl}}"],
          "path": ["blog", "{{postId}}"]
        }
      }
    },
    {
      "name": "Update Blog Post",
      "request": {
        "method": "PUT",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"title\": \"Updated Test Post\",\n  \"status\": \"published\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/blog/{{postId}}",
          "host": ["{{baseUrl}}"],
          "path": ["blog", "{{postId}}"]
        }
      }
    },
    {
      "name": "Delete Blog Post",
      "request": {
        "method": "DELETE",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "{{baseUrl}}/blog/{{postId}}",
          "host": ["{{baseUrl}}"],
          "path": ["blog", "{{postId}}"]
        }
      }
    },
    {
      "name": "Create Comment",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          },
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"content\": \"Great test post! Very informative.\",\n  \"blogPost\": \"{{postId}}\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/comments",
          "host": ["{{baseUrl}}"],
          "path": ["comments"]
        }
      }
    },
    {
      "name": "Get Comments for Blog Post",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/comments/blog/{{postId}}",
          "host": ["{{baseUrl}}"],
          "path": ["comments", "blog", "{{postId}}"]
        }
      }
    },
    {
      "name": "Search Blog Posts",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/search/posts?q=test&category=technology",
          "host": ["{{baseUrl}}"],
          "path": ["search", "posts"],
          "query": [
            {
              "key": "q",
              "value": "test"
            },
            {
              "key": "category",
              "value": "technology"
            }
          ]
        }
      }
    },
    {
      "name": "Upload Single Image",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "image",
              "type": "file",
              "src": []
            }
          ]
        },
        "url": {
          "raw": "{{baseUrl}}/upload/image",
          "host": ["{{baseUrl}}"],
          "path": ["upload", "image"]
        }
      }
    }
  ],
  "event": [
    {
      "listen": "prerequest",
      "script": {
        "type": "text/javascript",
        "exec": [
          "// Auto-set postId from create blog post response",
          "if (pm.response.code === 201 && pm.info.requestName === 'Create Blog Post') {",
          "    const response = pm.response.json();",
          "    if (response.blogPost && response.blogPost._id) {",
          "        pm.environment.set(\"postId\", response.blogPost._id);",
          "        console.log('Post ID set:', response.blogPost._id);",
          "    }",
          "}"
        ]
      }
    }
  ]
}
```

## 🧪 Step-by-Step Testing Process

### 1. Start Your Server
```bash
cd backend
npm run dev
```

### 2. Test Basic Connection
1. Open Postman
2. Select "Health Check" request
3. Click "Send"
4. Expected response: `{"status": "OK", "message": "Blog Backend API is running"}`

### 3. Register a New User
1. Select "Register User" request
2. Click "Send"
3. Expected response: User data with token
4. Token will be automatically saved to environment

### 4. Login
1. Select "Login" request
2. Click "Send"
3. Expected response: User data with token
4. Token will be automatically saved to environment

### 5. Create a Blog Post
1. Select "Create Blog Post" request
2. Click "Send"
3. Expected response: Created blog post data
4. Post ID will be automatically saved to environment

### 6. Test Other Endpoints
Use the saved `postId` and `token` variables to test:
- Get all blog posts
- Get single blog post
- Update blog post
- Create comments
- Search posts
- Upload images

## 🔧 Common Testing Scenarios

### Test Validation Errors
```json
// Invalid registration data
{
  "username": "ab",  // Too short
  "email": "invalid-email",
  "password": "123"  // Too weak
}
```

### Test Authentication
```json
// Try accessing protected endpoint without token
GET {{baseUrl}}/auth/profile
// Expected: 401 Unauthorized
```

### Test Authorization
```json
// Try updating someone else's post
PUT {{baseUrl}}/blog/{{differentPostId}}
// Expected: 403 Forbidden
```

## 📝 Tips for Testing

1. **Use Environment Variables** - Don't hardcode URLs
2. **Check Response Codes** - Verify correct HTTP status codes
3. **Test Error Cases** - Try invalid data
4. **Use Console** - Check Postman console for debug info
5. **Save Responses** - Keep successful responses for reference

## 🐛 Common Issues & Solutions

### **CORS Issues**
- Make sure frontend URL is in CORS whitelist
- Check that `Authorization` header is included

### **Token Issues**
- Token expires after 7 days
- Make sure token is properly formatted: `Bearer <token>`

### **File Upload Issues**
- Make sure Cloudinary credentials are set
- Check file size limits (5MB max)
- Verify file types (jpg, png, gif, webp)

### **Database Issues**
- Make sure MongoDB is running
- Check connection string in `.env`
- Verify database permissions

## 📊 Test Data Examples

### Valid Blog Post
```json
{
  "title": "Getting Started with APIs",
  "content": "APIs are essential for modern web development...",
  "excerpt": "Learn the fundamentals of API design",
  "category": "technology",
  "tags": ["api", "development", "tutorial"]
}
```

### Valid Comment
```json
{
  "content": "This is a great explanation of API concepts!",
  "blogPost": "60f7b3b3b3b3b3b3b3b3b3b3"
}
```

This comprehensive guide will help you test all aspects of your blog backend API effectively!
