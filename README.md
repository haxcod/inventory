# Vite Inventory Management System

A full-stack inventory management system built with React (Vite) frontend and Express.js backend.

## 🚀 Quick Start

### Setup
1. **Clone and setup:**
   ```bash
   git clone <your-repo>
   cd vite-inventory
   node setup.js
   ```

2. **Or manual setup:**
   ```bash
   # Install dependencies
   npm run install:all
   
   # Create environment files (see Environment Setup below)
   
   # Start development servers
   npm run dev
   ```

### Environment Setup

Create these environment files:

**client/.env:**
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=Inventory Management System
VITE_APP_VERSION=1.0.0
```

**server/.env:**
```env
MONGODB_URI=mongodb://localhost:27017/inventory_management
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## 🏗️ Project Structure

```
vite-inventory/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React contexts
│   │   ├── lib/           # API and utilities
│   │   └── types/         # TypeScript types
│   └── package.json
├── server/                 # Express.js backend
│   ├── controllers/       # Route controllers
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   └── services/         # Business logic
└── package.json          # Root package.json
```

## 🛠️ Available Scripts

### Root Level
- `npm run dev` - Start both client and server in development mode
- `npm run dev:client` - Start only the client
- `npm run dev:server` - Start only the server
- `npm run build` - Build the client for production
- `npm run start` - Start the server in production mode
- `npm run install:all` - Install dependencies for all packages

### Client (React)
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Server (Express)
- `npm run dev` - Start with nodemon (auto-restart)
- `npm start` - Start in production mode

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout

### Products
- `GET /api/products` - Get all products
- `GET /api/products/search` - Search products
- `GET /api/products/low-stock` - Get low stock products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Branches
- `GET /api/branches` - Get all branches
- `GET /api/branches/search` - Search branches
- `GET /api/branches/:id` - Get branch by ID
- `POST /api/branches` - Create branch
- `PUT /api/branches/:id` - Update branch
- `DELETE /api/branches/:id` - Delete branch

### Billing/Invoices
- `GET /api/billing/invoices` - Get all invoices
- `GET /api/billing/invoices/:id` - Get invoice by ID
- `POST /api/billing/invoices` - Create invoice
- `PUT /api/billing/invoices/:id` - Update invoice
- `DELETE /api/billing/invoices/:id` - Delete invoice
- `GET /api/billing/invoices/:id/pdf` - Generate PDF

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

## 🗄️ Database Models

### User
- Authentication and user management
- Roles: admin, user
- Permissions system

### Product
- Product catalog management
- Stock tracking
- Category and brand management

### Branch
- Multi-location support
- Branch-specific inventory

### Invoice
- Sales transactions
- Customer information
- Payment tracking

### Payment
- Payment processing
- Multiple payment methods
- Transaction history

## 🔧 Configuration

### Frontend (Vite)
- React 19 with TypeScript
- Tailwind CSS for styling
- Axios for API calls
- React Router for navigation
- Zustand for state management

### Backend (Express)
- Express.js with ES modules
- MongoDB with Mongoose
- JWT authentication
- CORS enabled
- Rate limiting
- Helmet for security

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
# Build client
npm run build

# Start server
npm start
```

### Docker (Optional)
```dockerfile
# Add Dockerfile for containerized deployment
```

## 📝 Features

- ✅ User authentication and authorization
- ✅ Product inventory management
- ✅ Multi-branch support
- ✅ Invoice generation
- ✅ Payment processing
- ✅ Sales and stock reports
- ✅ Responsive design
- ✅ Real-time updates
- ✅ Data validation
- ✅ Error handling

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in server/.env

2. **Port Already in Use**
   - Change PORT in server/.env
   - Kill existing processes on ports 5000/5173

3. **CORS Errors**
   - Check FRONTEND_URL in server/.env
   - Ensure client URL matches

4. **Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions, please open an issue in the repository.

