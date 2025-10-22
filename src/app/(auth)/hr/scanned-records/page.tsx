'use client';
import React from 'react';
import { AdminLayout } from '@/components/layout';
import { Card, EnhancedTable, Button, Container, Badge } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';
import { Eye, CheckCircle, XCircle, FileText } from 'lucide-react';

export default function ScannedRecordsPage() {
  const { showToast } = useToast();

  const applicants = [
    {
      no: 1,
      name: 'Angelo Belleza',
      fileName: 'CS-Form-No.-212-Personal-Data-Sheet-revised-2.pdf',
      status: 'pending'
    },
    {
      no: 2,
      name: 'Roda Ford',
      fileName: 'CS-Form-No.-212-Personal-Data-Sheet-revised-2.pdf',
      status: 'pending'
    },
    {
      no: 3,
      name: 'Diane Wens',
      fileName: 'CS-Form-No.-212-Personal-Data-Sheet-revised.pdf',
      status: 'pending'
    },
    {
      no: 4,
      name: 'James Carter',
      fileName: 'CS-Form-No.-212-Personal-Data-Sheet-revised.pdf',
      status: 'pending'
    },
  ];

  const columns = [
    { header: 'No.', accessor: 'no' as const },
    { header: 'Applicant Name', accessor: 'name' as const },
    {
      header: 'File Name',
      accessor: 'fileName' as const,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700">{value}</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status' as const,
      render: (value: string) => (
        <Badge variant="warning" icon={CheckCircle}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions' as const,
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={Eye}
            onClick={() => showToast('View feature coming soon', 'info')}
          >
            View
          </Button>
          <Button
            variant="success"
            size="sm"
            icon={CheckCircle}
            onClick={() => showToast('Approve feature coming soon', 'info')}
          >
            Approve
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={XCircle}
            onClick={() => showToast('Disapprove feature coming soon', 'info')}
          >
            Disapprove
          </Button>
        </div>
      )
    },
  ];

  return (
    <AdminLayout role="HR" userName="HR Admin" pageTitle="Scanned PDS Records" pageDescription="Manage uploaded Personal Data Sheets">
      <Container size="xl">
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card variant="flat" className="bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total PDS Uploaded</p>
                  <p className="text-3xl font-bold text-gray-900">{applicants.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card variant="flat" className="bg-gradient-to-br from-orange-50 to-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Review</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {applicants.filter(a => a.status === 'pending').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card variant="flat" className="bg-gradient-to-br from-green-50 to-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Approved Today</p>
                  <p className="text-3xl font-bold text-gray-900">0</p>
                </div>
                <div className="w-12 h-12 bg-[#22A555] rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </div>

          {/* PDS Records Table */}
          <Card title="LIST OF PDS UPLOADED BY APPLICANTS" headerColor="bg-[#D4F4DD]">
            <EnhancedTable
              columns={columns}
              data={applicants}
              searchable
              paginated
              pageSize={10}
              searchPlaceholder="Search applicants by name or file..."
            />
          </Card>
        </div>
      </Container>
    </AdminLayout>
  );
}
