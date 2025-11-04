-- Migration: Add performance indexes
-- Date: 2025-01-04
-- Purpose: Optimize query performance on frequently accessed foreign keys and lookup columns

-- Create indexes if they don't exist

-- Applications table indexes
CREATE INDEX IF NOT EXISTS idx_applications_applicant_id
  ON applications(applicant_id);

CREATE INDEX IF NOT EXISTS idx_applications_job_id
  ON applications(job_id);

CREATE INDEX IF NOT EXISTS idx_applications_status
  ON applications(status);

CREATE INDEX IF NOT EXISTS idx_applications_created_at
  ON applications(created_at DESC);

-- Training applications table indexes
CREATE INDEX IF NOT EXISTS idx_training_applications_applicant_id
  ON training_applications(applicant_id);

CREATE INDEX IF NOT EXISTS idx_training_applications_program_id
  ON training_applications(program_id);

CREATE INDEX IF NOT EXISTS idx_training_applications_status
  ON training_applications(status);

CREATE INDEX IF NOT EXISTS idx_training_applications_completion_status
  ON training_applications(completion_status)
  WHERE completion_status IS NOT NULL;

-- Notifications table indexes (for fast unread lookup)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read
  ON notifications(user_id, is_read);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at
  ON notifications(created_at DESC);

-- Jobs table indexes
CREATE INDEX IF NOT EXISTS idx_jobs_status
  ON jobs(status);

CREATE INDEX IF NOT EXISTS idx_jobs_posted_by
  ON jobs(posted_by);

-- Training programs table indexes
CREATE INDEX IF NOT EXISTS idx_training_programs_status
  ON training_programs(status);

CREATE INDEX IF NOT EXISTS idx_training_programs_created_by
  ON training_programs(created_by);

-- Activity logs table index (for audit queries)
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id_timestamp
  ON activity_logs(user_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_activity_logs_event_type
  ON activity_logs(event_type);

-- Audit trail table index
CREATE INDEX IF NOT EXISTS idx_audit_trail_table_name_record_id
  ON audit_trail(table_name, record_id);

CREATE INDEX IF NOT EXISTS idx_audit_trail_changed_by
  ON audit_trail(changed_by);

-- Applicant PDS table index
CREATE INDEX IF NOT EXISTS idx_applicant_pds_user_id
  ON applicant_pds(user_id);

-- Verify indexes were created
DO $$
DECLARE
  index_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%';

  RAISE NOTICE '✅ Total custom indexes in database: %', index_count;
  RAISE NOTICE '✅ Performance indexes created successfully';
END $$;
