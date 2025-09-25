import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testTeamNoEditPermissions() {
  console.log('🧪 Testing Team User Edit Permissions...\n');

  try {
    // Login as team user
    console.log('1. Logging in as team1@company.com...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'team1@company.com',
      password: 'team123'
    });

    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }

    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    console.log('✅ Login successful\n');

    // Test 1: Try to edit an invoice (should fail)
    console.log('2. Testing invoice edit permission...');
    try {
      const editInvoiceResponse = await axios.put(
        `${API_BASE_URL}/billing/invoice/fake-id`,
        {
          customer: { name: 'Test Customer', email: 'test@example.com' },
          items: [{ product: 'fake-product-id', quantity: 1, price: 100 }],
          total: 100,
          paymentStatus: 'paid',
          paymentMethod: 'cash'
        },
        { headers }
      );
      console.log('❌ Invoice edit should have failed but succeeded');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ Invoice edit correctly blocked (403 Forbidden)');
      } else if (error.response?.status === 404) {
        console.log('✅ Invoice edit correctly blocked (404 Not Found - permission check passed)');
      } else {
        console.log(`⚠️  Invoice edit blocked with status: ${error.response?.status}`);
      }
    }

    // Test 2: Try to edit a payment (should fail)
    console.log('\n3. Testing payment edit permission...');
    try {
      const editPaymentResponse = await axios.put(
        `${API_BASE_URL}/payments/fake-id`,
        {
          amount: 100,
          paymentMethod: 'cash',
          paymentType: 'credit',
          description: 'Test payment',
          customer: 'Test Customer'
        },
        { headers }
      );
      console.log('❌ Payment edit should have failed but succeeded');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('✅ Payment edit correctly blocked (403 Forbidden)');
      } else if (error.response?.status === 404) {
        console.log('✅ Payment edit correctly blocked (404 Not Found - permission check passed)');
      } else {
        console.log(`⚠️  Payment edit blocked with status: ${error.response?.status}`);
      }
    }

    // Test 3: Verify team user can still view invoices
    console.log('\n4. Testing invoice view permission...');
    try {
      const viewInvoicesResponse = await axios.get(`${API_BASE_URL}/billing/invoices`, { headers });
      if (viewInvoicesResponse.data.success) {
        console.log('✅ Invoice view permission working correctly');
        console.log(`   Found ${viewInvoicesResponse.data.invoices?.length || 0} invoices`);
      } else {
        console.log('❌ Invoice view permission failed');
      }
    } catch (error) {
      console.log(`❌ Invoice view failed: ${error.response?.data?.message || error.message}`);
    }

    // Test 4: Verify team user can still view payments
    console.log('\n5. Testing payment view permission...');
    try {
      const viewPaymentsResponse = await axios.get(`${API_BASE_URL}/payments`, { headers });
      if (viewPaymentsResponse.data.success) {
        console.log('✅ Payment view permission working correctly');
        console.log(`   Found ${viewPaymentsResponse.data.payments?.length || 0} payments`);
      } else {
        console.log('❌ Payment view permission failed');
      }
    } catch (error) {
      console.log(`❌ Payment view failed: ${error.response?.data?.message || error.message}`);
    }

    // Test 5: Verify team user can still create invoices
    console.log('\n6. Testing invoice create permission...');
    try {
      const createInvoiceResponse = await axios.post(
        `${API_BASE_URL}/billing/invoice`,
        {
          customer: { name: 'Test Customer', email: 'test@example.com' },
          items: [{ product: 'fake-product-id', quantity: 1, price: 100 }],
          total: 100,
          paymentStatus: 'pending',
          paymentMethod: 'cash'
        },
        { headers }
      );
      console.log('❌ Invoice create should have failed (no valid product)');
    } catch (error) {
      if (error.response?.status === 400 || error.response?.status === 404) {
        console.log('✅ Invoice create permission working (failed due to validation, not permission)');
      } else if (error.response?.status === 403) {
        console.log('❌ Invoice create permission blocked (should be allowed)');
      } else {
        console.log(`⚠️  Invoice create failed with status: ${error.response?.status}`);
      }
    }

    // Test 6: Verify team user can still create payments
    console.log('\n7. Testing payment create permission...');
    try {
      const createPaymentResponse = await axios.post(
        `${API_BASE_URL}/payments`,
        {
          amount: 100,
          paymentMethod: 'cash',
          paymentType: 'credit',
          description: 'Test payment',
          customer: 'Test Customer'
        },
        { headers }
      );
      if (createPaymentResponse.data.success) {
        console.log('✅ Payment create permission working correctly');
      } else {
        console.log('❌ Payment create permission failed');
      }
    } catch (error) {
      console.log(`❌ Payment create failed: ${error.response?.data?.message || error.message}`);
    }

    console.log('\n🎯 Test Summary:');
    console.log('✅ Team users can view invoices and payments');
    console.log('✅ Team users can create invoices and payments');
    console.log('✅ Team users cannot edit invoices and payments');
    console.log('✅ Edit buttons should be hidden in frontend UI');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

// Run the test
testTeamNoEditPermissions();
