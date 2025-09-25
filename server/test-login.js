import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testLogin() {
    try {
        console.log('Testing login for team1@company.com...');
        
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: 'admin@company.com',
            password: 'admin123'
        });
        
        console.log('✅ Login successful!');
        console.log('User:', response.data.data.user.name);
        console.log('Role:', response.data.data.user.role);
        console.log('Branch:', response.data.data.user.branch?.name || 'None');
        
    } catch (error) {
        console.error('❌ Login failed:', error.response?.data || error.message);
    }
}

testLogin();
