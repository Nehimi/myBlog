#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

const commands = {
  'all': 'npm test',
  'unit': 'npm run test:unit',
  'integration': 'npm run test:integration',
  'coverage': 'npm run test:coverage',
  'watch': 'npm run test:watch',
  'user': 'npx jest tests/unit/models/User.test.js',
  'auth': 'npx jest tests/integration/auth.test.js',
  'blog': 'npx jest tests/integration/blog.test.js'
};

const help = `
Usage: node scripts/test-runner.js [command]

Commands:
  all          - Run all tests
  unit         - Run unit tests only
  integration  - Run integration tests only
  coverage     - Run tests with coverage report
  watch        - Run tests in watch mode
  user         - Run user model tests
  auth         - Run authentication tests
  blog         - Run blog post tests

Examples:
  node scripts/test-runner.js unit
  node scripts/test-runner.js auth
  node scripts/test-runner.js coverage
`;

const command = process.argv[2];

if (!command) {
  console.log(help);
  process.exit(0);
}

if (!commands[command]) {
  console.log(`Unknown command: ${command}`);
  console.log(help);
  process.exit(1);
}

try {
  console.log(`Running: ${commands[command]}`);
  console.log('='.repeat(50));
  
  execSync(commands[command], {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..')
  });
  
  console.log('='.repeat(50));
  console.log('✅ Tests completed successfully!');
} catch (error) {
  console.log('='.repeat(50));
  console.log('❌ Tests failed!');
  process.exit(1);
}
