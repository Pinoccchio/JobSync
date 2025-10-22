'use client';
import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout';
import { DashboardTile, Card, Button, Container } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Download, FileText, Clock, XCircle, CheckCircle2, Briefcase, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/auth';

interface DashboardStats {
  totalScanned: number;
  pendingReview: number;
  noMatches: number;
  approved: number;
  rejected: number;
  activeJobs: number;
}

export default function HRDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalScanned: 0,
    pendingReview: 0,
    noMatches: 0,
    approved: 0,
    rejected: 0,
    activeJobs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      // Fetch total applications (PDS scanned)
      const { count: totalScanned } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true });

      // Fetch pending applications
      const { count: pendingReview } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Fetch approved applications
      const { count: approved } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      // Fetch rejected applications
      const { count: rejected } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'denied');

      // Fetch active job postings
      const { count: activeJobs } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // For "no matches", we'd need more complex logic
      // For now, using jobs with no applications or low match scores
      const { data: jobsWithApps } = await supabase
        .from('jobs')
        .select(`
          id,
          applications!applications_job_id_fkey(count)
        `)
        .eq('status', 'active');

      const noMatches = jobsWithApps?.filter(job =>
        !job.applications || job.applications.length === 0
      ).length || 0;

      setStats({
        totalScanned: totalScanned || 0,
        pendingReview: pendingReview || 0,
        noMatches: noMatches,
        approved: approved || 0,
        rejected: rejected || 0,
        activeJobs: activeJobs || 0,
      });
    } catch (error) {
      console.error('Error fetching HR dashboard stats:', error);
      showToast('Failed to load dashboard statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const tiles = [
    {
      title: 'Total PDS Scanned',
      value: loading ? '...' : stats.totalScanned.toString(),
      icon: FileText,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Number of PDS Pending Review',
      value: loading ? '...' : stats.pendingReview.toString(),
      icon: Clock,
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Jobs with No Qualified Matches',
      value: loading ? '...' : stats.noMatches.toString(),
      icon: AlertCircle,
      color: 'from-red-500 to-red-600'
    },
    {
      title: 'Total Approved Applications',
      value: loading ? '...' : stats.approved.toString(),
      icon: CheckCircle2,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Total Rejected Applications',
      value: loading ? '...' : stats.rejected.toString(),
      icon: XCircle,
      color: 'from-gray-500 to-gray-600'
    },
    {
      title: 'Active Job Postings',
      value: loading ? '...' : stats.activeJobs.toString(),
      icon: Briefcase,
      color: 'from-purple-500 to-purple-600'
    },
  ];

  return (
    <AdminLayout
      role="HR"
      userName={user?.fullName || 'HR User'}
      pageTitle="Dashboard"
      pageDescription="Overview of hiring statistics and metrics"
    >
      <Container size="xl">
        <div className="space-y-8">
          {/* Generate Report Button */}
          <div className="flex items-center justify-end">
            <Button
              variant="success"
              icon={Download}
              onClick={() => showToast('Generate report feature coming soon', 'info')}
              disabled={loading}
            >
              Generate Report
            </Button>
          </div>

          {/* Dashboard Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Applicants Chart */}
            <Card title="MONTHLY APPLICANTS" headerColor="bg-[#D4F4DD]" variant="elevated">
              <div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white rounded-lg p-4">
                {loading ? (
                  <Loader2 className="w-12 h-12 animate-spin text-gray-400" />
                ) : (
                  <div className="text-center text-gray-500">
                    <p className="text-sm">Chart visualization coming soon</p>
                    <p className="text-xs mt-2">Will display monthly application trends</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Job Matched Chart */}
            <Card title="JOB MATCHED" headerColor="bg-[#D4F4DD]" variant="elevated">
              <div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white rounded-lg p-4">
                {loading ? (
                  <Loader2 className="w-12 h-12 animate-spin text-gray-400" />
                ) : (
                  <div className="text-center text-gray-500">
                    <p className="text-sm">Chart visualization coming soon</p>
                    <p className="text-xs mt-2">Will display application distribution by job</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </AdminLayout>
  );
}
