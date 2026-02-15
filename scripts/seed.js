require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const BlogPost = require('../src/models/BlogPost');
const connectDB = require('../src/config/database');

const seedData = async () => {
  try {
    await connectDB();
    
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await BlogPost.deleteMany({});
    
    console.log('Creating users...');
    const adminUser = new User({
      username: 'admin',
      email: 'admin@blog.com',
      password: 'Admin123!',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });
    
    const authorUser = new User({
      username: 'johndoe',
      email: 'john@blog.com',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
      bio: 'Passionate writer and tech enthusiast'
    });
    
    await adminUser.save();
    await authorUser.save();
    
    console.log('Creating blog posts...');
    const samplePosts = [
      {
        title: 'Getting Started with Node.js',
        content: `# Getting Started with Node.js

Node.js is a powerful JavaScript runtime built on Chrome's V8 JavaScript engine. In this comprehensive guide, we'll explore everything you need to know to get started with Node.js development.

## What is Node.js?

Node.js is an open-source, cross-platform JavaScript runtime environment that executes JavaScript code outside a web browser. It allows developers to use JavaScript to write command line tools and for server-side scripting.

## Key Features

- **Asynchronous and Event-Driven**: All APIs of Node.js library are asynchronous, meaning they don't block the Node.js server.
- **Fast Execution**: Being built on Google Chrome's V8 JavaScript Engine, Node.js library is very fast in code execution.
- **Single Threaded**: Node.js follows a single threaded model with event looping.
- **Highly Scalable**: Node.js uses a single threaded model with event looping which helps server to respond in a non-blocking way.

## Installation

To install Node.js, visit the official website [nodejs.org](https://nodejs.org) and download the appropriate version for your operating system.

## Your First Node.js Application

Create a file called \`app.js\`:

\`\`\`javascript
console.log('Hello, Node.js!');
\`\`\`

Run it from your terminal:

\`\`\`bash
node app.js
\`\`\`

Congratulations! You've just run your first Node.js application.

## Conclusion

Node.js is an excellent choice for building fast, scalable network applications. Its event-driven, non-blocking I/O model makes it perfect for data-intensive real-time applications that run across distributed devices.`,
        excerpt: 'Learn the fundamentals of Node.js and start building powerful server-side applications with JavaScript.',
        category: 'technology',
        tags: ['nodejs', 'javascript', 'backend', 'tutorial'],
        author: authorUser._id,
        status: 'published',
        seo: {
          metaTitle: 'Getting Started with Node.js - Complete Guide',
          metaDescription: 'Learn Node.js fundamentals with this comprehensive tutorial covering installation, key features, and your first application.',
          keywords: ['nodejs', 'javascript', 'backend development', 'tutorial']
        }
      },
      {
        title: 'Understanding MongoDB: A NoSQL Database',
        content: `# Understanding MongoDB: A NoSQL Database

MongoDB is a popular NoSQL database that provides high performance, high availability, and easy scalability. It works on the concept of collections and documents.

## What is MongoDB?

MongoDB is a document-oriented NoSQL database used for high volume data storage. Instead of using tables and rows as in traditional relational databases, MongoDB makes use of collections and documents.

## Key Concepts

### Documents
Documents consist of key-value pairs which are the basic unit of data in MongoDB.

### Collections
Collections are groups of MongoDB documents. A collection is the equivalent of an RDBMS table.

### Database
A database is a container for collections. A single MongoDB server can have multiple databases.

## Features of MongoDB

- **Schema-less Database**: A single collection can have multiple types of documents.
- **Document Oriented**: Data is stored in the form of JSON style documents.
- **Indexing**: Indexes can be created to improve the performance of searches.
- **Scalability**: MongoDB supports horizontal scaling through sharding.
- **Replication**: MongoDB provides high availability with replica sets.

## Basic Operations

### Insert Document
\`\`\`javascript
db.users.insertOne({
  name: "John Doe",
  email: "john@example.com",
  age: 30
});
\`\`\`

### Find Document
\`\`\`javascript
db.users.find({ name: "John Doe" });
\`\`\`

### Update Document
\`\`\`javascript
db.users.updateOne(
  { name: "John Doe" },
  { $set: { age: 31 } }
);
\`\`\`

## When to Use MongoDB

- When you need flexible data models
- When you need to handle large amounts of data
- When you need high availability and automatic scaling
- When you need rapid development and iteration

## Conclusion

MongoDB is an excellent choice for applications that require flexible data models, horizontal scaling, and high performance. Its document-oriented nature makes it particularly well-suited for modern web applications.`,
        excerpt: 'Explore MongoDB, a powerful NoSQL database that offers flexibility, scalability, and high performance for modern applications.',
        category: 'database',
        tags: ['mongodb', 'nosql', 'database', 'tutorial'],
        author: authorUser._id,
        status: 'published',
        seo: {
          metaTitle: 'Understanding MongoDB - Complete NoSQL Guide',
          metaDescription: 'Learn MongoDB fundamentals including documents, collections, indexing, and when to use this powerful NoSQL database.',
          keywords: ['mongodb', 'nosql', 'database', 'tutorial']
        }
      },
      {
        title: 'REST API Best Practices',
        content: `# REST API Best Practices

Building a well-designed REST API is crucial for creating scalable and maintainable web applications. This guide covers the best practices you should follow.

## What is REST?

REST (Representational State Transfer) is an architectural style for designing networked applications. It uses HTTP requests to access and use data.

## Core Principles

### 1. Use HTTP Methods Correctly
- **GET**: Retrieve data
- **POST**: Create new data
- **PUT/PATCH**: Update existing data
- **DELETE**: Remove data

### 2. Use Proper HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **404**: Not Found
- **500**: Internal Server Error

### 3. Version Your API
Include version information in your API URLs:
\`\`\`
/api/v1/users
/api/v2/users
\`\`\`

## URL Design Best Practices

### Use Nouns, Not Verbs
Instead of:
- \`/getAllUsers\`
- \`/createUser\`

Use:
- \`GET /users\`
- \`POST /users\`

### Use Plural Nouns
- \`/users\` instead of \`/user\`
- \`/products\` instead of \`/product\`

### Use Consistent Naming
- Use kebab-case for multi-word resources
- Be consistent throughout your API

## Response Format

### Use JSON
JSON is the standard format for REST APIs:
\`\`\`json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com"
}
\`\`\`

### Include Metadata
For list responses, include pagination metadata:
\`\`\`json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
\`\`\`

## Security Best Practices

### Use HTTPS
Always use HTTPS to encrypt data in transit.

### Implement Authentication
Use JWT or OAuth 2.0 for authentication.

### Rate Limiting
Implement rate limiting to prevent abuse.

## Error Handling

Provide clear, consistent error messages:
\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "value": "invalid-email"
    }
  }
}
\`\`\`

## Conclusion

Following these best practices will help you build robust, scalable, and maintainable REST APIs that developers love to use.`,
        excerpt: 'Learn the essential best practices for designing and implementing robust REST APIs that developers will love to use.',
        category: 'api',
        tags: ['rest', 'api', 'best-practices', 'backend'],
        author: authorUser._id,
        status: 'published',
        seo: {
          metaTitle: 'REST API Best Practices - Complete Guide',
          metaDescription: 'Master REST API design with these essential best practices covering HTTP methods, URL design, security, and error handling.',
          keywords: ['rest', 'api', 'best-practices', 'backend', 'tutorial']
        }
      }
    ];
    
    for (const postData of samplePosts) {
      const post = new BlogPost(postData);
      await post.save();
    }
    
    console.log('Seed data created successfully!');
    console.log(`Created ${2} users and ${3} blog posts`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
