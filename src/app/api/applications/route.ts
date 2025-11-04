import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createInitialStatusHistory } from '@/lib/utils/statusHistory';
import { createNotification, notifyJobCreator, notifyAdmins } from '@/lib/notifications';

/**
 * Application Management API Routes
 *
 * Endpoints:
 * - GET /api/applications - List applications (filtered by user/job/status)
 * - POST /api/applications - Submit application with web-based PDS
 *
 * Database Schema:
 * - applications table: id, job_id, applicant_id, applicant_profile_id, pds_id, status, rank, match_score, created_at
 * - applicant_profiles table: user_id, education, work_experience, eligibilities, skills, etc.
 */

// GET /api/applications - List applications with filters
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    // 2. Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    // 3. Parse filters
    const jobId = searchParams.get('job_id');
    const applicantId = searchParams.get('applicant_id');
    const status = searchParams.get('status'); // pending, approved, denied

    // 4. Build query based on role
    let query = supabase
      .from('applications')
      .select(`
        id,
        job_id,
        applicant_id,
        applicant_profile_id,
        pds_id,
        status,
        status_history,
        rank,
        match_score,
        education_score,
        experience_score,
        skills_score,
        eligibility_score,
        algorithm_used,
        ranking_reasoning,
        algorithm_details,
        reviewed_by,
        reviewed_at,
        notification_sent,
        created_at,
        updated_at,
        jobs:job_id (
          id,
          title,
          description,
          degree_requirement,
          eligibilities,
          skills,
          years_of_experience,
          location,
          employment_type,
          status,
          created_at,
          profiles:created_by (
            id,
            full_name,
            role
          )
        ),
        applicant_profiles:applicant_profile_id (
          id,
          user_id,
          surname,
          first_name,
          middle_name,
          phone_number,
          mobile_number,
          education,
          work_experience,
          eligibilities,
          skills,
          total_years_experience,
          highest_educational_attainment,
          ocr_processed,
          profiles:user_id (
            email
          )
        ),
        applicant_pds:pds_id (
          id,
          signature_url,
          signature_uploaded_at
        )
      `)
      .order('created_at', { ascending: false });

    // 5. Apply role-based filtering
    if (profile.role === 'APPLICANT') {
      // Applicants can only see their own applications
      query = query.eq('applicant_id', user.id);
    } else if (profile.role === 'HR' || profile.role === 'ADMIN') {
      // HR and Admin can see all applications
      // Apply optional filters
      if (jobId) {
        query = query.eq('job_id', jobId);
      }
      if (applicantId) {
        query = query.eq('applicant_id', applicantId);
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Invalid role' },
        { status: 403 }
      );
    }

    // 6. Apply status filter (available to all roles)
    if (status) {
      query = query.eq('status', status);
    }

    // 7. Execute query
    const { data: applications, error } = await query;

    if (error) {
      console.error('Error fetching applications:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: applications,
      count: applications?.length || 0,
    });

  } catch (error: any) {
    console.error('Server error in GET /api/applications:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/applications - Submit job application
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    // 2. Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, email, full_name')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    // 3. Only applicants can submit applications
    if (profile.role !== 'APPLICANT') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Only applicants can submit applications' },
        { status: 403 }
      );
    }

    // 4. Validate required fields
    const { job_id, pds_id } = body;

    if (!job_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: job_id' },
        { status: 400 }
      );
    }

    if (!pds_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: pds_id - Please complete your PDS first' },
        { status: 400 }
      );
    }

    // 5. Verify job exists and is active
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, title, status')
      .eq('id', job_id)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'This job is no longer accepting applications' },
        { status: 400 }
      );
    }

    // 6. Check for duplicate application (exclude withdrawn and denied applications)
    const { data: existingApplication, error: duplicateError } = await supabase
      .from('applications')
      .select('id, status')
      .eq('job_id', job_id)
      .eq('applicant_id', user.id)
      .not('status', 'in', '(withdrawn,denied)')  // Allow reapplication after withdrawal or denial
      .maybeSingle();  // Returns null if no active application exists

    if (existingApplication) {
      return NextResponse.json(
        { success: false, error: 'You already have an active application for this job' },
        { status: 400 }
      );
    }

    // 7. Check if applicant_profile exists, create if not
    let applicantProfileId: string;

    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('applicant_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingProfile) {
      applicantProfileId = existingProfile.id;
    } else {
      // Create basic applicant profile (will be populated later by OCR)
      const { data: newProfile, error: createProfileError } = await supabase
        .from('applicant_profiles')
        .insert({
          user_id: user.id,
          first_name: profile.full_name?.split(' ')[0] || '',
          surname: profile.full_name?.split(' ').slice(1).join(' ') || '',
          // Other fields will be populated by OCR later
          ocr_processed: false,
          ai_processed: false,
        })
        .select('id')
        .single();

      if (createProfileError || !newProfile) {
        console.error('Error creating applicant profile:', createProfileError);
        return NextResponse.json(
          { success: false, error: 'Failed to create applicant profile' },
          { status: 500 }
        );
      }

      applicantProfileId = newProfile.id;
    }

    // 8. Create application
    const currentTimestamp = new Date().toISOString();
    const insertData = {
      job_id,
      applicant_id: user.id,
      applicant_profile_id: applicantProfileId,
      pds_id,
      status: 'pending',
      notification_sent: false,
      // Initialize status_history with the initial "null → pending" transition
      status_history: createInitialStatusHistory('pending', currentTimestamp, user.id),
    };

    const { data: application, error: applicationError } = await supabase
      .from('applications')
      .insert(insertData)
      .select(`
        id,
        job_id,
        applicant_id,
        pds_id,
        status,
        created_at,
        jobs:job_id (
          id,
          title,
          description
        )
      `)
      .single();

    if (applicationError) {
      console.error('Error creating application:', applicationError);
      return NextResponse.json(
        { success: false, error: applicationError.message },
        { status: 500 }
      );
    }

    // 9. Ranking will be triggered manually by HR via "Rank Applicants" button
    // No automatic ranking on submission - HR has full control

    // 10. Send notifications to all relevant parties
    try {
      // Notify applicant of successful submission
      await createNotification(profile.id, {
        type: 'application_status',
        title: 'Application Submitted Successfully',
        message: `Your application for "${job.title}" has been received and is under review.`,
        related_entity_type: 'application',
        related_entity_id: application.id,
        link_url: '/applicant/applications',
      });

      // Notify job creator (HR) of new application
      await notifyJobCreator(jobId, profile.full_name);

      // Notify ADMIN of new application for system monitoring
      await notifyAdmins({
        type: 'system',
        title: 'New Job Application Received',
        message: `${profile.full_name} applied for "${job.title}"`,
        related_entity_type: 'application',
        related_entity_id: application.id,
        link_url: '/hr/scanned-records',
      });
    } catch (notifError) {
      // Log error but don't fail the application submission
      console.error('Error sending notifications:', notifError);
    }

    return NextResponse.json({
      success: true,
      data: application,
      message: `Application submitted successfully for ${job.title}`,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Server error in POST /api/applications:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
