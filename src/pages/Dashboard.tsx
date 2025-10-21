import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import { supabase } from '../lib/supabase';

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  price_type: string;
  service_providers: {
    profile_image_url: string;
    profiles: {
      full_name: string;
    };
  };
}

export const Dashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    totalServices: 0,
  });
  const [latestServices, setLatestServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchLatestServices();
  }, [profile]);

  const fetchLatestServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          service_providers!inner (
            profile_image_url,
            is_approved,
            profiles!inner (
              full_name
            )
          )
        `)
        .eq('is_active', true)
        .eq('service_providers.is_approved', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      setLatestServices(data || []);
    } catch (error) {
      console.error('Error fetching latest services:', error);
    }
  };

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
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-gray-800 mb-2">
            Welcome back, {profile?.full_name || 'User'}!
          </h1>
          <p className="text-gray-600 text-lg">
            {profile?.user_type === 'provider'
              ? "Manage your services and bookings"
              : "Find trusted local service providers"}
          </p>
        </div>

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

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-xl font-display font-semibold mb-4 text-gray-800">
              Quick Actions
            </h2>
            <div className="space-y-3">
              {profile?.user_type === 'resident' ? (
                <>
                  <Link
                    to="/services"
                    className="btn-primary block text-center"
                  >
                    Browse Services
                  </Link>
                  <Link
                    to="/bookings"
                    className="block w-full bg-white border border-gray-200 text-gray-700 text-center py-3 rounded-lg hover:shadow-md transition-all font-semibold"
                  >
                    View My Bookings
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/provider/profile"
                    className="btn-primary block text-center"
                  >
                    Manage Profile & Services
                  </Link>
                  <Link
                    to="/bookings"
                    className="block w-full bg-white border border-gray-200 text-gray-700 text-center py-3 rounded-lg hover:shadow-md transition-all font-semibold"
                  >
                    View Booking Requests
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-xl font-display font-semibold mb-4 text-gray-800">
              Account Info
            </h2>
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

        {/* Latest Services Section */}
        <div className="glass-card p-6 rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-display font-bold text-gray-800">
              Latest Services
            </h2>
            <Link
              to="/services"
              className="text-primary-600 hover:text-primary-700 font-semibold text-sm hover:underline"
            >
              View All →
            </Link>
          </div>

          {latestServices.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <p>No services available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {latestServices.map((service) => (
                <Link
                  key={service.id}
                  to={`/services/${service.id}`}
                  className="bg-white border border-gray-200 p-5 rounded-lg hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3 mb-3">
                    {service.service_providers.profile_image_url ? (
                      <img
                        src={service.service_providers.profile_image_url}
                        alt={service.title}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full flex items-center justify-center text-white font-semibold">
                        {service.service_providers.profiles.full_name?.charAt(0) || '?'}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 line-clamp-1">
                        {service.title}
                      </h3>
                      <p className="text-xs text-gray-500">
                        by {service.service_providers.profiles.full_name || 'Unknown Provider'}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {service.description || 'No description available'}
                  </p>

                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium px-3 py-1 bg-primary-50 text-primary-700 rounded-full border border-primary-200">
                      {service.category}
                    </span>
                    <div className="text-lg font-bold text-primary-600">
                      ${service.price}
                      <span className="text-xs font-normal text-gray-600">
                        /{service.price_type === 'hourly' ? 'hr' : 'job'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
