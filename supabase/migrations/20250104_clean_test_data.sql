-- Migration: Clean test data from training applications
-- Date: 2025-01-04
-- Purpose: Remove test records to allow fresh testing of attendance/completion features

-- Delete test training application and related data
-- Test user: janmikoguevarra@gmail.com, +639123768582

DO $$
DECLARE
  deleted_applications INTEGER := 0;
  deleted_notifications INTEGER := 0;
BEGIN
  -- Delete notifications related to test training applications
  WITH deleted_notifs AS (
    DELETE FROM notifications
    WHERE user_id IN (
      SELECT applicant_id
      FROM training_applications
      WHERE applicant_email = 'janmikoguevarra@gmail.com'
        OR applicant_phone = '+639123768582'
    )
    AND type LIKE '%training%'
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_notifications FROM deleted_notifs;

  -- Delete test training applications
  WITH deleted_apps AS (
    DELETE FROM training_applications
    WHERE applicant_email = 'janmikoguevarra@gmail.com'
      OR applicant_phone = '+639123768582'
      OR applicant_education LIKE '%Bachelor of Science in Computer Science%'
      OR applicant_education LIKE '%Full-Stack Web Development Bootcamp%'
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_applications FROM deleted_apps;

  -- Report what was deleted
  RAISE NOTICE '🗑️  Deleted % test training application(s)', deleted_applications;
  RAISE NOTICE '🗑️  Deleted % related notification(s)', deleted_notifications;

  IF deleted_applications = 0 THEN
    RAISE NOTICE '✅ No test data found - database is clean';
  ELSE
    RAISE NOTICE '✅ Test data cleanup completed successfully';
  END IF;
END $$;
