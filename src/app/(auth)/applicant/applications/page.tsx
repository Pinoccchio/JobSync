'use client';
import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Card, EnhancedTable, Container, Badge, RefreshButton, Button, ModernModal } from '@/components/ui';
import { AdminLayout } from '@/components/layout';
import { FileText, CheckCircle, XCircle, Clock, Info, Loader2, Star, Calendar, Briefcase, AlertCircle, Eye, ArrowRight, History, X, GraduationCap, Search, Download, Phone, Mail, Archive } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/lib/utils/errorMessages';
import { StatusTimeline } from '@/components/hr/StatusTimeline';
import { getStatusConfig } from '@/lib/config/statusConfig';
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
          status: app.status, // Keep original training status (supports all 11 statuses)
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

  // Icon constant for withdraw modal (prevents React static flag error)
  const WithdrawIcon = AlertCircle;

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
        // Use centralized status configuration
        const statusConfig = getStatusConfig(value);
        return <Badge variant={statusConfig.badgeVariant} icon={statusConfig.icon}>{statusConfig.label}</Badge>;
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
              <div className="space-y-3">
                {/* Success Message */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-700" />
                    <p className="font-bold text-green-900 text-base">Application Approved! ✅</p>
                  </div>
                  <p className="text-green-700 text-sm">
                    Congratulations! Your application has been approved and you are moving forward in the hiring process.
                  </p>
                  {row.nextSteps && (
                    <p className="text-green-800 text-sm mt-2 font-medium">{row.nextSteps}</p>
                  )}
                </div>

                {/* Timeline & Expectations */}
                <div className="bg-white border border-gray-200 p-3 rounded-lg">
                  <p className="font-semibold text-gray-800 text-sm mb-2">⏰ What Happens Next:</p>
                  <ul className="text-gray-700 text-xs space-y-1 list-disc list-inside">
                    <li>HR will send you a formal job offer within 5-7 business days</li>
                    <li>The offer will include salary, benefits, and start date details</li>
                    <li>You will have time to review and accept the offer</li>
                  </ul>
                </div>

                {/* Important Notice */}
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                  <p className="font-semibold text-yellow-800 text-sm mb-1">📌 Important Notice:</p>
                  <p className="text-yellow-700 text-xs">
                    Your application is now locked and can no longer be withdrawn. Please wait for the official job offer.
                  </p>
                </div>

                {/* HR Contact */}
                <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                  <p className="font-semibold text-blue-800 text-sm mb-2">💬 Have Questions?</p>
                  <div className="space-y-1 text-xs text-blue-700">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3" />
                      <span>hr@asuncion.gov.ph</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3" />
                      <span>(043) 123-4567</span>
                    </div>
                    <p className="text-xs opacity-75 mt-1">Office Hours: Mon-Fri, 8AM-5PM</p>
                  </div>
                </div>
              </div>
            );

          case 'denied':
            return (
              <div className="flex flex-col gap-2">
                {/* Denial Reason */}
                {row.denialReason && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded">
                    <p className="font-semibold text-red-800 text-sm">Reason:</p>
                    <p className="text-red-700 text-sm mt-1">{row.denialReason}</p>
                  </div>
                )}

                {/* Improvement Suggestions */}
                <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                  <p className="font-semibold text-blue-800 text-sm">💡 Ways to Improve:</p>
                  <ul className="text-blue-700 text-xs mt-2 space-y-1 list-disc list-inside">
                    <li>Complete relevant training programs</li>
                    <li>Gain more work experience</li>
                    <li>Obtain required certifications</li>
                  </ul>
                </div>

                {/* Note about reapplication */}
                <div className="bg-yellow-50 border border-yellow-200 p-2 rounded">
                  <p className="text-yellow-800 text-xs">
                    ℹ️ You may reapply to this position after improving your qualifications.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link href="/applicant/trainings" className="flex-1">
                    <Button variant="info" size="sm" icon={GraduationCap} className="w-full text-xs">
                      Training Programs
                    </Button>
                  </Link>
                  <Link href="/applicant/jobs" className="flex-1">
                    <Button variant="secondary" size="sm" icon={Search} className="w-full text-xs">
                      Other Jobs
                    </Button>
                  </Link>
                </div>
              </div>
            );

          case 'hired':
            return (
              <div className="space-y-3">
                {/* Celebration Message */}
                <div className="bg-gradient-to-r from-teal-50 to-green-50 border-2 border-teal-300 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-5 h-5 text-teal-700" />
                    <p className="font-bold text-teal-900 text-base">Welcome to the Team! 🎉</p>
                  </div>
                  {row.nextSteps && (
                    <p className="text-teal-700 text-sm mt-2">{row.nextSteps}</p>
                  )}
                </div>

                {/* Next Steps Info */}
                <div className="bg-white border border-gray-200 p-3 rounded-lg">
                  <p className="font-semibold text-gray-800 text-sm mb-2">📋 What's Next:</p>
                  <ul className="text-gray-700 text-xs space-y-1 list-disc list-inside">
                    <li>HR will contact you with onboarding details</li>
                    <li>Prepare required documents (ID, certificates)</li>
                    <li>Attend orientation on your start date</li>
                  </ul>
                </div>

                {/* HR Contact */}
                <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                  <p className="font-semibold text-blue-800 text-sm mb-2">📞 Need Help?</p>
                  <div className="space-y-1 text-xs text-blue-700">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3" />
                      <span>hr@asuncion.gov.ph</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3" />
                      <span>(043) 123-4567</span>
                    </div>
                    <p className="text-xs opacity-75 mt-1">Office Hours: Mon-Fri, 8AM-5PM</p>
                  </div>
                </div>
              </div>
            );

          case 'withdrawn':
            return (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-gray-500 italic">You withdrew this application</p>
                <Link href={`/applicant/jobs?highlight=${row.job_id}`}>
                  <Button
                    variant="info"
                    size="sm"
                    icon={ArrowRight}
                    className="w-full text-xs"
                  >
                    Reapply to This Job
                  </Button>
                </Link>
              </div>
            );

          case 'archived':
            return (
              <div className="space-y-2">
                {/* Explanation */}
                <div className="bg-gray-50 border border-gray-200 p-3 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <Archive className="w-4 h-4 text-gray-600" />
                    <p className="font-semibold text-gray-800 text-sm">Application Archived</p>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    This application was archived because the job posting has been closed or filled.
                  </p>
                </div>

                {/* Info Note */}
                <div className="bg-blue-50 border border-blue-200 p-2 rounded">
                  <p className="text-blue-800 text-xs">
                    ℹ️ Your application data is preserved for record-keeping purposes.
                  </p>
                </div>

                {/* Action Button */}
                <Link href="/applicant/jobs">
                  <Button variant="info" size="sm" icon={Search} className="w-full text-xs">
                    Find Similar Jobs
                  </Button>
                </Link>
              </div>
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
      <ModernModal
        isOpen={showWithdrawModal}
        onClose={() => {
          setShowWithdrawModal(false);
          setApplicationToWithdraw(null);
        }}
        title="Withdraw Application"
        subtitle="This action cannot be undone"
        colorVariant="orange"
        icon={WithdrawIcon}
        size="md"
      >
        {applicationToWithdraw && (
          <div className="space-y-4">
            {/* Warning Message */}
            <div className="bg-orange-50 border-l-4 border-orange-600 p-4 rounded">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-orange-800 mb-1">Confirm Withdrawal</p>
                  <p className="text-sm text-orange-700">
                    Are you sure you want to withdraw your application? This action is permanent and cannot be reversed.
                  </p>
                </div>
              </div>
            </div>

            {/* Application Info */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Application Details:</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-900">{applicationToWithdraw.position}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">
                    Applied: {new Date(applicationToWithdraw.dateApplied).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">
                    Status: <span className="font-semibold">{applicationToWithdraw.status === 'pending' ? 'Pending Review' : 'Under Review'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Info Note */}
            <div className="bg-blue-50 border border-blue-200 p-3 rounded">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> After withdrawing, you can reapply by clicking the "Reapply to This Job" button in your applications list, or by visiting the Jobs page.
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
                icon={WithdrawIcon}
                loading={withdrawing}
                onClick={handleWithdrawConfirm}
                className="flex-1"
                disabled={withdrawing}
              >
                {withdrawing ? 'Withdrawing...' : 'Withdraw Application'}
              </Button>
            </div>
          </div>
        )}
      </ModernModal>

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
