// API Configuration
// Use Vite env var when present, or fallback to the backend port.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/sbpmns';

export default API_BASE_URL;
