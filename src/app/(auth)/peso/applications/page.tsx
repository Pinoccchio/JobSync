'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { AdminLayout } from '@/components/layout';
import { Card, EnhancedTable, Button, Container, Badge, RefreshButton, Modal, Input, Textarea } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';
import { getErrorMessage } from '@/lib/utils/errorMessages';
import { useAuth } from '@/contexts/AuthContext';
import { StatusTimeline } from '@/components/peso/StatusTimeline';
// import { useTableRealtime } from '@/hooks/useTableRealtime'; // REMOVED: Realtime disabled
import { Eye, CheckCircle, XCircle, User, Mail, Phone, MapPin, GraduationCap, Briefcase, Clock, Download, Image as ImageIcon, Filter, Loader2, History, UserCheck, Play, Award, CheckCircle2 } from 'lucide-react';

interface TrainingProgram {
  id: string;
  title: string;
  duration: string;
  start_date: string;
}

interface StatusHistoryItem {
  from: string | null;
  to: string;
  changed_at: string;
  changed_by?: string;
}

interface TrainingApplication {
  id: string;
  program_id: string;
  applicant_id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  highest_education: string;
  id_image_url: string;
  id_image_name: string;
  status: 'pending' | 'under_review' | 'approved' | 'denied' | 'enrolled' | 'in_progress' | 'completed' | 'certified' | 'withdrawn' | 'failed' | 'archived';
  submitted_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  status_history?: StatusHistoryItem[];
  training_programs?: TrainingProgram;
}

