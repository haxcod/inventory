# Frontend API Integration Guide

This guide explains how to properly connect to APIs, handle responses, and manage errors in the frontend application.

## 🚀 **Enhanced API Service**

### **Key Improvements:**

1. **Centralized Error Handling** - All API errors are processed consistently
2. **Response Processing** - Standardized response handling across all endpoints
3. **Loading States** - Built-in loading state management
4. **Type Safety** - Full TypeScript support with proper typing
5. **Debugging** - Comprehensive logging in development mode

## 📁 **File Structure**

```
client/src/
├── lib/
│   ├── api.ts                 # Enhanced API service
│   ├── errorHandler.ts        # Centralized error handling
│   └── responseHandler.ts     # Response processing utilities
├── hooks/
│   └── useApi.ts             # Custom API hooks
├── types/
│   └── axios.d.ts            # Axios type extensions
└── pages/
    └── PaymentsPageEnhanced.tsx  # Example implementation
```

## 🔧 **Core Components**

### **1. Error Handler (`lib/errorHandler.ts`)**

Handles all API errors with consistent messaging and user feedback.

```typescript
import { handleApiError, handleApiSuccess } from '../lib/errorHandler';

// Handle errors with automatic toast notifications
try {
  const response = await apiService.products.create(productData);
} catch (error) {
  const apiError = handleApiError(error, true); // Shows toast
  console.error('Product creation failed:', apiError);
}
```

**Features:**
- HTTP status code handling (400, 401, 403, 404, 500, etc.)
- Network error detection
- Automatic toast notifications
- Consistent error message formatting

### **2. Response Handler (`lib/responseHandler.ts`)**

Processes API responses with standardized structure.

```typescript
import { processApiResponse, processApiCreate } from '../lib/responseHandler';

// Process any API response
const processedResponse = processApiResponse(response, 'Success message');

// Process specific operations
const createResponse = processApiCreate(response, 'Product');
```

**Response Structure:**
```typescript
interface ProcessedResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
```

### **3. API Hooks (`hooks/useApi.ts`)**

Custom hooks for different API operations with built-in state management.

```typescript
import { useApi, useApiList, useApiCreate } from '../hooks/useApi';

// List data with loading states
const {
  data: products,
  loading: isLoading,
  error: productsError,
  execute: fetchProducts
} = useApiList<Product>(apiService.products.getAll, {
  onSuccess: (data) => console.log('Products loaded:', data),
  onError: (error) => console.error('Failed to load products:', error)
});

// Create with automatic success handling
const {
  execute: createProduct,
  loading: isCreating
} = useApiCreate<Product>(apiService.products.create, {
  onSuccess: (data) => {
    console.log('Product created:', data);
    fetchProducts(); // Refresh list
  },
  itemName: 'Product'
});
```

## 🎯 **Usage Examples**

### **1. Basic API Call with Error Handling**

```typescript
import { apiService } from '../lib/api';
import { processApiResponse } from '../lib/responseHandler';
import { handleApiError } from '../lib/errorHandler';

const handleGetProducts = async () => {
  try {
    const response = await apiService.products.getAll();
    const processed = processApiResponse(response);
    
    if (processed.success) {
      setProducts(processed.data);
    } else {
      throw new Error(processed.error?.message || 'Failed to load products');
    }
  } catch (error) {
    const apiError = handleApiError(error, true);
    console.error('Error:', apiError);
  }
};
```

### **2. Using API Hooks (Recommended)**

```typescript
import { useApiList, useApiCreate } from '../hooks/useApi';

function ProductsPage() {
  const {
    data: products,
    loading: isLoading,
    error: productsError,
    execute: fetchProducts
  } = useApiList<Product>(apiService.products.getAll);

  const {
    execute: createProduct,
    loading: isCreating
  } = useApiCreate<Product>(apiService.products.create, {
    onSuccess: () => fetchProducts(), // Refresh after create
    itemName: 'Product'
  });

  const handleCreate = async (productData: Product) => {
    await createProduct(productData);
  };

  if (isLoading) return <LoadingSpinner />;
  if (productsError) return <ErrorMessage error={productsError} />;

  return (
    <div>
      {products?.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### **3. Form Submission with Loading States**

```typescript
const {
  execute: createPayment,
  loading: isCreating
} = useApiCreate<Payment>(apiService.payments.create, {
  onSuccess: (data) => {
    setShowModal(false);
    resetForm();
    fetchPayments(); // Refresh list
  },
  itemName: 'Payment'
});

const handleSubmit = async (formData: PaymentFormData) => {
  await createPayment(formData);
};

