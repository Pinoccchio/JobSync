'use client';
import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Button, Card, ApplicationModal, Container, Badge, RefreshButton, EnhancedTable } from '@/components/ui';
import { AdminLayout } from '@/components/layout';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/lib/utils/errorMessages';
// import { useTableRealtime } from '@/hooks/useTableRealtime'; // REMOVED: Realtime disabled
import { Briefcase, MapPin, Clock, CheckCircle2, GraduationCap, Building, FileText, Filter, Loader2, LayoutGrid, List, Star, Award, Calendar, TrendingUp, User } from 'lucide-react';
import { formatShortDate, formatRelativeDate, getCreatorTooltip } from '@/lib/utils/dateFormatters';

interface Job {
  id: string;
  title: string;
  description: string;
  degree_requirement: string;
  eligibilities: string[];
  skills: string[];
  years_of_experience: number;
  location: string | null;
  employment_type: string | null;
  remote: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  profiles?: {
    id: string;
    full_name: string;
    role: string;
  } | null;
}

export default function AuthenticatedJobsPage() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card'); // Default to card view
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch jobs function
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/jobs?status=active');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch jobs');
      }

      setJobs(result.data || []);
      showToast('Jobs refreshed', 'success');
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
      showToast(getErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Fetch jobs on component mount
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // REMOVED: Real-time subscription disabled for performance
  // useTableRealtime('jobs', ['INSERT', 'UPDATE', 'DELETE'], null, () => {
  //   showToast('Job listings updated', 'info');
  //   fetchJobs();
  // });

  const handleApplyClick = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };

  const handleApplicationSuccess = () => {
    // Refresh jobs list after successful application
    fetchJobs();
  };

  // Filter jobs with search
  const filteredJobs = jobs.filter(job => {
    const matchesType = filterType === 'all' || job.employment_type === filterType;
    const matchesLocation = filterLocation === 'all' ||
      (filterLocation === 'Remote' ? job.remote : job.location === filterLocation);
    const matchesSearch = searchQuery === '' ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.degree_requirement.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesLocation && matchesSearch;
  });

  // Helper function to get card gradient color
  const getCardGradient = (index: number) => {
    const gradients = [
      'from-blue-500/10 to-blue-600/5',
      'from-purple-500/10 to-purple-600/5',
      'from-teal-500/10 to-teal-600/5',
      'from-orange-500/10 to-orange-600/5',
      'from-green-500/10 to-green-600/5',
      'from-pink-500/10 to-pink-600/5',
    ];
    return gradients[index % gradients.length];
  };

  // Helper function to check if job is new (posted within last 3 days)
  const isNewJob = (createdAt: string) => {
    const jobDate = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - jobDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  };

  // Helper function to format date
  const formatPostedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Posted today';
    if (diffDays === 1) return 'Posted yesterday';
    if (diffDays < 7) return `Posted ${diffDays} days ago`;
    if (diffDays < 30) return `Posted ${Math.floor(diffDays / 7)} weeks ago`;
    return `Posted ${Math.floor(diffDays / 30)} months ago`;
  };

  // Calculate stats
  const stats = {
    totalJobs: jobs.length,
    fullTime: jobs.filter(j => j.employment_type === 'Full-time').length,
    partTime: jobs.filter(j => j.employment_type === 'Part-time').length,
    remote: jobs.filter(j => j.remote).length,
  };

  // Get unique employment types and locations for filters
  const employmentTypes = Array.from(new Set(jobs.map(j => j.employment_type).filter(Boolean)));
  const locations = Array.from(new Set(jobs.map(j => j.location).filter(Boolean)));

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
            <p className="text-xs text-gray-500">Municipality of Asuncion</p>
          </div>
        </div>
      )
    },
    {
      header: 'Posted By',
      accessor: 'profiles' as const,
      render: (_: any, row: Job) => (
        <div
          className="flex items-start gap-2"
          title={getCreatorTooltip(row.profiles || null, row.created_at)}
        >
          <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {row.profiles?.full_name || 'Unknown'}
            </p>
            <p className="text-xs text-gray-500">
              {formatShortDate(row.created_at)}
            </p>
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
      render: (value: string | null, row: Job) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <div>
            <span className="text-sm text-gray-700">{value || 'Not specified'}</span>
            {row.remote && <span className="ml-2 text-xs text-blue-600">• Remote</span>}
          </div>
        </div>
      )
    },
    {
      header: 'Type',
      accessor: 'employment_type' as const,
      render: (value: string | null) => (
        <Badge variant="info" icon={Clock}>{value || 'Not specified'}</Badge>
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
          {/* Refresh Button & View Toggle */}
          <div className="flex items-center justify-between">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-white rounded-lg border-2 border-gray-200 p-1">
              <button
                onClick={() => setViewMode('card')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  viewMode === 'card'
                    ? 'bg-[#22A555] text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="text-sm font-medium">Card View</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  viewMode === 'table'
                    ? 'bg-[#22A555] text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <List className="w-4 h-4" />
                <span className="text-sm font-medium">Table View</span>
              </button>
            </div>

            <RefreshButton onRefresh={fetchJobs} label="Refresh" showLastRefresh={true} />
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card variant="flat" className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Jobs</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {loading ? '...' : stats.totalJobs}
                  </p>
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
                  <p className="text-3xl font-bold text-gray-900">
                    {loading ? '...' : stats.fullTime}
                  </p>
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
                  <p className="text-3xl font-bold text-gray-900">
                    {loading ? '...' : stats.partTime}
                  </p>
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
                  <p className="text-3xl font-bold text-gray-900">
                    {loading ? '...' : stats.remote}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Building className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search jobs by title, description, or requirements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-3 pl-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#22A555] transition-colors"
              />
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-600 hidden md:block" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#22A555] bg-white min-w-[140px]"
              >
                <option value="all">All Types</option>
                {employmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#22A555] bg-white min-w-[160px]"
              >
                <option value="all">All Locations</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
                <option value="Remote">Remote</option>
              </select>

              {(filterType !== 'all' || filterLocation !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setFilterType('all');
                    setFilterLocation('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2.5 text-sm text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Jobs Content - Card or Table View */}
          {viewMode === 'card' ? (
            /* Card View */
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Available Positions ({filteredJobs.length})
                </h2>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-[#22A555] animate-spin" />
                  <span className="ml-3 text-gray-600">Loading jobs...</span>
                </div>
              ) : filteredJobs.length === 0 ? (
                <Card className="text-center py-16">
                  <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
                  <p className="text-gray-600 mb-4">
                    {jobs.length === 0 ? 'No active job postings at the moment. Check back soon!' : 'Try adjusting your search or filters'}
                  </p>
                  {(filterType !== 'all' || filterLocation !== 'all' || searchQuery) && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFilterType('all');
                        setFilterLocation('all');
                        setSearchQuery('');
                      }}
                    >
                      Clear All Filters
                    </Button>
                  )}
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                  {filteredJobs.map((job, index) => (
                    <Card key={job.id} variant="interactive" noPadding className="group hover:shadow-xl transition-all duration-300">
                      {/* Colored Top Border */}
                      <div className={`h-3 bg-gradient-to-r ${getCardGradient(index)}`}></div>

                      <div className="p-6 space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3 mb-2">
                              <div className="w-12 h-12 bg-[#22A555]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Briefcase className="w-6 h-6 text-[#22A555]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#22A555] transition-colors mb-1 line-clamp-2">
                                  {job.title}
                                </h3>
                                <p className="text-sm text-gray-500">Municipality of Asuncion</p>
                              </div>
                            </div>
                          </div>

                          {/* Badges */}
                          <div className="flex flex-col gap-2">
                            {isNewJob(job.created_at) && (
                              <Badge variant="success" size="sm" className="whitespace-nowrap">
                                🆕 New
                              </Badge>
                            )}
                            {job.remote && (
                              <Badge variant="info" size="sm" className="whitespace-nowrap">
                                🌐 Remote
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                          {job.description}
                        </p>

                        {/* Creator Info */}
                        {job.profiles && (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            Posted by {job.profiles.full_name} • {formatRelativeDate(job.created_at)}
                          </p>
                        )}

                        {/* Key Requirements */}
                        <div className="grid grid-cols-1 gap-3 bg-gray-50 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <GraduationCap className="w-4 h-4 text-[#22A555] mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-500 mb-0.5">Degree Requirement</p>
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {job.degree_requirement}
                              </p>
                            </div>
                          </div>

                          {job.years_of_experience > 0 && (
                            <div className="flex items-start gap-2">
                              <Award className="w-4 h-4 text-[#22A555] mt-0.5 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs text-gray-500 mb-0.5">Experience Required</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {job.years_of_experience} {job.years_of_experience === 1 ? 'year' : 'years'}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Skills & Eligibilities */}
                        {((job.skills && job.skills.length > 0) || (job.eligibilities && job.eligibilities.length > 0)) && (
                          <div className="flex flex-wrap gap-2">
                            {job.skills && job.skills.slice(0, 3).map((skill, idx) => (
                              <Badge key={`skill-${idx}`} size="sm" variant="default">
                                {skill}
                              </Badge>
                            ))}
                            {job.eligibilities && job.eligibilities.slice(0, 2).map((elig, idx) => (
                              <Badge key={`elig-${idx}`} size="sm" variant="default">
                                {elig}
                              </Badge>
                            ))}
                            {((job.skills?.length || 0) + (job.eligibilities?.length || 0)) > 5 && (
                              <Badge size="sm" variant="default">
                                +{((job.skills?.length || 0) + (job.eligibilities?.length || 0)) - 5} more
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Footer Info */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{job.location || 'Not specified'}</span>
                            </div>
                            {job.employment_type && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{job.employment_type}</span>
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {formatPostedDate(job.created_at)}
                          </div>
                        </div>

                        {/* Apply Button */}
                        <Button
                          variant="success"
                          className="w-full shadow-md hover:shadow-lg transition-shadow"
                          size="lg"
                          icon={CheckCircle2}
                          onClick={() => handleApplyClick(job)}
                        >
                          Apply Now
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Table View */
            <Card title={`AVAILABLE POSITIONS (${filteredJobs.length})`} headerColor="bg-[#D4F4DD]">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-[#22A555] animate-spin" />
                  <span className="ml-3 text-gray-600">Loading jobs...</span>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-600 font-medium">No jobs found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {jobs.length === 0 ? 'No active job postings at the moment' : 'Try adjusting your filters'}
                  </p>
                </div>
              ) : (
                <EnhancedTable
                  columns={columns}
                  data={filteredJobs}
                  searchable
                  paginated
                  pageSize={10}
                  searchPlaceholder="Search by position or description..."
                />
              )}
            </Card>
          )}
        </div>
      </Container>

      {/* Application Modal */}
      <ApplicationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        job={selectedJob}
        onSuccess={handleApplicationSuccess}
      />
    </AdminLayout>
  );
}
