import type { Route } from "./+types/home";
import { Link } from "react-router";
import { useState, useEffect } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "FreshHarvest - Connect Farmers with Buyers" },
    {
      name: "description",
      content:
        "FreshHarvest is the simple way for farmers and buyers to trade fresh produce directly.",
    },
  ];
}

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll detection for navbar height
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background-50 text-text-900">
      {/* Header */}
      <header className={`sticky top-0 z-50 bg-primary-700 shadow-lg transition-all duration-300 ${isScrolled ? 'py-0' : ''}`}>
        <div className="container-page">
          <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'}`}>
            <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <div className={`flex items-center gap-1 transition-all duration-300 ${isScrolled ? 'text-2xl' : 'text-3xl'}`}>
                <span>🍎</span>
                <span>🌽</span>
                <span>🥕</span>
              </div>
              <h1 className={`font-bold text-white transition-all duration-300 ${isScrolled ? 'text-xl' : 'text-2xl'}`}>FreshHarvest</h1>
            </Link>
            <nav className="flex items-center gap-3">
              <Link
                to="/marketplace"
                className={`hidden sm:inline-flex items-center gap-2 rounded-lg border border-transparent font-semibold text-white/90 hover:text-white hover:bg-white/10 transition-all ${isScrolled ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}`}
              >
                <span>🧺</span>
                <span>Marketplace</span>
              </Link>
              <Link to="/login" className={`bg-white/10 text-white hover:bg-white/20 font-semibold rounded-lg transition-all duration-200 ${isScrolled ? 'py-2 px-4 text-sm' : 'py-3 px-6 text-base'}`}>
                Login
              </Link>
              <Link to="/signup" className={`bg-white text-primary-700 hover:bg-gray-50 font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${isScrolled ? 'py-2 px-4 text-sm' : 'py-3 px-6 text-base'}`}>
                Sign Up Free
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container-page py-16 md:py-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6 text-center lg:text-left">
            <p className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary-700">
              <span>🍃</span>
              <span>Welcome to FreshHarvest</span>
            </p>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Fresh produce, transparent prices, trusted farmers.
            </h2>
            <p className="text-base md:text-lg text-text-600 max-w-xl mx-auto lg:mx-0">
              Discover seasonal vegetables, explore our verified marketplace, and build reliable supply
              chains directly with growers across India.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-center lg:justify-start">
              <Link to="/marketplace" className="btn-primary text-sm font-semibold uppercase tracking-widest">
                Browse Marketplace
              </Link>
              <Link to="/signup" className="btn-secondary text-sm font-semibold uppercase tracking-widest">
                Join FreshHarvest
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-semibold uppercase tracking-widest text-text-500">
              <span className="inline-flex items-center gap-2">
                <span className="text-lg">✓</span>
                <span>Zero commission</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="text-lg">✓</span>
                <span>Verified farmers</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="text-lg">✓</span>
                <span>Logistics ready</span>
              </span>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card bg-white shadow-lg border-primary-100">
              <div className="text-5xl mb-4">🥬</div>
              <h3 className="text-lg font-semibold text-text-900 mb-2">Farmer Dashboards</h3>
              <p className="text-sm text-text-600">
                Upload harvest schedules, track orders, and access pricing insights tailored for your region.
              </p>
            </div>
            <div className="card bg-white shadow-lg">
              <div className="text-5xl mb-4">📦</div>
              <h3 className="text-lg font-semibold text-text-900 mb-2">Buyer Workflows</h3>
              <p className="text-sm text-text-600">
                Configure standing orders, negotiate directly with growers, and monitor delivery status.
              </p>
            </div>
            <div className="card bg-white shadow-lg">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-text-900 mb-2">Analytics Ready</h3>
              <p className="text-sm text-text-600">
                Understand demand trends, compare supplier performance, and keep your inventory optimized.
              </p>
            </div>
            <div className="card bg-white shadow-lg border-primary-100">
              <div className="text-5xl mb-4">🚚</div>
              <h3 className="text-lg font-semibold text-text-900 mb-2">Cold-chain Support</h3>
              <p className="text-sm text-text-600">
                Partner with logistics teams that keep produce at peak freshness from farm to storefront.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container-page py-16 scroll-mt-20">
        <div className="text-center mb-12 space-y-3">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary-700">
            <span>🌱</span>
            <span>Why FreshHarvest?</span>
          </p>
          <h3 className="text-3xl md:text-4xl font-bold">Built for serious produce operations</h3>
          <p className="text-sm md:text-base text-text-600 max-w-2xl mx-auto">
            FreshHarvest balances a friendly interface for farmers with the workflow depth buyers need. Focus on
            produce quality while we handle the connecting tissue.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card text-center hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
            <div className="text-5xl mb-4">🧑‍�</div>
            <h4 className="text-xl font-semibold mb-3">Farmer-first Experience</h4>
            <p className="text-sm text-text-600 leading-relaxed">
              Large call-to-action buttons, regional language support, and simple listing tools keep growers in
              control of their inventory.
            </p>
            <div className="mt-6 pt-4 border-t border-text-200 text-primary-700 text-sm font-semibold">
              Same-day updates across devices
            </div>
          </div>
          <div className="card text-center hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
            <div className="text-5xl mb-4">🤝</div>
            <h4 className="text-xl font-semibold mb-3">Transparent Pricing</h4>
            <p className="text-sm text-text-600 leading-relaxed">
              Buyers see all supply details up front: harvest dates, logistics options, and negotiated price bands.
            </p>
            <div className="mt-6 pt-4 border-t border-text-200 text-primary-700 text-sm font-semibold">
              Zero hidden charges. Ever.
            </div>
          </div>
          <div className="card text-center hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
            <div className="text-5xl mb-4">📱</div>
            <h4 className="text-xl font-semibold mb-3">On-the-go Control</h4>
            <p className="text-sm text-text-600 leading-relaxed">
              Mobile-first dashboards allow farmers and buyers to confirm orders and deliveries in under a minute.
            </p>
            <div className="mt-6 pt-4 border-t border-text-200 text-primary-700 text-sm font-semibold">
              Works offline with auto-sync
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white border-y border-text-200">
        <div className="container-page py-16">
          <div className="text-center mb-12 space-y-3">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary-700">
              <span>📋</span>
              <span>How it works</span>
            </p>
            <h3 className="text-3xl md:text-4xl font-bold">Connect in three simple steps</h3>
            <p className="text-sm md:text-base text-text-600 max-w-2xl mx-auto">
              Whether you grow or buy, FreshHarvest is designed to be understandable in minutes – even on the
              busiest harvest day.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="card text-center bg-background-100">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-primary-200 bg-primary-50 text-2xl font-bold text-primary-700">
                1
              </div>
              <h4 className="text-xl font-semibold mb-3">Create your profile</h4>
              <p className="text-sm text-text-600">
                Choose your role as farmer or buyer, add regional details, and set up preferred logistics.
              </p>
            </div>
            <div className="card text-center bg-background-100">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-primary-200 bg-primary-50 text-2xl font-bold text-primary-700">
                2
              </div>
              <h4 className="text-xl font-semibold mb-3">List or discover produce</h4>
              <p className="text-sm text-text-600">
                Farmers publish their harvest inventory while buyers compare varieties, prices, and availability.
              </p>
            </div>
            <div className="card text-center bg-background-100">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-primary-200 bg-primary-50 text-2xl font-bold text-primary-700">
                3
              </div>
              <h4 className="text-xl font-semibold mb-3">Confirm logistics</h4>
              <p className="text-sm text-text-600">
                Coordinate pickup, leverage FreshHarvest partners for cold-chain delivery, and track order status.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container-page py-20">
        <div className="card bg-gradient-to-br from-secondary-100 to-background-50 text-center max-w-4xl mx-auto border border-secondary-300 shadow-xl">
          <div className="text-5xl mb-4">�</div>
          <h3 className="text-3xl md:text-4xl font-bold mb-3">Ready to explore the marketplace?</h3>
          <p className="text-base md:text-lg text-text-600 mb-6 max-w-2xl mx-auto">
            Thousands of kilos of fresh produce are traded on FreshHarvest every week. Browse the marketplace to
            see live pricing and availability.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/marketplace" className="btn-primary text-sm font-semibold uppercase tracking-widest">
              Visit Marketplace
            </Link>
            <button onClick={scrollToFeatures} className="btn-outline text-sm font-semibold uppercase tracking-widest">
              Review Platform Benefits
            </button>
          </div>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-text-600">
            <div>
              <div className="text-2xl font-bold text-primary-700">500+</div>
              <div className="uppercase tracking-widest">Verified farms</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-700">30+</div>
              <div className="uppercase tracking-widest">Cities served</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-700">100%</div>
              <div className="uppercase tracking-widest">Commission-free</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-text-200">
        <div className="container-page py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🍎</span>
                <span className="text-xl font-bold text-primary-700">FreshHarvest</span>
              </div>
              <p className="text-sm text-text-600">
                A farmer-first marketplace delivering reliable, transparent supply relationships for fresh
                produce businesses.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-widest text-text-500 mb-3">Navigate</h4>
              <ul className="space-y-2 text-sm text-text-600">
                <li>
                  <Link to="/" className="hover:text-primary-700 transition-colors">Home</Link>
                </li>
                <li>
                  <Link to="/marketplace" className="hover:text-primary-700 transition-colors">Marketplace</Link>
                </li>
                <li>
                  <Link to="/signup" className="hover:text-primary-700 transition-colors">Create Account</Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-primary-700 transition-colors">Login</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-widest text-text-500 mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-text-600">
                <li>
                  <button className="hover:text-primary-700 transition-colors">Pricing Guide</button>
                </li>
                <li>
                  <button className="hover:text-primary-700 transition-colors">Success Stories</button>
                </li>
                <li>
                  <button className="hover:text-primary-700 transition-colors">Logistics Network</button>
                </li>
                <li>
                  <button className="hover:text-primary-700 transition-colors">FAQ</button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-widest text-text-500 mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-text-600">
                <li className="flex items-center gap-2">
                  <span className="text-lg">📧</span>
                  <span>support@freshharvest.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-lg">📞</span>
                  <span>+91-800-FRESH-HV</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-lg">🕐</span>
                  <span>Mon-Sat, 6 AM - 8 PM IST</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-text-200 pt-6 text-center">
            <p className="text-sm text-text-500 mb-2">
              © {new Date().getFullYear()} FreshHarvest. Building resilient food supply chains together.
            </p>
            <Link 
              to="/admin-login" 
              className="text-xs text-text-400 hover:text-primary-700 transition-colors"
            >
              🔐 Admin Access
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
