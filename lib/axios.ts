import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 180000, // Increased timeout to 180 seconds for vector processing
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
  // Retry configuration
  validateStatus: function (status) {
    return status >= 200 && status < 300; // Default success status
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
   (config) => { 
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Check if current user is admin before redirecting
    const getCurrentUser = () => {
      try {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
      } catch {
        return null;
      }
    };

    const currentUser = getCurrentUser();
    const isAdmin = currentUser?.role === 'admin';

    // Handle 401 errors (but NEVER redirect admins unless token is completely invalid)
    if (error.response?.status === 401) {
      // For admins, be very strict about when to redirect
      if (isAdmin) {
        // Only redirect admin if it's a critical token issue
        const criticalErrors = ['Access token is required', 'Invalid token', 'Token expired', 'User not found'];
        const errorMessage = error.response?.data?.error || '';
        
        if (criticalErrors.includes(errorMessage)) {
          console.log('Admin token is invalid, redirecting to signin');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/signin';
        } else {
          // For other 401 errors, just log and continue - don't redirect admin
          console.log('Admin encountered 401 error but staying logged in:', errorMessage);
        }
      } else {
        // For non-admin users, redirect on any 401
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/signin';
      }
    }
    
    // Handle disabled user account (but never redirect admins)
    if (error.response?.status === 403 && error.response?.data?.errorType === 'ACCOUNT_DISABLED' && !isAdmin) {
      // Clear user data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Trigger custom event for disabled account
      if (typeof window !== 'undefined') {
        const disabledAccountEvent = new CustomEvent('disabledAccount', {
          detail: {
            message: error.response.data.error || "You can't access the dashboard page, please contact admin",
            redirectTo: error.response.data.redirectTo || '/signin'
          }
        });
        window.dispatchEvent(disabledAccountEvent);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;