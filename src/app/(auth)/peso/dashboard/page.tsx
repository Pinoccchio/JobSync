'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AdminLayout } from '@/components/layout';
import { Card, Container, Badge, RefreshButton } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { GraduationCap, Clock, User, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/auth';
import { getStatusConfig } from '@/lib/config/statusConfig';

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

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchDashboardData = useCallback(async () => {
    console.log('📊 Fetching PESO dashboard data...');

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
  }, []); // Empty deps - stable function, auth check moved to useEffect

  // Fetch data when authentication is ready - fixed race condition
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchDashboardData();
    }
  }, [authLoading, isAuthenticated, fetchDashboardData]); // All dependencies to prevent race condition

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
    const statusConfig = getStatusConfig(status);
    return {
      variant: statusConfig.badgeVariant,
      icon: statusConfig.icon,
      label: statusConfig.label,
    };
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
          {/* Refresh Button */}
          <div className="flex items-center justify-end">
            <RefreshButton
              onRefresh={fetchDashboardData}
              label="Refresh"
              showLastRefresh={true}
            />
          </div>

          {/* Dashboard Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiles.map((tile, index) => {
              const Icon = tile.icon;
              // Define gradient background and border colors based on tile color
              const bgGradient = tile.color.includes('blue') ? 'from-blue-50 to-blue-100 border-blue-500' :
                               tile.color.includes('orange') ? 'from-orange-50 to-orange-100 border-orange-500' :
                               'from-purple-50 to-purple-100 border-purple-500';
              const iconBg = tile.color.includes('blue') ? 'bg-blue-500' :
                            tile.color.includes('orange') ? 'bg-orange-500' :
                            'bg-purple-500';

              return (
                <Card key={index} variant="flat" className={`bg-gradient-to-br ${bgGradient} border-l-4 hover:shadow-xl transition-all duration-300`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{tile.title}</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {loading ? (
                          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        ) : (
                          tile.value
                        )}
                      </p>
                    </div>
                    <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Recent Applications */}
          <Card title="RECENT APPLICATIONS" headerColor="bg-[#D4F4DD]" variant="elevated" className="hover:shadow-xl transition-shadow">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-[#22A555] mx-auto mb-3" />
                  <p className="text-sm text-gray-600">Loading applications...</p>
                </div>
              </div>
            ) : recentApplications.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="font-medium text-gray-700">No applications yet</p>
                <p className="text-sm mt-2">Applications will appear here once applicants start applying</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentApplications.map((application) => (
                  <div
                    key={application.id}
                    className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-lg border border-gray-100 transition-all duration-200 cursor-pointer hover:border-[#22A555]/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
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
                    {(() => {
                      const statusBadge = getStatusBadge(application.status);
                      return (
                        <Badge variant={statusBadge.variant as any} icon={statusBadge.icon}>
                          {statusBadge.label}
                        </Badge>
                      );
                    })()}
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
