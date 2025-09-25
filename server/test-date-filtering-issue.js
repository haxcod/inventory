import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testDateFilteringIssue() {
  console.log('🔍 Testing Date Filtering Issue...\n');

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

    // Test 1: Sales Report without date filter (all data)
    console.log('2. Testing Sales Report without date filter...');
    try {
      const allDataResponse = await axios.get(`${API_BASE_URL}/reports/sales`, { headers });
      
      if (allDataResponse.data.success) {
        console.log('✅ Sales report without filter working');
        const chartData = allDataResponse.data.data.chartData;
        console.log(`📊 Total data points: ${chartData?.length || 0}`);
        
        if (chartData && chartData.length > 0) {
          console.log('\n📋 All data (first 5):');
          chartData.slice(0, 5).forEach((point, index) => {
            console.log(`  ${index + 1}. Date: ${point.date}, Revenue: ${point.revenue}, Count: ${point.count}`);
          });
          
          console.log('\n📋 All data (last 5):');
          chartData.slice(-5).forEach((point, index) => {
            console.log(`  ${chartData.length - 4 + index}. Date: ${point.date}, Revenue: ${point.revenue}, Count: ${point.count}`);
          });
        }
      } else {
        console.log('❌ Sales report without filter failed');
      }
    } catch (error) {
      console.log(`❌ Error: ${error.response?.data?.message || error.message}`);
    }

    // Test 2: Sales Report with specific date range (16-09-2025 to 02-10-2025)
    console.log('\n3. Testing Sales Report with date range (16-09-2025 to 02-10-2025)...');
    try {
      const filteredResponse = await axios.get(`${API_BASE_URL}/reports/sales`, { 
        headers,
        params: {
          dateFrom: '2025-09-16',
          dateTo: '2025-10-02'
        }
      });
      
      if (filteredResponse.data.success) {
        console.log('✅ Sales report with date filter working');
        const chartData = filteredResponse.data.data.chartData;
        console.log(`📊 Filtered data points: ${chartData?.length || 0}`);
        
        if (chartData && chartData.length > 0) {
          console.log('\n📋 Filtered data:');
          chartData.forEach((point, index) => {
            console.log(`  ${index + 1}. Date: ${point.date}, Revenue: ${point.revenue}, Count: ${point.count}`);
          });
        } else {
          console.log('ℹ️ No data found in the specified date range');
        }
      } else {
        console.log('❌ Sales report with date filter failed');
      }
    } catch (error) {
      console.log(`❌ Error: ${error.response?.data?.message || error.message}`);
    }

    // Test 3: Sales Report with period filter
    console.log('\n4. Testing Sales Report with period filter (weekly)...');
    try {
      const periodResponse = await axios.get(`${API_BASE_URL}/reports/sales`, { 
        headers,
        params: {
          period: 'weekly'
        }
      });
      
      if (periodResponse.data.success) {
        console.log('✅ Sales report with period filter working');
        const chartData = periodResponse.data.data.chartData;
        console.log(`📊 Weekly data points: ${chartData?.length || 0}`);
        
        if (chartData && chartData.length > 0) {
          console.log('\n📋 Weekly data:');
          chartData.forEach((point, index) => {
            console.log(`  ${index + 1}. Date: ${point.date}, Revenue: ${point.revenue}, Count: ${point.count}`);
          });
        }
      } else {
        console.log('❌ Sales report with period filter failed');
      }
    } catch (error) {
      console.log(`❌ Error: ${error.response?.data?.message || error.message}`);
    }

    // Test 4: Check what data exists in database
    console.log('\n5. Checking database data range...');
    try {
      const dbResponse = await axios.get(`${API_BASE_URL}/invoices`, { headers });
      
      if (dbResponse.data.success) {
        console.log('✅ Invoices data retrieved');
        const invoices = dbResponse.data.data.invoices;
        console.log(`📊 Total invoices: ${invoices?.length || 0}`);
        
        if (invoices && invoices.length > 0) {
          // Sort by date
          const sortedInvoices = invoices.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          
          console.log('\n📋 Date range in database:');
          console.log(`  First invoice: ${new Date(sortedInvoices[0].createdAt).toISOString().split('T')[0]}`);
          console.log(`  Last invoice: ${new Date(sortedInvoices[sortedInvoices.length - 1].createdAt).toISOString().split('T')[0]}`);
          
          console.log('\n📋 Sample invoices:');
          sortedInvoices.slice(0, 5).forEach((invoice, index) => {
            console.log(`  ${index + 1}. Date: ${new Date(invoice.createdAt).toISOString().split('T')[0]}, Total: ${invoice.total}`);
          });
        }
      } else {
        console.log('❌ Failed to get invoices data');
      }
    } catch (error) {
      console.log(`❌ Error: ${error.response?.data?.message || error.message}`);
    }

    console.log('\n🎯 Date Filter Test Summary:');
    console.log('This test will help identify if the issue is:');
    console.log('1. Backend not filtering data properly');
    console.log('2. Frontend not sending correct parameters');
    console.log('3. Database data not covering the requested date range');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

// Run the test
testDateFilteringIssue();
