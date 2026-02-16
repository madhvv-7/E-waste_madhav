import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { setAuthToken } from './api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setAuthToken(savedToken);
    }

    setLoading(false);
  }, []);

  const login = (data) => {
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setAuthToken(data.token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthToken(null);
    // Redirect to home to avoid landing on protected routes
    try {
      navigate('/', { replace: true });
    } catch (err) {
      // navigate may not be available in some contexts; ignore if so
      // but generally it will redirect to home
    }
  };

  const register = async (values) => {
    const res = await api.post('/auth/register', values);
    
    // If account is pending approval, return without login (no token)
    if (res.data.pending) {
      return res.data; // Return the response for the component to handle
    }
    
    // Active account (user role): login immediately
    login(res.data);
    return res.data;
  };

  const loginRequest = async (values) => {
    const res = await api.post('/auth/login', values);
    login(res.data);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, loginRequest, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


