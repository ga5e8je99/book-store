'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      setUser(null);
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    try {
      localStorage.setItem('currentUser', JSON.stringify(userData));
    } catch (e) {}
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('currentUser');
    } catch (e) {}
  };

  return (
    <AuthContext.Provider value={{ user, isClient, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

