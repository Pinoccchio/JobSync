'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AdminLayout } from '@/components/layout';
import { Card, Container, Badge } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { GraduationCap, Clock, User, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/auth';

interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  activePrograms: number;
}

interface RecentApplication {
  id: string;
  full_name: string;
  program_id: string;
  status: string;
  submitted_at: string;
  training_programs: {
    title: string;
  } | null;
}

export default function PESODashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    pendingApplications: 0,
    activePrograms: 0,
  });
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // Track component mount state to prevent state updates after unmount
  const isMounted = useRef(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchDashboardData = useCallback(async () => {
    if (authLoading || !isAuthenticated) {
      console.log('⏳ Waiting for authentication...');
      return;
    }

    // Prevent duplicate fetches on strict mode double render
    if (hasFetched.current) {
      console.log('⏭️ Already fetched, skipping...');
      return;
    }

    console.log('📊 Fetching PESO dashboard data...');
    hasFetched.current = true;

    // Only update loading state if component is still mounted
    if (isMounted.current) {
      setLoading(true);
    }
    try {
      // Fetch total training applications
      const { count: totalApplications } = await supabase
        .from('training_applications')
        .select('*', { count: 'exact', head: true });

      // Fetch pending training applications
      const { count: pendingApplications } = await supabase
        .from('training_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Fetch active training programs
      const { count: activePrograms } = await supabase
        .from('training_programs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Fetch recent applications (last 5)
      const { data: applications, error } = await supabase
        .from('training_applications')
        .select(`
          id,
          full_name,
          program_id,
          status,
          submitted_at,
          training_programs (
            title
          )
        `)
        .order('submitted_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching recent applications:', error);
      }

      // Only update state if component is still mounted
      if (isMounted.current) {
        setStats({
          totalApplications: totalApplications || 0,
          pendingApplications: pendingApplications || 0,
          activePrograms: activePrograms || 0,
        });

        setRecentApplications(applications || []);
      }
    } catch (error) {
      console.error('❌ Error fetching PESO dashboard data:', error);
      // Use showToast directly without including it in dependencies to avoid infinite loop
      if (isMounted.current) {
        showToast('Failed to load dashboard data', 'error');
      }
    } finally {
      // Only update loading state if component is still mounted
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [authLoading, isAuthenticated]); // Fixed: removed showToast from dependencies

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const tiles = [
    {
      title: 'Total Training Applications',
      value: loading ? '...' : stats.totalApplications.toString(),
      icon: User,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Pending Applications',
      value: loading ? '...' : stats.pendingApplications.toString(),
      icon: Clock,
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Active Training Programs',
      value: loading ? '...' : stats.activePrograms.toString(),
      icon: GraduationCap,
      color: 'from-purple-500 to-purple-600'
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning" icon={Clock}>Pending</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'denied':
        return <Badge variant="danger">Denied</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <AdminLayout
      role="PESO"
      userName={user?.fullName || 'PESO Admin'}
      pageTitle="Dashboard"
      pageDescription="Overview of training programs and applications"
    >
      <Container size="xl">
        <div className="space-y-8">
          {/* Dashboard Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiles.map((tile, index) => {
              const Icon = tile.icon;
              return (
                <Card key={index} variant="elevated" className="hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">{tile.title}</p>
                      <p className="text-4xl font-bold text-gray-900">
                        {loading ? (
                          <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
                        ) : (
                          tile.value
                        )}
                      </p>
                    </div>
                    <div className={`w-16 h-16 bg-gradient-to-br ${tile.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Recent Applications */}
          <Card title="RECENT APPLICATIONS" headerColor="bg-[#D4F4DD]" variant="elevated">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : recentApplications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No applications yet</p>
                <p className="text-sm mt-2">Applications will appear here once applicants start applying</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentApplications.map((application) => (
                  <div
                    key={application.id}
                    className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{application.full_name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <GraduationCap className="w-4 h-4" />
                          <span>{application.training_programs?.title || 'Unknown Program'}</span>
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(application.status)}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </Container>
    </AdminLayout>
  );
}
