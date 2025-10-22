'use client';
import React, { useState } from 'react';
import { AdminLayout } from '@/components/layout';
import { Card, EnhancedTable, Container, Badge } from '@/components/ui';
import { Activity, LogIn, LogOut, UserPlus, Trash2, UserX, Calendar, User, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export default function ActivityLogsPage() {
  // Mock activity log data
  const activities = [
    {
      id: 1,
      timestamp: '2025-01-22 14:30:25',
      eventType: 'Login',
      user: 'micah@jobsync.gov',
      role: 'HR',
      details: 'Successful login from 192.168.1.100',
      status: 'Success'
    },
    {
      id: 2,
      timestamp: '2025-01-22 13:15:10',
      eventType: 'Account Created',
      user: 'admin@jobsync.gov',
      role: 'Admin',
      details: 'Created new PESO admin account',
      status: 'Success'
    },
    {
      id: 3,
      timestamp: '2025-01-22 12:45:00',
      eventType: 'Login',
      user: 'juan@email.com',
      role: 'Applicant',
      details: 'Successful login from 192.168.1.105',
      status: 'Success'
    },
    {
      id: 4,
      timestamp: '2025-01-22 11:20:15',
      eventType: 'Account Deactivated',
      user: 'admin@jobsync.gov',
      role: 'Admin',
      details: 'Deactivated account: pedro@email.com',
      status: 'Success'
    },
    {
      id: 5,
      timestamp: '2025-01-22 10:10:30',
      eventType: 'Login Failed',
      user: 'unknown@email.com',
      role: 'Unknown',
      details: 'Failed login attempt - Invalid credentials',
      status: 'Failed'
    },
    {
      id: 6,
      timestamp: '2025-01-22 09:05:45',
      eventType: 'Logout',
      user: 'peso@jobsync.gov',
      role: 'PESO',
      details: 'User logged out',
      status: 'Success'
    },
    {
      id: 7,
      timestamp: '2025-01-22 08:30:20',
      eventType: 'User Registration',
      user: 'maria@email.com',
      role: 'Applicant',
      details: 'New applicant registered',
      status: 'Success'
    },
    {
      id: 8,
      timestamp: '2025-01-22 07:15:10',
      eventType: 'Account Deleted',
      user: 'admin@jobsync.gov',
      role: 'Admin',
      details: 'Deleted account: test@email.com',
      status: 'Success'
    },
  ];

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
    <AdminLayout role="Admin" userName="System Admin" pageTitle="Activity Logs" pageDescription="Monitor system events and user activities">
      <Container size="xl">
        <div className="space-y-6">
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
