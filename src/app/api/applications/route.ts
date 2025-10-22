import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

/**
 * Application Management API Routes
 *
 * TODO: Implement the following endpoints:
 * - GET /api/applications - List applications (filtered by user/job/status)
 * - POST /api/applications - Submit application with PDS
 * - GET /api/applications/[id] - Get application details
 * - PATCH /api/applications/[id]/status - Approve/deny application
 * - GET /api/applications/export - Export applications to XLSX
 *
 * Required Database Schema:
 * - applications table: id, job_id, applicant_id, pds_file_url, status, rank, match_score, created_at
 * - applicant_profiles table: extracted PDS data (education, experience, skills, etc.)
 */

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('job_id');
    const status = searchParams.get('status');

    // TODO: Fetch applications from database with filters
    // const { data: applications, error } = await supabase
    //   .from('applications')
    //   .select('*, applicant:applicant_profiles(*), job:jobs(*)')
    //   .eq('job_id', jobId)
    //   .eq('status', status)
    //   .order('rank', { ascending: true });

    return NextResponse.json({
      message: 'Applications API - Coming soon',
      todo: 'Create applications and applicant_profiles tables in Supabase',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();

    // TODO: Implement application submission
    // 1. Validate applicant is logged in
    // 2. Upload PDS PDF to Supabase Storage
    // 3. Extract data from PDS (OCR) - skip for now
    // 4. Create application record
    // 5. Trigger Gemini AI ranking
    // 6. Send notification to applicant

    return NextResponse.json({
      message: 'Application submission - Coming soon',
    }, { status: 501 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
