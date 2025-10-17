import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

const CATEGORIES = [
  'All',
  'Lawn Care',
  'Window Washing',
  'Snow Shoveling',
  'Pet Sitting',
  'Tutoring',
  'Car Washing',
  'Other',
];

export const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

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
            is_approved,
            profiles!inner (
              full_name
            )
          )
        `)
        .eq('is_active', true)
        .eq('service_providers.is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setServices(data || []);
      setFilteredServices(data || []);
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
              className={`px-4 py-2 rounded-full ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
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
                    <span className="bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded">
                      {service.category}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {service.description || 'No description available'}
                  </p>

                  <div className="flex justify-between items-center">
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
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
