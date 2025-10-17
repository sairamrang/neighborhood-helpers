import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabase.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

export const adminRoutes = Router();

// Middleware to check if user is admin
const isAdmin = async (req: AuthRequest, res: any, next: any) => {
  try {
    // In a real app, you'd check if the user has an admin role
    // For now, we'll use a simple env variable check
    // You should implement proper admin role checking in production
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('id', req.user!.id)
      .single();

    // Add admin emails to environment variable: ADMIN_EMAILS=admin1@example.com,admin2@example.com
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];

    if (!profile || !adminEmails.includes(profile.email)) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Failed to verify admin status' });
  }
};

// Get all pending provider approvals
adminRoutes.get('/pending-providers', authenticate, isAdmin, async (req, res) => {
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
          category
        )
      `)
      .eq('is_approved', false)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching pending providers:', error);
    res.status(500).json({ error: 'Failed to fetch pending providers' });
  }
});

// Approve or reject a provider
adminRoutes.patch('/providers/:id/approval', authenticate, isAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { is_approved } = req.body;

    const { data, error } = await supabaseAdmin
      .from('service_providers')
      .update({ is_approved })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error updating provider approval:', error);
    res.status(500).json({ error: 'Failed to update provider approval' });
  }
});

// Get all providers (approved and pending)
adminRoutes.get('/providers', authenticate, isAdmin, async (req, res) => {
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
          is_active
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching all providers:', error);
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
});

// Get platform statistics
adminRoutes.get('/stats', authenticate, isAdmin, async (req, res) => {
  try {
    const [
      { count: totalProviders },
      { count: pendingProviders },
      { count: totalServices },
      { count: totalBookings },
      { count: pendingBookings },
    ] = await Promise.all([
      supabaseAdmin.from('service_providers').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('service_providers').select('*', { count: 'exact', head: true }).eq('is_approved', false),
      supabaseAdmin.from('services').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('bookings').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    ]);

    res.json({
      totalProviders,
      pendingProviders,
      totalServices,
      totalBookings,
      pendingBookings,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});
