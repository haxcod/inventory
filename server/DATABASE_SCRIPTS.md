# Database Management Scripts

This directory contains scripts for managing the inventory management system database.

## Available Scripts

### 1. Seed Database (`seed-database.js`)

Populates the database with comprehensive sample data for development and testing.

**Usage:**
```bash
npm run seed
# or
node seed-database.js
```

**What it creates:**
- **4 Branches** - Main, North, South, and East branches
- **3 Users** - Admin, Manager, and Staff with different permissions
- **13 Products** - Electronics, Footwear, Clothing, and Home & Kitchen items
- **5 Invoices** - Various payment statuses and customer scenarios
- **9 Payments** - Different payment methods and transaction types
- **13 Stock Movements** - Initial stock entries for all products

**Login Credentials:**
- Admin: `admin@company.com` / `admin123`
- Manager: `manager@company.com` / `manager123`
- Staff: `staff@company.com` / `staff123`

### 2. Database Manager (`db-manager.js`)

A comprehensive database management tool with multiple utilities.

**Usage:**
```bash
# Show help
npm run db:help

# Get database statistics
npm run db:stats

# Clear all data
npm run db:clear

# Create backup
npm run db:backup

# List collections
npm run db:list
```

**Commands:**
- `clear` - Removes all data from the database
- `stats` - Shows document counts for each collection
- `backup` - Creates an in-memory backup of all data
- `list` - Lists all available collections
- `help` - Shows available commands

## Sample Data Overview

### Products by Category

**Electronics:**
- iPhone 15 Pro (₹99,999)
- Samsung Galaxy S24 (₹79,999)
- MacBook Pro M3 (₹1,99,999)
- Dell XPS 13 (₹1,29,999)
- Sony WH-1000XM5 (₹29,999)
- Logitech MX Master 3S (₹8,999)

**Footwear:**
- Nike Air Max 270 (₹12,999)
- Adidas Ultraboost 22 (₹15,999)

**Clothing:**
- Levi's 501 Original Jeans (₹4,999)
- Uniqlo Heattech T-Shirt (₹1,999)

**Home & Kitchen:**
- KitchenAid Stand Mixer (₹45,999)
- Instant Pot Duo 7-in-1 (₹12,999)
- Dyson V15 Detect Vacuum (₹59,999)

### Invoice Scenarios

1. **INV-001** - Corporate bulk order (Paid via UPI)
2. **INV-002** - High-value laptop sale (Pending Card payment)
3. **INV-003** - Retail store order (Pending Cash payment)
4. **INV-004** - Fashion retail with discount (Paid via Card)
5. **INV-005** - Home kitchen equipment (Partial Bank transfer)

### Payment Types

- **Credit Payments** - Money coming in
- **Debit Payments** - Money going out (refunds)
- **Payment Methods** - Cash, Card, UPI, Bank Transfer

## Database Schema

### Collections

1. **Users** - System users with roles and permissions
2. **Branches** - Store locations and management
3. **Products** - Inventory items with pricing and stock
4. **Invoices** - Sales transactions with customer details
5. **Payments** - Financial transactions
6. **StockMovements** - Inventory tracking and history

## Environment Setup

Make sure you have a `.env` file in the server directory with:

```env
MONGODB_URI=mongodb://localhost:27017/inventory-management
PORT=5000
JWT_SECRET=your-jwt-secret
FRONTEND_URL=http://localhost:5173
```

## Development Workflow

1. **Start MongoDB** - Ensure MongoDB is running locally
2. **Seed Database** - Run `npm run seed` to populate with sample data
3. **Check Stats** - Use `npm run db:stats` to verify data
4. **Clear & Reseed** - Use `npm run db:clear` then `npm run seed` to reset

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env file

2. **Validation Errors**
   - Check model schemas match sample data structure
   - Verify required fields are provided

3. **Permission Errors**
   - Ensure proper file permissions
   - Check MongoDB user permissions

### Reset Database

To completely reset the database:

```bash
npm run db:clear
npm run seed
```

This will remove all existing data and populate with fresh sample data.

## Production Considerations

- **Backup Strategy** - Implement proper backup solutions for production
- **Data Security** - Use secure connection strings and authentication
- **Monitoring** - Set up database monitoring and alerts
- **Scaling** - Consider database sharding for large datasets

## Support

For issues or questions about the database scripts, check:
1. MongoDB logs for connection issues
2. Node.js console output for validation errors
3. Database schema definitions in `/models` directory
