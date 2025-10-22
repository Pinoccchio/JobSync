'use client';
import React from 'react';
import { AdminLayout } from '@/components/layout';
import { Card, Container, Badge } from '@/components/ui';
import { Users, Shield, Building2, UserCheck, Activity, Clock, UserPlus } from 'lucide-react';

export default function AdminDashboard() {
  // Mock data
  const stats = [
    { title: 'Total Users', value: '156', icon: Users, color: 'from-blue-500 to-blue-600', change: '+12 this month' },
    { title: 'HR Accounts', value: '8', icon: Shield, color: 'from-green-500 to-green-600', change: '2 active' },
    { title: 'PESO Accounts', value: '5', icon: Building2, color: 'from-purple-500 to-purple-600', change: '1 active' },
    { title: 'Applicants', value: '143', icon: UserCheck, color: 'from-orange-500 to-orange-600', change: '+10 this week' },
  ];

  const recentActivities = [
    { id: 1, event: 'New User Registration', user: 'Juan Dela Cruz', role: 'Applicant', time: '5 minutes ago' },
    { id: 2, event: 'Account Login', user: 'HR Admin', role: 'HR', time: '1 hour ago' },
    { id: 3, event: 'Account Created', user: 'System Admin', role: 'PESO', time: '2 hours ago' },
    { id: 4, event: 'Account Login', user: 'PESO Admin', role: 'PESO', time: '3 hours ago' },
    { id: 5, event: 'New User Registration', user: 'Maria Santos', role: 'Applicant', time: '5 hours ago' },
  ];

  const getEventIcon = (event: string) => {
    if (event.includes('Registration') || event.includes('Created')) return UserPlus;
    if (event.includes('Login')) return Activity;
    return Clock;
  };

  const getEventColor = (event: string) => {
    if (event.includes('Registration') || event.includes('Created')) return 'from-green-500 to-green-600';
    if (event.includes('Login')) return 'from-blue-500 to-blue-600';
    return 'from-gray-500 to-gray-600';
  };

  const getRoleBadgeVariant = (role: string): 'success' | 'info' | 'warning' | 'default' => {
    switch (role) {
      case 'HR': return 'success';
      case 'PESO': return 'info';
      case 'Applicant': return 'warning';
      default: return 'default';
    }
  };

  return (
    <AdminLayout role="Admin" userName="System Admin" pageTitle="Dashboard" pageDescription="System administration and user management">
      <Container size="xl">
        <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
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
          <div className="space-y-3">
            {recentActivities.map((activity) => {
              const EventIcon = getEventIcon(activity.event);
              const eventColor = getEventColor(activity.event);

              return (
                <div key={activity.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${eventColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <EventIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{activity.event}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-600">{activity.user}</span>
                        <Badge variant={getRoleBadgeVariant(activity.role)} className="text-xs">
                          {activity.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{activity.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="flat" className="bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Active Sessions</p>
              <p className="text-3xl font-bold text-gray-900">24</p>
              <p className="text-xs text-gray-500 mt-2">Users online now</p>
            </div>
          </Card>

          <Card variant="flat" className="bg-gradient-to-br from-green-50 to-green-100">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">New Signups (Today)</p>
              <p className="text-3xl font-bold text-gray-900">7</p>
              <p className="text-xs text-gray-500 mt-2">Applicant registrations</p>
            </div>
          </Card>

          <Card variant="flat" className="bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">System Health</p>
              <p className="text-3xl font-bold text-[#22A555]">100%</p>
              <p className="text-xs text-gray-500 mt-2">All systems operational</p>
            </div>
          </Card>
        </div>
      </div>
    </Container>
    </AdminLayout>
  );
}
