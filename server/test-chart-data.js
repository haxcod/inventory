import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testChartData() {
  console.log('🧪 Testing Chart Data Structure...\n');

  try {
    // Login as admin to get full access
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

    // Test 1: Sales Report Data
    console.log('2. Testing Sales Report Data...');
    try {
      const salesResponse = await axios.get(`${API_BASE_URL}/reports/sales`, { headers });
      if (salesResponse.data.success) {
        console.log('✅ Sales report data received');
        console.log('📊 Chart Data:', JSON.stringify(salesResponse.data.data.chartData, null, 2));
        console.log('📈 Data Points Count:', salesResponse.data.data.chartData?.length || 0);
        
        // Check for data consistency
        if (salesResponse.data.data.chartData?.length > 0) {
          const sampleData = salesResponse.data.data.chartData[0];
          console.log('🔍 Sample Data Structure:', Object.keys(sampleData));
          console.log('📅 Sample Date:', sampleData.date);
          console.log('💰 Sample Revenue:', sampleData.revenue);
        }
      } else {
        console.log('❌ Sales report failed');
      }
    } catch (error) {
      console.log(`❌ Sales report error: ${error.response?.data?.message || error.message}`);
    }

    // Test 2: Revenue Report Data
    console.log('\n3. Testing Revenue Report Data...');
    try {
      const revenueResponse = await axios.get(`${API_BASE_URL}/reports/revenue`, { headers });
      if (revenueResponse.data.success) {
        console.log('✅ Revenue report data received');
        console.log('📊 Chart Data:', JSON.stringify(revenueResponse.data.data.chartData, null, 2));
        console.log('📈 Data Points Count:', revenueResponse.data.data.chartData?.length || 0);
      } else {
        console.log('❌ Revenue report failed');
      }
    } catch (error) {
      console.log(`❌ Revenue report error: ${error.response?.data?.message || error.message}`);
    }

    // Test 3: Profit & Loss Report Data
    console.log('\n4. Testing Profit & Loss Report Data...');
    try {
      const profitLossResponse = await axios.get(`${API_BASE_URL}/reports/profit-loss`, { headers });
      if (profitLossResponse.data.success) {
        console.log('✅ Profit & Loss report data received');
        console.log('📊 Chart Data:', JSON.stringify(profitLossResponse.data.data.chartData, null, 2));
        console.log('📈 Data Points Count:', profitLossResponse.data.data.chartData?.length || 0);
        
        // Check for data consistency
        if (profitLossResponse.data.data.chartData?.length > 0) {
          const sampleData = profitLossResponse.data.data.chartData[0];
          console.log('🔍 Sample Data Structure:', Object.keys(sampleData));
          console.log('📅 Sample Month:', sampleData.month);
          console.log('💰 Sample Revenue:', sampleData.revenue);
          console.log('💸 Sample Expenses:', sampleData.expenses);
          console.log('📈 Sample Profit:', sampleData.profit);
        }
      } else {
        console.log('❌ Profit & Loss report failed');
      }
    } catch (error) {
      console.log(`❌ Profit & Loss report error: ${error.response?.data?.message || error.message}`);
    }

    // Test 4: Dashboard Data
    console.log('\n5. Testing Dashboard Data...');
    try {
      const dashboardResponse = await axios.get(`${API_BASE_URL}/dashboard`, { headers });
      if (dashboardResponse.data.success) {
        console.log('✅ Dashboard data received');
        console.log('📊 Sales Data:', JSON.stringify(dashboardResponse.data.data.salesData, null, 2));
        console.log('📈 Sales Data Points Count:', dashboardResponse.data.data.salesData?.length || 0);
        
        // Check for data consistency
        if (dashboardResponse.data.data.salesData?.length > 0) {
          const sampleData = dashboardResponse.data.data.salesData[0];
          console.log('🔍 Sample Sales Data Structure:', Object.keys(sampleData));
          console.log('📅 Sample Name:', sampleData.name);
          console.log('💰 Sample Sales:', sampleData.sales);
        }
      } else {
        console.log('❌ Dashboard data failed');
      }
    } catch (error) {
      console.log(`❌ Dashboard data error: ${error.response?.data?.message || error.message}`);
    }

    console.log('\n🎯 Data Analysis Summary:');
    console.log('✅ Check if data points are properly formatted');
    console.log('✅ Check if dates are consistent');
    console.log('✅ Check if values are numeric');
    console.log('✅ Check if there are gaps in data');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

// Run the test
testChartData();
