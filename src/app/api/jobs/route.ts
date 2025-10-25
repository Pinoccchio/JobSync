import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Job Management API Routes
 *
 * Endpoints:
 * - GET /api/jobs - List all jobs (with filters)
 * - POST /api/jobs - Create new job posting (HR/ADMIN only)
 *
 * Database Schema:
 * - jobs table: id, title, description, degree_requirement, eligibilities[],
 *   skills[], years_of_experience, location, employment_type, status,
 *   created_by, created_at, updated_at
 */

// GET /api/jobs - List jobs with optional filters
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    // Optional filters
    const status = searchParams.get('status'); // active, hidden, archived
    const createdBy = searchParams.get('created_by'); // filter by creator
    const search = searchParams.get('search'); // search in title/description

    // Start query
    let query = supabase
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
      .order('created_at', { ascending: false });

    // Apply HR isolation: HR users can only see their own jobs
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      // HR users can only see jobs they created
      if (profile?.role === 'HR') {
        query = query.eq('created_by', user.id);
      }
      // ADMIN can see all jobs (no additional filter)
    }

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (createdBy) {
      query = query.eq('created_by', createdBy);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: jobs, error } = await query;

    if (error) {
      console.error('Error fetching jobs:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: jobs,
      count: jobs?.length || 0,
    });

  } catch (error) {
    console.error('Server error in GET /api/jobs:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/jobs - Create new job posting
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // 1. Get current user from auth
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
      .select('id, role, status')
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
        { success: false, error: 'Forbidden - Only HR and Admin can create jobs' },
        { status: 403 }
      );
    }

    // 4. Validate required fields
    const {
      title,
      description,
      degree_requirement,
      eligibilities = [],
      skills = [],
      years_of_experience = 0,
      location,
      employment_type,
    } = body;

    if (!title || !description || !degree_requirement) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, description, degree_requirement' },
        { status: 400 }
      );
    }

    // 5. Validate data types
    if (typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Title must be a non-empty string' },
        { status: 400 }
      );
    }

    if (typeof description !== 'string' || description.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Description must be a non-empty string' },
        { status: 400 }
      );
    }

    if (!Array.isArray(eligibilities)) {
      return NextResponse.json(
        { success: false, error: 'Eligibilities must be an array' },
        { status: 400 }
      );
    }

    if (!Array.isArray(skills)) {
      return NextResponse.json(
        { success: false, error: 'Skills must be an array' },
        { status: 400 }
      );
    }

    if (typeof years_of_experience !== 'number' || years_of_experience < 0 || years_of_experience > 50) {
      return NextResponse.json(
        { success: false, error: 'Years of experience must be a number between 0 and 50' },
        { status: 400 }
      );
    }

    // 6. Insert job into database
    const { data: job, error: insertError } = await supabase
      .from('jobs')
      .insert({
        title: title.trim(),
        description: description.trim(),
        degree_requirement,
        eligibilities,
        skills,
        years_of_experience,
        location: location || null,
        employment_type: employment_type || null,
        status: 'active', // New jobs are active by default
        created_by: user.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating job:', insertError);
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: job,
      message: 'Job created successfully',
    }, { status: 201 });

  } catch (error) {
    console.error('Server error in POST /api/jobs:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
