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

    // 2. Fetch all pending applications for this job with applicant profiles AND PDS data
    const { data: applications, error: applicationsError } = await supabase
      .from('applications')
      .select(`
        id,
        applicant_id,
        applicant_profile_id,
        pds_id,
        applicant_profiles (
          id,
          first_name,
          surname,
          highest_educational_attainment,
          total_years_experience,
          skills,
          eligibilities
        ),
        applicant_pds!pds_id (
          id,
          user_id,
          educational_background,
          work_experience,
          eligibility,
          other_information
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
    // Extract data from PDS (preferred) or applicant_profiles (fallback)
    const applicantsData = applications
      .filter(app => {
        // Skip applications without either PDS or profile data
        if (!app.applicant_pds && !app.applicant_profiles) {
          console.warn(`Skipping application ${app.id}: missing both PDS and profile data`);
          return false;
        }
        return true;
      })
      .map(app => {
        const profile = app.applicant_profiles as any;
        const pds = app.applicant_pds as any;

        // --- EXTRACT HIGHEST EDUCATION ---
        let highestEducation = profile?.highest_educational_attainment || 'Not specified';

        if (pds?.educational_background && Array.isArray(pds.educational_background)) {
          // Education level hierarchy (highest to lowest)
          const levels: Record<string, number> = {
            'GRADUATE STUDIES': 5,
            'COLLEGE': 4,
            'VOCATIONAL': 3,
            'SECONDARY': 2,
            'ELEMENTARY': 1
          };

          const highest = pds.educational_background
            .filter((edu: any) => edu && edu.level)
            .reduce((max: any, current: any) => {
              const currentLevel = levels[current.level as keyof typeof levels] || 0;
              const maxLevel = max ? (levels[max.level as keyof typeof levels] || 0) : 0;
              return currentLevel > maxLevel ? current : max;
            }, null);

          if (highest) {
            // Build education string: "COLLEGE - Bachelor of Science in Information Technology"
            highestEducation = highest.course
              ? `${highest.level} - ${highest.course}`
              : highest.level;
          }
        }

        // --- CALCULATE TOTAL YEARS OF EXPERIENCE ---
        let totalYears = profile?.total_years_experience || 0;

        if (pds?.work_experience && Array.isArray(pds.work_experience)) {
          totalYears = pds.work_experience
            .filter((work: any) => work && work.from && work.to)
            .reduce((total: number, work: any) => {
              try {
                const from = new Date(work.from);
                const to = work.to === 'Present' ? new Date() : new Date(work.to);

                if (isNaN(from.getTime()) || isNaN(to.getTime())) {
                  return total;
                }

                const years = (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
                return total + Math.max(0, years);
              } catch (error) {
                console.warn(`Error calculating work experience duration:`, error);
                return total;
              }
            }, 0);

          totalYears = Math.round(totalYears * 10) / 10; // Round to 1 decimal place
        }

        // --- EXTRACT SKILLS ---
        let skills: string[] = profile?.skills || [];

        if (pds?.other_information?.skills) {
          if (Array.isArray(pds.other_information.skills)) {
            // Skills are stored as array of objects: [{skillName: "..."}, ...]
            skills = pds.other_information.skills
              .filter((s: any) => s && (s.skillName || typeof s === 'string'))
              .map((s: any) => typeof s === 'string' ? s : s.skillName)
              .filter((s: string) => s && s.trim());
          } else if (typeof pds.other_information.skills === 'string') {
            // If skills is a JSON string, parse it
            try {
              const parsed = JSON.parse(pds.other_information.skills);
              if (Array.isArray(parsed)) {
                skills = parsed
                  .filter((s: any) => s && (s.skillName || typeof s === 'string'))
                  .map((s: any) => typeof s === 'string' ? s : s.skillName)
                  .filter((s: string) => s && s.trim());
              }
            } catch (error) {
              // If parsing fails, try to use as single skill
              skills = [pds.other_information.skills];
            }
          }
        }

        // --- EXTRACT ELIGIBILITIES ---
        let eligibilities: Array<{eligibilityTitle: string}> = profile?.eligibilities || [];

        if (pds?.eligibility && Array.isArray(pds.eligibility)) {
          eligibilities = pds.eligibility
            .filter((e: any) => e && e.eligibilityTitle)
            .map((e: any) => ({ eligibilityTitle: e.eligibilityTitle }));
        }

        // --- EXTRACT WORK EXPERIENCE TITLES ---
        let workExperienceTitles: string[] = [];

        if (pds?.work_experience && Array.isArray(pds.work_experience)) {
          workExperienceTitles = pds.work_experience
            .filter((work: any) => work && work.positionTitle)
            .map((work: any) => work.positionTitle.trim())
            .filter((title: string) => title && title.length > 0);
        }

        console.log(`📊 Extracted data for ${profile?.first_name} ${profile?.surname}:`, {
          education: highestEducation,
          experience: totalYears,
          skillsCount: skills.length,
          eligibilitiesCount: eligibilities.length,
          workTitlesCount: workExperienceTitles.length,
          source: pds ? 'PDS' : 'Profile'
        });

        return {
          applicationId: app.id,
          applicantId: app.applicant_id,
          applicantProfileId: app.applicant_profile_id,
          applicantName: `${profile?.first_name || 'Unknown'} ${profile?.surname || ''}`.trim(),
          highestEducationalAttainment: highestEducation,
          eligibilities: eligibilities,
          skills: skills,
          totalYearsExperience: totalYears,
          workExperienceTitles: workExperienceTitles
        };
      });

    // Check if we have any eligible applications to rank after filtering
    if (applicantsData.length === 0) {
      return NextResponse.json(
        { message: 'No eligible applications to rank (missing profile data). Please ensure applicants have completed their profiles.' },
        { status: 200 }
      );
    }

    // 4. Rank applicants using Gemini AI-powered algorithms
    console.log(`Ranking ${applicantsData.length} applicants for job: ${job.title}`);

    const rankedApplicants = await rankApplicantsForJob(
      {
        id: job.id,
        title: job.title, // Include job title for relevance matching
        description: job.description, // Include description for context
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

      // Debug logging for match counts before database save
      console.log(`🔍 [API] Preparing update for ${applicant.applicantName}:`, {
        rank: applicant.rank,
        matchedSkillsCount: applicant.matchedSkillsCount,
        matchedEligibilitiesCount: applicant.matchedEligibilitiesCount,
        eligibilityScore: applicant.eligibilityScore
      });

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
        algorithm_details: applicant.algorithmDetails ? JSON.stringify(applicant.algorithmDetails) : null,
        matched_skills_count: applicant.matchedSkillsCount,
        matched_eligibilities_count: applicant.matchedEligibilitiesCount
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
          algorithm_details: update.algorithm_details,
          matched_skills_count: update.matched_skills_count,
          matched_eligibilities_count: update.matched_eligibilities_count
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
