import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testChartDataStructure() {
  console.log('🔍 Testing Chart Data Structure and Values...\n');

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

    // Test Sales Report Data
    console.log('2. Testing Sales Report Data Structure...');
    try {
      const salesResponse = await axios.get(`${API_BASE_URL}/reports/sales`, { headers });
      if (salesResponse.data.success) {
        console.log('✅ Sales report data received');
        const chartData = salesResponse.data.data.chartData;
        console.log('📊 Total data points:', chartData?.length || 0);
        
        if (chartData && chartData.length > 0) {
          console.log('\n📋 First 5 data points:');
          chartData.slice(0, 5).forEach((point, index) => {
            console.log(`  ${index + 1}. Date: ${point.date}, Revenue: ${point.revenue}, Count: ${point.count}`);
          });
          
          console.log('\n📋 Last 5 data points:');
          chartData.slice(-5).forEach((point, index) => {
            console.log(`  ${chartData.length - 4 + index}. Date: ${point.date}, Revenue: ${point.revenue}, Count: ${point.count}`);
          });
          
          // Check for data consistency
          console.log('\n🔍 Data Analysis:');
          const hasNullValues = chartData.some(point => point.revenue === null || point.revenue === undefined);
          const hasZeroValues = chartData.some(point => point.revenue === 0);
          const hasNegativeValues = chartData.some(point => point.revenue < 0);
          
          console.log(`  - Has null/undefined values: ${hasNullValues}`);
          console.log(`  - Has zero values: ${hasZeroValues}`);
          console.log(`  - Has negative values: ${hasNegativeValues}`);
          
          // Check date continuity
          const dates = chartData.map(point => point.date).sort();
          console.log(`  - Date range: ${dates[0]} to ${dates[dates.length - 1]}`);
          
          // Check for gaps in dates
          const dateGaps = [];
          for (let i = 1; i < dates.length; i++) {
            const prevDate = new Date(dates[i - 1]);
            const currDate = new Date(dates[i]);
            const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);
            if (diffDays > 1) {
              dateGaps.push({ from: dates[i - 1], to: dates[i], gap: diffDays });
            }
          }
          
          if (dateGaps.length > 0) {
            console.log(`  - Date gaps found: ${dateGaps.length}`);
            dateGaps.slice(0, 3).forEach(gap => {
              console.log(`    Gap: ${gap.from} to ${gap.to} (${gap.gap} days)`);
            });
          } else {
            console.log(`  - No date gaps found`);
          }
        }
      } else {
        console.log('❌ Sales report failed');
      }
    } catch (error) {
      console.log(`❌ Sales report error: ${error.response?.data?.message || error.message}`);
    }

    // Test Dashboard Data
    console.log('\n3. Testing Dashboard Data Structure...');
    try {
      const dashboardResponse = await axios.get(`${API_BASE_URL}/dashboard`, { headers });
      if (dashboardResponse.data.success) {
        console.log('✅ Dashboard data received');
        const salesData = dashboardResponse.data.data.salesData;
        console.log('📊 Dashboard sales data points:', salesData?.length || 0);
        
        if (salesData && salesData.length > 0) {
          console.log('\n📋 Dashboard sales data:');
          salesData.slice(0, 5).forEach((point, index) => {
            console.log(`  ${index + 1}. Name: ${point.name}, Sales: ${point.sales}, Value: ${point.value}`);
          });
          
          // Check for data consistency
          const hasNullValues = salesData.some(point => point.sales === null || point.sales === undefined);
          const hasZeroValues = salesData.some(point => point.sales === 0);
          
          console.log(`\n🔍 Dashboard Data Analysis:`);
          console.log(`  - Has null/undefined values: ${hasNullValues}`);
          console.log(`  - Has zero values: ${hasZeroValues}`);
        }
      } else {
        console.log('❌ Dashboard data failed');
      }
    } catch (error) {
      console.log(`❌ Dashboard data error: ${error.response?.data?.message || error.message}`);
    }

    // Test Profit & Loss Data
    console.log('\n4. Testing Profit & Loss Data Structure...');
    try {
      const profitLossResponse = await axios.get(`${API_BASE_URL}/reports/profit-loss`, { headers });
      if (profitLossResponse.data.success) {
        console.log('✅ Profit & Loss data received');
        const chartData = profitLossResponse.data.data.chartData;
        console.log('📊 Profit & Loss data points:', chartData?.length || 0);
        
        if (chartData && chartData.length > 0) {
          console.log('\n📋 Profit & Loss data:');
          chartData.forEach((point, index) => {
            console.log(`  ${index + 1}. Month: ${point.month}, Revenue: ${point.revenue}, Expenses: ${point.expenses}, Profit: ${point.profit}`);
          });
        }
      } else {
        console.log('❌ Profit & Loss data failed');
      }
    } catch (error) {
      console.log(`❌ Profit & Loss data error: ${error.response?.data?.message || error.message}`);
    }

    console.log('\n🎯 Summary:');
    console.log('✅ Check if data has proper structure');
    console.log('✅ Check if values are numeric and not null');
    console.log('✅ Check if dates are continuous');
    console.log('✅ Check if there are gaps in data');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

// Run the test
testChartDataStructure();
