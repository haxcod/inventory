import mongoose from 'mongoose';
import Invoice from './models/Invoice.js';
import Payment from './models/Payment.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkDatabaseData() {
  try {
    console.log('🔍 Checking Database Data for Charts...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check Invoice data
    console.log('1. Checking Invoice Data...');
    const invoices = await Invoice.find({}).sort({ createdAt: 1 });
    console.log(`📊 Total invoices: ${invoices.length}`);
    
    if (invoices.length > 0) {
      console.log('\n📋 First 5 invoices:');
      invoices.slice(0, 5).forEach((invoice, index) => {
        console.log(`  ${index + 1}. Date: ${invoice.createdAt.toISOString().split('T')[0]}, Total: ${invoice.total}, Status: ${invoice.paymentStatus}`);
      });
      
      console.log('\n📋 Last 5 invoices:');
      invoices.slice(-5).forEach((invoice, index) => {
        console.log(`  ${invoices.length - 4 + index}. Date: ${invoice.createdAt.toISOString().split('T')[0]}, Total: ${invoice.total}, Status: ${invoice.paymentStatus}`);
      });
      
      // Group by date
      const salesByDate = {};
      invoices.forEach(invoice => {
        const date = invoice.createdAt.toISOString().split('T')[0];
        if (!salesByDate[date]) {
          salesByDate[date] = { date, revenue: 0, count: 0 };
        }
        salesByDate[date].revenue += invoice.total;
        salesByDate[date].count += 1;
      });
      
      console.log('\n📊 Sales by date:');
      const sortedDates = Object.keys(salesByDate).sort();
      sortedDates.forEach(date => {
        console.log(`  ${date}: Revenue ${salesByDate[date].revenue}, Count ${salesByDate[date].count}`);
      });
      
      // Check for gaps
      console.log('\n🔍 Checking for date gaps...');
      const dateGaps = [];
      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);
        if (diffDays > 1) {
          dateGaps.push({ from: sortedDates[i - 1], to: sortedDates[i], gap: diffDays });
        }
      }
      
      if (dateGaps.length > 0) {
        console.log(`❌ Found ${dateGaps.length} date gaps:`);
        dateGaps.forEach(gap => {
          console.log(`  Gap: ${gap.from} to ${gap.to} (${gap.gap} days)`);
        });
      } else {
        console.log('✅ No date gaps found');
      }
    }

    // Check Payment data
    console.log('\n2. Checking Payment Data...');
    const payments = await Payment.find({}).sort({ createdAt: 1 });
    console.log(`📊 Total payments: ${payments.length}`);
    
    if (payments.length > 0) {
      console.log('\n📋 First 5 payments:');
      payments.slice(0, 5).forEach((payment, index) => {
        console.log(`  ${index + 1}. Date: ${payment.createdAt.toISOString().split('T')[0]}, Amount: ${payment.amount}, Type: ${payment.paymentType}`);
      });
    }

    // Test the data generation logic
    console.log('\n3. Testing Data Generation Logic...');
    
    // Simulate the sales report data generation
    const salesByDate = {};
    invoices.forEach(invoice => {
      const date = invoice.createdAt.toISOString().split('T')[0];
      if (!salesByDate[date]) {
        salesByDate[date] = { date, revenue: 0, count: 0 };
      }
      salesByDate[date].revenue += invoice.total;
      salesByDate[date].count += 1;
    });

    // Fill in missing dates to ensure continuous data
    const chartData = [];
    if (Object.keys(salesByDate).length > 0) {
      const dates = Object.keys(salesByDate).sort();
      const startDate = new Date(dates[0]);
      const endDate = new Date(dates[dates.length - 1]);
      
      console.log(`📅 Date range: ${dates[0]} to ${dates[dates.length - 1]}`);
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        chartData.push({
          date: dateStr,
          revenue: salesByDate[dateStr]?.revenue || 0,
          count: salesByDate[dateStr]?.count || 0
        });
      }
    }
    
    console.log(`📊 Generated chart data points: ${chartData.length}`);
    console.log('\n📋 First 10 chart data points:');
    chartData.slice(0, 10).forEach((point, index) => {
      console.log(`  ${index + 1}. Date: ${point.date}, Revenue: ${point.revenue}, Count: ${point.count}`);
    });
    
    // Check for null/undefined values
    const hasNullValues = chartData.some(point => 
      point.revenue === null || point.revenue === undefined || 
      point.count === null || point.count === undefined
    );
    
    console.log(`\n🔍 Data Quality Check:`);
    console.log(`  - Has null/undefined values: ${hasNullValues}`);
    console.log(`  - All revenue values are numeric: ${chartData.every(point => typeof point.revenue === 'number')}`);
    console.log(`  - All count values are numeric: ${chartData.every(point => typeof point.count === 'number')}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

// Run the check
checkDatabaseData();
