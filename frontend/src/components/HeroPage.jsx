import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

const HeroPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-3xl">🌾</div>
          <h1 className="text-2xl font-bold text-green-800">FarmMarket</h1>
        </div>
        <div className="hidden md:flex gap-8 items-center">
          <a href="#products" className="text-gray-700 hover:text-green-700 transition">
            Products
          </a>
          <a href="#farmers" className="text-gray-700 hover:text-green-700 transition">
            Farmers
          </a>
          <a href="#about" className="text-gray-700 hover:text-green-700 transition">
            About
          </a>
          <Button variant="outline" className="border-green-600 text-green-700 hover:bg-green-50" asChild>
            <Link to="/auth">Login</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">
              🌱 Fresh from Farm to Table
            </Badge>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Fresh Produce
              <span className="block text-green-700">Directly from Farmers</span>
            </h2>
            
            <p className="text-lg text-gray-600 leading-relaxed">
              Connect with local farmers and get the freshest organic produce delivered 
              to your doorstep. Support sustainable farming while enjoying quality products.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="lg" 
                className="bg-green-700 hover:bg-green-800 text-white px-8"
              >
                Shop Now 🛒
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-green-600 text-green-700 hover:bg-green-50"
              >
                Become a Seller 🌾
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div>
                <h3 className="text-3xl font-bold text-green-700">500+</h3>
                <p className="text-sm text-gray-600">Farmers</p>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-green-700">2000+</h3>
                <p className="text-sm text-gray-600">Products</p>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-green-700">5000+</h3>
                <p className="text-sm text-gray-600">Happy Customers</p>
              </div>
            </div>
          </div>

          {/* Right Content - Visual */}
          <div className="relative">
            <div className="bg-green-100 rounded-3xl p-8 md:p-12 shadow-xl">
              {/* Placeholder for image - you can replace with actual images */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition">
                  <div className="text-5xl mb-4">🥕</div>
                  <h4 className="font-semibold text-lg text-gray-800">Fresh Vegetables</h4>
                  <p className="text-gray-600 text-sm mt-2">Organic & Locally Grown</p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition">
                  <div className="text-5xl mb-4">🍎</div>
                  <h4 className="font-semibold text-lg text-gray-800">Fresh Fruits</h4>
                  <p className="text-gray-600 text-sm mt-2">Handpicked Daily</p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition">
                  <div className="text-5xl mb-4">🌽</div>
                  <h4 className="font-semibold text-lg text-gray-800">Farm Fresh Grains</h4>
                  <p className="text-gray-600 text-sm mt-2">100% Natural</p>
                </div>
              </div>
            </div>
            
            {/* Floating Badge */}
            <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-900 px-6 py-3 rounded-full font-semibold shadow-lg rotate-12">
              ✨ 100% Organic
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-3">
            <div className="text-5xl">🚚</div>
            <h3 className="font-semibold text-xl text-gray-800">Fast Delivery</h3>
            <p className="text-gray-600">Get fresh produce delivered within 24 hours</p>
          </div>
          
          <div className="text-center space-y-3">
            <div className="text-5xl">💚</div>
            <h3 className="font-semibold text-xl text-gray-800">Quality Guaranteed</h3>
            <p className="text-gray-600">100% satisfaction or money back guarantee</p>
          </div>
          
          <div className="text-center space-y-3">
            <div className="text-5xl">🤝</div>
            <h3 className="font-semibold text-xl text-gray-800">Support Farmers</h3>
            <p className="text-gray-600">Direct connection means better prices for all</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {/* About */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="text-3xl">🌾</div>
                <h3 className="text-xl font-bold">FarmMarket</h3>
              </div>
              <p className="text-gray-400 text-sm">
                Connecting farmers with customers for fresh, organic produce delivered straight to your door.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#products" className="text-gray-400 hover:text-white transition">
                    Products
                  </a>
                </li>
                <li>
                  <a href="#farmers" className="text-gray-400 hover:text-white transition">
                    Farmers
                  </a>
                </li>
                <li>
                  <a href="#about" className="text-gray-400 hover:text-white transition">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#contact" className="text-gray-400 hover:text-white transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* For Sellers */}
            <div>
              <h4 className="font-semibold mb-4">For Sellers</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/auth" className="text-gray-400 hover:text-white transition">
                    Become a Seller
                  </Link>
                </li>
                <li>
                  <a href="#pricing" className="text-gray-400 hover:text-white transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#resources" className="text-gray-400 hover:text-white transition">
                    Resources
                  </a>
                </li>
                <li>
                  <a href="#support" className="text-gray-400 hover:text-white transition">
                    Support
                  </a>
                </li>
              </ul>
            </div>

            {/* Admin & Legal */}
            <div>
              <h4 className="font-semibold mb-4">Admin & Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link 
                    to="/admin" 
                    className="text-yellow-400 hover:text-yellow-300 transition font-semibold flex items-center gap-1"
                  >
                    🔐 Admin Portal
                  </Link>
                </li>
                <li>
                  <a href="#privacy" className="text-gray-400 hover:text-white transition">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#terms" className="text-gray-400 hover:text-white transition">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#faq" className="text-gray-400 hover:text-white transition">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2025 FarmMarket. All rights reserved. Built with 💚 for farmers and communities.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HeroPage;
