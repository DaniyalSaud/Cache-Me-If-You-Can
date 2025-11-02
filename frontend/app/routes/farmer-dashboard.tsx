import type { Route } from "./+types/farmer-dashboard";
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { API_ENDPOINTS, apiRequest } from "../config/api";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Farmer Dashboard - FreshHarvest" },
    { name: "description", content: "Manage your farm products and orders" },
  ];
}

type Product = {
  _id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  images: string[];
  sellerId: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
};

type Order = {
  id: string;
  product: string;
  quantity: string;
  buyer: string;
  status: "pending" | "processing" | "completed";
  amount: string;
  date: string;
};

export default function FarmerDashboard() {
  const [isAuthenticated] = useState(() => {
    return typeof window !== 'undefined' && 
           localStorage.getItem('isAuthenticated') === 'true' &&
           localStorage.getItem('userRole') === 'seller';
  });

  const [username, setUsername] = useState(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('username') || 'Farmer' : 'Farmer';
  });

  const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders" | "analytics" | "tools">("overview");
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      console.log("🔄 Fetching products from API...");
      setLoadingProducts(true);
      setProductsError(null);
      const response = await apiRequest(API_ENDPOINTS.PRODUCTS);
      
      console.log("📦 API Response:", response);
      console.log("📦 Response data:", response.data);
      console.log("📦 Products array:", response.data?.products);
      
      // The backend returns products in response.data.products
      if (response.data && response.data.products) {
        console.log(`✅ Setting ${response.data.products.length} products`);
        setProducts(response.data.products);
      } else {
        console.log("⚠️ No products found in response");
        setProducts([]);
      }
    } catch (error: any) {
      console.error("❌ Error fetching products:", error);
      setProductsError(error.message || 'Failed to fetch products');
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
    }
  }, [isAuthenticated]);

  // Scroll detection for navbar height
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      // Call the backend logout API
      await apiRequest(API_ENDPOINTS.LOGOUT, {
        method: 'POST',
      });
      
      // Clear local storage
      localStorage.clear();
      
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error("Logout error:", error);
      // Even if API call fails, clear local storage and redirect
      localStorage.clear();
      window.location.href = '/';
    }
  };

  const [orders] = useState<Order[]>([]);

  const stats = {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.verified).length,
    lowStock: 0, // Can be calculated based on inventory when implemented
    pendingOrders: orders.filter(o => o.status === "pending").length,
    totalRevenue: "₹0",
    monthlyRevenue: "₹0"
  };

  // Debug stats calculation
  console.log("📊 Current products state:", products);
  console.log("📊 Stats calculation:", stats);

  // Show authentication message if not logged in as seller
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background-50 flex items-center justify-center px-4">
        <div className="card bg-white shadow-xl max-w-lg w-full text-center">
          <div className="text-6xl mb-6">🚫</div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-900 mb-3">
            Access Restricted
          </h1>
          <p className="text-sm md:text-base text-text-600 mb-6">
            This dashboard is only accessible to registered farmers/sellers. Please log in with a seller account.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/login" className="btn-primary text-sm font-semibold uppercase tracking-widest">
              Login as Farmer
            </Link>
            <Link to="/signup" className="btn-outline text-sm font-semibold uppercase tracking-widest">
              Register as Farmer
            </Link>
          </div>
          <div className="mt-6 pt-6 border-t border-text-200">
            <Link to="/" className="text-sm text-primary-700 hover:text-primary-800 font-semibold transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-300";
      case "low-stock":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "out-of-stock":
        return "bg-red-100 text-red-800 border-red-300";
      case "pending":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "processing":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-background-50 pb-16">
      {/* Header Navigation */}
      <header className={`sticky top-0 z-50 bg-primary-700 shadow-lg transition-all duration-300 ${isScrolled ? 'py-0' : ''}`}>
        <div className="container-page">
          <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'}`}>
            <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <div className={`flex items-center gap-1 transition-all duration-300 ${isScrolled ? 'text-xl' : 'text-2xl'}`}>
                <span>🌾</span>
                <span>🚜</span>
                <span>🌱</span>
              </div>
              <h1 className={`font-bold text-white transition-all duration-300 ${isScrolled ? 'text-xl' : 'text-2xl'}`}>FreshHarvest Farmer</h1>
            </Link>
            <nav className="flex items-center gap-3">
             
              <button 
                onClick={handleLogout}
                className={`bg-white/10 text-white hover:bg-white/20 rounded-lg font-semibold uppercase tracking-widest transition-all ${isScrolled ? 'text-[10px] px-3 py-1.5' : 'text-xs px-4 py-2'}`}
              >
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      <section className="container-page space-y-8 mt-8">
        {/* Page Header */}
        <header className="space-y-3">
          
          <h1 className="text-3xl md:text-4xl font-bold text-text-900">
            Welcome Back, {username}!
          </h1>
          <p className="max-w-2xl text-sm md:text-base text-text-600">
            Manage your products, track orders, and grow your farm business with FreshHarvest.
          </p>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card bg-white shadow-lg border-l-4 border-primary-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-600 uppercase tracking-wider font-semibold">Total Products</p>
                <p className="text-3xl font-bold text-text-900 mt-2">{stats.totalProducts}</p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
            <div className="mt-3 flex gap-3 text-xs">
              <span className="text-green-700">✓ {stats.activeProducts} Active</span>
              <span className="text-yellow-700">⚠ {stats.lowStock} Low Stock</span>
            </div>
          </div>

          <div className="card bg-white shadow-lg border-l-4 border-accent-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-600 uppercase tracking-wider font-semibold">Pending Orders</p>
                <p className="text-3xl font-bold text-text-900 mt-2">{stats.pendingOrders}</p>
              </div>
              <div className="text-4xl">📋</div>
            </div>
            <div className="mt-3 text-xs text-text-600">
              Requires immediate attention
            </div>
          </div>

          <div className="card bg-white shadow-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-600 uppercase tracking-wider font-semibold">Monthly Revenue</p>
                <p className="text-3xl font-bold text-text-900 mt-2">{stats.monthlyRevenue}</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
            <div className="mt-3 text-xs text-text-600">
              Total Revenue: {stats.totalRevenue}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="card bg-white shadow-lg">
          <div className="flex flex-wrap gap-2">
            {(["overview", "products", "orders", "tools", "analytics"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`btn-outline px-4 py-2 text-sm font-semibold uppercase tracking-wider transition-all ${
                  tab === activeTab
                    ? "bg-primary-50 text-primary-700 border-primary-700"
                    : ""
                }`}
              >
                {tab === "overview" && "📊"}
                {tab === "products" && "🥕"}
                {tab === "orders" && "📦"}
                {tab === "tools" && "🛠️"}
                {tab === "analytics" && "📈"}
                {" "}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <div className="card bg-white shadow-lg">
                <h2 className="text-xl font-bold text-text-900 mb-4 flex items-center gap-2">
                  <span>📋</span>
                  <span>Recent Orders</span>
                </h2>
                <div className="space-y-3">
                  {orders.slice(0, 3).map((order) => (
                    <div key={order.id} className="p-4 bg-background-50 rounded-lg border border-text-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-text-900">{order.id}</span>
                        <span className={`text-xs px-3 py-1 rounded-full border font-semibold uppercase ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-text-700">{order.product} - {order.quantity}</p>
                      <p className="text-sm text-text-600">Buyer: {order.buyer}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-text-500">{order.date}</span>
                        <span className="font-bold text-primary-700">{order.amount}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn-outline w-full mt-4 text-sm" onClick={() => setActiveTab("orders")}>
                  View All Orders
                </button>
              </div>

              {/* Quick Actions */}
              <div className="card bg-white shadow-lg">
                <h2 className="text-xl font-bold text-text-900 mb-4 flex items-center gap-2">
                  <span>⚡</span>
                  <span>Quick Actions</span>
                </h2>
                <div className="space-y-3">
                  <button 
                    onClick={() => setShowAddProductModal(true)}
                    className="btn-primary w-full text-sm flex items-center justify-center gap-2"
                  >
                    <span>➕</span>
                    <span>Add New Product</span>
                  </button>
                  <Link to="/waste-report" className="btn-outline w-full text-sm flex items-center justify-center gap-2">
                    <span>♻️</span>
                    <span>Report Crop Waste</span>
                  </Link>
                  <button className="btn-outline w-full text-sm flex items-center justify-center gap-2">
                    <span>📦</span>
                    <span>Manage Inventory</span>
                  </button>
                  <button className="btn-outline w-full text-sm flex items-center justify-center gap-2">
                    <span>💬</span>
                    <span>Contact Support</span>
                  </button>
                  <button className="btn-outline w-full text-sm flex items-center justify-center gap-2">
                    <span>⚙️</span>
                    <span>Account Settings</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="card bg-white shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-900 flex items-center gap-2">
                <span>🥕</span>
                <span>My Products</span>
              </h2>
              <button className="btn-primary text-sm">
                ➕ Add Product
              </button>
            </div>
            {loadingProducts ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4 animate-pulse">🌾</div>
                <p className="text-text-600">Loading your products...</p>
              </div>
            ) : productsError ? (
              <div className="card bg-red-50 border-2 border-red-500">
                <div className="flex items-start gap-3">
                  <span className="text-4xl">⚠️</span>
                  <div>
                    <h3 className="font-bold text-red-900 text-lg mb-1">Error Loading Products</h3>
                    <p className="text-sm text-red-800">{productsError}</p>
                  </div>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-text-900 mb-2">No products yet</h3>
                <p className="text-text-600 mb-6">Start by adding your first product to the marketplace</p>
                <button 
                  onClick={() => setShowAddProductModal(true)}
                  className="btn-primary text-sm font-semibold uppercase tracking-widest"
                >
                  🌱 ADD YOUR FIRST PRODUCT
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((product) => (
                  <div key={product._id} className="p-4 bg-background-50 rounded-lg border border-text-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        {product.images && product.images.length > 0 && (
                          <img 
                            src={product.images[0]} 
                            alt={product.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold text-text-900">{product.title}</h3>
                          <p className="text-sm text-text-600">₹{product.price} / kg</p>
                          <p className="text-xs text-text-500 mt-1">{product.condition}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full border font-semibold uppercase ${product.verified ? 'bg-green-100 text-green-800 border-green-300' : 'bg-yellow-100 text-yellow-800 border-yellow-300'}`}>
                        {product.verified ? '✓ Verified' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-sm text-text-600 mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-500">
                        Added: {new Date(product.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        <button className="text-xs px-3 py-1 bg-primary-100 text-primary-700 rounded hover:bg-primary-200 transition-colors font-semibold">
                          Edit
                        </button>
                        <button className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors font-semibold">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="card bg-white shadow-lg">
            <h2 className="text-xl font-bold text-text-900 mb-6 flex items-center gap-2">
              <span>📦</span>
              <span>Order Management</span>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background-100">
                  <tr className="text-left text-sm text-text-700 uppercase tracking-wider">
                    <th className="px-4 py-3 font-semibold">Order ID</th>
                    <th className="px-4 py-3 font-semibold">Product</th>
                    <th className="px-4 py-3 font-semibold">Buyer</th>
                    <th className="px-4 py-3 font-semibold">Amount</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-text-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-background-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-text-900">{order.id}</td>
                      <td className="px-4 py-3 text-text-700">{order.product}</td>
                      <td className="px-4 py-3 text-text-700">{order.buyer}</td>
                      <td className="px-4 py-3 font-semibold text-primary-700">{order.amount}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-3 py-1 rounded-full border font-semibold uppercase ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-600">{order.date}</td>
                      <td className="px-4 py-3">
                        <button className="text-xs px-3 py-1 bg-primary-100 text-primary-700 rounded hover:bg-primary-200 transition-colors font-semibold">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tools Tab */}
        {activeTab === "tools" && (
          <div className="space-y-6">
            <div className="card bg-white shadow-lg">
              <h2 className="text-xl font-bold text-text-900 mb-6 flex items-center gap-2">
                <span>🛠️</span>
                <span>Farming Tools & Resources</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Crop Waste Reporting */}
                <Link to="/waste-report" className="card bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 hover:shadow-lg transition-all group">
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">♻️</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-green-900 mb-2 group-hover:text-green-700">
                        Report Crop Waste
                      </h3>
                      <p className="text-sm text-green-800 mb-3">
                        Report excess crop waste for recycling and composting. Help reduce waste and earn extra income.
                      </p>
                      <div className="flex items-center gap-2 text-xs text-green-700 font-semibold">
                        <span>Start Report</span>
                        <span>→</span>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Farming Tips */}
                <Link to="/farming-tools" className="block">
                  <div className="card bg-gradient-to-br from-teal-50 to-teal-100 border-2 border-teal-200 hover:shadow-lg transition-all cursor-pointer group">
                    <div className="flex items-start gap-4">
                      <div className="text-5xl">📚</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-teal-900 mb-2 group-hover:text-teal-700">
                          Farming Tools & Calculators
                        </h3>
                        <p className="text-sm text-teal-800 mb-3">
                          Calculate water, fertilizer requirements and estimate electricity bills. Smart tools for efficient farming.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-teal-700 font-semibold">
                          <span>Open Tools</span>
                          <span>→</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Loan & Subsidies */}
                <div className="card bg-gradient-to-br from-rose-50 to-rose-100 border-2 border-rose-200 hover:shadow-lg transition-all cursor-pointer group">
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">🏦</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-rose-900 mb-2 group-hover:text-rose-700">
                        Loans & Subsidies
                      </h3>
                      <p className="text-sm text-rose-800 mb-3">
                        Find information about agricultural loans, subsidies, and government schemes for farmers.
                      </p>
                      <div className="flex items-center gap-2 text-xs text-rose-700 font-semibold">
                        <span>Coming Soon</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="card bg-white shadow-lg">
              <h2 className="text-xl font-bold text-text-900 mb-4 flex items-center gap-2">
                <span>📈</span>
                <span>Sales Analytics</span>
              </h2>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-text-900 mb-2">Analytics Coming Soon</h3>
                <p className="text-sm text-text-600 mb-4">
                  Detailed analytics and insights about your sales, inventory, and performance will be available here.
                </p>
                <p className="text-xs text-text-500">
                  Features: Sales trends, product performance, revenue forecasting, and more!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="card bg-mint-50 border-mint-200">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text-900 mb-1 flex items-center gap-2">
                <span>💬</span>
                <span>Need Help?</span>
              </h3>
              <p className="text-sm text-text-600">
                Our farmer support team is here to help you grow your business.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="btn-primary text-xs font-semibold uppercase tracking-widest">
                Contact Support
              </button>
              <button className="btn-outline text-xs font-semibold uppercase tracking-widest">
                View Guide
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Add Product Modal */}
      {showAddProductModal && (
        <AddProductModal 
          onClose={() => setShowAddProductModal(false)} 
          onSuccess={() => {
            fetchProducts(); // Refresh products list
            setShowAddProductModal(false);
          }}
        />
      )}
    </div>
  );
}

// Add Product Modal Component
function AddProductModal({ onClose, onSuccess }: { onClose: () => void; onSuccess?: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    condition: 'new',
  });
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (filesArray.length > 12) {
        setError('Maximum 12 images are allowed');
        return;
      }
      setImages(filesArray);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (images.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create FormData for multipart/form-data
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('condition', formData.condition);
      
      // Append all images
      images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      console.log('📤 Sending product creation request...');
      console.log('Title:', formData.title);
      console.log('Images:', images.length);

      const response = await fetch(API_ENDPOINTS.PRODUCTS + '/create', {
        method: 'POST',
        credentials: 'include',
        headers: {
          // Don't set Content-Type for FormData, browser will set it with boundary
        },
        body: formDataToSend,
      });

      console.log('📥 Response status:', response.status);
      const data = await response.json();
      console.log('📥 Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create product');
      }

      console.log('✅ Product created successfully!');
      setSuccess(true);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        price: '',
        condition: 'new',
      });
      setImages([]);

      // Close modal and refresh products after 1.5 seconds
      setTimeout(() => {
        console.log('🔄 Refreshing products list...');
        if (onSuccess) {
          onSuccess(); // This will refresh the products list
        } else {
          onClose();
        }
      }, 1500);
    } catch (err: any) {
      console.error('❌ Product creation error:', err);
      setError(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b-2 border-text-300 p-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="text-3xl">🌽</div>
              <h2 className="text-2xl font-bold text-text-900">Add New Product</h2>
            </div>
            <p className="text-sm text-text-600">List your fresh produce on the marketplace</p>
          </div>
          <button
            onClick={onClose}
            className="text-text-500 hover:text-text-900 text-3xl transition-colors font-bold"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {success && (
            <div className="card bg-mint-50 border-2 border-mint-500 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-4xl">✅</span>
                <div>
                  <h3 className="font-bold text-primary-900 text-lg mb-1">Product Added Successfully!</h3>
                  <p className="text-sm text-primary-800">Your product is now live on the marketplace and ready for buyers to discover.</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="card bg-red-50 border-2 border-red-500 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-4xl">⚠️</span>
                <div>
                  <h3 className="font-bold text-red-900 text-lg mb-1">Oops! Something went wrong</h3>
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Title */}
            <div>
              <label htmlFor="title" className="label-field">
                � PRODUCT TITLE
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Fresh Organic Tomatoes"
                className="input-field"
                required
                disabled={loading}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="label-field">
                🥬 DESCRIPTION
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your product, its quality, origin, etc."
                className="input-field min-h-[120px] resize-none"
                required
                disabled={loading}
              />
            </div>

            {/* Price and Condition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="label-field">
                  🥕 PRICE (₹ per kg)
                </label>
                <input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="95"
                  className="input-field"
                  required
                  min="0"
                  step="0.01"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="condition" className="label-field">
                  🌶️ CONDITION
                </label>
                <select
                  id="condition"
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className="input-field"
                  required
                  disabled={loading}
                >
                  <option value="new">New/Fresh</option>
                  <option value="good">Good Quality</option>
                  <option value="fair">Fair Condition</option>
                  <option value="organic">Organic Certified</option>
                </select>
              </div>
            </div>

            {/* Images */}
            <div>
              <label htmlFor="images" className="label-field">
                🥒 PRODUCT IMAGES (Max 12)
              </label>
              <div className="card bg-background-50 border-2 border-dashed border-text-300 hover:border-primary-500 transition-colors">
                <input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="w-full cursor-pointer text-sm text-text-700
                    file:mr-4 file:py-3 file:px-6
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-primary-50 file:text-primary-700
                    hover:file:bg-primary-100
                    file:cursor-pointer file:transition-colors"
                  required
                  disabled={loading}
                />
              </div>
              {images.length > 0 && (
                <div className="card bg-mint-50 border-mint-300 mt-3">
                  <p className="text-sm text-text-800 font-semibold flex items-center gap-2">
                    <span>✅</span>
                    <span>{images.length} image{images.length > 1 ? 's' : ''} selected</span>
                  </p>
                </div>
              )}
              <p className="text-xs text-text-500 mt-2 flex items-start gap-2">
                <span>💡</span>
                <span>Upload clear, high-quality images of your product. The first image will be used as the cover photo.</span>
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-outline flex-1 text-sm font-semibold uppercase tracking-widest"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-widest"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="animate-spin text-xl">⏳</span>
                    <span>Creating Product...</span>
                  </>
                ) : (
                  <>
                    <span>Create Product</span>
                    <span className="text-xl">🌱</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
