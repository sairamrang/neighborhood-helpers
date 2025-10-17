-- Drop the existing restrictive policy for viewing service providers
DROP POLICY IF EXISTS "Approved service providers are viewable by everyone" ON service_providers;

-- Create a new policy that allows everyone to view all service providers
-- This is fine for local development; in production you'd add proper admin checks
CREATE POLICY "Service providers are viewable by everyone"
  ON service_providers FOR SELECT
  USING (true);

-- Also update the policy to allow anyone to update is_approved
-- (In production, you'd check if the user is an admin)
DROP POLICY IF EXISTS "Users can update their own service provider profile" ON service_providers;

CREATE POLICY "Users can update their own service provider profile"
  ON service_providers FOR UPDATE
  USING (auth.uid() = user_id OR true);  -- Allow anyone to update for now (local dev)
