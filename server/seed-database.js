import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
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
  },
  {
    name: 'Nike Air Max 270',
    description: 'Comfortable running shoes',
    sku: 'NAM270-001',
    category: 'Footwear',
    brand: 'Nike',
    price: 12999,
    costPrice: 9000,
    stock: 50,
    minStock: 15,
    maxStock: 200,
    unit: 'pairs',
    branch: null, // Will be set to main branch
    isActive: true
  },
  {
    name: 'Adidas Ultraboost 22',
    description: 'Premium running shoes with boost technology',
    sku: 'AUB22-001',
    category: 'Footwear',
    brand: 'Adidas',
    price: 15999,
    costPrice: 12000,
    stock: 30,
    minStock: 8,
    maxStock: 100,
    unit: 'pairs',
    branch: null, // Will be set to north branch
    isActive: true
  },
  {
    name: 'Levi\'s 501 Original Jeans',
    description: 'Classic straight-fit jeans',
    sku: 'L501-001',
    category: 'Clothing',
    brand: 'Levi\'s',
    price: 4999,
    costPrice: 3500,
    stock: 75,
    minStock: 20,
    maxStock: 300,
    unit: 'pieces',
    branch: null, // Will be set to south branch
    isActive: true
  },
  {
    name: 'Uniqlo Heattech T-Shirt',
    description: 'Thermal base layer t-shirt',
    sku: 'UHT-001',
    category: 'Clothing',
    brand: 'Uniqlo',
    price: 1999,
    costPrice: 1200,
    stock: 100,
    minStock: 30,
    maxStock: 500,
    unit: 'pieces',
    branch: null, // Will be set to east branch
    isActive: true
  },
  {
    name: 'KitchenAid Stand Mixer',
    description: 'Professional stand mixer for baking',
    sku: 'KSM-001',
    category: 'Home & Kitchen',
    brand: 'KitchenAid',
    price: 45999,
    costPrice: 35000,
    stock: 8,
    minStock: 2,
    maxStock: 25,
    unit: 'pieces',
    branch: null, // Will be set to main branch
    isActive: true
  },
  {
    name: 'Instant Pot Duo 7-in-1',
    description: 'Electric pressure cooker with multiple functions',
    sku: 'IPD7-001',
    category: 'Home & Kitchen',
    brand: 'Instant Pot',
    price: 12999,
    costPrice: 9000,
    stock: 15,
    minStock: 5,
    maxStock: 50,
    unit: 'pieces',
    branch: null, // Will be set to north branch
    isActive: true
  },
  {
    name: 'Dyson V15 Detect Vacuum',
    description: 'Cordless vacuum with laser dust detection',
    sku: 'DV15-001',
    category: 'Home & Kitchen',
    brand: 'Dyson',
    price: 59999,
    costPrice: 45000,
    stock: 12,
    minStock: 3,
    maxStock: 30,
    unit: 'pieces',
    branch: null, // Will be set to south branch
    isActive: true
  }
];

