-- Migration: Fix mutable search_path security vulnerability in functions
-- Date: 2025-11-04
-- Description: Add SET search_path = public, pg_temp to 5 functions to prevent search path injection attacks

BEGIN;

-- ============================================
-- 1. Fix validate_job_application
-- ============================================
CREATE OR REPLACE FUNCTION validate_job_application(p_job_id uuid, p_applicant_id uuid)
RETURNS TABLE(can_apply boolean, reason text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Check if user already has a non-withdrawn application for this job
  IF EXISTS (
    SELECT 1 FROM applications
    WHERE job_id = p_job_id
      AND applicant_id = p_applicant_id
      AND status != 'withdrawn'
  ) THEN
    can_apply := false;
    reason := 'You have already applied to this job';
    RETURN NEXT;
    RETURN;
  END IF;

  can_apply := true;
  reason := NULL;
  RETURN NEXT;
END;
$$;

-- ============================================
-- 2. Fix validate_training_application
-- ============================================
CREATE OR REPLACE FUNCTION validate_training_application(p_program_id uuid, p_applicant_id uuid)
RETURNS TABLE(can_apply boolean, reason text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Check if user already has a non-withdrawn application for this program
  IF EXISTS (
    SELECT 1 FROM training_applications
    WHERE program_id = p_program_id
      AND applicant_id = p_applicant_id
      AND status NOT IN ('withdrawn', 'denied')
  ) THEN
    can_apply := false;
    reason := 'You have already applied to this training program';
    RETURN NEXT;
    RETURN;
  END IF;

  -- Check if program is at capacity
  DECLARE
    v_capacity integer;
    v_enrolled_count integer;
  BEGIN
    SELECT capacity, enrolled_count
    INTO v_capacity, v_enrolled_count
    FROM training_programs
    WHERE id = p_program_id;

    IF v_enrolled_count >= v_capacity THEN
      can_apply := false;
      reason := 'This training program is at full capacity';
      RETURN NEXT;
      RETURN;
    END IF;
  END;

  can_apply := true;
  reason := NULL;
  RETURN NEXT;
END;
$$;

-- ============================================
-- 3. Fix get_program_stats
-- ============================================
CREATE OR REPLACE FUNCTION get_program_stats(p_program_id uuid)
RETURNS TABLE(
  total_applications bigint,
  pending_applications bigint,
  approved_applications bigint,
  enrolled_applications bigint,
  completed_applications bigint,
  certified_applications bigint,
  denied_applications bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::bigint as total_applications,
    COUNT(*) FILTER (WHERE status = 'pending')::bigint as pending_applications,
    COUNT(*) FILTER (WHERE status = 'approved')::bigint as approved_applications,
    COUNT(*) FILTER (WHERE status = 'enrolled')::bigint as enrolled_applications,
    COUNT(*) FILTER (WHERE status = 'completed')::bigint as completed_applications,
    COUNT(*) FILTER (WHERE status = 'certified')::bigint as certified_applications,
    COUNT(*) FILTER (WHERE status = 'denied')::bigint as denied_applications
  FROM training_applications
  WHERE program_id = p_program_id;
END;
$$;

-- ============================================
-- 4. Fix get_active_enrollment_count
-- ============================================
CREATE OR REPLACE FUNCTION get_active_enrollment_count(p_program_id uuid)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_count bigint;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM training_applications
  WHERE program_id = p_program_id
    AND status IN ('enrolled', 'in_progress');

  RETURN COALESCE(v_count, 0);
END;
$$;

-- ============================================
-- 5. Fix get_completion_summary
-- ============================================
CREATE OR REPLACE FUNCTION get_completion_summary(p_program_id uuid)
RETURNS TABLE(
  total_enrolled bigint,
  completed bigint,
  certified bigint,
  failed bigint,
  completion_rate numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE status IN ('enrolled', 'in_progress', 'completed', 'certified', 'failed'))::bigint as total_enrolled,
    COUNT(*) FILTER (WHERE status = 'completed')::bigint as completed,
    COUNT(*) FILTER (WHERE status = 'certified')::bigint as certified,
    COUNT(*) FILTER (WHERE status = 'failed')::bigint as failed,
    CASE
      WHEN COUNT(*) FILTER (WHERE status IN ('enrolled', 'in_progress', 'completed', 'certified', 'failed')) > 0
      THEN ROUND(
        (COUNT(*) FILTER (WHERE status IN ('completed', 'certified'))::numeric /
         COUNT(*) FILTER (WHERE status IN ('enrolled', 'in_progress', 'completed', 'certified', 'failed'))::numeric) * 100,
        2
      )
      ELSE 0
    END as completion_rate
  FROM training_applications
  WHERE program_id = p_program_id;
END;
$$;

COMMIT;

-- Verification
DO $$
BEGIN
  RAISE NOTICE 'Migration 20251104_fix_function_search_paths completed successfully';
  RAISE NOTICE 'Fixed 5 functions with mutable search_path vulnerability';
END $$;
