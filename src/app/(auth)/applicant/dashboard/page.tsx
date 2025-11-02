'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Button, Card, Container, RefreshButton, EnhancedTable, Badge } from '@/components/ui';
import { AdminLayout } from '@/components/layout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Briefcase, Download, Calendar, Users, GraduationCap, Megaphone, Loader2, CheckCircle2, Clock, TrendingUp, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase/auth';

interface DashboardStats {
  activeJobs: number;
  trainingPrograms: number;
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
}

interface RecentApplication {
  id: string;
  position: string;
  type: 'Job Application' | 'Training Application';
  dateApplied: string;
  status: 'Pending Review' | 'Approved' | 'Disapproved';
  matchScore?: string;
}

interface Announcement {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string | null;
  published_at: string;
}

export default function ApplicantDashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    activeJobs: 0,
    trainingPrograms: 0,
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
  });
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAnnouncements, setExpandedAnnouncements] = useState<Set<string>>(new Set());

  // Track component mount state to prevent state updates after unmount
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchDashboardData = useCallback(async () => {
    console.log('📊 Fetching applicant dashboard data...');

    // Only update loading state if component is still mounted
    if (isMounted.current) {
      setLoading(true);
    }
    try {
      // Fetch active jobs count (global stat)
      const activeJobsResponse = await fetch('/api/jobs?status=active');
      const activeJobsData = await activeJobsResponse.json();
      const activeJobs = activeJobsData.count || 0;

      // Fetch active training programs count (global stat)
      const trainingResponse = await fetch('/api/training/programs?status=active');
      const trainingData = await trainingResponse.json();
      const trainingPrograms = trainingData.count || 0;

      // Fetch announcements
      const announcementsResponse = await fetch('/api/announcements?status=active');
      const announcementsData = await announcementsResponse.json();
      const announcements = announcementsData.data || [];

      // Fetch user-specific job applications
      const jobAppsResponse = await fetch('/api/applications');
      const jobAppsData = await jobAppsResponse.json();
      const jobApplications = jobAppsData.data || [];

      // Fetch user-specific training applications
      const trainingAppsResponse = await fetch('/api/training/applications');
      const trainingAppsData = await trainingAppsResponse.json();
      const trainingApplications = trainingAppsData.data || [];

      // Calculate stats based on user's applications
      const totalApplications = jobApplications.length + trainingApplications.length;
      const pendingApplications = jobApplications.filter((app: any) => app.status === 'pending').length +
        trainingApplications.filter((app: any) => app.status === 'pending').length;
      const approvedApplications = jobApplications.filter((app: any) => app.status === 'approved').length +
        trainingApplications.filter((app: any) => app.status === 'approved').length;

      // Combine and format recent applications (last 5)
      const allApplications = [
        ...jobApplications.map((app: any) => ({
          id: app.id,
          position: app.jobs?.title || 'Unknown Position',
          type: 'Job Application' as const,
          dateApplied: app.created_at,
          status: app.status === 'pending' ? 'Pending Review' : app.status === 'approved' ? 'Approved' : 'Disapproved',
          matchScore: app.match_score ? `${app.match_score}%` : 'N/A'
        })),
        ...trainingApplications.map((app: any) => ({
          id: app.id,
          position: app.training_programs?.title || 'Unknown Program',
          type: 'Training Application' as const,
          dateApplied: app.submitted_at || app.created_at,
          status: app.status === 'pending' ? 'Pending Review' : app.status === 'approved' ? 'Approved' : 'Disapproved',
          matchScore: 'N/A'
        }))
      ];

      // Sort by date and take last 5
      const recentApplications = allApplications
        .sort((a, b) => new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime())
        .slice(0, 5);

      // Only update state if component is still mounted
      if (isMounted.current) {
        setStats({
          activeJobs,
          trainingPrograms,
          totalApplications,
          pendingApplications,
          approvedApplications,
        });

        setAnnouncements(announcements.slice(0, 3));
        setRecentApplications(recentApplications);
      }
    } catch (error) {
      console.error('❌ Error fetching applicant dashboard data:', error);
      // Use showToast directly without including it in dependencies to avoid infinite loop
      if (isMounted.current) {
        showToast('Failed to load dashboard data', 'error');
      }
    } finally {
      // Only update loading state if component is still mounted
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []); // Empty deps - stable function, auth check moved to useEffect

  // Fetch data when authentication is ready - fixed race condition
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchDashboardData();
    }
  }, [authLoading, isAuthenticated, fetchDashboardData]); // All dependencies to prevent race condition

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'job_opening':
        return Briefcase;
      case 'training':
        return GraduationCap;
      case 'notice':
        return Megaphone;
      default:
        return Users;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'job_opening':
        return { bg: 'bg-blue-100', text: 'text-blue-600' };
      case 'training':
        return { bg: 'bg-purple-100', text: 'text-purple-600' };
      case 'notice':
        return { bg: 'bg-teal-100', text: 'text-teal-600' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-600' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Posted today';
    if (diffDays === 1) return 'Posted 1 day ago';
    if (diffDays < 7) return `Posted ${diffDays} days ago`;
    if (diffDays < 14) return 'Posted 1 week ago';
    if (diffDays < 30) return `Posted ${Math.floor(diffDays / 7)} weeks ago`;
    return `Posted ${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  };

  const formatCategory = (category: string) => {
    return category.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const toggleAnnouncementExpansion = (announcementId: string) => {
    setExpandedAnnouncements(prev => {
      const newSet = new Set(prev);
      if (newSet.has(announcementId)) {
        newSet.delete(announcementId);
      } else {
        newSet.add(announcementId);
      }
      return newSet;
    });
  };

  // Table columns for recent applications
  const applicationColumns = [
    {
      header: 'Position/Program',
      accessor: 'position' as const,
      render: (value: string, row: RecentApplication) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{row.type}</p>
        </div>
      )
    },
    {
      header: 'Date Applied',
      accessor: 'dateApplied' as const,
      render: (value: string) => (
        <span className="text-gray-700">{new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
      )
    },
    {
      header: 'Status',
      accessor: 'status' as const,
      render: (value: string) => {
        let variant: 'success' | 'danger' | 'pending' = 'pending';
        let icon = Clock;

        if (value === 'Approved') {
          variant = 'success';
          icon = CheckCircle2;
        } else if (value === 'Disapproved') {
          variant = 'danger';
          icon = FileText;
        }

        return <Badge variant={variant} icon={icon}>{value}</Badge>;
      }
    },
    {
      header: 'Match Score',
      accessor: 'matchScore' as const,
      render: (value?: string) => {
        if (!value || value === 'N/A') {
          return <span className="text-gray-400 text-sm">N/A</span>;
        }
        const score = parseFloat(value);
        const color = score >= 90 ? 'text-[#22A555]' : score >= 75 ? 'text-blue-600' : 'text-orange-600';
        return (
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-4 h-4 ${color}`} />
            <span className={`font-semibold ${color}`}>{value}</span>
          </div>
        );
      }
    },
  ];

  return (
    <AdminLayout
      role="Applicant"
      userName={user?.fullName || 'Applicant'}
      pageTitle="Dashboard"
      pageDescription="Overview of your applications and opportunities"
    >
      <Container size="xl">
        <div className="space-y-6">
          {/* Refresh Button */}
          <div className="flex items-center justify-end">
            <RefreshButton
              onRefresh={fetchDashboardData}
              label="Refresh"
              showLastRefresh={true}
            />
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card variant="flat" className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Available Jobs</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {loading ? '...' : stats.activeJobs}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card variant="flat" className="bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Training Programs</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {loading ? '...' : stats.trainingPrograms}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card variant="flat" className="bg-gradient-to-br from-gray-50 to-gray-100 border-l-4 border-gray-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Applications</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {loading ? '...' : stats.totalApplications}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-500 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card variant="flat" className="bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {loading ? '...' : stats.pendingApplications}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card variant="flat" className="bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Approved</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {loading ? '...' : stats.approvedApplications}
                  </p>
                </div>
                <div className="w-12 h-12 bg-[#22A555] rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Applications Table */}
          <Card title="RECENT APPLICATIONS" headerColor="bg-[#D4F4DD]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#22A555] animate-spin" />
                <span className="ml-3 text-gray-600">Loading applications...</span>
              </div>
            ) : recentApplications.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600 font-medium">No applications yet</p>
                <p className="text-sm text-gray-500 mt-2 mb-4">Start by applying to available jobs and training programs</p>
                <div className="flex items-center justify-center gap-3">
                  <Link href="/applicant/jobs">
                    <Button variant="success" icon={Briefcase}>
                      Browse Jobs
                    </Button>
                  </Link>
                  <Link href="/applicant/trainings">
                    <Button variant="primary" icon={GraduationCap}>
                      View Trainings
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <EnhancedTable
                columns={applicationColumns}
                data={recentApplications}
                pageSize={5}
              />
            )}
          </Card>

          {/* Latest Announcements */}
          <Card title="LATEST ANNOUNCEMENTS" headerColor="bg-[#D4F4DD]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#22A555] animate-spin" />
                <span className="ml-3 text-gray-600">Loading announcements...</span>
              </div>
            ) : announcements.length === 0 ? (
              <div className="text-center py-12">
                <Megaphone className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600 font-medium">No announcements yet</p>
                <p className="text-sm text-gray-500 mt-2">Check back later for updates</p>
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.map((announcement) => {
                  const Icon = getCategoryIcon(announcement.category);
                  const colors = getCategoryColor(announcement.category);
                  const isExpanded = expandedAnnouncements.has(announcement.id);
                  const isLongDescription = announcement.description.length > 150;
                  return (
                    <div
                      key={announcement.id}
                      className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg border border-gray-100 transition-all duration-200 hover:border-[#22A555]/30"
                    >
                      <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-6 h-6 ${colors.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 line-clamp-1">
                            {announcement.title}
                          </h3>
                          <Badge variant="default" size="sm">
                            {formatCategory(announcement.category)}
                          </Badge>
                        </div>
                        <p className={`text-sm text-gray-600 mb-2 ${isExpanded ? '' : 'line-clamp-3'}`}>
                          {announcement.description}
                        </p>
                        {isLongDescription && (
                          <button
                            onClick={() => toggleAnnouncementExpansion(announcement.id)}
                            className="text-xs text-[#22A555] hover:text-[#1a8a44] font-medium mb-2 flex items-center gap-1 transition-colors"
                          >
                            {isExpanded ? (
                              <>
                                Read less <span className="text-sm">↑</span>
                              </>
                            ) : (
                              <>
                                Read more <span className="text-sm">↓</span>
                              </>
                            )}
                          </button>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(announcement.published_at)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <Card variant="flat" className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 mb-3">Quick Actions</p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/applicant/jobs">
                    <Button variant="success" icon={Briefcase} size="sm">
                      Browse Jobs
                    </Button>
                  </Link>
                  <Link href="/applicant/trainings">
                    <Button variant="primary" icon={GraduationCap} size="sm">
                      View Trainings
                    </Button>
                  </Link>
                  <Link href="/applicant/applications">
                    <Button variant="secondary" icon={FileText} size="sm">
                      My Applications
                    </Button>
                  </Link>
                  <Link href="/applicant/pds">
                    <Button variant="outline" icon={Download} size="sm">
                      Download PDS Form
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Container>
    </AdminLayout>
  );
}
