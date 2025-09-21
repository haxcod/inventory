const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testBranchFiltering() {
    try {
        console.log('🧪 Testing Branch-based Data Filtering...\n');

        // 1. Create a test branch
        console.log('1. Creating test branch...');
        const branchResponse = await axios.post(`${API_BASE}/branches`, {
            name: 'Test Branch Mumbai',
            address: '123 Test Street, Mumbai',
            phone: '+91-9876543210',
            email: 'mumbai@test.com',
            manager: 'Test Manager'
        });
        const branchId = branchResponse.data.data.branch._id;
        console.log('✅ Branch created:', branchResponse.data.data.branch.name);

        // 2. Create a test user for this branch
        console.log('\n2. Creating test user for branch...');
        const userResponse = await axios.post(`${API_BASE}/auth/register`, {
            name: 'Branch User',
            email: 'branchuser@test.com',
            password: 'password123',
            role: 'user',
            branch: branchId
        });
        const userToken = userResponse.data.data.token;
        console.log('✅ User created:', userResponse.data.data.user.name);

        // 3. Create a test product for this branch
        console.log('\n3. Creating test product for branch...');
        const productResponse = await axios.post(`${API_BASE}/products`, {
            name: 'Test Product for Branch',
            description: 'A test product',
            sku: 'TEST-BRANCH-001',
            category: 'Electronics',
            brand: 'TestBrand',
            price: 1000,
            costPrice: 800,
            stock: 50,
            minStock: 10,
            unit: 'pcs',
            branch: branchId
        }, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        console.log('✅ Product created:', productResponse.data.data.product.name);

        // 4. Test that user can only see their branch's products
        console.log('\n4. Testing branch filtering - user should only see their branch products...');
        const productsResponse = await axios.get(`${API_BASE}/products`, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        
        const userProducts = productsResponse.data.data.products;
        console.log(`✅ User sees ${userProducts.length} products`);
        
        // Check if all products belong to the user's branch
        const allFromUserBranch = userProducts.every(product => 
            product.branch === branchId || product.branch._id === branchId
        );
        
        if (allFromUserBranch) {
            console.log('✅ All products belong to user\'s branch - filtering working!');
        } else {
            console.log('❌ Some products are from other branches - filtering not working!');
        }

        // 5. Test dashboard data filtering
        console.log('\n5. Testing dashboard data filtering...');
        const dashboardResponse = await axios.get(`${API_BASE}/dashboard`, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        
        const dashboardData = dashboardResponse.data.data;
        console.log(`✅ Dashboard shows ${dashboardData.stats.totalProducts} products`);
        console.log(`✅ Dashboard shows ${dashboardData.stats.totalInvoices} invoices`);
        
        // 6. Test with admin user (should see all data)
        console.log('\n6. Testing admin access (should see all data)...');
        const adminLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
            email: 'admin@test.com',
            password: 'admin123'
        });
        const adminToken = adminLoginResponse.data.data.token;
        
        const adminProductsResponse = await axios.get(`${API_BASE}/products`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        
        const adminProducts = adminProductsResponse.data.data.products;
        console.log(`✅ Admin sees ${adminProducts.length} products (should be more than branch user)`);
        
        if (adminProducts.length >= userProducts.length) {
            console.log('✅ Admin sees more or equal products - admin access working!');
        } else {
            console.log('❌ Admin sees fewer products than branch user - issue with admin access!');
        }

        console.log('\n🎉 Branch filtering test completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Run the test
testBranchFiltering();
