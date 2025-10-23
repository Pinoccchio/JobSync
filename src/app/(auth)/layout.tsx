'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [showTimeout, setShowTimeout] = useState(false);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Wait for auth to initialize
    if (isLoading) {
      // Set timeout to show "taking longer than expected" message
      loadingTimeoutRef.current = setTimeout(() => {
        setShowTimeout(true);
      }, 5000);

      return () => {
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }
      };
    }

    // Clear loading timeout when auth completes
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      setShowTimeout(false);
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      // Small delay to allow auth state to settle
      redirectTimeoutRef.current = setTimeout(() => {
        console.log('🔄 Redirecting to login...');
        router.push('/login');
      }, 100);
    }

    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#22A555] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
          {showTimeout && (
            <div className="mt-4">
              <p className="text-sm text-gray-500">Taking longer than expected...</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 text-sm bg-[#22A555] text-white rounded-lg hover:bg-[#1d8f4a] transition-colors"
              >
                Reload Page
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Don't render protected content if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
