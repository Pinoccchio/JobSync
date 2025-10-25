'use client';
import React, { useState, useCallback } from 'react';
import { AdminLayout } from '@/components/layout';
import { Card, EnhancedTable, Button, Container, Badge, RefreshButton } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
// import { useTableRealtime } from '@/hooks/useTableRealtime'; // REMOVED: Realtime disabled
import { Download, Trophy, Medal, Award, TrendingUp, User, Mail, Briefcase } from 'lucide-react';

export default function RankedRecordsPage() {
  const { showToast } = useToast();
  const { user } = useAuth();

  const [extractedData, setExtractedData] = useState([
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
  ]);

  const [rankedCandidates, setRankedCandidates] = useState([
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
  ]);

  // Fetch function for ranked records
  const fetchRankedRecords = useCallback(async () => {
    try {
      // TODO: Replace with real Supabase query
      // const { data, error } = await supabase
      //   .from('applications')
      //   .select('*, applicant_profiles(*), jobs(*)')
      //   .not('rank', 'is', null)
      //   .order('rank', { ascending: true });

      showToast('Rankings refreshed', 'success');
    } catch (error) {
      console.error('Error fetching rankings:', error);
      showToast('Failed to refresh rankings', 'error');
    }
  }, [showToast]);

  // REMOVED: Real-time subscription disabled for performance
  // useTableRealtime(
  //   'applications',
  //   ['UPDATE'],
  //   'rank=not.null',
  //   (payload) => {
  //     console.log('Ranking updated:', payload);
  //     showToast('Rankings updated in real-time', 'info');
  //     // fetchRankedRecords(); // Uncomment when real fetching is implemented
  //   }
  // );

  const extractedColumns = [
    { header: '#', accessor: 'no' as const },
    {
      header: 'Name',
      accessor: 'name' as const,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-900">{value}</span>
        </div>
      )
    },
    {
      header: 'Contact Info',
      accessor: 'contactInfo' as const,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700">{value}</span>
        </div>
      )
    },
    {
      header: 'Skills',
      accessor: 'skills' as const,
      render: (value: string) => (
        <Badge variant="info">{value}</Badge>
      )
    },
    { header: 'Education', accessor: 'education' as const },
    {
      header: 'Experience',
      accessor: 'experience' as const,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700">{value}</span>
        </div>
      )
    },
  ];

  const getRankIcon = (ranking: number) => {
    switch (ranking) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-orange-600" />;
      default:
        return null;
    }
  };

  const getRankBadgeVariant = (ranking: number): 'success' | 'info' | 'warning' | 'default' => {
    switch (ranking) {
      case 1:
        return 'success';
      case 2:
        return 'info';
      case 3:
        return 'warning';
      default:
        return 'default';
    }
  };

  const rankedColumns = [
    {
      header: 'Rank',
      accessor: 'ranking' as const,
      render: (value: number) => (
        <div className="flex items-center gap-2">
          {getRankIcon(value)}
          <Badge variant={getRankBadgeVariant(value)}>
            {value === 1 ? '1st' : value === 2 ? '2nd' : value === 3 ? '3rd' : `${value}th`}
          </Badge>
        </div>
      )
    },
    {
      header: 'Name',
      accessor: 'name' as const,
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
      header: 'Applied Position',
      accessor: 'appliedPosition' as const,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700">{value}</span>
        </div>
      )
    },
    {
      header: 'PDS Match Score',
      accessor: 'matchScore' as const,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#22A555]" />
          <span className="font-bold text-[#22A555] text-lg">{value}</span>
        </div>
      )
    },
  ];

  return (
    <AdminLayout role="HR" userName={user?.fullName || "HR Admin"} pageTitle="Extracted & Ranked PDS Records" pageDescription="AI-powered applicant ranking and analysis">
      <Container size="xl">
        <div className="space-y-8">
          {/* Refresh Button */}
          <div className="flex justify-end">
            <RefreshButton
              onRefresh={fetchRankedRecords}
              label="Refresh Rankings"
              showLastRefresh={true}
            />
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card variant="flat" className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Applicants</p>
                  <p className="text-3xl font-bold text-gray-900">{extractedData.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card variant="flat" className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Top Ranked</p>
                  <p className="text-3xl font-bold text-gray-900">{rankedCandidates.length}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card variant="flat" className="bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg. Match Score</p>
                  <p className="text-3xl font-bold text-gray-900">93.4%</p>
                </div>
                <div className="w-12 h-12 bg-[#22A555] rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card variant="flat" className="bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Positions</p>
                  <p className="text-3xl font-bold text-gray-900">1</p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </div>

          {/* Action Button */}
          <div className="flex items-center justify-end">
            <Button variant="success" icon={Download} onClick={() => showToast('Generate report feature coming soon', 'info')}>
              Generate Report
            </Button>
          </div>

          {/* Extracted Resume Data */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Extracted Resume Data</h2>
              <Badge variant="info">{extractedData.length} records</Badge>
            </div>
            <Card>
              <EnhancedTable
                columns={extractedColumns}
                data={extractedData}
                searchable
                paginated
                pageSize={10}
                searchPlaceholder="Search by name, skills, or experience..."
              />
            </Card>
          </div>

          {/* Ranked Candidates */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">AI-Ranked Candidates</h2>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <Badge variant="success">{rankedCandidates.length} candidates</Badge>
              </div>
            </div>
            <Card variant="elevated">
              <EnhancedTable
                columns={rankedColumns}
                data={rankedCandidates}
                searchable
                searchPlaceholder="Search by name, email, or position..."
              />
            </Card>
          </div>
        </div>
      </Container>
    </AdminLayout>
  );
}
