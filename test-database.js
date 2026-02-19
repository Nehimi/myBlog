const mongoose = require('mongoose');
const BlogPost = require('./src/models/BlogPost');
const User = require('./src/models/User');
require('dotenv').config();

async function testDatabase() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if there are any users
    const userCount = await User.countDocuments();
    console.log(`Users in database: ${userCount}`);

    // Check if there are any blog posts
    const postCount = await BlogPost.countDocuments();
    console.log(`Blog posts in database: ${postCount}`);

    // Get all posts to see their structure
    const posts = await BlogPost.find().limit(3);
    console.log('Sample posts:');
    posts.forEach(post => {
      console.log(`- ${post.title} (${post.status}) - ${post.publishedAt}`);
    });

    // Try to create a test post
    if (userCount > 0) {
      const user = await User.findOne();
      console.log('Creating test post...');
      
      const testPost = new BlogPost({
        title: 'Test Post for Database',
        content: 'This is a test post to verify database posting works',
        category: 'Test',
        status: 'published',
        author: user._id
      });

      await testPost.save();
      console.log('Test post created successfully!');
      console.log('Post ID:', testPost._id);
      console.log('Published at:', testPost.publishedAt);

      // Clean up the test post
      await BlogPost.findByIdAndDelete(testPost._id);
      console.log('Test post cleaned up');
    } else {
      console.log('No users found - cannot create test post');
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Database test failed:', error);
    process.exit(1);
  }
}

testDatabase();
