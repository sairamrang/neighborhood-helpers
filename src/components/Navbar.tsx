import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2">
            <div className="text-2xl">🏘️</div>
            <span className="text-xl font-display font-bold text-gray-800">
              NeighborHood Helpers
            </span>
          </Link>

          <div className="flex items-center gap-6">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="hidden sm:inline-block text-gray-600 hover:text-primary-600 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/services"
                  className="hidden sm:inline-block text-gray-600 hover:text-primary-600 font-medium transition-colors"
                >
                  Services
                </Link>
                <Link
                  to="/bookings"
                  className="hidden sm:inline-block text-gray-600 hover:text-primary-600 font-medium transition-colors"
                >
                  Bookings
                </Link>
                {profile?.user_type === 'provider' && (
                  <Link
                    to="/provider/profile"
                    className="hidden sm:inline-block text-gray-600 hover:text-primary-600 font-medium transition-colors"
                  >
                    Profile
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="bg-white border border-gray-300 px-4 py-2 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
