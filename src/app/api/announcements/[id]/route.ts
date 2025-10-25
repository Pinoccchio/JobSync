import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

// DELETE /api/announcements/[id] - Delete announcement (soft delete)
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
      .select('id, created_by')
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

    // 6. Soft delete by setting status to 'archived'
    const { error: deleteError } = await supabase
      .from('announcements')
      .update({
        status: 'archived',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting announcement:', deleteError);
      return NextResponse.json(
        { success: false, error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Announcement deleted successfully',
    });

  } catch (error: any) {
    console.error('Server error in DELETE /api/announcements/[id]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
