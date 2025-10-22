'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  fullName: string;
}

interface AuthContextType {
  user: User | null;
  role: 'ADMIN' | 'HR' | 'PESO' | 'APPLICANT' | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: 'ADMIN' | 'HR' | 'PESO' | 'APPLICANT') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'ADMIN' | 'HR' | 'PESO' | 'APPLICANT' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('jobsync_user');
    const storedRole = localStorage.getItem('jobsync_role');

    if (storedUser && storedRole) {
      setUser(JSON.parse(storedUser));
      setRole(storedRole as 'ADMIN' | 'HR' | 'PESO' | 'APPLICANT');
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, selectedRole: 'ADMIN' | 'HR' | 'PESO' | 'APPLICANT') => {
    // Mock login - replace with actual API call
    const mockUser: User = {
      id: '1',
      email,
      fullName: 'Demo User'
    };

    setUser(mockUser);
    setRole(selectedRole);

    // Store in localStorage
    localStorage.setItem('jobsync_user', JSON.stringify(mockUser));
    localStorage.setItem('jobsync_role', selectedRole);
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem('jobsync_user');
    localStorage.removeItem('jobsync_role');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
