'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { AdminLayout } from '@/components/layout';
import { Card, EnhancedTable, Button, Container, Badge, RefreshButton } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Loader2, Calendar, User, Briefcase } from 'lucide-react';

interface Application {
  id: string;
  no: number;
  applicantName: string;
  email: string;
  jobTitle: string;
  fileName: string;
  uploadedDate: string;
  status: string;
  pdsUrl: string;
  ocrProcessed: boolean;
  aiProcessed: boolean;
  _raw: any;
}

export default function ScannedRecordsPage() {
  const { showToast } = useToast();
  const { user } = useAuth();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch applications
  const fetchScannedRecords = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/applications');
      const result = await response.json();

      if (result.success) {
        setApplications(
          result.data.map((app: any, index: number) => ({
            id: app.id,
            no: index + 1,
            applicantName: `${app.applicant_profiles?.first_name || ''} ${app.applicant_profiles?.surname || ''}`.trim() || 'Unknown',
            email: app.applicant_profiles?.profiles?.email || user?.email || 'N/A',
            jobTitle: app.jobs?.title || 'Unknown Position',
            fileName: app.pds_file_name || 'No file',
            uploadedDate: new Date(app.created_at).toLocaleDateString(),
            status: app.status,
            pdsUrl: app.pds_file_url,
            ocrProcessed: app.applicant_profiles?.ocr_processed || false,
            aiProcessed: app.applicant_profiles?.ai_processed || false,
            _raw: app,
          }))
        );
      } else {
        showToast(result.error || 'Failed to fetch applications', 'error');
      }
    } catch (error) {
      console.error('Error fetching records:', error);
      showToast('Failed to fetch applications', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, user]);

  useEffect(() => {
    fetchScannedRecords();
  }, [fetchScannedRecords]);

  // Download PDS
  const handleViewPDS = async (pdsUrl: string, applicantName: string) => {
    try {
      if (!pdsUrl) {
        showToast('PDS file not available', 'error');
        return;
      }

      // Extract bucket and path from the URL
      const url = new URL(pdsUrl);
      const pathMatch = url.pathname.match(/\/storage\/v1\/object\/sign\/([^\/]+)\/(.+)\?/);

      if (!pathMatch) {
        // Direct download if it's already a signed URL
        window.open(pdsUrl, '_blank');
        return;
      }

      const bucket = pathMatch[1];
      const path = pathMatch[2];

      // Get fresh signed URL
      const response = await fetch(`/api/storage?bucket=${bucket}&path=${encodeURIComponent(path)}`);
      const result = await response.json();

      if (result.success) {
        window.open(result.data.signedUrl, '_blank');
      } else {
        showToast(result.error || 'Failed to get download link', 'error');
      }
    } catch (error) {
      console.error('Error viewing PDS:', error);
      showToast('Failed to view PDS', 'error');
    }
  };

  const columns = [
    {
      header: 'No.',
      accessor: 'no' as const,
      render: (value: number) => (
        <span className="font-medium text-gray-900">{value}</span>
      )
    },
    {
      header: 'Applicant Name',
      accessor: 'applicantName' as const,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-900">{value}</span>
        </div>
      )
    },
    {
      header: 'Position Applied',
      accessor: 'jobTitle' as const,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700">{value}</span>
        </div>
      )
    },
    {
      header: 'PDS File Name',
      accessor: 'fileName' as const,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700 truncate max-w-xs" title={value}>{value}</span>
        </div>
      )
    },
    {
      header: 'Upload Date',
      accessor: 'uploadedDate' as const,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700">{value}</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status' as const,
      render: (value: string) => (
        <Badge
          variant={value === 'approved' ? 'success' : value === 'denied' ? 'danger' : 'warning'}
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions' as const,
      render: (_: any, row: Application) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={FileText}
            onClick={() => handleViewPDS(row.pdsUrl, row.applicantName)}
            title="View PDS"
          >
            View PDS
          </Button>
        </div>
      )
    },
  ];

  // Calculate stats
  const totalPDS = applications.length;
  const pendingCount = applications.filter((a) => a.status === 'pending').length;
  const approvedToday = applications.filter((a) => {
    const today = new Date().toDateString();
    const uploadDate = new Date(a._raw.created_at).toDateString();
    return a.status === 'approved' && uploadDate === today;
  }).length;

  return (
    <AdminLayout role="HR" userName={user?.fullName || "HR Admin"} pageTitle="Scanned PDS Records" pageDescription="Manage uploaded Personal Data Sheets">
      <Container size="xl">
        <div className="space-y-6">
          {/* Refresh Button */}
          <div className="flex justify-end">
            <RefreshButton
              onRefresh={fetchScannedRecords}
              label="Refresh Applications"
              showLastRefresh={true}
            />
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card variant="flat" className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total PDS Uploaded</p>
                  <p className="text-3xl font-bold text-gray-900">{totalPDS}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card variant="flat" className="bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Review</p>
                  <p className="text-3xl font-bold text-gray-900">{pendingCount}</p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Loader2 className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card variant="flat" className="bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Approved Today</p>
                  <p className="text-3xl font-bold text-gray-900">{approvedToday}</p>
                </div>
                <div className="w-12 h-12 bg-[#22A555] rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </div>

          {/* PDS Records Table */}
          <Card title="LIST OF PDS UPLOADED BY APPLICANTS" headerColor="bg-[#D4F4DD]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#22A555] animate-spin" />
                <span className="ml-3 text-gray-600">Loading PDS records...</span>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No PDS files uploaded yet
              </div>
            ) : (
              <EnhancedTable
                columns={columns}
                data={applications}
                searchable
                paginated
                pageSize={10}
                searchPlaceholder="Search by applicant name, position, or file name..."
              />
            )}
          </Card>
        </div>
      </Container>
    </AdminLayout>
  );
}
