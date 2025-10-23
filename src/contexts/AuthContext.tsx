'use client';
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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

  // Track component mount state to prevent state updates after unmount
  const isMounted = useRef(true);
  // Track if auth listener has been initialized
  const listenerInitialized = useRef(false);
  const fetchingProfile = useRef(false);
  // Timeout to prevent infinite loading
  const loadingTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isMounted.current = true;

    // Skip if already initialized (React 19 Strict Mode protection)
    if (listenerInitialized.current) {
      console.log('⏭️ Auth listener already initialized, skipping...');
      return;
    }

    console.log('🔄 Setting up auth state listener...');
    listenerInitialized.current = true;

    // Safety timeout: If loading takes more than 10 seconds, force it to complete
    loadingTimeout.current = setTimeout(() => {
      if (isMounted.current && isLoading) {
        console.warn('⚠️ Auth loading timeout - forcing loading to false');
        setIsLoading(false);
      }
    }, 10000);

    /**
     * Listen for auth state changes (login, logout, token refresh)
     * This fires immediately with the current session state on subscription
     * No need for separate initialization
     */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Clear timeout when auth state changes
      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current);
        loadingTimeout.current = null;
      }

      // Prevent duplicate profile fetches
      if (fetchingProfile.current) {
        console.log('⏭️ Already fetching profile, waiting...');
        return;
      }

      console.log('🔔 Auth state changed:', {
        event,
        userId: session?.user?.id,
        email: session?.user?.email
      });

      if (session?.user) {
        fetchingProfile.current = true;
        try {
          // Fetch user profile directly from database
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .eq('status', 'active')
            .single();

          if (profileError || !profile) {
            console.warn('⚠️ Profile not found or inactive:', profileError?.message);
            if (isMounted.current) {
              setUser(null);
              setRole(null);
            }
          } else {
            const mappedUser: User = {
              id: profile.id,
              email: profile.email || session.user.email || '',
              fullName: profile.full_name,
            };

            if (isMounted.current) {
              setUser(mappedUser);
              setRole(profile.role as 'ADMIN' | 'HR' | 'PESO' | 'APPLICANT');
              console.log('✨ User state updated:', {
                email: mappedUser.email,
                role: profile.role
              });
            }
          }
        } catch (error) {
          console.error('❌ Error fetching profile:', error);
          if (isMounted.current) {
            setUser(null);
            setRole(null);
          }
        } finally {
          fetchingProfile.current = false;
          if (isMounted.current) {
            setIsLoading(false);
          }
        }
      } else {
        console.log('ℹ️ No session, clearing user state');
        if (isMounted.current) {
          setUser(null);
          setRole(null);
          setIsLoading(false);
        }
      }
    });

    return () => {
      console.log('🧹 Cleaning up auth listener...');
      isMounted.current = false;
      subscription.unsubscribe();

      // Clear timeout on cleanup
      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current);
        loadingTimeout.current = null;
      }

      // Reset initialization flag on cleanup to allow fresh setup on remount
      listenerInitialized.current = false;
      fetchingProfile.current = false;
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
