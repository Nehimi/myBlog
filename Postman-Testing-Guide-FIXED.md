# 🧪 Blog Backend API Testing Guide

## 🚀 Quick Start

### 1. Environment Setup
Create an environment with these variables:
```bash
baseUrl = http://localhost:5000/api
token = {{authToken}}  // Will be set after login
```

### 2. Import Collection
Copy this entire JSON and import into Postman:

```json
{
  "info": {
    "name": "Blog Backend API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
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
        }
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
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
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
      },
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "if (pm.response.code === 201) {",
              "    const response = pm.response.json();",
              "    pm.environment.set(\"postId\", response.blogPost._id);",
              "    console.log('Post ID set:', response.blogPost._id);",
              "}"
            ]
          }
        }
      ]
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
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"title\": \"Updated Blog Post Title\",\n  \"status\": \"published\"\n}"
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
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"content\": \"Great blog post!\",\n  \"blogPost\": \"{{postId}}\",\n  \"parent\": \"{{parentCommentId}}\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/comments/{{postId}}",
          "host": ["{{baseUrl}}"],
          "path": ["comments", "{{postId}}"]
        }
      }
    },
    {
      "name": "Get Comments for Blog Post",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/comments/blog/{{postId}}?page=1&limit=20",
          "host": ["{{baseUrl}}"],
          "path": ["comments", "blog", "{{postId}}"],
          "query": [
            {
              "key": "page",
              "value": "1"
            },
            {
              "key": "limit",
              "value": "20"
            }
          ]
        }
      }
    },
    {
      "name": "Search Blog Posts",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/search/posts?q=nodejs&category=technology&sortBy=newest&page=1&limit=10",
          "host": ["{{baseUrl}}"],
          "path": ["search", "posts"],
          "query": [
            {
              "key": "q",
              "value": "nodejs"
            },
            {
              "key": "category",
              "value": "technology"
            },
            {
              "key": "sortBy",
              "value": "newest"
            },
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
      "name": "Get Search Suggestions",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/search/suggestions?q=node",
          "host": ["{{baseUrl}}"],
          "path": ["search", "suggestions"],
          "query": [
            {
              "key": "q",
              "value": "node"
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
          "raw": "{{baseUrl}}/upload/single",
          "host": ["{{baseUrl}}"],
          "path": ["upload", "single"]
        }
      }
    },
    {
      "name": "Upload Multiple Images",
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
              "key": "images",
              "type": "file",
              "src": []
            }
          ]
        },
        "url": {
          "raw": "{{baseUrl}}/upload/multiple",
          "host": ["{{baseUrl}}"],
          "path": ["upload", "multiple"]
        }
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

### 4. Test Authentication
1. Select "Get Profile" request
2. Click "Send"
3. Expected response: User profile data
4. Verify Authorization header is working

### 5. Create Blog Post
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
Expected: 400 Bad Request with validation errors

### Test Authentication
```json
// Try accessing protected endpoint without token
GET {{baseUrl}}/auth/profile
```
Expected: 401 Unauthorized

### Test Authorization
```json
// Try updating someone else's post
PUT {{baseUrl}}/blog/{{differentPostId}}
```
Expected: 403 Forbidden

## 📝 Tips for Testing

1. **Use Environment Variables** - Always use `{{baseUrl}}` and `{{token}}`
2. **Check Response Codes** - 200 for success, 400/401/403 for errors
3. **Save Variables** - Post ID and token are auto-saved for reuse
4. **Test Sequentially** - Follow the order: Health → Register → Login → Create Post
5. **Read Error Messages** - API returns descriptive error messages

## 📊 Test Data Examples

### Valid Blog Post
```json
{
  "title": "Getting Started with APIs",
  "content": "APIs are essential for modern web development...",
  "excerpt": "Learn API fundamentals and start building powerful applications.",
  "category": "technology",
  "tags": ["api", "development", "tutorial"]
}
```

### Valid Comment
```json
{
  "content": "This is a great explanation of API concepts!",
  "blogPost": "60f7b3b3b3b3b3b3b3b3b3"
}
```

This comprehensive guide will help you test all aspects of your blog backend API effectively!
