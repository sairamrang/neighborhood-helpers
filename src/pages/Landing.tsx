import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

export const Landing = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-accent-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute -bottom-20 left-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      <Navbar />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-fade-in">
          <div className="inline-block mb-6 px-4 py-2 glass rounded-full text-sm font-semibold text-primary-700">
            ✨ Gen Z's Community Marketplace
          </div>
          <h1 className="text-5xl sm:text-7xl font-display font-bold mb-6 bg-gradient-to-r from-primary-600 via-pink-600 to-accent-600 bg-clip-text text-transparent leading-tight">
            Turn Your Side Hustle<br />Into Real Money 💸
          </h1>
          <p className="text-xl sm:text-2xl text-gray-700 mb-12 max-w-3xl mx-auto font-medium">
            The only platform where young entrepreneurs connect with neighbors who need help.
            <span className="text-primary-600"> No cap.</span>
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Link to="/signup" className="btn-primary text-lg">
              Start Earning 🚀
            </Link>
            <Link to="/login" className="glass-card px-8 py-3 rounded-2xl text-lg font-semibold text-gray-700 hover:scale-105 transition-transform">
              Sign In
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-pink-400 border-2 border-white"></div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-400 to-yellow-400 border-2 border-white"></div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-teal-400 border-2 border-white"></div>
            </div>
            <span className="font-medium">Join 100+ young hustlers already earning</span>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-20 animate-slide-up">
          <div className="glass-card p-8 rounded-3xl group hover:scale-105 transition-all">
            <div className="text-6xl mb-4 group-hover:animate-float">🎯</div>
            <h3 className="text-2xl font-display font-bold mb-3 bg-gradient-to-r from-primary-600 to-pink-600 bg-clip-text text-transparent">
              For Creators
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Build your personal brand, set your prices, and get paid for doing what you love. No bosses, just vibes.
            </p>
          </div>

          <div className="glass-card p-8 rounded-3xl group hover:scale-105 transition-all">
            <div className="text-6xl mb-4 group-hover:animate-float">🏡</div>
            <h3 className="text-2xl font-display font-bold mb-3 bg-gradient-to-r from-accent-500 to-orange-600 bg-clip-text text-transparent">
              For Neighbors
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Get help from trusted local talent. Support young entrepreneurs and keep it local. Win-win energy.
            </p>
          </div>

          <div className="glass-card p-8 rounded-3xl group hover:scale-105 transition-all">
            <div className="text-6xl mb-4 group-hover:animate-float">💪</div>
            <h3 className="text-2xl font-display font-bold mb-3 bg-gradient-to-r from-green-500 to-teal-600 bg-clip-text text-transparent">
              Build Together
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Strengthen your community while leveling up the next generation. That's the real flex.
            </p>
          </div>
        </div>

        {/* Services Showcase */}
        <div className="glass-card p-10 rounded-3xl mb-20 animate-slide-up">
          <h3 className="text-3xl font-display font-bold mb-6 text-center bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            Popular Side Hustles 🔥
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
              { name: 'Tech Help', emoji: '💻' },
            ].map((service) => (
              <div
                key={service.name}
                className="glass px-6 py-3 rounded-full font-semibold text-gray-700 hover:scale-110 transition-transform cursor-pointer"
              >
                <span className="mr-2">{service.emoji}</span>
                {service.name}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center glass-card p-12 rounded-3xl animate-fade-in">
          <h2 className="text-4xl font-display font-bold mb-4 bg-gradient-to-r from-primary-600 via-pink-600 to-accent-600 bg-clip-text text-transparent">
            Ready to get that bag? 💰
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join the community and start your entrepreneurial journey today
          </p>
          <Link to="/signup" className="btn-primary text-xl inline-block">
            Let's Go! 🎉
          </Link>
        </div>
      </div>
    </div>
  );
};
