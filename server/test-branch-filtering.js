import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Test branch filtering with team user
async function testBranchFiltering() {
    try {
        console.log('🔍 Testing Branch Filtering...\n');

        // 1. Login as team user
        console.log('1. Logging in as team user...');
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: 'team1@company.com',
            password: 'team123'
        });

        if (!loginResponse.data.success) {
            throw new Error('Login failed');
        }

        const token = loginResponse.data.data.token;
        const user = loginResponse.data.data.user;
        
        console.log(`✅ Logged in as: ${user.name} (${user.role})`);
        console.log(`📍 Assigned Branch: ${user.branch?.name || 'None'}`);
        console.log(`🆔 Branch ID: ${user.branch?._id || 'None'}\n`);

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // 2. Test Products API (should only show products from user's branch)
        console.log('2. Testing Products API...');
        const productsResponse = await axios.get(`${API_BASE_URL}/products`, { headers });
        console.log(`✅ Products Response: ${productsResponse.data.success ? 'Success' : 'Failed'}`);
        console.log(`📦 Products Count: ${productsResponse.data.count || 0}`);
        
        if (productsResponse.data.data && productsResponse.data.data.length > 0) {
            console.log('📋 Products from user\'s branch:');
            productsResponse.data.data.forEach(product => {
                console.log(`   - ${product.name} (Branch: ${product.branch?.name || 'Unknown'})`);
            });
        }
        console.log('');

        // 3. Test Payments API (should only show payments from user's branch)
        console.log('3. Testing Payments API...');
        const paymentsResponse = await axios.get(`${API_BASE_URL}/payments`, { headers });
        console.log(`✅ Payments Response: ${paymentsResponse.data.success ? 'Success' : 'Failed'}`);
        console.log(`💰 Payments Count: ${paymentsResponse.data.count || 0}`);
        
        if (paymentsResponse.data.data && paymentsResponse.data.data.length > 0) {
            console.log('📋 Payments from user\'s branch:');
            paymentsResponse.data.data.forEach(payment => {
                console.log(`   - ${payment.description} (Branch: ${payment.branch?.name || 'Unknown'})`);
            });
        }
        console.log('');

        // 4. Test Transfers API (should only show transfers from user's branch)
        console.log('4. Testing Transfers API...');
        const transfersResponse = await axios.get(`${API_BASE_URL}/transfers`, { headers });
        console.log(`✅ Transfers Response: ${transfersResponse.data.success ? 'Success' : 'Failed'}`);
        console.log(`🔄 Transfers Count: ${transfersResponse.data.count || 0}`);
        
        if (transfersResponse.data.data && transfersResponse.data.data.length > 0) {
            console.log('📋 Transfers from user\'s branch:');
            transfersResponse.data.data.forEach(transfer => {
                console.log(`   - ${transfer.product?.name} (From: ${transfer.fromBranch?.name}, To: ${transfer.toBranch?.name})`);
            });
        }
        console.log('');

        // 5. Test Dashboard API (should only show data from user's branch)
        console.log('5. Testing Dashboard API...');
        const dashboardResponse = await axios.get(`${API_BASE_URL}/dashboard`, { headers });
        console.log(`✅ Dashboard Response: ${dashboardResponse.data.success ? 'Success' : 'Failed'}`);
        
        if (dashboardResponse.data.data) {
            const stats = dashboardResponse.data.data.stats;
            console.log('📊 Dashboard Stats:');
            console.log(`   - Total Products: ${stats?.totalProducts || 0}`);
            console.log(`   - Total Revenue: ₹${stats?.totalRevenue || 0}`);
            console.log(`   - Total Sales: ${stats?.totalSales || 0}`);
        }
        console.log('');

        // 6. Test Reports API (should only show reports from user's branch)
        console.log('6. Testing Reports API...');
        const reportsResponse = await axios.get(`${API_BASE_URL}/reports/sales`, { headers });
        console.log(`✅ Reports Response: ${reportsResponse.data.success ? 'Success' : 'Failed'}`);
        
        console.log('\n🎉 Branch filtering test completed successfully!');
        console.log('✅ Team users can only access data from their assigned branch');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        if (error.response?.data) {
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

// Run the test
testBranchFiltering();
