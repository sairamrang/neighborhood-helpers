-- ============================================
-- APPROVE ALL PENDING PROVIDERS
-- Quick fix to approve providers
-- ============================================

-- Step 1: See all providers and their status
SELECT
  sp.id,
  sp.approval_status,
  p.email,
  p.full_name,
  sp.created_at
FROM service_providers sp
JOIN profiles p ON sp.user_id = p.id
ORDER BY sp.created_at DESC;

-- Step 2: Approve ALL pending providers
UPDATE service_providers
SET approval_status = 'approved'
WHERE approval_status = 'pending';

-- Step 3: Verify they're approved
SELECT
  approval_status,
  COUNT(*) as count
FROM service_providers
GROUP BY approval_status;

-- Step 4: Check services are now visible
SELECT
  s.title,
  s.category,
  s.is_active,
  sp.approval_status,
  p.email as provider_email
FROM services s
JOIN service_providers sp ON s.provider_id = sp.id
JOIN profiles p ON sp.user_id = p.id;

-- ============================================
-- After running this, refresh your app!
-- Provider services should now be visible
-- ============================================
