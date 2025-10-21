import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { supabase } from '../lib/supabase';
import { SERVICE_CATEGORIES, CATEGORY_ICONS, CATEGORY_DESCRIPTIONS } from '../constants/services';

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

export const Landing = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState<Map<string, ProviderRating>>(new Map());

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    let filtered = selectedCategory === 'All'
      ? services
      : services.filter((s) => s.category === selectedCategory);

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          const ratingA = ratings.get(a.provider_id)?.average_rating || 0;
          const ratingB = ratings.get(b.provider_id)?.average_rating || 0;
          return ratingB - ratingA;
        case 'newest':
        default:
          return 0; // Already sorted by created_at
      }
    });

    setFilteredServices(filtered);
  }, [selectedCategory, sortBy, services, ratings]);

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

      // Fetch ratings
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

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute -bottom-20 left-1/2 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      <Navbar />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-block mb-4 px-5 py-2 bg-primary-50 border border-primary-200 rounded-full text-sm font-semibold text-primary-700">
            🏘️ Your Trusted Neighborhood Marketplace
          </div>
          <h1 className="text-5xl sm:text-6xl font-display font-bold mb-6 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent leading-tight">
            Local Help from<br />Your Neighbors
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Connect with talented young entrepreneurs in your community.
            <span className="block mt-2 text-primary-600 font-semibold">
              Trusted, local, reliable services — all in one place.
            </span>
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <Link to="/signup" className="btn-primary text-lg">
              📝 Sign Up to Book
            </Link>
            <Link to="/login" className="glass-card px-8 py-4 rounded-xl text-lg font-semibold text-gray-700 hover:shadow-lg transition-all border border-gray-200">
              Sign In
            </Link>
          </div>

          <p className="text-sm text-gray-500">
            No sign-up needed to browse • Book services when ready
          </p>
        </div>

        {/* Service Categories Highlight */}
        <div className="glass-card p-8 rounded-xl mb-12">
          <h2 className="text-2xl font-display font-bold mb-6 text-center text-gray-800">
            🎯 Services We Offer
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {SERVICE_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`p-4 rounded-xl text-center transition-all ${
                  selectedCategory === category
                    ? 'bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-glow scale-105'
                    : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-primary-300'
                }`}
              >
                <div className="text-3xl mb-2">{CATEGORY_ICONS[category]}</div>
                <div className="text-sm font-semibold">{category}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedCategory === 'All'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Services ({services.length})
            </button>
            {selectedCategory !== 'All' && (
              <div className="px-4 py-2 bg-white border border-primary-200 rounded-lg text-sm">
                <span className="font-semibold text-primary-600">{filteredServices.length}</span> {selectedCategory} services
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Services Listing */}
        {loading ? (
          <div className="text-center py-20">
            <div className="text-xl text-gray-600">Loading amazing services...</div>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="glass-card p-12 rounded-xl text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              No services found{selectedCategory !== 'All' && ` in ${selectedCategory}`}
            </h3>
            <p className="text-gray-600">
              Check back soon as our providers add new services!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {filteredServices.map((service) => (
              <Link
                key={service.id}
                to={`/services/${service.id}`}
                className="glass-card rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="h-48 bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center relative overflow-hidden">
                  {service.service_providers.profile_image_url ? (
                    <img
                      src={service.service_providers.profile_image_url}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-7xl">
                      {CATEGORY_ICONS[service.category as keyof typeof CATEGORY_ICONS] || '🧑‍💼'}
                    </div>
                  )}
                  <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700 flex items-center gap-1">
                    {CATEGORY_ICONS[service.category as keyof typeof CATEGORY_ICONS]}
                    {service.category}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
                    {service.title}
                  </h3>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-semibold text-sm">
                      {service.service_providers.profiles.full_name?.charAt(0) || '?'}
                    </div>
                    <div className="text-sm text-gray-600">
                      by {service.service_providers.profiles.full_name}
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                    {service.description || CATEGORY_DESCRIPTIONS[service.category as keyof typeof CATEGORY_DESCRIPTIONS]}
                  </p>

                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold text-primary-600">
                      ${service.price}
                      <span className="text-sm font-normal text-gray-600">
                        /{service.price_type === 'hourly' ? 'hr' : service.price_type === 'daily' ? 'day' : 'job'}
                      </span>
                    </div>
                    {ratings.get(service.provider_id) && (
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-yellow-400 text-lg">⭐</span>
                        <span className="font-semibold">
                          {ratings.get(service.provider_id)!.average_rating}
                        </span>
                        <span className="text-gray-500">
                          ({ratings.get(service.provider_id)!.review_count})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Why Choose Us Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="glass-card p-8 rounded-xl text-center">
            <div className="text-5xl mb-4">👨‍👩‍👧‍👦</div>
            <h3 className="text-xl font-display font-bold mb-3 text-primary-600">
              Trusted Community
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Every provider is vetted and approved. Support young entrepreneurs in your neighborhood.
            </p>
          </div>

          <div className="glass-card p-8 rounded-xl text-center">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="text-xl font-display font-bold mb-3 text-accent-600">
              Fair Pricing
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Competitive rates set by providers. Get quality work at prices that work for everyone.
            </p>
          </div>

          <div className="glass-card p-8 rounded-xl text-center">
            <div className="text-5xl mb-4">⭐</div>
            <h3 className="text-xl font-display font-bold mb-3 text-green-600">
              Rated & Reviewed
            </h3>
            <p className="text-gray-600 leading-relaxed">
              See real reviews from neighbors. Make informed decisions based on community feedback.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center glass-card p-12 rounded-xl bg-gradient-to-r from-primary-50 to-accent-50">
          <h2 className="text-4xl font-display font-bold mb-4 text-gray-800">
            Ready to Get Help?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join hundreds of residents who trust local young entrepreneurs for their home and tech needs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup" className="btn-primary text-xl">
              Sign Up as Resident
            </Link>
            <Link to="/signup?type=provider" className="glass-card px-8 py-4 rounded-xl text-xl font-semibold text-gray-700 hover:shadow-lg transition-all border border-gray-200">
              Become a Provider
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
