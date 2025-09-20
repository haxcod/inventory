import toast from 'react-hot-toast';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
}

export class ApiErrorHandler {
  static handle(error: any): ApiError {
    console.error('API Error:', error);

    // Network error
    if (!error.response) {
      return {
        message: 'Network error. Please check your internet connection.',
        status: 0,
        code: 'NETWORK_ERROR'
      };
    }

    // HTTP error response
    const { status, data } = error.response;
    let message = 'An unexpected error occurred';

    // Handle different HTTP status codes
    switch (status) {
      case 400:
        message = data?.message || 'Bad request. Please check your input.';
        break;
      case 401:
        message = 'Authentication required. Please log in again.';
        break;
      case 403:
        message = 'Access denied. You do not have permission to perform this action.';
        break;
      case 404:
        message = 'Resource not found.';
        break;
      case 409:
        message = data?.message || 'Conflict. The resource already exists.';
        break;
      case 422:
        message = data?.message || 'Validation error. Please check your input.';
        break;
      case 429:
        message = 'Too many requests. Please try again later.';
        break;
      case 500:
        message = 'Internal server error. Please try again later.';
        break;
      case 502:
        message = 'Service temporarily unavailable. Please try again later.';
        break;
      case 503:
        message = 'Service unavailable. Please try again later.';
        break;
      default:
        message = data?.message || `Error ${status}: ${error.message}`;
    }

    return {
      message,
      status,
      code: data?.code || 'UNKNOWN_ERROR',
      details: data
    };
  }

  static showError(error: ApiError, showToast: boolean = true) {
    if (showToast) {
      toast.error(error.message);
    }
    return error;
  }

  static showSuccess(message: string, showToast: boolean = true) {
    if (showToast) {
      toast.success(message);
    }
  }

  static showWarning(message: string, showToast: boolean = true) {
    if (showToast) {
      toast(message, {
        icon: '⚠️',
        style: {
          background: '#fbbf24',
          color: '#1f2937'
        }
      });
    }
  }

  static showInfo(message: string, showToast: boolean = true) {
    if (showToast) {
      toast(message, {
        icon: 'ℹ️',
        style: {
          background: '#3b82f6',
          color: 'white'
        }
      });
    }
  }
}

export const handleApiError = (error: any, showToast: boolean = true): ApiError => {
  const apiError = ApiErrorHandler.handle(error);
  return ApiErrorHandler.showError(apiError, showToast);
};

export const handleApiSuccess = (message: string, showToast: boolean = true): void => {
  ApiErrorHandler.showSuccess(message, showToast);
};

export const handleApiWarning = (message: string, showToast: boolean = true): void => {
  ApiErrorHandler.showWarning(message, showToast);
};

export const handleApiInfo = (message: string, showToast: boolean = true): void => {
  ApiErrorHandler.showInfo(message, showToast);
};
