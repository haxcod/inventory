const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Product = require('./models/Product');
const Branch = require('./models/Branch');
const Invoice = require('./models/Invoice');
const Payment = require('./models/Payment');
const StockMovement = require('./models/StockMovement');

// Sample data
const sampleBranches = [
  {
    name: 'Main Branch',
    address: '123 Main Street, City Center',
    phone: '+91-9876543210',
    email: 'main@company.com',
    manager: 'John Doe',
    isActive: true
  },
  {
    name: 'North Branch',
    address: '456 North Avenue, North City',
    phone: '+91-9876543211',
    email: 'north@company.com',
    manager: 'Jane Smith',
    isActive: true
  },
  {
    name: 'South Branch',
    address: '789 South Boulevard, South City',
    phone: '+91-9876543212',
    email: 'south@company.com',
    manager: 'Bob Johnson',
    isActive: true
  },
  {
    name: 'East Branch',
    address: '321 East Street, East City',
    phone: '+91-9876543213',
    email: 'east@company.com',
    manager: 'Alice Brown',
    isActive: true
  }
];

const sampleUsers = [
  {
    email: 'admin@company.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    permissions: ['all'],
    branch: null,
    isActive: true
  },
  {
    email: 'manager@company.com',
    password: 'manager123',
    name: 'Branch Manager',
    role: 'user',
    permissions: ['transfer_products', 'manage_inventory', 'view_reports'],
    branch: null, // Will be set to main branch
    isActive: true
  },
  {
    email: 'staff@company.com',
    password: 'staff123',
    name: 'Staff Member',
    role: 'user',
    permissions: ['transfer_products', 'view_inventory'],
    branch: null, // Will be set to north branch
    isActive: true
  }
];

const sampleProducts = [
  {
    name: 'iPhone 15 Pro',
    description: 'Latest iPhone with advanced features',
    sku: 'IPH15P-001',
    category: 'Electronics',
    brand: 'Apple',
    price: 99999,
    costPrice: 85000,
    stock: 25,
    minStock: 5,
    maxStock: 100,
    unit: 'pieces',
    branch: null, // Will be set to main branch
    isActive: true
  },
  {
    name: 'Samsung Galaxy S24',
    description: 'Premium Android smartphone',
    sku: 'SGS24-001',
    category: 'Electronics',
    brand: 'Samsung',
    price: 79999,
    costPrice: 70000,
    stock: 15,
    minStock: 3,
    maxStock: 50,
    unit: 'pieces',
    branch: null, // Will be set to main branch
    isActive: true
  },
  {
    name: 'MacBook Pro M3',
    description: 'High-performance laptop for professionals',
    sku: 'MBP-M3-001',
    category: 'Electronics',
    brand: 'Apple',
    price: 199999,
    costPrice: 170000,
    stock: 8,
    minStock: 2,
    maxStock: 25,
    unit: 'pieces',
    branch: null, // Will be set to main branch
    isActive: true
  },
  {
    name: 'Dell XPS 13',
    description: 'Ultrabook with premium design',
    sku: 'DXP13-001',
    category: 'Electronics',
    brand: 'Dell',
    price: 129999,
    costPrice: 110000,
    stock: 12,
    minStock: 3,
    maxStock: 30,
    unit: 'pieces',
    branch: null, // Will be set to north branch
    isActive: true
  },
  {
    name: 'Sony WH-1000XM5',
    description: 'Noise-cancelling wireless headphones',
    sku: 'SWH1000XM5-001',
    category: 'Electronics',
    brand: 'Sony',
    price: 29999,
    costPrice: 25000,
    stock: 20,
    minStock: 5,
    maxStock: 50,
    unit: 'pieces',
    branch: null, // Will be set to south branch
    isActive: true
  },
  {
    name: 'Logitech MX Master 3S',
    description: 'Wireless mouse for productivity',
    sku: 'LMX3S-001',
    category: 'Electronics',
    brand: 'Logitech',
    price: 8999,
    costPrice: 7000,
    stock: 35,
    minStock: 10,
    maxStock: 100,
    unit: 'pieces',
    branch: null, // Will be set to east branch
    isActive: true
  }
];

