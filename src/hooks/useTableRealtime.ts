'use client';
import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/auth';
import { useAuth } from '@/contexts/AuthContext';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Reusable hook for real-time table subscriptions
 *
 * @param tableName - The table to subscribe to (e.g., 'jobs', 'applications')
 * @param events - Array of events to listen for ('INSERT', 'UPDATE', 'DELETE', or '*' for all)
 * @param filter - Optional filter (e.g., 'applicant_id=eq.uuid')
 * @param onEvent - Callback function when event occurs
 * @param enabled - Whether subscription is active (default: true)
 *
 * @example
 * // Subscribe to all job updates
 * useTableRealtime('jobs', ['INSERT', 'UPDATE'], null, () => refetchJobs());
 *
 * // Subscribe to user's own applications
 * useTableRealtime('applications', ['UPDATE'], `applicant_id=eq.${user.id}`, handleUpdate);
 *
 * // Subscribe to all events on a table
 * useTableRealtime('notifications', ['*'], `user_id=eq.${user.id}`, refetch);
 */
export function useTableRealtime(
  tableName: string,
  events: ('INSERT' | 'UPDATE' | 'DELETE' | '*')[] = ['*'],
  filter?: string | null,
  onEvent?: (payload: any) => void,
  enabled: boolean = true
) {
  const { isAuthenticated } = useAuth();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const subscriptionInitialized = useRef(false);

  // Use refs to store unstable dependencies and prevent infinite re-subscriptions
  const onEventRef = useRef(onEvent);
  const eventsRef = useRef(events);

  // Update refs when values change
  useEffect(() => {
    onEventRef.current = onEvent;
    eventsRef.current = events;
  }, [onEvent, events]);

  useEffect(() => {
    // Only subscribe if authenticated, enabled, and not already subscribed
    if (!isAuthenticated || !enabled || subscriptionInitialized.current) {
      return;
    }

    console.log(`🔄 Setting up real-time subscription for ${tableName}`, { events: eventsRef.current, filter });
    subscriptionInitialized.current = true;

    // Generate unique channel name
    const channelName = `${tableName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    let channel = supabase.channel(channelName);

    // Subscribe to each event type using stable refs
    eventsRef.current.forEach(event => {
      channel = channel.on(
        'postgres_changes',
        {
          event: event,
          schema: 'public',
          table: tableName,
          ...(filter ? { filter } : {})
        },
        (payload) => {
          console.log(`📡 ${tableName} ${event}:`, payload);
          // Use the ref to access the latest callback
          if (onEventRef.current) {
            onEventRef.current(payload);
          }
        }
      );
    });

    // Subscribe and store reference
    channel.subscribe((status, err) => {
      console.log(`${tableName} subscription status: ${status}`);
      if (err) {
        console.error(`${tableName} subscription error:`, err);
      }
    });

    channelRef.current = channel;

    // Cleanup function
    return () => {
      console.log(`🧹 Cleaning up ${tableName} subscription...`);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      subscriptionInitialized.current = false;
    };
  }, [tableName, isAuthenticated, enabled, filter]); // Removed unstable dependencies

  return { channel: channelRef.current };
}
