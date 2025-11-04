-- Migration: Add attendance and completion tracking fields to training_applications
-- Date: 2025-01-04
-- Purpose: Enable PESO attendance marking and completion awarding features
--
-- This migration adds 6 missing columns that are referenced in:
-- - /api/peso/training/[id]/attendance/route.ts
-- - /api/peso/training/[id]/complete/route.ts
-- - /components/peso/MarkAttendanceModal.tsx
-- - /components/peso/AwardCompletionModal.tsx

-- Add new columns
ALTER TABLE training_applications
ADD COLUMN IF NOT EXISTS attendance_marked_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS training_started_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS completion_status text,
ADD COLUMN IF NOT EXISTS training_hours_awarded numeric,
ADD COLUMN IF NOT EXISTS completion_notes text,
ADD COLUMN IF NOT EXISTS attendance_percentage numeric;

-- Add check constraint for attendance_percentage (must be between 0 and 100)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'check_attendance_percentage'
    AND conrelid = 'training_applications'::regclass
  ) THEN
    ALTER TABLE training_applications
    ADD CONSTRAINT check_attendance_percentage CHECK (
      attendance_percentage IS NULL OR (attendance_percentage >= 0 AND attendance_percentage <= 100)
    );
  END IF;
END $$;

-- Add check constraint for training_hours_awarded (must be positive)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'check_training_hours_awarded'
    AND conrelid = 'training_applications'::regclass
  ) THEN
    ALTER TABLE training_applications
    ADD CONSTRAINT check_training_hours_awarded CHECK (
      training_hours_awarded IS NULL OR training_hours_awarded >= 0
    );
  END IF;
END $$;

-- Add check constraint for completion_status (must be valid status)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'check_completion_status'
    AND conrelid = 'training_applications'::regclass
  ) THEN
    ALTER TABLE training_applications
    ADD CONSTRAINT check_completion_status CHECK (
      completion_status IS NULL OR completion_status IN ('passed', 'failed', 'pending')
    );
  END IF;
END $$;

-- Add helpful column comments for documentation
COMMENT ON COLUMN training_applications.attendance_marked_at IS 'Timestamp when attendance was marked by PESO officer';
COMMENT ON COLUMN training_applications.training_started_at IS 'Timestamp when training actually started (first attendance)';
COMMENT ON COLUMN training_applications.completion_status IS 'Completion assessment status: passed, failed, or pending';
COMMENT ON COLUMN training_applications.training_hours_awarded IS 'Actual training hours awarded (may differ from program hours due to partial attendance)';
COMMENT ON COLUMN training_applications.completion_notes IS 'Notes from PESO officer about completion/assessment';
COMMENT ON COLUMN training_applications.attendance_percentage IS 'Percentage of training sessions attended (0-100)';

-- Verify columns were added
DO $$
DECLARE
  column_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO column_count
  FROM information_schema.columns
  WHERE table_name = 'training_applications'
  AND column_name IN (
    'attendance_marked_at',
    'training_started_at',
    'completion_status',
    'training_hours_awarded',
    'completion_notes',
    'attendance_percentage'
  );

  IF column_count = 6 THEN
    RAISE NOTICE '✅ Successfully added all 6 columns to training_applications table';
  ELSE
    RAISE WARNING '⚠️  Only % out of 6 columns were added. Please check for errors.', column_count;
  END IF;
END $$;
