
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for demo
const mockUser: User = {
  id: 'user123',
  email: 'demo@example.com',
  displayName: 'Demo User',
  photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
};

export const AuthProvider: React.FC<{children: React.ReactNode;}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking auth state
    const checkAuth = () => {
      const savedUser = localStorage.getItem('auth_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setIsLoading(false);
    };

    setTimeout(checkAuth, 1000);
  }, []);

  const signIn = async () => {
    setIsLoading(true);
    // Simulate Google Sign-In
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setUser(mockUser);
    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }} data-id="1qsuxkq4i" data-path="src/contexts/AuthContext.tsx">
      {children}
    </AuthContext.Provider>);

};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};