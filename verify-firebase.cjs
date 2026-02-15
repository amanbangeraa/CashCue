#!/usr/bin/env node

/**
 * Firebase Configuration Verification Script
 * 
 * This script verifies that Firebase is properly configured for the CashCue app.
 * Run with: node verify-firebase.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Firebase Configuration Verification\n');
console.log('='.repeat(60));

// Check 1: .env file exists
console.log('\n✓ Step 1: Checking .env file');
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('  ✗ .env file not found!');
  console.log('  Create a .env file based on .env.example');
  process.exit(1);
}
console.log('  ✓ .env file exists');

// Check 2: Parse and validate environment variables
console.log('\n✓ Step 2: Validating Environment Variables');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  line = line.trim();
  if (line && !line.startsWith('#') && line.includes('=')) {
    const [key, ...valueParts] = line.split('=');
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const requiredVars = [
  'VITE_GEMINI_API_KEY',
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_MEASUREMENT_ID'
];

let allVarsPresent = true;
requiredVars.forEach(varName => {
  const value = envVars[varName];
  if (value && value !== `your_${varName.toLowerCase()}_here`) {
    const masked = value.substring(0, 10) + '...';
    console.log(`  ✓ ${varName}: ${masked}`);
  } else {
    console.log(`  ✗ ${varName}: ${value ? 'NOT CONFIGURED' : 'MISSING'}`);
    allVarsPresent = false;
  }
});

if (!allVarsPresent) {
  console.log('\n❌ Error: Some environment variables are missing or not configured!');
  console.log('Please check your .env file and ensure all variables are set.');
  process.exit(1);
}

// Check 3: Verify Firebase SDK installation
console.log('\n✓ Step 3: Checking Firebase SDK');
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

if (packageJson.dependencies.firebase) {
  console.log(`  ✓ Firebase SDK installed: v${packageJson.dependencies.firebase.replace('^', '')}`);
} else {
  console.log('  ✗ Firebase SDK not installed');
  console.log('  Run: npm install firebase');
  process.exit(1);
}

// Check 4: Verify firebase.ts configuration
console.log('\n✓ Step 4: Checking Firebase Configuration File');
const firebaseTsPath = path.join(__dirname, 'src', 'lib', 'firebase.ts');
if (fs.existsSync(firebaseTsPath)) {
  const content = fs.readFileSync(firebaseTsPath, 'utf8');
  const checks = [
    { name: 'initializeApp', present: content.includes('initializeApp') },
    { name: 'getAuth', present: content.includes('getAuth') },
    { name: 'getFirestore', present: content.includes('getFirestore') },
    { name: 'firebaseConfig', present: content.includes('firebaseConfig') },
  ];
  
  checks.forEach(check => {
    if (check.present) {
      console.log(`  ✓ ${check.name} imported/used`);
    } else {
      console.log(`  ✗ ${check.name} missing`);
      allVarsPresent = false;
    }
  });
} else {
  console.log('  ✗ firebase.ts not found');
  process.exit(1);
}

// Check 5: Configuration Summary
console.log('\n✓ Step 5: Configuration Summary');
console.log(`  Project: ${envVars.VITE_FIREBASE_PROJECT_ID}`);
console.log(`  Auth Domain: ${envVars.VITE_FIREBASE_AUTH_DOMAIN}`);
console.log(`  Storage Bucket: ${envVars.VITE_FIREBASE_STORAGE_BUCKET}`);

console.log('\n' + '='.repeat(60));
console.log('✅ Firebase configuration is valid and ready to use!\n');
console.log('Next Steps:');
console.log('1. Ensure Firestore Database is enabled in Firebase Console');
console.log('2. Ensure Authentication (Email/Password) is enabled');
console.log('3. Set up Firestore Security Rules (see FIREBASE_SETUP_GUIDE.md)');
console.log('4. Start the dev server: npm run dev');
console.log('5. Sign up for a new account and test the app\n');
console.log('📚 For detailed setup instructions, see: FIREBASE_SETUP_GUIDE.md\n');
