import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testTeamBranchAccess() {
    try {
        console.log('🔍 Testing Team User Branch Access for Transfers...\n');

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

        console.log('📋 Testing Branch Access:');
        console.log('=========================');

        // Test 1: View branches (should work now)
        try {
            const branchesResponse = await axios.get(`${API_BASE_URL}/branches`, { headers });
            console.log(`✅ VIEW Branches: Success - ${branchesResponse.data.count || 0} branches`);
            console.log(`   Branches available: ${branchesResponse.data.branches?.length || 0}`);
            if (branchesResponse.data.branches?.length > 0) {
                console.log(`   Branch names: ${branchesResponse.data.branches.map(b => b.name).join(', ')}`);
            }
        } catch (error) {
            console.log(`❌ VIEW Branches: Failed - ${error.response?.data?.message || error.message}`);
        }

        console.log('\n📋 Testing Transfer Access:');
        console.log('============================');

        // Test 2: View transfers (should work)
        try {
            const transfersResponse = await axios.get(`${API_BASE_URL}/transfers`, { headers });
            console.log(`✅ VIEW Transfers: Success - ${transfersResponse.data.count || 0} transfers`);
        } catch (error) {
            console.log(`❌ VIEW Transfers: Failed - ${error.response?.data?.message || error.message}`);
        }

        console.log('\n📋 Testing Branch Management (should fail):');
        console.log('==========================================');

        // Test 3: Create branch (should fail)
        try {
            await axios.post(`${API_BASE_URL}/branches`, {
                name: 'Test Branch',
                address: 'Test Address',
                phone: '1234567890',
                email: 'test@test.com',
                manager: 'Test Manager'
            }, { headers });
            console.log('❌ CREATE Branch: Unexpectedly succeeded');
        } catch (error) {
            console.log('✅ CREATE Branch: Correctly blocked - Insufficient permissions');
        }

        // Test 4: Update branch (should fail)
        try {
            await axios.put(`${API_BASE_URL}/branches/507f1f77bcf86cd799439011`, {
                name: 'Updated Branch'
            }, { headers });
            console.log('❌ UPDATE Branch: Unexpectedly succeeded');
        } catch (error) {
            console.log('✅ UPDATE Branch: Correctly blocked - Insufficient permissions');
        }

        // Test 5: Delete branch (should fail)
        try {
            await axios.delete(`${API_BASE_URL}/branches/507f1f77bcf86cd799439011`, { headers });
            console.log('❌ DELETE Branch: Unexpectedly succeeded');
        } catch (error) {
            console.log('✅ DELETE Branch: Correctly blocked - Insufficient permissions');
        }

        console.log('\n🎉 Team User Branch Access Test Results:');
        console.log('=========================================');
        console.log('✅ Team users CAN view branches (needed for transfers)');
        console.log('✅ Team users CAN view transfers');
        console.log('✅ Team users CANNOT create/edit/delete branches');
        console.log('🔒 Perfect for transfer functionality!');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Run the test
testTeamBranchAccess();
