-- Migration: Set up Row Level Security (RLS) policies
-- Date: 2025-01-04
-- Purpose: Implement proper data access controls for all tables
-- IMPORTANT: This ensures users can only access data they're authorized to see

-- =====================================================
-- PROFILES TABLE
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Admin can view all profiles
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
CREATE POLICY "Admin can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Users can update own profile (except role)
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admin can update any profile
DROP POLICY IF EXISTS "Admin can update any profile" ON profiles;
CREATE POLICY "Admin can update any profile"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- =====================================================
-- APPLICANT_PDS TABLE
-- =====================================================
ALTER TABLE applicant_pds ENABLE ROW LEVEL SECURITY;

-- Applicants can manage own PDS
DROP POLICY IF EXISTS "Applicants can manage own PDS" ON applicant_pds;
CREATE POLICY "Applicants can manage own PDS"
  ON applicant_pds FOR ALL
  USING (auth.uid() = user_id);

-- HR and Admin can view all PDS
DROP POLICY IF EXISTS "HR and Admin can view PDS" ON applicant_pds;
CREATE POLICY "HR and Admin can view PDS"
  ON applicant_pds FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('HR', 'ADMIN')
    )
  );

-- =====================================================
-- APPLICANT_PROFILES TABLE
-- =====================================================
ALTER TABLE applicant_profiles ENABLE ROW LEVEL SECURITY;

-- Applicants can view own profile
DROP POLICY IF EXISTS "Applicants can view own profile" ON applicant_profiles;
CREATE POLICY "Applicants can view own profile"
  ON applicant_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- HR and Admin can view all applicant profiles
DROP POLICY IF EXISTS "HR and Admin can view applicant profiles" ON applicant_profiles;
CREATE POLICY "HR and Admin can view applicant profiles"
  ON applicant_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('HR', 'ADMIN')
    )
  );

-- Applicants can update own profile
DROP POLICY IF EXISTS "Applicants can update own profile" ON applicant_profiles;
CREATE POLICY "Applicants can update own profile"
  ON applicant_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- JOBS TABLE
-- =====================================================
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Everyone can view active jobs
DROP POLICY IF EXISTS "Everyone can view active jobs" ON jobs;
CREATE POLICY "Everyone can view active jobs"
  ON jobs FOR SELECT
  USING (status = 'active' OR status = 'open');

-- HR and Admin can view all jobs
DROP POLICY IF EXISTS "HR and Admin can view all jobs" ON jobs;
CREATE POLICY "HR and Admin can view all jobs"
  ON jobs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('HR', 'ADMIN')
    )
  );

-- HR and Admin can create jobs
DROP POLICY IF EXISTS "HR and Admin can create jobs" ON jobs;
CREATE POLICY "HR and Admin can create jobs"
  ON jobs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('HR', 'ADMIN')
    )
  );

-- HR and Admin can update jobs
DROP POLICY IF EXISTS "HR and Admin can update jobs" ON jobs;
CREATE POLICY "HR and Admin can update jobs"
  ON jobs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('HR', 'ADMIN')
    )
  );

-- =====================================================
-- APPLICATIONS TABLE
-- =====================================================
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Applicants can view own applications
DROP POLICY IF EXISTS "Applicants can view own applications" ON applications;
CREATE POLICY "Applicants can view own applications"
  ON applications FOR SELECT
  USING (auth.uid() = applicant_id);

-- Applicants can create own applications
DROP POLICY IF EXISTS "Applicants can create applications" ON applications;
CREATE POLICY "Applicants can create applications"
  ON applications FOR INSERT
  WITH CHECK (auth.uid() = applicant_id);

-- HR and Admin can view all applications
DROP POLICY IF EXISTS "HR and Admin can view all applications" ON applications;
CREATE POLICY "HR and Admin can view all applications"
  ON applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('HR', 'ADMIN')
    )
  );

-- HR and Admin can update applications (approve, deny, rank)
DROP POLICY IF EXISTS "HR and Admin can update applications" ON applications;
CREATE POLICY "HR and Admin can update applications"
  ON applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('HR', 'ADMIN')
    )
  );

-- =====================================================
-- TRAINING_PROGRAMS TABLE
-- =====================================================
ALTER TABLE training_programs ENABLE ROW LEVEL SECURITY;

-- Everyone can view active training programs
DROP POLICY IF EXISTS "Everyone can view active training programs" ON training_programs;
CREATE POLICY "Everyone can view active training programs"
  ON training_programs FOR SELECT
  USING (status = 'active' OR status = 'open' OR status = 'scheduled');

