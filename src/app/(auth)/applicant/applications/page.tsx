'use client';
import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Card, EnhancedTable, Container, Badge, RefreshButton, Button } from '@/components/ui';
import { AdminLayout } from '@/components/layout';
import { FileText, CheckCircle, XCircle, Clock, Info, Loader2, Star, Calendar, Briefcase, AlertCircle, Eye, ArrowRight, History, X } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/lib/utils/errorMessages';
import { StatusTimeline } from '@/components/hr/StatusTimeline';
// import { useTableRealtime } from '@/hooks/useTableRealtime'; // REMOVED: Realtime disabled

interface StatusHistoryItem {
  from: string | null;
  to: string;
  changed_at: string;
  changed_by?: string;
}

interface Application {
  id: string;
  position: string;
  type: 'Job Application' | 'Training Application';
  dateApplied: string;
  status: string; // Can be: pending, under_review, shortlisted, interviewed, approved, denied, hired, archived, withdrawn
  matchScore: string;
  denialReason?: string;
  nextSteps?: string;
  interviewDate?: string;
  hrNotes?: string;
  rawStatus: string; // Original status from API
  statusHistory?: StatusHistoryItem[]; // Status change timeline
}

export default function MyApplicationsPage() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [applicationToWithdraw, setApplicationToWithdraw] = useState<Application | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [showStatusHistoryModal, setShowStatusHistoryModal] = useState(false);
  const [selectedApplicationForHistory, setSelectedApplicationForHistory] = useState<Application | null>(null);

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
          status: app.status, // Keep original status
          rawStatus: app.status,
          matchScore: app.match_score ? `${app.match_score}%` : 'N/A',
          denialReason: app.denial_reason,
          nextSteps: app.next_steps,
          interviewDate: app.interview_date,
          hrNotes: app.hr_notes,
          statusHistory: app.status_history || [], // Include status change timeline
        })),
        ...trainingApplications.map((app: any) => ({
          id: app.id,
          position: app.training_programs?.title || 'Unknown Program',
          type: 'Training Application' as const,
          dateApplied: app.submitted_at || app.created_at,
          status: app.status === 'pending' ? 'pending' : app.status === 'approved' ? 'approved' : 'denied',
          rawStatus: app.status,
          matchScore: 'N/A',
          statusHistory: app.status_history || [], // Include status change timeline
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

  // Handle Withdraw Application
  const handleWithdraw = (application: Application) => {
    setApplicationToWithdraw(application);
    setShowWithdrawModal(true);
  };

  const handleWithdrawConfirm = async () => {
    if (!applicationToWithdraw) return;

    try {
      setWithdrawing(true);
      const response = await fetch(`/api/applications/${applicationToWithdraw.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'withdrawn' }),
      });

      const result = await response.json();

      if (result.success) {
        showToast('Application withdrawn successfully', 'success');
        setShowWithdrawModal(false);
        setApplicationToWithdraw(null);
        fetchApplications();
      } else {
        showToast(getErrorMessage(result.error), 'error');
      }
    } catch (error) {
      console.error('Error withdrawing application:', error);
      showToast('Failed to withdraw application', 'error');
    } finally {
      setWithdrawing(false);
    }
  };

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
        let variant: 'success' | 'danger' | 'pending' | 'info' | 'warning' | 'default' = 'default';
        let icon = Clock;
        let displayText = value;

        switch (value) {
          case 'pending':
            variant = 'pending';
            icon = Clock;
            displayText = 'Pending Review';
            break;
          case 'under_review':
            variant = 'info';
            icon = Eye;
            displayText = 'Under Review';
            break;
          case 'shortlisted':
            variant = 'warning';
            icon = Star;
            displayText = 'Shortlisted 🎉';
            break;
          case 'interviewed':
            variant = 'info';
            icon = Calendar;
            displayText = 'Interview Scheduled';
            break;
          case 'approved':
            variant = 'success';
            icon = CheckCircle;
            displayText = 'Approved ✅';
            break;
          case 'denied':
            variant = 'danger';
            icon = XCircle;
            displayText = 'Not Approved';
            break;
          case 'hired':
            variant = 'success';
            icon = Briefcase;
            displayText = 'Hired 🎉';
            break;
          case 'archived':
            variant = 'default';
            icon = FileText;
            displayText = 'Archived';
            break;
          case 'withdrawn':
            variant = 'default';
            icon = AlertCircle;
            displayText = 'Withdrawn';
            break;
          default:
            displayText = value.charAt(0).toUpperCase() + value.slice(1);
        }

        return <Badge variant={variant} icon={icon}>{displayText}</Badge>;
      }
    },
    {
      header: 'Status History',
      accessor: 'id' as const,
      render: (_: any, row: Application) => {
        const hasHistory = row.statusHistory && row.statusHistory.length > 0;
        return (
          <Button
            variant={hasHistory ? "info" : "default"}
            size="sm"
            icon={History}
            onClick={() => {
              setSelectedApplicationForHistory(row);
              setShowStatusHistoryModal(true);
            }}
            className="text-xs whitespace-nowrap"
          >
            {hasHistory ? `View History (${row.statusHistory.length})` : 'View Status'}
          </Button>
        );
      }
    },
    {
      header: 'Details / Actions',
      accessor: 'id' as const,
      render: (_: any, row: Application) => {
        const canWithdraw = row.type === 'Job Application' && (row.status === 'pending' || row.status === 'under_review');

        switch (row.status) {
          case 'pending':
          case 'under_review':
            return (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-gray-600">
                  {row.status === 'under_review' ? 'HR is reviewing your application' : 'Waiting for HR review'}
                </p>
                {canWithdraw && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleWithdraw(row)}
                    className="text-xs"
                  >
                    Withdraw Application
                  </Button>
                )}
              </div>
            );

          case 'shortlisted':
            return (
              <div className="bg-yellow-50 border border-yellow-200 p-2 rounded text-xs">
                <p className="font-semibold text-yellow-800">Congratulations!</p>
                <p className="text-yellow-700">You've been shortlisted. Expect contact soon!</p>
              </div>
            );

          case 'interviewed':
            return (
              <div className="bg-blue-50 border border-blue-200 p-2 rounded text-xs">
                {row.interviewDate ? (
                  <>
                    <p className="font-semibold text-blue-800">Interview Scheduled</p>
                    <p className="text-blue-700">
                      {new Date(row.interviewDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {row.nextSteps && <p className="text-blue-600 mt-1">{row.nextSteps}</p>}
                  </>
                ) : (
                  <p className="text-blue-700">Interview scheduled. Check notifications for details.</p>
                )}
              </div>
            );

          case 'approved':
            return (
              <div className="bg-green-50 border border-green-200 p-2 rounded text-xs">
                <p className="font-semibold text-green-800">Application Approved!</p>
                {row.nextSteps && (
                  <p className="text-green-700 mt-1">{row.nextSteps}</p>
                )}
              </div>
            );

          case 'denied':
            return (
              <div className="flex flex-col gap-2">
                {row.denialReason && (
                  <div className="bg-red-50 border border-red-200 p-2 rounded text-xs">
                    <p className="font-semibold text-red-800">Reason:</p>
                    <p className="text-red-700">{row.denialReason}</p>
                  </div>
                )}
                <Link href="/applicant/jobs">
                  <Button variant="primary" size="sm" icon={ArrowRight} className="text-xs w-full">
                    View Other Jobs
                  </Button>
                </Link>
              </div>
            );

          case 'hired':
            return (
              <div className="bg-teal-50 border border-teal-200 p-2 rounded text-xs">
                <p className="font-semibold text-teal-800">Welcome to the Team! 🎉</p>
                {row.nextSteps && (
                  <p className="text-teal-700 mt-1">{row.nextSteps}</p>
                )}
              </div>
            );

          case 'withdrawn':
            return (
              <p className="text-xs text-gray-500 italic">You withdrew this application</p>
            );

          case 'archived':
            return (
              <p className="text-xs text-gray-500">Application archived</p>
            );

          default:
            return <span className="text-xs text-gray-400">—</span>;
        }
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
    approved: applications.filter(a => a.status === 'approved' || a.status === 'hired').length,
    pending: applications.filter(a => a.status === 'pending' || a.status === 'under_review').length,
    inProgress: applications.filter(a => a.status === 'shortlisted' || a.status === 'interviewed').length,
    denied: applications.filter(a => a.status === 'denied').length,
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
                  <p className="text-sm text-gray-600 mb-1">Pending / Review</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {loading ? '...' : stats.pending}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card variant="flat" className="bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">In Progress</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {loading ? '...' : stats.inProgress}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Star className="w-6 h-6 text-white" />
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

      {/* Withdraw Confirmation Modal */}
      {showWithdrawModal && applicationToWithdraw && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
            {/* Red Gradient Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Withdraw Application</h3>
                    <p className="text-sm text-white/90">This action cannot be undone</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Warning Message */}
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-800 mb-1">Confirm Withdrawal</p>
                    <p className="text-sm text-red-700">
                      Are you sure you want to withdraw your application? This action is permanent and cannot be reversed.
                    </p>
                  </div>
                </div>
              </div>

              {/* Application Info */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Application Details:</p>
                <div className="space-y-1">
                  <p className="font-medium text-gray-900">{applicationToWithdraw.position}</p>
                  <p className="text-sm text-gray-600">
                    Applied on: {new Date(applicationToWithdraw.dateApplied).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-600">
                    Current Status: <span className="font-semibold">{applicationToWithdraw.status === 'pending' ? 'Pending Review' : 'Under Review'}</span>
                  </p>
                </div>
              </div>

              {/* Info Note */}
              <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> You can reapply for this position anytime after withdrawing.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowWithdrawModal(false);
                    setApplicationToWithdraw(null);
                  }}
                  className="flex-1"
                  disabled={withdrawing}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  icon={AlertCircle}
                  loading={withdrawing}
                  onClick={handleWithdrawConfirm}
                  className="flex-1"
                  disabled={withdrawing}
                >
                  {withdrawing ? 'Withdrawing...' : 'Withdraw Application'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status History Modal */}
      {showStatusHistoryModal && selectedApplicationForHistory && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-5 flex items-center justify-between z-10 shadow-lg rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <History className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Application Status History</h3>
                  <p className="text-sm text-blue-100">Track your application progress</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowStatusHistoryModal(false);
                  setSelectedApplicationForHistory(null);
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {/* Application Info */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-lg">
                      {selectedApplicationForHistory.position}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedApplicationForHistory.type}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Applied on: {new Date(selectedApplicationForHistory.dateApplied).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Timeline */}
              {selectedApplicationForHistory.statusHistory && selectedApplicationForHistory.statusHistory.length > 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-6 overflow-visible">
                  <StatusTimeline
                    statusHistory={selectedApplicationForHistory.statusHistory}
                    currentStatus={selectedApplicationForHistory.status}
                  />
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600 font-medium">No status changes yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Your application is currently in <span className="font-semibold">{selectedApplicationForHistory.status}</span> status
                  </p>
                </div>
              )}

              {/* Additional Info */}
              {(selectedApplicationForHistory.denialReason || selectedApplicationForHistory.nextSteps || selectedApplicationForHistory.hrNotes) && (
                <div className="space-y-3">
                  {selectedApplicationForHistory.denialReason && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-red-800 mb-1">Reason:</p>
                      <p className="text-sm text-red-700">{selectedApplicationForHistory.denialReason}</p>
                    </div>
                  )}
                  {selectedApplicationForHistory.nextSteps && (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-blue-800 mb-1">Next Steps:</p>
                      <p className="text-sm text-blue-700">{selectedApplicationForHistory.nextSteps}</p>
                    </div>
                  )}
                  {selectedApplicationForHistory.hrNotes && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <p className="text-sm font-semibold text-yellow-800 mb-1">HR Notes:</p>
                      <p className="text-sm text-yellow-700">{selectedApplicationForHistory.hrNotes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex-shrink-0 border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end rounded-b-xl">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowStatusHistoryModal(false);
                  setSelectedApplicationForHistory(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
