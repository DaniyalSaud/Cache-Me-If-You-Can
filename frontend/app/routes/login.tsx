import type { Route } from "./+types/login";
import { Link } from "react-router";
import { useState } from "react";
import { API_ENDPOINTS, apiRequest } from "../config/api";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login - FreshHarvest" },
    { name: "description", content: "Login to your FreshHarvest account" },
  ];
}

export default function Login() {
  const [phoneno, setPhoneno] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ phoneno?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: { phoneno?: string; password?: string } = {};
    
    if (!phoneno) {
      newErrors.phoneno = "Phone number is required";
    } else if (!/^\+?[\d\s\-()]{10,}$/.test(phoneno)) {
      newErrors.phoneno = "Please enter a valid phone number";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
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
      const response = await apiRequest(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        body: JSON.stringify({
          phoneno,
          password,
        }),
      });

      console.log("Login successful:", response);
      
      // Set authentication flag and user data in localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userPhone', phoneno);
      localStorage.setItem('userRole', response.data.user.role);
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('userId', response.data.user._id);
      localStorage.setItem('username', response.data.user.username);
      
      setIsLoading(false);
      
      // Redirect based on role
      if (response.data.user.role === 'seller') {
        window.location.href = '/farmer-dashboard';
      } else {
        window.location.href = '/marketplace';
      }
    } catch (error: any) {
      setIsLoading(false);
      console.error("Login error:", error);
      
      // Show user-friendly error message
      let errorMessage = error.message || "Invalid phone number or password";
      
      // Map specific backend errors to user-friendly messages
      if (errorMessage.includes("User doesn't exist")) {
        errorMessage = "No account found with this phone number. Please sign up first.";
      } else if (errorMessage.includes("Incorrect Password")) {
        errorMessage = "Incorrect password. Please try again.";
      } else if (errorMessage.includes("Cannot connect to server")) {
        errorMessage = "Cannot connect to server. Please ensure the backend is running.";
      }
      
      setErrors({ phoneno: errorMessage });
    }
  };

  return (
    <div className="min-h-screen bg-background-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo and Back Link */}
        <div className="text-center mb-8">
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
          <h2 className="text-2xl font-bold text-text-900 mb-2">Welcome Back!</h2>
          <p className="text-sm text-text-600">Login to access your account</p>
        </div>

      

        {/* Login Card */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Phone Number Field */}
            <div>
              <label htmlFor="phoneno" className="label-field">
                � Phone Number
              </label>
              <input
                id="phoneno"
                type="tel"
                value={phoneno}
                onChange={(e) => {
                  setPhoneno(e.target.value);
                  if (errors.phoneno) setErrors({ ...errors, phoneno: undefined });
                }}
                placeholder="+1 (555) 123-4567"
                className={`input-field ${errors.phoneno ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
                disabled={isLoading}
              />
              {errors.phoneno && (
                <p className="text-red-600 text-base mt-2 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{errors.phoneno}</span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="label-field">
                🔑 Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  placeholder="Enter your password"
                  className={`input-field pr-16 ${errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-earth-600 hover:text-earth-800 text-2xl transition-colors disabled:opacity-50"
                  disabled={isLoading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "👁️" : "🔒"}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-base mt-2 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <label className="flex items-center gap-3 text-lg text-earth-700 cursor-pointer hover:text-earth-900 transition-colors">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-earth-300 text-mint-600 focus:ring-mint-500 cursor-pointer"
                  disabled={isLoading}
                />
                <span>Remember me</span>
              </label>
              <button 
                type="button" 
                className="text-lg text-mint-700 hover:text-mint-800 font-semibold transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin text-2xl">⏳</span>
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <span className="text-2xl">→</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-earth-300"></div>
            </div>
            <div className="relative flex justify-center text-lg">
              <span className="px-4 bg-white text-earth-600 font-semibold">or</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center space-y-4">
            <p className="text-lg text-earth-700">
              Don't have an account yet?
            </p>
            <Link to="/signup" className="btn-outline w-full inline-block group">
              <span>Create New Account</span>
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">🌱</span>
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center card bg-mint-50 border-mint-200">
          <p className="text-earth-700 text-base mb-2">
            <span className="text-2xl mb-2 block">💬</span>
            Need help logging in?
          </p>
          <p className="text-earth-600">
            Contact us at{" "}
            <a href="mailto:support@farmmarket.com" className="text-mint-700 font-semibold hover:text-mint-800 transition-colors">
              support@farmmarket.com
            </a>
          </p>
          <p className="text-earth-600 mt-1">
            or call <span className="text-mint-700 font-semibold">1-800-FARM-MKT</span>
          </p>
        </div>
      </div>
    </div>
  );
}
