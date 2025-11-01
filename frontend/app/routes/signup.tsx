import type { Route } from "./+types/signup";
import { Link } from "react-router";
import { useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sign Up - FreshHarvest" },
    { name: "description", content: "Create your FreshHarvest account" },
  ];
}

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    region: "",
    userType: "" as "farmer" | "buyer" | "",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain uppercase, lowercase, and number";
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s\-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }
    
    if (!formData.region.trim()) {
      newErrors.region = "Region is required";
    }
    
    if (!formData.userType) {
      newErrors.userType = "Please select whether you are a farmer or buyer";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      console.log("Signup data:", formData);
      // Set authentication flag in localStorage
      localStorage.setItem('isAuthenticated', 'true');
      setIsLoading(false);
      // Redirect to marketplace
      window.location.href = '/marketplace';
    }, 1500);
  };

  const handleAdminAccess = () => {
    // In production, this should be a secure backend check
    const ADMIN_PASSWORD = "admin123"; // This should be in environment variables
    
    if (adminPassword === ADMIN_PASSWORD) {
      setAdminError("");
      setShowAdminModal(false);
      setAdminPassword("");
      // Redirect to admin page or set admin mode
      alert("Admin access granted! Redirecting to admin panel...");
      // In production: navigate to admin dashboard
    } else {
      setAdminError("Incorrect admin password. Please try again.");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  return (
    <div className="min-h-screen bg-background-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl">
        {/* Logo and Back Link */}
        <div className="text-center mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-primary-700 hover:text-primary-800 text-sm mb-4 transition-colors font-medium"
          >
            <span className="text-lg">←</span>
            <span>Back to Home</span>
          </Link>
          <Link to="/" className="flex items-center justify-center gap-3 mb-3 hover:opacity-90 transition-opacity">
            <div className="flex items-center gap-2 text-3xl">
              <span>�</span>
              <span>🌽</span>
              <span>🥕</span>
            </div>
            <h1 className="text-3xl font-bold text-primary-700">FreshHarvest</h1>
          </Link>
          <h2 className="text-2xl font-bold text-text-900 mb-1">Create Your Account</h2>
          <p className="text-sm text-text-600">Join our farming community today!</p>
        </div>

        {/* Signup Card */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name and Email Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="label-field">
                  🍓 FULL NAME
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="John Doe"
                  className={`input-field ${errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
                  disabled={isLoading}
                />
                {errors.name && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="label-field">
                  🍊 EMAIL ADDRESS
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="john@example.com"
                  className={`input-field ${errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Phone and Region Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="label-field">
                  🍋 PHONE NUMBER
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className={`input-field ${errors.phone ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
                  disabled={isLoading}
                />
                {errors.phone && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{errors.phone}</span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="region" className="label-field">
                  🍇 REGION / LOCATION
                </label>
                <input
                  id="region"
                  type="text"
                  value={formData.region}
                  onChange={(e) => handleInputChange("region", e.target.value)}
                  placeholder="California, USA"
                  className={`input-field ${errors.region ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
                  disabled={isLoading}
                />
                {errors.region && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{errors.region}</span>
                  </p>
                )}
              </div>
            </div>

            {/* User Type Selection */}
            <div>
              <label className="label-field mb-3">
                🥦 ACCOUNT TYPE
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleInputChange("userType", "farmer")}
                  className={`p-5 rounded-lg border-2 transition-all duration-200 ${
                    formData.userType === "farmer"
                      ? "border-primary-700 bg-primary-50 shadow-md"
                      : "border-text-300 bg-white hover:border-primary-300 hover:bg-primary-50"
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  disabled={isLoading}
                >
                  <div className="text-3xl mb-2">🌾</div>
                  <div className="text-lg font-semibold text-text-900">Farmer</div>
                  <div className="text-xs text-text-600 mt-1">I grow and sell products</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleInputChange("userType", "buyer")}
                  className={`p-5 rounded-lg border-2 transition-all duration-200 ${
                    formData.userType === "buyer"
                      ? "border-primary-700 bg-primary-50 shadow-md"
                      : "border-text-300 bg-white hover:border-primary-300 hover:bg-primary-50"
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  disabled={isLoading}
                >
                  <div className="text-3xl mb-2">🍅</div>
                  <div className="text-lg font-semibold text-text-900">Buyer</div>
                  <div className="text-xs text-text-600 mt-1">I purchase farm products</div>
                </button>
              </div>
              {errors.userType && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{errors.userType}</span>
                </p>
              )}
            </div>

            {/* Password Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="label-field">
                  🍉 PASSWORD
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="••••••••"
                    className={`input-field pr-12 ${errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-500 hover:text-text-700 text-lg transition-colors disabled:opacity-50"
                    disabled={isLoading}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "👁️" : "🔒"}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="label-field">
                  🍌 CONFIRM PASSWORD
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="••••••••"
                    className={`input-field pr-12 ${errors.confirmPassword ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-500 hover:text-text-700 text-lg transition-colors disabled:opacity-50"
                    disabled={isLoading}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? "👁️" : "🔒"}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{errors.confirmPassword}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-2 pt-2">
              <input
                id="terms"
                type="checkbox"
                className="w-4 h-4 mt-1 rounded border-text-300 text-primary-700 focus:ring-primary-500 cursor-pointer"
                disabled={isLoading}
                required
              />
              <label htmlFor="terms" className="text-sm text-text-700 cursor-pointer">
                I agree to the{" "}
                <a href="#" className="text-primary-700 font-semibold hover:text-primary-800 transition-colors underline">
                  Terms & Conditions
                </a>{" "}
                and{" "}
                <a href="#" className="text-primary-700 font-semibold hover:text-primary-800 transition-colors underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin text-xl">⏳</span>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <span className="text-xl">🌱</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-text-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-text-600 font-medium">or</span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center space-y-3">
            <p className="text-sm text-text-700">
              Already have an account?
            </p>
            <Link to="/login" className="btn-outline w-full inline-block group">
              <span>Login to Your Account</span>
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          {/* Admin Access Button - Footer */}
          <div className="mt-6 pt-5 border-t border-text-200">
            <button
              type="button"
              onClick={() => setShowAdminModal(true)}
              className="w-full py-2.5 px-4 text-xs text-text-600 hover:text-text-800 hover:bg-background-50 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
            >
              <span>🥬</span>
              <span>Are you an Admin?</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Password Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-5">
              <div className="text-4xl mb-3">🥬</div>
              <h3 className="text-xl font-bold text-text-900 mb-1">Admin Access</h3>
              <p className="text-sm text-text-600">Enter admin password to continue</p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="adminPassword" className="label-field">
                  🔑 ADMIN PASSWORD
                </label>
                <input
                  id="adminPassword"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => {
                    setAdminPassword(e.target.value);
                    setAdminError("");
                  }}
                  placeholder="Enter password"
                  className={`input-field ${adminError ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAdminAccess();
                    }
                  }}
                  autoFocus
                />
                {adminError && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{adminError}</span>
                  </p>
                )}
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminModal(false);
                    setAdminPassword("");
                    setAdminError("");
                  }}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAdminAccess}
                  className="btn-primary flex-1"
                >
                  Access
                </button>
              </div>
            </div>

            <div className="mt-5 p-3 bg-primary-50 rounded-lg border border-primary-200">
              <p className="text-xs text-text-700 text-center">
                <span className="text-lg">🍃</span> Only authorized administrators can access this section.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
