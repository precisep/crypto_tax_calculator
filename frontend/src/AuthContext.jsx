import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Initialize from localStorage on app start
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);

  // Check authentication status
  const checkAuth = useCallback(async (authToken = null) => {
    const storedToken = authToken || localStorage.getItem('token');
    if (!storedToken) {
      setLoading(false);
      return false;
    }

    try {
      const response = await fetch('http://localhost:8000/api/user', {
        headers: {
          'Authorization': `Bearer ${storedToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          setToken(storedToken);
          localStorage.setItem('token', storedToken);
          localStorage.setItem('user', JSON.stringify(data.user));
          setLoading(false);
          return true;
        }
      }
      // If auth fails, clear everything
      logout();
      return false;
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
      return false;
    }
  }, []);

  // Initial auth check on mount
  useEffect(() => {
    const initAuth = async () => {
      // Check for OAuth callback parameters first
      const urlParams = new URLSearchParams(window.location.search);
      const tokenParam = urlParams.get('token');
      const userParam = urlParams.get('user');
      
      if (tokenParam) {
        // This is an OAuth callback
        await handleOAuthCallback(tokenParam, userParam);
      } else {
        // Normal initialization - check existing auth
        await checkAuth();
      }
    };
    
    initAuth();
  }, [checkAuth]);

  // Handle OAuth callback
  const handleOAuthCallback = async (tokenParam, userParam) => {
    setIsProcessingOAuth(true);
    try {
      // Decode and parse user data if available
      let userData = null;
      if (userParam) {
        try {
          userData = JSON.parse(decodeURIComponent(userParam));
        } catch (e) {
          console.error('Failed to parse user data:', e);
        }
      }
      
      // Store token and user data
      localStorage.setItem('token', tokenParam);
      setToken(tokenParam);
      
      if (userData) {
        // Use user data from OAuth response
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        // Fetch user data from API
        await checkAuth(tokenParam);
      }
      
      // Clear URL parameters WITHOUT reloading
      if (window.history.replaceState) {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
      
      // Notify that we're logged in
      window.dispatchEvent(new Event('auth-change'));
      
    } catch (e) {
      console.error('Error processing OAuth callback:', e);
    } finally {
      setIsProcessingOAuth(false);
      setLoading(false);
    }
  };

  // Sync token changes with localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  // Sync user changes with localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Listen for auth changes (for OAuth callback)
  useEffect(() => {
    const handleAuthChange = () => {
      // Force a re-render when auth changes
      setUser(JSON.parse(localStorage.getItem('user') || 'null'));
      setToken(localStorage.getItem('token'));
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  };

  const googleLogin = () => {
    // Store the current path to potentially return to it
    const returnPath = window.location.pathname + window.location.search;
    localStorage.setItem('returnPath', returnPath);
    
    // Redirect to Google OAuth
    window.location.href = 'http://localhost:8000/api/auth/google';
  };

  const logout = useCallback(async () => {
    if (token) {
      try {
        await fetch('http://localhost:8000/api/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    // Clear all auth state
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('returnPath');
    setToken(null);
    setUser(null);
    
    // Dispatch auth change event
    window.dispatchEvent(new Event('auth-change'));
  }, [token]);

  const saveTransactions = async (transactions, name) => {
    try {
      const response = await fetch('http://localhost:8000/api/save-transactions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactions, name }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, message: 'Failed to save transactions' };
    }
  };

  const getCalculations = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/calculations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, message: 'Failed to load calculations' };
    }
  };

  const loadCalculation = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/calculations/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, message: 'Failed to load calculation' };
    }
  };

  const value = {
    user,
    token,
    loading: loading || isProcessingOAuth,
    isProcessingOAuth,
    login,
    register,
    googleLogin,
    logout,
    saveTransactions,
    getCalculations,
    loadCalculation,
    refreshAuth: () => checkAuth(token),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};