const sampleInvoices = [
  {
    invoiceNumber: 'INV-001',
    customer: {
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+91-9876543210',
      address: '123 Customer Street, City'
    },
    items: [
      {
        product: null, // Will be set to iPhone 15 Pro
        quantity: 2,
        price: 99999,
        discount: 0,
        total: 199998
      },
      {
        product: null, // Will be set to Sony WH-1000XM5
        quantity: 1,
        price: 29999,
        discount: 0,
        total: 29999
      }
    ],
    subtotal: 229997,
    tax: 41399.46,
    discount: 0,
    total: 271396.46,
    paymentMethod: 'upi',
    paymentStatus: 'paid',
    notes: 'Bulk order for corporate client',
    branch: null, // Will be set to main branch
    createdBy: null // Will be set to admin user
  },
  {
    invoiceNumber: 'INV-002',
    customer: {
      name: 'Jane Smith',
      email: 'jane.smith@email.com',
      phone: '+91-9876543211',
      address: '456 Business Avenue, City'
    },
    items: [
      {
        product: null, // Will be set to MacBook Pro M3
        quantity: 1,
        price: 199999,
        discount: 0,
        total: 199999
      }
    ],
    subtotal: 199999,
    tax: 35999.82,
    discount: 0,
    total: 235998.82,
    paymentMethod: 'card',
    paymentStatus: 'pending',
    notes: 'High-value laptop sale',
    branch: null, // Will be set to main branch
    createdBy: null // Will be set to admin user
  },
  {
    invoiceNumber: 'INV-003',
    customer: {
      name: 'Bob Johnson',
      email: 'bob.johnson@email.com',
      phone: '+91-9876543212',
      address: '789 Retail Road, City'
    },
    items: [
      {
        product: null, // Will be set to Samsung Galaxy S24
        quantity: 3,
        price: 79999,
        discount: 0,
        total: 239997
      },
      {
        product: null, // Will be set to Logitech MX Master 3S
        quantity: 2,
        price: 8999,
        discount: 0,
        total: 17998
      }
    ],
    subtotal: 257995,
    tax: 46439.1,
    discount: 0,
    total: 304434.1,
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    notes: 'Retail store order',
    branch: null, // Will be set to north branch
    createdBy: null // Will be set to manager user
  },
  {
    invoiceNumber: 'INV-004',
    customer: {
      name: 'Sarah Wilson',
      email: 'sarah.wilson@email.com',
      phone: '+91-9876543213',
      address: '321 Fashion Street, City'
    },
    items: [
      {
        product: null, // Will be set to Nike Air Max 270
        quantity: 2,
        price: 12999,
        discount: 1000,
        total: 24998
      },
      {
        product: null, // Will be set to Levi's 501 Original Jeans
        quantity: 3,
        price: 4999,
        discount: 0,
        total: 14997
      }
    ],
    subtotal: 39995,
    tax: 7199.1,
    discount: 1000,
    total: 46194.1,
    paymentMethod: 'card',
    paymentStatus: 'paid',
    notes: 'Fashion retail order with discount',
    branch: null, // Will be set to south branch
    createdBy: null // Will be set to staff user
  },
  {
    invoiceNumber: 'INV-005',
    customer: {
      name: 'Mike Chen',
      email: 'mike.chen@email.com',
      phone: '+91-9876543214',
      address: '654 Home Avenue, City'
    },
    items: [
      {
        product: null, // Will be set to KitchenAid Stand Mixer
        quantity: 1,
        price: 45999,
        discount: 2000,
        total: 43999
      },
      {
        product: null, // Will be set to Instant Pot Duo 7-in-1
        quantity: 1,
        price: 12999,
        discount: 0,
        total: 12999
      }
    ],
    subtotal: 56998,
    tax: 10259.64,
    discount: 2000,
    total: 65257.64,
    paymentMethod: 'bank_transfer',
    paymentStatus: 'partial',
    notes: 'Home kitchen equipment order',
    branch: null, // Will be set to east branch
    createdBy: null // Will be set to manager user
  }
];

const samplePayments = [
  {
    amount: 271396.46,
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
    amount: 100000,
    paymentMethod: 'card',
    paymentType: 'credit',
    description: 'Partial payment for Invoice INV-002',
    reference: 'CARD987654321',
    customer: 'Jane Smith',
    branch: null, // Will be set to main branch
    createdBy: null, // Will be set to admin user
    notes: 'Card payment processed - partial'
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
  },
  {
    amount: 50000,
    paymentMethod: 'upi',
    paymentType: 'credit',
    description: 'Advance payment for future order',
    reference: 'ADV789123',
    customer: 'Charlie Wilson',
    branch: null, // Will be set to south branch
    createdBy: null, // Will be set to staff user
    notes: 'Advance payment received'
  },
  {
    amount: 46194.1,
    paymentMethod: 'card',
    paymentType: 'credit',
    description: 'Payment for Invoice INV-004',
    reference: 'CARD456789',
    customer: 'Sarah Wilson',
    branch: null, // Will be set to south branch
    createdBy: null, // Will be set to staff user
    notes: 'Fashion retail payment processed'
  },
  {
    amount: 30000,
    paymentMethod: 'bank_transfer',
    paymentType: 'credit',
    description: 'Partial payment for Invoice INV-005',
    reference: 'BANK789123',
    customer: 'Mike Chen',
    branch: null, // Will be set to east branch
    createdBy: null, // Will be set to manager user
    notes: 'Partial payment for kitchen equipment'
  },
  {
    amount: 15000,
    paymentMethod: 'cash',
    paymentType: 'credit',
    description: 'Walk-in customer payment',
    reference: 'CASH001',
    customer: 'Emma Davis',
    branch: null, // Will be set to main branch
    createdBy: null, // Will be set to admin user
    notes: 'Cash payment for miscellaneous items'
  },
  {
    amount: 25000,
    paymentMethod: 'upi',
    paymentType: 'debit',
    description: 'Refund for damaged goods',
    reference: 'REF789456',
    customer: 'Tom Anderson',
    branch: null, // Will be set to north branch
    createdBy: null, // Will be set to manager user
    notes: 'Refund processed for damaged Nike shoes'
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

    // Create invoices
    console.log('Creating invoices...');
    const invoicesWithReferences = sampleInvoices.map((invoice, index) => ({
      ...invoice,
      items: invoice.items.map(item => ({
        ...item,
        product: createdProducts[index % createdProducts.length]._id
      })),
      branch: createdBranches[index % createdBranches.length]._id,
      createdBy: createdUsers[index % createdUsers.length]._id
    }));
    const createdInvoices = await Invoice.insertMany(invoicesWithReferences);
    console.log(`Created ${createdInvoices.length} invoices`);

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
    console.log(`- Invoices: ${createdInvoices.length}`);
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
