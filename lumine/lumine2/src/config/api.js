export const getApiBaseUrl = () => {
    // 1. Explicit Vercel / Production Environment Variable
    if (import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL.trim() !== '') {
        return import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
    }
    
    // 2. Local Development Fallback
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return 'http://localhost:5000';
    }

    // 3. Deployed Production Default Fallback (Render Web Service)
    return 'https://lumine-backend.onrender.com';
};

export const API_BASE_URL = getApiBaseUrl();
export default API_BASE_URL;
