import type { Route } from "./+types/login";
import { Link } from "react-router";
import { useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login - FarmMarket" },
    { name: "description", content: "Login to your FarmMarket account" },
  ];
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
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
    // Simulate API call
    setTimeout(() => {
      console.log("Login attempt:", { email, password });
      setIsLoading(false);
      // Show success message
      alert("Login successful! (This is a demo - no backend)");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-mint-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo and Back Link */}
        <div className="text-center mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-mint-700 hover:text-mint-800 text-lg mb-6 transition-colors font-semibold"
          >
            <span className="text-2xl">←</span>
            <span>Back to Home</span>
          </Link>
          <Link to="/" className="flex items-center justify-center gap-3 mb-4 hover:opacity-80 transition-opacity">
            <div className="text-5xl">🌾</div>
            <h1 className="text-4xl font-bold text-mint-700">FarmMarket</h1>
          </Link>
          <h2 className="text-3xl font-bold text-earth-900 mb-2">Welcome Back!</h2>
          <p className="text-lg text-earth-700">Login to access your account</p>
        </div>

        {/* Login Card */}
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="label-field">
                📧 Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                placeholder="your.email@example.com"
                className={`input-field ${errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-red-600 text-base mt-2 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{errors.email}</span>
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
