#!/usr/bin/env node

/**
 * Simple API test script to verify the /identify endpoint
 * Run with: node test-api.js
 */

const http = require('http');

const API_BASE = 'http://localhost:3000';

// Test data
const testCases = [
  {
    name: 'Test 1: New primary contact',
    data: { email: 'lorraine@hillvalley.edu', phoneNumber: '123456' }
  },
  {
    name: 'Test 2: Create secondary contact (same phone)',
    data: { email: 'mcfly@hillvalley.edu', phoneNumber: '123456' }
  },
  {
    name: 'Test 3: Query existing contact',
    data: { email: 'lorraine@hillvalley.edu', phoneNumber: null }
  }
];

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + path);
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting API Tests...\n');

  // Health check
  try {
    const health = await makeRequest('/');
    console.log('✅ Health Check:', health.status === 200 ? 'PASS' : 'FAIL');
    console.log('   Response:', JSON.stringify(health.data, null, 2));
  } catch (error) {
    console.log('❌ Health Check: FAIL - Server not running?');
    console.log('   Make sure server is running on http://localhost:3000');
    return;
  }

  console.log('\n📋 Running Test Cases...\n');

  // Run test cases
  for (const testCase of testCases) {
    try {
      console.log(`\n${testCase.name}:`);
      console.log('   Request:', JSON.stringify(testCase.data, null, 2));
      
      const result = await makeRequest('/identify', 'POST', testCase.data);
      
      if (result.status === 200) {
        console.log('   ✅ Status: PASS');
        console.log('   Response:', JSON.stringify(result.data, null, 2));
        
        // Validate response structure
        const contact = result.data.contact;
        if (contact && 
            typeof contact.primaryContactId === 'number' &&
            Array.isArray(contact.emails) &&
            Array.isArray(contact.phoneNumbers) &&
            Array.isArray(contact.secondaryContactIds)) {
          console.log('   ✅ Response Format: VALID');
        } else {
          console.log('   ❌ Response Format: INVALID');
        }
      } else {
        console.log(`   ❌ Status: FAIL (${result.status})`);
        console.log('   Error:', result.data);
      }
    } catch (error) {
      console.log('   ❌ Request Failed:', error.message);
    }
  }

  console.log('\n🎉 Tests completed!');
  console.log('\n💡 To run manually:');
  console.log('curl -X POST http://localhost:3000/identify \\');
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -d \'{"email":"test@example.com","phoneNumber":"1234567890"}\'');
}

runTests().catch(console.error);
