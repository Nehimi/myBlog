const request = require('supertest');
const app = require('./app');

async function testEndpoint() {
  try {
    console.log('Testing /api/blog/by-year endpoint...');
    
    const response = await request(app)
      .get('/api/blog/by-year')
      .expect(200);
    
    console.log('Response status:', response.status);
    console.log('Response body:', JSON.stringify(response.body, null, 2));
    
    if (response.body.blogPostsByYear) {
      console.log('Years found:', response.body.blogPostsByYear.length);
      response.body.blogPostsByYear.forEach(year => {
        console.log(`Year ${year._id}: ${year.count} posts`);
      });
    } else {
      console.log('No blogPostsByYear field in response');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}

testEndpoint();
