import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

export const Landing = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute -bottom-20 left-1/2 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      <Navbar />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-fade-in">
          <div className="inline-block mb-6 px-5 py-2 bg-primary-50 border border-primary-200 rounded-full text-sm font-semibold text-primary-700">
            Trusted Local Services
          </div>
          <h1 className="text-5xl sm:text-7xl font-display font-bold mb-6 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent leading-tight">
            Connect with Talented<br />Local Service Providers
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Support young entrepreneurs in your community while getting quality services at competitive rates.
            <span className="text-primary-600"> Everyone wins.</span>
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Link to="/signup" className="btn-primary text-lg">
              Get Started
            </Link>
            <Link to="/login" className="glass-card px-8 py-3 rounded-lg text-lg font-semibold text-gray-700 hover:shadow-lg transition-all">
              Sign In
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-500 border-2 border-white"></div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-400 to-accent-500 border-2 border-white"></div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-teal-500 border-2 border-white"></div>
            </div>
            <span className="font-medium">Join 100+ community members already connected</span>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-20 animate-slide-up">
          <div className="glass-card p-8 rounded-xl hover:shadow-lg transition-all">
            <div className="text-5xl mb-4">💼</div>
            <h3 className="text-2xl font-display font-bold mb-3 text-primary-600">
              For Service Providers
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Build your business, set competitive rates, and earn income doing what you're good at. Professional growth starts here.
            </p>
          </div>

          <div className="glass-card p-8 rounded-xl hover:shadow-lg transition-all">
            <div className="text-5xl mb-4">🏡</div>
            <h3 className="text-2xl font-display font-bold mb-3 text-accent-600">
              For Residents
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Access reliable local services from vetted providers. Support your community while getting quality work done efficiently.
            </p>
          </div>

          <div className="glass-card p-8 rounded-xl hover:shadow-lg transition-all">
            <div className="text-5xl mb-4">🤝</div>
            <h3 className="text-2xl font-display font-bold mb-3 text-green-600">
              Community First
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Strengthen local connections while investing in the next generation of entrepreneurs. Build a better neighborhood together.
            </p>
          </div>
        </div>

        {/* Services Showcase */}
        <div className="glass-card p-10 rounded-xl mb-20 animate-slide-up">
          <h3 className="text-3xl font-display font-bold mb-6 text-center text-gray-800">
            Available Services
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { name: 'Lawn Care', emoji: '🌱' },
              { name: 'Window Washing', emoji: '✨' },
              { name: 'Snow Removal', emoji: '❄️' },
              { name: 'Pet Sitting', emoji: '🐕' },
              { name: 'Tutoring', emoji: '📚' },
              { name: 'Car Detailing', emoji: '🚗' },
              { name: 'Photography', emoji: '📸' },
              { name: 'Tech Support', emoji: '💻' },
            ].map((service) => (
              <div
                key={service.name}
                className="bg-white border border-gray-200 px-6 py-3 rounded-lg font-medium text-gray-700 hover:border-primary-300 hover:shadow-sm transition-all"
              >
                <span className="mr-2">{service.emoji}</span>
                {service.name}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center glass-card p-12 rounded-xl animate-fade-in">
          <h2 className="text-4xl font-display font-bold mb-4 text-gray-800">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join our community and connect with local service providers today
          </p>
          <Link to="/signup" className="btn-primary text-xl inline-block">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};
