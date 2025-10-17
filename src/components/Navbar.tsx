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
    <nav className="glass border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2 group">
            <div className="text-3xl group-hover:animate-float">🏘️</div>
            <span className="text-2xl font-display font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              NeighborHood
            </span>
          </Link>

          <div className="flex items-center gap-6">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="hidden sm:inline-block text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/services"
                  className="hidden sm:inline-block text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Services
                </Link>
                <Link
                  to="/bookings"
                  className="hidden sm:inline-block text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Bookings
                </Link>
                {profile?.user_type === 'provider' && (
                  <Link
                    to="/provider/profile"
                    className="hidden sm:inline-block text-gray-700 hover:text-primary-600 font-medium transition-colors"
                  >
                    Profile
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="glass-card px-5 py-2 rounded-xl font-semibold text-gray-700 hover:scale-105 transition-transform"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 font-semibold transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary"
                >
                  Get Started ✨
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
