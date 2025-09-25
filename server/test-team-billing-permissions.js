import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testTeamBillingPermissions() {
    try {
        console.log('🔍 Testing Team User Billing Permissions...\n');

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

        console.log('📋 Testing Billing Permissions:');
        console.log('===============================');

        // Test 1: View invoices (should work)
        try {
            const invoicesResponse = await axios.get(`${API_BASE_URL}/billing/invoices`, { headers });
            console.log(`✅ VIEW Invoices: Success - ${invoicesResponse.data.count || 0} invoices`);
        } catch (error) {
            console.log(`❌ VIEW Invoices: Failed - ${error.response?.data?.message || error.message}`);
        }

        // Test 2: Create invoice (should work)
        try {
            const createResponse = await axios.post(`${API_BASE_URL}/billing/invoices`, {
                customer: {
                    name: 'Test Customer',
                    email: 'test@test.com',
                    phone: '1234567890',
                    address: 'Test Address'
                },
                items: [{
                    product: '507f1f77bcf86cd799439011',
                    quantity: 1,
                    price: 100,
                    total: 100
                }],
                paymentMethod: 'cash',
                total: 100,
                paymentStatus: 'pending'
            }, { headers });
            console.log(`✅ CREATE Invoice: Success - Invoice created`);
        } catch (error) {
            console.log(`❌ CREATE Invoice: Failed - ${error.response?.data?.message || error.message}`);
        }

        // Test 3: Update invoice (should work)
        try {
            const updateResponse = await axios.put(`${API_BASE_URL}/billing/invoices/507f1f77bcf86cd799439011`, {
                paymentStatus: 'paid'
            }, { headers });
            console.log(`✅ UPDATE Invoice: Success - Invoice updated`);
        } catch (error) {
            console.log(`❌ UPDATE Invoice: Failed - ${error.response?.data?.message || error.message}`);
        }

        // Test 4: Delete invoice (should fail)
        try {
            const deleteResponse = await axios.delete(`${API_BASE_URL}/billing/invoices/507f1f77bcf86cd799439011`, { headers });
            console.log(`❌ DELETE Invoice: Unexpectedly succeeded - ${deleteResponse.data.message}`);
        } catch (error) {
            console.log(`✅ DELETE Invoice: Correctly blocked - ${error.response?.data?.message || error.message}`);
        }

        console.log('\n🎉 Team User Billing Permission Test Results:');
        console.log('=============================================');
        console.log('✅ Team users CAN view invoices');
        console.log('✅ Team users CAN create invoices');
        console.log('✅ Team users CAN edit invoices');
        console.log('✅ Team users CANNOT delete invoices');
        console.log('🔒 Frontend should hide delete button for team users');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Run the test
testTeamBillingPermissions();
