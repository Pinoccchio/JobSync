'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, loginUser, getCurrentSession, signOut as authSignOut } from '@/lib/supabase/auth';
import type { User as SupabaseUser } from '@supabase/supabase-js';

/**
 * User interface for the application
 */
interface User {
  id: string;
  email: string;
  fullName: string;
}

/**
 * Auth context interface
 * Provides authentication state and methods to all components
 */
interface AuthContextType {
  user: User | null;
  role: 'ADMIN' | 'HR' | 'PESO' | 'APPLICANT' | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'ADMIN' | 'HR' | 'PESO' | 'APPLICANT' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    /**
     * Initialize authentication on mount
     * Checks for existing session using auth.ts getCurrentSession()
     */
    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing authentication...');

        // Use auth.ts getCurrentSession() function
        const result = await getCurrentSession();

        if (result.success && result.data) {
          // Session exists and is valid
          const mappedUser: User = {
            id: result.data.profile.id,
            email: result.data.profile.email,
            fullName: result.data.profile.fullName,
          };

          setUser(mappedUser);
          setRole(result.data.profile.role);
          console.log('✨ User authenticated:', {
            email: mappedUser.email,
            role: result.data.profile.role
          });
        } else {
          console.log('ℹ️ No active session:', result.error);
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
      } finally {
        setIsLoading(false);
        console.log('✅ Auth initialization complete');
      }
    };

    initializeAuth();

    /**
     * Listen for auth state changes (login, logout, token refresh)
     * When Supabase auth state changes, update our local state
     */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth state changed:', {
        event,
        userId: session?.user?.id,
        email: session?.user?.email
      });

      if (session?.user) {
        // Use getCurrentSession to get profile data
        const result = await getCurrentSession();

        if (result.success && result.data) {
          const mappedUser: User = {
            id: result.data.profile.id,
            email: result.data.profile.email,
            fullName: result.data.profile.fullName,
          };

          setUser(mappedUser);
          setRole(result.data.profile.role);
          console.log('✨ User state updated:', {
            email: mappedUser.email,
            role: result.data.profile.role
          });
        } else {
          // Profile not found or inactive, clear auth state
          console.warn('⚠️ Profile validation failed:', result.error);
          setUser(null);
          setRole(null);
        }
      } else {
        console.log('ℹ️ No session, clearing user state');
        setUser(null);
        setRole(null);
      }

      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Login function - uses auth.ts loginUser()
   * Handles authentication and profile fetching
   */
  const login = async (email: string, password: string) => {
    try {
      // Use auth.ts loginUser function
      const result = await loginUser({ email, password });

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Login failed');
      }

      // Set user and role in context state
      const mappedUser: User = {
        id: result.data.profile.id,
        email: result.data.profile.email,
        fullName: result.data.profile.fullName,
      };

      setUser(mappedUser);
      setRole(result.data.profile.role);

      console.log('✨ Login successful in context:', {
        email: mappedUser.email,
        role: result.data.profile.role,
        fullName: mappedUser.fullName
      });
    } catch (error: any) {
      console.error('❌ Login error in context:', error);
      throw new Error(error.message || 'Failed to login');
    }
  };

  /**
   * Logout function - uses auth.ts signOut()
   * Clears session and local state
   */
  const logout = async () => {
    try {
      // Use auth.ts signOut function
      const result = await authSignOut();

      if (!result.success) {
        throw new Error(result.error || 'Logout failed');
      }

      // Clear local state
      setUser(null);
      setRole(null);

      console.log('✅ Logout successful in context');
    } catch (error: any) {
      console.error('❌ Logout error in context:', error);
      throw new Error(error.message || 'Logout failed');
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
