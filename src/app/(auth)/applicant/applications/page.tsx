'use client';
import React from 'react';
import Link from 'next/link';
import { Card, Table } from '@/components/ui';
import { AdminLayout } from '@/components/layout';

export default function MyApplicationsPage() {
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
  ];

  const columns = [
    { header: 'Position/Program', accessor: 'position' },
    { header: 'Type', accessor: 'type' },
    { header: 'Date Applied', accessor: 'dateApplied' },
    {
      header: 'Status',
      accessor: 'status',
      render: (value: string) => {
        let colorClass = 'bg-yellow-100 text-yellow-800';
        if (value === 'Approved') colorClass = 'bg-green-100 text-green-800';
        if (value === 'Disapproved') colorClass = 'bg-red-100 text-red-800';

        return (
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
            {value}
          </span>
        );
      }
    },
    {
      header: 'Match Score',
      accessor: 'matchScore',
      render: (value: string) => (
        <span className="font-semibold text-[#22A555]">{value}</span>
      )
    },
  ];

  return (
    <AdminLayout role="Applicant" userName="User">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Applications</h1>

        <Card title="APPLICATION HISTORY">
          <Table columns={columns} data={applications} />
        </Card>

        {/* Application Status Legend */}
        <div className="mt-6 p-6 bg-white rounded-lg shadow-md">
          <h3 className="font-semibold text-lg mb-4">Status Guide</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                Pending Review
              </span>
              <span className="text-gray-700">Your application is being reviewed by HR</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">
                Approved
              </span>
              <span className="text-gray-700">Congratulations! Your application has been approved</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-800">
                Disapproved
              </span>
              <span className="text-gray-700">Unfortunately, your application was not successful this time</span>
            </div>
          </div>
        </div>
    </AdminLayout>
  );
}
