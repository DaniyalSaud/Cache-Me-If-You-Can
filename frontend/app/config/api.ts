// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // User endpoints
  REGISTER: `${API_BASE_URL}/api/v/users/register`,
  LOGIN: `${API_BASE_URL}/api/v/users/login`,
  LOGOUT: `${API_BASE_URL}/api/v/users/logout`,
  REFRESH_TOKEN: `${API_BASE_URL}/api/v/users/refresh-token`,
  CHANGE_PASSWORD: `${API_BASE_URL}/api/v/users/change-password`,
  CURRENT_USER: `${API_BASE_URL}/api/v/users/current-user`,
  UPDATE_ACCOUNT: `${API_BASE_URL}/api/v/users/update-account`,
  
  // Product endpoints
  PRODUCTS: `${API_BASE_URL}/api/v/products`,
  
  // Order endpoints
  ORDERS: `${API_BASE_URL}/api/v/orders`,
  
  // Payment endpoints
  PAYMENT: `${API_BASE_URL}/api/v/payments`,
  EASYPAISA_NUMBER: `${API_BASE_URL}/api/v/payments/easypaisa-number`,
  
  // Admin endpoints
  ADMIN: `${API_BASE_URL}/api/v/admins`,
  
  // Tools endpoints
  TOOLS: `${API_BASE_URL}/api/v/tools`,
  WASTE_REPORT: `${API_BASE_URL}/api/v/tools/waste/report`,
  ASK_SARDAR_G: `${API_BASE_URL}/api/v/tools/ask`,
  
  // Loan endpoints
  LOANS: `${API_BASE_URL}/api/v/loans`,
  
  // Seller endpoints
  SELLERS: `${API_BASE_URL}/api/v/sellers`,
};

// API helper functions
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const defaultOptions: RequestInit = {
    credentials: 'include', // Include cookies in requests
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server is not responding properly. Please check if the backend is running.');
    }

    const data = await response.json();

    if (!response.ok) {
      // Extract error message from backend response
      const errorMessage = data.message || data.error || 'An error occurred';
      throw new Error(errorMessage);
    }

    return data;
  } catch (error: any) {
    // Handle network errors or JSON parse errors
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Cannot connect to server. Please ensure the backend is running on port 8000.');
    }
    // Re-throw the error with the original message
    throw error;
  }
};