return (
  <form onSubmit={handleSubmit}>
    {/* Form fields */}
    <Button 
      type="submit" 
      disabled={isCreating}
      className="w-full"
    >
      {isCreating ? 'Creating...' : 'Create Payment'}
    </Button>
  </form>
);
```

## 🔍 **Error Handling Patterns**

### **1. Network Errors**
```typescript
// Automatically handled by errorHandler
// Shows: "Network error. Please check your internet connection."
```

### **2. Authentication Errors**
```typescript
// Automatically handled by axios interceptor
// Redirects to login page and clears auth data
```

### **3. Validation Errors**
```typescript
// Shows specific validation messages from backend
// Example: "Email is required", "Password must be at least 8 characters"
```

### **4. Permission Errors**
```typescript
// Shows: "Access denied. You do not have permission to perform this action."
```

## 📊 **Loading States**

### **Global Loading**
```typescript
const { loading: isLoading } = useApi(apiService.products.getAll);

if (isLoading) {
  return <LoadingSpinner />;
}
```

### **Action Loading**
```typescript
const { execute: deleteProduct, loading: isDeleting } = useApiDelete(
  apiService.products.delete
);

<Button 
  onClick={() => deleteProduct(productId)}
  disabled={isDeleting}
>
  {isDeleting ? 'Deleting...' : 'Delete'}
</Button>
```

## 🎨 **User Feedback**

### **Success Messages**
```typescript
// Automatic success toasts
const createResponse = processApiCreate(response, 'Product');
// Shows: "Product created successfully"
```

### **Error Messages**
```typescript
// Automatic error toasts
const apiError = handleApiError(error, true);
// Shows appropriate error message based on error type
```

### **Custom Messages**
```typescript
import { handleApiSuccess, handleApiWarning } from '../lib/errorHandler';

handleApiSuccess('Custom success message');
handleApiWarning('Custom warning message');
```

## 🔧 **Configuration**

### **Environment Variables**
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### **Axios Configuration**
```typescript
// Automatically configured in api.ts
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
axios.defaults.timeout = 30000; // 30 seconds
axios.defaults.headers.common['Content-Type'] = 'application/json';
```

## 🐛 **Debugging**

### **Development Logging**
In development mode, all API requests and responses are logged:

```
🚀 API Request: POST /api/products
✅ API Response: POST /api/products (201) - 245ms
❌ API Error: GET /api/products (500) - 1200ms
```

### **Error Details**
```typescript
// Log detailed error information
console.error('API Error Details:', {
  message: error.message,
  status: error.status,
  code: error.code,
  details: error.details
});
```

## 📝 **Best Practices**

### **1. Always Use API Hooks**
```typescript
// ✅ Good
const { data, loading, error, execute } = useApiList(apiService.products.getAll);

// ❌ Avoid
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);
// Manual state management
```

### **2. Handle All Error States**
```typescript
// ✅ Good
if (error) {
  return <ErrorMessage error={error} onRetry={fetchData} />;
}

// ❌ Avoid
// Ignoring error states
```

### **3. Provide User Feedback**
```typescript
// ✅ Good
const { execute: createItem, loading } = useApiCreate(apiService.items.create, {
  onSuccess: () => showSuccess('Item created successfully'),
  onError: (error) => showError(`Failed to create item: ${error}`)
});

// ❌ Avoid
// Silent operations without feedback
```

### **4. Use Proper Loading States**
```typescript
// ✅ Good
<Button disabled={loading}>
  {loading ? 'Creating...' : 'Create'}
</Button>

// ❌ Avoid
<Button>Create</Button> // No loading indication
```

## 🚀 **Migration Guide**

### **From Old API Calls**
```typescript
// Old way
const handleCreate = async () => {
  try {
    const response = await apiService.products.create(data);
    if (response.data.success) {
      toast.success('Product created');
      fetchProducts();
    }
  } catch (error) {
    toast.error('Error creating product');
  }
};

// New way
const { execute: createProduct } = useApiCreate(apiService.products.create, {
  onSuccess: () => fetchProducts(),
  itemName: 'Product'
});

const handleCreate = () => createProduct(data);
```

## 🎯 **Summary**

The enhanced API integration provides:

- ✅ **Consistent Error Handling** - All errors handled uniformly
- ✅ **Better User Experience** - Loading states and feedback
- ✅ **Type Safety** - Full TypeScript support
- ✅ **Developer Experience** - Easy-to-use hooks and utilities
- ✅ **Debugging** - Comprehensive logging and error details
- ✅ **Maintainability** - Centralized error and response handling

This approach ensures robust, user-friendly API integration throughout the application.
