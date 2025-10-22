'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

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
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'ADMIN' | 'HR' | 'PESO' | 'APPLICANT' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing Supabase session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // Map Supabase user to our User interface
          const mappedUser: User = {
            id: session.user.id,
            email: session.user.email || '',
            fullName: session.user.user_metadata?.full_name || session.user.email || 'User',
          };

          setUser(mappedUser);

          // Get role from user metadata or localStorage as fallback
          // TODO: Once database is set up, fetch role from users table
          const userRole = session.user.user_metadata?.role || localStorage.getItem('jobsync_role');
          if (userRole) {
            setRole(userRole as 'ADMIN' | 'HR' | 'PESO' | 'APPLICANT');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const mappedUser: User = {
          id: session.user.id,
          email: session.user.email || '',
          fullName: session.user.user_metadata?.full_name || session.user.email || 'User',
        };

        setUser(mappedUser);

        // Update role from metadata
        const userRole = session.user.user_metadata?.role || localStorage.getItem('jobsync_role');
        if (userRole) {
          setRole(userRole as 'ADMIN' | 'HR' | 'PESO' | 'APPLICANT');
        }
      } else {
        setUser(null);
        setRole(null);
        localStorage.removeItem('jobsync_role');
      }

      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, selectedRole: 'ADMIN' | 'HR' | 'PESO' | 'APPLICANT') => {
    try {
      // Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Map Supabase user to our User interface
        const mappedUser: User = {
          id: data.user.id,
          email: data.user.email || '',
          fullName: data.user.user_metadata?.full_name || data.user.email || 'User',
        };

        setUser(mappedUser);
        setRole(selectedRole);

        // Store role in localStorage as temporary solution
        // TODO: Once database schema is ready, fetch role from users table
        localStorage.setItem('jobsync_role', selectedRole);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Failed to login');
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setRole(null);
      localStorage.removeItem('jobsync_role');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
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
