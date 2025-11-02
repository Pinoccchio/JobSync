'use client';
import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Button, Card, ApplicationModal, Container, Badge, RefreshButton } from '@/components/ui';
import { AdminLayout } from '@/components/layout';
import { ApplicationStatusBadge, AppliedBadge } from '@/components/ApplicationStatusBadge';
import { StatusTimeline } from '@/components/hr/StatusTimeline';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/lib/utils/errorMessages';
// import { useTableRealtime } from '@/hooks/useTableRealtime'; // REMOVED: Realtime disabled
import { Briefcase, MapPin, Clock, CheckCircle2, GraduationCap, Building, FileText, Filter, Loader2, Star, Award, Calendar, TrendingUp, User, CheckCircle, Eye, History, X } from 'lucide-react';
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

interface StatusHistoryItem {
  from: string | null;
  to: string;
  changed_at: string;
  changed_by?: string;
}

interface Application {
  id: string;
  job_id: string;
  applicant_id: string;
  status: 'pending' | 'under_review' | 'shortlisted' | 'interviewed' | 'approved' | 'denied' | 'hired' | 'archived' | 'withdrawn';
  rank: number | null;
  match_score: number | null;
  created_at: string;
  updated_at: string;
  status_history?: StatusHistoryItem[];
}

interface JobWithApplication extends Job {
  userApplication: Application | null;
  hasApplied: boolean;
}

