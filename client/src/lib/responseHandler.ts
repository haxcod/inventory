/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ApiError } from './errorHandler';
import { handleApiError, handleApiSuccess } from './errorHandler';

export interface ProcessedResponse<T = any> {
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

export class ResponseHandler {
  static process<T = any>(
    response: any, 
    successMessage?: string,
    showSuccessToast: boolean = true
  ): ProcessedResponse<T> {
    try {
      // Check if response has the expected structure
      if (!response || !response.data) {
        throw new Error('Invalid response structure');
      }

      const { data } = response;

      // Handle successful response
      if (data.success) {
        if (successMessage && showSuccessToast) {
          handleApiSuccess(successMessage);
        }

        return {
          success: true,
          data: data.data,
          message: data.message || successMessage,
          pagination: data.pagination
        };
      }

      // Handle API error response
      throw new Error(data.message || 'Request failed');

    } catch (error) {
      const apiError = handleApiError(error, true);
      return {
        success: false,
        error: apiError
      };
    }
  }

  static processList<T = any>(
    response: any,
    successMessage?: string,
    showSuccessToast: boolean = false
  ): ProcessedResponse<T[]> {
    const processed = ResponseHandler.process<T[]>(response, successMessage, showSuccessToast);
    
    // Ensure data is always an array for list responses
    if (processed.success && !Array.isArray(processed.data)) {
      processed.data = [];
    }

    return processed;
  }

  static processCreate<T = any>(
    response: any,
    itemName: string = 'Item'
  ): ProcessedResponse<T> {
    return ResponseHandler.process<T>(
      response, 
      `${itemName} created successfully`,
      true
    );
  }

  static processUpdate<T = any>(
    response: any,
    itemName: string = 'Item'
  ): ProcessedResponse<T> {
    return ResponseHandler.process<T>(
      response, 
      `${itemName} updated successfully`,
      true
    );
  }

  static processDelete(
    response: any,
    itemName: string = 'Item'
  ): ProcessedResponse {
    return ResponseHandler.process(
      response, 
      `${itemName} deleted successfully`,
      true
    );
  }

  static processLogin<T = any>(
    response: any
  ): ProcessedResponse<T> {
    return ResponseHandler.process<T>(
      response, 
      'Login successful',
      true
    );
  }

  static processLogout(
    response: any
  ): ProcessedResponse {
    return ResponseHandler.process(
      response, 
      'Logged out successfully',
      true
    );
  }
}

// Convenience functions
export const processApiResponse = ResponseHandler.process;
export const processApiList = ResponseHandler.processList;
export const processApiCreate = ResponseHandler.processCreate;
export const processApiUpdate = ResponseHandler.processUpdate;
export const processApiDelete = ResponseHandler.processDelete;
export const processApiLogin = ResponseHandler.processLogin;
export const processApiLogout = ResponseHandler.processLogout;
