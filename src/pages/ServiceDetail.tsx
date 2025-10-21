import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ServiceDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  price_type: string;
  provider_id: string;
  service_providers: {
    id: string;
    bio: string;
    profile_image_url: string;
    profiles: {
      full_name: string;
      email: string;
    };
  };
}

interface Review {
  id: string;
  rating: number;
  feedback: string;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

interface ProviderRating {
  average_rating: number;
  review_count: number;
}

export const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingDate, setBookingDate] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<ProviderRating | null>(null);

  useEffect(() => {
    fetchService();
  }, [id]);

  const fetchService = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          service_providers!inner (
            id,
            bio,
            profile_image_url,
            profiles!inner (
              full_name,
              email
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      setService(data);

      // Fetch reviews for this provider
      if (data) {
        const { data: reviewsData } = await supabase
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
          .eq('provider_id', data.service_providers.id)
          .order('created_at', { ascending: false });

        if (reviewsData) {
          setReviews(reviewsData as any);
        }

        // Fetch average rating
        const { data: ratingData } = await supabase
          .from('provider_ratings')
          .select('*')
          .eq('provider_id', data.service_providers.id)
          .single();

        if (ratingData) {
          setRating(ratingData);
        }
      }
    } catch (error) {
      console.error('Error fetching service:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setBookingLoading(true);

    try {
      if (!service) return;

      const { error } = await supabase.from('bookings').insert({
        service_id: service.id,
        resident_id: profile!.id,
        provider_id: service.service_providers.id,
        booking_date: bookingDate,
        notes,
        status: 'pending',
      });

      if (error) throw error;

      setSuccess('Booking request sent successfully!');
      setBookingDate('');
      setNotes('');

      setTimeout(() => {
        navigate('/bookings');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
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

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">Service not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/services')}
          className="mb-6 text-primary-600 hover:text-primary-700"
        >
          ← Back to Services
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-64 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            {service.service_providers.profile_image_url ? (
              <img
                src={service.service_providers.profile_image_url}
                alt={service.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-8xl">🧑‍💼</div>
            )}
          </div>

          <div className="p-8">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold">{service.title}</h1>
              <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded">
                {service.category}
              </span>
            </div>

            <div className="text-2xl font-bold text-primary-600 mb-6">
              ${service.price}
              <span className="text-lg font-normal text-gray-600">
                /{service.price_type === 'hourly' ? 'hour' : 'job'}
              </span>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-700">
                {service.description || 'No description provided.'}
              </p>
            </div>

            <div className="mb-6 border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">About the Provider</h2>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {service.service_providers.profile_image_url ? (
                    <img
                      src={service.service_providers.profile_image_url}
                      alt={service.service_providers.profiles.full_name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-primary-200 rounded-full flex items-center justify-center text-2xl">
                      👤
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">
                      {service.service_providers.profiles.full_name}
                    </h3>
                    {rating && (
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-yellow-400">⭐</span>
                        <span className="font-semibold">{rating.average_rating}</span>
                        <span className="text-gray-500">
                          ({rating.review_count} {rating.review_count === 1 ? 'review' : 'reviews'})
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 mt-1">
                    {service.service_providers.bio || 'No bio available.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            {reviews.length > 0 && (
              <div className="mb-6 border-t pt-6">
                <h2 className="text-xl font-semibold mb-4">Reviews</h2>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}
                            >
                              ⭐
                            </span>
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-gray-700">
                          {review.profiles.full_name}
                        </span>
                        <span className="text-sm text-gray-500">
                          • {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {review.feedback && (
                        <p className="text-gray-700">{review.feedback}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profile?.user_type === 'resident' && (
              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-4">Book This Service</h2>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                    {success}
                  </div>
                )}

                <form onSubmit={handleBooking} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Any specific requirements or details..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="w-full bg-primary-600 text-white py-3 rounded-md hover:bg-primary-700 disabled:opacity-50"
                  >
                    {bookingLoading ? 'Sending Request...' : 'Send Booking Request'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
