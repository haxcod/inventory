// Simple test script to verify transfer API functionality
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testTransferAPI() {
    try {
        console.log('🧪 Testing Transfer API...\n');

        // Step 1: Login to get auth token
        console.log('1. Logging in...');
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
            email: 'admin@example.com',
            password: 'admin123'
        });

        if (!loginResponse.data.success) {
            throw new Error('Login failed: ' + loginResponse.data.message);
        }

        const token = loginResponse.data.data.token;
        console.log('✅ Login successful\n');

        // Step 2: Get branches
        console.log('2. Getting branches...');
        const branchesResponse = await axios.get(`${API_BASE}/branches`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!branchesResponse.data.success) {
            throw new Error('Failed to get branches: ' + branchesResponse.data.message);
        }

        const branches = branchesResponse.data.data.branches;
        console.log(`✅ Found ${branches.length} branches\n`);

        // Step 3: Get products
        console.log('3. Getting products...');
        const productsResponse = await axios.get(`${API_BASE}/products`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!productsResponse.data.success) {
            throw new Error('Failed to get products: ' + productsResponse.data.message);
        }

        const products = productsResponse.data.data.products;
        console.log(`✅ Found ${products.length} products\n`);

        // Step 4: Test transfer endpoint (without actually creating a transfer)
        console.log('4. Testing transfer endpoint...');
        const transfersResponse = await axios.get(`${API_BASE}/transfers`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!transfersResponse.data.success) {
            throw new Error('Failed to get transfers: ' + transfersResponse.data.message);
        }

        console.log('✅ Transfer endpoint is working\n');

        // Step 5: Test transfer creation (if we have products and branches)
        if (products.length > 0 && branches.length > 1) {
            console.log('5. Testing transfer creation...');
            
            const product = products[0];
            const fromBranch = product.branch;
            const toBranch = branches.find(b => b._id !== fromBranch);

            if (toBranch && product.stock > 0) {
                const transferData = {
                    productId: product._id,
                    fromBranch: fromBranch,
                    toBranch: toBranch._id,
                    quantity: 1,
                    reason: 'test',
                    notes: 'API test transfer'
                };

                const createResponse = await axios.post(`${API_BASE}/transfers`, transferData, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (createResponse.data.success) {
                    console.log('✅ Transfer creation successful');
                    console.log('Transfer ID:', createResponse.data.data.transfer._id);
                } else {
                    console.log('❌ Transfer creation failed:', createResponse.data.message);
                }
            } else {
                console.log('⚠️  Cannot test transfer creation - need products with stock and multiple branches');
            }
        } else {
            console.log('⚠️  Cannot test transfer creation - need products and multiple branches');
        }

        console.log('\n🎉 Transfer API test completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data?.message || error.message);
        if (error.response?.data?.stack) {
            console.error('Stack trace:', error.response.data.stack);
        }
    }
}

// Run the test
testTransferAPI();
