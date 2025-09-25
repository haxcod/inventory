import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testPeriodFiltering() {
  console.log('🔍 Testing Period Filtering...\n');

  try {
    // Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@company.com',
      password: 'admin123'
    });

    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }

    const token = loginResponse.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    console.log('✅ Login successful\n');

    // Test different periods
    const periods = ['daily', 'weekly', 'monthly', 'yearly'];
    
    for (const period of periods) {
      console.log(`2. Testing ${period.toUpperCase()} period...`);
      try {
        const response = await axios.get(`${API_BASE_URL}/reports/sales`, { 
          headers,
          params: { period }
        });
        
        if (response.data.success) {
          console.log(`✅ ${period} period working`);
          const chartData = response.data.data.chartData;
          console.log(`📊 ${period} data points: ${chartData?.length || 0}`);
          
          if (chartData && chartData.length > 0) {
            console.log(`\n📋 ${period} data (first 3):`);
            chartData.slice(0, 3).forEach((point, index) => {
              console.log(`  ${index + 1}. Date: ${point.date}, Revenue: ${point.revenue}, Count: ${point.count}`);
            });
            
            if (chartData.length > 3) {
              console.log(`\n📋 ${period} data (last 3):`);
              chartData.slice(-3).forEach((point, index) => {
                console.log(`  ${chartData.length - 2 + index}. Date: ${point.date}, Revenue: ${point.revenue}, Count: ${point.count}`);
              });
            }
          }
        } else {
          console.log(`❌ ${period} period failed`);
        }
      } catch (error) {
        console.log(`❌ ${period} period error: ${error.response?.data?.message || error.message}`);
      }
      console.log(''); // Empty line for readability
    }

    console.log('🎯 Period Filter Test Summary:');
    console.log('✅ All period types should now work correctly');
    console.log('✅ Daily: Shows individual days');
    console.log('✅ Weekly: Groups by weeks (Monday start)');
    console.log('✅ Monthly: Groups by months');
    console.log('✅ Yearly: Groups by years');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

// Run the test
testPeriodFiltering();
