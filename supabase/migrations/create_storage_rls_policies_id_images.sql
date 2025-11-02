-- Migration: Create Storage RLS Policies for id-images Bucket
-- Date: 2025-01-03
-- Purpose: Fix RLS policy violation error when applicants upload ID images

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Applicants can upload their own ID images
-- Files must be stored in {user_id}/ folder structure
CREATE POLICY "Applicants can upload ID images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'id-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Applicants can read their own ID images
CREATE POLICY "Applicants can read own ID images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'id-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: PESO admins can read all ID images
-- This is needed for PESO to verify applicant identities
CREATE POLICY "PESO can read all ID images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'id-images'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('PESO', 'ADMIN')
  )
);

-- Policy 4: Admins can delete ID images
-- For data management and cleanup
CREATE POLICY "Admins can delete ID images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'id-images'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'ADMIN'
  )
);

-- Policy 5: Applicants can update (replace) their own ID images
CREATE POLICY "Applicants can update own ID images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'id-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'id-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Verify policies were created
SELECT
  policyname,
  cmd,
  roles,
  CASE
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as using_clause,
  CASE
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
    ELSE 'No WITH CHECK clause'
  END as with_check_clause
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND policyname LIKE '%ID images%'
ORDER BY policyname;
