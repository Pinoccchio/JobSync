'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Button, Card, Container } from '@/components/ui';
import { AdminLayout } from '@/components/layout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Briefcase, Download, Calendar, Users, GraduationCap, Megaphone, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/auth';

interface DashboardStats {
  activeJobs: number;
  trainingPrograms: number;
  totalApplications: number;
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
  });
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Track component mount state to prevent state updates after unmount
  const isMounted = useRef(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchDashboardData = useCallback(async () => {
    if (authLoading || !isAuthenticated) {
      console.log('⏳ Waiting for authentication...');
      return;
    }

    // Prevent duplicate fetches on strict mode double render
    if (hasFetched.current) {
      console.log('⏭️ Already fetched, skipping...');
      return;
    }

    console.log('📊 Fetching applicant dashboard data...');
    hasFetched.current = true;

    // Only update loading state if component is still mounted
    if (isMounted.current) {
      setLoading(true);
    }
    try {
      // Fetch active jobs count
      const { count: activeJobs } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Fetch active training programs count
      const { count: trainingPrograms } = await supabase
        .from('training_programs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Fetch total applications count
      const { count: totalApplications } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true });

      // Fetch recent announcements (last 3)
      const { data: announcementsData, error } = await supabase
        .from('announcements')
        .select('id, title, description, category, image_url, published_at')
        .eq('status', 'active')
        .order('published_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error fetching announcements:', error);
      }

      // Only update state if component is still mounted
      if (isMounted.current) {
        setStats({
          activeJobs: activeJobs || 0,
          trainingPrograms: trainingPrograms || 0,
          totalApplications: totalApplications || 0,
        });

        setAnnouncements(announcementsData || []);
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
  }, [authLoading, isAuthenticated]); // Fixed: removed user?.id and showToast from dependencies

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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

  return (
    <AdminLayout
      role="Applicant"
      userName={user?.fullName || 'Applicant'}
      pageTitle="Dashboard"
      pageDescription="Welcome back! Here's your overview"
    >
      <Container size="xl">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Left Section - Modern Illustration */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#22A555]/20 to-[#20C997]/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-gradient-to-br from-[#22A555] to-[#20C997] rounded-2xl p-12 shadow-2xl">
              <div className="flex flex-col items-center justify-center h-full text-white">
                <Briefcase className="w-24 h-24 mb-6 opacity-90" />
                <h3 className="text-3xl font-bold mb-2">Your Career</h3>
                <p className="text-lg opacity-90">Starts Here</p>
              </div>
            </div>
          </div>

          {/* Right Section - Content */}
          <div className="space-y-6">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                Welcome to <span className="text-[#22A555]">JOBSYNC</span>
              </h1>
              <p className="text-gray-700 text-xl mb-2">
                Your smarter way to streamline hiring.
              </p>
            </div>

            <p className="text-gray-600 text-lg leading-relaxed">
              At JobSync, we simplify and accelerate the hiring process for both employers and job
              seekers. Our intelligent screening platform quickly analyzes resumes, highlights top
              candidates, and matches qualifications with job requirements.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/applicant/jobs">
                <Button size="lg" icon={Briefcase} className="w-full sm:w-auto">
                  Browse Jobs
                </Button>
              </Link>
              <Button size="lg" variant="outline" icon={Download} className="w-full sm:w-auto">
                Download PDS Form
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card variant="flat" className="text-center">
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="w-12 h-12 bg-[#22A555]/10 rounded-full flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-[#22A555]" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" /> : stats.activeJobs}
                </p>
                <p className="text-sm text-gray-600">Active Job Postings</p>
              </div>
            </div>
          </Card>

          <Card variant="flat" className="text-center">
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" /> : stats.trainingPrograms}
                </p>
                <p className="text-sm text-gray-600">Training Programs</p>
              </div>
            </div>
          </Card>

          <Card variant="flat" className="text-center">
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {loading ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" /> : `${stats.totalApplications}+`}
                </p>
                <p className="text-sm text-gray-600">Applications Processed</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Announcements Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Megaphone className="w-8 h-8 text-[#22A555]" />
              <h2 className="text-3xl font-bold text-gray-900">Latest Announcements</h2>
            </div>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-12 h-12 animate-spin text-gray-400" />
            </div>
          ) : announcements.length === 0 ? (
            <Card variant="flat" className="text-center py-12">
              <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No announcements yet</p>
              <p className="text-sm text-gray-400 mt-2">Check back later for updates</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {announcements.map((announcement) => {
                const Icon = getCategoryIcon(announcement.category);
                const colors = getCategoryColor(announcement.category);
                return (
                  <Card key={announcement.id} variant="interactive" noPadding className="group">
                    <div className="p-6 space-y-4">
                      {/* Icon and Category */}
                      <div className="flex items-start justify-between">
                        <div className={`w-14 h-14 ${colors.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <Icon className={`w-7 h-7 ${colors.text}`} />
                        </div>
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {formatCategory(announcement.category)}
                        </span>
                      </div>

                      {/* Content */}
                      <div>
                        <h3 className="font-semibold text-lg mb-2 text-gray-900 group-hover:text-[#22A555] transition-colors">
                          {announcement.title}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                          {announcement.description}
                        </p>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(announcement.published_at)}</span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </Container>
    </AdminLayout>
  );
}