export default function PESOApplicationsPage() {
  const { showToast } = useToast();
  const { user } = useAuth();

  const [applications, setApplications] = useState<TrainingApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [denyModalOpen, setDenyModalOpen] = useState(false);
  const [underReviewModalOpen, setUnderReviewModalOpen] = useState(false);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [startTrainingModalOpen, setStartTrainingModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [certifyModalOpen, setCertifyModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<TrainingApplication | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [nextSteps, setNextSteps] = useState('');
  const [denialReason, setDenialReason] = useState('');

  // Fetch training applications function
  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/training/applications?status=all');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch applications');
      }

      setApplications(result.data || []);
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
  // useTableRealtime('training_applications', ['INSERT', 'UPDATE', 'DELETE'], null, () => {
  //   showToast('Training application updated', 'info');
  //   // fetchApplications(); // Uncomment when real data
  // });

  // Handle view details
  const handleView = (application: TrainingApplication) => {
    setSelectedApplication(application);
    setViewModalOpen(true);
  };

  // Handle view status history
  const handleViewHistory = (application: TrainingApplication) => {
    setSelectedApplication(application);
    setHistoryModalOpen(true);
  };

  // Handle mark as under review
  const handleUnderReview = async () => {
    if (!selectedApplication) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/training/applications/${selectedApplication.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'under_review' }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to mark as under review');
      }

      showToast(result.message || 'Application marked as under review', 'success');
      setUnderReviewModalOpen(false);
      setSelectedApplication(null);
      fetchApplications();
    } catch (error: any) {
      console.error('Error updating application:', error);
      showToast(getErrorMessage(error), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle approve application with next steps
  const handleApprove = async () => {
    if (!selectedApplication) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/training/applications/${selectedApplication.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'approved',
          next_steps: nextSteps || undefined
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to approve application');
      }

      showToast(result.message || 'Application approved successfully', 'success');
      setApproveModalOpen(false);
      setSelectedApplication(null);
      setNextSteps('');
      fetchApplications();
    } catch (error: any) {
      console.error('Error approving application:', error);
      showToast(getErrorMessage(error), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle deny application with reason
  const handleDeny = async () => {
    if (!selectedApplication) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/training/applications/${selectedApplication.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'denied',
          denial_reason: denialReason || undefined
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to deny application');
      }

      showToast(result.message || 'Application denied successfully', 'success');
      setDenyModalOpen(false);
      setSelectedApplication(null);
      setDenialReason('');
      fetchApplications();
    } catch (error: any) {
      console.error('Error denying application:', error);
      showToast(getErrorMessage(error), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle enroll applicant
  const handleEnroll = async () => {
    if (!selectedApplication) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/training/applications/${selectedApplication.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'enrolled' }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to enroll applicant');
      }

      showToast(result.message || 'Applicant enrolled successfully', 'success');
      setEnrollModalOpen(false);
      setSelectedApplication(null);
      fetchApplications();
    } catch (error: any) {
      console.error('Error enrolling applicant:', error);
      showToast(getErrorMessage(error), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle start training
  const handleStartTraining = async () => {
    if (!selectedApplication) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/training/applications/${selectedApplication.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in_progress' }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to start training');
      }

      showToast(result.message || 'Training started successfully', 'success');
      setStartTrainingModalOpen(false);
      setSelectedApplication(null);
      fetchApplications();
    } catch (error: any) {
      console.error('Error starting training:', error);
      showToast(getErrorMessage(error), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle mark as completed
  const handleComplete = async () => {
    if (!selectedApplication) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/training/applications/${selectedApplication.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to mark as completed');
      }

      showToast(result.message || 'Training marked as completed', 'success');
      setCompleteModalOpen(false);
      setSelectedApplication(null);
      fetchApplications();
    } catch (error: any) {
      console.error('Error completing training:', error);
      showToast(getErrorMessage(error), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle issue certificate
  const handleCertify = async () => {
    if (!selectedApplication) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/training/applications/${selectedApplication.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'certified' }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to issue certificate');
      }

      showToast(result.message || 'Certificate issued successfully', 'success');
      setCertifyModalOpen(false);
      setSelectedApplication(null);
      fetchApplications();
    } catch (error: any) {
      console.error('Error issuing certificate:', error);
      showToast(getErrorMessage(error), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Get unique programs for filter
  const uniquePrograms = Array.from(
    new Set(applications.map(a => a.training_programs?.title).filter(Boolean))
  );

  // Filter applications by program
  const filteredApplications = applications.filter(a => {
    if (programFilter === 'all') return true;
    return a.training_programs?.title === programFilter;
  });

  // Get badge variant and icon for status
  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: any; icon: any; label: string }> = {
      pending: { variant: 'warning', icon: Clock, label: 'Pending' },
      under_review: { variant: 'primary', icon: Eye, label: 'Under Review' },
      approved: { variant: 'success', icon: CheckCircle2, label: 'Approved' },
      denied: { variant: 'danger', icon: XCircle, label: 'Denied' },
      enrolled: { variant: 'primary', icon: UserCheck, label: 'Enrolled' },
      in_progress: { variant: 'teal', icon: Play, label: 'In Progress' },
      completed: { variant: 'secondary', icon: CheckCircle, label: 'Completed' },
      certified: { variant: 'warning', icon: Award, label: 'Certified' },
      withdrawn: { variant: 'secondary', icon: XCircle, label: 'Withdrawn' },
      failed: { variant: 'danger', icon: XCircle, label: 'Failed' },
      archived: { variant: 'secondary', icon: XCircle, label: 'Archived' },
    };
    return config[status] || { variant: 'secondary', icon: Clock, label: status };
  };

  const columns = [
    {
      header: 'Full Name',
      accessor: 'full_name' as const,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-900">{value}</span>
        </div>
      )
    },
    {
      header: 'Email',
      accessor: 'email' as const,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700">{value}</span>
        </div>
      )
    },
    {
      header: 'Phone',
      accessor: 'phone' as const,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700">{value}</span>
        </div>
      )
    },
    {
      header: 'Education',
      accessor: 'highest_education' as const,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700">{value}</span>
        </div>
      )
    },
    {
      header: 'Applied Training',
      accessor: 'training_programs' as const,
      render: (value: any) => (
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700">{value?.title || 'N/A'}</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status' as const,
      render: (value: string) => {
        const statusConfig = getStatusBadge(value);
        return (
          <Badge
            variant={statusConfig.variant}
            icon={statusConfig.icon}
          >
            {statusConfig.label}
          </Badge>
        );
      }
    },
    {
      header: 'History',
      accessor: 'status_history' as const,
      render: (_: any, row: TrainingApplication) => (
        <Button
          variant="secondary"
          size="sm"
          icon={History}
          onClick={() => handleViewHistory(row)}
          disabled={!row.status_history || row.status_history.length === 0}
        >
          {row.status_history && row.status_history.length > 0
            ? `${row.status_history.length} changes`
            : 'No history'}
        </Button>
      )
    },
    {
      header: 'Actions',
      accessor: 'id' as const,
      render: (_: any, row: TrainingApplication) => (
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            icon={Eye}
            onClick={() => handleView(row)}
          >
            View
          </Button>

          {/* Pending: Under Review, Approve, Deny */}
          {row.status === 'pending' && (
            <>
              <Button
                variant="primary"
                size="sm"
                icon={Eye}
                onClick={() => {
                  setSelectedApplication(row);
                  setUnderReviewModalOpen(true);
                }}
              >
                Under Review
              </Button>
              <Button
                variant="success"
                size="sm"
                icon={CheckCircle2}
                onClick={() => {
                  setSelectedApplication(row);
                  setApproveModalOpen(true);
                }}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={XCircle}
                onClick={() => {
                  setSelectedApplication(row);
                  setDenyModalOpen(true);
                }}
              >
                Deny
              </Button>
            </>
          )}

          {/* Under Review: Approve, Deny */}
          {row.status === 'under_review' && (
            <>
              <Button
                variant="success"
                size="sm"
                icon={CheckCircle2}
                onClick={() => {
                  setSelectedApplication(row);
                  setApproveModalOpen(true);
                }}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={XCircle}
                onClick={() => {
                  setSelectedApplication(row);
                  setDenyModalOpen(true);
                }}
              >
                Deny
              </Button>
            </>
          )}

          {/* Approved: Enroll */}
          {row.status === 'approved' && (
            <Button
              variant="primary"
              size="sm"
              icon={UserCheck}
              onClick={() => {
                setSelectedApplication(row);
                setEnrollModalOpen(true);
              }}
            >
              Enroll
            </Button>
          )}

          {/* Enrolled: Start Training */}
          {row.status === 'enrolled' && (
            <Button
              variant="teal"
              size="sm"
              icon={Play}
              onClick={() => {
                setSelectedApplication(row);
                setStartTrainingModalOpen(true);
              }}
            >
              Start Training
            </Button>
          )}

          {/* In Progress: Mark as Completed */}
          {row.status === 'in_progress' && (
            <Button
              variant="secondary"
              size="sm"
              icon={CheckCircle}
              onClick={() => {
                setSelectedApplication(row);
                setCompleteModalOpen(true);
              }}
            >
              Complete
            </Button>
          )}

          {/* Completed: Issue Certificate */}
          {row.status === 'completed' && (
            <Button
              variant="warning"
              size="sm"
              icon={Award}
              onClick={() => {
                setSelectedApplication(row);
                setCertifyModalOpen(true);
              }}
            >
              Issue Certificate
            </Button>
          )}
        </div>
      )
    },
  ];

  return (
    <AdminLayout role="PESO" userName={user?.fullName || 'PESO Admin'} pageTitle="Training Applications" pageDescription="Manage and review training program applications">
      <Container size="xl">
        <div className="space-y-6">
          {/* Refresh Button */}
          <div className="flex justify-end">
            <RefreshButton onRefresh={fetchApplications} label="Refresh" showLastRefresh={true} />
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card variant="flat" className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Applications</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {loading ? <Loader2 className="w-8 h-8 animate-spin text-gray-400" /> : applications.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card variant="flat" className="bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-orange-500 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {loading ? <Loader2 className="w-8 h-8 animate-spin text-gray-400" /> : applications.filter(a => a.status === 'pending').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card variant="flat" className="bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Approved</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {loading ? <Loader2 className="w-8 h-8 animate-spin text-gray-400" /> : applications.filter(a => a.status === 'approved').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-[#22A555] rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card variant="flat" className="bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-500 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Denied</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {loading ? <Loader2 className="w-8 h-8 animate-spin text-gray-400" /> : applications.filter(a => a.status === 'denied').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <XCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </div>

          {/* Program Filter */}
          {uniquePrograms.length > 0 && (
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2 text-gray-700">
                <Filter className="w-5 h-5" />
                <span className="font-medium">Filter by Program:</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={programFilter === 'all' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setProgramFilter('all')}
                >
                  All Programs ({applications.length})
                </Button>
                {uniquePrograms.map((program) => (
                  <Button
                    key={program}
                    variant={programFilter === program ? 'success' : 'secondary'}
                    size="sm"
                    onClick={() => setProgramFilter(program as string)}
                  >
                    {program} ({applications.filter(a => a.training_programs?.title === program).length})
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Applications Table */}
          <Card title="TRAINING APPLICATION LIST" headerColor="bg-[#D4F4DD]" variant="elevated" className="hover:shadow-xl transition-shadow">
            <EnhancedTable
              columns={columns}
              data={filteredApplications}
              searchable
              paginated
              pageSize={10}
              searchPlaceholder="Search by name, email, training, or status..."
              loading={loading}
            />
          </Card>
        </div>

        {/* View Details Modal */}
        <Modal
          isOpen={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false);
            setSelectedApplication(null);
          }}
          title="Application Details"
          size="lg"
        >
          {selectedApplication && (
            <div className="space-y-6">
              {/* Applicant Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-teal-600" />
                  Applicant Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Full Name</label>
                    <p className="text-gray-900 font-medium">{selectedApplication.full_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{selectedApplication.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-gray-900">{selectedApplication.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Address</label>
                    <p className="text-gray-900">{selectedApplication.address}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">Highest Educational Attainment</label>
                    <p className="text-gray-900">{selectedApplication.highest_education}</p>
                  </div>
                </div>
              </div>

              {/* Training Program Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-teal-600" />
                  Applied Training Program
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    {selectedApplication.training_programs?.title || 'N/A'}
                  </p>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>Duration: {selectedApplication.training_programs?.duration || 'N/A'}</span>
                    <span>Start Date: {selectedApplication.training_programs?.start_date
                      ? new Date(selectedApplication.training_programs.start_date).toLocaleDateString()
                      : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* ID Image */}
              {selectedApplication.id_image_url && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-teal-600" />
                    Submitted ID
                  </h3>
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={selectedApplication.id_image_url}
                      alt="Applicant ID"
                      className="w-full h-auto max-h-96 object-contain bg-gray-50"
                    />
                  </div>
                  <div className="mt-2 flex justify-end">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Download}
                      onClick={() => window.open(selectedApplication.id_image_url, '_blank')}
                    >
                      Download ID
                    </Button>
                  </div>
                </div>
              )}

              {/* Application Status */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-600" />
                  Application Status
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <div className="mt-1">
                        <Badge
                          variant={selectedApplication.status === 'approved' ? 'success' : selectedApplication.status === 'denied' ? 'danger' : 'warning'}
                          icon={selectedApplication.status === 'approved' ? CheckCircle : selectedApplication.status === 'denied' ? XCircle : Clock}
                        >
                          {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Submitted At</label>
                      <p className="text-gray-900">
                        {new Date(selectedApplication.submitted_at).toLocaleString()}
                      </p>
                    </div>
                    {selectedApplication.reviewed_at && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-600">Reviewed At</label>
                        <p className="text-gray-900">
                          {new Date(selectedApplication.reviewed_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Approve Confirmation Modal */}
        <Modal
          isOpen={approveModalOpen}
          onClose={() => {
            setApproveModalOpen(false);
            setSelectedApplication(null);
            setNextSteps('');
          }}
          title="Approve Application"
          size="md"
        >
          {selectedApplication && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-gray-700">
                  Approving application from{' '}
                  <span className="font-semibold">{selectedApplication.full_name}</span> for{' '}
                  <span className="font-semibold">{selectedApplication.training_programs?.title}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Next Steps (Optional)
                </label>
                <Textarea
                  value={nextSteps}
                  onChange={(e) => setNextSteps(e.target.value)}
                  placeholder="e.g., Please wait for enrollment confirmation email with training schedule and requirements..."
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This message will be included in the applicant's notification
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setApproveModalOpen(false);
                    setSelectedApplication(null);
                    setNextSteps('');
                  }}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="success"
                  icon={CheckCircle2}
                  onClick={handleApprove}
                  loading={actionLoading}
                >
                  Approve Application
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Deny Confirmation Modal */}
        <Modal
          isOpen={denyModalOpen}
          onClose={() => {
            setDenyModalOpen(false);
            setSelectedApplication(null);
            setDenialReason('');
          }}
          title="Deny Application"
          size="md"
        >
          {selectedApplication && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-gray-700">
                  Denying application from{' '}
                  <span className="font-semibold">{selectedApplication.full_name}</span> for{' '}
                  <span className="font-semibold">{selectedApplication.training_programs?.title}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Denial (Optional)
                </label>
                <Textarea
                  value={denialReason}
                  onChange={(e) => setDenialReason(e.target.value)}
                  placeholder="e.g., Does not meet minimum educational requirements for this program..."
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This message will be included in the applicant's notification
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setDenyModalOpen(false);
                    setSelectedApplication(null);
                    setDenialReason('');
                  }}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  icon={XCircle}
                  onClick={handleDeny}
                  loading={actionLoading}
                >
                  Deny Application
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Mark as Under Review Modal */}
        <Modal
          isOpen={underReviewModalOpen}
          onClose={() => {
            setUnderReviewModalOpen(false);
            setSelectedApplication(null);
          }}
          title="Mark as Under Review"
          size="md"
        >
          {selectedApplication && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-gray-700">
                  Mark application from{' '}
                  <span className="font-semibold">{selectedApplication.full_name}</span> as{' '}
                  <span className="font-semibold text-blue-700">Under Review</span>?
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  This indicates that the PESO office is currently reviewing the application.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setUnderReviewModalOpen(false);
                    setSelectedApplication(null);
                  }}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  icon={Eye}
                  onClick={handleUnderReview}
                  loading={actionLoading}
                >
                  Mark as Under Review
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Enroll Applicant Modal */}
        <Modal
          isOpen={enrollModalOpen}
          onClose={() => {
            setEnrollModalOpen(false);
            setSelectedApplication(null);
          }}
          title="Enroll Applicant"
          size="md"
        >
          {selectedApplication && (
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-gray-700">
                  Confirm enrollment of{' '}
                  <span className="font-semibold">{selectedApplication.full_name}</span> in{' '}
                  <span className="font-semibold">{selectedApplication.training_programs?.title}</span>?
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  The applicant will be officially enrolled in the training program.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEnrollModalOpen(false);
                    setSelectedApplication(null);
                  }}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  icon={UserCheck}
                  onClick={handleEnroll}
                  loading={actionLoading}
                >
                  Confirm Enrollment
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Start Training Modal */}
        <Modal
          isOpen={startTrainingModalOpen}
          onClose={() => {
            setStartTrainingModalOpen(false);
            setSelectedApplication(null);
          }}
          title="Start Training"
          size="md"
        >
          {selectedApplication && (
            <div className="space-y-4">
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <p className="text-gray-700">
                  Mark training as started for{' '}
                  <span className="font-semibold">{selectedApplication.full_name}</span>?
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  This indicates the applicant has begun the training program.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setStartTrainingModalOpen(false);
                    setSelectedApplication(null);
                  }}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="teal"
                  icon={Play}
                  onClick={handleStartTraining}
                  loading={actionLoading}
                >
                  Start Training
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Mark as Completed Modal */}
        <Modal
          isOpen={completeModalOpen}
          onClose={() => {
            setCompleteModalOpen(false);
            setSelectedApplication(null);
          }}
          title="Mark Training as Completed"
          size="md"
        >
          {selectedApplication && (
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700">
                  Mark training as completed for{' '}
                  <span className="font-semibold">{selectedApplication.full_name}</span>?
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  This indicates the applicant has successfully finished the training program.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setCompleteModalOpen(false);
                    setSelectedApplication(null);
                  }}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="secondary"
                  icon={CheckCircle}
                  onClick={handleComplete}
                  loading={actionLoading}
                >
                  Mark as Completed
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Issue Certificate Modal */}
        <Modal
          isOpen={certifyModalOpen}
          onClose={() => {
            setCertifyModalOpen(false);
            setSelectedApplication(null);
          }}
          title="Issue Training Certificate"
          size="md"
        >
          {selectedApplication && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-gray-700">
                  Issue training certificate to{' '}
                  <span className="font-semibold">{selectedApplication.full_name}</span> for{' '}
                  <span className="font-semibold">{selectedApplication.training_programs?.title}</span>?
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  The applicant will be marked as certified and can download their certificate.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setCertifyModalOpen(false);
                    setSelectedApplication(null);
                  }}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="warning"
                  icon={Award}
                  onClick={handleCertify}
                  loading={actionLoading}
                >
                  Issue Certificate
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Status History Modal */}
        <Modal
          isOpen={historyModalOpen}
          onClose={() => {
            setHistoryModalOpen(false);
            setSelectedApplication(null);
          }}
          title="Application Status History"
          size="xl"
        >
          {selectedApplication && (
            <div className="space-y-6">
              {/* Applicant Info Header */}
              <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-4 rounded-lg -mt-6 -mx-6 mb-6">
                <h3 className="text-lg font-bold">{selectedApplication.full_name}</h3>
                <p className="text-sm text-teal-100 mt-1">
                  {selectedApplication.training_programs?.title || 'N/A'}
                </p>
              </div>

              {/* Status Timeline */}
              {selectedApplication.status_history && selectedApplication.status_history.length > 0 ? (
                <StatusTimeline
                  statusHistory={selectedApplication.status_history}
                  currentStatus={selectedApplication.status}
                />
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">No status history available</p>
                  <p className="text-sm text-gray-500 mt-1">
                    This application has not been processed yet.
                  </p>
                </div>
              )}
            </div>
          )}
        </Modal>
      </Container>
    </AdminLayout>
  );
}
