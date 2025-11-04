-- Migration: Add soft delete and improve enums
-- Date: 2025-01-04
-- Purpose: Implement soft delete for critical tables and split mixed application status enums

-- =====================================================
-- ADD SOFT DELETE COLUMNS
-- =====================================================

-- Add deleted_at column to jobs table
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;

COMMENT ON COLUMN jobs.deleted_at IS 'Timestamp when job was soft deleted (NULL = active)';

-- Add deleted_at column to training_programs table
ALTER TABLE training_programs
ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;

COMMENT ON COLUMN training_programs.deleted_at IS 'Timestamp when training program was soft deleted (NULL = active)';

-- Add deleted_at column to announcements table
ALTER TABLE announcements
ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;

COMMENT ON COLUMN announcements.deleted_at IS 'Timestamp when announcement was soft deleted (NULL = active)';

-- =====================================================
-- CREATE HELPFUL VIEWS FOR ACTIVE RECORDS
-- =====================================================

-- View for active jobs only (excludes soft deleted)
CREATE OR REPLACE VIEW active_jobs AS
SELECT *
FROM jobs
WHERE deleted_at IS NULL;

-- View for active training programs only
CREATE OR REPLACE VIEW active_training_programs AS
SELECT *
FROM training_programs
WHERE deleted_at IS NULL;

-- View for active announcements only
CREATE OR REPLACE VIEW active_announcements AS
SELECT *
FROM announcements
WHERE deleted_at IS NULL;

-- =====================================================
-- ADD TRAINING PROGRAM STATUS FIELD
-- =====================================================

-- Add status column to training_programs if it doesn't exist
ALTER TABLE training_programs
ADD COLUMN IF NOT EXISTS status text DEFAULT 'scheduled';

-- Add check constraint for training program status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'check_training_program_status'
    AND conrelid = 'training_programs'::regclass
  ) THEN
    ALTER TABLE training_programs
    ADD CONSTRAINT check_training_program_status CHECK (
      status IN ('scheduled', 'ongoing', 'completed', 'cancelled', 'active', 'open', 'closed')
    );
  END IF;
END $$;

COMMENT ON COLUMN training_programs.status IS 'Training program lifecycle status: scheduled, ongoing, completed, cancelled';

-- =====================================================
-- IMPROVE APPLICATION STATUS DOCUMENTATION
-- =====================================================

-- Add helpful comments to clarify status usage
COMMENT ON COLUMN applications.status IS 'Job application status: pending, under_review, shortlisted, interviewed, approved, denied, hired, archived, withdrawn';

COMMENT ON COLUMN training_applications.status IS 'Training application status: pending, under_review, approved, denied, enrolled, in_progress, completed, certified, failed';

-- =====================================================
-- CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to soft delete a job
CREATE OR REPLACE FUNCTION soft_delete_job(job_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE jobs
  SET deleted_at = NOW()
  WHERE id = job_id AND deleted_at IS NULL;
END;
$$;

-- Function to restore a soft deleted job
CREATE OR REPLACE FUNCTION restore_job(job_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE jobs
  SET deleted_at = NULL
  WHERE id = job_id;
END;
$$;

-- Function to soft delete a training program
CREATE OR REPLACE FUNCTION soft_delete_training_program(program_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE training_programs
  SET deleted_at = NOW(), status = 'cancelled'
  WHERE id = program_id AND deleted_at IS NULL;
END;
$$;

-- Function to restore a soft deleted training program
CREATE OR REPLACE FUNCTION restore_training_program(program_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE training_programs
  SET deleted_at = NULL
  WHERE id = program_id;
END;
$$;

-- =====================================================
-- ADD INDEXES FOR SOFT DELETE QUERIES
-- =====================================================

-- Index for filtering out soft deleted jobs
CREATE INDEX IF NOT EXISTS idx_jobs_deleted_at
  ON jobs(deleted_at)
  WHERE deleted_at IS NULL;

-- Index for filtering out soft deleted training programs
CREATE INDEX IF NOT EXISTS idx_training_programs_deleted_at
  ON training_programs(deleted_at)
  WHERE deleted_at IS NULL;

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
  soft_delete_columns INTEGER;
  helper_functions INTEGER;
BEGIN
  -- Count soft delete columns added
  SELECT COUNT(*) INTO soft_delete_columns
  FROM information_schema.columns
  WHERE table_schema = 'public'
  AND column_name = 'deleted_at'
  AND table_name IN ('jobs', 'training_programs', 'announcements');

  -- Count helper functions created
  SELECT COUNT(*) INTO helper_functions
  FROM pg_proc
  WHERE proname IN ('soft_delete_job', 'restore_job', 'soft_delete_training_program', 'restore_training_program');

  RAISE NOTICE '✅ Soft delete columns added: %', soft_delete_columns;
  RAISE NOTICE '✅ Helper functions created: %', helper_functions;
  RAISE NOTICE '✅ Soft delete and enum improvements completed successfully';
END $$;
