'use client';
import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Card, EnhancedTable, Container, Badge, RefreshButton } from '@/components/ui';
import { AdminLayout } from '@/components/layout';
import { FileText, CheckCircle, XCircle, Clock, TrendingUp, Info, Loader2 } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/lib/utils/errorMessages';
// import { useTableRealtime } from '@/hooks/useTableRealtime'; // REMOVED: Realtime disabled

interface Application {
  id: string;
  position: string;
  type: 'Job Application' | 'Training Application';
  dateApplied: string;
  status: 'Pending Review' | 'Approved' | 'Disapproved';
  matchScore: string;
}

export default function MyApplicationsPage() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch applications function
  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch job applications
      const jobAppsResponse = await fetch('/api/applications');
      const jobAppsData = await jobAppsResponse.json();

      if (!jobAppsResponse.ok) {
        throw new Error(jobAppsData.error || 'Failed to fetch job applications');
      }

      const jobApplications = jobAppsData.data || [];

      // Fetch training applications
      const trainingAppsResponse = await fetch('/api/training/applications');
      const trainingAppsData = await trainingAppsResponse.json();

      if (!trainingAppsResponse.ok) {
        throw new Error(trainingAppsData.error || 'Failed to fetch training applications');
      }

      const trainingApplications = trainingAppsData.data || [];

      // Combine and format applications
      const allApplications: Application[] = [
        ...jobApplications.map((app: any) => ({
          id: app.id,
          position: app.jobs?.title || 'Unknown Position',
          type: 'Job Application' as const,
          dateApplied: app.created_at,
          status: app.status === 'pending' ? 'Pending Review' : app.status === 'approved' ? 'Approved' : 'Disapproved',
          matchScore: app.match_score ? `${app.match_score}%` : 'N/A'
        })),
        ...trainingApplications.map((app: any) => ({
          id: app.id,
          position: app.training_programs?.title || 'Unknown Program',
          type: 'Training Application' as const,
          dateApplied: app.submitted_at || app.created_at,
          status: app.status === 'pending' ? 'Pending Review' : app.status === 'approved' ? 'Approved' : 'Disapproved',
          matchScore: 'N/A'
        }))
      ];

      // Sort by date (most recent first)
      const sortedApplications = allApplications.sort((a, b) =>
        new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime()
      );

      setApplications(sortedApplications);
      showToast('Applications refreshed', 'success');
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      showToast(getErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Fetch on mount
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // REMOVED: Real-time subscription disabled for performance
  // useTableRealtime('applications', ['INSERT', 'UPDATE'], `applicant_id=eq.${user?.id}`, () => {
  //   showToast('Application status updated', 'info');
  //   fetchApplications();
  // });

  const columns = [
    {
      header: 'Position/Program',
      accessor: 'position',
      sortable: true,
      render: (value: string, row: any) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{row.type}</p>
        </div>
      )
    },
    {
      header: 'Date Applied',
      accessor: 'dateApplied',
      sortable: true,
      render: (value: string) => (
        <span className="text-gray-700">{new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (value: string) => {
        let variant: 'success' | 'danger' | 'pending' = 'pending';
        let icon = Clock;

        if (value === 'Approved') {
          variant = 'success';
          icon = CheckCircle;
        } else if (value === 'Disapproved') {
          variant = 'danger';
          icon = XCircle;
        }

        return <Badge variant={variant} icon={icon}>{value}</Badge>;
      }
    },
    {
      header: 'Match Score',
      accessor: 'matchScore',
      sortable: true,
      render: (value: string) => {
        if (value === 'N/A') {
          return <span className="text-gray-400 text-sm">N/A</span>;
        }
        const score = parseFloat(value);
        const color = score >= 90 ? 'text-[#22A555]' : score >= 75 ? 'text-blue-600' : 'text-orange-600';
        return (
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-4 h-4 ${color}`} />
            <span className={`font-semibold ${color}`}>{value}</span>
          </div>
        );
      }
    },
  ];

  const handleExport = () => {
    showToast('Exporting applications to Excel...', 'info');
    // Export functionality would go here
  };

  // Calculate stats
  const stats = {
    total: applications.length,
    approved: applications.filter(a => a.status === 'Approved').length,
    pending: applications.filter(a => a.status === 'Pending Review').length,
    disapproved: applications.filter(a => a.status === 'Disapproved').length,
  };

  return (
    <AdminLayout role="Applicant" userName={user?.fullName || 'Applicant'} pageTitle="My Applications" pageDescription="Track the status of your job and training applications">
      <Container size="xl">
        <div className="space-y-6">
          {/* Refresh Button */}
          <div className="flex items-center justify-end">
            <RefreshButton onRefresh={fetchApplications} label="Refresh" showLastRefresh={true} />
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card variant="flat" className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Applications</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {loading ? '...' : stats.total}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card variant="flat" className="bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Approved</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {loading ? '...' : stats.approved}
                  </p>
                </div>
                <div className="w-12 h-12 bg-[#22A555] rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card variant="flat" className="bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Review</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {loading ? '...' : stats.pending}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card variant="flat" className="bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Disapproved</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {loading ? '...' : stats.disapproved}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <XCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </div>

          {/* Applications Table */}
          <Card title="APPLICATION HISTORY" headerColor="bg-[#D4F4DD]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#22A555] animate-spin" />
                <span className="ml-3 text-gray-600">Loading applications...</span>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600 font-medium">No applications yet</p>
                <p className="text-sm text-gray-500 mt-2">Start by applying to available jobs and training programs</p>
              </div>
            ) : (
              <EnhancedTable
                columns={columns}
                data={applications}
                searchable
                searchPlaceholder="Search applications..."
                paginated
                pageSize={10}
                onExport={handleExport}
                exportLabel="Export to Excel"
              />
            )}
          </Card>

          {/* Application Status Guide */}
          <Card variant="flat" className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Info className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 mb-1">Application Status Guide</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className="text-sm text-gray-700"><strong>Pending:</strong> Under review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700"><strong>Approved:</strong> Application accepted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-gray-700"><strong>Disapproved:</strong> Not successful</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Container>
    </AdminLayout>
  );
}
