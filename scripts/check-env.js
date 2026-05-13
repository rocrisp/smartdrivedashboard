#!/usr/bin/env node

// Environment Variables Validation Script
// Checks if all required environment variables are set

const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
];

console.log('🔍 Checking environment variables...\n');

let missingVars = [];
let hasErrors = false;

requiredEnvVars.forEach((varName) => {
  const value = process.env[varName];

  if (!value) {
    console.log(`❌ ${varName} is missing`);
    missingVars.push(varName);
    hasErrors = true;
  } else if (value.includes('your-') || value.includes('password') && value.length < 20) {
    console.log(`⚠️  ${varName} appears to be using a placeholder value`);
    hasErrors = true;
  } else {
    console.log(`✅ ${varName} is set`);
  }
});

console.log('');

if (hasErrors) {
  console.log('❌ Environment validation failed!\n');

  if (missingVars.length > 0) {
    console.log('Missing variables:');
    missingVars.forEach(varName => {
      console.log(`  - ${varName}`);
    });
    console.log('');
  }

  console.log('Please check your .env file and ensure all variables are properly set.');
  console.log('See .env.example for reference.\n');

  console.log('Quick help:');
  console.log('  - DATABASE_URL: PostgreSQL connection string');
  console.log('  - NEXTAUTH_SECRET: Generate with: openssl rand -base64 32');
  console.log('  - NEXTAUTH_URL: Your app URL (http://localhost:3000 for dev)');
  console.log('  - GOOGLE_CLIENT_ID: From Google Cloud Console');
  console.log('  - GOOGLE_CLIENT_SECRET: From Google Cloud Console\n');

  process.exit(1);
} else {
  console.log('✅ All environment variables are set!\n');
  process.exit(0);
}
