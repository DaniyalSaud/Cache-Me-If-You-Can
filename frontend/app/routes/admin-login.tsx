import type { Route } from "./+types/admin-login";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { API_ENDPOINTS, apiRequest } from "../config/api";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Admin Login - FreshHarvest" },
    { name: "description", content: "Admin login portal for FreshHarvest" },
  ];
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phoneno: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await apiRequest(API_ENDPOINTS.LOGIN, {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (response.data && response.data.user) {
        const { user } = response.data;

        // Check if user is admin
        if (user.role !== "admin") {
          setError("Access denied. Admin credentials required.");
          setLoading(false);
          return;
        }

        // Store user data in localStorage
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userRole", user.role);
        localStorage.setItem("userId", user._id);
        localStorage.setItem("username", user.username);

        // Redirect to admin dashboard
        navigate("/admin-dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary-700 shadow-lg">
        <div className="container-page">
          <div className="flex items-center justify-between py-4">
            <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <div className="flex items-center gap-1 text-2xl">
                <span>🔐</span>
                <span>👨‍💼</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
            </Link>
            <Link to="/" className="text-sm text-white/90 hover:text-white transition-colors font-medium">
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="card bg-white shadow-xl">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 text-5xl mb-4">
                <span>🔐</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-text-900 mb-2">
                Admin Login
              </h2>
              <p className="text-sm text-text-600">
                FreshHarvest Administration Access
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                <p className="text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="phoneno" className="label-field">
                  Phone Number
                </label>
                <input
                  id="phoneno"
                  name="phoneno"
                  type="tel"
                  required
                  value={formData.phoneno}
                  onChange={handleChange}
                  placeholder="Enter admin phone number"
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="password" className="label-field">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter admin password"
                  className="input-field"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full text-sm font-semibold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Authenticating...
                    </span>
                  ) : (
                    <span>🔓 Login as Admin</span>
                  )}
                </button>
              </div>
            </form>            <div className="mt-6 pt-6 border-t border-text-200">
              <p className="text-xs text-center text-text-500">
                🔒 Secure admin-only area. All actions are logged.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
