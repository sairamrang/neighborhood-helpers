import { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface ProviderProfile {
  id: string;
  bio: string;
  profile_image_url: string;
  is_approved: boolean;
}

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  price_type: string;
  is_active: boolean;
}

const CATEGORIES = [
  'Lawn Care',
  'Window Washing',
  'Snow Shoveling',
  'Pet Sitting',
  'Tutoring',
  'Car Washing',
  'Other',
];

export const ProviderProfile = () => {
  const { profile: userProfile } = useAuth();
  const [providerProfile, setProviderProfile] = useState<ProviderProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile form
  const [bio, setBio] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  // Service form
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceTitle, setServiceTitle] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [serviceCategory, setServiceCategory] = useState(CATEGORIES[0]);
  const [servicePrice, setServicePrice] = useState('');
  const [servicePriceType, setServicePriceType] = useState<'fixed' | 'hourly'>('fixed');
  const [serviceSaving, setServiceSaving] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProviderData();
  }, []);

  const fetchProviderData = async () => {
    try {
      if (!userProfile) return;

      const { data: provider, error: providerError } = await supabase
        .from('service_providers')
        .select('*')
        .eq('user_id', userProfile.id)
        .single();

      if (providerError && providerError.code !== 'PGRST116') throw providerError;

      if (provider) {
        setProviderProfile(provider);
        setBio(provider.bio || '');
        setProfileImageUrl(provider.profile_image_url || '');

        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('provider_id', provider.id)
          .order('created_at', { ascending: false });

        if (servicesError) throw servicesError;

        setServices(servicesData || []);
      }
    } catch (err) {
      console.error('Error fetching provider data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setProfileSaving(true);

    try {
      if (!userProfile) return;

      if (providerProfile) {
        const { error } = await supabase
          .from('service_providers')
          .update({ bio, profile_image_url: profileImageUrl })
          .eq('id', providerProfile.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('service_providers')
          .insert({
            user_id: userProfile.id,
            bio,
            profile_image_url: profileImageUrl,
          });

        if (error) throw error;
      }

      setMessage('Profile saved successfully!');
      await fetchProviderData();
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setServiceSaving(true);

    try {
      if (!providerProfile) {
        setError('Please create your provider profile first');
        return;
      }

      const serviceData = {
        title: serviceTitle,
        description: serviceDescription,
        category: serviceCategory,
        price: parseFloat(servicePrice),
        price_type: servicePriceType,
      };

      if (editingService) {
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id);

        if (error) throw error;
        setMessage('Service updated successfully!');
      } else {
        const { error } = await supabase
          .from('services')
          .insert({
            ...serviceData,
            provider_id: providerProfile.id,
          });

        if (error) throw error;
        setMessage('Service created successfully!');
      }

      resetServiceForm();
      await fetchProviderData();
    } catch (err: any) {
      setError(err.message || 'Failed to save service');
    } finally {
      setServiceSaving(false);
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setServiceTitle(service.title);
    setServiceDescription(service.description);
    setServiceCategory(service.category);
    setServicePrice(service.price.toString());
    setServicePriceType(service.price_type as 'fixed' | 'hourly');
    setShowServiceForm(true);
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const { error } = await supabase.from('services').delete().eq('id', id);

      if (error) throw error;

      setMessage('Service deleted successfully!');
      await fetchProviderData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete service');
    }
  };

  const resetServiceForm = () => {
    setEditingService(null);
    setServiceTitle('');
    setServiceDescription('');
    setServiceCategory(CATEGORIES[0]);
    setServicePrice('');
    setServicePriceType('fixed');
    setShowServiceForm(false);
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Provider Profile</h1>

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {providerProfile && !providerProfile.is_approved && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-6">
            Your profile is pending approval. You won't be visible to residents until an admin approves your account.
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Tell residents about yourself..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Image URL
              </label>
              <input
                type="url"
                value={profileImageUrl}
                onChange={(e) => setProfileImageUrl(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="https://example.com/your-photo.jpg"
              />
            </div>

            <button
              type="submit"
              disabled={profileSaving}
              className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {profileSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">My Services</h2>
            <button
              onClick={() => setShowServiceForm(!showServiceForm)}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
            >
              {showServiceForm ? 'Cancel' : '+ Add Service'}
            </button>
          </div>

          {showServiceForm && (
            <form onSubmit={handleSaveService} className="mb-6 border-t pt-4 space-y-4">
              <h3 className="font-semibold">
                {editingService ? 'Edit Service' : 'New Service'}
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Title
                </label>
                <input
                  type="text"
                  value={serviceTitle}
                  onChange={(e) => setServiceTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Lawn Mowing"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Describe your service..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={serviceCategory}
                  onChange={(e) => setServiceCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={servicePrice}
                    onChange={(e) => setServicePrice(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="25.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Type
                  </label>
                  <select
                    value={servicePriceType}
                    onChange={(e) => setServicePriceType(e.target.value as 'fixed' | 'hourly')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="fixed">Fixed Price</option>
                    <option value="hourly">Per Hour</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={serviceSaving}
                  className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {serviceSaving ? 'Saving...' : editingService ? 'Update Service' : 'Create Service'}
                </button>
                <button
                  type="button"
                  onClick={resetServiceForm}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {services.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No services yet. Click "Add Service" to create your first one!
            </p>
          ) : (
            <div className="space-y-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="border rounded-lg p-4 flex justify-between items-start"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-lg">{service.title}</h3>
                      <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                        {service.category}
                      </span>
                      {!service.is_active && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2">{service.description}</p>
                    <div className="text-primary-600 font-semibold">
                      ${service.price}/{service.price_type === 'hourly' ? 'hour' : 'job'}
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEditService(service)}
                      className="text-primary-600 hover:text-primary-700 px-3 py-1 border border-primary-600 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      className="text-red-600 hover:text-red-700 px-3 py-1 border border-red-600 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
