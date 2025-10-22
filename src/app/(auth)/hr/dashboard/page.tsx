'use client';
import React from 'react';
import { AdminLayout } from '@/components/layout';
import { DashboardTile, Card, Button, Container } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';
import { Download, FileText, Clock, XCircle, CheckCircle2, Briefcase, AlertCircle } from 'lucide-react';

export default function HRDashboard() {
  const { showToast } = useToast();
  // Mock data with icons and colors
  const tiles = [
    { title: 'Total PDS Scanned', value: '40', icon: FileText, color: 'from-blue-500 to-blue-600' },
    { title: 'Number of PDS Pending Review', value: '25', icon: Clock, color: 'from-orange-500 to-orange-600' },
    { title: 'Jobs with No Qualified Matches', value: '100', icon: AlertCircle, color: 'from-red-500 to-red-600' },
    { title: 'Total Approved Applications', value: '15', icon: CheckCircle2, color: 'from-green-500 to-green-600' },
    { title: 'Total Rejected Applications', value: '8', icon: XCircle, color: 'from-gray-500 to-gray-600' },
    { title: 'Active Job Postings', value: '12', icon: Briefcase, color: 'from-purple-500 to-purple-600' },
  ];

  return (
    <AdminLayout role="HR" userName="Micah Echavarre" pageTitle="Dashboard" pageDescription="Overview of hiring statistics and metrics">
      <Container size="xl">
        <div className="space-y-8">
          {/* Generate Report Button */}
          <div className="flex items-center justify-end">
            <Button variant="success" icon={Download} onClick={() => showToast('Generate report feature coming soon', 'info')}>
              Generate Report
            </Button>
          </div>

          {/* Dashboard Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tiles.map((tile, index) => {
              const Icon = tile.icon;
              return (
                <Card key={index} variant="elevated" className="hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">{tile.title}</p>
                      <p className="text-4xl font-bold text-gray-900">{tile.value}</p>
                    </div>
                    <div className={`w-16 h-16 bg-gradient-to-br ${tile.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Applicants Chart */}
            <Card title="MONTHLY APPLICANTS" headerColor="bg-[#D4F4DD]" variant="elevated">
              <div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white rounded-lg p-4">
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
            <Card title="JOB MATCHED" headerColor="bg-[#D4F4DD]" variant="elevated">
              <div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white rounded-lg p-4">
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
                <div className="ml-8 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded shadow-sm"></div>
                    <span className="text-sm font-medium text-gray-700">IT Assistant Tech</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-[#20C997] rounded shadow-sm"></div>
                    <span className="text-sm font-medium text-gray-700">HR Officer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-500 rounded shadow-sm"></div>
                    <span className="text-sm font-medium text-gray-700">Accountant</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </AdminLayout>
  );
}
