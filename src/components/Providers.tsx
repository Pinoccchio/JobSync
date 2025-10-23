'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { RealtimeProvider } from '@/contexts/RealtimeContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <RealtimeProvider>
          {children}
        </RealtimeProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
