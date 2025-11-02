import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { notifyPESO, createNotification } from '@/lib/notifications';

/**
 * Training Application Management API - Individual Application Operations
 *
 * Endpoints:
 * - GET /api/training/applications/[id] - Get application details
 * - PATCH /api/training/applications/[id] - Update application status (approve/deny)
 */

// GET /api/training/applications/[id] - Get single training application
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

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

    // 3. Fetch application
    const { data: application, error } = await supabase
      .from('training_applications')
      .select(`
        *,
        training_programs:program_id (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Training application not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // 4. Check authorization (applicant can only view their own, PESO/Admin can view all)
    if (profile.role === 'APPLICANT' && application.applicant_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - You can only view your own applications' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: application,
    });

  } catch (error: any) {
    console.error('Server error in GET /api/training/applications/[id]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/training/applications/[id] - Update application status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
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
      .select('id, role, full_name')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    // 3. Validate status
    const { status, next_steps, denial_reason } = body;

    // 4. Authorization checks based on role
    if (profile.role === 'APPLICANT') {
      // Applicants can only withdraw their own applications

      // Get the application to check ownership
      const { data: application, error: appError } = await supabase
        .from('training_applications')
        .select('applicant_id, status')
        .eq('id', id)
        .single();

      if (appError || !application) {
        return NextResponse.json(
          { success: false, error: 'Application not found' },
          { status: 404 }
        );
      }

      // Check if applicant owns this application
      if (application.applicant_id !== user.id) {
        return NextResponse.json(
          { success: false, error: 'Forbidden - You can only withdraw your own applications' },
          { status: 403 }
        );
      }

      // Applicants can only withdraw
      if (status !== 'withdrawn') {
        return NextResponse.json(
          { success: false, error: 'Forbidden - Applicants can only withdraw applications' },
          { status: 403 }
        );
      }

      // Can only withdraw if status is pending, under_review, or approved
      if (!['pending', 'under_review', 'approved'].includes(application.status)) {
        return NextResponse.json(
          { success: false, error: `Cannot withdraw application with status: ${application.status}` },
          { status: 400 }
        );
      }
    } else if (profile.role !== 'PESO' && profile.role !== 'ADMIN') {
      // Only PESO, ADMIN, and APPLICANT (for withdrawal) can update applications
      return NextResponse.json(
        { success: false, error: 'Forbidden - Only PESO and Admin can update training applications' },
        { status: 403 }
      );
    }

    const validStatuses = [
      'pending',
      'under_review',
      'approved',
      'denied',
      'enrolled',
      'in_progress',
      'completed',
      'certified',
      'withdrawn',
      'failed',
      'archived'
    ];

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // 5. Get existing application
    const { data: existingApplication, error: fetchError } = await supabase
      .from('training_applications')
      .select(`
        id,
        applicant_id,
        program_id,
        full_name,
        status,
        status_history,
        training_programs:program_id (
          title,
          capacity,
          enrolled_count
        )
      `)
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Training application not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: fetchError.message },
        { status: 500 }
      );
    }

    // 6. Check if program is full (if approving)
    if (status === 'approved' && existingApplication.training_programs) {
      const program = existingApplication.training_programs as any;
      if (program.enrolled_count >= program.capacity) {
        return NextResponse.json(
          { success: false, error: 'Cannot approve - training program is full' },
          { status: 400 }
        );
      }
    }

    // 7. Build status history entry
    const currentHistory = existingApplication.status_history || [];
    const newHistoryEntry = {
      from: existingApplication.status,
      to: status,
      changed_at: new Date().toISOString(),
      changed_by: user.id,
    };
    const updatedHistory = [...currentHistory, newHistoryEntry];

    // 8. Build update object
    const updateData: any = {
      status,
      status_history: updatedHistory,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add optional fields
    if (next_steps) updateData.next_steps = next_steps;
    if (denial_reason) updateData.denial_reason = denial_reason;

    // Add timestamp fields based on status
    if (status === 'enrolled') updateData.enrollment_confirmed_at = new Date().toISOString();
    if (status === 'in_progress') updateData.training_started_at = new Date().toISOString();
    if (status === 'completed') updateData.training_completed_at = new Date().toISOString();
    if (status === 'certified') updateData.certificate_issued_at = new Date().toISOString();

    // 9. Update application status
    const { data: updatedApplication, error: updateError } = await supabase
      .from('training_applications')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        training_programs:program_id (*)
      `)
      .single();

    if (updateError) {
      console.error('Error updating training application:', updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    // 8. If approved, increment enrolled_count
    if (status === 'approved' && existingApplication.status !== 'approved') {
      // Fetch current enrolled_count
      const { data: program } = await supabase
        .from('training_programs')
        .select('enrolled_count')
        .eq('id', existingApplication.program_id)
        .single();

      // Increment the count
      await supabase
        .from('training_programs')
        .update({
          enrolled_count: (program?.enrolled_count || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingApplication.program_id);
    }

    // 9. If denied (from approved), decrement enrolled_count
    if (status === 'denied' && existingApplication.status === 'approved') {
      // Fetch current enrolled_count
      const { data: program } = await supabase
        .from('training_programs')
        .select('enrolled_count')
        .eq('id', existingApplication.program_id)
        .single();

      // Decrement the count (prevent negative values)
      await supabase
        .from('training_programs')
        .update({
          enrolled_count: Math.max((program?.enrolled_count || 0) - 1, 0),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingApplication.program_id);
    }

    // 10. Create notifications
    const program = updatedApplication.training_programs as any;
    const notificationTitle = status === 'approved'
      ? 'Training Application Approved!'
      : status === 'denied'
      ? 'Training Application Update'
      : 'Training Application Status Updated';

    const notificationMessage = status === 'approved'
      ? `Congratulations! Your application for ${program?.title} has been approved.`
      : status === 'denied'
      ? `Your application for ${program?.title} has been reviewed. Please check your application details for more information.`
      : `Your application status for ${program?.title} has been updated to ${status}.`;

    try {
      // Notify PESO user (confirmation of their own action) - NEW!
      await notifyPESO(user.id, {
        type: 'training_status',
        title: 'Application Review Submitted',
        message: `You ${status} ${existingApplication.full_name}'s application for ${program?.title}`,
        related_entity_type: 'training_application',
        related_entity_id: id,
        link_url: `/peso/applications`,
      });

      // Notify applicant
      await createNotification(existingApplication.applicant_id, {
        type: 'training_status',
        title: notificationTitle,
        message: notificationMessage,
        related_entity_type: 'training_application',
        related_entity_id: id,
        link_url: `/applicant/trainings`,
      });
    } catch (notificationError) {
      console.error('Error creating notifications:', notificationError);
      // Don't fail the request if notifications fail
    }

    // 11. Mark notification as sent
    await supabase
      .from('training_applications')
      .update({ notification_sent: true })
      .eq('id', id);

    // 12. Log activity
    try {
      await supabase.rpc('log_training_application_status_changed', {
        p_user_id: user.id,
        p_application_id: id,
        p_old_status: existingApplication.status,
        p_new_status: status,
        p_metadata: {
          program_title: program?.title,
          applicant_name: existingApplication.full_name,
          reviewer_name: profile.full_name,
        }
      });
    } catch (logError) {
      console.error('Error logging status change:', logError);
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      success: true,
      data: updatedApplication,
      message: `Training application ${status} successfully`,
    });

  } catch (error: any) {
    console.error('Server error in PATCH /api/training/applications/[id]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
