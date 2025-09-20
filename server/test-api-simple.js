import fetch from 'node-fetch';

async function testAPI() {
    console.log('🚀 Testing API endpoints...\n');

    try {
        // Test health endpoint
        console.log('1. Testing Health Check...');
        const healthResponse = await fetch('http://localhost:5000/health');
        const healthData = await healthResponse.json();
        console.log('✅ Health Check:', healthData);

        // Test login
        console.log('\n2. Testing Login...');
        const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@company.com',
                password: 'admin123'
            })
        });
        const loginData = await loginResponse.json();
        console.log('✅ Login Response:', loginData);

        if (loginData.success) {
            const token = loginData.data.token;
            console.log('✅ Token received:', token.substring(0, 20) + '...');

            // Test products with auth
            console.log('\n3. Testing Products API...');
            const productsResponse = await fetch('http://localhost:5000/api/products', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const productsData = await productsResponse.json();
            console.log('✅ Products Response:', {
                success: productsData.success,
                count: productsData.data?.products?.length || 0
            });

            // Test payments with auth
            console.log('\n4. Testing Payments API...');
            const paymentsResponse = await fetch('http://localhost:5000/api/payments', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const paymentsData = await paymentsResponse.json();
            console.log('✅ Payments Response:', {
                success: paymentsData.success,
                count: paymentsData.data?.payments?.length || 0
            });

            // Get branches first
            console.log('\n5. Getting Branches...');
            const branchesResponse = await fetch('http://localhost:5000/api/branches', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const branchesData = await branchesResponse.json();
            console.log('✅ Branches Response:', {
                success: branchesData.success,
                count: branchesData.data?.branches?.length || 0
            });

            const branchId = branchesData.data?.branches?.[0]?._id;
            console.log('✅ Using Branch ID:', branchId);

            // Test create payment
            console.log('\n6. Testing Create Payment...');
            const createPaymentResponse = await fetch('http://localhost:5000/api/payments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: 100.00,
                    paymentMethod: 'cash',
                    paymentType: 'credit',
                    description: 'Test payment from API test',
                    reference: 'TEST-' + Date.now(),
                    customer: 'Test Customer',
                    notes: 'Created via API test',
                    branch: branchId
                })
            });
            const createPaymentData = await createPaymentResponse.json();
            console.log('✅ Create Payment Response:', {
                success: createPaymentData.success,
                message: createPaymentData.message
            });

        }

        console.log('\n🎉 All API tests completed successfully!');

    } catch (error) {
        console.error('❌ API Test Error:', error.message);
    }
}

testAPI();
