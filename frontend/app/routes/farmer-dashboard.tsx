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
  _id: string;
  buyerId: {
    _id: string;
    username: string;
    phoneno: string;
  };
  products: Array<{
    productId: {
      _id: string;
      title: string;
      images: string[];
    };
    quantity: number;
    price: number;
    sellerId: string;
  }>;
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  adminApproved: boolean;
  createdAt: string;
  updatedAt: string;
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

  const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders" | "tools" | "chatbot">("overview");
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [showAccountSettingsModal, setShowAccountSettingsModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [revenueStats, setRevenueStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
  });
  const [loadingOrders, setLoadingOrders] = useState(true);

  const fetchProducts = async () => {
    try {
      console.log("🔄 Fetching products from API...");
      setLoadingProducts(true);
      setProductsError(null);
      
      const sellerId = localStorage.getItem('userId');
      
      if (!sellerId) {
        throw new Error('Seller ID not found. Please login again.');
      }
      
      console.log("👤 Fetching products for seller:", sellerId);
      
      const response = await apiRequest(API_ENDPOINTS.PRODUCTS, {
        method: 'POST',
        body: JSON.stringify({ sellerId }),
      });
      
      console.log("📦 API Response:", response);
      console.log("📦 Response data:", response.data);
      console.log("📦 Products array:", response.data?.products);
      
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

  // Fetch orders and revenue stats
  const fetchOrders = async () => {
    try {
      console.log("🔄 Fetching orders from API...");
      setLoadingOrders(true);
      
      const response = await apiRequest(`${API_ENDPOINTS.ORDERS}/seller`, {
        method: 'GET',
      });
      
      console.log("📦 Orders Response:", response);
      
      if (response.data) {
        setOrders(response.data.orders || []);
        if (response.data.stats) {
          setRevenueStats({
            totalRevenue: response.data.stats.totalRevenue || 0,
            totalOrders: response.data.stats.totalOrders || 0,
            pendingOrders: response.data.stats.pendingOrders || 0,
          });
        }
      }
    } catch (error: any) {
      console.error("❌ Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
      fetchOrders();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await apiRequest(API_ENDPOINTS.LOGOUT, {
        method: 'POST',
      });
      
      localStorage.clear();
      
      window.location.href = '/';
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.clear();
      window.location.href = '/';
    }
  };
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      console.log("🗑️ Deleting product:", productId);
      
      const response = await apiRequest(`${API_ENDPOINTS.PRODUCTS}/delete/${productId}`, {
        method: 'DELETE',
      });

      console.log("✅ Product deleted successfully:", response);
      
      await fetchProducts();
      
      alert('Product deleted successfully!');
    } catch (error: any) {
      console.error("❌ Error deleting product:", error);
      alert(error.message || 'Failed to delete product');
    }
  };

  const handleEditProduct = (product: Product) => {
    console.log("✏️ Editing product:", product);
    setSelectedProduct(product);
    setShowEditProductModal(true);
  };

  // Handle accepting order (change status to processing)
  const handleAcceptOrder = async (orderId: string, order: Order) => {
    // Check if order is cancelled
    if (order.status === 'cancelled') {
      alert('❌ Cannot accept a cancelled order');
      return;
    }

    // Check if admin has approved (only for sellers)
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'seller' && !order.adminApproved) {
      alert('⚠️ This order must be approved by admin before you can accept it');
      return;
    }

    if (!confirm('Accept this order and begin processing?')) {
      return;
    }

    try {
      console.log("✅ Accepting order:", orderId);
      
      // Release escrow to mark order as accepted/processing
      const response = await apiRequest(`${API_ENDPOINTS.ORDERS}/${orderId}/release`, {
        method: 'POST',
      });

      console.log("✅ Order accepted successfully:", response);
      
      // Refresh orders
      await fetchOrders();
      
      alert('✅ Order accepted! The buyer will be notified.');
    } catch (error: any) {
      console.error("❌ Error accepting order:", error);
      alert(error.message || 'Failed to accept order');
    }
  };

  // Handle completing order (mark as shipped/completed)
  const handleCompleteOrder = async (orderId: string) => {
    if (!confirm('Mark this order as shipped/completed?')) {
      return;
    }

    try {
      console.log("📦 Completing order:", orderId);
      
      // You may need to create a specific endpoint for this, or use the release endpoint
      const response = await apiRequest(`${API_ENDPOINTS.ORDERS}/${orderId}/release`, {
        method: 'POST',
      });

      console.log("✅ Order marked as completed:", response);
      
      // Refresh orders
      await fetchOrders();
      
      alert('Order marked as shipped! Payment will be released.');
    } catch (error: any) {
      console.error("❌ Error completing order:", error);
      alert(error.message || 'Failed to complete order');
    }
  };

  const stats = {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.verified).length,
    lowStock: 0, 
    pendingOrders: revenueStats.pendingOrders,
    totalRevenue: `Rs ${revenueStats.totalRevenue.toLocaleString()}`,
    monthlyRevenue: `Rs ${revenueStats.totalRevenue.toLocaleString()}`
  };

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
              <h1 className={`font-bold text-white transition-all duration-300 ${isScrolled ? 'text-2xl' : 'text-3xl'}`}>FreshHarvest Farmer</h1>
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
                <p className="text-sm text-text-600 uppercase tracking-wider font-semibold">Total Revenue</p>
                <p className="text-3xl font-bold text-text-900 mt-2">{stats.monthlyRevenue}</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
            <div className="mt-3 text-xs text-text-600">
              Your Total Earnings
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="card bg-white shadow-lg">
          <div className="flex flex-wrap gap-2">
            {(["overview", "products", "orders", "tools", "chatbot"] as const).map((tab) => (
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
                {tab === "chatbot" && "🧑‍🌾"}
                {" "}
                {tab === "chatbot" ? "Ask Sardar G" : tab.charAt(0).toUpperCase() + tab.slice(1)}
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
                {loadingOrders ? (
                  <div className="text-center py-8">
                    <div className="text-3xl mb-2 animate-pulse">📦</div>
                    <p className="text-sm text-text-600">Loading orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-3xl mb-2">📭</div>
                    <p className="text-sm text-text-600">No orders yet</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {orders.slice(0, 3).map((order) => (
                        <div key={order._id} className="p-4 bg-background-50 rounded-lg border border-text-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-text-900">#{order._id.slice(-6).toUpperCase()}</span>
                            <span className={`text-xs px-3 py-1 rounded-full border font-semibold uppercase ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-sm text-text-700">
                            {order.products.map(p => p.productId.title).join(", ")}
                          </p>
                          <p className="text-sm text-text-600 flex items-center gap-2">
                            <span>👤</span>
                            <span>Buyer: {order.buyerId.username}</span>
                            <span className="text-xs text-text-400">({order.buyerId.phoneno})</span>
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-text-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                            <span className="font-bold text-primary-700">Rs {order.totalAmount.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="btn-outline w-full mt-4 text-sm" onClick={() => setActiveTab("orders")}>
                      View All Orders
                    </button>
                  </>
                )}
              </div>

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
                  <button 
                    onClick={() => setShowGuideModal(true)}
                    className="btn-outline w-full text-sm flex items-center justify-center gap-2"
                  >
                    <span>📖</span>
                    <span>View Guide</span>
                  </button>
                  
                  <button 
                    onClick={() => setShowAccountSettingsModal(true)}
                    className="btn-outline w-full text-sm flex items-center justify-center gap-2"
                  >
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
              <button 
                onClick={() => setShowAddProductModal(true)}
                className="btn-primary text-sm"
              >
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
                        {product.verified ? '✓ Verified' : '✓ Verified'}
                      </span>
                    </div>
                    <p className="text-sm text-text-600 mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-500">
                        Added: {new Date(product.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className="text-xs px-3 py-1 bg-primary-100 text-primary-700 rounded hover:bg-primary-200 transition-colors font-semibold"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product._id)}
                          className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors font-semibold"
                        >
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
            
            {loadingOrders ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4 animate-pulse">📦</div>
                <p className="text-text-600">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📭</div>
                <h3 className="text-xl font-semibold text-text-900 mb-2">No orders yet</h3>
                <p className="text-text-600">Orders from buyers will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order._id} className="p-4 bg-background-50 rounded-lg border border-text-200 hover:shadow-md transition-shadow">
                    {/* Order Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-text-500">ORDER ID:</span>
                          <span className="text-sm font-semibold text-text-900">#{order._id.slice(-8).toUpperCase()}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs px-3 py-1 rounded-full border font-semibold uppercase ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                          <span className={`text-xs px-3 py-1 rounded-full border font-semibold uppercase ${
                            order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800 border-green-300' :
                            order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                            'bg-red-100 text-red-800 border-red-300'
                          }`}>
                            Payment: {order.paymentStatus}
                          </span>
                          {order.status === 'pending' && (
                            <span className={`text-xs px-3 py-1 rounded-full border font-semibold uppercase ${
                              order.adminApproved ? 'bg-green-100 text-green-800 border-green-300' : 'bg-orange-100 text-orange-800 border-orange-300'
                            }`}>
                              {order.adminApproved ? '✓ Admin Approved' : '⏳ Awaiting Admin Approval'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary-700">Rs {order.totalAmount.toLocaleString()}</p>
                        <p className="text-xs text-text-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Buyer Information */}
                    <div className="card bg-blue-50 border border-blue-200 mb-3">
                      <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                        <span>👤</span>
                        <span>Buyer Information</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-blue-700 font-semibold">Name:</span>
                          <span className="ml-2 text-blue-900">{order.buyerId.username}</span>
                        </div>
                        <div>
                          <span className="text-blue-700 font-semibold">Phone:</span>
                          <a href={`tel:${order.buyerId.phoneno}`} className="ml-2 text-blue-900 hover:text-blue-700 underline">
                            {order.buyerId.phoneno}
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Products List */}
                    <div className="mb-3">
                      <h4 className="font-semibold text-text-900 mb-2">Products:</h4>
                      <div className="space-y-2">
                        {order.products.map((product, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border border-text-200">
                            <div className="flex items-center gap-3">
                              {product.productId.images && product.productId.images.length > 0 && (
                                <img 
                                  src={product.productId.images[0]} 
                                  alt={product.productId.title}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              )}
                              <div>
                                <p className="font-semibold text-text-900">{product.productId.title}</p>
                                <p className="text-sm text-text-600">Quantity: {product.quantity} × Rs {product.price}</p>
                              </div>
                            </div>
                            <p className="font-bold text-primary-700">Rs {(product.quantity * product.price).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-text-200">
                      {order.status === 'pending' && (
                        <>
                          {!order.adminApproved && (
                            <div className="text-xs px-4 py-2 bg-orange-50 text-orange-700 rounded-lg border border-orange-300 flex items-center gap-1">
                              <span>⏳</span>
                              <span>Waiting for admin approval</span>
                            </div>
                          )}
                          {order.adminApproved && (
                            <button 
                              onClick={() => handleAcceptOrder(order._id, order)}
                              className="text-xs px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center gap-1"
                            >
                              <span>✅</span>
                              <span>Accept Order</span>
                            </button>
                          )}
                        </>
                      )}
                      {order.status === 'processing' && (
                        <button 
                          onClick={() => handleCompleteOrder(order._id)}
                          className="text-xs px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-1"
                        >
                          <span>📦</span>
                          <span>Mark as Shipped</span>
                        </button>
                      )}
                      {order.status === 'cancelled' && (
                        <div className="text-xs px-4 py-2 bg-red-50 text-red-700 rounded-lg border border-red-300 flex items-center gap-1">
                          <span>❌</span>
                          <span>Order Cancelled</span>
                        </div>
                      )}
                      {order.status !== 'cancelled' && (
                        <a 
                          href={`tel:${order.buyerId.phoneno}`}
                          className="text-xs px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors font-semibold flex items-center gap-1"
                        >
                          <span>📞</span>
                          <span>Call Buyer</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                          Calculate water consumption, fertilizer requirements, and electricity costs for your farm operations.
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
                <Link to="/loan-application" className="block">
                  <div className="card bg-gradient-to-br from-rose-50 to-rose-100 border-2 border-rose-200 hover:shadow-lg transition-all cursor-pointer group">
                    <div className="flex items-start gap-4">
                      <div className="text-5xl">🏦</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-rose-900 mb-2 group-hover:text-rose-700">
                          Loans & Subsidies
                        </h3>
                        <p className="text-sm text-rose-800 mb-3">
                          Apply for agricultural loans and track your loan application status.
                        </p>
                        <div className="flex items-center gap-2 text-xs text-rose-700 font-semibold">
                          <span>Apply Now</span>
                          <span>→</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Ask Sardar G Chatbot Tab */}
        {activeTab === "chatbot" && (
          <div className="card bg-white shadow-lg">
            <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-primary-100">
              <div>
                <h2 className="text-2xl font-bold text-text-900 mb-2 flex items-center gap-3">
                  <span className="text-4xl">🧑‍🌾</span>
                  <span>Ask Sardar G</span>
                </h2>
                <p className="text-sm text-text-600">
                  Your AI farming assistant - Ask anything about agriculture, crops, livestock, or farm management!
                </p>
              </div>
            </div>
            <ChatbotInterface />
          </div>
        )}

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

      {/* Edit Product Modal */}
      {showEditProductModal && selectedProduct && (
        <EditProductModal 
          product={selectedProduct}
          onClose={() => {
            setShowEditProductModal(false);
            setSelectedProduct(null);
          }}
          onSuccess={() => {
            fetchProducts(); // Refresh products list
            setShowEditProductModal(false);
            setSelectedProduct(null);
          }}
        />
      )}

      {/* Account Settings Modal */}
      {showAccountSettingsModal && (
        <AccountSettingsModal 
          isOpen={showAccountSettingsModal}
          onClose={() => setShowAccountSettingsModal(false)}
        />
      )}

      {/* Guide Modal */}
      {showGuideModal && (
        <GuideModal 
          isOpen={showGuideModal}
          onClose={() => setShowGuideModal(false)}
        />
      )}
    </div>
  );
}

// Chatbot Interface Component
function ChatbotInterface() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'bot'; text: string; timestamp: Date }>>([
    {
      role: 'bot',
      text: 'السلام علیکم! I am Sardar G, your AI farming assistant. 🌾\n\nYou can ask me about:\n• Crop selection and cultivation 🌱\n• Pest control and diseases 🐛\n• Irrigation and water management 💧\n• Fertilizers and soil health 🌿\n• Weather and seasons ☀️\n• Farm equipment and tools 🚜\n• Livestock management 🐄\n\nHow can I help you today?',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useState<HTMLDivElement | null>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: 'user' as const,
      text: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await apiRequest(API_ENDPOINTS.ASK_SARDAR_G, {
        method: 'POST',
        body: JSON.stringify({ question: inputMessage }),
      });

      const botMessage = {
        role: 'bot' as const,
        text: response.data.answer,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      console.error('Chatbot error:', error);
      const errorMessage = {
        role: 'bot' as const,
        text: `Sorry, I encountered an error: ${error.message}\n\nPlease try again or rephrase your question.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useState(() => {
    if (messagesEndRef[0]) {
      messagesEndRef[0].scrollIntoView({ behavior: 'smooth' });
    }
  });

  const suggestedQuestions = [
    "What's the best time to plant wheat in Pakistan?",
    "How can I control pests organically?",
    "What are the water requirements for cotton?",
    "Which fertilizer is best for rice crops?",
    "How to prepare soil for vegetables?",
  ];

  return (
    <div className="flex flex-col h-[600px]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-background-50 rounded-lg">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border-2 border-text-200 text-text-900'
              }`}
            >
              <div className="flex items-start gap-2 mb-2">
                <span className="text-2xl">
                  {message.role === 'user' ? '👤' : '🧑‍🌾'}
                </span>
                <span className="font-semibold text-sm">
                  {message.role === 'user' ? 'You' : 'Sardar G'}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
              <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-primary-100' : 'text-text-500'}`}>
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border-2 border-text-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🧑‍🌾</span>
                <span className="font-semibold text-sm text-text-900">Sardar G</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="animate-bounce text-2xl">💭</div>
                <span className="text-sm text-text-600">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={(el) => messagesEndRef[0] = el} />
      </div>

      {/* Suggested Questions */}
      {messages.length === 1 && (
        <div className="p-4 bg-background-100 rounded-lg mt-4">
          <p className="text-xs font-semibold text-text-700 mb-2 uppercase tracking-wider">
            💡 Suggested Questions
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(question)}
                className="text-xs px-3 py-2 bg-white border border-text-300 rounded-lg hover:bg-primary-50 hover:border-primary-500 transition-colors text-text-700"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask Sardar G anything about farming..."
          className="flex-1 input-field"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !inputMessage.trim()}
          className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="animate-spin">⏳</span>
              <span className="text-sm font-semibold">Sending...</span>
            </>
          ) : (
            <>
              <span className="text-xl">📤</span>
              <span className="text-sm font-semibold">Send</span>
            </>
          )}
        </button>
      </form>
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

// Edit Product Modal Component
function EditProductModal({ 
  product, 
  onClose, 
  onSuccess 
}: { 
  product: Product; 
  onClose: () => void; 
  onSuccess?: () => void;
}) {
  const [formData, setFormData] = useState({
    title: product.title,
    description: product.description,
    price: product.price.toString(),
    condition: product.condition,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('✏️ Updating product:', product._id);
      console.log('📝 Form data:', formData);

      const response = await apiRequest(`${API_ENDPOINTS.PRODUCTS}/update/${product._id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          condition: formData.condition,
        }),
      });

      console.log('✅ Product updated successfully!', response);
      setSuccess(true);

      // Close modal and refresh products after 1.5 seconds
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          onClose();
        }
      }, 1500);
    } catch (err: any) {
      console.error('❌ Product update error:', err);
      setError(err.message || 'Failed to update product');
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
              <div className="text-3xl">✏️</div>
              <h2 className="text-2xl font-bold text-text-900">Edit Product</h2>
            </div>
            <p className="text-sm text-text-600">Update your product information</p>
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
                  <h3 className="font-bold text-primary-900 text-lg mb-1">Product Updated Successfully!</h3>
                  <p className="text-sm text-primary-800">Your product information has been updated.</p>
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
              <label htmlFor="edit-title" className="label-field">
                🥕 PRODUCT TITLE
              </label>
              <input
                id="edit-title"
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
              <label htmlFor="edit-description" className="label-field">
                🥬 DESCRIPTION
              </label>
              <textarea
                id="edit-description"
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
                <label htmlFor="edit-price" className="label-field">
                  🥕 PRICE (Rs per kg)
                </label>
                <input
                  id="edit-price"
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
                <label htmlFor="edit-condition" className="label-field">
                  🌶️ CONDITION
                </label>
                <select
                  id="edit-condition"
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

            {/* Current Images Display */}
            {product.images && product.images.length > 0 && (
              <div>
                <label className="label-field">
                  🖼️ CURRENT IMAGES
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {product.images.map((image, index) => (
                    <div key={index} className="relative aspect-square">
                      <img 
                        src={image} 
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg border-2 border-text-200"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-text-500 mt-2 flex items-start gap-2">
                  <span>💡</span>
                  <span>Image update functionality coming soon. Contact support to update product images.</span>
                </p>
              </div>
            )}

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
                    <span>Updating Product...</span>
                  </>
                ) : (
                  <>
                    <span>Update Product</span>
                    <span className="text-xl">✅</span>
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

// Account Settings Modal Component
function AccountSettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [activeSection, setActiveSection] = useState<'profile' | 'password'>('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Profile update form state
  const [profileData, setProfileData] = useState({
    username: '',
    phoneno: '',
    region: '',
    currentPassword: '',
  });

  // Password change form state
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Load current user data
  useEffect(() => {
    if (isOpen) {
      const username = localStorage.getItem('username') || '';
      const phoneno = localStorage.getItem('phoneno') || '';
      const region = localStorage.getItem('region') || '';
      setProfileData(prev => ({ ...prev, username, phoneno, region }));
    }
  }, [isOpen]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!profileData.username || !profileData.phoneno || !profileData.region) {
      setError('All profile fields are required');
      return;
    }

    if (!profileData.currentPassword) {
      setError('Please enter your current password to update profile');
      return;
    }

    setLoading(true);

    try {
      // Update profile with password verification
      const response = await apiRequest(API_ENDPOINTS.UPDATE_ACCOUNT, {
        method: 'PATCH',
        body: JSON.stringify({
          username: profileData.username,
          phonenotochange: profileData.phoneno,
          region: profileData.region,
          currentPassword: profileData.currentPassword,
        }),
      });

      // Update localStorage
      localStorage.setItem('username', profileData.username);
      localStorage.setItem('phoneno', profileData.phoneno);
      localStorage.setItem('region', profileData.region);

      setSuccess('Profile updated successfully!');
      setProfileData(prev => ({ ...prev, currentPassword: '' }));
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      setError(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('All password fields are required');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    if (passwordData.oldPassword === passwordData.newPassword) {
      setError('New password must be different from old password');
      return;
    }

    setLoading(true);

    try {
      const response = await apiRequest(API_ENDPOINTS.CHANGE_PASSWORD, {
        method: 'POST',
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      setSuccess('Password changed successfully!');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      setError(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-900 flex items-center gap-2">
              <span>⚙️</span>
              <span>Account Settings</span>
            </h2>
            <button
              onClick={onClose}
              className="text-text-600 hover:text-text-900 transition-colors text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-border-200">
            <button
              onClick={() => {
                setActiveSection('profile');
                setError(null);
                setSuccess(null);
              }}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeSection === 'profile'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-text-600 hover:text-text-900'
              }`}
            >
              👤 Profile Information
            </button>
            <button
              onClick={() => {
                setActiveSection('password');
                setError(null);
                setSuccess(null);
              }}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeSection === 'password'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-text-600 hover:text-text-900'
              }`}
            >
              🔐 Change Password
            </button>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {success}
            </div>
          )}

          {/* Profile Update Section */}
          {activeSection === 'profile' && (
            <form onSubmit={handleProfileUpdate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-text-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={profileData.username}
                    onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                    className="input-field"
                    placeholder="Enter your username"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.phoneno}
                    onChange={(e) => setProfileData({ ...profileData, phoneno: e.target.value })}
                    className="input-field"
                    placeholder="Enter your phone number"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-700 mb-2">
                    Region
                  </label>
                  <select
                    value={profileData.region}
                    onChange={(e) => setProfileData({ ...profileData, region: e.target.value })}
                    className="input-field"
                    disabled={loading}
                  >
                    <option value="">Select your region</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Sindh">Sindh</option>
                    <option value="KPK">Khyber Pakhtunkhwa</option>
                    <option value="Balochistan">Balochistan</option>
                    <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                    <option value="AJK">Azad Jammu & Kashmir</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-border-200">
                  <label className="block text-sm font-semibold text-text-700 mb-2">
                    Current Password *
                  </label>
                  <input
                    type="password"
                    value={profileData.currentPassword}
                    onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                    className="input-field"
                    placeholder="Enter your current password to confirm changes"
                    disabled={loading}
                  />
                  <p className="text-xs text-text-500 mt-1">
                    Required to verify it's you making these changes
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-outline flex-1"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <span>Update Profile</span>
                      <span>✅</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Password Change Section */}
          {activeSection === 'password' && (
            <form onSubmit={handlePasswordChange}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-text-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.oldPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                    className="input-field"
                    placeholder="Enter your current password"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="input-field"
                    placeholder="Enter your new password (min 6 characters)"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="input-field"
                    placeholder="Confirm your new password"
                    disabled={loading}
                  />
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Password Requirements:</strong>
                  </p>
                  <ul className="text-xs text-blue-600 mt-1 space-y-1 list-disc list-inside">
                    <li>At least 6 characters long</li>
                    <li>Must be different from your current password</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-outline flex-1"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Changing...</span>
                    </>
                  ) : (
                    <>
                      <span>Change Password</span>
                      <span>🔒</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// Guide Modal Component
function GuideModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [activeGuideSection, setActiveGuideSection] = useState<'getting-started' | 'products' | 'orders' | 'tools' | 'faq'>('getting-started');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4 border-b border-border-200">
            <h2 className="text-2xl font-bold text-text-900 flex items-center gap-2">
              <span>📖</span>
              <span>FreshHarvest User Guide</span>
            </h2>
            <button
              onClick={onClose}
              className="text-text-600 hover:text-text-900 transition-colors text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mb-6 border-b border-border-200 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveGuideSection('getting-started')}
              className={`px-4 py-2 font-semibold whitespace-nowrap transition-colors ${
                activeGuideSection === 'getting-started'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-text-600 hover:text-text-900'
              }`}
            >
              🚀 Getting Started
            </button>
            <button
              onClick={() => setActiveGuideSection('products')}
              className={`px-4 py-2 font-semibold whitespace-nowrap transition-colors ${
                activeGuideSection === 'products'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-text-600 hover:text-text-900'
              }`}
            >
              🥕 Managing Products
            </button>
            <button
              onClick={() => setActiveGuideSection('orders')}
              className={`px-4 py-2 font-semibold whitespace-nowrap transition-colors ${
                activeGuideSection === 'orders'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-text-600 hover:text-text-900'
              }`}
            >
              📦 Orders & Sales
            </button>
            <button
              onClick={() => setActiveGuideSection('tools')}
              className={`px-4 py-2 font-semibold whitespace-nowrap transition-colors ${
                activeGuideSection === 'tools'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-text-600 hover:text-text-900'
              }`}
            >
              🛠️ Tools & Features
            </button>
            <button
              onClick={() => setActiveGuideSection('faq')}
              className={`px-4 py-2 font-semibold whitespace-nowrap transition-colors ${
                activeGuideSection === 'faq'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-text-600 hover:text-text-900'
              }`}
            >
              ❓ FAQ
            </button>
          </div>

          {/* Content Sections */}
          <div className="space-y-6">
            {/* Getting Started */}
            {activeGuideSection === 'getting-started' && (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="text-lg font-bold text-green-900 mb-2 flex items-center gap-2">
                    <span>👋</span>
                    <span>Welcome to FreshHarvest!</span>
                  </h3>
                  <p className="text-green-700">
                    FreshHarvest connects farmers directly with buyers, eliminating middlemen and ensuring fair prices for your produce.
                  </p>
                </div>

                <div className="card bg-white border border-border-200">
                  <h4 className="font-bold text-text-900 mb-3 flex items-center gap-2">
                    <span>📋</span>
                    <span>Dashboard Overview</span>
                  </h4>
                  <ul className="space-y-2 text-text-700">
                    <li className="flex gap-2">
                      <span>•</span>
                      <span><strong>Overview Tab:</strong> View your sales statistics, recent activity, and quick actions</span>
                    </li>
                    <li className="flex gap-2">
                      <span>•</span>
                      <span><strong>Products Tab:</strong> Manage all your listed products, add new items, or edit existing ones</span>
                    </li>
                    <li className="flex gap-2">
                      <span>•</span>
                      <span><strong>Orders Tab:</strong> Track customer orders and manage fulfillment</span>
                    </li>
                    <li className="flex gap-2">
                      <span>•</span>
                      <span><strong>Tools Tab:</strong> Access useful farming tools and calculators</span>
                    </li>
                    <li className="flex gap-2">
                      <span>•</span>
                      <span><strong>Ask Sardar G:</strong> Get instant farming advice from our AI assistant</span>
                    </li>
                  </ul>
                </div>

                <div className="card bg-blue-50 border border-blue-200">
                  <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <span>💡</span>
                    <span>Quick Tips</span>
                  </h4>
                  <ul className="space-y-2 text-blue-700">
                    <li className="flex gap-2">
                      <span>✓</span>
                      <span>Keep your product listings updated with current prices and availability</span>
                    </li>
                    <li className="flex gap-2">
                      <span>✓</span>
                      <span>Use high-quality images to attract more buyers</span>
                    </li>
                    <li className="flex gap-2">
                      <span>✓</span>
                      <span>Respond promptly to customer inquiries</span>
                    </li>
                    <li className="flex gap-2">
                      <span>✓</span>
                      <span>Report crop waste to help connect with waste management centers</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Products Management */}
            {activeGuideSection === 'products' && (
              <div className="space-y-4">
                <div className="card bg-white border border-border-200">
                  <h4 className="font-bold text-text-900 mb-3 flex items-center gap-2">
                    <span>➕</span>
                    <span>Adding a New Product</span>
                  </h4>
                  <ol className="space-y-3 text-text-700">
                    <li className="flex gap-2">
                      <span className="font-bold">1.</span>
                      <div>
                        <strong>Click "Add New Product"</strong> button in Quick Actions or Products tab
                      </div>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold">2.</span>
                      <div>
                        <strong>Fill in product details:</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          <li>• Product title (e.g., "Fresh Tomatoes")</li>
                          <li>• Description with details about quality, harvest date</li>
                          <li>• Price per unit (PKR)</li>
                          <li>• Category and condition</li>
                        </ul>
                      </div>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold">3.</span>
                      <div>
                        <strong>Upload images</strong> - Add clear photos showing your produce
                      </div>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold">4.</span>
                      <div>
                        <strong>Submit</strong> - Your product will be listed on the marketplace
                      </div>
                    </li>
                  </ol>
                </div>

                <div className="card bg-white border border-border-200">
                  <h4 className="font-bold text-text-900 mb-3 flex items-center gap-2">
                    <span>✏️</span>
                    <span>Editing Products</span>
                  </h4>
                  <p className="text-text-700 mb-2">
                    To update product information:
                  </p>
                  <ul className="space-y-2 text-text-700">
                    <li className="flex gap-2">
                      <span>•</span>
                      <span>Go to the <strong>Products</strong> tab</span>
                    </li>
                    <li className="flex gap-2">
                      <span>•</span>
                      <span>Click the <strong>✏️ Edit</strong> button on any product card</span>
                    </li>
                    <li className="flex gap-2">
                      <span>•</span>
                      <span>Update the necessary fields</span>
                    </li>
                    <li className="flex gap-2">
                      <span>•</span>
                      <span>Save changes</span>
                    </li>
                  </ul>
                </div>

                <div className="card bg-yellow-50 border border-yellow-200">
                  <h4 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>Product Best Practices</span>
                  </h4>
                  <ul className="space-y-2 text-yellow-700">
                    <li className="flex gap-2">
                      <span>✓</span>
                      <span>Use descriptive titles that include variety and quality</span>
                    </li>
                    <li className="flex gap-2">
                      <span>✓</span>
                      <span>Set competitive prices based on market rates</span>
                    </li>
                    <li className="flex gap-2">
                      <span>✓</span>
                      <span>Update availability regularly to avoid disappointing buyers</span>
                    </li>
                    <li className="flex gap-2">
                      <span>✓</span>
                      <span>Include harvest date and freshness information</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Orders & Sales */}
            {activeGuideSection === 'orders' && (
              <div className="space-y-4">
                <div className="card bg-white border border-border-200">
                  <h4 className="font-bold text-text-900 mb-3 flex items-center gap-2">
                    <span>📦</span>
                    <span>Managing Orders</span>
                  </h4>
                  <p className="text-text-700 mb-3">
                    When a buyer purchases your products, you'll receive an order notification. Here's how to manage it:
                  </p>
                  <ol className="space-y-3 text-text-700">
                    <li className="flex gap-2">
                      <span className="font-bold">1.</span>
                      <div>
                        <strong>View Order Details</strong> - Check the Orders tab to see buyer information and items
                      </div>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold">2.</span>
                      <div>
                        <strong>Prepare Products</strong> - Package items carefully for delivery
                      </div>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold">3.</span>
                      <div>
                        <strong>Update Order Status</strong> - Mark as processing, then completed
                      </div>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold">4.</span>
                      <div>
                        <strong>Coordinate Delivery</strong> - Contact buyer for pickup or delivery arrangements
                      </div>
                    </li>
                  </ol>
                </div>

                <div className="card bg-white border border-border-200">
                  <h4 className="font-bold text-text-900 mb-3 flex items-center gap-2">
                    <span>💰</span>
                    <span>Payment & Earnings</span>
                  </h4>
                  <ul className="space-y-2 text-text-700">
                    <li className="flex gap-2">
                      <span>•</span>
                      <span>Payments are processed securely through our platform</span>
                    </li>
                    <li className="flex gap-2">
                      <span>•</span>
                      <span>Track your earnings in the Overview tab</span>
                    </li>
                    <li className="flex gap-2">
                      <span>•</span>
                      <span>View transaction history and sales reports</span>
                    </li>
                    <li className="flex gap-2">
                      <span>•</span>
                      <span>Earnings are transferred to your registered account</span>
                    </li>
                  </ul>
                </div>

                <div className="card bg-green-50 border border-green-200">
                  <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                    <span>⭐</span>
                    <span>Building Your Reputation</span>
                  </h4>
                  <ul className="space-y-2 text-green-700">
                    <li className="flex gap-2">
                      <span>✓</span>
                      <span>Deliver quality products consistently</span>
                    </li>
                    <li className="flex gap-2">
                      <span>✓</span>
                      <span>Fulfill orders promptly</span>
                    </li>
                    <li className="flex gap-2">
                      <span>✓</span>
                      <span>Maintain good communication with buyers</span>
                    </li>
                    <li className="flex gap-2">
                      <span>✓</span>
                      <span>Handle issues professionally</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Tools & Features */}
            {activeGuideSection === 'tools' && (
              <div className="space-y-4">
                <div className="card bg-white border border-border-200">
                  <h4 className="font-bold text-text-900 mb-3 flex items-center gap-2">
                    <span>🤖</span>
                    <span>Ask Sardar G - AI Assistant</span>
                  </h4>
                  <p className="text-text-700 mb-3">
                    Get instant answers to your farming questions from our AI agricultural expert!
                  </p>
                  <ul className="space-y-2 text-text-700">
                    <li className="flex gap-2">
                      <span>•</span>
                      <span>Click the "Ask Sardar G" tab in your dashboard</span>
                    </li>
                    <li className="flex gap-2">
                      <span>•</span>
                      <span>Ask questions about crops, pests, diseases, weather, or best practices</span>
                    </li>
                    <li className="flex gap-2">
                      <span>•</span>
                      <span>Get instant, expert advice tailored for Pakistani farmers</span>
                    </li>
                    <li className="flex gap-2">
                      <span>•</span>
                      <span>Available 24/7 in English and Urdu</span>
                    </li>
                  </ul>
                </div>

                <div className="card bg-white border border-border-200">
                  <h4 className="font-bold text-text-900 mb-3 flex items-center gap-2">
                    <span>♻️</span>
                    <span>Crop Waste Reporting</span>
                  </h4>
                  <p className="text-text-700 mb-3">
                    Turn your crop waste into value by connecting with waste management centers:
                  </p>
                  <ul className="space-y-2 text-text-700">
                    <li className="flex gap-2">
                      <span>•</span>
                      <span>Report crop waste through the "Report Crop Waste" button</span>
                    </li>
                    <li className="flex gap-2">
                      <span>•</span>
                      <span>Get matched with nearby waste centers</span>
                    </li>
                    <li className="flex gap-2">
                      <span>•</span>
                      <span>Convert waste into compost, animal feed, or biofuel</span>
                    </li>
                    <li className="flex gap-2">
                      <span>•</span>
                      <span>Earn extra income while helping the environment</span>
                    </li>
                  </ul>
                </div>

                <div className="card bg-white border border-border-200">
                  <h4 className="font-bold text-text-900 mb-3 flex items-center gap-2">
                    <span>⚙️</span>
                    <span>Account Settings</span>
                  </h4>
                  <p className="text-text-700 mb-3">
                    Manage your account securely:
                  </p>
                  <ul className="space-y-2 text-text-700">
                    <li className="flex gap-2">
                      <span>•</span>
                      <span><strong>Profile Information:</strong> Update your name, phone number, and region</span>
                    </li>
                    <li className="flex gap-2">
                      <span>•</span>
                      <span><strong>Change Password:</strong> Update your password for security</span>
                    </li>
                    <li className="flex gap-2">
                      <span>•</span>
                      <span>All changes require your current password for verification</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* FAQ */}
            {activeGuideSection === 'faq' && (
              <div className="space-y-4">
                <div className="card bg-white border border-border-200">
                  <h4 className="font-bold text-text-900 mb-2 flex items-center gap-2">
                    <span>❓</span>
                    <span>How do I delete a product?</span>
                  </h4>
                  <p className="text-text-700">
                    Go to the Products tab, find the product you want to remove, and click the "🗑️ Delete" button. You'll be asked to confirm before the product is permanently removed.
                  </p>
                </div>

                <div className="card bg-white border border-border-200">
                  <h4 className="font-bold text-text-900 mb-2 flex items-center gap-2">
                    <span>❓</span>
                    <span>Can I change product images after listing?</span>
                  </h4>
                  <p className="text-text-700">
                    Currently, image updates need to be done through customer support. Contact our support team through the "💬 Contact Support" button to request image changes.
                  </p>
                </div>

                <div className="card bg-white border border-border-200">
                  <h4 className="font-bold text-text-900 mb-2 flex items-center gap-2">
                    <span>❓</span>
                    <span>How do buyers contact me?</span>
                  </h4>
                  <p className="text-text-700">
                    Buyers can see your contact information through the platform. Make sure your phone number is up to date in Account Settings so buyers can reach you for order coordination.
                  </p>
                </div>

                <div className="card bg-white border border-border-200">
                  <h4 className="font-bold text-text-900 mb-2 flex items-center gap-2">
                    <span>❓</span>
                    <span>What should I do if I can't fulfill an order?</span>
                  </h4>
                  <p className="text-text-700">
                    Contact the buyer immediately through the phone number provided in the order details. Explain the situation and work out a solution. Then contact our support team for assistance.
                  </p>
                </div>

                <div className="card bg-white border border-border-200">
                  <h4 className="font-bold text-text-900 mb-2 flex items-center gap-2">
                    <span>❓</span>
                    <span>Is my information secure?</span>
                  </h4>
                  <p className="text-text-700">
                    Yes! We use industry-standard encryption and security measures to protect your data. Your password is encrypted, and we never share your personal information without your consent. Read our Privacy Policy for more details.
                  </p>
                </div>

                <div className="card bg-white border border-border-200">
                  <h4 className="font-bold text-text-900 mb-2 flex items-center gap-2">
                    <span>❓</span>
                    <span>How do I get more help?</span>
                  </h4>
                  <p className="text-text-700">
                    You can:
                  </p>
                  <ul className="mt-2 space-y-1 text-text-700 ml-4">
                    <li>• Click "💬 Contact Support" for direct assistance</li>
                    <li>• Use "Ask Sardar G" for farming-related questions</li>
                    <li>• Check our website for additional resources</li>
                    <li>• Email us at support@freshharvest.pk</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-border-200 text-center">
            <p className="text-sm text-text-600">
              Need more help? Click <strong>💬 Contact Support</strong> in Quick Actions
            </p>
            <button
              onClick={onClose}
              className="btn-primary mt-4 px-6"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}




