import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Job Management API - Individual Job Operations
 *
 * Endpoints:
 * - GET /api/jobs/[id] - Get job details by ID
 * - PATCH /api/jobs/[id] - Update job (HR/ADMIN only)
 * - DELETE /api/jobs/[id] - Delete/archive job (HR/ADMIN only)
 */

// GET /api/jobs/[id] - Get single job by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: job, error } = await supabase
      .from('jobs')
      .select(`
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
        created_by,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Job not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching job:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: job,
    });

  } catch (error) {
    console.error('Server error in GET /api/jobs/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/jobs/[id] - Update job
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const body = await request.json();

    // 1. Get current user
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

    // 3. Check if user is HR or ADMIN
    if (profile.role !== 'HR' && profile.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Only HR and Admin can update jobs' },
        { status: 403 }
      );
    }

    // 4. Get existing job to verify ownership (HR can only edit their own jobs, ADMIN can edit any)
    const { data: existingJob, error: fetchError } = await supabase
      .from('jobs')
      .select('id, created_by, title')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Job not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: fetchError.message },
        { status: 500 }
      );
    }

    // HR can only edit their own jobs, ADMIN can edit any
    if (profile.role === 'HR' && existingJob.created_by !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - You can only edit jobs you created' },
        { status: 403 }
      );
    }

    // 5. Prepare update data (only include fields that are provided)
    const updateData: any = {};

    if (body.title !== undefined) {
      if (typeof body.title !== 'string' || body.title.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: 'Title must be a non-empty string' },
          { status: 400 }
        );
      }
      updateData.title = body.title.trim();
    }

    if (body.description !== undefined) {
      if (typeof body.description !== 'string' || body.description.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: 'Description must be a non-empty string' },
          { status: 400 }
        );
      }
      updateData.description = body.description.trim();
    }

    if (body.degree_requirement !== undefined) {
      updateData.degree_requirement = body.degree_requirement;
    }

    if (body.eligibilities !== undefined) {
      if (!Array.isArray(body.eligibilities)) {
        return NextResponse.json(
          { success: false, error: 'Eligibilities must be an array' },
          { status: 400 }
        );
      }
      updateData.eligibilities = body.eligibilities;
    }

    if (body.skills !== undefined) {
      if (!Array.isArray(body.skills)) {
        return NextResponse.json(
          { success: false, error: 'Skills must be an array' },
          { status: 400 }
        );
      }
      updateData.skills = body.skills;
    }

    if (body.years_of_experience !== undefined) {
      if (typeof body.years_of_experience !== 'number' || body.years_of_experience < 0 || body.years_of_experience > 50) {
        return NextResponse.json(
          { success: false, error: 'Years of experience must be a number between 0 and 50' },
          { status: 400 }
        );
      }
      updateData.years_of_experience = body.years_of_experience;
    }

    if (body.location !== undefined) {
      updateData.location = body.location || null;
    }

    if (body.employment_type !== undefined) {
      updateData.employment_type = body.employment_type || null;
    }

    if (body.status !== undefined) {
      if (!['active', 'hidden', 'archived'].includes(body.status)) {
        return NextResponse.json(
          { success: false, error: 'Invalid status. Must be: active, hidden, or archived' },
          { status: 400 }
        );
      }
      updateData.status = body.status;
    }

    // Always update the updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    // 6. Update the job
    const { data: updatedJob, error: updateError } = await supabase
      .from('jobs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating job:', updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    // TODO: If job requirements changed, trigger re-ranking of applicants
    // This will be implemented in Phase 10 (AI Ranking)

    return NextResponse.json({
      success: true,
      data: updatedJob,
      message: 'Job updated successfully',
    });

  } catch (error) {
    console.error('Server error in PATCH /api/jobs/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/jobs/[id] - Archive job (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // 1. Get current user
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

    // 3. Check if user is HR or ADMIN
    if (profile.role !== 'HR' && profile.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Only HR and Admin can delete jobs' },
        { status: 403 }
      );
    }

    // 4. Get existing job to verify ownership
    const { data: existingJob, error: fetchError } = await supabase
      .from('jobs')
      .select('id, created_by, title')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Job not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: fetchError.message },
        { status: 500 }
      );
    }

    // HR can only delete their own jobs, ADMIN can delete any
    if (profile.role === 'HR' && existingJob.created_by !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - You can only delete jobs you created' },
        { status: 403 }
      );
    }

    // 5. Soft delete: Update status to 'archived' instead of hard delete
    // This preserves all applications and data for historical records
    const { error: deleteError } = await supabase
      .from('jobs')
      .update({
        status: 'archived',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (deleteError) {
      console.error('Error archiving job:', deleteError);
      return NextResponse.json(
        { success: false, error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Job "${existingJob.title}" archived successfully`,
    });

  } catch (error) {
    console.error('Server error in DELETE /api/jobs/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
