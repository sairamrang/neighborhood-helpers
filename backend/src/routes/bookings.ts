import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

export const bookingRoutes = Router();

// Get all bookings for the authenticated user
bookingRoutes.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('user_type')
      .eq('id', req.user!.id)
      .single();

    if (profileError) throw profileError;

    let query = supabaseAdmin
      .from('bookings')
      .select(`
        *,
        services!inner (
          title,
          category,
          price,
          price_type
        ),
        profiles!bookings_resident_id_fkey (
          full_name,
          email
        ),
        service_providers!inner (
          bio,
          profile_image_url,
          profiles!service_providers_user_id_fkey (
            full_name,
            email
          )
        )
      `);

    if (profile.user_type === 'resident') {
      query = query.eq('resident_id', req.user!.id);
    } else {
      // Provider - get bookings through their service_provider record
      const { data: provider } = await supabaseAdmin
        .from('service_providers')
        .select('id')
        .eq('user_id', req.user!.id)
        .single();

      if (provider) {
        query = query.eq('provider_id', provider.id);
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Create a new booking (residents only)
bookingRoutes.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { service_id, booking_date, notes } = req.body;

    // Get the service and its provider
    const { data: service, error: serviceError } = await supabaseAdmin
      .from('services')
      .select('provider_id')
      .eq('id', service_id)
      .single();

    if (serviceError || !service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .insert({
        service_id,
        resident_id: req.user!.id,
        provider_id: service.provider_id,
        booking_date,
        notes,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Update booking status (provider can accept/decline, resident can cancel)
bookingRoutes.patch('/:id/status', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Get booking details
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select('*, service_providers!inner(user_id)')
      .eq('id', id)
      .single();

    if (bookingError || !booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check authorization
    const isProvider = (booking as any).service_providers.user_id === req.user!.id;
    const isResident = booking.resident_id === req.user!.id;

    if (!isProvider && !isResident) {
      return res.status(403).json({ error: 'Not authorized to update this booking' });
    }

    // Validate status transitions
    if (isProvider && !['accepted', 'declined', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status for provider' });
    }

    if (isResident && status !== 'cancelled') {
      return res.status(400).json({ error: 'Residents can only cancel bookings' });
    }

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});
