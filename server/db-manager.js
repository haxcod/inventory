import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import models
import User from './models/User.js';
import Product from './models/Product.js';
import Branch from './models/Branch.js';
import Invoice from './models/Invoice.js';
import Payment from './models/Payment.js';
import StockMovement from './models/StockMovement.js';

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory-management');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error);
  }
};

const clearDatabase = async () => {
  try {
    console.log('🗑️  Clearing database...');
    
    const collections = [User, Product, Branch, Invoice, Payment, StockMovement];
    const results = await Promise.all(
      collections.map(model => model.deleteMany({}))
    );
    
    const totalDeleted = results.reduce((sum, result) => sum + result.deletedCount, 0);
    console.log(`✅ Cleared ${totalDeleted} documents from database`);
    
    return totalDeleted;
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
};

const getDatabaseStats = async () => {
  try {
    console.log('📊 Getting database statistics...');
    
    const stats = {
      users: await User.countDocuments(),
      products: await Product.countDocuments(),
      branches: await Branch.countDocuments(),
      invoices: await Invoice.countDocuments(),
      payments: await Payment.countDocuments(),
      stockMovements: await StockMovement.countDocuments()
    };
    
    console.log('\n📈 Database Statistics:');
    console.log(`- Users: ${stats.users}`);
    console.log(`- Products: ${stats.products}`);
    console.log(`- Branches: ${stats.branches}`);
    console.log(`- Invoices: ${stats.invoices}`);
    console.log(`- Payments: ${stats.payments}`);
    console.log(`- Stock Movements: ${stats.stockMovements}`);
    
    return stats;
  } catch (error) {
    console.error('❌ Error getting database stats:', error);
    throw error;
  }
};

const backupDatabase = async () => {
  try {
    console.log('💾 Creating database backup...');
    
    const backup = {
      timestamp: new Date().toISOString(),
      data: {
        users: await User.find({}),
        products: await Product.find({}),
        branches: await Branch.find({}),
        invoices: await Invoice.find({}),
        payments: await Payment.find({}),
        stockMovements: await StockMovement.find({})
      }
    };
    
    // In a real application, you would save this to a file or cloud storage
    console.log('✅ Database backup created (in memory)');
    console.log(`📅 Backup timestamp: ${backup.timestamp}`);
    
    return backup;
  } catch (error) {
    console.error('❌ Error creating backup:', error);
    throw error;
  }
};

const listCollections = async () => {
  try {
    console.log('📋 Listing collections...');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    console.log('\n📁 Available Collections:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    return collections;
  } catch (error) {
    console.error('❌ Error listing collections:', error);
    throw error;
  }
};

const showHelp = () => {
  console.log('\n🛠️  Database Manager - Available Commands:');
  console.log('==========================================');
  console.log('node db-manager.js clear     - Clear all data from database');
  console.log('node db-manager.js stats     - Show database statistics');
  console.log('node db-manager.js backup    - Create database backup');
  console.log('node db-manager.js list      - List all collections');
  console.log('node db-manager.js help      - Show this help message');
  console.log('\n💡 Examples:');
  console.log('npm run db:clear             - Clear database');
  console.log('npm run db:stats             - Show stats');
  console.log('npm run db:backup            - Create backup');
};

const main = async () => {
  const command = process.argv[2];
  
  if (!command || command === 'help') {
    showHelp();
    return;
  }
  
  try {
    await connectDB();
    
    switch (command) {
      case 'clear':
        await clearDatabase();
        break;
        
      case 'stats':
        await getDatabaseStats();
        break;
        
      case 'backup':
        await backupDatabase();
        break;
        
      case 'list':
        await listCollections();
        break;
        
      default:
        console.log(`❌ Unknown command: ${command}`);
        showHelp();
        break;
    }
    
  } catch (error) {
    console.error('❌ Operation failed:', error.message);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
};

// Run the main function
main();
