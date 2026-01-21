import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
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
            } else {
              logout();
            }
          } else {
            logout();
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Check for Google OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userParam = urlParams.get('user');
    
    if (token) {
      try {
        const user = userParam ? JSON.parse(decodeURIComponent(userParam)) : null;
        localStorage.setItem('token', token);
        setToken(token);
        setUser(user);
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
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
    window.location.href = 'http://localhost:8000/api/auth/google';
  };

  const logout = async () => {
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
    
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

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
    loading,
    login,
    register,
    googleLogin,
    logout,
    saveTransactions,
    getCalculations,
    loadCalculation,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};