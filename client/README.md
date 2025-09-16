# Inventory Management System - Vite + React 19

A complete inventory management solution built with Vite, React 19, React Router v7, and Tailwind CSS v4.

## 🚀 Features

- **Modern Tech Stack**: Vite + React 19 + TypeScript
- **Routing**: React Router v7 with protected routes
- **Styling**: Tailwind CSS v4 with custom design system
- **State Management**: Context API + Zustand
- **API Integration**: Axios for HTTP requests
- **UI Components**: Custom component library
- **Authentication**: JWT-based auth with protected routes
- **Theme Support**: Light/Dark mode toggle
- **Responsive Design**: Mobile-first approach

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── DashboardLayout.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Label.tsx
│   │   └── ProtectedRoute.tsx
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   └── ProductsPage.tsx
│   ├── lib/
│   │   └── utils.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── vite.config.ts
└── README.md
```

## 🛠️ Installation & Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

4. **Preview Production Build**
   ```bash
   npm run preview
   ```

## 🔧 Configuration

### Vite Configuration
The project uses Vite with React and Tailwind CSS v4:
- **React Plugin**: `@vitejs/plugin-react`
- **Tailwind CSS**: `@tailwindcss/vite`
- **TypeScript**: Full TypeScript support

### Tailwind CSS v4
- Custom CSS variables for theming
- Dark mode support with `data-theme` attribute
- Custom component classes (btn, card, input, etc.)
- Responsive design utilities

### API Configuration
- Axios configured for API calls
- Base URL can be configured in axios defaults
- JWT token handling in AuthContext
- Error handling with toast notifications

## 🎨 UI Components

### Button Component
```tsx
<Button variant="primary" size="lg">
  Click me
</Button>
```

**Variants**: `primary`, `secondary`, `destructive`, `outline`, `ghost`, `link`
**Sizes**: `sm`, `default`, `lg`, `icon`

### Card Component
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>
```

### Input Component
```tsx
<Input 
  type="email" 
  placeholder="Enter email"
  value={email}
  onChange={handleChange}
/>
```

## 🔐 Authentication

### AuthContext Usage
```tsx
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <LoginForm />;
  }
  
  return <Dashboard user={user} />;
}
```

### Protected Routes
```tsx
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  } 
/>
```

## 🎨 Theming

### ThemeContext Usage
```tsx
import { useTheme } from './context/ThemeContext';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
```

### CSS Variables
The project uses CSS custom properties for theming:
- `--background`, `--foreground`
- `--primary`, `--secondary`
- `--muted`, `--accent`
- `--border`, `--input`
- `--destructive`

## 📱 Pages

### HomePage
- Landing page with features showcase
- Call-to-action buttons
- Responsive design

### LoginPage
- Email/password authentication
- Form validation
- Error handling with toast notifications

### DashboardPage
- Statistics cards with growth indicators
- Charts (Line chart, Pie chart)
- Quick action buttons
- Real-time data updates

### ProductsPage
- Product grid view
- Search and filter functionality
- CRUD operations (Add, Edit, View)
- Stock level indicators

## 🔄 API Integration

### Axios Configuration
```tsx
// Example API call
const response = await axios.get('/api/products');
const products = response.data;
```

### Error Handling
```tsx
try {
  const response = await axios.post('/api/auth/login', credentials);
  if (response.data.success) {
    login(response.data.data.user, response.data.data.token);
  }
} catch (error) {
  toast.error('Login failed');
}
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
Create a `.env` file:
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=InventoryPro
```

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy!

## 🧪 Testing

The project is configured for testing with:
- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Playwright
- **Visual Tests**: Chromatic (optional)

Run tests:
```bash
npm run test:all
npm run test:performance
npm run test:accessibility
npm run test:visual
```

## 📦 Dependencies

### Core Dependencies
- `react` ^19.1.1
- `react-dom` ^19.1.1
- `react-router-dom` ^7.9.1
- `axios` ^1.12.2

### UI Dependencies
- `@heroicons/react` ^2.2.0
- `tailwindcss` ^4.1.13
- `@tailwindcss/vite` ^4.1.13
- `react-hot-toast` ^2.6.0

### Utility Dependencies
- `clsx` ^2.1.1
- `tailwind-merge` ^3.3.1
- `date-fns` ^4.1.0
- `zustand` ^5.0.8

## 🔧 Development

### Code Style
- ESLint configuration included
- TypeScript strict mode
- Prettier formatting (recommended)

### Git Hooks
- Pre-commit hooks for linting
- Pre-push hooks for type checking

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Contact the development team

---

**Built with ❤️ using Vite + React 19 + TypeScript**