import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import { supabase } from '../lib/supabase';

export const Dashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    totalServices: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [profile]);

  const fetchStats = async () => {
    if (!profile) return;

    try {
      if (profile.user_type === 'provider') {
        // Get provider stats
        const { data: provider } = await supabase
          .from('service_providers')
          .select('id')
          .eq('user_id', profile.id)
          .single();

        if (provider) {
          const [{ count: totalBookings }, { count: pendingBookings }, { count: totalServices }] =
            await Promise.all([
              supabase
                .from('bookings')
                .select('*', { count: 'exact', head: true })
                .eq('provider_id', provider.id),
              supabase
                .from('bookings')
                .select('*', { count: 'exact', head: true })
                .eq('provider_id', provider.id)
                .eq('status', 'pending'),
              supabase
                .from('services')
                .select('*', { count: 'exact', head: true })
                .eq('provider_id', provider.id),
            ]);

          setStats({
            totalBookings: totalBookings || 0,
            pendingBookings: pendingBookings || 0,
            totalServices: totalServices || 0,
          });
        }
      } else {
        // Get resident stats
        const [{ count: totalBookings }, { count: pendingBookings }] = await Promise.all([
          supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('resident_id', profile.id),
          supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('resident_id', profile.id)
            .eq('status', 'pending'),
        ]);

        setStats({
          totalBookings: totalBookings || 0,
          pendingBookings: pendingBookings || 0,
          totalServices: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">
          Welcome back, {profile?.full_name || 'User'}!
        </h1>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-gray-600 mb-2">Total Bookings</div>
            <div className="text-3xl font-bold text-primary-600">{stats.totalBookings}</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-gray-600 mb-2">Pending Bookings</div>
            <div className="text-3xl font-bold text-yellow-600">{stats.pendingBookings}</div>
          </div>

          {profile?.user_type === 'provider' && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-gray-600 mb-2">My Services</div>
              <div className="text-3xl font-bold text-green-600">{stats.totalServices}</div>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {profile?.user_type === 'resident' ? (
                <>
                  <Link
                    to="/services"
                    className="block w-full bg-primary-600 text-white text-center py-2 rounded-md hover:bg-primary-700"
                  >
                    Browse Services
                  </Link>
                  <Link
                    to="/bookings"
                    className="block w-full bg-gray-200 text-gray-700 text-center py-2 rounded-md hover:bg-gray-300"
                  >
                    View My Bookings
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/provider/profile"
                    className="block w-full bg-primary-600 text-white text-center py-2 rounded-md hover:bg-primary-700"
                  >
                    Manage Profile & Services
                  </Link>
                  <Link
                    to="/bookings"
                    className="block w-full bg-gray-200 text-gray-700 text-center py-2 rounded-md hover:bg-gray-300"
                  >
                    View Booking Requests
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Account Info</h2>
            <div className="space-y-2 text-gray-700">
              <div>
                <span className="font-medium">Name:</span> {profile?.full_name || 'Not set'}
              </div>
              <div>
                <span className="font-medium">Email:</span> {profile?.email}
              </div>
              <div>
                <span className="font-medium">Account Type:</span>{' '}
                <span className="capitalize">{profile?.user_type}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