const samplePayments = [
  {
    amount: 500000,
    paymentMethod: 'upi',
    paymentType: 'credit',
    description: 'Payment for Invoice INV-001',
    reference: 'TXN123456789',
    customer: 'John Doe',
    branch: null, // Will be set to main branch
    createdBy: null, // Will be set to admin user
    notes: 'Full payment received via UPI'
  },
  {
    amount: 250000,
    paymentMethod: 'card',
    paymentType: 'credit',
    description: 'Partial payment for Invoice INV-002',
    reference: 'CARD987654321',
    customer: 'Jane Smith',
    branch: null, // Will be set to main branch
    createdBy: null, // Will be set to admin user
    notes: 'Card payment processed'
  },
  {
    amount: 10000,
    paymentMethod: 'cash',
    paymentType: 'debit',
    description: 'Refund for returned item',
    reference: 'REF123456',
    customer: 'Bob Johnson',
    branch: null, // Will be set to main branch
    createdBy: null, // Will be set to admin user
    notes: 'Cash refund processed'
  },
  {
    amount: 75000,
    paymentMethod: 'bank_transfer',
    paymentType: 'credit',
    description: 'Payment for bulk order',
    reference: 'BANK456789',
    customer: 'Alice Brown',
    branch: null, // Will be set to north branch
    createdBy: null, // Will be set to manager user
    notes: 'Bank transfer received'
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory-management');
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Branch.deleteMany({});
    await Invoice.deleteMany({});
    await Payment.deleteMany({});
    await StockMovement.deleteMany({});

    // Create branches
    console.log('Creating branches...');
    const createdBranches = await Branch.insertMany(sampleBranches);
    console.log(`Created ${createdBranches.length} branches`);

    // Create users
    console.log('Creating users...');
    const hashedUsers = await Promise.all(
      sampleUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10),
        branch: user.role === 'admin' ? null : createdBranches[0]._id
      }))
    );
    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`Created ${createdUsers.length} users`);

    // Create products
    console.log('Creating products...');
    const productsWithBranches = sampleProducts.map((product, index) => ({
      ...product,
      branch: createdBranches[index % createdBranches.length]._id
    }));
    const createdProducts = await Product.insertMany(productsWithBranches);
    console.log(`Created ${createdProducts.length} products`);

    // Create payments
    console.log('Creating payments...');
    const paymentsWithReferences = samplePayments.map((payment, index) => ({
      ...payment,
      branch: createdBranches[index % createdBranches.length]._id,
      createdBy: createdUsers[0]._id // Admin user
    }));
    const createdPayments = await Payment.insertMany(paymentsWithReferences);
    console.log(`Created ${createdPayments.length} payments`);

    // Create stock movements
    console.log('Creating stock movements...');
    const stockMovements = createdProducts.map((product, index) => ({
      product: product._id,
      branch: product.branch,
      type: 'in',
      quantity: product.stock,
      reason: 'Initial stock',
      reference: 'INIT-001',
      createdBy: createdUsers[0]._id
    }));
    await StockMovement.insertMany(stockMovements);
    console.log(`Created ${stockMovements.length} stock movements`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Branches: ${createdBranches.length}`);
    console.log(`- Users: ${createdUsers.length}`);
    console.log(`- Products: ${createdProducts.length}`);
    console.log(`- Payments: ${createdPayments.length}`);
    console.log(`- Stock Movements: ${stockMovements.length}`);

    console.log('\n🔑 Login Credentials:');
    console.log('Admin: admin@company.com / admin123');
    console.log('Manager: manager@company.com / manager123');
    console.log('Staff: staff@company.com / staff123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the seeding function
seedDatabase();
