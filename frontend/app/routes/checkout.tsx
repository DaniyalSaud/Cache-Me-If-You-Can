import type { Route } from "./+types/checkout";
import { Link, useNavigate } from "react-router";
import { useCart } from "../context/CartContext";
import { useState, useEffect } from "react";
import { API_ENDPOINTS, apiRequest } from "../config/api";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Checkout - FreshHarvest" },
    { name: "description", content: "Complete your order and get fresh produce delivered" },
  ];
}

type ShippingFormData = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
};

type UserData = {
  _id: string;
  username: string;
  phoneno: string;
  role: string;
  region: string;
};

export default function Checkout() {
  const { cartItems, getTotalPrice, getTotalItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [easypaisaNumber, setEasypaisaNumber] = useState<string>("");
  const [loadingEasypaisa, setLoadingEasypaisa] = useState(true);

  const [formData, setFormData] = useState<ShippingFormData>({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  const [formErrors, setFormErrors] = useState<Partial<ShippingFormData>>({});

  // Scroll detection for navbar height
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch current user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoadingUser(true);
        const response = await apiRequest(API_ENDPOINTS.CURRENT_USER);
        
        if (response.data) {
          setUserData(response.data);
          // Pre-fill form with user data
          setFormData((prev) => ({
            ...prev,
            fullName: response.data.username || "",
            phone: response.data.phoneno || "",
            state: response.data.region || "",
          }));
        }
      } catch (err: any) {
        console.error("Error fetching user data:", err);
        // If user is not authenticated, they might need to login
        if (err.message.includes('Unauthorized') || err.message.includes('Authentication')) {
          navigate('/login');
        }
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Fetch Easypaisa number
  useEffect(() => {
    const fetchEasypaisaNumber = async () => {
      try {
        setLoadingEasypaisa(true);
        const response = await apiRequest(API_ENDPOINTS.EASYPAISA_NUMBER);
        
        if (response.easypaisaNumber) {
          setEasypaisaNumber(response.easypaisaNumber);
        }
      } catch (err: any) {
        console.error("Error fetching Easypaisa number:", err);
        // Set a default or show error
        setEasypaisaNumber("Not available");
      } finally {
        setLoadingEasypaisa(false);
      }
    };

    fetchEasypaisaNumber();
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && !success) {
      navigate("/marketplace");
    }
  }, [cartItems, navigate, success]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (formErrors[name as keyof ShippingFormData]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<ShippingFormData> = {};

    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      errors.phone = "Invalid phone number (10 digits required)";
    }
    if (!formData.addressLine1.trim()) errors.addressLine1 = "Address is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.state.trim()) errors.state = "State is required";
    if (!formData.pincode.trim()) {
      errors.pincode = "Pincode is required";
    } else if (!/^[0-9]{6}$/.test(formData.pincode)) {
      errors.pincode = "Invalid pincode (6 digits required)";
    }
    if (!formData.country.trim()) errors.country = "Country is required";

    // Validate transaction ID
    if (!transactionId.trim()) {
      setError("Transaction ID is required");
      return false;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      setError("Please fill in all required fields correctly");
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare order data
      const orderData = {
        products: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: formData.country,
        },
        transactionId: transactionId.trim(), // Include transaction ID
      };

      // Submit order to backend
      const response = await apiRequest(API_ENDPOINTS.ORDERS, {
        method: "POST",
        body: JSON.stringify(orderData),
      });

      console.log("Order created successfully:", response);
      
      // Clear cart and show success
      clearCart();
      setSuccess(true);

      // Redirect to order confirmation or dashboard after 2 seconds
      setTimeout(() => {
        navigate("/farmer-dashboard");
      }, 3000);

    } catch (err: any) {
      console.error("Error creating order:", err);
      setError(err.message || "Failed to create order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background-50">
        <header className={`sticky top-0 z-50 bg-primary-700 shadow-lg transition-all duration-300 ${isScrolled ? 'py-0' : ''}`}>
          <div className="container-page">
            <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'}`}>
              <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                <div className={`flex items-center gap-1 transition-all duration-300 ${isScrolled ? 'text-xl' : 'text-2xl'}`}>
                  <span>✅</span>
                </div>
                <h1 className={`font-bold text-white transition-all duration-300 ${isScrolled ? 'text-xl' : 'text-2xl'}`}>Order Confirmed</h1>
              </Link>
            </div>
          </div>
        </header>

        <div className="container-page py-16">
          <div className="card bg-white shadow-xl max-w-2xl mx-auto text-center">
            <div className="text-6xl mb-6">✅</div>
            <h1 className="text-3xl md:text-4xl font-bold text-text-900 mb-3">
              Order Placed Successfully!
            </h1>
            <p className="text-base md:text-lg text-text-600 mb-8">
              Thank you for your order. We'll send you a confirmation email shortly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/farmer-dashboard" className="btn-primary text-sm font-semibold uppercase tracking-widest">
                View My Orders
              </Link>
              <Link to="/marketplace" className="btn-outline text-sm font-semibold uppercase tracking-widest">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-50 pb-16">
      <header className={`sticky top-0 z-50 bg-primary-700 shadow-lg transition-all duration-300 ${isScrolled ? 'py-0' : ''}`}>
        <div className="container-page">
          <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'}`}>
            <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <div className={`flex items-center gap-1 transition-all duration-300 ${isScrolled ? 'text-xl' : 'text-2xl'}`}>
                <span>🛍️</span>
              </div>
              <h1 className={`font-bold text-white transition-all duration-300 ${isScrolled ? 'text-xl' : 'text-2xl'}`}>Checkout</h1>
            </Link>
            <Link to="/cart" className={`text-white/90 hover:text-white transition-colors font-medium ${isScrolled ? 'text-xs' : 'text-sm'}`}>
              ← Back to Cart
            </Link>
          </div>
        </div>
      </header>

      <section className="container-page space-y-8 mt-8">
        <header className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-text-900">
            Complete Your Order
          </h1>
          <p className="text-sm md:text-base text-text-600">
            Review your items and provide delivery information
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {/* Loading State */}
              {loadingUser && (
                <div className="card bg-white shadow-lg">
                  <div className="flex items-center justify-center py-8">
                    <span className="inline-block animate-spin text-3xl mr-3">⏳</span>
                    <span className="text-lg text-text-600">Loading your information...</span>
                  </div>
                </div>
              )}

              {/* Contact Information */}
              {!loadingUser && (
                <div className="card bg-white shadow-lg">
                  <h2 className="text-2xl font-bold text-text-900 mb-6 flex items-center gap-2">
                    <span>📧</span>
                    <span>Contact Information</span>
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="fullName" className="label-field">Full Name *</label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        disabled={!!userData?.username}
                        className={`input-field ${formErrors.fullName ? 'border-red-500' : ''} ${userData?.username ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        placeholder="John Doe"
                      />
                      {formErrors.fullName && (
                        <p className="text-red-600 text-sm mt-1">{formErrors.fullName}</p>
                      )}
                      {userData?.username && (
                        <p className="text-xs text-text-500 mt-1">✓ Fetched from your account</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="phone" className="label-field">Phone Number *</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!!userData?.phoneno}
                        className={`input-field ${formErrors.phone ? 'border-red-500' : ''} ${userData?.phoneno ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        placeholder="9876543210"
                      />
                      {formErrors.phone && (
                        <p className="text-red-600 text-sm mt-1">{formErrors.phone}</p>
                      )}
                      {userData?.phoneno && (
                        <p className="text-xs text-text-500 mt-1">✓ Fetched from your account</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Shipping Address */}
              {!loadingUser && (
                <div className="card bg-white shadow-lg">
                  <h2 className="text-2xl font-bold text-text-900 mb-6 flex items-center gap-2">
                    <span>🚚</span>
                    <span>Shipping Address</span>
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="addressLine1" className="label-field">Address Line 1 *</label>
                      <input
                        type="text"
                        id="addressLine1"
                        name="addressLine1"
                        value={formData.addressLine1}
                        onChange={handleInputChange}
                        className={`input-field ${formErrors.addressLine1 ? 'border-red-500' : ''}`}
                        placeholder="Street address, P.O. box"
                      />
                      {formErrors.addressLine1 && (
                        <p className="text-red-600 text-sm mt-1">{formErrors.addressLine1}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="addressLine2" className="label-field">Address Line 2</label>
                      <input
                        type="text"
                        id="addressLine2"
                        name="addressLine2"
                        value={formData.addressLine2}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="Apartment, suite, unit, building, floor, etc."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="city" className="label-field">City *</label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className={`input-field ${formErrors.city ? 'border-red-500' : ''}`}
                          placeholder="Mumbai"
                        />
                        {formErrors.city && (
                          <p className="text-red-600 text-sm mt-1">{formErrors.city}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="state" className="label-field">State *</label>
                        <input
                          type="text"
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          disabled={!!userData?.region}
                          className={`input-field ${formErrors.state ? 'border-red-500' : ''} ${userData?.region ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                          placeholder="Maharashtra"
                        />
                        {formErrors.state && (
                          <p className="text-red-600 text-sm mt-1">{formErrors.state}</p>
                        )}
                        {userData?.region && (
                          <p className="text-xs text-text-500 mt-1">✓ Fetched from your account</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="pincode" className="label-field">Pincode *</label>
                        <input
                          type="text"
                          id="pincode"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          className={`input-field ${formErrors.pincode ? 'border-red-500' : ''}`}
                          placeholder="400001"
                        />
                        {formErrors.pincode && (
                          <p className="text-red-600 text-sm mt-1">{formErrors.pincode}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="country" className="label-field">Country *</label>
                        <input
                          type="text"
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className={`input-field ${formErrors.country ? 'border-red-500' : ''}`}
                          placeholder="India"
                        />
                        {formErrors.country && (
                          <p className="text-red-600 text-sm mt-1">{formErrors.country}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Information */}
              {!loadingUser && (
                <div className="card bg-white shadow-lg">
                  <h2 className="text-2xl font-bold text-text-900 mb-6 flex items-center gap-2">
                    <span>💳</span>
                    <span>Payment Information</span>
                  </h2>
                  
                  <div className="space-y-4">
                    {/* Easypaisa Number Display */}
                    <div className="bg-primary-50 border-2 border-primary-300 rounded-lg p-6 mb-4">
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">💰</span>
                        <div className="flex-1">
                          <p className="font-bold text-text-900 mb-2 text-lg">Pay via Easypaisa</p>
                          <p className="text-sm text-text-700 mb-3">
                            Transfer the total amount to the following Easypaisa number:
                          </p>
                          {loadingEasypaisa ? (
                            <div className="flex items-center gap-2">
                              <span className="inline-block animate-spin text-xl">⏳</span>
                              <span className="text-sm text-text-600">Loading payment details...</span>
                            </div>
                          ) : (
                            <div className="bg-white border-2 border-primary-500 rounded-lg p-4">
                              <p className="text-xs text-text-600 uppercase tracking-wider mb-1">Easypaisa Number</p>
                              <p className="text-3xl font-bold text-primary-700 tracking-wider font-mono">
                                {easypaisaNumber}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-accent-100 border border-accent-300 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">ℹ️</span>
                        <div className="text-sm text-text-700">
                          <p className="font-semibold text-text-900 mb-1">Payment Instructions</p>
                          <ol className="list-decimal ml-4 space-y-1">
                            <li>Transfer the total amount (₹{getTotalPrice().toFixed(2)}) to the above Easypaisa number</li>
                            <li>After successful payment, note down the transaction ID</li>
                            <li>Enter the transaction ID in the field below</li>
                            <li>Complete your order</li>
                          </ol>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="transactionId" className="label-field">Transaction ID *</label>
                      <input
                        type="text"
                        id="transactionId"
                        name="transactionId"
                        value={transactionId}
                        onChange={(e) => {
                          setTransactionId(e.target.value);
                          if (error && error.includes('Transaction ID')) {
                            setError(null);
                          }
                        }}
                        className="input-field"
                        placeholder="Enter your Easypaisa transaction ID"
                      />
                      <p className="text-xs text-text-500 mt-1">
                        Enter the unique transaction ID from your Easypaisa payment confirmation
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="card bg-red-50 border-red-200 shadow-md">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <h3 className="font-bold text-red-900 mb-1">Error</h3>
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card bg-white shadow-xl sticky top-24">
              <h2 className="text-2xl font-bold text-text-900 mb-6">Order Summary</h2>
              
              {/* Items List */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between text-sm pb-3 border-b border-text-200">
                    <div className="flex items-center gap-3">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-background-100 rounded-lg flex items-center justify-center text-xl">
                          🌽
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-text-900">{item.title}</p>
                        <p className="text-xs text-text-600">
                          {item.quantity / 100} batch{item.quantity > 100 ? 'es' : ''} × ₹{item.price}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-text-900">
                      ₹{(item.price * (item.quantity / 100)).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-text-700">
                  <span>Subtotal ({getTotalItems()} batches)</span>
                  <span className="font-semibold">₹{getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-text-700">
                  <span>Delivery</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="flex items-center justify-between text-text-700">
                  <span>GST (0%)</span>
                  <span className="font-semibold">₹0.00</span>
                </div>
                <div className="border-t border-text-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-text-900">Total</span>
                    <span className="text-2xl font-bold text-primary-700">
                      ₹{getTotalPrice().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handleSubmitOrder}
                disabled={isProcessing}
                className={`btn-primary w-full text-center text-sm font-semibold uppercase tracking-widest mb-3 py-3 ${
                  isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isProcessing ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    Processing...
                  </>
                ) : (
                  <>
                    🛍️ Place Order
                  </>
                )}
              </button>

              <Link
                to="/cart"
                className="btn-outline w-full text-center text-sm font-semibold uppercase tracking-widest block py-3"
              >
                ← Back to Cart
              </Link>

              <div className="mt-6 pt-6 border-t border-text-200">
                <div className="flex items-start gap-3 text-sm text-text-600">
                  <span className="text-2xl">🔒</span>
                  <div>
                    <p className="font-semibold text-text-900 mb-1">Secure Checkout</p>
                    <p>Your information is protected and encrypted.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
