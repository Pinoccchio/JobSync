'use client';
import React from 'react';
import { AdminLayout } from '@/components/layout';
import { Card, Table, Button } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';

export default function PESOApplicationsPage() {
  const { showToast } = useToast();
  const applications = [
    {
      id: 1,
      name: 'Juan Dela Cruz',
      email: 'juan@email.com',
      phone: '09123456789',
      address: 'Asuncion, Davao del Norte',
      education: 'Bachelor of Science in Information Technology',
      training: 'Web Development Training',
      status: 'Pending'
    },
    {
      id: 2,
      name: 'Maria Santos',
      email: 'maria@email.com',
      phone: '09187654321',
      address: 'Asuncion, Davao del Norte',
      education: 'Bachelor of Science in Business Administration',
      training: 'Digital Marketing Training',
      status: 'Pending'
    },
    {
      id: 3,
      name: 'Pedro Gonzales',
      email: 'pedro@email.com',
      phone: '09111222333',
      address: 'Asuncion, Davao del Norte',
      education: 'Bachelor of Science in Computer Science',
      training: 'Data Analytics Training',
      status: 'Approved'
    },
  ];

  const columns = [
    { header: 'Full Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Address', accessor: 'address' },
    { header: 'Education', accessor: 'education' },
    { header: 'Applied Training', accessor: 'training' },
    { header: 'Status', accessor: 'status',
      render: (value: string) => (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          value === 'Approved' ? 'bg-green-100 text-green-800' :
          value === 'Rejected' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: () => (
        <div className="flex gap-2">
          <Button
            variant="teal"
            size="sm"
            onClick={() => showToast('View details feature coming soon', 'info')}
          >
            View Details
          </Button>
          <Button
            variant="warning"
            size="sm"
            onClick={() => showToast('Approve feature coming soon', 'info')}
          >
            Approve
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => showToast('Reject feature coming soon', 'info')}
          >
            Reject
          </Button>
        </div>
      )
    },
  ];

  return (
    <AdminLayout role="PESO" userName="PESO Admin">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Training Applications</h1>

        <Card title="TRAINING APPLICATION LIST">
          <Table columns={columns} data={applications} />
        </Card>
      </div>
    </AdminLayout>
  );
}
