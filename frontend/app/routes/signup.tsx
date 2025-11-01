import type { Route } from "./+types/signup";
import { Link, useNavigate } from "react-router";
import { useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sign Up - FarmMarket" },
    { name: "description", content: "Create your FarmMarket account" },
  ];
}

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 1 data
  const [accountType, setAccountType] = useState<"farmer" | "buyer" | "">("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 2 data
  const [location, setLocation] = useState("");
  const [farmName, setFarmName] = useState("");
  const [farmSize, setFarmSize] = useState("");
  const [productsGrown, setProductsGrown] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [interests, setInterests] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert("Please agree to the terms and conditions");
      return;
    }
    // Handle signup logic here (frontend only)
    console.log("Signup data:", {
      accountType,
      fullName,
      email,
      phone,
      location,
      farmName,
      farmSize,
      productsGrown,
      businessName,
      interests,
    });
    // Navigate to home after signup
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-mint-50 py-12 px-4">
      <div className="container-page">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-mint-700 hover:text-mint-800 text-lg mb-6">
              <span className="text-2xl">←</span>
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="text-5xl">🌾</div>
              <h1 className="text-4xl font-bold text-mint-700">FarmMarket</h1>
            </div>
            <h2 className="text-3xl font-bold text-earth-900 mb-2">Create Your Account</h2>
            <p className="text-lg text-earth-700">Join our community of farmers and buyers</p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                  step >= 1 ? "bg-mint-600 text-white" : "bg-earth-200 text-earth-600"
                }`}>
                  1
                </div>
                <span className={`text-lg font-semibold ${step >= 1 ? "text-mint-700" : "text-earth-600"}`}>
                  Basic Info
                </span>
              </div>
              <div className={`w-16 h-1 ${step >= 2 ? "bg-mint-600" : "bg-earth-200"}`}></div>
              <div className="flex items-center gap-2">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                  step >= 2 ? "bg-mint-600 text-white" : "bg-earth-200 text-earth-600"
                }`}>
                  2
                </div>
                <span className={`text-lg font-semibold ${step >= 2 ? "text-mint-700" : "text-earth-600"}`}>
                  Details
                </span>
              </div>
            </div>
          </div>

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="card">
              <form onSubmit={handleStep1Submit} className="space-y-6">
                {/* Account Type */}
                <div>
                  <label className="label-field">I am a:</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setAccountType("farmer")}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        accountType === "farmer"
                          ? "border-mint-600 bg-mint-50"
                          : "border-earth-300 bg-white hover:border-mint-400"
                      }`}
                    >
                      <div className="text-5xl mb-2">🚜</div>
                      <div className="text-xl font-semibold text-earth-900">Farmer</div>
                      <div className="text-sm text-earth-600 mt-1">I grow and sell produce</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountType("buyer")}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        accountType === "buyer"
                          ? "border-mint-600 bg-mint-50"
                          : "border-earth-300 bg-white hover:border-mint-400"
                      }`}
                    >
                      <div className="text-5xl mb-2">🛒</div>
                      <div className="text-xl font-semibold text-earth-900">Buyer</div>
                      <div className="text-sm text-earth-600 mt-1">I want to buy fresh produce</div>
                    </button>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="label-field">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="input-field"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="label-field">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="input-field"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="label-field">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="input-field"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="label-field">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                      className="input-field pr-16"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-earth-600 hover:text-earth-800 text-2xl"
                    >
                      {showPassword ? "👁️" : "🔒"}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="label-field">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="input-field"
                    required
                  />
                </div>

                {/* Next Button */}
                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={!accountType}
                >
                  Continue to Next Step →
                </button>
              </form>

              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="text-lg text-earth-700">
                  Already have an account?{" "}
                  <Link to="/login" className="text-mint-700 hover:text-mint-800 font-semibold">
                    Login here
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Additional Details */}
          {step === 2 && (
            <div className="card">
              <form onSubmit={handleStep2Submit} className="space-y-6">
                {/* Location */}
                <div>
                  <label htmlFor="location" className="label-field">
                    Location (City/Region)
                  </label>
                  <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Where are you located?"
                    className="input-field"
                    required
                  />
                </div>

                {/* Farmer-specific fields */}
                {accountType === "farmer" && (
                  <>
                    <div>
                      <label htmlFor="farmName" className="label-field">
                        Farm Name
                      </label>
                      <input
                        id="farmName"
                        type="text"
                        value={farmName}
                        onChange={(e) => setFarmName(e.target.value)}
                        placeholder="What's your farm called?"
                        className="input-field"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="farmSize" className="label-field">
                        Farm Size (acres)
                      </label>
                      <input
                        id="farmSize"
                        type="text"
                        value={farmSize}
                        onChange={(e) => setFarmSize(e.target.value)}
                        placeholder="How many acres?"
                        className="input-field"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="productsGrown" className="label-field">
                        What do you grow?
                      </label>
                      <textarea
                        id="productsGrown"
                        value={productsGrown}
                        onChange={(e) => setProductsGrown(e.target.value)}
                        placeholder="List the crops or produce you grow (e.g., tomatoes, corn, wheat)"
                        className="input-field min-h-32 resize-y"
                        required
                      />
                    </div>
                  </>
                )}

                {/* Buyer-specific fields */}
                {accountType === "buyer" && (
                  <>
                    <div>
                      <label htmlFor="businessName" className="label-field">
                        Business Name (Optional)
                      </label>
                      <input
                        id="businessName"
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="If you're buying for a business"
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label htmlFor="interests" className="label-field">
                        What are you looking for?
                      </label>
                      <textarea
                        id="interests"
                        value={interests}
                        onChange={(e) => setInterests(e.target.value)}
                        placeholder="Tell us what produce you're interested in buying"
                        className="input-field min-h-32 resize-y"
                        required
                      />
                    </div>
                  </>
                )}

                {/* Terms and Conditions */}
                <div>
                  <label className="flex items-start gap-3 text-lg text-earth-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-6 h-6 mt-1 rounded border-earth-300 text-mint-600 focus:ring-mint-500"
                      required
                    />
                    <span>
                      I agree to the Terms and Conditions and Privacy Policy. I understand that 
                      FarmMarket connects farmers and buyers directly.
                    </span>
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-secondary flex-1"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
