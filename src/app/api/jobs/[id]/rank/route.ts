/**
 * API Endpoint: Rank Applicants for a Specific Job
 * POST /api/jobs/[id]/rank
 *
 * This endpoint triggers the Gemini AI-powered ranking system
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { rankApplicantsForJob } from '@/lib/gemini/rankApplicants';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;

    // Use service role key to bypass RLS for ranking operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Fetch job details
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // 2. Fetch all pending applications for this job with applicant profiles
    const { data: applications, error: applicationsError } = await supabase
      .from('applications')
      .select(`
        id,
        applicant_id,
        applicant_profile_id,
        applicant_profiles (
          id,
          first_name,
          surname,
          highest_educational_attainment,
          total_years_experience,
          skills,
          eligibilities
        )
      `)
      .eq('job_id', jobId)
      .eq('status', 'pending');

    console.log('Applications query result:', { applications, error: applicationsError, jobId });

    if (applicationsError) {
      return NextResponse.json(
        { error: 'Failed to fetch applications', details: applicationsError.message },
        { status: 500 }
      );
    }

    if (!applications || applications.length === 0) {
      return NextResponse.json(
        { message: 'No pending applications to rank' },
        { status: 200 }
      );
    }

    // 3. Prepare applicant data for ranking
    const applicantsData = applications.map(app => {
      const profile = app.applicant_profiles as any;
      return {
        applicationId: app.id,
        applicantId: app.applicant_id,
        applicantProfileId: app.applicant_profile_id,
        applicantName: `${profile.first_name} ${profile.surname}`,
        highestEducationalAttainment: profile.highest_educational_attainment || 'Not specified',
        eligibilities: profile.eligibilities || [],
        skills: profile.skills || [],
        totalYearsExperience: profile.total_years_experience || 0
      };
    });

    // 4. Rank applicants using Gemini AI-powered algorithms
    console.log(`Ranking ${applicantsData.length} applicants for job: ${job.title}`);

    const rankedApplicants = await rankApplicantsForJob(
      {
        id: job.id,
        title: job.title,
        description: job.description,
        degreeRequirement: job.degree_requirement,
        eligibilities: job.eligibilities || [],
        skills: job.skills || [],
        yearsOfExperience: job.years_of_experience || 0
      },
      applicantsData
    );

    // 5. Update applications with ranking results
    const updates = rankedApplicants.map(applicant => {
      const appData = applicantsData.find(a => a.applicantId === applicant.applicantId);
      return {
        id: appData!.applicationId,
        rank: applicant.rank,
        match_score: applicant.matchScore,
        education_score: applicant.educationScore,
        experience_score: applicant.experienceScore,
        skills_score: applicant.skillsScore,
        eligibility_score: applicant.eligibilityScore,
        algorithm_used: applicant.algorithmUsed,
        ranking_reasoning: applicant.rankingReasoning + (applicant.geminiInsights ? ` | Gemini Insight: ${applicant.geminiInsights}` : ''),
        algorithm_details: applicant.algorithmDetails ? JSON.stringify(applicant.algorithmDetails) : null
      };
    });

    // Batch update all applications
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          rank: update.rank,
          match_score: update.match_score,
          education_score: update.education_score,
          experience_score: update.experience_score,
          skills_score: update.skills_score,
          eligibility_score: update.eligibility_score,
          algorithm_used: update.algorithm_used,
          ranking_reasoning: update.ranking_reasoning,
          algorithm_details: update.algorithm_details
        })
        .eq('id', update.id);

      if (updateError) {
        console.error(`Failed to update application ${update.id}:`, updateError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully ranked ${rankedApplicants.length} applicants for ${job.title}`,
      jobId: job.id,
      jobTitle: job.title,
      totalApplicants: rankedApplicants.length,
      rankings: rankedApplicants.map(r => ({
        rank: r.rank,
        applicantName: r.applicantName,
        matchScore: r.matchScore,
        algorithm: r.algorithmUsed
      }))
    });

  } catch (error: any) {
    console.error('Error ranking applicants:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check current rankings
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;

    // Use service role key to bypass RLS for ranking operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: applications, error } = await supabase
      .from('applications')
      .select(`
        id,
        rank,
        match_score,
        education_score,
        experience_score,
        skills_score,
        eligibility_score,
        algorithm_used,
        ranking_reasoning,
        status,
        applicant_profiles (
          first_name,
          surname,
          highest_educational_attainment,
          total_years_experience
        )
      `)
      .eq('job_id', jobId)
      .order('rank', { ascending: true, nullsFirst: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch rankings', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      totalApplicants: applications?.length || 0,
      rankedApplicants: applications?.filter(a => a.rank !== null).length || 0,
      unrankedApplicants: applications?.filter(a => a.rank === null).length || 0,
      applications: applications || []
    });

  } catch (error: any) {
    console.error('Error fetching rankings:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
