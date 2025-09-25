import axios from 'axios';

async function testMonthlyPeriodFix() {
  console.log('🔍 Testing Monthly Period Fix...\n');

  try {
    // Test login
    console.log('1. Testing login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@company.com',
      password: 'admin123'
    });

    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }

    const token = loginResponse.data.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    console.log('✅ Login successful\n');

    // Test monthly period specifically
    console.log('2. Testing MONTHLY period with continuous line fix...');
    try {
      const response = await axios.get('http://localhost:5000/api/reports/sales', { 
        headers,
        params: { period: 'monthly' }
      });
      
      if (response.data.success) {
        console.log(`✅ Monthly period working`);
        const chartData = response.data.data.chartData;
        console.log(`📊 Monthly data points: ${chartData?.length || 0}`);
        
        if (chartData && chartData.length > 0) {
          console.log('\n📋 All monthly data points:');
          chartData.forEach((point, index) => {
            console.log(`  ${index + 1}. Date: ${point.date}, Revenue: ${point.revenue}, Count: ${point.count}`);
          });
          
          // Check if we have at least 2 points for continuous line
          if (chartData.length >= 2) {
            console.log('\n✅ Continuous line: Multiple data points available');
            console.log(`✅ First point: ${chartData[0].date} (Revenue: ${chartData[0].revenue})`);
            console.log(`✅ Last point: ${chartData[chartData.length - 1].date} (Revenue: ${chartData[chartData.length - 1].revenue})`);
          } else {
            console.log('\n❌ Issue: Only one data point - no continuous line possible');
          }
        }
      } else {
        console.log(`❌ Monthly period failed:`, response.data.message);
      }
    } catch (error) {
      console.log(`❌ Monthly period error:`, error.response?.data?.message || error.message);
    }

    console.log('\n🎯 Monthly Period Fix Test Complete!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

// Run the test
testMonthlyPeriodFix();
