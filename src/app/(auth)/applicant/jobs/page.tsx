'use client';
import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { Button, Card, ApplicationModal, Container, Badge, RefreshButton, EnhancedTable } from '@/components/ui';
import { AdminLayout } from '@/components/layout';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
// import { useTableRealtime } from '@/hooks/useTableRealtime'; // REMOVED: Realtime disabled
import { Briefcase, MapPin, Clock, CheckCircle2, GraduationCap, Building, FileText, Filter } from 'lucide-react';

interface Job {
  title: string;
  company: string;
  description: string;
  requirements: string[];
  location?: string;
  type?: string;
}

export default function AuthenticatedJobsPage() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');

  const [jobs, setJobs] = useState<Job[]>([
    {
      title: 'IT Assistant Technician',
      company: 'Municipality of Asuncion',
      description: 'Technical support and system maintenance for municipal operations',
      requirements: ['Bachelor\'s Degree in IT', '2 years experience', 'CS Professional eligible'],
      location: 'Asuncion Municipal Hall',
      type: 'Full-time'
    },
    {
      title: 'HR Officer',
      company: 'Municipality of Asuncion',
      description: 'Manage recruitment and employee relations',
      requirements: ['Bachelor\'s Degree in Psychology/HRM', '3 years experience'],
      location: 'Asuncion Municipal Hall',
      type: 'Full-time'
    },
    {
      title: 'Accountant',
      company: 'Municipality of Asuncion',
      description: 'Financial reporting and budget management',
      requirements: ['Bachelor\'s Degree in Accountancy', 'CPA License', '2 years experience'],
      location: 'Asuncion Municipal Hall',
      type: 'Full-time'
    },
  ]);

  // Fetch jobs function
  const fetchJobs = useCallback(async () => {
    try {
      // TODO: Real implementation
      // const { data } = await supabase
      //   .from('jobs')
      //   .select('*')
      //   .eq('status', 'active')
      //   .order('created_at', { ascending: false });
      showToast('Jobs refreshed', 'success');
    } catch (error) {
      showToast('Failed to refresh jobs', 'error');
    }
  }, [showToast]);

  // REMOVED: Real-time subscription disabled for performance
  // useTableRealtime('jobs', ['INSERT', 'UPDATE', 'DELETE'], null, () => {
  //   showToast('Job listings updated', 'info');
  //   // fetchJobs(); // Uncomment when real data
  // });

  const handleApplyClick = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    const matchesType = filterType === 'all' || job.type === filterType;
    const matchesLocation = filterLocation === 'all' || job.location === filterLocation;
    return matchesType && matchesLocation;
  });

  // Calculate stats
  const stats = {
    totalJobs: jobs.length,
    fullTime: jobs.filter(j => j.type === 'Full-time').length,
    partTime: jobs.filter(j => j.type === 'Part-time').length,
    remote: jobs.filter(j => j.location?.includes('Remote')).length,
  };

  // Table columns
  const columns = [
    {
      header: 'Position',
      accessor: 'title' as const,
      render: (value: string, row: Job) => (
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-[#22A555]" />
          <div>
            <p className="font-medium text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{row.company}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Description',
      accessor: 'description' as const,
      render: (value: string) => (
        <span className="text-sm text-gray-600 line-clamp-2">{value}</span>
      )
    },
    {
      header: 'Location',
      accessor: 'location' as const,
      render: (value?: string) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700">{value || 'N/A'}</span>
        </div>
      )
    },
    {
      header: 'Type',
      accessor: 'type' as const,
      render: (value?: string) => (
        <Badge variant="info" icon={Clock}>{value || 'N/A'}</Badge>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions' as const,
      render: (_: any, row: Job) => (
        <Button
          variant="success"
          size="sm"
          onClick={() => handleApplyClick(row)}
        >
          Apply Now
        </Button>
      )
    },
  ];

  return (
    <AdminLayout role="Applicant" userName={user?.fullName || 'Applicant'} pageTitle="Job Opportunities" pageDescription="Browse and apply for available positions">
      <Container size="xl">
        <div className="space-y-6">
          {/* Refresh Button */}
          <div className="flex items-center justify-end">
            <RefreshButton onRefresh={fetchJobs} label="Refresh" showLastRefresh={true} />
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card variant="flat" className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Jobs</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalJobs}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card variant="flat" className="bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Full-Time</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.fullTime}</p>
                </div>
                <div className="w-12 h-12 bg-[#22A555] rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card variant="flat" className="bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Part-Time</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.partTime}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card variant="flat" className="bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Remote Available</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.remote}</p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Building className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#22A555] bg-white"
            >
              <option value="all">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
            </select>

            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#22A555] bg-white"
            >
              <option value="all">All Locations</option>
              <option value="Asuncion Municipal Hall">Asuncion Municipal Hall</option>
              <option value="Remote">Remote</option>
            </select>

            {(filterType !== 'all' || filterLocation !== 'all') && (
              <button
                onClick={() => {
                  setFilterType('all');
                  setFilterLocation('all');
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Jobs Table */}
          <Card title={`AVAILABLE POSITIONS (${filteredJobs.length})`} headerColor="bg-[#D4F4DD]">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600 font-medium">No jobs found</p>
                <p className="text-sm text-gray-500 mt-2">Try adjusting your filters</p>
              </div>
            ) : (
              <EnhancedTable
                columns={columns}
                data={filteredJobs}
                searchable
                paginated
                pageSize={10}
                searchPlaceholder="Search by position, company, or description..."
              />
            )}
          </Card>
        </div>
      </Container>

      {/* Application Modal */}
      <ApplicationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        job={selectedJob}
      />
    </AdminLayout>
  );
}
