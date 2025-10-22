import { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { supabase } from '../lib/supabase';

interface PendingProvider {
  id: string;
  bio: string;
  profile_image_url: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
  services: Array<{
    id: string;
    title: string;
    category: string;
  }>;
}

export const AdminDashboard = () => {
  const [pendingProviders, setPendingProviders] = useState<PendingProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingProviders();
  }, []);

  const fetchPendingProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('service_providers')
        .select(`
          *,
          profiles!service_providers_user_id_fkey (
            full_name,
            email
          ),
          services (
            id,
            title,
            category
          )
        `)
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPendingProviders(data || []);
    } catch (error) {
      console.error('Error fetching pending providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (providerId: string, approve: boolean) => {
    setUpdating(providerId);

    try {
      const { error } = await supabase
        .from('service_providers')
        .update({ approval_status: approve ? 'approved' : 'rejected' })
        .eq('id', providerId);

      if (error) throw error;

      await fetchPendingProviders();
    } catch (error) {
      console.error('Error updating provider approval:', error);
      alert('Failed to update provider approval');
    } finally {
      setUpdating(null);
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Pending Provider Approvals ({pendingProviders.length})
          </h2>

          {pendingProviders.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No pending provider approvals
            </p>
          ) : (
            <div className="space-y-6">
              {pendingProviders.map((provider) => (
                <div key={provider.id} className="border rounded-lg p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0">
                      {provider.profile_image_url ? (
                        <img
                          src={provider.profile_image_url}
                          alt={provider.profiles.full_name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-primary-200 rounded-full flex items-center justify-center text-2xl">
                          👤
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">
                        {provider.profiles.full_name}
                      </h3>
                      <p className="text-gray-600">{provider.profiles.email}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Applied: {new Date(provider.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {provider.bio && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-1">Bio:</h4>
                      <p className="text-gray-700">{provider.bio}</p>
                    </div>
                  )}

                  {provider.services && provider.services.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">
                        Services ({provider.services.length}):
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {provider.services.map((service) => (
                          <span
                            key={service.id}
                            className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm"
                          >
                            {service.title} ({service.category})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2 border-t pt-4">
                    <button
                      onClick={() => handleApproval(provider.id, true)}
                      disabled={updating === provider.id}
                      className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {updating === provider.id ? 'Approving...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleApproval(provider.id, false)}
                      disabled={updating === provider.id}
                      className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      {updating === provider.id ? 'Rejecting...' : 'Reject'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Admin Access Note:</h3>
          <p className="text-yellow-700 text-sm">
            To set admin users, add their email addresses to the ADMIN_EMAILS environment variable
            in your backend .env file (comma-separated).
          </p>
        </div>
      </div>
    </div>
  );
};
