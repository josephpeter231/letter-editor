import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const API_URL = "https://letter-editor-backend.onrender.com/api";

const AuthContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

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
        
        navigate(location.pathname, { replace: true });
        setIsAuthenticated(true);
      }
    };
    
    checkAuthFromURL();
  }, [location, navigate]);

  useEffect(() => {
    const verifyExistingToken = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setLoading(false);
          return;
        }
        
        const response = await axios.get(`${API_URL}/auth/verify-token`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setIsAuthenticated(true);
        console.log("Token verified successfully");
      } catch (error) {
        console.error("Token verification failed:", error.message);
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
      await axios.get(`${API_URL}/auth/logout`);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
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

  const getAuthAxios = () => {
    const authAxios = axios.create({
      baseURL: API_URL
    });
    
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
    
    authAxios.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const newToken = await refreshToken();
            if (newToken) {
              originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
              return authAxios(originalRequest);
            } else {
              setIsAuthenticated(false);
              navigate('/');
              return Promise.reject(error);
            }
          } catch (refreshError) {
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
