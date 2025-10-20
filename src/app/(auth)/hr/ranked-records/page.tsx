'use client';
import React from 'react';
import { AdminLayout } from '@/components/layout';
import { Card, Table, Button } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';

export default function RankedRecordsPage() {
  const { showToast } = useToast();
  const extractedData = [
    {
      no: 1,
      name: 'Micah Echavarre',
      contactInfo: 'micah@gmail.com',
      skills: 'Programmer',
      education: 'College',
      experience: '3 years in SZ Corp.'
    },
    {
      no: 2,
      name: 'Teffany Evora',
      contactInfo: 'teffany@gmail.com',
      skills: 'Grapic Designer',
      education: 'College',
      experience: '6 years in AB Comp.'
    },
    {
      no: 3,
      name: 'Diane Grace Manliquis',
      contactInfo: 'dianegrace@gmail.com',
      skills: 'IT Expert',
      education: 'College',
      experience: '5 years in Adata Inc.'
    },
    {
      no: 4,
      name: 'Rodrigo Onias',
      contactInfo: 'rodrigo@gmail.com',
      skills: 'Web Developer',
      education: 'College',
      experience: '4 years in XYZ corp.'
    },
  ];

  const rankedCandidates = [
    {
      ranking: 1,
      name: 'Rodrigo Onias',
      email: 'rodrigo@gmail.com',
      contactInfo: 'rodrigo@gmail.com',
      appliedPosition: 'IT Assistant Tech',
      matchScore: '96.1%'
    },
    {
      ranking: 2,
      name: 'Diane Grace Manliquis',
      email: 'dianegrace@gmail.com',
      contactInfo: 'dianegrace@gmail.com',
      appliedPosition: 'IT Assistant Tech',
      matchScore: '94.3%'
    },
    {
      ranking: 3,
      name: 'Micah Echavarre',
      email: 'micah@gmail.com',
      contactInfo: 'micah@gmail.com',
      appliedPosition: 'IT Assistant Tech',
      matchScore: '89.7%'
    },
  ];

  const extractedColumns = [
    { header: '#', accessor: 'no' },
    { header: 'Name', accessor: 'name' },
    { header: 'Contact Info', accessor: 'contactInfo' },
    { header: 'Skills', accessor: 'skills' },
    { header: 'Education', accessor: 'education' },
    { header: 'Experience', accessor: 'experience' },
  ];

  const rankedColumns = [
    { header: 'Ranking', accessor: 'ranking' },
    { header: 'Email', accessor: 'email' },
    { header: 'Contact Info', accessor: 'contactInfo' },
    { header: 'Applied Position', accessor: 'appliedPosition' },
    {
      header: 'PDS Match Score',
      accessor: 'matchScore',
      render: (value: string) => (
        <span className="font-bold text-[#22A555]">{value}</span>
      )
    },
  ];

  return (
    <AdminLayout role="HR" userName="HR Admin">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Analyzer and Ranking</h1>
          <Button variant="success" onClick={() => showToast('Generate report feature coming soon', 'info')}>
            📥 Generate Report
          </Button>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Extracted Resume Data Table
          </h2>
          <Card>
            <Table columns={extractedColumns} data={extractedData} />
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Ranked Candidates
          </h2>
          <Card>
            <Table columns={rankedColumns} data={rankedCandidates} />
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
