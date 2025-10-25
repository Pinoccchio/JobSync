import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { notifyAdmins, notifyHR } from '@/lib/notifications';

/**
 * Announcement Management API - Individual Announcement Operations
 *
 * Endpoints:
 * - GET /api/announcements/[id] - Get announcement details
 * - DELETE /api/announcements/[id] - Delete announcement (soft delete by setting status='archived')
 */

// GET /api/announcements/[id] - Get single announcement
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Fetch announcement
    const { data: announcement, error } = await supabase
      .from('announcements')
      .select(`
        *,
        profiles:created_by (
          id,
          full_name,
          role
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Announcement not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: announcement,
    });

  } catch (error: any) {
    console.error('Server error in GET /api/announcements/[id]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/announcements/[id] - Archive or permanently delete announcement
// Query params: ?permanent=true for hard delete
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Check if this is a permanent delete request
    const searchParams = request.nextUrl.searchParams;
    const isPermanent = searchParams.get('permanent') === 'true';

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

    // 3. Only HR and ADMIN can delete announcements
    if (profile.role !== 'HR' && profile.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Only HR and Admin can delete announcements' },
        { status: 403 }
      );
    }

    // 4. Get existing announcement
    const { data: existingAnnouncement, error: fetchError } = await supabase
      .from('announcements')
      .select('id, created_by, title, status')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Announcement not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: fetchError.message },
        { status: 500 }
      );
    }

    // 5. Check ownership (HR can only delete their own, ADMIN can delete any)
    if (profile.role === 'HR' && existingAnnouncement.created_by !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - You can only delete your own announcements' },
        { status: 403 }
      );
    }

    // 6. Handle permanent deletion
    if (isPermanent) {
      // Safety check: Only allow permanent deletion of archived announcements
      if (existingAnnouncement.status !== 'archived') {
        return NextResponse.json(
          { success: false, error: 'Announcements must be archived before permanent deletion' },
          { status: 400 }
        );
      }

      // PERMANENT DELETE: Remove from database
      const { error: deleteError } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Error permanently deleting announcement:', deleteError);
        return NextResponse.json(
          { success: false, error: deleteError.message },
          { status: 500 }
        );
      }

      // Log permanent deletion
      try {
        await supabase.rpc('log_activity', {
          p_user_id: user.id,
          p_event_type: 'ANNOUNCEMENT_DELETED_PERMANENTLY',
          p_event_category: 'job',
          p_details: `Permanently deleted announcement: ${existingAnnouncement.title}`,
          p_metadata: {
            announcement_id: id,
            announcement_title: existingAnnouncement.title,
            permanent: true,
            warning: 'PERMANENT DELETION - All data removed from database',
          }
        });
      } catch (logError) {
        console.error('Error logging permanent announcement deletion:', logError);
      }

      // Send notifications for permanent deletion
      try {
        // Notify HR user (confirmation)
        await notifyHR(user.id, {
          type: 'announcement',
          title: 'Announcement Permanently Deleted',
          message: `The announcement "${existingAnnouncement.title}" has been permanently deleted from the system`,
        });

        // Notify all admins
        await notifyAdmins({
          type: 'announcement',
          title: 'Announcement Permanently Deleted',
          message: `HR user permanently deleted the announcement: "${existingAnnouncement.title}"`,
        });
      } catch (notifError) {
        console.error('Error sending permanent deletion notifications:', notifError);
      }

      return NextResponse.json({
        success: true,
        message: `Announcement "${existingAnnouncement.title}" permanently deleted`,
      });
    }

    // 7. Soft delete (default): Set status to 'archived'
    const { error: archiveError } = await supabase
      .from('announcements')
      .update({
        status: 'archived',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (archiveError) {
      console.error('Error archiving announcement:', archiveError);
      return NextResponse.json(
        { success: false, error: archiveError.message },
        { status: 500 }
      );
    }

    // Log archive operation
    try {
      await supabase.rpc('log_activity', {
        p_user_id: user.id,
        p_event_type: 'ANNOUNCEMENT_ARCHIVED',
        p_event_category: 'job',
        p_details: `Archived announcement: ${existingAnnouncement.title}`,
        p_metadata: {
          announcement_id: id,
          announcement_title: existingAnnouncement.title,
          old_status: existingAnnouncement.status,
          new_status: 'archived',
          reversible: true,
        }
      });
    } catch (logError) {
      console.error('Error logging announcement archive:', logError);
    }

    // Send notifications for archiving
    try {
      // Notify HR user (confirmation)
      await notifyHR(user.id, {
        type: 'announcement',
        title: 'Announcement Archived Successfully',
        message: `The announcement "${existingAnnouncement.title}" has been archived`,
        related_entity_type: 'announcement',
        related_entity_id: id,
        link_url: `/hr/announcements`,
      });

      // Notify all admins
      await notifyAdmins({
        type: 'announcement',
        title: 'Announcement Archived',
        message: `HR user archived the announcement: "${existingAnnouncement.title}"`,
        related_entity_type: 'announcement',
        related_entity_id: id,
        link_url: `/admin/user-management`,
      });
    } catch (notifError) {
      console.error('Error sending archive notifications:', notifError);
    }

    return NextResponse.json({
      success: true,
      message: `Announcement "${existingAnnouncement.title}" archived successfully`,
    });

  } catch (error: any) {
    console.error('Server error in DELETE /api/announcements/[id]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
