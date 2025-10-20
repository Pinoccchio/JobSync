'use client';
import React, { useState } from 'react';
import { AdminLayout } from '@/components/layout';
import { Card, Table, Button, Input } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';

export default function ScannedRecordsPage() {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

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
    { header: 'No.', accessor: 'no' },
    { header: 'Applicant Name', accessor: 'name' },
    { header: 'File Name', accessor: 'fileName' },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          <Button
            variant="teal"
            size="sm"
            onClick={() => showToast('View feature coming soon', 'info')}
          >
            VIEW
          </Button>
          <Button
            variant="warning"
            size="sm"
            onClick={() => showToast('Approve feature coming soon', 'info')}
          >
            approve
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => showToast('Disapprove feature coming soon', 'info')}
          >
            disapprove
          </Button>
        </div>
      )
    },
  ];

  return (
    <AdminLayout role="HR" userName="HR Admin">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Scanned Resume Records</h1>

        <div className="flex gap-4">
          <Input
            type="text"
            placeholder="Search for..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
          <Button
            variant="success"
            onClick={() => showToast('Search feature coming soon', 'info')}
          >
            🔍 Search
          </Button>
        </div>

        <Card title="LIST OF PDS UPLOADED BY APPLICANTS" headerColor="bg-[#D4F4DD]">
          <Table columns={columns} data={applicants} />
        </Card>
      </div>
    </AdminLayout>
  );
}
