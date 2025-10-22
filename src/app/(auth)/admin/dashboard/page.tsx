'use client';
import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout';
import { Card, Container, Badge } from '@/components/ui';
import { Users, Shield, Building2, UserCheck, Activity, Clock, UserPlus, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/auth';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
  totalUsers: number;
  hrAccounts: number;
  pesoAccounts: number;
  applicants: number;
}

interface ActivityLog {
  id: string;
  event_type: string;
  user_email: string | null;
  user_role: string | null;
  timestamp: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    hrAccounts: 0,
    pesoAccounts: 0,
    applicants: 0,
  });
  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch total users count
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch HR accounts count
      const { count: hrAccounts } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'HR')
        .eq('status', 'active');

      // Fetch PESO accounts count
      const { count: pesoAccounts } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'PESO')
        .eq('status', 'active');

      // Fetch applicants count
      const { count: applicants } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'APPLICANT');

      // Fetch recent activity logs
      const { data: activities } = await supabase
        .from('activity_logs')
        .select('id, event_type, user_email, user_role, timestamp')
        .order('timestamp', { ascending: false })
        .limit(5);

      setStats({
        totalUsers: totalUsers || 0,
        hrAccounts: hrAccounts || 0,
        pesoAccounts: pesoAccounts || 0,
        applicants: applicants || 0,
      });

      setRecentActivities(activities || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (event: string) => {
    if (event.includes('registration') || event.includes('signup') || event.includes('created')) return UserPlus;
    if (event.includes('login')) return Activity;
    return Clock;
  };

  const getEventColor = (event: string) => {
    if (event.includes('registration') || event.includes('signup') || event.includes('created')) return 'from-green-500 to-green-600';
    if (event.includes('login')) return 'from-blue-500 to-blue-600';
    return 'from-gray-500 to-gray-600';
  };

  const getRoleBadgeVariant = (role: string): 'success' | 'info' | 'warning' | 'default' => {
    switch (role) {
      case 'HR': return 'success';
      case 'PESO': return 'info';
      case 'APPLICANT': return 'warning';
      case 'ADMIN': return 'default';
      default: return 'default';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  };

  const formatEventType = (eventType: string) => {
    return eventType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const statsData = [
    {
      title: 'Total Users',
      value: loading ? '...' : stats.totalUsers.toString(),
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      change: loading ? 'Loading...' : `${stats.hrAccounts + stats.pesoAccounts} staff`
    },
    {
      title: 'HR Accounts',
      value: loading ? '...' : stats.hrAccounts.toString(),
      icon: Shield,
      color: 'from-green-500 to-green-600',
      change: loading ? 'Loading...' : `${stats.hrAccounts} active`
    },
    {
      title: 'PESO Accounts',
      value: loading ? '...' : stats.pesoAccounts.toString(),
      icon: Building2,
      color: 'from-purple-500 to-purple-600',
      change: loading ? 'Loading...' : `${stats.pesoAccounts} active`
    },
    {
      title: 'Applicants',
      value: loading ? '...' : stats.applicants.toString(),
      icon: UserCheck,
      color: 'from-orange-500 to-orange-600',
      change: loading ? 'Loading...' : 'Job seekers'
    },
  ];

  return (
    <AdminLayout role="Admin" userName={user?.fullName || 'System Admin'} pageTitle="Dashboard" pageDescription="System administration and user management">
      <Container size="xl">
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsData.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} variant="elevated" className="hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{stat.change}</p>
                </Card>
              );
            })}
          </div>

          {/* Recent Activity */}
          <Card title="RECENT SYSTEM ACTIVITY" headerColor="bg-[#D4F4DD]" variant="elevated">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#22A555]" />
                <span className="ml-3 text-gray-600">Loading activities...</span>
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No recent activities to display</p>
                <p className="text-sm mt-1">Activity logs will appear here as users interact with the system</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((activity) => {
                  const EventIcon = getEventIcon(activity.event_type);
                  const eventColor = getEventColor(activity.event_type);

                  return (
                    <div key={activity.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${eventColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <EventIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{formatEventType(activity.event_type)}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-600">{activity.user_email || 'Unknown User'}</span>
                            {activity.user_role && (
                              <Badge variant={getRoleBadgeVariant(activity.user_role)} className="text-xs">
                                {activity.user_role}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{formatTimeAgo(activity.timestamp)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="flat" className="bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Total Profiles</p>
                <p className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.totalUsers}</p>
                <p className="text-xs text-gray-500 mt-2">Registered users</p>
              </div>
            </Card>

            <Card variant="flat" className="bg-gradient-to-br from-green-50 to-green-100">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Staff Accounts</p>
                <p className="text-3xl font-bold text-gray-900">{loading ? '...' : (stats.hrAccounts + stats.pesoAccounts)}</p>
                <p className="text-xs text-gray-500 mt-2">HR + PESO admins</p>
              </div>
            </Card>

            <Card variant="flat" className="bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">System Health</p>
                <p className="text-3xl font-bold text-[#22A555]">✓</p>
                <p className="text-xs text-gray-500 mt-2">All systems operational</p>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </AdminLayout>
  );
}
