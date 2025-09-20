import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', body = null, token = null) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 500, data: { error: error.message } };
  }
}

// Test functions
async function testHealthCheck() {
  console.log('\n🏥 Testing Health Check...');
  try {
    const response = await fetch('http://localhost:5000/health');
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, data);
    return response.status === 200;
  } catch (error) {
    console.log(`Error: ${error.message}`);
    return false;
  }
}

async function testAuthLogin() {
  console.log('\n🔐 Testing Authentication Login...');
  const loginData = {
    email: 'admin@company.com',
    password: 'admin123'
  };
  
  const result = await apiCall('/auth/login', 'POST', loginData);
  console.log(`Status: ${result.status}`);
  console.log(`Response:`, result.data);
  
  if (result.data.success && result.data.data && result.data.data.token) {
    authToken = result.data.data.token;
    console.log('✅ Login successful, token saved');
    return true;
  }
  console.log('❌ Login failed - no token received');
  return false;
}

async function testGetUsers() {
  console.log('\n👥 Testing Get Users...');
  const result = await apiCall('/users', 'GET', null, authToken);
  console.log(`Status: ${result.status}`);
  console.log(`Response:`, result.data);
  return result.status === 200;
}

async function testGetProducts() {
  console.log('\n📦 Testing Get Products...');
  const result = await apiCall('/products', 'GET', null, authToken);
  console.log(`Status: ${result.status}`);
  console.log(`Response:`, result.data);
  return result.status === 200;
}

async function testCreateProduct() {
  console.log('\n➕ Testing Create Product...');
  const productData = {
    name: 'Test Product',
    description: 'Test product description',
    sku: 'TEST-001',
    category: 'Test',
    brand: 'Test Brand',
    price: 1000,
    costPrice: 800,
    stock: 10,
    minStock: 2,
    maxStock: 50,
    unit: 'pieces',
    branch: 'main',
    isActive: true
  };
  
  const result = await apiCall('/products', 'POST', productData, authToken);
  console.log(`Status: ${result.status}`);
  console.log(`Response:`, result.data);
  return result.status === 200 || result.status === 201;
}

async function testGetBranches() {
  console.log('\n🏢 Testing Get Branches...');
  const result = await apiCall('/branches', 'GET', null, authToken);
  console.log(`Status: ${result.status}`);
  console.log(`Response:`, result.data);
  return result.status === 200;
}

async function testGetPayments() {
  console.log('\n💳 Testing Get Payments...');
  const result = await apiCall('/payments', 'GET', null, authToken);
  console.log(`Status: ${result.status}`);
  console.log(`Response:`, result.data);
  return result.status === 200;
}

async function testCreatePayment() {
  console.log('\n💰 Testing Create Payment...');
  const paymentData = {
    amount: 5000,
    paymentMethod: 'upi',
    paymentType: 'credit',
    description: 'Test payment',
    reference: 'TEST-PAY-001',
    customer: 'Test Customer',
    notes: 'Test payment notes'
  };
  
  const result = await apiCall('/payments', 'POST', paymentData, authToken);
  console.log(`Status: ${result.status}`);
  console.log(`Response:`, result.data);
  return result.status === 200 || result.status === 201;
}

async function testGetInvoices() {
  console.log('\n📄 Testing Get Invoices...');
  const result = await apiCall('/billing/invoices', 'GET', null, authToken);
  console.log(`Status: ${result.status}`);
  console.log(`Response:`, result.data);
  return result.status === 200;
}

async function testGetDashboard() {
  console.log('\n📊 Testing Get Dashboard...');
  const result = await apiCall('/dashboard', 'GET', null, authToken);
  console.log(`Status: ${result.status}`);
  console.log(`Response:`, result.data);
  return result.status === 200;
}

async function testGetReports() {
  console.log('\n📈 Testing Get Reports...');
  const result = await apiCall('/reports', 'GET', null, authToken);
  console.log(`Status: ${result.status}`);
  console.log(`Response:`, result.data);
  return result.status === 200;
}

// Main test function
async function runAllTests() {
  console.log('🚀 Starting API Tests...');
  console.log('=' .repeat(50));
  
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'Auth Login', fn: testAuthLogin },
    { name: 'Get Users', fn: testGetUsers },
    { name: 'Get Products', fn: testGetProducts },
    { name: 'Create Product', fn: testCreateProduct },
    { name: 'Get Branches', fn: testGetBranches },
    { name: 'Get Payments', fn: testGetPayments },
    { name: 'Create Payment', fn: testCreatePayment },
    { name: 'Get Invoices', fn: testGetInvoices },
    { name: 'Get Dashboard', fn: testGetDashboard },
    { name: 'Get Reports', fn: testGetReports }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const success = await test.fn();
      results.push({ name: test.name, success });
      console.log(`${success ? '✅' : '❌'} ${test.name}: ${success ? 'PASSED' : 'FAILED'}`);
    } catch (error) {
      results.push({ name: test.name, success: false, error: error.message });
      console.log(`❌ ${test.name}: ERROR - ${error.message}`);
    }
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('📋 Test Summary:');
  console.log('=' .repeat(50));
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${result.name}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log('\n' + '=' .repeat(50));
  console.log(`🎯 Overall Result: ${passed}/${total} tests passed`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
  
  if (passed === total) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Check the output above for details.');
  }
}

// Run the tests
runAllTests().catch(console.error);
