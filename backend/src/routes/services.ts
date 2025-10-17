import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

export const serviceRoutes = Router();

// Get all active services from approved providers
serviceRoutes.get('/', async (req, res) => {
  try {
    const { category } = req.query;

    let query = supabaseAdmin
      .from('services')
      .select(`
        *,
        service_providers!inner (
          id,
          bio,
          profile_image_url,
          is_approved,
          profiles!inner (
            full_name,
            email
          )
        )
      `)
      .eq('is_active', true)
      .eq('service_providers.is_approved', true);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Get service by ID
serviceRoutes.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('services')
      .select(`
        *,
        service_providers!inner (
          id,
          bio,
          profile_image_url,
          is_approved,
          profiles!inner (
            full_name,
            email
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

// Create a new service (authenticated providers only)
serviceRoutes.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { title, description, category, price, price_type } = req.body;

    // Get provider ID for the authenticated user
    const { data: provider, error: providerError } = await supabaseAdmin
      .from('service_providers')
      .select('id')
      .eq('user_id', req.user!.id)
      .single();

    if (providerError || !provider) {
      return res.status(403).json({ error: 'Not authorized as a service provider' });
    }

    const { data, error } = await supabaseAdmin
      .from('services')
      .insert({
        provider_id: provider.id,
        title,
        description,
        category,
        price,
        price_type,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// Update a service (owner only)
serviceRoutes.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, price, price_type, is_active } = req.body;

    // Verify ownership
    const { data: service, error: serviceError } = await supabaseAdmin
      .from('services')
      .select('provider_id, service_providers!inner(user_id)')
      .eq('id', id)
      .single();

    if (serviceError || !service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    if ((service as any).service_providers.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized to update this service' });
    }

    const { data, error } = await supabaseAdmin
      .from('services')
      .update({
        title,
        description,
        category,
        price,
        price_type,
        is_active,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// Delete a service (owner only)
serviceRoutes.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const { data: service, error: serviceError } = await supabaseAdmin
      .from('services')
      .select('provider_id, service_providers!inner(user_id)')
      .eq('id', id)
      .single();

    if (serviceError || !service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    if ((service as any).service_providers.user_id !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized to delete this service' });
    }

    const { error } = await supabaseAdmin
      .from('services')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});
