import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { extractFilePathFromStorageUrl, deleteFileFromStorage } from '@/lib/utils/storage';

/**
 * Application Management API - Individual Application Operations
 *
 * Endpoints:
 * - GET /api/applications/[id] - Get application details
 * - PATCH /api/applications/[id] - Update application status (approve/deny)
 * - DELETE /api/applications/[id] - Delete application (admin only)
 */

// GET /api/applications/[id] - Get single application
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
      .from('applications')
      .select(`
        *,
        jobs:job_id (*),
        applicant_profiles:applicant_profile_id (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Application not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // 4. Check authorization (applicant can only view their own, HR/Admin can view all)
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
    console.error('Server error in GET /api/applications/[id]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/applications/[id] - Update application status
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

    // 3. Only HR and ADMIN can update application status
    if (profile.role !== 'HR' && profile.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Only HR and Admin can update applications' },
        { status: 403 }
      );
    }

    // 4. Validate status
    const { status } = body;

    if (!status || !['pending', 'approved', 'denied'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be: pending, approved, or denied' },
        { status: 400 }
      );
    }

    // 5. Get existing application
    const { data: existingApplication, error: fetchError } = await supabase
      .from('applications')
      .select(`
        id,
        applicant_id,
        job_id,
        status,
        jobs:job_id (
          title
        )
      `)
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Application not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: fetchError.message },
        { status: 500 }
      );
    }

    // 6. Update application status
    const { data: updatedApplication, error: updateError } = await supabase
      .from('applications')
      .update({
        status,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        jobs:job_id (*),
        applicant_profiles:applicant_profile_id (*)
      `)
      .single();

    if (updateError) {
      console.error('Error updating application:', updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    // 7. Create notification for applicant
    const notificationTitle = status === 'approved'
      ? 'Application Approved!'
      : status === 'denied'
      ? 'Application Update'
      : 'Application Status Updated';

    const notificationMessage = status === 'approved'
      ? `Congratulations! Your application for ${existingApplication.jobs?.title} has been approved.`
      : status === 'denied'
      ? `Your application for ${existingApplication.jobs?.title} has been reviewed. Please check your application details for more information.`
      : `Your application status for ${existingApplication.jobs?.title} has been updated to ${status}.`;

    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: existingApplication.applicant_id,
        type: 'application_status',
        title: notificationTitle,
        message: notificationMessage,
        related_entity_type: 'application',
        related_entity_id: id,
        link_url: `/applicant/applications`,
        is_read: false,
      });

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Don't fail the request if notification fails
    }

    // 8. Mark notification as sent
    await supabase
      .from('applications')
      .update({ notification_sent: true })
      .eq('id', id);

    return NextResponse.json({
      success: true,
      data: updatedApplication,
      message: `Application ${status} successfully`,
    });

  } catch (error: any) {
    console.error('Server error in PATCH /api/applications/[id]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/applications/[id] - Delete application (admin only)
export async function DELETE(
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

    // 3. Only ADMIN can delete applications
    if (profile.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Only admins can delete applications' },
        { status: 403 }
      );
    }

    // 4. Get existing application (with PDS file URL for cleanup)
    const { data: existingApplication, error: fetchError } = await supabase
      .from('applications')
      .select('id, pds_file_url, pds_file_name')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Application not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: fetchError.message },
        { status: 500 }
      );
    }

    // 5. Delete PDS file from storage (if exists)
    if (existingApplication.pds_file_url) {
      const filePath = extractFilePathFromStorageUrl(existingApplication.pds_file_url, 'pds-files');
      if (filePath) {
        const adminClient = createAdminClient();
        await deleteFileFromStorage(adminClient, 'pds-files', filePath);
      }
    }

    // 6. Delete application from database
    const { error: deleteError } = await supabase
      .from('applications')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting application:', deleteError);
      return NextResponse.json(
        { success: false, error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Application deleted successfully',
    });

  } catch (error: any) {
    console.error('Server error in DELETE /api/applications/[id]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
