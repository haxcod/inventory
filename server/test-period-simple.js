import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testPeriodFilteringSimple() {
  console.log('🔍 Testing Period Filtering (Simple Test)...\n');

  try {
    // Test login
    console.log('1. Testing login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@company.com',
      password: 'admin123'
    });

    console.log('Login response:', loginResponse.data);

    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }

    const token = loginResponse.data.data.token;
    console.log('Token received:', token ? 'Yes' : 'No');
    console.log('Token value:', token);

    const headers = { Authorization: `Bearer ${token}` };

    // Test sales report without period (should work)
    console.log('\n2. Testing sales report without period...');
    try {
      const response = await axios.get(`${API_BASE_URL}/reports/sales`, { headers });
      console.log('Response status:', response.status);
      console.log('Response success:', response.data.success);
      
      if (response.data.success) {
        const chartData = response.data.data.chartData;
        console.log(`📊 Data points: ${chartData?.length || 0}`);
        
        if (chartData && chartData.length > 0) {
          console.log('First data point:', chartData[0]);
        }
      }
    } catch (error) {
      console.log('Error:', error.response?.status, error.response?.data?.message || error.message);
    }

    // Test sales report with period
    console.log('\n3. Testing sales report with period=weekly...');
    try {
      const response = await axios.get(`${API_BASE_URL}/reports/sales`, { 
        headers,
        params: { period: 'weekly' }
      });
      console.log('Response status:', response.status);
      console.log('Response success:', response.data.success);
      
      if (response.data.success) {
        const chartData = response.data.data.chartData;
        console.log(`📊 Weekly data points: ${chartData?.length || 0}`);
        
        if (chartData && chartData.length > 0) {
          console.log('First weekly data point:', chartData[0]);
        }
      }
    } catch (error) {
      console.log('Error:', error.response?.status, error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

// Run the test
testPeriodFilteringSimple();