export default function AuthenticatedJobsPage() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [filterApplicationStatus, setFilterApplicationStatus] = useState<string>('all'); // all, applied, not-applied
  const [filterStatus, setFilterStatus] = useState<string>('all'); // all, pending, approved, denied
  const [jobs, setJobs] = useState<Job[]>([]);
  const [userApplications, setUserApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Status History Modal state
  const [showStatusHistoryModal, setShowStatusHistoryModal] = useState(false);
  const [selectedApplicationForHistory, setSelectedApplicationForHistory] = useState<Application | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Skills expansion state
  const [expandedSkillsCards, setExpandedSkillsCards] = useState<Set<string>>(new Set());

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

  // Fetch user applications function
  const fetchUserApplications = useCallback(async () => {
    try {
      setLoadingApplications(true);
      const response = await fetch('/api/applications');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch applications');
      }

      setUserApplications(result.data || []);
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      // Don't show error toast - this is non-critical data
      setUserApplications([]);
    } finally {
      setLoadingApplications(false);
    }
  }, []);

  // Fetch jobs and applications on component mount
  useEffect(() => {
    fetchJobs();
    fetchUserApplications();
  }, [fetchJobs, fetchUserApplications]);

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
    // Refresh applications list after successful application
    // Toast is already shown by ApplicationModal, just refresh data
    fetchUserApplications();
  };

  // Handle View Status History
  const handleViewStatusHistory = async (application: Application) => {
    try {
      setLoadingHistory(true);
      setShowStatusHistoryModal(true);

      // Fetch full application details including status_history
      const response = await fetch(`/api/applications/${application.id}`);
      const result = await response.json();

      if (result.success && result.data) {
        setSelectedApplicationForHistory({
          ...application,
          status_history: result.data.status_history || []
        });
      } else {
        setSelectedApplicationForHistory(application);
      }
    } catch (error) {
      console.error('Error fetching application details:', error);
      setSelectedApplicationForHistory(application);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Handle Toggle Skills Expansion
  const toggleSkillsExpansion = (jobId: string) => {
    setExpandedSkillsCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  // Helper functions for application status
  const getApplicationForJob = (jobId: string): Application | null => {
    return userApplications.find(app => app.job_id === jobId) || null;
  };

  const hasAppliedToJob = (jobId: string): boolean => {
    const application = getApplicationForJob(jobId);
    // Don't count withdrawn applications as "applied"
    return !!application && application.status !== 'withdrawn';
  };

  // Combine jobs with application status
  const jobsWithApplicationStatus: JobWithApplication[] = jobs.map(job => ({
    ...job,
    userApplication: getApplicationForJob(job.id),
    hasApplied: hasAppliedToJob(job.id),
  }));

  // Filter jobs with search and application status
  const filteredJobs = jobsWithApplicationStatus.filter(job => {
    const matchesType = filterType === 'all' || job.employment_type === filterType;
    const matchesLocation = filterLocation === 'all' ||
      (filterLocation === 'Remote' ? job.remote : job.location === filterLocation);
    const matchesSearch = searchQuery === '' ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.degree_requirement.toLowerCase().includes(searchQuery.toLowerCase());

    // Application status filter
    const matchesApplicationStatus =
      filterApplicationStatus === 'all' ||
      (filterApplicationStatus === 'applied' && job.hasApplied) ||
      (filterApplicationStatus === 'not-applied' && !job.hasApplied);

    // Status filter (for applied jobs only)
    const matchesStatus =
      filterStatus === 'all' ||
      (job.userApplication && job.userApplication.status === filterStatus);

    return matchesType && matchesLocation && matchesSearch && matchesApplicationStatus && matchesStatus;
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
    applied: userApplications.length,
  };

  // Get unique employment types and locations for filters
  const employmentTypes = Array.from(new Set(jobs.map(j => j.employment_type).filter(Boolean)));
  const locations = Array.from(new Set(jobs.map(j => j.location).filter(Boolean)));

  return (
    <AdminLayout role="Applicant" userName={user?.fullName || 'Applicant'} pageTitle="Job Opportunities" pageDescription="Browse and apply for available positions">
      <Container size="xl">
        <div className="space-y-6">
          {/* Refresh Button */}
          <div className="flex items-center justify-end">
            <RefreshButton
              onRefresh={() => {
                fetchJobs();
                fetchUserApplications();
              }}
              label="Refresh"
              showLastRefresh={true}
            />
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

            <Card variant="flat" className="bg-gradient-to-br from-teal-50 to-teal-100 border-l-4 border-teal-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">My Applications</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {loadingApplications ? '...' : stats.applied}
                  </p>
                </div>
                <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
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
            <div className="flex items-center gap-3 flex-wrap">
              <Filter className="w-5 h-5 text-gray-600 hidden md:block" />

              <select
                value={filterApplicationStatus}
                onChange={(e) => setFilterApplicationStatus(e.target.value)}
                className="px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#22A555] bg-white min-w-[150px]"
              >
                <option value="all">All Jobs</option>
                <option value="not-applied">Not Applied</option>
                <option value="applied">Applied</option>
              </select>

              {filterApplicationStatus === 'applied' && userApplications.length > 0 && (
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#22A555] bg-white min-w-[180px]"
                >
                  <option value="all">Any Status</option>
                  <option value="pending">Pending Review</option>
                  <option value="under_review">Under Review</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interviewed">Interviewed</option>
                  <option value="approved">Approved</option>
                  <option value="denied">Not Approved</option>
                  <option value="hired">Hired</option>
                  <option value="archived">Archived</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
              )}

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

              {(filterType !== 'all' || filterLocation !== 'all' || filterApplicationStatus !== 'all' || filterStatus !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setFilterType('all');
                    setFilterLocation('all');
                    setFilterApplicationStatus('all');
                    setFilterStatus('all');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2.5 text-sm text-blue-600 hover:text-blue-700 font-medium whitespace-nowrap"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Jobs Content - Card View */}
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
                            {isNewJob(job.created_at) && !job.hasApplied && (
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

                        {/* Applied Badge - Inline below title */}
                        {job.hasApplied && job.userApplication && (
                          <div className="flex items-center gap-2 -mt-2">
                            <AppliedBadge createdAt={job.userApplication.created_at} />
                          </div>
                        )}

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
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                              {(() => {
                                const isExpanded = expandedSkillsCards.has(job.id);
                                const totalCount = (job.skills?.length || 0) + (job.eligibilities?.length || 0);
                                const showAll = isExpanded || totalCount <= 5;

                                const skillsToShow = showAll ? (job.skills || []) : (job.skills || []).slice(0, 3);
                                const eligsToShow = showAll ? (job.eligibilities || []) : (job.eligibilities || []).slice(0, 2);
                                const shownCount = skillsToShow.length + eligsToShow.length;

                                return (
                                  <>
                                    {skillsToShow.map((skill, idx) => (
                                      <Badge key={`skill-${idx}`} size="sm" variant="default">
                                        {skill}
                                      </Badge>
                                    ))}
                                    {eligsToShow.map((elig, idx) => (
                                      <Badge key={`elig-${idx}`} size="sm" variant="default">
                                        {elig}
                                      </Badge>
                                    ))}
                                    {totalCount > 5 && (
                                      <button
                                        onClick={() => toggleSkillsExpansion(job.id)}
                                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200 transition-colors cursor-pointer"
                                        title={isExpanded ? "Click to show less" : "Click to view all requirements"}
                                      >
                                        {isExpanded ? 'Show less' : `+${totalCount - shownCount} more`}
                                      </button>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
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

                        {/* Application Status & Apply Button */}
                        {job.hasApplied && job.userApplication ? (
                          <div className="space-y-3">
                            <ApplicationStatusBadge
                              status={job.userApplication.status}
                              createdAt={job.userApplication.created_at}
                              className="w-full justify-center py-2"
                            />
                            <Button
                              variant="info"
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-shadow"
                              size="lg"
                              icon={History}
                              onClick={() => handleViewStatusHistory(job.userApplication!)}
                            >
                              View Status History
                            </Button>
                          </div>
                        ) : job.userApplication?.status === 'withdrawn' ? (
                          <div className="space-y-3">
                            <ApplicationStatusBadge
                              status="withdrawn"
                              createdAt={job.userApplication.created_at}
                              className="w-full justify-center py-2"
                            />
                            <Button
                              variant="success"
                              className="w-full shadow-md hover:shadow-lg transition-shadow"
                              size="lg"
                              icon={CheckCircle2}
                              onClick={() => handleApplyClick(job)}
                            >
                              Reapply Now
                            </Button>
                            <Button
                              variant="secondary"
                              className="w-full"
                              size="sm"
                              icon={History}
                              onClick={() => handleViewStatusHistory(job.userApplication!)}
                            >
                              View Status History
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="success"
                            className="w-full shadow-md hover:shadow-lg transition-shadow"
                            size="lg"
                            icon={CheckCircle2}
                            onClick={() => handleApplyClick(job)}
                          >
                            Apply Now
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
          </div>
        </div>
      </Container>

      {/* Application Modal */}
      <ApplicationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        job={selectedJob}
        onSuccess={handleApplicationSuccess}
      />

      {/* Status History Modal */}
      {showStatusHistoryModal && selectedApplicationForHistory && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-5 flex items-center justify-between z-10 shadow-lg rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <History className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Application Status History</h3>
                  <p className="text-sm text-blue-100">Track your application progress</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowStatusHistoryModal(false);
                  setSelectedApplicationForHistory(null);
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {/* Job Info */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-lg">
                      {jobsWithApplicationStatus.find(j => j.userApplication?.id === selectedApplicationForHistory.id)?.title || 'Position'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Job Application</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Applied on: {new Date(selectedApplicationForHistory.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Timeline */}
              {loadingHistory ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  <span className="ml-3 text-gray-600">Loading status history...</span>
                </div>
              ) : selectedApplicationForHistory.status_history && selectedApplicationForHistory.status_history.length > 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-6 overflow-visible">
                  <StatusTimeline
                    statusHistory={selectedApplicationForHistory.status_history}
                    currentStatus={selectedApplicationForHistory.status}
                  />
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600 font-medium">No status changes yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Your application is currently in <span className="font-semibold">{selectedApplicationForHistory.status}</span> status
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex-shrink-0 border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end rounded-b-xl">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowStatusHistoryModal(false);
                  setSelectedApplicationForHistory(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
