import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { supabase } from '../lib/supabase';
import { SERVICE_CATEGORIES, CATEGORY_ICONS } from '../constants/services';

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  price_type: string;
  provider_id: string;
  service_providers: {
    profile_image_url: string;
    profiles: {
      full_name: string;
    };
  };
}

interface ProviderRating {
  provider_id: string;
  average_rating: number;
  review_count: number;
}

const CATEGORIES = ['All', ...SERVICE_CATEGORIES];

export const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState<Map<string, ProviderRating>>(new Map());

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredServices(services);
    } else {
      setFilteredServices(services.filter((s) => s.category === selectedCategory));
    }
  }, [selectedCategory, services]);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          service_providers!inner (
            profile_image_url,
            approval_status,
            profiles!service_providers_user_id_fkey (
              full_name
            )
          )
        `)
        .eq('is_active', true)
        .eq('service_providers.approval_status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setServices(data || []);
      setFilteredServices(data || []);

      // Fetch ratings for all providers
      const { data: ratingsData } = await supabase
        .from('provider_ratings')
        .select('*');

      if (ratingsData) {
        const ratingsMap = new Map<string, ProviderRating>();
        ratingsData.forEach((rating: ProviderRating) => {
          ratingsMap.set(rating.provider_id, rating);
        });
        setRatings(ratingsMap);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-xl">Loading services...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Browse Services</h1>

        <div className="mb-6 flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-glow'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {category !== 'All' && (
                <span className="text-lg">{CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]}</span>
              )}
              {category}
            </button>
          ))}
        </div>

        {filteredServices.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-xl text-gray-600">
              No services found in this category.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <Link
                key={service.id}
                to={`/services/${service.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                  {service.service_providers.profile_image_url ? (
                    <img
                      src={service.service_providers.profile_image_url}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-6xl">🧑‍💼</div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold">{service.title}</h3>
                    <span className="bg-primary-100 text-primary-700 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                      <span>{CATEGORY_ICONS[service.category as keyof typeof CATEGORY_ICONS]}</span>
                      <span>{service.category}</span>
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {service.description || 'No description available'}
                  </p>

                  <div className="flex justify-between items-center mb-3">
                    <div className="text-sm text-gray-600">
                      by {service.service_providers.profiles.full_name}
                    </div>
                    <div className="text-lg font-bold text-primary-600">
                      ${service.price}
                      <span className="text-sm font-normal">
                        /{service.price_type === 'hourly' ? 'hr' : 'job'}
                      </span>
                    </div>
                  </div>

                  {ratings.get(service.provider_id) && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">⭐</span>
                        <span className="font-semibold">
                          {ratings.get(service.provider_id)!.average_rating}
                        </span>
                      </div>
                      <span className="text-gray-500">
                        ({ratings.get(service.provider_id)!.review_count} {ratings.get(service.provider_id)!.review_count === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
