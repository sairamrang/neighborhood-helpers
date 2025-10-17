import { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Booking {
  id: string;
  booking_date: string;
  notes: string;
  status: string;
  created_at: string;
  services: {
    title: string;
    price: number;
    price_type: string;
  };
  profiles: {
    full_name: string;
    email: string;
  };
  service_providers?: {
    profiles: {
      full_name: string;
      email: string;
    };
  };
}

export const Bookings = () => {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, [profile]);

  const fetchBookings = async () => {
    try {
      if (!profile) return;

      let query = supabase.from('bookings').select(`
        *,
        services!inner (
          title,
          price,
          price_type
        ),
        profiles!bookings_resident_id_fkey (
          full_name,
          email
        ),
        service_providers!inner (
          profiles!service_providers_user_id_fkey (
            full_name,
            email
          )
        )
      `);

      if (profile.user_type === 'resident') {
        query = query.eq('resident_id', profile.id);
      } else {
        const { data: provider } = await supabase
          .from('service_providers')
          .select('id')
          .eq('user_id', profile.id)
          .single();

        if (provider) {
          query = query.eq('provider_id', provider.id);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    setUpdating(bookingId);

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      await fetchBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Failed to update booking status');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-xl">Loading bookings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">
          {profile?.user_type === 'resident' ? 'My Bookings' : 'Booking Requests'}
        </h1>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-xl text-gray-600">
              {profile?.user_type === 'resident'
                ? 'You haven\'t made any bookings yet.'
                : 'You haven\'t received any booking requests yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{booking.services.title}</h3>
                    <p className="text-gray-600">
                      {profile?.user_type === 'resident' ? (
                        <>Provider: {booking.service_providers?.profiles.full_name}</>
                      ) : (
                        <>Resident: {booking.profiles.full_name}</>
                      )}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-gray-600">Date & Time:</span>
                    <p className="font-medium">
                      {new Date(booking.booking_date).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Price:</span>
                    <p className="font-medium">
                      ${booking.services.price}/{booking.services.price_type === 'hourly' ? 'hour' : 'job'}
                    </p>
                  </div>
                </div>

                {booking.notes && (
                  <div className="mb-4">
                    <span className="text-gray-600">Notes:</span>
                    <p className="mt-1">{booking.notes}</p>
                  </div>
                )}

                <div className="flex space-x-2 border-t pt-4">
                  {profile?.user_type === 'provider' && booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(booking.id, 'accepted')}
                        disabled={updating === booking.id}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                      >
                        {updating === booking.id ? 'Updating...' : 'Accept'}
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(booking.id, 'declined')}
                        disabled={updating === booking.id}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                      >
                        {updating === booking.id ? 'Updating...' : 'Decline'}
                      </button>
                    </>
                  )}

                  {profile?.user_type === 'provider' && booking.status === 'accepted' && (
                    <button
                      onClick={() => handleStatusUpdate(booking.id, 'completed')}
                      disabled={updating === booking.id}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {updating === booking.id ? 'Updating...' : 'Mark as Completed'}
                    </button>
                  )}

                  {profile?.user_type === 'resident' && booking.status === 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                      disabled={updating === booking.id}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50"
                    >
                      {updating === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                    </button>
                  )}

                  {booking.status !== 'pending' && (
                    <div className="text-gray-600 italic">
                      No actions available for {booking.status} bookings
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
