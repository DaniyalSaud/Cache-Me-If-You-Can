import type { Route } from "./+types/waste-report";
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { getCurrentLocation } from "../utils/geolocation";
import { API_ENDPOINTS, apiRequest } from "../config/api";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Report Crop Waste - FreshHarvest" },
    { name: "description", content: "Report crop waste for recycling" },
  ];
}

type LocationData = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

type WasteCenter = {
  _id: string;
  name: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  address: string;
  city: string;
  division: string;
  country: string;
  contactNumber: string;
  acceptedCropTypes: string[];
  currentCapacity: number;
  maxCapacity: number;
  distance?: number;
};

export default function WasteReport() {
  const [isAuthenticated] = useState(() => {
    return typeof window !== 'undefined' && 
           localStorage.getItem('isAuthenticated') === 'true' &&
           localStorage.getItem('userRole') === 'seller';
  });

  const [isScrolled, setIsScrolled] = useState(false);

  const [formData, setFormData] = useState({
    cropTypes: [] as string[],
    quantity: '',
    latitude: '',
    longitude: '',
    preferredCenterId: ''
  });

  const [location, setLocation] = useState<LocationData | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [wasteCenters, setWasteCenters] = useState<WasteCenter[]>([]);
  const [loadingCenters, setLoadingCenters] = useState(false);
  const [filteredCenters, setFilteredCenters] = useState<WasteCenter[]>([]);

  // Scroll detection for navbar height
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch waste centers on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchWasteCenters();
    }
  }, [isAuthenticated]);

  // Filter centers when crop types or location change
  useEffect(() => {
    filterWasteCenters();
  }, [formData.cropTypes, wasteCenters, formData.latitude, formData.longitude]);

  const fetchWasteCenters = async () => {
    try {
      setLoadingCenters(true);
      console.log('🔄 Fetching waste centers...');
      const response = await apiRequest(`${API_ENDPOINTS.TOOLS}/waste/centers`, {
        method: 'GET'
      });
      
      console.log('📦 Waste centers response:', response);
      console.log('📦 Response data:', response.data);
      
      if (response.data && response.data.centers) {
        console.log(`✅ Found ${response.data.centers.length} waste centers`);
        setWasteCenters(response.data.centers);
      } else {
        console.log('⚠️ No centers found in response');
      }
    } catch (err: any) {
      console.error('❌ Error fetching waste centers:', err);
    } finally {
      setLoadingCenters(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const filterWasteCenters = () => {
    console.log('🔍 Filtering waste centers...');
    console.log('📋 Selected crop types:', formData.cropTypes);
    console.log('🏢 Total waste centers:', wasteCenters.length);
    
    if (formData.cropTypes.length === 0) {
      console.log('⚠️ No crop types selected, clearing filtered centers');
      setFilteredCenters([]);
      return;
    }

    const userLat = parseFloat(formData.latitude);
    const userLng = parseFloat(formData.longitude);

    let filtered = wasteCenters.filter(center => {
      console.log(`🔍 Checking center: ${center.name}`);
      console.log(`   - Center accepts: ${center.acceptedCropTypes.join(', ')}`);
      
      // If farmer selected "All", show all centers
      if (formData.cropTypes.includes("All")) {
        console.log('   ✅ Farmer selected "All" - including center');
        return true;
      }
      
      // If center accepts "All", it accepts everything
      if (center.acceptedCropTypes.includes("All")) {
        console.log('   ✅ Center accepts "All" - including center');
        return true;
      }
      
      // Check if center accepts any of the selected crop types
      const matches = formData.cropTypes.some(cropType => 
        center.acceptedCropTypes.includes(cropType)
      );
      console.log(`   ${matches ? '✅' : '❌'} Match result: ${matches}`);
      return matches;
    });

    console.log(`✅ Filtered to ${filtered.length} centers`);

    // Calculate distances if location is available
    if (!isNaN(userLat) && !isNaN(userLng)) {
      filtered = filtered.map(center => ({
        ...center,
        distance: calculateDistance(
          userLat,
          userLng,
          center.location.coordinates[1],
          center.location.coordinates[0]
        )
      }));

      // Sort by distance
      filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    setFilteredCenters(filtered);
  };

  const handleGetLocation = async () => {
    try {
      setLoadingLocation(true);
      setLocationError(null);
      const position = await getCurrentLocation();
      setLocation(position);
      setFormData(prev => ({
        ...prev,
        latitude: position.latitude.toString(),
        longitude: position.longitude.toString()
      }));
    } catch (err: any) {
      setLocationError('Failed to get location. Please ensure location permissions are enabled.');
      console.error('Location error:', err);
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest(API_ENDPOINTS.WASTE_REPORT, {
        method: 'POST',
        body: JSON.stringify({
          cropTypes: formData.cropTypes,
          quantity: parseFloat(formData.quantity),
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          preferredCenterId: formData.preferredCenterId || undefined
        })
      });

      console.log('Waste report submitted:', response);
      setSuccess(true);
      
      // Reset form
      setFormData({
        cropTypes: [],
        quantity: '',
        latitude: '',
        longitude: '',
        preferredCenterId: ''
      });
      setLocation(null);
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit waste report');
    } finally {
      setLoading(false);
    }
  };

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
            This feature is only accessible to registered farmers/sellers.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/login" className="btn-primary text-sm font-semibold uppercase tracking-widest">
              🌾 LOGIN AS FARMER
            </Link>
            <Link to="/farmer-dashboard" className="btn-outline text-sm font-semibold uppercase tracking-widest">
              ← BACK TO DASHBOARD
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-50 pb-16">
      {/* Header Navigation */}
      <header className={`sticky top-0 z-50 bg-primary-700 shadow-lg transition-all duration-300 ${isScrolled ? 'py-0' : ''}`}>
        <div className="container-page">
          <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'}`}>
            <Link to="/farmer-dashboard" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <div className={`flex items-center gap-1 transition-all duration-300 ${isScrolled ? 'text-xl' : 'text-2xl'}`}>
                <span>🌾</span>
                <span>♻️</span>
                <span>🌱</span>
              </div>
              <h1 className={`font-bold text-white transition-all duration-300 ${isScrolled ? 'text-xl' : 'text-2xl'}`}>Waste Reporting</h1>
            </Link>
            <nav className="flex items-center gap-3">
              <Link to="/farmer-dashboard" className={`text-white/90 hover:text-white transition-colors font-medium ${isScrolled ? 'text-xs' : 'text-sm'}`}>
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <section className="container-page max-w-3xl space-y-8 mt-8">
        {/* Page Header */}
        <header className="space-y-3">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary-700">
            <span>♻️</span>
            <span>Crop Waste Reporting</span>
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-text-900">
            Report Crop Waste for Recycling
          </h1>
          <p className="text-sm md:text-base text-text-600">
            Help us track and recycle agricultural waste. Your report contributes to sustainable farming practices.
          </p>
        </header>

        {/* Success Message */}
        {success && (
          <div className="card bg-mint-50 border-2 border-mint-500">
            <div className="flex items-start gap-3">
              <span className="text-4xl">✅</span>
              <div>
                <h3 className="font-bold text-primary-900 text-lg mb-1">Report Submitted Successfully!</h3>
                <p className="text-sm text-primary-800">
                  Your waste report has been recorded. Thank you for contributing to sustainable farming practices!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="card bg-red-50 border-2 border-red-500">
            <div className="flex items-start gap-3">
              <span className="text-4xl">⚠️</span>
              <div>
                <h3 className="font-bold text-red-900 text-lg mb-1">Oops! Something went wrong</h3>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Waste Report Form */}
        <div className="card bg-white shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-3xl">�️</div>
            <h2 className="text-xl font-bold text-text-900">Waste Details</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Crop Types Checklist */}
            <div className="space-y-3">
              <label className="label-field flex items-center gap-2">
                <span>🌾</span>
                <span>CROP TYPES *</span>
              </label>
              <div className="bg-gradient-to-br from-background-50 to-primary-50/30 border-2 border-text-300 rounded-xl p-5 space-y-4 shadow-sm">
                {/* Select All Option */}
                <div className="border-b border-text-200 pb-3">
                  <label className="flex items-center gap-3 cursor-pointer hover:bg-primary-50 p-2 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.cropTypes.includes("All")}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ 
                            ...formData, 
                            cropTypes: ["All"]
                          });
                        } else {
                          setFormData({ 
                            ...formData, 
                            cropTypes: []
                          });
                        }
                      }}
                      disabled={loading}
                      className="w-5 h-5 text-primary-600 border-2 border-text-400 rounded focus:ring-2 focus:ring-primary-500"
                    />
                    <span className="flex items-center gap-2 font-semibold text-primary-700">
                      <span className="text-xl">🌾</span>
                      <span>All Crop Types</span>
                    </span>
                  </label>
                  <p className="text-xs text-text-600 mt-2 ml-10">
                    Select this if reporting mixed crop waste
                  </p>
                </div>

                {/* Individual Crop Types Grid */}
                {!formData.cropTypes.includes("All") && (
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
                          checked={formData.cropTypes.includes(crop.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                cropTypes: [...formData.cropTypes, crop.name]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                cropTypes: formData.cropTypes.filter(t => t !== crop.name)
                              });
                            }
                          }}
                          disabled={loading}
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
                {formData.cropTypes.length > 0 && (
                  <div className="bg-gradient-to-r from-green-50 to-primary-50 border-2 border-green-300 rounded-lg p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">✅</span>
                      <div className="flex-1">
                        <p className="text-sm text-green-900 font-bold mb-1">
                          Selected: {formData.cropTypes.length === 1 && formData.cropTypes[0] === "All" 
                            ? "All Crop Types" 
                            : `${formData.cropTypes.length} crop type${formData.cropTypes.length > 1 ? 's' : ''}`}
                        </p>
                        {formData.cropTypes[0] !== "All" && (
                          <p className="text-xs text-green-700 font-semibold">
                            {formData.cropTypes.join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {formData.cropTypes.length === 0 && (
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

            {/* Quantity */}
            <div>
              <label htmlFor="quantity" className="label-field">
                ⚖️ QUANTITY (KG)
              </label>
              <input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="Enter quantity in kilograms"
                className="input-field"
                required
                min="1"
                step="0.1"
                disabled={loading}
              />
            </div>

            {/* Location */}
            <div>
              <label className="label-field mb-3">
                📍 LOCATION
              </label>
              
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={loadingLocation || loading}
                className={`btn-outline w-full mb-4 flex items-center justify-center gap-2 ${
                  loadingLocation ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loadingLocation ? (
                  <>
                    <span className="animate-spin text-xl">⏳</span>
                    <span>Getting Location...</span>
                  </>
                ) : (
                  <>
                    <span>📍</span>
                    <span>Get Current Location</span>
                  </>
                )}
              </button>

              {location && (
                <div className="card bg-mint-50 border-mint-300 mb-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-text-600 font-medium">Latitude:</span>
                      <span className="text-text-900 font-semibold">{location.latitude.toFixed(6)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-600 font-medium">Longitude:</span>
                      <span className="text-text-900 font-semibold">{location.longitude.toFixed(6)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-600 font-medium">Accuracy:</span>
                      <span className="text-text-900 font-semibold">{Math.round(location.accuracy)}m</span>
                    </div>
                  </div>
                </div>
              )}

              {locationError && (
                <div className="card bg-red-50 border-red-300">
                  <p className="text-sm text-red-800 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{locationError}</span>
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="latitude" className="text-sm font-semibold text-text-700 mb-2 block">
                    Latitude
                  </label>
                  <input
                    id="latitude"
                    type="number"
                    value={formData.latitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                    placeholder="Auto-filled"
                    className="input-field"
                    required
                    step="any"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="longitude" className="text-sm font-semibold text-text-700 mb-2 block">
                    Longitude
                  </label>
                  <input
                    id="longitude"
                    type="number"
                    value={formData.longitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                    placeholder="Auto-filled"
                    className="input-field"
                    required
                    step="any"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Waste Center Selection */}
            {filteredCenters.length > 0 && (
              <div className="space-y-3">
                <label className="label-field flex items-center gap-2">
                  <span>♻️</span>
                  <span>PREFERRED WASTE CENTER (Optional)</span>
                </label>
                
                {loadingCenters ? (
                  <div className="bg-background-50 p-8 rounded-lg border-2 border-text-300 text-center">
                    <span className="animate-spin text-4xl">🔄</span>
                    <p className="text-text-600 mt-2">Loading waste centers...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">ℹ️</span>
                        <div className="text-sm">
                          <p className="font-semibold text-blue-900 mb-1">
                            {filteredCenters.length} waste center{filteredCenters.length > 1 ? 's' : ''} found that accept your selected crop types
                          </p>
                          <p className="text-blue-800 text-xs">
                            {formData.latitude && formData.longitude 
                              ? 'Centers are sorted by distance from your location' 
                              : 'Add your location to see distance information'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                      {filteredCenters.map((center) => (
                        <label
                          key={center._id}
                          className={`card cursor-pointer transition-all hover:shadow-lg ${
                            formData.preferredCenterId === center._id 
                              ? 'bg-gradient-to-br from-primary-50 to-accent-50 border-2 border-primary-500' 
                              : 'bg-white border-2 border-text-300 hover:border-primary-300'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="wasteCenter"
                              value={center._id}
                              checked={formData.preferredCenterId === center._id}
                              onChange={(e) => setFormData({ ...formData, preferredCenterId: e.target.value })}
                              disabled={loading}
                              className="w-5 h-5 text-primary-600 mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="font-bold text-text-900 text-base">{center.name}</h3>
                                  {center.distance !== undefined && (
                                    <p className="text-xs text-primary-700 font-semibold mt-1">
                                      📍 {center.distance.toFixed(1)} km away
                                    </p>
                                  )}
                                </div>
                                <span className="text-2xl">♻️</span>
                              </div>
                              
                              <div className="space-y-1 text-xs text-text-600">
                                <p className="flex items-center gap-1">
                                  <span>📍</span>
                                  <span className="font-semibold">{center.city}, {center.division}</span>
                                </p>
                                <p className="text-xs line-clamp-1">{center.address}</p>
                                <p className="flex items-center gap-1">
                                  <span>📞</span>
                                  <span>{center.contactNumber}</span>
                                </p>
                                <p className="flex items-center gap-1">
                                  <span>🌾</span>
                                  <span>
                                    {center.acceptedCropTypes.includes("All") 
                                      ? "Accepts all crop types" 
                                      : center.acceptedCropTypes.slice(0, 3).join(", ") + 
                                        (center.acceptedCropTypes.length > 3 ? ` +${center.acceptedCropTypes.length - 3} more` : '')}
                                  </span>
                                </p>
                                <p className="flex items-center gap-1">
                                  <span>📦</span>
                                  <span>{center.currentCapacity}/{center.maxCapacity} tons</span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>

                    {formData.preferredCenterId && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, preferredCenterId: '' })}
                        className="btn-outline w-full text-sm"
                        disabled={loading}
                      >
                        Clear Selection
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* No Centers Warning */}
            {formData.cropTypes.length > 0 && filteredCenters.length === 0 && !loadingCenters && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-xl p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">⚠️</span>
                  <div>
                    <p className="font-bold text-yellow-900 mb-2 text-lg">No Matching Waste Centers</p>
                    <p className="text-sm text-yellow-800 mb-2">
                      Currently, there are no waste centers registered that accept the crop types you've selected.
                    </p>
                    <p className="text-xs text-yellow-700">
                      You can still submit your report. We'll notify you when a suitable center becomes available.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-widest"
              disabled={loading || !formData.latitude || !formData.longitude || formData.cropTypes.length === 0}
            >
              {loading ? (
                <>
                  <span className="animate-spin text-xl">⏳</span>
                  <span>SUBMITTING...</span>
                </>
              ) : (
                <>
                  <span>♻️ SUBMIT REPORT</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info Card */}
        <div className="card bg-primary-50 border-primary-300">
          <div className="flex items-start gap-3">
            <span className="text-3xl">💡</span>
            <div className="text-sm">
              <h3 className="font-bold text-text-900 mb-2">Why Report Crop Waste?</h3>
              <ul className="space-y-1 text-text-700">
                <li>• Helps track agricultural waste for recycling initiatives</li>
                <li>• Contributes to sustainable farming practices</li>
                <li>• Enables better waste management planning</li>
                <li>• Supports circular economy in agriculture</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
