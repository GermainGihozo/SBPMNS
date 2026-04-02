import API_BASE_URL from './config';

/**
 * Make API call with automatic token handling and error management
 */
export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle token expiration
    if (response.status === 403 && token) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Handle API errors consistently
 */
export const handleApiError = (error) => {
  if (error.message === 'Session expired. Please login again.') {
    return 'Your session has expired. Please login again.';
  }
  return error.message || 'An error occurred';
};
