'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { AdminLayout } from '@/components/layout';
import { Card, EnhancedTable, Button, Container, Badge, RefreshButton, Modal } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';
import { getErrorMessage } from '@/lib/utils/errorMessages';
import { useAuth } from '@/contexts/AuthContext';
// import { useTableRealtime } from '@/hooks/useTableRealtime'; // REMOVED: Realtime disabled
import { Eye, CheckCircle, XCircle, User, Mail, Phone, MapPin, GraduationCap, Briefcase, Clock, Download, Image as ImageIcon, Filter, Loader2 } from 'lucide-react';

interface TrainingProgram {
  id: string;
  title: string;
  duration: string;
  start_date: string;
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
  status: 'pending' | 'approved' | 'denied';
  submitted_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  training_programs?: TrainingProgram;
}

export default function PESOApplicationsPage() {
  const { showToast } = useToast();
  const { user } = useAuth();

  const [applications, setApplications] = useState<TrainingApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [denyModalOpen, setDenyModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<TrainingApplication | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

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

  // Handle approve application
  const handleApprove = async () => {
    if (!selectedApplication) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/training/applications/${selectedApplication.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to approve application');
      }

      showToast(result.message || 'Application approved successfully', 'success');
      setApproveModalOpen(false);
      setSelectedApplication(null);
      fetchApplications();
    } catch (error: any) {
      console.error('Error approving application:', error);
      showToast(getErrorMessage(error), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle deny application
  const handleDeny = async () => {
    if (!selectedApplication) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/training/applications/${selectedApplication.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'denied' }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to deny application');
      }

      showToast(result.message || 'Application denied successfully', 'success');
      setDenyModalOpen(false);
      setSelectedApplication(null);
      fetchApplications();
    } catch (error: any) {
      console.error('Error denying application:', error);
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
        const variant = value === 'approved' ? 'success' : value === 'denied' ? 'danger' : 'warning';
        const icon = value === 'approved' ? CheckCircle : value === 'denied' ? XCircle : Clock;
        const label = value.charAt(0).toUpperCase() + value.slice(1);
        return <Badge variant={variant} icon={icon}>{label}</Badge>;
      }
    },
    {
      header: 'Actions',
      accessor: 'id' as const,
      render: (_: any, row: TrainingApplication) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={Eye}
            onClick={() => handleView(row)}
          >
            View
          </Button>
          {row.status === 'pending' && (
            <>
              <Button
                variant="success"
                size="sm"
                icon={CheckCircle}
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
          }}
          title="Approve Application"
          size="md"
        >
          {selectedApplication && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-gray-700">
                  Are you sure you want to <span className="font-semibold text-green-700">approve</span> the application from{' '}
                  <span className="font-semibold">{selectedApplication.full_name}</span> for{' '}
                  <span className="font-semibold">{selectedApplication.training_programs?.title}</span>?
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  The applicant will receive an in-app notification about the approval. They will see it in their notification bell icon.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setApproveModalOpen(false);
                    setSelectedApplication(null);
                  }}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="success"
                  icon={CheckCircle}
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
          }}
          title="Deny Application"
          size="md"
        >
          {selectedApplication && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-gray-700">
                  Are you sure you want to <span className="font-semibold text-red-700">deny</span> the application from{' '}
                  <span className="font-semibold">{selectedApplication.full_name}</span> for{' '}
                  <span className="font-semibold">{selectedApplication.training_programs?.title}</span>?
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  The applicant will receive an in-app notification about the denial. They will see it in their notification bell icon.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setDenyModalOpen(false);
                    setSelectedApplication(null);
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
      </Container>
    </AdminLayout>
  );
}
