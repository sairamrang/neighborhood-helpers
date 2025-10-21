import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

export const reviewRoutes = Router();

// Get all reviews for a specific provider
reviewRoutes.get('/provider/:providerId', async (req, res) => {
  try {
    const { providerId } = req.params;

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .select(`
        id,
        rating,
        feedback,
        created_at,
        profiles!reviews_resident_id_fkey (
          full_name
        )
      `)
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get average rating for a provider
reviewRoutes.get('/provider/:providerId/rating', async (req, res) => {
  try {
    const { providerId } = req.params;

    const { data, error } = await supabaseAdmin
      .from('provider_ratings')
      .select('*')
      .eq('provider_id', providerId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found

    res.json(data || { average_rating: 0, review_count: 0 });
  } catch (error: any) {
    console.error('Error fetching rating:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a new review (authenticated residents only)
reviewRoutes.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { booking_id, provider_id, rating, feedback } = req.body;

    // Validate input
    if (!booking_id || !provider_id || !rating) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Verify the booking exists and belongs to this user
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .eq('resident_id', req.user!.id)
      .eq('status', 'completed')
      .single();

    if (bookingError || !booking) {
      return res.status(403).json({ error: 'Invalid booking or booking not completed' });
    }

    // Check if review already exists
    const { data: existingReview } = await supabaseAdmin
      .from('reviews')
      .select('id')
      .eq('booking_id', booking_id)
      .single();

    if (existingReview) {
      return res.status(400).json({ error: 'Review already exists for this booking' });
    }

    // Create the review
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .insert({
        booking_id,
        provider_id,
        resident_id: req.user!.id,
        rating,
        feedback: feedback || null,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error: any) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update a review (authenticated residents only, their own reviews)
reviewRoutes.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;

    // Validate input
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Verify the review belongs to this user
    const { data: existingReview, error: reviewError } = await supabaseAdmin
      .from('reviews')
      .select('*')
      .eq('id', id)
      .eq('resident_id', req.user!.id)
      .single();

    if (reviewError || !existingReview) {
      return res.status(403).json({ error: 'Review not found or access denied' });
    }

    // Update the review
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .update({
        rating: rating ?? existingReview.rating,
        feedback: feedback !== undefined ? feedback : existingReview.feedback,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error: any) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a review (authenticated residents only, their own reviews)
reviewRoutes.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Verify the review belongs to this user
    const { data: existingReview, error: reviewError } = await supabaseAdmin
      .from('reviews')
      .select('*')
      .eq('id', id)
      .eq('resident_id', req.user!.id)
      .single();

    if (reviewError || !existingReview) {
      return res.status(403).json({ error: 'Review not found or access denied' });
    }

    // Delete the review
    const { error } = await supabaseAdmin
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Review deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all ratings (for admin or analytics)
reviewRoutes.get('/ratings', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('provider_ratings')
      .select('*');

    if (error) throw error;

    res.json(data);
  } catch (error: any) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ error: error.message });
  }
});
