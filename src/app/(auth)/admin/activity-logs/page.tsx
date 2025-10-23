'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { AdminLayout } from '@/components/layout';
import { Card, EnhancedTable, Container, Badge, RefreshButton } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTableRealtime } from '@/hooks/useTableRealtime';
import { supabase } from '@/lib/supabase/auth';
import { Activity, LogIn, LogOut, UserPlus, Trash2, UserX, Calendar, User, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export default function ActivityLogsPage() {
  const { showToast } = useToast();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch activity logs function
  const fetchActivityLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('activity_logs')
        .select('id, event_type, event_category, user_email, user_role, details, status, metadata, timestamp')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching activity logs:', error);
        throw error;
      }

      // Transform data to match the table format
      const transformedData = (data || []).map((log: any) => ({
        id: log.id,
        timestamp: new Date(log.timestamp).toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }),
        eventType: log.event_type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        user: log.user_email || 'System',
        role: log.user_role || 'System',
        details: log.details || `${log.event_type} event`,
        status: log.status === 'success' ? 'Success' : 'Failed'
      }));

      setActivities(transformedData);
      showToast('Activity logs refreshed', 'success');
    } catch (error: any) {
      console.error('Failed to fetch activity logs:', error);
      showToast(error.message || 'Failed to refresh activity logs', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]); // Added showToast to dependencies

  // Fetch activity logs when authentication is ready - fixed race condition
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchActivityLogs();
    }
  }, [authLoading, isAuthenticated, fetchActivityLogs]); // All dependencies to prevent race condition

  // Real-time subscription for activity logs
  useTableRealtime('activity_logs', ['INSERT'], null, () => {
    showToast('New activity logged', 'info');
    fetchActivityLogs(); // Refresh data when new log is inserted
  });

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'Login': return LogIn;
      case 'Logout': return LogOut;
      case 'Account Created':
      case 'User Registration': return UserPlus;
      case 'Account Deleted': return Trash2;
      case 'Account Deactivated': return UserX;
      case 'Login Failed': return AlertCircle;
      default: return Activity;
    }
  };

  const getEventBadgeVariant = (eventType: string): 'success' | 'info' | 'warning' | 'danger' | 'default' => {
    switch (eventType) {
      case 'Login':
      case 'User Registration':
      case 'Account Created': return 'success';
      case 'Logout': return 'info';
      case 'Account Deactivated': return 'warning';
      case 'Account Deleted':
      case 'Login Failed': return 'danger';
      default: return 'default';
    }
  };

  const getRoleBadgeVariant = (role: string): 'success' | 'info' | 'warning' | 'default' => {
    switch (role) {
      case 'HR':
      case 'Admin': return 'success';
      case 'PESO': return 'info';
      case 'Applicant': return 'warning';
      default: return 'default';
    }
  };

  const columns = [
    {
      header: 'Timestamp',
      accessor: 'timestamp' as const,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700 font-mono">{value}</span>
        </div>
      )
    },
    {
      header: 'Event Type',
      accessor: 'eventType' as const,
      render: (value: string) => {
        const Icon = getEventIcon(value);
        return (
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-gray-400" />
            <Badge variant={getEventBadgeVariant(value)}>{value}</Badge>
          </div>
        );
      }
    },
    {
      header: 'User',
      accessor: 'user' as const,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700">{value}</span>
        </div>
      )
    },
    {
      header: 'Role',
      accessor: 'role' as const,
      render: (value: string) => (
        <Badge variant={getRoleBadgeVariant(value)}>{value}</Badge>
      )
    },
    {
      header: 'Details',
      accessor: 'details' as const,
      render: (value: string) => (
        <span className="text-sm text-gray-600">{value}</span>
      )
    },
    {
      header: 'Status',
      accessor: 'status' as const,
      render: (value: string) => (
        <Badge
          variant={value === 'Success' ? 'success' : 'danger'}
          icon={value === 'Success' ? CheckCircle2 : AlertCircle}
        >
          {value}
        </Badge>
      )
    },
  ];

  // Calculate stats
  const totalEvents = activities.length;
  const successfulEvents = activities.filter(a => a.status === 'Success').length;
  const failedEvents = activities.filter(a => a.status === 'Failed').length;
  const loginEvents = activities.filter(a => a.eventType.includes('Login')).length;

  return (
    <AdminLayout role="Admin" userName={user?.fullName || 'System Admin'} pageTitle="Activity Logs" pageDescription="Monitor system events and user activities">
      <Container size="xl">
        <div className="space-y-6">
        {/* Refresh Button */}
        <div className="flex justify-end">
          <RefreshButton onRefresh={fetchActivityLogs} label="Refresh" showLastRefresh={true} />
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card variant="flat" className="bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Events</p>
                <p className="text-3xl font-bold text-gray-900">{totalEvents}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card variant="flat" className="bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Successful</p>
                <p className="text-3xl font-bold text-gray-900">{successfulEvents}</p>
              </div>
              <div className="w-12 h-12 bg-[#22A555] rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card variant="flat" className="bg-gradient-to-br from-red-50 to-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Failed Events</p>
                <p className="text-3xl font-bold text-gray-900">{failedEvents}</p>
              </div>
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card variant="flat" className="bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Login Events</p>
                <p className="text-3xl font-bold text-gray-900">{loginEvents}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <LogIn className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Activity Logs Table */}
        <Card title="SYSTEM ACTIVITY LOGS" headerColor="bg-[#D4F4DD]">
          <EnhancedTable
            columns={columns}
            data={activities}
            searchable
            paginated
            pageSize={10}
            searchPlaceholder="Search by user, event type, or details..."
          />
        </Card>

        {/* Info Card */}
        <Card variant="flat" className="bg-blue-50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">Activity Log Information</p>
              <p className="text-sm text-gray-600">
                This page displays all system activities including user logins, account management, and security events.
                Use the search and filter features to find specific events. Logs are retained for 90 days.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Container>
    </AdminLayout>
  );
}
