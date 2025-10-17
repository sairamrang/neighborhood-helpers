import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

export const providerRoutes = Router();

// Get all approved providers
providerRoutes.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('service_providers')
      .select(`
        *,
        profiles!inner (
          full_name,
          email
        ),
        services (
          id,
          title,
          category,
          price,
          price_type,
          is_active
        )
      `)
      .eq('is_approved', true);

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching providers:', error);
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
});

// Get provider by ID
providerRoutes.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('service_providers')
      .select(`
        *,
        profiles!inner (
          full_name,
          email
        ),
        services (
          id,
          title,
          description,
          category,
          price,
          price_type,
          is_active
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching provider:', error);
    res.status(500).json({ error: 'Failed to fetch provider' });
  }
});

// Create provider profile (authenticated users only)
providerRoutes.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { bio, profile_image_url } = req.body;

    // Check if user already has a provider profile
    const { data: existing } = await supabaseAdmin
      .from('service_providers')
      .select('id')
      .eq('user_id', req.user!.id)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Provider profile already exists' });
    }

    // Update user type to provider
    await supabaseAdmin
      .from('profiles')
      .update({ user_type: 'provider' })
      .eq('id', req.user!.id);

    const { data, error } = await supabaseAdmin
      .from('service_providers')
      .insert({
        user_id: req.user!.id,
        bio,
        profile_image_url,
        is_approved: false,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating provider profile:', error);
    res.status(500).json({ error: 'Failed to create provider profile' });
  }
});

// Update provider profile (owner only)
providerRoutes.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { bio, profile_image_url } = req.body;

    // Verify ownership
    const { data: provider, error: providerError } = await supabaseAdmin
      .from('service_providers')
      .select('user_id')
      .eq('id', id)
      .single();

    if (providerError || !provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    if (provider.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized to update this profile' });
    }

    const { data, error } = await supabaseAdmin
      .from('service_providers')
      .update({
        bio,
        profile_image_url,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error updating provider profile:', error);
    res.status(500).json({ error: 'Failed to update provider profile' });
  }
});

// Get current user's provider profile
providerRoutes.get('/me/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('service_providers')
      .select(`
        *,
        profiles!inner (
          full_name,
          email
        ),
        services (
          id,
          title,
          description,
          category,
          price,
          price_type,
          is_active
        )
      `)
      .eq('user_id', req.user!.id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching provider profile:', error);
    res.status(500).json({ error: 'Failed to fetch provider profile' });
  }
});
