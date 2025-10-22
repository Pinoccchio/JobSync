'use client';
import React from 'react';
import Link from 'next/link';
import { Card, EnhancedTable, Container, Badge } from '@/components/ui';
import { AdminLayout } from '@/components/layout';
import { FileText, CheckCircle, XCircle, Clock, TrendingUp, Info } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

export default function MyApplicationsPage() {
  const { showToast } = useToast();

  const applications = [
    {
      id: 1,
      position: 'IT Assistant Technician',
      type: 'Job Application',
      dateApplied: '2025-01-15',
      status: 'Pending Review',
      matchScore: '96.1%'
    },
    {
      id: 2,
      position: 'Web Development Training',
      type: 'Training Application',
      dateApplied: '2025-01-10',
      status: 'Approved',
      matchScore: 'N/A'
    },
    {
      id: 3,
      position: 'HR Officer',
      type: 'Job Application',
      dateApplied: '2025-01-05',
      status: 'Disapproved',
      matchScore: '78.5%'
    },
    {
      id: 4,
      position: 'Administrative Aide',
      type: 'Job Application',
      dateApplied: '2025-01-03',
      status: 'Pending Review',
      matchScore: '88.3%'
    },
    {
      id: 5,
      position: 'Digital Marketing Training',
      type: 'Training Application',
      dateApplied: '2024-12-28',
      status: 'Approved',
      matchScore: 'N/A'
    },
  ];

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

  return (
    <AdminLayout role="Applicant" userName="User" pageTitle="My Applications" pageDescription="Track the status of your job and training applications">
      <Container size="xl">

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card variant="flat">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
                <p className="text-sm text-gray-600">Total Applications</p>
              </div>
            </div>
          </Card>

          <Card variant="flat">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {applications.filter(a => a.status === 'Approved').length}
                </p>
                <p className="text-sm text-gray-600">Approved</p>
              </div>
            </div>
          </Card>

          <Card variant="flat">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {applications.filter(a => a.status === 'Pending Review').length}
                </p>
                <p className="text-sm text-gray-600">Pending Review</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Applications Table */}
        <Card title="APPLICATION HISTORY">
          <EnhancedTable
            columns={columns}
            data={applications}
            searchable
            searchPlaceholder="Search applications..."
            paginated
            pageSize={5}
            onExport={handleExport}
            exportLabel="Export to Excel"
          />
        </Card>

        {/* Application Status Legend */}
        <Card variant="flat" className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-[#22A555]" />
            <h3 className="font-semibold text-lg text-gray-900">Status Guide</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 mb-1">Pending Review</p>
                <p className="text-sm text-gray-700">Your application is being reviewed by HR</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 mb-1">Approved</p>
                <p className="text-sm text-gray-700">Congratulations! Your application has been approved</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 mb-1">Disapproved</p>
                <p className="text-sm text-gray-700">Unfortunately, your application was not successful this time</p>
              </div>
            </div>
          </div>
        </Card>
      </Container>
    </AdminLayout>
  );
}
