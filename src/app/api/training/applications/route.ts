import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Training Applications Management API Routes
 *
 * Endpoints:
 * - GET /api/training/applications - List training applications
 * - POST /api/training/applications - Submit training application
 *
 * Database Schema:
 * - training_applications table: id, program_id, applicant_id, full_name, email, phone, address,
 *   highest_education, id_image_url, id_image_name, status, reviewed_by, reviewed_at,
 *   notification_sent, submitted_at, created_at, updated_at
 */

// GET /api/training/applications - List training applications
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

    // 2. Get user profile
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
    const programId = searchParams.get('program_id');
    const status = searchParams.get('status'); // pending, approved, denied

    // 4. Build query based on role
    let query = supabase
      .from('training_applications')
      .select(`
        *,
        training_programs:program_id (
          id,
          title,
          duration,
          start_date
        )
      `)
      .order('submitted_at', { ascending: false });

    // Role-based filtering
    if (profile.role === 'APPLICANT') {
      // Applicants can only see their own applications
      query = query.eq('applicant_id', user.id);
    }
    // PESO and ADMIN can see all applications

    // Apply program filter
    if (programId) {
      query = query.eq('program_id', programId);
    }

    // Apply status filter
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Execute query
    const { data: applications, error } = await query;

    if (error) {
      console.error('Error fetching training applications:', error);
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
    console.error('Server error in GET /api/training/applications:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/training/applications - Submit training application
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
      .select('id, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    // 3. Only APPLICANT can submit training applications
    if (profile.role !== 'APPLICANT') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Only applicants can submit training applications' },
        { status: 403 }
      );
    }

    // 4. Validate required fields
    const { program_id, full_name, email, phone, address, highest_education, id_image_url, id_image_name } = body;

    if (!program_id || !full_name || !email || !phone || !address || !highest_education || !id_image_url) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: program_id, full_name, email, phone, address, highest_education, id_image_url' },
        { status: 400 }
      );
    }

    // 5. Check if program exists and is active
    const { data: program, error: programError } = await supabase
      .from('training_programs')
      .select('id, title, status, capacity, enrolled_count')
      .eq('id', program_id)
      .single();

    if (programError || !program) {
      return NextResponse.json(
        { success: false, error: 'Training program not found' },
        { status: 404 }
      );
    }

    if (program.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'This training program is no longer accepting applications' },
        { status: 400 }
      );
    }

    // 6. Check if program is full
    if (program.enrolled_count >= program.capacity) {
      return NextResponse.json(
        { success: false, error: 'This training program is full' },
        { status: 400 }
      );
    }

    // 7. Check for duplicate application
    const { data: existingApplication } = await supabase
      .from('training_applications')
      .select('id')
      .eq('program_id', program_id)
      .eq('applicant_id', user.id)
      .single();

    if (existingApplication) {
      return NextResponse.json(
        { success: false, error: 'You have already applied to this training program' },
        { status: 400 }
      );
    }

    // 8. Create application
    const { data: application, error: createError } = await supabase
      .from('training_applications')
      .insert({
        program_id,
        applicant_id: user.id,
        full_name,
        email,
        phone,
        address,
        highest_education,
        id_image_url,
        id_image_name: id_image_name || 'id-image.jpg',
        status: 'pending',
        submitted_at: new Date().toISOString(),
      })
      .select(`
        *,
        training_programs:program_id (
          id,
          title,
          duration,
          start_date
        )
      `)
      .single();

    if (createError) {
      console.error('Error creating training application:', createError);
      return NextResponse.json(
        { success: false, error: createError.message },
        { status: 500 }
      );
    }

    // 9. Log activity
    try {
      await supabase.rpc('log_training_application_submitted', {
        p_applicant_id: user.id,
        p_application_id: application.id,
        p_program_id: program_id,
        p_metadata: {
          program_title: program.title,
          applicant_name: full_name,
          submitted_at: application.submitted_at,
        }
      });
    } catch (logError) {
      console.error('Error logging training application:', logError);
      // Don't fail the request if logging fails
    }

    // 10. Send notification to applicant
    try {
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type: 'training_application',
          title: 'Training Application Submitted',
          message: `Your application for "${program.title}" has been submitted successfully. You will be notified once it is reviewed.`,
          related_entity_type: 'training_application',
          related_entity_id: application.id,
          link_url: `/applicant/trainings`,
          is_read: false,
        });
    } catch (notifError) {
      console.error('Error sending notification:', notifError);
      // Don't fail the request if notification fails
    }

    return NextResponse.json(
      {
        success: true,
        data: application,
        message: 'Training application submitted successfully',
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Server error in POST /api/training/applications:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
