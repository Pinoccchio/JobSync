'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { AdminLayout } from '@/components/layout';
import { Card, EnhancedTable, Button, Container, Badge, RefreshButton, ConfirmModal } from '@/components/ui';
import { RankingDetailsModal } from '@/components/hr/RankingDetailsModal';
import { useToast } from '@/contexts/ToastContext';
import { getErrorMessage } from '@/lib/utils/errorMessages';
import { useAuth } from '@/contexts/AuthContext';
import { calculateStatistics, calculatePercentile } from '@/lib/utils/rankingStatistics';
import {
  Download,
  Trophy,
  Medal,
  Award,
  TrendingUp,
  User,
  Mail,
  Briefcase,
  CheckCircle,
  XCircle,
  Loader2,
  FileText,
  Eye,
} from 'lucide-react';

interface Application {
  id: string;
  applicantName: string;
  email: string;
  jobTitle: string;
  matchScore: number | null;
  rank: number | null;
  status: string;
  appliedDate: string;
  pdsUrl: string;
  _raw: any;
}

export default function RankedRecordsPage() {
  const { showToast } = useToast();
  const { user } = useAuth();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<string>('all');
  const [jobs, setJobs] = useState<any[]>([]);
  const [isRanking, setIsRanking] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [selectedJobRequirements, setSelectedJobRequirements] = useState<any>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [jobToRank, setJobToRank] = useState<{ id: string; title: string } | null>(null);

  // Fetch applications
  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/applications');
      const result = await response.json();

      if (result.success) {
        setApplications(
          result.data.map((app: any) => ({
            id: app.id,
            applicantName: `${app.applicant_profiles?.first_name || ''} ${app.applicant_profiles?.surname || ''}`.trim() || 'Unknown',
            email: app.applicant_profiles?.profiles?.email || user?.email || 'N/A',
            jobTitle: app.jobs?.title || 'Unknown Position',
            matchScore: app.match_score,
            rank: app.rank,
            status: app.status,
            appliedDate: new Date(app.created_at).toLocaleDateString(),
            pdsUrl: app.pds_file_url,
            _raw: app,
          }))
        );

        // Extract unique jobs for filter
        const uniqueJobs = Array.from(
          new Set(result.data.map((app: any) => app.jobs?.id).filter(Boolean))
        ).map((jobId) => {
          const app = result.data.find((a: any) => a.jobs?.id === jobId);
          return {
            id: jobId,
            title: app?.jobs?.title || 'Unknown',
          };
        });
        setJobs(uniqueJobs);
      } else {
        showToast(getErrorMessage(result.error), 'error');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      showToast('Failed to fetch applications', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, user]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Approve application
  const handleApprove = async (id: string, applicantName: string) => {
    if (!confirm(`Approve application from ${applicantName}?`)) return;

    try {
      setProcessingId(id);
      const response = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });

      const result = await response.json();

      if (result.success) {
        showToast(`Application approved! Notification sent to ${applicantName}`, 'success');
        fetchApplications();
      } else {
        showToast(getErrorMessage(result.error), 'error');
      }
    } catch (error) {
      console.error('Error approving application:', error);
      showToast('Failed to approve application', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  // Deny application
  const handleDeny = async (id: string, applicantName: string) => {
    if (!confirm(`Deny application from ${applicantName}?`)) return;

    try {
      setProcessingId(id);
      const response = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'denied' }),
      });

      const result = await response.json();

      if (result.success) {
        showToast(`Application denied. Notification sent to ${applicantName}`, 'success');
        fetchApplications();
      } else {
        showToast(getErrorMessage(result.error), 'error');
      }
    } catch (error) {
      console.error('Error denying application:', error);
      showToast('Failed to deny application', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  // Download PDS
  const handleDownloadPDS = async (pdsUrl: string, applicantName: string) => {
    try {
      if (!pdsUrl) {
        showToast('PDS file not available', 'error');
        return;
      }

      // Extract bucket and path from the URL
      const url = new URL(pdsUrl);
      const pathMatch = url.pathname.match(/\/storage\/v1\/object\/sign\/([^\/]+)\/(.+)\?/);

      if (!pathMatch) {
        // Direct download if it's already a signed URL
        window.open(pdsUrl, '_blank');
        return;
      }

      const bucket = pathMatch[1];
      const path = pathMatch[2];

      // Get fresh signed URL
      const response = await fetch(`/api/storage?bucket=${bucket}&path=${encodeURIComponent(path)}`);
      const result = await response.json();

      if (result.success) {
        window.open(result.data.signedUrl, '_blank');
      } else {
        showToast(getErrorMessage(result.error), 'error');
      }
    } catch (error) {
      console.error('Error downloading PDS:', error);
      showToast('Failed to download PDS', 'error');
    }
  };

  // Open confirmation modal for ranking
  const handleRankApplicants = () => {
    if (selectedJob === 'all') {
      showToast('Please select a specific job position to rank applicants', 'warning');
      return;
    }

    const job = jobs.find(j => j.id === selectedJob);
    if (!job) return;

    setJobToRank({ id: job.id, title: job.title });
    setIsConfirmModalOpen(true);
  };

  // Perform the actual ranking after confirmation
  const performRanking = async () => {
    if (!jobToRank) return;

    setIsRanking(true);

    try {
      const response = await fetch(`/api/jobs/${jobToRank.id}/rank`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();

      if (result.success) {
        showToast(
          `✨ Successfully ranked ${result.totalApplicants} applicant${result.totalApplicants !== 1 ? 's' : ''} for ${result.jobTitle}! Rankings are now visible below.`,
          'success'
        );

        // CRITICAL ORDER (following user-management pattern):
        setIsRanking(false);          // 1. Reset loading FIRST
        setIsConfirmModalOpen(false); // 2. Close modal SECOND
        setJobToRank(null);           // 3. Clear selection THIRD
        await fetchApplications();     // 4. Refresh data FOURTH
      } else {
        showToast(getErrorMessage(result.error || result.message), 'error');
        setIsRanking(false); // Reset but keep modal open for retry
      }
    } catch (error) {
      console.error('Error ranking applicants:', error);
      showToast('Failed to rank applicants. Please try again.', 'error');
      setIsRanking(false); // Reset but keep modal open for retry
    }
  };

  // Handle opening ranking details modal
  const handleViewDetails = (application: Application) => {
    console.log('🔍 Opening ranking details for:', {
      name: application.applicantName,
      rank: application.rank,
      matchScore: application.matchScore,
      hasRawData: !!application._raw,
    });

    if (!application.rank || !application.matchScore) {
      console.warn('⚠️ Cannot open details: applicant not ranked', {
        rank: application.rank,
        matchScore: application.matchScore,
      });
      showToast('This applicant has not been ranked yet', 'warning');
      return;
    }

    const raw = application._raw;
    console.log('📊 Raw application data:', raw);

    // Get all applicants for the same job (for statistical comparison)
    const jobId = raw?.job_id;
    const jobApplicants = applications.filter(
      app => app._raw?.job_id === jobId && app.rank !== null && app.matchScore !== null
    );

    console.log(`📈 Calculating statistics for ${jobApplicants.length} applicants in job pool`);

    // Calculate statistics for all score dimensions
    const matchScores = jobApplicants.map(app => app.matchScore).filter(Boolean) as number[];
    const educationScores = jobApplicants.map(app => app._raw?.education_score).filter(s => s != null) as number[];
    const experienceScores = jobApplicants.map(app => app._raw?.experience_score).filter(s => s != null) as number[];
    const skillsScores = jobApplicants.map(app => app._raw?.skills_score).filter(s => s != null) as number[];
    const eligibilityScores = jobApplicants.map(app => app._raw?.eligibility_score).filter(s => s != null) as number[];

    const statistics = {
      matchScore: calculateStatistics(matchScores),
      educationScore: calculateStatistics(educationScores),
      experienceScore: calculateStatistics(experienceScores),
      skillsScore: calculateStatistics(skillsScores),
      eligibilityScore: calculateStatistics(eligibilityScores),
    };

    // Calculate percentiles for current applicant
    const percentiles = {
      matchScore: calculatePercentile(application.matchScore, matchScores),
      educationScore: calculatePercentile(raw?.education_score || 0, educationScores),
      experienceScore: calculatePercentile(raw?.experience_score || 0, experienceScores),
      skillsScore: calculatePercentile(raw?.skills_score || 0, skillsScores),
      eligibilityScore: calculatePercentile(raw?.eligibility_score || 0, eligibilityScores),
    };

    // Get top 3 performers for comparison
    const topPerformers = jobApplicants
      .sort((a, b) => (a.rank || 999) - (b.rank || 999))
      .slice(0, 3)
      .map(app => ({
        name: app.applicantName,
        rank: app.rank!,
        matchScore: app.matchScore!,
        educationScore: app._raw?.education_score || 0,
        experienceScore: app._raw?.experience_score || 0,
        skillsScore: app._raw?.skills_score || 0,
        eligibilityScore: app._raw?.eligibility_score || 0,
      }));

    const applicantData = {
      name: application.applicantName,
      jobTitle: application.jobTitle,
      rank: application.rank,
      matchScore: application.matchScore,
      educationScore: raw?.education_score || 0,
      experienceScore: raw?.experience_score || 0,
      skillsScore: raw?.skills_score || 0,
      eligibilityScore: raw?.eligibility_score || 0,
      algorithmUsed: raw?.algorithm_used || 'Unknown',
      reasoning: raw?.ranking_reasoning || 'No reasoning available',
      education: raw?.applicant_profiles?.highest_educational_attainment,
      experience: raw?.applicant_profiles?.total_years_experience,
      skills: raw?.applicant_profiles?.skills || [],
      eligibilities: (raw?.applicant_profiles?.eligibilities || []).map((e: any) => e.eligibilityTitle || e),
      algorithmDetails: raw?.algorithm_details ? (
        typeof raw.algorithm_details === 'string'
          ? JSON.parse(raw.algorithm_details)
          : raw.algorithm_details
      ) : undefined,
      // Add statistical context
      statistics,
      percentiles,
      topPerformers,
      totalApplicants: jobApplicants.length,
    };

    // Extract job requirements from the raw data
    const jobRequirements = raw?.jobs ? {
      degreeRequirement: raw.jobs.degree_requirement || 'Not specified',
      eligibilities: raw.jobs.eligibilities || [],
      skills: raw.jobs.skills || [],
      yearsOfExperience: raw.jobs.years_of_experience || 0,
    } : null;

    console.log('✅ Setting applicant data with statistics:', applicantData);
    console.log('✅ Setting job requirements:', jobRequirements);
    setSelectedApplicant(applicantData);
    setSelectedJobRequirements(jobRequirements);
    setIsModalOpen(true);
    console.log('✅ Modal state set to open');
  };

  const getRankIcon = (ranking: number | null) => {
    if (!ranking) return null;
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

  const getRankBadgeVariant = (ranking: number | null): 'success' | 'info' | 'warning' | 'default' => {
    if (!ranking) return 'default';
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

  const columns = [
    {
      header: 'Rank',
      accessor: 'rank' as const,
      render: (value: number | null, row: Application) => {
        if (!value) {
          return <Badge variant="default">Unranked</Badge>;
        }
        return (
          <button
            onClick={() => handleViewDetails(row)}
            className="flex items-center gap-2 hover:opacity-75 transition-opacity cursor-pointer"
            title="Click to view detailed scores"
          >
            {getRankIcon(value)}
            <Badge variant={getRankBadgeVariant(value)}>
              {value === 1 ? '1st' : value === 2 ? '2nd' : value === 3 ? '3rd' : `${value}th`}
            </Badge>
          </button>
        );
      },
    },
    {
      header: 'Applicant',
      accessor: 'applicantName' as const,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-900">{value}</span>
        </div>
      ),
    },
    {
      header: 'Email',
      accessor: 'email' as const,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700">{value}</span>
        </div>
      ),
    },
    {
      header: 'Position',
      accessor: 'jobTitle' as const,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700">{value}</span>
        </div>
      ),
    },
    {
      header: 'Match Score',
      accessor: 'matchScore' as const,
      render: (value: number | null, row: Application) => {
        if (!value) {
          return <span className="text-sm text-gray-500">Not scored</span>;
        }
        return (
          <button
            onClick={() => handleViewDetails(row)}
            className="flex items-center gap-2 hover:opacity-75 transition-opacity cursor-pointer"
            title="Click to view detailed scores"
          >
            <TrendingUp className="w-4 h-4 text-[#22A555]" />
            <span className="font-bold text-[#22A555] text-lg">{value.toFixed(1)}%</span>
          </button>
        );
      },
    },
    {
      header: 'Status',
      accessor: 'status' as const,
      render: (value: string) => (
        <Badge
          variant={value === 'approved' ? 'success' : value === 'denied' ? 'danger' : 'warning'}
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
    },
    {
      header: 'Applied',
      accessor: 'appliedDate' as const,
    },
    {
      header: 'Details',
      accessor: 'details' as const,
      render: (_: any, row: Application) => (
        <Button
          variant="secondary"
          size="sm"
          icon={Eye}
          onClick={() => handleViewDetails(row)}
          disabled={!row.rank || !row.matchScore}
          title={row.rank && row.matchScore ? "View detailed ranking breakdown" : "This applicant has not been ranked yet"}
        >
          View Details
        </Button>
      ),
    },
    {
      header: 'Actions',
      accessor: 'actions' as const,
      render: (_: any, row: Application) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={FileText}
            onClick={() => handleDownloadPDS(row.pdsUrl, row.applicantName)}
            title="View PDS"
          >
            View PDS
          </Button>
          {row.status === 'pending' && (
            <>
              <Button
                variant="success"
                size="sm"
                icon={processingId === row.id ? Loader2 : CheckCircle}
                onClick={() => handleApprove(row.id, row.applicantName)}
                disabled={processingId !== null}
              >
                {processingId === row.id ? 'Approving...' : 'Approve'}
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={processingId === row.id ? Loader2 : XCircle}
                onClick={() => handleDeny(row.id, row.applicantName)}
                disabled={processingId !== null}
              >
                {processingId === row.id ? 'Denying...' : 'Deny'}
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  // Filter applications by selected job
  const filteredApplications = selectedJob === 'all'
    ? applications
    : applications.filter((app) => app._raw.job_id === selectedJob);

  // Sort by rank (nulls last), then by match score
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    if (a.rank === null && b.rank === null) return 0;
    if (a.rank === null) return 1;
    if (b.rank === null) return -1;
    return a.rank - b.rank;
  });

  const pendingCount = applications.filter((a) => a.status === 'pending').length;
  const approvedCount = applications.filter((a) => a.status === 'approved').length;
  const deniedCount = applications.filter((a) => a.status === 'denied').length;
  const rankedCount = applications.filter((a) => a.rank !== null).length;

  return (
    <AdminLayout
      role="HR"
      userName={user?.fullName || 'HR Admin'}
      pageTitle="Ranked Applications"
      pageDescription="Review and manage applicant rankings"
    >
      <Container size="xl">
        <div className="space-y-6">
          {/* Header Actions */}
          <div className="flex justify-between items-center">
            <div className="flex gap-3">
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22A555]"
              >
                <option value="all">All Positions</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>

              <Button
                variant="primary"
                icon={Award}
                loading={isRanking}
                onClick={handleRankApplicants}
                disabled={selectedJob === 'all'}
                className="whitespace-nowrap"
              >
                {isRanking ? 'Ranking with AI...' : 'Rank Applicants'}
              </Button>
            </div>
            <RefreshButton
              onRefresh={fetchApplications}
              label="Refresh Applications"
              showLastRefresh={true}
            />
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card variant="flat" className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Applications</p>
                  <p className="text-3xl font-bold text-gray-900">{applications.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card variant="flat" className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Review</p>
                  <p className="text-3xl font-bold text-gray-900">{pendingCount}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card variant="flat" className="bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Approved</p>
                  <p className="text-3xl font-bold text-gray-900">{approvedCount}</p>
                </div>
                <div className="w-12 h-12 bg-[#22A555] rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>

            <Card variant="flat" className="bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Denied</p>
                  <p className="text-3xl font-bold text-gray-900">{deniedCount}</p>
                </div>
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
                  <XCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          </div>

          {/* Applications Table */}
          <Card title="APPLICANT RANKINGS" headerColor="bg-[#D4F4DD]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#22A555] animate-spin" />
                <span className="ml-3 text-gray-600">Loading applications...</span>
              </div>
            ) : sortedApplications.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No applications found
                {selectedJob !== 'all' && ' for this position'}
              </div>
            ) : (
              <EnhancedTable
                columns={columns}
                data={sortedApplications}
                searchable
                searchPlaceholder="Search by name, email, or position..."
              />
            )}
          </Card>
        </div>
      </Container>

      {/* Ranking Details Modal */}
      <RankingDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        applicant={selectedApplicant}
        jobRequirements={selectedJobRequirements}
      />

      {/* Confirmation Modal for Ranking */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setJobToRank(null);
        }}
        onConfirm={performRanking}
        title="Rank Applicants with Gemini AI?"
        message={`Rank all pending applicants for "${jobToRank?.title || ''}" using Gemini AI?\n\nThis will score applicants based on education, experience, skills, and eligibilities.`}
        confirmText="Rank Applicants"
        cancelText="Cancel"
        variant="primary"
        isLoading={isRanking}
      />
    </AdminLayout>
  );
}
