import type { Route } from "./+types/admin-dashboard";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { API_ENDPOINTS, apiRequest } from "../config/api";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Admin Dashboard - FreshHarvest" },
    { name: "description", content: "Admin control panel for FreshHarvest" },
  ];
}

type User = {
  _id: string;
  username: string;
  email: string;
  phoneno: string;
  role: string;
  createdAt: string;
};

type Order = {
  _id: string;
  buyerId: string;
  products: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: string;
  createdAt: string;
};

type WasteCenter = {
  _id: string;
  name: string;
  address: string;
  city?: string;
  division?: string;
  country?: string;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  contactNumber: string;
  acceptedCropTypes: string[];
  currentCapacity: number;
  maxCapacity: number;
  createdAt: string;
};

type WasteReport = {
  _id: string;
  farmerId: {
    _id: string;
    username: string;
    email: string;
    phoneno: string;
  };
  cropTypes: string[];
  quantity: number;
  location: {
    type: string;
    coordinates: [number, number];
  };
  status: string;
  assignedCenter?: {
    _id: string;
    name: string;
    city: string;
  };
  preferredCenter?: {
    _id: string;
    name: string;
    city: string;
  };
  createdAt: string;
  updatedAt: string;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "orders" | "waste-centers" | "waste-reports">("overview");
  
  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wasteCenters, setWasteCenters] = useState<WasteCenter[]>([]);
  const [wasteReports, setWasteReports] = useState<WasteReport[]>([]);
  const [showAddCenterModal, setShowAddCenterModal] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // New waste center form
  const [newCenter, setNewCenter] = useState({
    name: "",
    address: "",
    city: "",
    division: "",
    country: "",
    latitude: "",
    longitude: "",
    contactNumber: "",
    acceptedCropTypes: [] as string[],
    maxCapacity: "",
  });
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [mapMarker, setMapMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  // Check admin authentication
  const [isAuthenticated] = useState(() => {
    return (
      typeof window !== "undefined" &&
      localStorage.getItem("isAuthenticated") === "true" &&
      localStorage.getItem("userRole") === "admin"
    );
  });

  const [username, setUsername] = useState(() => {
    return typeof window !== "undefined"
      ? localStorage.getItem("username") || "Admin"
      : "Admin";
  });

  // Redirect if not admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin-login");
    }
  }, [isAuthenticated, navigate]);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiRequest(`${API_ENDPOINTS.ADMIN}/users`, {
        method: "GET",
      });
      setUsers(response.data || []);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      setError(error.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiRequest(`${API_ENDPOINTS.ADMIN}/getorders`, {
        method: "GET",
      });
      setOrders(response.data || []);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      setError(error.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  // Fetch order stats
  const fetchStats = async () => {
    try {
      const [usersRes, ordersRes, statsRes] = await Promise.all([
        apiRequest(`${API_ENDPOINTS.ADMIN}/users`, { method: "GET" }),
        apiRequest(`${API_ENDPOINTS.ADMIN}/getorders`, { method: "GET" }),
        apiRequest(`${API_ENDPOINTS.ADMIN}/amount-stats`, { method: "GET" }),
      ]);

      const users = usersRes.data || [];
      const orders = ordersRes.data || [];
      const orderStats = statsRes.data || {};

      setStats({
        totalUsers: users.length,
        totalOrders: orders.length,
        pendingOrders: orders.filter((o: Order) => o.status === "pending").length,
      });
    } catch (error: any) {
      console.error("Error fetching stats:", error);
    }
  };

  // Load data when tab changes
  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === "overview") {
        fetchStats();
      } else if (activeTab === "users") {
        fetchUsers();
      } else if (activeTab === "orders") {
        fetchOrders();
      } else if (activeTab === "waste-centers") {
        fetchWasteCenters();
      } else if (activeTab === "waste-reports") {
        fetchWasteReports();
      }
    }
  }, [activeTab, isAuthenticated]);

  const handleLogout = async () => {
    try {
      await apiRequest(API_ENDPOINTS.LOGOUT, {
        method: "POST",
      });
      localStorage.clear();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.clear();
      window.location.href = "/";
    }
  };

  // Fetch all waste centers
  const fetchWasteCenters = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiRequest(`${API_ENDPOINTS.TOOLS}/waste/centers`, {
        method: "GET",
      });
      setWasteCenters(response.data.centers || []);
    } catch (error: any) {
      console.error("Error fetching waste centers:", error);
      setError(error.message || "Failed to fetch waste centers");
    } finally {
      setLoading(false);
    }
  };

  const fetchWasteReports = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiRequest(`${API_ENDPOINTS.TOOLS}/waste/reports`, {
        method: "GET",
      });
      console.log('Waste reports response:', response);
      setWasteReports(response.data.reports || []);
    } catch (error: any) {
      console.error("Error fetching waste reports:", error);
      setError(error.message || "Failed to fetch waste reports");
    } finally {
      setLoading(false);
    }
  };

  const handleAddWasteCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError("");
      
      const centerData = {
        name: newCenter.name,
        address: newCenter.address,
        city: newCenter.city,
        division: newCenter.division,
        country: newCenter.country,
        latitude: parseFloat(newCenter.latitude),
        longitude: parseFloat(newCenter.longitude),
        contactNumber: newCenter.contactNumber,
        acceptedCropTypes: newCenter.acceptedCropTypes,
        maxCapacity: parseFloat(newCenter.maxCapacity),
      };

      const response = await apiRequest(`${API_ENDPOINTS.TOOLS}/waste/center`, {
        method: "POST",
        body: JSON.stringify(centerData),
      });
      
      // Add the new center to the list
      if (response.data) {
        setWasteCenters([response.data, ...wasteCenters]);
      }
      
      // Reset form
      setNewCenter({
        name: "",
        address: "",
        city: "",
        division: "",
        country: "",
        latitude: "",
        longitude: "",
        contactNumber: "",
        acceptedCropTypes: [],
        maxCapacity: "",
      });
      setMapMarker(null);
      setShowAddCenterModal(false);
      alert("Waste center added successfully!");
    } catch (error: any) {
      console.error("Error adding waste center:", error);
      setError(error.message || "Failed to add waste center");
      alert(error.message || "Failed to add waste center");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      await apiRequest(`${API_ENDPOINTS.ADMIN}/users/${userId}/force-delete`, {
        method: "DELETE",
      });
      
      // Update local state to remove the deleted user
      setUsers(users.filter((user) => user._id !== userId));
      
      // Show success message
      alert("User deleted successfully!");
      
      // Refresh stats
      fetchStats();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      setError(error.message || "Failed to delete user");
      alert(error.message || "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      await apiRequest(`${API_ENDPOINTS.ADMIN}/FCO/${orderId}/cancel`, {
        method: "PATCH",
      });
      
      // Update local state to reflect the cancelled order
      setOrders(
        orders.map((order) =>
          order._id === orderId ? { ...order, status: "cancelled" } : order
        )
      );
      
      // Show success message
      alert("Order cancelled successfully!");
      
      // Refresh stats
      fetchStats();
    } catch (error: any) {
      console.error("Error cancelling order:", error);
      setError(error.message || "Failed to cancel order");
      alert(error.message || "Failed to cancel order");
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search term and role
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.phoneno.includes(userSearchTerm);
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleDeleteWasteCenter = async (centerId: string) => {
    if (!window.confirm("Are you sure you want to delete this waste center?")) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      await apiRequest(`${API_ENDPOINTS.TOOLS}/waste/center/${centerId}`, {
        method: "DELETE",
      });
      
      // Remove from local state
      setWasteCenters(wasteCenters.filter((center) => center._id !== centerId));
      alert("Waste center deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting waste center:", error);
      setError(error.message || "Failed to delete waste center");
      alert(error.message || "Failed to delete waste center");
    } finally {
      setLoading(false);
    }
  };

  // Reverse geocode to get address details from coordinates
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      setIsLoadingAddress(true);
      setError("");
      
      // Try Nominatim with proper headers
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18`,
          {
            headers: {
              'Accept': 'application/json',
              'Accept-Language': 'en',
            },
            mode: 'cors',
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && !data.error) {
          const address = data.address || {};
          const displayName = data.display_name || "";
          
          setNewCenter({
            ...newCenter,
            latitude: lat.toString(),
            longitude: lng.toString(),
            address: displayName,
            city: address.city || address.town || address.village || address.municipality || "",
            division: address.state || address.province || address.region || address.state_district || "",
            country: address.country || "",
          });
          return; // Success, exit function
        }
      } catch (nominatimError) {
        console.warn("Nominatim failed, trying alternative method:", nominatimError);
      }
      
      // Fallback: Use BigDataCloud (free, no API key required)
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
          {
            headers: {
              'Accept': 'application/json',
            },
            mode: 'cors',
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data) {
          // Construct address from available data
          const addressParts = [
            data.locality,
            data.city,
            data.principalSubdivision,
            data.countryName
          ].filter(Boolean);
          
          setNewCenter({
            ...newCenter,
            latitude: lat.toString(),
            longitude: lng.toString(),
            address: addressParts.join(", ") || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            city: data.city || data.locality || "",
            division: data.principalSubdivision || "",
            country: data.countryName || "",
          });
          return; // Success
        }
      } catch (bigDataError) {
        console.warn("BigDataCloud failed:", bigDataError);
      }
      
      // If all APIs fail, just set coordinates
      setNewCenter({
        ...newCenter,
        latitude: lat.toString(),
        longitude: lng.toString(),
        address: `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        city: "",
        division: "",
        country: "",
      });
      
      setError("Could not fetch address automatically. Please enter address details manually.");
      
    } catch (error: any) {
      console.error("Error in reverse geocoding:", error);
      // Still set the coordinates even if geocoding fails
      setNewCenter({
        ...newCenter,
        latitude: lat.toString(),
        longitude: lng.toString(),
        address: `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        city: "",
        division: "",
        country: "",
      });
      setError("Address lookup failed. Please enter address details manually.");
    } finally {
      setIsLoadingAddress(false);
    }
  };

  // Handle map click
  const handleMapClick = (lat: number, lng: number) => {
    setMapMarker({ lat, lng });
    reverseGeocode(lat, lng);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background-50 pb-16">
      {/* Header Navigation */}
      <header
        className={`sticky top-0 z-50 bg-primary-700 shadow-lg transition-all duration-300 ${
          isScrolled ? "py-0" : ""
        }`}
      >
        <div className="container-page">
          <div
            className={`flex items-center justify-between transition-all duration-300 ${
              isScrolled ? "py-2" : "py-4"
            }`}
          >
            <Link
              to="/"
              className="flex items-center gap-3 hover:opacity-90 transition-opacity"
            >
              <div
                className={`flex items-center gap-1 transition-all duration-300 ${
                  isScrolled ? "text-xl" : "text-2xl"
                }`}
              >
                <span>👨‍💼</span>
                <span>🔐</span>
                <span>📊</span>
              </div>
              <h1
                className={`font-bold text-white transition-all duration-300 ${
                  isScrolled ? "text-xl" : "text-2xl"
                }`}
              >
                Admin Dashboard
              </h1>
            </Link>
            <nav className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                className={`bg-white/10 text-white hover:bg-white/20 rounded-lg font-semibold uppercase tracking-widest transition-all ${
                  isScrolled ? "text-[10px] px-3 py-1.5" : "text-xs px-4 py-2"
                }`}
              >
                🚪 LOGOUT
              </button>
            </nav>
          </div>
        </div>
      </header>

      <section className="container-page space-y-8 mt-8">
        {/* Page Header */}
        <header className="space-y-3">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary-700">
            <span>🔐</span>
            <span>Administration Panel</span>
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-text-900">
            Welcome, {username}!
          </h1>
          <p className="max-w-2xl text-sm md:text-base text-text-600">
            Manage users, orders, and system configurations from this central dashboard.
          </p>
        </header>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Total Users</p>
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
              </div>
              <div className="text-4xl opacity-80">👥</div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Total Orders</p>
                <p className="text-3xl font-bold">{stats.totalOrders}</p>
              </div>
              <div className="text-4xl opacity-80">📦</div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Pending Orders</p>
                <p className="text-3xl font-bold">{stats.pendingOrders}</p>
              </div>
              <div className="text-4xl opacity-80">⏳</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-text-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
              activeTab === "overview"
                ? "text-primary-700 border-b-2 border-primary-700"
                : "text-text-600 hover:text-primary-700"
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
              activeTab === "users"
                ? "text-primary-700 border-b-2 border-primary-700"
                : "text-text-600 hover:text-primary-700"
            }`}
          >
            👥 Users
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
              activeTab === "orders"
                ? "text-primary-700 border-b-2 border-primary-700"
                : "text-text-600 hover:text-primary-700"
            }`}
          >
            📦 Orders
          </button>
          <button
            onClick={() => setActiveTab("waste-centers")}
            className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
              activeTab === "waste-centers"
                ? "text-primary-700 border-b-2 border-primary-700"
                : "text-text-600 hover:text-primary-700"
            }`}
          >
            ♻️ Waste Centers
          </button>
          <button
            onClick={() => setActiveTab("waste-reports")}
            className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
              activeTab === "waste-reports"
                ? "text-primary-700 border-b-2 border-primary-700"
                : "text-text-600 hover:text-primary-700"
            }`}
          >
            📋 Waste Reports
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="card bg-white">
              <h2 className="text-2xl font-bold text-text-900 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab("users")}
                  className="btn-outline text-left p-4 flex items-center gap-3"
                >
                  <span className="text-3xl">👥</span>
                  <div>
                    <p className="font-bold">Manage Users</p>
                    <p className="text-xs text-text-600">
                      View and manage all users
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="btn-outline text-left p-4 flex items-center gap-3"
                >
                  <span className="text-3xl">📦</span>
                  <div>
                    <p className="font-bold">Manage Orders</p>
                    <p className="text-xs text-text-600">
                      View and cancel orders
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("waste-centers")}
                  className="btn-outline text-left p-4 flex items-center gap-3"
                >
                  <span className="text-3xl">♻️</span>
                  <div>
                    <p className="font-bold">Waste Centers</p>
                    <p className="text-xs text-text-600">
                      Manage collection centers
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <div className="card bg-white">
              <h2 className="text-2xl font-bold text-text-900 mb-4">
                Recent Activity
              </h2>
              <p className="text-text-600">
                No recent activities to display.
              </p>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="card bg-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-text-900">
                  All Users ({filteredUsers.length})
                </h2>
                <button
                  onClick={fetchUsers}
                  disabled={loading}
                  className="btn-outline text-sm"
                >
                  {loading ? "🔄 Loading..." : "🔄 Refresh"}
                </button>
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                  ⚠️ {error}
                </div>
              )}
              
              {/* Search and Filter */}
              <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="🔍 Search by username, email, or phone..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="sm:w-48">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="input-field"
                  >
                    <option value="all">All Roles</option>
                    <option value="buyer">Buyers</option>
                    <option value="seller">Sellers</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-text-200">
                      <th className="text-left py-3 px-4 font-semibold text-text-700">
                        Username
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-text-700">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-text-700">
                        Phone
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-text-700">
                        Role
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-text-700">
                        Joined
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-text-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-text-600">
                          <div className="flex items-center justify-center gap-2">
                            <span className="animate-spin">🔄</span>
                            <span>Loading users...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-text-600">
                          {users.length === 0
                            ? "No users found. Click refresh to load users."
                            : "No users match your search criteria."}
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user._id} className="border-b border-text-100">
                          <td className="py-3 px-4">{user.username}</td>
                          <td className="py-3 px-4">{user.email}</td>
                          <td className="py-3 px-4">{user.phoneno}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-bold ${
                                user.role === "admin"
                                  ? "bg-purple-100 text-purple-700"
                                  : user.role === "seller"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-text-600">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="text-red-600 hover:text-red-700 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={user.role === "admin" || loading}
                              title={user.role === "admin" ? "Cannot delete admin users" : "Delete user"}
                            >
                              {user.role === "admin" ? "🔒 Protected" : "🗑️ Delete"}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="card bg-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-text-900">
                  All Orders
                </h2>
                <button
                  onClick={fetchOrders}
                  disabled={loading}
                  className="btn-outline text-sm"
                >
                  {loading ? "🔄 Loading..." : "🔄 Refresh"}
                </button>
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                  ⚠️ {error}
                </div>
              )}
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-text-200">
                      <th className="text-left py-3 px-4 font-semibold text-text-700">
                        Order ID
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-text-700">
                        Buyer ID
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-text-700">
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-text-700">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-text-700">
                        Date
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-text-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-text-600">
                          <div className="flex items-center justify-center gap-2">
                            <span className="animate-spin">🔄</span>
                            <span>Loading orders...</span>
                          </div>
                        </td>
                      </tr>
                    ) : orders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-text-600">
                          No orders found. Click refresh to load orders.
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order._id} className="border-b border-text-100">
                          <td className="py-3 px-4 font-mono text-sm">
                            {order._id.substring(0, 8)}...
                          </td>
                          <td className="py-3 px-4 font-mono text-sm">
                            {order.buyerId.substring(0, 8)}...
                          </td>
                          <td className="py-3 px-4 font-bold text-primary-700">
                            ₹{order.totalAmount}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-bold ${
                                order.status === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : order.status === "processing"
                                  ? "bg-blue-100 text-blue-700"
                                  : order.status === "completed"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-text-600">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleCancelOrder(order._id)}
                              className="text-red-600 hover:text-red-700 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={
                                loading ||
                                order.status === "completed" ||
                                order.status === "cancelled"
                              }
                              title={
                                order.status === "completed" || order.status === "cancelled"
                                  ? "Cannot cancel this order"
                                  : "Cancel order"
                              }
                            >
                              {order.status === "completed" ||
                              order.status === "cancelled"
                                ? "🔒 Locked"
                                : "❌ Cancel"}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "waste-centers" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-text-900">
                Waste Collection Centers ({wasteCenters.length})
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={fetchWasteCenters}
                  disabled={loading}
                  className="btn-outline text-sm"
                >
                  {loading ? "🔄 Loading..." : "🔄 Refresh"}
                </button>
                <button
                  onClick={() => setShowAddCenterModal(true)}
                  className="btn-primary text-sm"
                >
                  ➕ Add Center
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                ⚠️ {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full card bg-white text-center py-12">
                  <div className="flex items-center justify-center gap-2">
                    <span className="animate-spin text-4xl">🔄</span>
                    <span className="text-text-600">Loading waste centers...</span>
                  </div>
                </div>
              ) : wasteCenters.length === 0 ? (
                <div className="col-span-full card bg-white text-center py-12">
                  <div className="text-5xl mb-4">♻️</div>
                  <h3 className="text-xl font-semibold text-text-900 mb-2">
                    No Waste Centers Added
                  </h3>
                  <p className="text-text-600 mb-4">
                    Click the button above to add your first waste collection center.
                  </p>
                </div>
              ) : (
                wasteCenters.map((center) => (
                  <div key={center._id} className="card bg-white hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-3xl">♻️</div>
                      <button
                        onClick={() => handleDeleteWasteCenter(center._id)}
                        className="text-red-600 hover:text-red-700 disabled:opacity-50"
                        disabled={loading}
                        title="Delete waste center"
                      >
                        🗑️
                      </button>
                    </div>
                    <h3 className="text-xl font-bold text-text-900 mb-2">
                      {center.name}
                    </h3>
                    <div className="space-y-2 text-sm text-text-600">
                      <p className="font-semibold text-primary-700">
                        📍 {center.city || "N/A"}, {center.division || "N/A"}
                      </p>
                      <p className="text-xs">{center.address}</p>
                      <p>📞 {center.contactNumber}</p>
                      <p>🌾 Accepts: {center.acceptedCropTypes.join(", ")}</p>
                      <p>📦 Capacity: {center.currentCapacity}/{center.maxCapacity} tons</p>
                      <p className="text-xs text-text-500">
                        📌 {center.location.coordinates[1].toFixed(4)}, {center.location.coordinates[0].toFixed(4)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Waste Reports Tab */}
        {activeTab === "waste-reports" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-text-900">
                Crop Waste Reports ({wasteReports.length})
              </h2>
              <button
                onClick={fetchWasteReports}
                disabled={loading}
                className="btn-outline text-sm"
              >
                {loading ? "🔄 Loading..." : "🔄 Refresh"}
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                ⚠️ {error}
              </div>
            )}

            {loading ? (
              <div className="card bg-white text-center py-12">
                <div className="flex items-center justify-center gap-2">
                  <span className="animate-spin text-4xl">🔄</span>
                  <span className="text-text-600">Loading waste reports...</span>
                </div>
              </div>
            ) : wasteReports.length === 0 ? (
              <div className="card bg-white text-center py-12">
                <div className="text-5xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-text-900 mb-2">
                  No Waste Reports Yet
                </h3>
                <p className="text-text-600">
                  Farmers haven't submitted any crop waste reports yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {wasteReports.map((report) => (
                  <div key={report._id} className="card bg-white hover:shadow-lg transition-shadow">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Report Header */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-text-900 mb-1">
                              Report #{report._id.slice(-8).toUpperCase()}
                            </h3>
                            <p className="text-sm text-text-600">
                              Submitted: {new Date(report.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase ${
                            report.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300' :
                            report.status === 'assigned' ? 'bg-blue-100 text-blue-800 border-2 border-blue-300' :
                            report.status === 'collected' ? 'bg-purple-100 text-purple-800 border-2 border-purple-300' :
                            'bg-green-100 text-green-800 border-2 border-green-300'
                          }`}>
                            {report.status}
                          </span>
                        </div>

                        {/* Farmer Info */}
                        <div className="bg-gradient-to-r from-primary-50 to-accent-50 border-2 border-primary-200 rounded-lg p-4">
                          <h4 className="font-bold text-primary-900 mb-2 flex items-center gap-2">
                            <span className="text-xl">👨‍🌾</span>
                            <span>Farmer Details</span>
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <p><strong>Name:</strong> {report.farmerId.username}</p>
                            <p><strong>Email:</strong> {report.farmerId.email}</p>
                            <p><strong>Phone:</strong> {report.farmerId.phoneno}</p>
                            <p><strong>ID:</strong> {report.farmerId._id.slice(-8)}</p>
                          </div>
                        </div>

                        {/* Waste Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                            <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                              <span>🌾</span>
                              <span>Crop Types</span>
                            </h4>
                            <p className="text-sm text-green-800">
                              {report.cropTypes.join(", ")}
                            </p>
                          </div>
                          
                          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                            <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                              <span>⚖️</span>
                              <span>Quantity</span>
                            </h4>
                            <p className="text-2xl font-bold text-blue-800">
                              {report.quantity} kg
                            </p>
                          </div>
                        </div>

                        {/* Location */}
                        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                          <h4 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                            <span>📍</span>
                            <span>Location</span>
                          </h4>
                          <p className="text-sm text-purple-800 font-mono">
                            Lat: {report.location.coordinates[1].toFixed(6)}, 
                            Lng: {report.location.coordinates[0].toFixed(6)}
                          </p>
                          <a
                            href={`https://www.google.com/maps?q=${report.location.coordinates[1]},${report.location.coordinates[0]}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary-700 hover:text-primary-800 font-semibold mt-2 inline-block"
                          >
                            🗺️ View on Google Maps →
                          </a>
                        </div>

                        {/* Assigned/Preferred Center */}
                        {(report.assignedCenter || report.preferredCenter) && (
                          <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                            <h4 className="font-bold text-orange-900 mb-2 flex items-center gap-2">
                              <span>♻️</span>
                              <span>
                                {report.assignedCenter ? 'Assigned Center' : 'Preferred Center'}
                              </span>
                            </h4>
                            <p className="text-sm text-orange-800">
                              <strong>{(report.assignedCenter || report.preferredCenter)?.name}</strong>
                              <br />
                              {(report.assignedCenter || report.preferredCenter)?.city}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Add Waste Center Modal */}
      {showAddCenterModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header - Sticky */}
            <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-4 rounded-t-xl border-b-4 border-primary-800 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">♻️</span>
                  <div>
                    <h2 className="text-2xl font-bold">
                      Add Waste Collection Center
                    </h2>
                    <p className="text-sm text-primary-100 mt-1">
                      Configure a new waste collection facility
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAddCenterModal(false);
                    setIsSelectingLocation(false);
                    setMapMarker(null);
                  }}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors text-3xl font-bold"
                  title="Close"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">

            {!isSelectingLocation ? (
            <form onSubmit={handleAddWasteCenter} className="space-y-6">
              {/* Step Indicator */}
              <div className="bg-gradient-to-r from-primary-50 via-primary-100 to-accent-50 p-5 rounded-xl border-2 border-primary-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl ${mapMarker ? '' : 'animate-pulse'}`}>
                      {mapMarker ? '✅' : '📍'}
                    </span>
                    <span className={`text-sm font-bold ${mapMarker ? 'text-green-700' : 'text-primary-700'}`}>
                      {mapMarker ? 'Step 1: Location Selected' : 'Step 1: Select Location'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📝</span>
                    <span className="text-sm font-semibold text-text-600">
                      Step 2: Fill Details
                    </span>
                  </div>
                </div>
                <div className="w-full bg-white rounded-full h-3 shadow-inner">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${mapMarker ? 'bg-gradient-to-r from-green-500 to-green-600 w-1/2' : 'bg-gradient-to-r from-primary-500 to-primary-600 w-1/4'}`}
                  />
                </div>
                <p className="text-xs text-text-600 mt-2 text-center">
                  {mapMarker ? 'Great! Now fill in the waste center details below' : 'Click on "Select Location on Map" to begin'}
                </p>
              </div>

              {/* Center Name */}
              <div className="space-y-2">
                <label className="label-field flex items-center gap-2">
                  <span>♻️</span>
                  <span>Center Name *</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCenter.name}
                  onChange={(e) =>
                    setNewCenter({ ...newCenter, name: e.target.value })
                  }
                  className="input-field"
                  placeholder="e.g., Mumbai Waste Collection Center"
                />
              </div>

              {/* Location Selection */}
              <div className="space-y-2">
                <label className="label-field flex items-center gap-2">
                  <span>📍</span>
                  <span>Location *</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsSelectingLocation(true)}
                  className={`w-full p-5 rounded-xl border-2 transition-all shadow-sm hover:shadow-md ${
                    mapMarker 
                      ? 'border-green-400 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-150' 
                      : 'border-primary-400 bg-gradient-to-br from-primary-50 to-accent-50 hover:from-primary-100 hover:to-accent-100 border-dashed'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className={`text-4xl ${!mapMarker && 'animate-pulse'}`}>
                        {mapMarker ? '✅' : '🗺️'}
                      </span>
                      <div className="text-left">
                        {mapMarker ? (
                          <>
                            <p className="font-bold text-green-900 text-lg">Location Selected</p>
                            <p className="text-sm text-green-700 font-mono mt-1">
                              📌 {mapMarker.lat.toFixed(6)}, {mapMarker.lng.toFixed(6)}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-bold text-primary-900 text-lg">Select Location on Map</p>
                            <p className="text-sm text-primary-700 mt-1">Click to open location picker</p>
                          </>
                        )}
                      </div>
                    </div>
                    <span className="text-3xl">{mapMarker ? '✏️' : '→'}</span>
                  </div>
                </button>
                {isLoadingAddress && (
                  <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <span className="animate-spin text-xl">🔄</span>
                    <span className="font-semibold">Fetching address from coordinates...</span>
                  </div>
                )}
              </div>

              {/* Address Details (Auto-filled from map) */}
              {mapMarker && (
                <div className="bg-gradient-to-br from-blue-50 to-primary-50 border-2 border-blue-300 rounded-xl p-5 space-y-4 shadow-sm">
                  <div className="flex items-center gap-3 text-blue-900 mb-3">
                    <span className="text-2xl">📍</span>
                    <div>
                      <span className="font-bold text-lg">Address Details</span>
                      <p className="text-xs text-blue-700 mt-0.5">Auto-detected from map coordinates</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="label-field flex items-center gap-2">
                      <span>🏢</span>
                      <span>Full Address *</span>
                    </label>
                    <textarea
                      required
                      value={newCenter.address}
                      onChange={(e) =>
                        setNewCenter({ ...newCenter, address: e.target.value })
                      }
                      className="input-field bg-white"
                      rows={2}
                      placeholder="Full address will be auto-filled from map"
                    />
                    <p className="text-xs text-blue-700 mt-1 flex items-center gap-1">
                      <span>💡</span>
                      <span>You can edit the auto-detected address</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="label-field flex items-center gap-2">
                        <span>🏙️</span>
                        <span>City</span>
                      </label>
                      <input
                        type="text"
                        value={newCenter.city}
                        onChange={(e) =>
                          setNewCenter({ ...newCenter, city: e.target.value })
                        }
                        className="input-field bg-white"
                        placeholder="Auto-filled"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="label-field flex items-center gap-2">
                        <span>🗺️</span>
                        <span>State/Division</span>
                      </label>
                      <input
                        type="text"
                        value={newCenter.division}
                        onChange={(e) =>
                          setNewCenter({ ...newCenter, division: e.target.value })
                        }
                        className="input-field bg-white"
                        placeholder="Auto-filled"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="label-field flex items-center gap-2">
                        <span>🌍</span>
                        <span>Country</span>
                      </label>
                      <input
                        type="text"
                        value={newCenter.country}
                        onChange={(e) =>
                          setNewCenter({ ...newCenter, country: e.target.value })
                        }
                        className="input-field bg-white"
                        placeholder="Auto-filled"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Contact and Capacity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="label-field flex items-center gap-2">
                    <span>📞</span>
                    <span>Contact Number *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={newCenter.contactNumber}
                    onChange={(e) =>
                      setNewCenter({ ...newCenter, contactNumber: e.target.value })
                    }
                    className="input-field"
                    placeholder="+1234567890"
                  />
                  <p className="text-xs text-text-500 flex items-center gap-1">
                    <span>💡</span>
                    <span>Include country code for international numbers</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="label-field flex items-center gap-2">
                    <span>📦</span>
                    <span>Maximum Capacity (tons) *</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={newCenter.maxCapacity}
                    onChange={(e) =>
                      setNewCenter({ ...newCenter, maxCapacity: e.target.value })
                    }
                    className="input-field"
                    placeholder="e.g., 500"
                  />
                  <p className="text-xs text-text-500 flex items-center gap-1">
                    <span>💡</span>
                    <span>Total storage capacity in metric tons</span>
                  </p>
                </div>
              </div>

              {/* Crop Types Selection */}
              <div className="space-y-3">
                <label className="label-field flex items-center gap-2">
                  <span>🌾</span>
                  <span>Accepted Crop Types *</span>
                </label>
                <div className="bg-gradient-to-br from-background-50 to-primary-50/30 border-2 border-text-300 rounded-xl p-5 space-y-4 shadow-sm">
                  {/* Select All Option */}
                  <div className="border-b border-text-200 pb-3">
                    <label className="flex items-center gap-3 cursor-pointer hover:bg-primary-50 p-2 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={newCenter.acceptedCropTypes.includes("All")}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewCenter({ 
                              ...newCenter, 
                              acceptedCropTypes: ["All"]
                            });
                          } else {
                            setNewCenter({ 
                              ...newCenter, 
                              acceptedCropTypes: []
                            });
                          }
                        }}
                        className="w-5 h-5 text-primary-600 border-2 border-text-400 rounded focus:ring-2 focus:ring-primary-500"
                      />
                      <span className="flex items-center gap-2 font-semibold text-primary-700">
                        <span className="text-xl">🌾</span>
                        <span>All Crop Types</span>
                      </span>
                    </label>
                    <p className="text-xs text-text-600 mt-2 ml-10">
                      Select this if the center accepts all types of agricultural waste
                    </p>
                  </div>

                  {/* Individual Crop Types Grid */}
                  {!newCenter.acceptedCropTypes.includes("All") && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {[
                        { name: "Rice", emoji: "🌾" },
                        { name: "Wheat", emoji: "🌾" },
                        { name: "Corn", emoji: "🌽" },
                        { name: "Sugarcane", emoji: "🎋" },
                        { name: "Cotton", emoji: "🧺" },
                        { name: "Soybean", emoji: "🫘" },
                        { name: "Potato", emoji: "🥔" },
                        { name: "Tomato", emoji: "🍅" },
                        { name: "Onion", emoji: "🧅" },
                        { name: "Carrot", emoji: "🥕" },
                        { name: "Cabbage", emoji: "🥬" },
                        { name: "Lettuce", emoji: "🥬" },
                        { name: "Pepper", emoji: "🌶️" },
                        { name: "Cucumber", emoji: "🥒" },
                        { name: "Beans", emoji: "🫘" },
                        { name: "Peas", emoji: "🫛" },
                        { name: "Pumpkin", emoji: "🎃" },
                        { name: "Eggplant", emoji: "🍆" },
                        { name: "Other", emoji: "🌱" },
                      ].map((crop) => (
                        <label
                          key={crop.name}
                          className="flex items-center gap-2 cursor-pointer hover:bg-primary-50 p-2 rounded-lg transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={newCenter.acceptedCropTypes.includes(crop.name)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewCenter({
                                  ...newCenter,
                                  acceptedCropTypes: [...newCenter.acceptedCropTypes, crop.name]
                                });
                              } else {
                                setNewCenter({
                                  ...newCenter,
                                  acceptedCropTypes: newCenter.acceptedCropTypes.filter(t => t !== crop.name)
                                });
                              }
                            }}
                            className="w-4 h-4 text-primary-600 border-2 border-text-400 rounded focus:ring-2 focus:ring-primary-500"
                          />
                          <span className="text-sm text-text-800 flex items-center gap-1">
                            <span>{crop.emoji}</span>
                            <span>{crop.name}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Selection Summary */}
                  {newCenter.acceptedCropTypes.length > 0 && (
                    <div className="bg-gradient-to-r from-green-50 to-primary-50 border-2 border-green-300 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">✅</span>
                        <div className="flex-1">
                          <p className="text-sm text-green-900 font-bold mb-1">
                            Selected: {newCenter.acceptedCropTypes.length === 1 && newCenter.acceptedCropTypes[0] === "All" 
                              ? "All Crop Types" 
                              : `${newCenter.acceptedCropTypes.length} crop type${newCenter.acceptedCropTypes.length > 1 ? 's' : ''}`}
                          </p>
                          {newCenter.acceptedCropTypes[0] !== "All" && (
                            <p className="text-xs text-green-700 font-semibold">
                              {newCenter.acceptedCropTypes.join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {newCenter.acceptedCropTypes.length === 0 && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">⚠️</span>
                        <p className="text-sm text-yellow-900 font-semibold">
                          Please select at least one crop type
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Location Warning */}
              {!mapMarker && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-xl p-5 shadow-sm animate-pulse">
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">⚠️</span>
                    <div>
                      <p className="font-bold text-yellow-900 mb-2 text-lg">Location Required</p>
                      <p className="text-sm text-yellow-800">
                        Please select a location on the map before submitting the form. Click the "Select Location on Map" button above.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t-2 border-text-300">
                <button 
                  type="submit" 
                  className="btn-primary flex-1 py-4 text-base font-bold uppercase tracking-wide shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || !mapMarker || newCenter.acceptedCropTypes.length === 0}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <span className="animate-spin text-xl">⏳</span>
                      <span>Adding Center...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-3">
                      <span className="text-xl">✅</span>
                      <span>Add Waste Center</span>
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCenterModal(false);
                    setIsSelectingLocation(false);
                    setMapMarker(null);
                    setNewCenter({
                      name: "",
                      address: "",
                      city: "",
                      division: "",
                      country: "",
                      latitude: "",
                      longitude: "",
                      contactNumber: "",
                      acceptedCropTypes: [],
                      maxCapacity: "",
                    });
                  }}
                  className="btn-outline flex-1 py-4 text-base font-bold uppercase tracking-wide shadow hover:shadow-lg transition-all"
                  disabled={loading}
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>❌</span>
                    <span>Cancel</span>
                  </span>
                </button>
              </div>
            </form>
            ) : (
              /* Map Selection Interface */
              <div className="space-y-6">
                {/* Header Instructions */}
                <div className="bg-gradient-to-r from-blue-50 via-primary-50 to-accent-50 border-2 border-blue-300 rounded-xl p-5 shadow-md">
                  <div className="flex items-start gap-4">
                    <span className="text-4xl">📍</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-blue-900 mb-3 text-xl">How to Select Location</h3>
                      <ul className="text-sm text-blue-800 space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="font-bold min-w-[80px]">Option 1:</span>
                          <span>Click "Use My Current Location" to auto-detect your position</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold min-w-[80px]">Option 2:</span>
                          <span>Enter latitude and longitude manually in the fields below</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold min-w-[80px]">Option 3:</span>
                          <span>Find coordinates on Google Maps and paste them here</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Location Input Section */}
                <div className="bg-gradient-to-br from-white to-background-50 border-2 border-primary-300 rounded-xl p-8 shadow-lg">
                  <div className="text-center mb-8">
                    <div className="text-7xl mb-4 animate-bounce">🗺️</div>
                    <h3 className="text-3xl font-bold text-text-900 mb-3">
                      Select Waste Center Location
                    </h3>
                    <p className="text-text-600 text-lg">
                      Choose a method below to set the location coordinates
                    </p>
                  </div>
                  
                  <div className="max-w-3xl mx-auto space-y-6">
                    {/* Manual Coordinate Entry */}
                    <div className="bg-white border-2 border-text-300 rounded-xl p-6 shadow-sm space-y-4">
                      <label className="label-field text-center block text-lg flex items-center justify-center gap-2">
                        <span className="text-2xl">📌</span>
                        <span>Enter Coordinates Manually</span>
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="label-field text-sm flex items-center justify-center gap-2">
                            <span>🌐</span>
                            <span>Latitude *</span>
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={mapMarker?.lat || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              const lat = parseFloat(value);
                              if (value === "" || value === "-") {
                                setMapMarker(null);
                              } else if (!isNaN(lat)) {
                                const lng = mapMarker?.lng || 0;
                                setMapMarker({ lat, lng });
                              }
                            }}
                            className="input-field text-center text-xl font-mono font-bold bg-background-50"
                            placeholder="e.g., 24.8607"
                          />
                          <p className="text-xs text-text-500 mt-1 text-center font-semibold">Range: -90 to 90</p>
                        </div>
                        <div className="space-y-2">
                          <label className="label-field text-sm flex items-center justify-center gap-2">
                            <span>🌍</span>
                            <span>Longitude *</span>
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={mapMarker?.lng || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              const lng = parseFloat(value);
                              if (value === "" || value === "-") {
                                setMapMarker(mapMarker ? { ...mapMarker, lng: 0 } : null);
                              } else if (!isNaN(lng)) {
                                const lat = mapMarker?.lat || 0;
                                setMapMarker({ lat, lng });
                              }
                            }}
                            className="input-field text-center text-xl font-mono font-bold bg-background-50"
                            placeholder="e.g., 67.0011"
                          />
                          <p className="text-xs text-text-500 mt-1 text-center font-semibold">Range: -180 to 180</p>
                        </div>
                      </div>
                      
                      {mapMarker && mapMarker.lat !== 0 && mapMarker.lng !== 0 && (
                        <button
                          type="button"
                          onClick={() => reverseGeocode(mapMarker.lat, mapMarker.lng)}
                          disabled={isLoadingAddress}
                          className="btn-outline w-full py-3 text-base font-semibold shadow hover:shadow-md transition-all"
                        >
                          {isLoadingAddress ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="animate-spin text-xl">🔄</span>
                              <span>Fetching Address...</span>
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              <span className="text-xl">🔍</span>
                              <span>Get Address from Coordinates</span>
                            </span>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Error Display */}
                    {error && (
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-400 rounded-xl p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">⚠️</span>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-orange-900 mb-2">Address Lookup Issue</p>
                            <p className="text-xs text-orange-800 mb-2">{error}</p>
                            <p className="text-xs text-orange-700 font-semibold flex items-center gap-1">
                              <span>💡</span>
                              <span>Don't worry! You can manually enter the address details in the form.</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* OR Divider */}
                    <div className="relative py-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t-2 border-text-300"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="px-6 py-2 bg-gradient-to-r from-primary-100 to-accent-100 text-text-700 font-bold text-lg rounded-full border-2 border-text-300 shadow">
                          OR
                        </span>
                      </div>
                    </div>

                    {/* Auto-detect Location */}
                    <button
                      type="button"
                      onClick={() => {
                        if (navigator.geolocation) {
                          setIsLoadingAddress(true);
                          navigator.geolocation.getCurrentPosition(
                            (position) => {
                              handleMapClick(position.coords.latitude, position.coords.longitude);
                            },
                            (error) => {
                              setIsLoadingAddress(false);
                              alert("Unable to get your location. Please enable location services or enter coordinates manually.");
                              console.error("Geolocation error:", error);
                            },
                            {
                              enableHighAccuracy: true,
                              timeout: 10000,
                              maximumAge: 0
                            }
                          );
                        } else {
                          alert("Geolocation is not supported by your browser. Please enter coordinates manually.");
                        }
                      }}
                      disabled={isLoadingAddress}
                      className="btn-primary w-full py-5 text-lg font-bold uppercase tracking-wide shadow-lg hover:shadow-xl transition-all"
                    >
                      {isLoadingAddress ? (
                        <span className="flex items-center justify-center gap-3">
                          <span className="animate-spin text-2xl">⏳</span>
                          <span>Detecting Your Location...</span>
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-3">
                          <span className="text-2xl">📍</span>
                          <span>Use My Current Location</span>
                        </span>
                      )}
                    </button>

                    {/* Location Status Display */}
                    {mapMarker && mapMarker.lat !== 0 && mapMarker.lng !== 0 && (
                      <div className="mt-4 p-6 bg-gradient-to-br from-green-50 to-primary-50 border-2 border-green-400 rounded-xl shadow-md">
                        <div className="flex items-start gap-3">
                          <span className="text-3xl">✅</span>
                          <div className="flex-1">
                            <p className="font-bold text-green-900 mb-2">
                              {newCenter.address ? "Location & Address Detected!" : "Coordinates Set!"}
                            </p>
                            <div className="space-y-1 text-sm">
                              <p className="text-green-800">
                                <strong>Coordinates:</strong> {mapMarker.lat.toFixed(6)}, {mapMarker.lng.toFixed(6)}
                              </p>
                              {newCenter.address ? (
                                <>
                                  <p className="text-green-800">
                                    <strong>Address:</strong> {newCenter.address}
                                  </p>
                                  {(newCenter.city || newCenter.division || newCenter.country) && (
                                    <p className="text-green-800">
                                      <strong>Location:</strong> {[newCenter.city, newCenter.division, newCenter.country].filter(Boolean).join(", ")}
                                    </p>
                                  )}
                                </>
                              ) : !isLoadingAddress && (
                                <p className="text-orange-700 text-xs mt-1">
                                  ℹ️ Address not detected. You can enter it manually in the form, or click "Get Address from Coordinates" above.
                                </p>
                              )}
                            </div>
                            {isLoadingAddress && (
                              <div className="mt-2 flex items-center gap-2 text-xs text-green-700 bg-green-100 p-2 rounded">
                                <span className="animate-spin">🔄</span>
                                <span>Fetching address details from coordinates...</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Help Text */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <span className="text-xl">💡</span>
                        <div className="text-xs text-gray-700">
                          <p className="font-semibold mb-1">Tips for finding coordinates:</p>
                          <ul className="list-disc list-inside space-y-0.5">
                            <li>Open Google Maps, right-click on location → Click coordinates to copy</li>
                            <li>Use your browser's location feature for current position</li>
                            <li>Format: Latitude (North/South), Longitude (East/West)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 mt-6 border-t-2 border-text-300">
                  <button
                    type="button"
                    onClick={() => {
                      if (mapMarker && mapMarker.lat !== 0 && mapMarker.lng !== 0) {
                        setIsSelectingLocation(false);
                      } else {
                        alert("Please select a valid location before confirming.");
                      }
                    }}
                    disabled={!mapMarker || mapMarker.lat === 0 || mapMarker.lng === 0 || isLoadingAddress}
                    className="btn-primary flex-1 py-4 text-base font-bold uppercase tracking-wide shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="flex items-center justify-center gap-3">
                      <span className="text-xl">✅</span>
                      <span>Confirm Location & Continue</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSelectingLocation(false);
                      setMapMarker(null);
                      setNewCenter({
                        ...newCenter,
                        address: "",
                        city: "",
                        division: "",
                        country: "",
                        latitude: "",
                        longitude: "",
                      });
                    }}
                    disabled={isLoadingAddress}
                    className="btn-outline flex-1 py-4 text-base font-bold uppercase tracking-wide shadow hover:shadow-lg transition-all"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span className="text-xl">❌</span>
                      <span>Cancel</span>
                    </span>
                  </button>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
