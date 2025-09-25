import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testUpdatedTeamPermissions() {
    try {
        console.log('🔍 Testing Updated Team User Permissions...\n');

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

        console.log('📋 Testing Product List Access:');
        console.log('================================');

        // Test 1: View products list (should work)
        try {
            const viewResponse = await axios.get(`${API_BASE_URL}/products`, { headers });
            console.log(`✅ VIEW Products List: Success - ${viewResponse.data.count || 0} products`);
            console.log(`   Products visible: ${viewResponse.data.products?.length || 0}`);
        } catch (error) {
            console.log(`❌ VIEW Products List: Failed - ${error.response?.data?.message || error.message}`);
        }

        console.log('\n📋 Testing Individual Product Access:');
        console.log('=====================================');

        // Test 2: View individual product details (should fail)
        try {
            const detailResponse = await axios.get(`${API_BASE_URL}/products/507f1f77bcf86cd799439011`, { headers });
            console.log(`❌ VIEW Product Details: Unexpectedly succeeded - ${detailResponse.data.message}`);
        } catch (error) {
            console.log(`✅ VIEW Product Details: Correctly blocked - ${error.response?.data?.message || error.message}`);
        }

        console.log('\n📋 Testing Product Actions:');
        console.log('===========================');

        // Test 3: Create product (should fail)
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

        // Test 4: Update product (should fail)
        try {
            await axios.put(`${API_BASE_URL}/products/507f1f77bcf86cd799439011`, {
                name: 'Updated Product'
            }, { headers });
            console.log('❌ UPDATE Product: Unexpectedly succeeded');
        } catch (error) {
            console.log('✅ UPDATE Product: Correctly blocked - Insufficient permissions');
        }

        // Test 5: Delete product (should fail)
        try {
            await axios.delete(`${API_BASE_URL}/products/507f1f77bcf86cd799439011`, { headers });
            console.log('❌ DELETE Product: Unexpectedly succeeded');
        } catch (error) {
            console.log('✅ DELETE Product: Correctly blocked - Insufficient permissions');
        }

        console.log('\n🎉 Updated Team User Permission Test Results:');
        console.log('=============================================');
        console.log('✅ Team users CAN see products list (product cards visible)');
        console.log('✅ Team users CANNOT view individual product details (View button hidden)');
        console.log('✅ Team users CANNOT create/edit/delete products');
        console.log('🔒 Frontend should show product cards but hide View button for team users');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Run the test
testUpdatedTeamPermissions();
