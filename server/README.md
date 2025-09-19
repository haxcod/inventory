# Inventory Management Server

A complete Express.js server for the inventory management system, organized into **Services**, **Controllers**, and **Routes** architecture.

## 🏗️ Architecture

The server follows a clean 3-layer architecture:

```
server/
├── models/           # MongoDB models (data layer)
├── services/         # Business logic layer
├── controllers/      # Request/Response handling layer
├── routes/           # API route definitions
├── middleware/       # Authentication & validation middleware
└── index.js          # Server entry point
```

## 📁 Project Structure

### Models
- `User.js` - User management
- `Product.js` - Product catalog
- `Branch.js` - Branch management
- `Invoice.js` - Invoice management
- `Payment.js` - Payment tracking
- `StockMovement.js` - Stock movement logs

### Services (Business Logic)
- `auth.service.js` - Authentication logic
- `user.service.js` - User management logic
- `product.service.js` - Product management logic
- `branch.service.js` - Branch management logic
- `billing.service.js` - Invoice & billing logic
- `payment.service.js` - Payment processing logic
- `report.service.js` - Reporting & analytics logic

### Controllers (Request/Response)
- `auth.controller.js` - Authentication endpoints
- `user.controller.js` - User management endpoints
- `product.controller.js` - Product management endpoints
- `branch.controller.js` - Branch management endpoints
- `billing.controller.js` - Invoice & billing endpoints
- `payment.controller.js` - Payment processing endpoints
- `report.controller.js` - Reporting endpoints

### Routes (API Endpoints)
- `auth.routes.js` - Authentication routes
- `user.routes.js` - User management routes
- `product.routes.js` - Product management routes
- `branch.routes.js` - Branch management routes
- `billing.routes.js` - Invoice & billing routes
- `payment.routes.js` - Payment processing routes
- `report.routes.js` - Reporting routes

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Environment Setup
```bash
cp env.example .env
# Edit .env with your configuration
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Start Production Server
```bash
npm start
```

## 🔧 Configuration

### Environment Variables
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/inventory-management

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/search` - Search users

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/search` - Search products
- `GET /api/products/low-stock` - Get low stock products
- `GET /api/products/branch/:branchId` - Get products by branch

### Branches
- `GET /api/branches` - Get all branches
- `GET /api/branches/:id` - Get branch by ID
- `POST /api/branches` - Create branch
- `PUT /api/branches/:id` - Update branch
- `DELETE /api/branches/:id` - Delete branch
- `GET /api/branches/search` - Search branches

### Billing & Invoices
- `GET /api/billing/invoices` - Get all invoices
- `GET /api/billing/invoices/:id` - Get invoice by ID
- `POST /api/billing/invoices` - Create invoice
- `PUT /api/billing/invoices/:id` - Update invoice
- `DELETE /api/billing/invoices/:id` - Delete invoice
- `GET /api/billing/invoices/:id/pdf` - Generate invoice PDF
- `POST /api/billing/qr-scan` - QR code scan

### Payments
- `GET /api/payments` - Get all payments
- `GET /api/payments/:id` - Get payment by ID
- `POST /api/payments` - Create payment
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment

### Reports
- `GET /api/reports/sales` - Sales report
- `GET /api/reports/stock` - Stock report
- `GET /api/reports/payments` - Payment report

## 🔐 Authentication & Authorization

### JWT Token
- All protected routes require a valid JWT token
- Token is sent in the `Authorization` header as `Bearer <token>`
- Token expires in 7 days (configurable)

### User Roles
- **admin**: Full access to all features
- **user**: Limited access based on permissions

### Permissions
- `read`: Can view data
- `write`: Can create and update data
- `delete`: Can delete data
- `admin`: Administrative access

## 🛡️ Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API rate limiting
- **JWT**: Secure authentication
- **bcrypt**: Password hashing
- **Input Validation**: Request validation
- **Error Handling**: Comprehensive error handling

## 📊 Database

### MongoDB Collections
- `users` - User accounts
- `products` - Product catalog
- `branches` - Branch locations
- `invoices` - Sales invoices
- `payments` - Payment records
- `stockmovements` - Stock movement logs

### Indexes
- Optimized indexes for better performance
- Text search indexes for search functionality
- Compound indexes for complex queries

## 🔄 Data Flow

1. **Request** → Route → Controller
2. **Controller** → Service (business logic)
3. **Service** → Model (database operations)
4. **Model** → Database
5. **Response** ← Controller ← Service ← Model

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

## 📈 Monitoring

- **Health Check**: `GET /health`
- **Logging**: Morgan for HTTP request logging
- **Error Tracking**: Comprehensive error handling

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Configure production MongoDB URI
- [ ] Set up proper CORS origins
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Use HTTPS in production

### Docker Support
```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Follow the 3-layer architecture
2. Add proper error handling
3. Include input validation
4. Write comprehensive tests
5. Update documentation

## 📝 License

ISC License


