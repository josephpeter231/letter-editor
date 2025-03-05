import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

// API base URL
const API_URL = "https://letter-editor-backend.onrender.com/api";

// Create the auth context
const AuthContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Provider component that wraps your app and makes auth object available to any child component that calls useAuth()
export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Parse tokens from URL on redirect from OAuth
  useEffect(() => {
    const checkAuthFromURL = () => {
      const params = new URLSearchParams(location.search);
      const accessToken = params.get('accessToken');
      const refreshToken = params.get('refreshToken');
      
      if (accessToken) {
        console.log("Received auth tokens from redirect");
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        
        // Remove tokens from URL for security
        navigate(location.pathname, { replace: true });
        setIsAuthenticated(true);
      }
    };
    
    checkAuthFromURL();
  }, [location, navigate]);

  // Check if user is authenticated on app load
  useEffect(() => {
    const verifyExistingToken = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setLoading(false);
          return;
        }
        
        // Verify token with backend
        const response = await axios.get(`${API_URL}/auth/verify-token`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setIsAuthenticated(true);
        console.log("Token verified successfully");
      } catch (error) {
        console.error("Token verification failed:", error.message);
        // Clear invalid tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
      }
    };
    
    verifyExistingToken();
  }, []);

  // Login function to redirect to Google OAuth
  const login = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout API
      await axios.get(`${API_URL}/auth/logout`);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setIsAuthenticated(false);
      setUser(null);
      navigate('/');
    }
  };

  // Function to refresh token
  const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      setIsAuthenticated(false);
      return null;
    }
    
    try {
      const response = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
      const newAccessToken = response.data.accessToken;
      localStorage.setItem('accessToken', newAccessToken);
      return newAccessToken;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      setIsAuthenticated(false);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return null;
    }
  };

  // Create authenticated axios instance with token refresh
  const getAuthAxios = () => {
    const authAxios = axios.create({
      baseURL: API_URL
    });
    
    // Add auth header to requests
    authAxios.interceptors.request.use(
      config => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );
    
    // Handle 401 responses by refreshing token
    authAxios.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;
        
        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            // Try refreshing token
            const newToken = await refreshToken();
            if (newToken) {
              // Update auth header and retry
              originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
              return authAxios(originalRequest);
            } else {
              // If refresh failed, go to login
              setIsAuthenticated(false);
              navigate('/');
              return Promise.reject(error);
            }
          } catch (refreshError) {
            // If refresh throws, go to login
            setIsAuthenticated(false);
            navigate('/');
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
    
    return authAxios;
  };

  // Context value
  const contextValue = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    getAuthAxios
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
