import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Application Management API Routes
 *
 * Endpoints:
 * - GET /api/applications - List applications (filtered by user/job/status)
 * - POST /api/applications - Submit application with PDS file
 *
 * Database Schema:
 * - applications table: id, job_id, applicant_id, applicant_profile_id, pds_file_url, pds_file_name, status, rank, match_score, created_at
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
        pds_file_url,
        pds_file_name,
        status,
        rank,
        match_score,
        education_score,
        experience_score,
        skills_score,
        eligibility_score,
        algorithm_used,
        ranking_reasoning,
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
          status
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
          profiles:user_id (
            email
          )
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
    const { job_id, pds_id, pds_file_url, pds_file_name } = body;

    if (!job_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: job_id' },
        { status: 400 }
      );
    }

    // Must provide either pds_id (web-based) OR pds_file_url (upload)
    if (!pds_id && (!pds_file_url || !pds_file_name)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Must provide either pds_id (web-based PDS) or pds_file_url/pds_file_name (uploaded PDF)',
        },
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

    // 6. Check for duplicate application
    const { data: existingApplication, error: duplicateError } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', job_id)
      .eq('applicant_id', user.id)
      .single();

    if (existingApplication) {
      return NextResponse.json(
        { success: false, error: 'You have already applied to this job' },
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
    const insertData: any = {
      job_id,
      applicant_id: user.id,
      applicant_profile_id: applicantProfileId,
      status: 'pending',
      notification_sent: false,
    };

    // Add PDS reference (either pds_id for web-based or file URL for upload)
    if (pds_id) {
      insertData.pds_id = pds_id;
    } else {
      insertData.pds_file_url = pds_file_url;
      insertData.pds_file_name = pds_file_name;
    }

    const { data: application, error: applicationError } = await supabase
      .from('applications')
      .insert(insertData)
      .select(`
        id,
        job_id,
        applicant_id,
        pds_id,
        pds_file_url,
        pds_file_name,
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

    // 9. TODO: Trigger OCR processing (Phase 10)
    // 10. TODO: Trigger AI ranking (Phase 10)
    // 11. TODO: Send notification to applicant (Phase 5)

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