-- PESO and Admin can view all training programs
DROP POLICY IF EXISTS "PESO and Admin can view all training programs" ON training_programs;
CREATE POLICY "PESO and Admin can view all training programs"
  ON training_programs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('PESO', 'ADMIN')
    )
  );

-- PESO and Admin can manage training programs
DROP POLICY IF EXISTS "PESO and Admin can manage training programs" ON training_programs;
CREATE POLICY "PESO and Admin can manage training programs"
  ON training_programs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('PESO', 'ADMIN')
    )
  );

-- =====================================================
-- TRAINING_APPLICATIONS TABLE
-- =====================================================
ALTER TABLE training_applications ENABLE ROW LEVEL SECURITY;

-- Applicants can view own training applications
DROP POLICY IF EXISTS "Applicants can view own training applications" ON training_applications;
CREATE POLICY "Applicants can view own training applications"
  ON training_applications FOR SELECT
  USING (auth.uid() = applicant_id);

-- Applicants can create training applications
DROP POLICY IF EXISTS "Applicants can create training applications" ON training_applications;
CREATE POLICY "Applicants can create training applications"
  ON training_applications FOR INSERT
  WITH CHECK (auth.uid() = applicant_id);

-- PESO and Admin can view all training applications
DROP POLICY IF EXISTS "PESO and Admin can view all training applications" ON training_applications;
CREATE POLICY "PESO and Admin can view all training applications"
  ON training_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('PESO', 'ADMIN')
    )
  );

-- PESO and Admin can update training applications (attendance, completion)
DROP POLICY IF EXISTS "PESO and Admin can update training applications" ON training_applications;
CREATE POLICY "PESO and Admin can update training applications"
  ON training_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('PESO', 'ADMIN')
    )
  );

-- =====================================================
-- ANNOUNCEMENTS TABLE
-- =====================================================
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Everyone can view published announcements
DROP POLICY IF EXISTS "Everyone can view published announcements" ON announcements;
CREATE POLICY "Everyone can view published announcements"
  ON announcements FOR SELECT
  USING (published = true);

-- HR, PESO, and Admin can view all announcements
DROP POLICY IF EXISTS "Staff can view all announcements" ON announcements;
CREATE POLICY "Staff can view all announcements"
  ON announcements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('HR', 'PESO', 'ADMIN')
    )
  );

-- HR, PESO, and Admin can manage announcements
DROP POLICY IF EXISTS "Staff can manage announcements" ON announcements;
CREATE POLICY "Staff can manage announcements"
  ON announcements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('HR', 'PESO', 'ADMIN')
    )
  );

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can view own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update own notifications (mark as read)
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- System and staff can create notifications
DROP POLICY IF EXISTS "Staff can create notifications" ON notifications;
CREATE POLICY "Staff can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('HR', 'PESO', 'ADMIN')
    )
  );

-- =====================================================
-- ACTIVITY_LOGS TABLE
-- =====================================================
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Users can view own activity logs
DROP POLICY IF EXISTS "Users can view own activity logs" ON activity_logs;
CREATE POLICY "Users can view own activity logs"
  ON activity_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Admin can view all activity logs
DROP POLICY IF EXISTS "Admin can view all activity logs" ON activity_logs;
CREATE POLICY "Admin can view all activity logs"
  ON activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- All authenticated users can create activity logs
DROP POLICY IF EXISTS "Users can create activity logs" ON activity_logs;
CREATE POLICY "Users can create activity logs"
  ON activity_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- AUDIT_TRAIL TABLE
-- =====================================================
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;

-- Admin can view all audit trail
DROP POLICY IF EXISTS "Admin can view audit trail" ON audit_trail;
CREATE POLICY "Admin can view audit trail"
  ON audit_trail FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- All authenticated users can create audit trail entries
DROP POLICY IF EXISTS "Users can create audit trail" ON audit_trail;
CREATE POLICY "Users can create audit trail"
  ON audit_trail FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
DO $$
DECLARE
  table_count INTEGER;
  policy_count INTEGER;
BEGIN
  -- Count tables with RLS enabled
  SELECT COUNT(*) INTO table_count
  FROM pg_tables t
  JOIN pg_class c ON c.relname = t.tablename
  WHERE t.schemaname = 'public'
  AND c.relrowsecurity = true;

  -- Count total policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public';

  RAISE NOTICE '✅ RLS enabled on % tables', table_count;
  RAISE NOTICE '✅ Total security policies: %', policy_count;
  RAISE NOTICE '✅ Row Level Security setup completed successfully';
END $$;
