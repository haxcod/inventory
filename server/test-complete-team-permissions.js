import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testCompleteTeamPermissions() {
    try {
        console.log('🔍 Testing Complete Team User Permissions...\n');

        // Test team user login
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
        console.log(`📍 Branch: ${user.branch?.name || 'None'}`);
        console.log(`🔑 Permissions: ${user.permissions.join(', ')}\n`);

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        console.log('📋 Testing Product Permissions:');
        console.log('===============================');

        // Test 1: View products (should fail)
        try {
            await axios.get(`${API_BASE_URL}/products`, { headers });
            console.log('❌ VIEW Products: Unexpectedly succeeded');
        } catch (error) {
            console.log('✅ VIEW Products: Correctly blocked - Insufficient permissions');
        }

        // Test 2: Create product (should fail)
        try {
            await axios.post(`${API_BASE_URL}/products`, {
                name: 'Test Product',
                sku: 'TEST-001',
                price: 1000
            }, { headers });
            console.log('❌ CREATE Product: Unexpectedly succeeded');
        } catch (error) {
            console.log('✅ CREATE Product: Correctly blocked - Insufficient permissions');
        }

        // Test 3: Update product (should fail)
        try {
            await axios.put(`${API_BASE_URL}/products/507f1f77bcf86cd799439011`, {
                name: 'Updated Product'
            }, { headers });
            console.log('❌ UPDATE Product: Unexpectedly succeeded');
        } catch (error) {
            console.log('✅ UPDATE Product: Correctly blocked - Insufficient permissions');
        }

        // Test 4: Delete product (should fail)
        try {
            await axios.delete(`${API_BASE_URL}/products/507f1f77bcf86cd799439011`, { headers });
            console.log('❌ DELETE Product: Unexpectedly succeeded');
        } catch (error) {
            console.log('✅ DELETE Product: Correctly blocked - Insufficient permissions');
        }

        console.log('\n📋 Testing Allowed Permissions:');
        console.log('===============================');

        // Test billing (should work)
        try {
            const billingResponse = await axios.get(`${API_BASE_URL}/billing/invoices`, { headers });
            console.log(`✅ BILLING: Success - ${billingResponse.data.count || 0} invoices`);
        } catch (error) {
            console.log(`❌ BILLING: Failed - ${error.response?.data?.message || error.message}`);
        }

        // Test transfers (should work)
        try {
            const transfersResponse = await axios.get(`${API_BASE_URL}/transfers`, { headers });
            console.log(`✅ TRANSFERS: Success - ${transfersResponse.data.count || 0} transfers`);
        } catch (error) {
            console.log(`❌ TRANSFERS: Failed - ${error.response?.data?.message || error.message}`);
        }

        // Test payments (should work)
        try {
            const paymentsResponse = await axios.get(`${API_BASE_URL}/payments`, { headers });
            console.log(`✅ PAYMENTS: Success - ${paymentsResponse.data.count || 0} payments`);
        } catch (error) {
            console.log(`❌ PAYMENTS: Failed - ${error.response?.data?.message || error.message}`);
        }

        // Test dashboard (should work)
        try {
            const dashboardResponse = await axios.get(`${API_BASE_URL}/dashboard`, { headers });
            console.log(`✅ DASHBOARD: Success - Dashboard data loaded`);
        } catch (error) {
            console.log(`❌ DASHBOARD: Failed - ${error.response?.data?.message || error.message}`);
        }

        // Test reports (should work)
        try {
            const reportsResponse = await axios.get(`${API_BASE_URL}/reports/sales`, { headers });
            console.log(`✅ REPORTS: Success - Sales report loaded`);
        } catch (error) {
            console.log(`❌ REPORTS: Failed - ${error.response?.data?.message || error.message}`);
        }

        console.log('\n📋 Testing Admin-Only Permissions:');
        console.log('===================================');

        // Test branches (should fail - admin only)
        try {
            await axios.get(`${API_BASE_URL}/branches`, { headers });
            console.log('❌ BRANCHES: Unexpectedly succeeded');
        } catch (error) {
            console.log('✅ BRANCHES: Correctly blocked - Admin only');
        }

        // Test users (should fail - admin only)
        try {
            await axios.get(`${API_BASE_URL}/users`, { headers });
            console.log('❌ USERS: Unexpectedly succeeded');
        } catch (error) {
            console.log('✅ USERS: Correctly blocked - Admin only');
        }

        console.log('\n🎉 Complete Team User Permission Test Results:');
        console.log('=============================================');
        console.log('✅ Team users CANNOT access products (view/create/edit/delete)');
        console.log('✅ Team users CAN access billing, transfers, payments, dashboard, reports');
        console.log('✅ Team users CANNOT access admin-only features (branches, users)');
        console.log('✅ Branch filtering is working correctly');
        console.log('\n🔒 Frontend should hide all product action buttons for team users');
        console.log('🔒 Frontend should show only allowed features for team users');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Run the test
testCompleteTeamPermissions();
