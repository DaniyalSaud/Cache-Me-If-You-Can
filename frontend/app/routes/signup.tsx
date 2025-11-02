import type { Route } from "./+types/signup";
import { Link } from "react-router";
import { useState } from "react";
import { API_ENDPOINTS, apiRequest } from "../config/api";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sign Up - FreshHarvest" },
    { name: "description", content: "Create your FreshHarvest account" },
  ];
}

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
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
    
    try {
      // Call the backend API
      // Map "farmer" to "seller" for backend compatibility
      const role = formData.userType === 'farmer' ? 'seller' : formData.userType;
      
      const response = await apiRequest(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        body: JSON.stringify({
          username: formData.name,
          phoneno: formData.phone,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          role: role,
          region: formData.region,
        }),
      });

      console.log("Registration successful:", response);
      
      // After successful registration, log the user in automatically
      const loginResponse = await apiRequest(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        body: JSON.stringify({
          phoneno: formData.phone,
          password: formData.password,
        }),
      });

      // Set authentication flag and user data in localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userPhone', formData.phone);
      // Store the actual role from backend response (seller/buyer)
      localStorage.setItem('userRole', loginResponse.data.user.role);
      localStorage.setItem('accessToken', loginResponse.data.accessToken);
      localStorage.setItem('userId', loginResponse.data.user._id);
      localStorage.setItem('username', loginResponse.data.user.username);
      
      setIsLoading(false);
      
      // Redirect based on role: seller (farmer) to farmer-dashboard, buyer to marketplace
      if (loginResponse.data.user.role === 'seller') {
        window.location.href = '/farmer-dashboard';
      } else {
        window.location.href = '/marketplace';
      }
    } catch (error: any) {
      setIsLoading(false);
      console.error("Signup error:", error);
      
      // Show user-friendly error message
      let errorMessage = error.message || "Registration failed. Please try again.";
      
      // Map specific backend errors to user-friendly messages
      if (errorMessage.includes("username already exists") || errorMessage.includes("Phoneno or username already exists")) {
        errorMessage = "This phone number or username is already registered. Please try logging in instead.";
      } else if (errorMessage.includes("Password and confirm password do not match")) {
        errorMessage = "Passwords do not match. Please check and try again.";
      } else if (errorMessage.includes("Cannot connect to server")) {
        errorMessage = "Cannot connect to server. Please ensure the backend is running.";
      }
      
      setErrors({ name: errorMessage });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  return (
    <div className="min-h-screen bg-background-50 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-2xl">
        {/* Logo and Back Link */}
        <div className="text-center mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-primary-700 hover:text-primary-800 text-sm mb-6 transition-colors font-medium"
          >
            <span className="text-lg">←</span>
            <span>Back to Home</span>
          </Link>
          <Link to="/" className="flex items-center justify-center gap-3 mb-4 hover:opacity-90 transition-opacity">
            <div className="flex items-center gap-2 text-3xl">
              <span>🌾</span>
              <span>🌽</span>
              <span>🥕</span>
            </div>
            <h1 className="text-3xl font-bold text-primary-700">FreshHarvest</h1>
          </Link>
          <h2 className="text-2xl md:text-3xl font-bold text-text-900 mb-2">Create Your Account</h2>
          <p className="text-sm md:text-base text-text-600">Join our farming community today!</p>
        </div>

        {/* Signup Card */}
        <div className="card bg-white shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="label-field">
                👤 FULL NAME
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter your full name"
                className={`input-field ${errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            {/* Phone and Region Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone" className="label-field">
                  📱 PHONE NUMBER
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+92 300 1234567"
                  className={`input-field ${errors.phone ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
                  disabled={isLoading}
                />
                {errors.phone && (
                  <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{errors.phone}</span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="region" className="label-field">
                  📍 REGION / LOCATION
                </label>
                <input
                  id="region"
                  type="text"
                  value={formData.region}
                  onChange={(e) => handleInputChange("region", e.target.value)}
                  placeholder="e.g., Karachi, Pakistan"
                  className={`input-field ${errors.region ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
                  disabled={isLoading}
                />
                {errors.region && (
                  <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{errors.region}</span>
                  </p>
                )}
              </div>
            </div>

            {/* User Type Selection */}
            <div>
              <label className="label-field mb-4">
                👥 ACCOUNT TYPE
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleInputChange("userType", "farmer")}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                    formData.userType === "farmer"
                      ? "border-primary-700 bg-primary-50 shadow-lg"
                      : "border-text-300 bg-white hover:border-primary-400 hover:bg-primary-50"
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  disabled={isLoading}
                >
                  <div className="text-4xl mb-3">🌾</div>
                  <div className="text-lg font-bold text-text-900">Farmer/Seller</div>
                  <div className="text-sm text-text-600 mt-2">I grow and sell farm products</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleInputChange("userType", "buyer")}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                    formData.userType === "buyer"
                      ? "border-primary-700 bg-primary-50 shadow-lg"
                      : "border-text-300 bg-white hover:border-primary-400 hover:bg-primary-50"
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  disabled={isLoading}
                >
                  <div className="text-4xl mb-3">🛒</div>
                  <div className="text-lg font-bold text-text-900">Buyer</div>
                  <div className="text-sm text-text-600 mt-2">I purchase farm products</div>
                </button>
              </div>
              {errors.userType && (
                <p className="text-red-600 text-xs mt-3 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{errors.userType}</span>
                </p>
              )}
            </div>

            {/* Password Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="password" className="label-field">
                  🔐 PASSWORD
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Enter password (min 8 characters)"
                    className={`input-field pr-12 ${errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-500 hover:text-text-700 text-xl transition-colors disabled:opacity-50"
                    disabled={isLoading}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "👁️" : "🔒"}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="label-field">
                  🔐 CONFIRM PASSWORD
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="Re-enter your password"
                    className={`input-field pr-12 ${errors.confirmPassword ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-500 hover:text-text-700 text-xl transition-colors disabled:opacity-50"
                    disabled={isLoading}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? "👁️" : "🔒"}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
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
                <Link to="/terms-conditions" className="text-primary-700 font-semibold hover:text-primary-800 transition-colors underline" target="_blank">
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link to="/privacy-policy" className="text-primary-700 font-semibold hover:text-primary-800 transition-colors underline" target="_blank">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base py-3 mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin text-xl">⏳</span>
                  <span className="font-semibold">Creating Account...</span>
                </>
              ) : (
                <>
                  <span className="font-semibold">Create Account</span>
                  <span className="text-xl">🌱</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-text-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-text-600 font-semibold">OR</span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center space-y-4">
            <p className="text-sm text-text-700 font-medium">
              Already have an account?
            </p>
            <Link to="/login" className="btn-outline w-full inline-block group py-3">
              <span className="font-semibold">Login to Your Account</span>
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          {/* Admin Access Button - Footer */}
          <div className="mt-8 pt-6 border-t-2 border-text-200">
            <Link
              to="/admin-login"
              className="w-full py-3 px-4 text-sm text-text-600 hover:text-text-900 hover:bg-background-100 rounded-lg transition-all font-medium flex items-center justify-center gap-2 border border-transparent hover:border-text-300"
            >
              <span>🔑</span>
              <span>Are you an Admin?</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
