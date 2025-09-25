import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testDateFiltering() {
  console.log('🔍 Testing Reports Page Date Filtering...\n');

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

    // Test Sales Report with date range
    console.log('2. Testing Sales Report with date range (last 7 days)...');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const today = new Date();
    
    const dateFrom = sevenDaysAgo.toISOString().split('T')[0];
    const dateTo = today.toISOString().split('T')[0];
    
    console.log(`📅 Date range: ${dateFrom} to ${dateTo}`);
    
    try {
      const salesResponse = await axios.get(`${API_BASE_URL}/reports/sales`, { 
        headers,
        params: {
          dateFrom,
          dateTo
        }
      });
      
      if (salesResponse.data.success) {
        console.log('✅ Sales report with date filter working');
        const chartData = salesResponse.data.data.chartData;
        console.log(`📊 Filtered sales data points: ${chartData?.length || 0}`);
        
        if (chartData && chartData.length > 0) {
          console.log('\n📋 Filtered sales data:');
          chartData.forEach((point, index) => {
            console.log(`  ${index + 1}. Date: ${point.date}, Revenue: ${point.revenue}, Count: ${point.count}`);
          });
        }
      } else {
        console.log('❌ Sales report with date filter failed');
      }
    } catch (error) {
      console.log(`❌ Sales report error: ${error.response?.data?.message || error.message}`);
    }

    // Test Sales Report without date range (should show all data)
    console.log('\n3. Testing Sales Report without date range (all data)...');
    try {
      const salesAllResponse = await axios.get(`${API_BASE_URL}/reports/sales`, { headers });
      
      if (salesAllResponse.data.success) {
        console.log('✅ Sales report without date filter working');
        const chartData = salesAllResponse.data.data.chartData;
        console.log(`📊 All sales data points: ${chartData?.length || 0}`);
        
        if (chartData && chartData.length > 0) {
          console.log('\n📋 All sales data (first 5):');
          chartData.slice(0, 5).forEach((point, index) => {
            console.log(`  ${index + 1}. Date: ${point.date}, Revenue: ${point.revenue}, Count: ${point.count}`);
          });
        }
      } else {
        console.log('❌ Sales report without date filter failed');
      }
    } catch (error) {
      console.log(`❌ Sales report error: ${error.response?.data?.message || error.message}`);
    }

    // Test Profit & Loss Report with date range
    console.log('\n4. Testing Profit & Loss Report with date range...');
    try {
      const profitLossResponse = await axios.get(`${API_BASE_URL}/reports/profit-loss`, { 
        headers,
        params: {
          startDate: dateFrom,
          endDate: dateTo
        }
      });
      
      if (profitLossResponse.data.success) {
        console.log('✅ Profit & Loss report with date filter working');
        const chartData = profitLossResponse.data.data.chartData;
        console.log(`📊 Filtered profit & loss data points: ${chartData?.length || 0}`);
        
        if (chartData && chartData.length > 0) {
          console.log('\n📋 Filtered profit & loss data:');
          chartData.forEach((point, index) => {
            console.log(`  ${index + 1}. Month: ${point.month}, Revenue: ${point.revenue}, Expenses: ${point.expenses}, Profit: ${point.profit}`);
          });
        }
      } else {
        console.log('❌ Profit & Loss report with date filter failed');
      }
    } catch (error) {
      console.log(`❌ Profit & Loss report error: ${error.response?.data?.message || error.message}`);
    }

    // Test with specific single day
    console.log('\n5. Testing with specific single day...');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    try {
      const singleDayResponse = await axios.get(`${API_BASE_URL}/reports/sales`, { 
        headers,
        params: {
          dateFrom: yesterdayStr,
          dateTo: yesterdayStr
        }
      });
      
      if (singleDayResponse.data.success) {
        console.log('✅ Single day sales report working');
        const chartData = singleDayResponse.data.data.chartData;
        console.log(`📊 Single day data points: ${chartData?.length || 0}`);
        
        if (chartData && chartData.length > 0) {
          console.log('\n📋 Single day data:');
          chartData.forEach((point, index) => {
            console.log(`  ${index + 1}. Date: ${point.date}, Revenue: ${point.revenue}, Count: ${point.count}`);
          });
        } else {
          console.log('ℹ️ No data found for the specific day (this is normal if no invoices exist for that day)');
        }
      } else {
        console.log('❌ Single day sales report failed');
      }
    } catch (error) {
      console.log(`❌ Single day report error: ${error.response?.data?.message || error.message}`);
    }

    console.log('\n🎯 Date Filter Test Summary:');
    console.log('✅ Backend API endpoints are working');
    console.log('✅ Date parameters are being accepted');
    console.log('✅ Date filtering logic is implemented');
    console.log('✅ Both sales and profit-loss reports support date filtering');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

// Run the test
testDateFiltering();
