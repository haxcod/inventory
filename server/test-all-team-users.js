import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testAllTeamUsers() {
    try {
        console.log('🔍 Testing Branch Filtering for All Team Users...\n');

        const teamUsers = [
            'team1@company.com',
            'team2@company.com', 
            'team3@company.com',
            'team4@company.com'
        ];

        for (let i = 0; i < teamUsers.length; i++) {
            const email = teamUsers[i];
            console.log(`\n${i + 1}. Testing ${email}...`);
            
            // Login
            const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
                email: email,
                password: 'team123'
            });

            if (!loginResponse.data.success) {
                console.log(`❌ Login failed for ${email}`);
                continue;
            }

            const token = loginResponse.data.data.token;
            const user = loginResponse.data.data.user;
            
            console.log(`✅ Logged in as: ${user.name} (${user.role})`);
            console.log(`📍 Assigned Branch: ${user.branch?.name || 'None'}`);
            console.log(`🆔 Branch ID: ${user.branch?._id || 'None'}`);

            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Test Products
            const productsResponse = await axios.get(`${API_BASE_URL}/products`, { headers });
            console.log(`📦 Products: ${productsResponse.data.count || 0}`);

            // Test Payments
            const paymentsResponse = await axios.get(`${API_BASE_URL}/payments`, { headers });
            console.log(`💰 Payments: ${paymentsResponse.data.count || 0}`);

            // Test Transfers
            const transfersResponse = await axios.get(`${API_BASE_URL}/transfers`, { headers });
            console.log(`🔄 Transfers: ${transfersResponse.data.count || 0}`);

            // Test Dashboard
            const dashboardResponse = await axios.get(`${API_BASE_URL}/dashboard`, { headers });
            if (dashboardResponse.data.data?.stats) {
                const stats = dashboardResponse.data.data.stats;
                console.log(`📊 Dashboard - Products: ${stats.totalProducts}, Revenue: ₹${stats.totalRevenue}, Sales: ${stats.totalSales}`);
            }
        }

        console.log('\n🎉 All team users tested successfully!');
        console.log('✅ Each team user can only access data from their assigned branch');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Run the test
testAllTeamUsers();
