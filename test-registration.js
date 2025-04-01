// Test script to check user registration functionality
import fetch from 'node-fetch';
import { CookieJar } from 'tough-cookie';
import fetchCookie from 'fetch-cookie';

// Create a cookie jar to maintain cookies between requests
const jar = new CookieJar();
const fetchWithCookies = fetchCookie(fetch, jar);

async function loginUser(username, password) {
  console.log(`Logging in user: ${username}`);
  
  try {
    const response = await fetchWithCookies('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    const responseData = await response.json();
    
    if (response.ok) {
      console.log("✅ Login successful:", responseData);
      return { success: true, user: responseData };
    } else {
      console.error("❌ Login failed:", responseData);
      return { success: false, error: responseData };
    }
  } catch (error) {
    console.error("❌ Error during login:", error);
    return { success: false, error: error.message };
  }
}

async function testRegistration() {
  console.log("Testing user registration...");
  
  // Generate a unique username to avoid conflicts
  const timestamp = new Date().getTime();
  const testUser = {
    username: `testuser_${timestamp}`,
    password: "testpassword123",
    businessName: "Test Business",
    email: `test_${timestamp}@example.com`
  };
  
  console.log(`Attempting to register user: ${testUser.username}`);
  
  try {
    const response = await fetchWithCookies('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });
    
    const responseData = await response.json();
    
    if (response.ok) {
      console.log("✅ Registration successful:", responseData);
      return { success: true, user: responseData };
    } else {
      console.error("❌ Registration failed:", responseData);
      return { success: false, error: responseData };
    }
  } catch (error) {
    console.error("❌ Error during registration test:", error);
    return { success: false, error: error.message };
  }
}

async function testOpenAI() {
  console.log("\nTesting OpenAI integration...");
  
  // First register a test user to get authenticated
  const registrationResult = await testRegistration();
  
  if (!registrationResult.success) {
    console.error("Cannot test OpenAI integration because registration failed");
    return { success: false, error: "Registration failed" };
  }
  
  // Log in with the registered user credentials
  const { username } = registrationResult.user;
  const password = "testpassword123"; // This should match what we used in registration
  const loginResult = await loginUser(username, password);
  
  if (!loginResult.success) {
    console.error("Cannot test OpenAI integration because login failed");
    return { success: false, error: "Login failed" };
  }
  
  // Create a basic objective
  const objective = {
    objective: "Increase brand awareness",
    description: "We want to reach more potential customers in our local area",
    targetAudience: "Adults 25-45 interested in fitness and wellness",
    budget: "$500-1000",
    duration: "1 month"
  };
  
  try {
    console.log("Creating an ad objective...");
    const objectiveResponse = await fetchWithCookies('http://localhost:5000/api/objectives', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(objective)
    });
    
    const objectiveData = await objectiveResponse.json();
    
    if (!objectiveResponse.ok) {
      console.error("❌ Failed to create objective:", objectiveData);
      return { success: false, error: objectiveData };
    }
    
    console.log("✅ Objective created:", objectiveData);
    
    // Now generate ad suggestions using OpenAI
    console.log("\nGenerating ad suggestions with OpenAI...");
    const suggestionsResponse = await fetchWithCookies('http://localhost:5000/api/suggestions/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        objectiveId: objectiveData.id,
        count: 1
      })
    });
    
    const suggestionsData = await suggestionsResponse.json();
    
    if (suggestionsResponse.ok) {
      console.log("✅ Ad suggestions generated successfully!");
      console.log(suggestionsData);
      return { success: true, suggestions: suggestionsData };
    } else {
      console.error("❌ Failed to generate ad suggestions:", suggestionsData);
      return { success: false, error: suggestionsData };
    }
    
  } catch (error) {
    console.error("❌ Error during OpenAI test:", error);
    return { success: false, error: error.message };
  }
}

// Run the tests
(async () => {
  console.log("=== ADSY APPLICATION TESTS ===");
  
  // Uncomment the test you want to run
  // await testRegistration();
  await testOpenAI();
  
  console.log("\nTests completed.");
})();