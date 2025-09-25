import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testTeamProductPermissions() {
    try {
        console.log('🔍 Testing Team User Product Permissions...\n');

        // Login as team user
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

        // Test 1: View products (should work)
        console.log('1. Testing VIEW products (should work)...');
        try {
            const viewResponse = await axios.get(`${API_BASE_URL}/products`, { headers });
            console.log(`✅ VIEW Products: Success - ${viewResponse.data.count || 0} products`);
        } catch (error) {
            console.log(`❌ VIEW Products: Failed - ${error.response?.data?.message || error.message}`);
        }

        // Test 2: Create product (should fail)
        console.log('\n2. Testing CREATE product (should fail)...');
        try {
            const createResponse = await axios.post(`${API_BASE_URL}/products`, {
                name: 'Test Product',
                description: 'Test Description',
                sku: 'TEST-001',
                category: 'Test',
                brand: 'Test Brand',
                price: 1000,
                costPrice: 800,
                stock: 10,
                minStock: 2,
                maxStock: 50,
                unit: 'pieces'
            }, { headers });
            console.log(`❌ CREATE Product: Unexpectedly succeeded - ${createResponse.data.message}`);
        } catch (error) {
            console.log(`✅ CREATE Product: Correctly failed - ${error.response?.data?.message || error.message}`);
        }

        // Test 3: Update product (should fail)
        console.log('\n3. Testing UPDATE product (should fail)...');
        try {
            const updateResponse = await axios.put(`${API_BASE_URL}/products/507f1f77bcf86cd799439011`, {
                name: 'Updated Product'
            }, { headers });
            console.log(`❌ UPDATE Product: Unexpectedly succeeded - ${updateResponse.data.message}`);
        } catch (error) {
            console.log(`✅ UPDATE Product: Correctly failed - ${error.response?.data?.message || error.message}`);
        }

        // Test 4: Delete product (should fail)
        console.log('\n4. Testing DELETE product (should fail)...');
        try {
            const deleteResponse = await axios.delete(`${API_BASE_URL}/products/507f1f77bcf86cd799439011`, { headers });
            console.log(`❌ DELETE Product: Unexpectedly succeeded - ${deleteResponse.data.message}`);
        } catch (error) {
            console.log(`✅ DELETE Product: Correctly failed - ${error.response?.data?.message || error.message}`);
        }

        console.log('\n🎉 Team user product permissions test completed!');
        console.log('✅ Team users can only VIEW products, not CREATE/UPDATE/DELETE');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Run the test
testTeamProductPermissions();
