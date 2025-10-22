-- ============================================
-- CHECK PROVIDER APPROVAL STATUS
-- ============================================

-- Check all service providers and their approval status
SELECT
  sp.id,
  sp.approval_status,
  sp.created_at,
  p.email,
  p.full_name,
  p.user_type
FROM service_providers sp
JOIN profiles p ON sp.user_id = p.id
ORDER BY sp.created_at DESC;

-- Check services for providers
SELECT
  s.id,
  s.title,
  s.category,
  s.is_active,
  sp.approval_status as provider_status,
  p.email as provider_email
FROM services s
JOIN service_providers sp ON s.provider_id = sp.id
JOIN profiles p ON sp.user_id = p.id
ORDER BY s.created_at DESC;

-- Quick fix: Approve all pending providers
-- Uncomment to run:
/*
UPDATE service_providers
SET approval_status = 'approved'
WHERE approval_status = 'pending';
*/

-- Verify the update
SELECT
  approval_status,
  COUNT(*) as count
FROM service_providers
GROUP BY approval_status;
