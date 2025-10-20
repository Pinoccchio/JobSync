'use client';
import React from 'react';
import { AdminLayout } from '@/components/layout';
import { DashboardTile, Card, Button } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';

export default function HRDashboard() {
  const { showToast } = useToast();
  // Mock data
  const tiles = [
    { title: 'Total PDS Scanned', value: '40' },
    { title: 'Number of PDS Pending Review', value: '25' },
    { title: 'Jobs with No Qualified Matches', value: '100' },
    { title: 'Total Approved Applications', value: '15' },
    { title: 'Total Rejected Applications', value: '8' },
    { title: 'Active Job Postings', value: '12' },
  ];

  return (
    <AdminLayout role="HR" userName="Micah Echavarre">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <Button variant="success" onClick={() => showToast('Generate report feature coming soon', 'info')}>
            📥 Generate Report
          </Button>
        </div>

        {/* Dashboard Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tiles.map((tile, index) => (
            <DashboardTile
              key={index}
              title={tile.title}
              value={tile.value}
            />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Applicants Chart */}
          <Card title="MONTHLY APPLICANTS" headerColor="bg-[#D4F4DD]">
            <div className="h-64 flex items-center justify-center">
              <svg viewBox="0 0 400 200" className="w-full h-full">
                {/* Simple line chart illustration */}
                <polyline
                  points="20,180 60,120 100,80 140,100 180,90 220,110 260,70 300,90 340,60 380,50"
                  fill="none"
                  stroke="#22A555"
                  strokeWidth="3"
                />
                <line x1="20" y1="180" x2="380" y2="180" stroke="#ccc" strokeWidth="2"/>
                <line x1="20" y1="20" x2="20" y2="180" stroke="#ccc" strokeWidth="2"/>
                <text x="200" y="195" textAnchor="middle" fill="#666" fontSize="12">Months</text>
                <text x="10" y="15" fill="#666" fontSize="12">6,000</text>
                <text x="10" y="95" fill="#666" fontSize="12">4,000</text>
                <text x="10" y="175" fill="#666" fontSize="12">0</text>
              </svg>
            </div>
          </Card>

          {/* Job Matched Chart */}
          <Card title="JOB MATCHED" headerColor="bg-[#D4F4DD]">
            <div className="h-64 flex items-center justify-center">
              <div className="relative">
                {/* Simple donut chart illustration */}
                <svg width="200" height="200" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="30"
                    strokeDasharray="150 502"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#20C997"
                    strokeWidth="30"
                    strokeDasharray="120 502"
                    strokeDashoffset="-150"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="30"
                    strokeDasharray="80 502"
                    strokeDashoffset="-270"
                  />
                </svg>
              </div>
              <div className="ml-8 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm text-gray-700">Job 1</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#20C997] rounded"></div>
                  <span className="text-sm text-gray-700">Job 2</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span className="text-sm text-gray-700">Job 3</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
