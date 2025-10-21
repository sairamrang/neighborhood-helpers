import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { AuthModal } from '../components/AuthModal';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  CATEGORY_ICONS,
  TECH_SUPPORT_TYPES,
  TUTORING_SUBJECTS,
  TUTORING_LEVELS,
  PET_TYPES
} from '../constants/services';

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
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Service state
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<ProviderRating | null>(null);

  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Booking state
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Service-specific fields
  const [windowCount, setWindowCount] = useState<number>(10);
  const [techIssue, setTechIssue] = useState('');
  const [techSubServices, setTechSubServices] = useState<string[]>([]);
  const [tutoringSubject, setTutoringSubject] = useState('');
  const [tutoringLevel, setTutoringLevel] = useState('');
  const [petType, setPetType] = useState('');
  const [petDetails, setPetDetails] = useState('');

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

      // Fetch reviews
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

        // Fetch rating
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

  const handleBookNowClick = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      setShowBookingForm(true);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setShowBookingForm(true);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setBookingLoading(true);

    try {
      if (!service || !profile) return;

      // Build booking details based on service category
      const bookingDetails: any = {};

      if (service.category === 'Window Washing') {
        bookingDetails.windowCount = windowCount;
        bookingDetails.estimatedCost = service.price * windowCount;
      } else if (service.category === 'Tech Support') {
        bookingDetails.issue = techIssue;
        bookingDetails.subServices = techSubServices;
      } else if (service.category === 'Tutoring') {
        bookingDetails.subject = tutoringSubject;
        bookingDetails.level = tutoringLevel;
      } else if (service.category === 'Pet Sitting' || service.category === 'Pet Walking') {
        bookingDetails.petType = petType;
        bookingDetails.petDetails = petDetails;
      } else if (service.category === 'Lawn Care') {
        bookingDetails.description = notes;
      }

      const { error: bookingError } = await supabase.from('bookings').insert({
        service_id: service.id,
        resident_id: profile.id,
        provider_id: service.service_providers.id,
        booking_date: bookingDate,
        notes,
        booking_details: bookingDetails,
        status: 'pending',
      });

      if (bookingError) throw bookingError;

      setSuccess('Booking request sent successfully! The provider will review and respond soon.');
      setShowBookingForm(false);

      setTimeout(() => {
        navigate('/bookings');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const renderServiceSpecificFields = () => {
    if (!service) return null;

    switch (service.category) {
      case 'Window Washing':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Windows
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={windowCount}
                onChange={(e) => setWindowCount(parseInt(e.target.value) || 1)}
                min="1"
                max="100"
                required
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
              <div className="text-sm text-gray-600">
                Estimated: <span className="font-bold text-primary-600">${(service.price * windowCount).toFixed(2)}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              ${service.price} per window
            </p>
          </div>
        );

      case 'Tech Support':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe Your Tech Issue
              </label>
              <textarea
                value={techIssue}
                onChange={(e) => setTechIssue(e.target.value)}
                rows={3}
                required
                placeholder="e.g., My laptop won't turn on, need help setting up WiFi..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type of Help Needed (select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TECH_SUPPORT_TYPES.map((type) => (
                  <label key={type} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={techSubServices.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTechSubServices([...techSubServices, type]);
                        } else {
                          setTechSubServices(techSubServices.filter(t => t !== type));
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        );

      case 'Tutoring':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <select
                value={tutoringSubject}
                onChange={(e) => setTutoringSubject(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select subject...</option>
                {TUTORING_SUBJECTS.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level
              </label>
              <select
                value={tutoringLevel}
                onChange={(e) => setTutoringLevel(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select level...</option>
                {TUTORING_LEVELS.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </>
        );

      case 'Pet Sitting':
      case 'Pet Walking':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type of Pet
              </label>
              <select
                value={petType}
                onChange={(e) => setPetType(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select pet type...</option>
                {PET_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pet Details (name, age, special needs, etc.)
              </label>
              <textarea
                value={petDetails}
                onChange={(e) => setPetDetails(e.target.value)}
                rows={3}
                required
                placeholder="e.g., Golden Retriever named Max, 5 years old, very friendly..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </>
        );

      case 'Lawn Care':
        return (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 mb-2">
              <strong>Note:</strong> Lawn care services are quoted based on your yard's specific needs. Describe your requirements below, and the provider will give you a custom quote.
            </p>
          </div>
        );

      default:
        return null;
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
          onClick={() => navigate(-1)}
          className="mb-6 text-primary-600 hover:text-primary-700 flex items-center gap-2 font-semibold"
        >
          ← Back
        </button>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-64 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center relative">
            {service.service_providers.profile_image_url ? (
              <img
                src={service.service_providers.profile_image_url}
                alt={service.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-8xl">
                {CATEGORY_ICONS[service.category as keyof typeof CATEGORY_ICONS] || '🧑‍💼'}
              </div>
            )}
            <div className="absolute top-4 right-4 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold flex items-center gap-2">
              {CATEGORY_ICONS[service.category as keyof typeof CATEGORY_ICONS]}
              {service.category}
            </div>
          </div>

          <div className="p-8">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold">{service.title}</h1>
            </div>

            <div className="text-2xl font-bold text-primary-600 mb-6">
              ${service.price}
              <span className="text-lg font-normal text-gray-600">
                /{service.price_type === 'hourly' ? 'hour' : service.price_type === 'daily' ? 'day' : service.price_type === 'per_unit' ? 'window' : 'job'}
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

            {/* Book Now Button or Booking Form */}
            {!showBookingForm ? (
              <div className="border-t pt-6">
                <button
                  onClick={handleBookNowClick}
                  className="w-full btn-primary text-xl py-4"
                >
                  📅 Book This Service
                </button>
                {!user && (
                  <p className="text-sm text-center text-gray-500 mt-2">
                    You'll need to sign up or sign in to book this service
                  </p>
                )}
              </div>
            ) : (
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
                  {renderServiceSpecificFields()}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      required
                      min={new Date().toISOString().slice(0, 16)}
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

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowBookingForm(false)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-md hover:bg-gray-300 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="flex-1 bg-primary-600 text-white py-3 rounded-md hover:bg-primary-700 disabled:opacity-50 font-semibold"
                    >
                      {bookingLoading ? 'Sending Request...' : 'Send Booking Request'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        mode="signup"
        userType="resident"
      />
    </div>
  );
};
