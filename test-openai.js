import fetch from 'node-fetch';
import { CookieJar } from 'tough-cookie';
import fetchCookie from 'fetch-cookie';

// Setup cookie jar for session management
const jar = new CookieJar();
const cookieFetch = fetchCookie(fetch, jar);

// Base URL for API calls
const API_BASE_URL = 'http://localhost:5000';

// Test user credentials
const TEST_USER = {
  username: 'testuser',
  password: 'password123',
  email: 'test@example.com',
  businessName: 'Test Business'
};

// Main test function
async function testOpenAI() {
  try {
    console.log('Starting OpenAI integration test...');
    
    // Step 1: Register a test user
    await registerUser(TEST_USER);
    
    // Step 2: Login
    await loginUser(TEST_USER.username, TEST_USER.password);
    
    // Step 3: Create an ad objective
    const objective = await createAdObjective();
    
    // Step 4: Generate ad suggestions using OpenAI
    await generateAdSuggestions(objective.id);
    
    console.log('OpenAI integration test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Helper functions

// Register a new user
async function registerUser(userData) {
  console.log('Registering test user...');
  const response = await cookieFetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    // If user already exists, just continue
    if (error.message && error.message.includes('already exists')) {
      console.log('User already exists, continuing with test...');
      return;
    }
    throw new Error(`Registration failed: ${error.message || response.statusText}`);
  }
  
  const data = await response.json();
  console.log('User registered successfully:', data);
  return data;
}

// Login a user
async function loginUser(username, password) {
  console.log('Logging in...');
  const response = await cookieFetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Login failed: ${error.message || response.statusText}`);
  }
  
  const data = await response.json();
  console.log('Login successful:', data);
  return data;
}

// Create a test ad objective
async function createAdObjective() {
  console.log('Creating ad objective...');
  const objectiveData = {
    name: 'Test Objective',
    objective: 'BRAND_AWARENESS',
    description: 'Testing OpenAI integration',
    targetAudience: 'Small business owners aged 25-45',
    budget: '1000',
    duration: '30 days'
  };
  
  const response = await cookieFetch(`${API_BASE_URL}/api/objectives`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(objectiveData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create objective: ${error.message || response.statusText}`);
  }
  
  const data = await response.json();
  console.log('Ad objective created:', data);
  return data;
}

// Generate ad suggestions using OpenAI
async function generateAdSuggestions(objectiveId) {
  console.log(`Generating ad suggestions for objective ${objectiveId}...`);
  
  const response = await cookieFetch(`${API_BASE_URL}/api/suggestions/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      objectiveId,
      count: 2
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to generate suggestions: ${error.message || response.statusText}`);
  }
  
  const data = await response.json();
  console.log('Generated ad suggestions:', data);
  return data;
}

// Run the test
testOpenAI();