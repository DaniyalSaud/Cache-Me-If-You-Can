import type { Route } from "./+types/home";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "FarmMarket - Connect Farmers with Buyers" },
    { name: "description", content: "A simple marketplace for farmers to sell their produce directly to buyers." },
  ];
}

export default function Home() {
  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-mint-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-earth-200 sticky top-0 z-50">
        <div className="container-page">
          <div className="flex items-center justify-between py-4">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="text-4xl">🌾</div>
              <h1 className="text-3xl font-bold text-mint-700">FarmMarket</h1>
            </Link>
            <nav className="flex gap-4">
              <Link to="/login" className="btn-outline py-3 px-6">
                Login
              </Link>
              <Link to="/signup" className="btn-primary py-3 px-6">
                Sign Up Free
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container-page py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <div className="text-7xl md:text-8xl mb-6 animate-bounce-slow">🚜</div>
          <h2 className="text-4xl md:text-6xl font-bold text-earth-900 mb-6 leading-tight">
            Fresh From Farm<br />
            <span className="text-mint-700">Straight To You</span>
          </h2>
          <p className="text-xl md:text-2xl text-earth-700 mb-10 leading-relaxed max-w-2xl mx-auto">
            No middlemen. No delays. Just honest prices and fresh produce 
            connecting local farmers with their community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/signup" className="btn-primary text-xl">
              🌱 Start Selling or Buying
            </Link>
            <button onClick={scrollToFeatures} className="btn-secondary text-xl">
              📖 How It Works
            </button>
          </div>
          <div className="flex flex-wrap gap-6 justify-center text-lg text-earth-700">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✓</span>
              <span>100% Free to Join</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✓</span>
              <span>Direct Contact</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✓</span>
              <span>Support Local</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container-page py-16 scroll-mt-20">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-bold text-earth-900 mb-4">Why Choose FarmMarket?</h3>
          <p className="text-xl text-earth-700">Simple, trusted, and built for everyone</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="card text-center hover:shadow-xl transition-shadow duration-300 hover:-translate-y-1">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-2xl font-bold text-earth-900 mb-4">Fresh & Local</h3>
            <p className="text-lg text-earth-700 leading-relaxed">
              Get fresh produce directly from farms in your area. Know where your food comes from.
            </p>
            <div className="mt-6 pt-6 border-t border-earth-200">
              <div className="text-mint-700 font-semibold">Same-Day Pickup Available</div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="card text-center hover:shadow-xl transition-shadow duration-300 hover:-translate-y-1">
            <div className="text-6xl mb-4">🤝</div>
            <h3 className="text-2xl font-bold text-earth-900 mb-4">Fair Prices</h3>
            <p className="text-lg text-earth-700 leading-relaxed">
              Farmers get full value for their work. Buyers get quality produce at honest prices.
            </p>
            <div className="mt-6 pt-6 border-t border-earth-200">
              <div className="text-mint-700 font-semibold">No Hidden Fees</div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="card text-center hover:shadow-xl transition-shadow duration-300 hover:-translate-y-1">
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-2xl font-bold text-earth-900 mb-4">Easy to Use</h3>
            <p className="text-lg text-earth-700 leading-relaxed">
              Large buttons, clear text, simple steps. Anyone can list or find produce in minutes.
            </p>
            <div className="mt-6 pt-6 border-t border-earth-200">
              <div className="text-mint-700 font-semibold">No Technical Skills Needed</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-16 border-y border-earth-200">
        <div className="container-page">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-earth-900 mb-4">How It Works</h3>
            <p className="text-xl text-earth-700">Get started in 3 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-mint-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-mint-700 border-4 border-mint-600">
                1
              </div>
              <h4 className="text-2xl font-bold text-earth-900 mb-3">Sign Up Free</h4>
              <p className="text-lg text-earth-700">
                Create your account as a farmer or buyer. Takes less than 2 minutes.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-mint-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-mint-700 border-4 border-mint-600">
                2
              </div>
              <h4 className="text-2xl font-bold text-earth-900 mb-3">List or Browse</h4>
              <p className="text-lg text-earth-700">
                Farmers list their produce. Buyers browse what's available nearby.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-mint-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-mint-700 border-4 border-mint-600">
                3
              </div>
              <h4 className="text-2xl font-bold text-earth-900 mb-3">Connect Direct</h4>
              <p className="text-lg text-earth-700">
                Contact each other directly. Arrange pickup or delivery yourselves.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container-page py-20">
        <div className="card text-center max-w-3xl mx-auto bg-gradient-to-br from-mint-100 to-mint-50 border-mint-300 shadow-xl">
          <div className="text-6xl mb-6">🌾</div>
          <h3 className="text-3xl md:text-4xl font-bold text-earth-900 mb-4">
            Join Our Growing Community
          </h3>
          <p className="text-xl text-earth-700 mb-6">
            Over 500+ farmers and buyers already connected. Your fresh start begins here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/signup" className="btn-primary text-xl">
              Create Account - It's Free
            </Link>
          </div>
          <div className="flex flex-wrap gap-8 justify-center text-earth-700">
            <div className="text-center">
              <div className="text-3xl font-bold text-mint-700">500+</div>
              <div className="text-sm">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-mint-700">50+</div>
              <div className="text-sm">Local Farms</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-mint-700">100%</div>
              <div className="text-sm">Free to Use</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-earth-200">
        <div className="container-page py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl">🌾</span>
                <span className="text-2xl font-bold text-mint-700">FarmMarket</span>
              </div>
              <p className="text-earth-600">
                Connecting local farmers with their community for a fresher, fairer future.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xl font-bold text-earth-900 mb-4">Quick Links</h4>
              <ul className="space-y-2 text-earth-600">
                <li><Link to="/" className="hover:text-mint-700 transition-colors">Home</Link></li>
                <li><Link to="/signup" className="hover:text-mint-700 transition-colors">Sign Up</Link></li>
                <li><Link to="/login" className="hover:text-mint-700 transition-colors">Login</Link></li>
                <li><button className="hover:text-mint-700 transition-colors">About Us</button></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-xl font-bold text-earth-900 mb-4">Get In Touch</h4>
              <ul className="space-y-2 text-earth-600">
                <li className="flex items-center gap-2">
                  <span className="text-xl">📧</span>
                  <span>support@farmmarket.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-xl">📞</span>
                  <span>1-800-FARM-MKT</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-xl">🕐</span>
                  <span>Mon-Sat, 6AM - 8PM</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-earth-200 pt-6 text-center text-earth-600">
            <p className="text-lg">© 2025 FarmMarket - Supporting Local Farmers & Communities</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
