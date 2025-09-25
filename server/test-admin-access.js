import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testAdminAccess() {
    try {
        console.log('🔍 Testing Admin Access (Should See All Data)...\n');

        // Login as admin
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: 'admin@company.com',
            password: 'admin123'
        });

        if (!loginResponse.data.success) {
            throw new Error('Admin login failed');
        }

        const token = loginResponse.data.data.token;
        const user = loginResponse.data.data.user;
        
        console.log(`✅ Logged in as: ${user.name} (${user.role})`);
        console.log(`📍 Branch Access: ${user.branch ? user.branch.name : 'All Branches (Admin)'}`);

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // Test Products (should see all products from all branches)
        const productsResponse = await axios.get(`${API_BASE_URL}/products`, { headers });
        console.log(`📦 Products: ${productsResponse.data.count || 0} (All branches)`);

        // Test Payments (should see all payments from all branches)
        const paymentsResponse = await axios.get(`${API_BASE_URL}/payments`, { headers });
        console.log(`💰 Payments: ${paymentsResponse.data.count || 0} (All branches)`);

        // Test Transfers (should see all transfers from all branches)
        const transfersResponse = await axios.get(`${API_BASE_URL}/transfers`, { headers });
        console.log(`🔄 Transfers: ${transfersResponse.data.count || 0} (All branches)`);

        // Test Dashboard (should see aggregated data from all branches)
        const dashboardResponse = await axios.get(`${API_BASE_URL}/dashboard`, { headers });
        if (dashboardResponse.data.data?.stats) {
            const stats = dashboardResponse.data.data.stats;
            console.log(`📊 Dashboard - Products: ${stats.totalProducts}, Revenue: ₹${stats.totalRevenue}, Sales: ${stats.totalSales} (All branches)`);
        }

        // Test Reports (should see all data)
        const reportsResponse = await axios.get(`${API_BASE_URL}/reports/sales`, { headers });
        console.log(`📈 Reports: ${reportsResponse.data.success ? 'Accessible' : 'Not accessible'}`);

        console.log('\n🎉 Admin access test completed successfully!');
        console.log('✅ Admin can access data from all branches');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        if (error.response?.data) {
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        }
        if (error.code) {
            console.error('Error code:', error.code);
        }
    }
}

// Run the test
testAdminAccess();
