import { useState } from "react";
import { Link } from "react-router";
import { apiRequest } from "../config/api";
import { API_ENDPOINTS } from "../config/api";

export default function FarmingTools() {
  const [activeTab, setActiveTab] = useState<"water" | "fertilizer" | "electricity">("water");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);

  // Water Consumption State
  const [waterForm, setWaterForm] = useState({
    watertype: "",
    croptype: "",
    area: "",
  });

  // Fertilizer Consumption State
  const [fertilizerForm, setFertilizerForm] = useState({
    croptype: "",
    area: "",
  });

  // Electricity Bill State
  const [electricityForm, setElectricityForm] = useState({
    region: "",
    usage: {
      tubewell: 0,
      waterPump: 0,
      fan: 0,
      light: 0,
      mill: 0,
      thresher: 0,
      waterCooler: 0,
      motorTools: 0,
    },
  });

  const cropOptions = [
    "rice", "wheat", "maize", "sugarcane", "cotton", "potato", 
    "tomato", "onion", "cabbage", "millet", "lentil", "mustard", 
    "groundnut", "banana"
  ];

  const regionOptions = [
    "K-Electric", "LESCO", "IESCO", "FESCO", "GEPCO", 
    "MEPCO", "HESCO", "SEPCO", "PESCO", "QESCO"
  ];

  const handleWaterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await apiRequest(`${API_ENDPOINTS.TOOLS}/water-consumption`, {
        method: "POST",
        body: JSON.stringify({
          watertype: waterForm.watertype,
          croptype: waterForm.croptype,
          area: parseFloat(waterForm.area),
        }),
      });

      setResult({
        type: "water",
        data: response.data,
        message: response.message,
      });
    } catch (err: any) {
      setError(err.message || "Failed to calculate water consumption");
    } finally {
      setLoading(false);
    }
  };

  const handleFertilizerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await apiRequest(`${API_ENDPOINTS.TOOLS}/fertilizer-consumption`, {
        method: "POST",
        body: JSON.stringify({
          croptype: fertilizerForm.croptype,
          area: parseFloat(fertilizerForm.area),
        }),
      });

      setResult({
        type: "fertilizer",
        data: response.data,
        message: response.message,
      });
    } catch (err: any) {
      setError(err.message || "Failed to calculate fertilizer consumption");
    } finally {
      setLoading(false);
    }
  };

  const handleElectricitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await apiRequest(`${API_ENDPOINTS.TOOLS}/electricity-bill-estimator`, {
        method: "POST",
        body: JSON.stringify({
          region: electricityForm.region,
          usage: electricityForm.usage,
        }),
      });

      setResult({
        type: "electricity",
        data: response.data,
        message: response.message,
      });
    } catch (err: any) {
      setError(err.message || "Failed to estimate electricity bill");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-700 to-primary-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">🌾 Farming Tools & Calculators</h1>
              <p className="text-primary-100">Smart calculations for efficient farming</p>
            </div>
            <Link
              to="/farmer-dashboard"
              className="btn-outline !border-white !text-white hover:!bg-white hover:!text-primary-700 transition-all"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="card bg-white mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setActiveTab("water");
                setResult(null);
                setError("");
              }}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "water"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg"
                  : "bg-blue-100 text-blue-800 hover:bg-blue-200"
              }`}
            >
              💧 Water Consumption
            </button>
            <button
              onClick={() => {
                setActiveTab("fertilizer");
                setResult(null);
                setError("");
              }}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "fertilizer"
                  ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg"
                  : "bg-green-100 text-green-800 hover:bg-green-200"
              }`}
            >
              🌱 Fertilizer Calculator
            </button>
            <button
              onClick={() => {
                setActiveTab("electricity");
                setResult(null);
                setError("");
              }}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "electricity"
                  ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg"
                  : "bg-amber-100 text-amber-800 hover:bg-amber-200"
              }`}
            >
              ⚡ Electricity Estimator
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-2 border-red-300 text-red-800 rounded-lg">
            <strong>⚠️ Error:</strong> {error}
          </div>
        )}

        {/* Water Consumption Tab */}
        {activeTab === "water" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form */}
            <div className="card bg-white">
              <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                <span>💧</span>
                <span>Water Consumption Calculator</span>
              </h2>
              <p className="text-text-600 mb-6">
                Calculate the water requirements for your crops based on area and crop type.
              </p>

              <form onSubmit={handleWaterSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-text-700 mb-2">
                    Water Type
                  </label>
                  <select
                    value={waterForm.watertype}
                    onChange={(e) => setWaterForm({ ...waterForm, watertype: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Select water type</option>
                    <option value="canal">Canal Water</option>
                    <option value="tubewell">Tubewell</option>
                    <option value="rainwater">Rainwater</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-700 mb-2">
                    Crop Type
                  </label>
                  <select
                    value={waterForm.croptype}
                    onChange={(e) => setWaterForm({ ...waterForm, croptype: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Select crop type</option>
                    {cropOptions.map((crop) => (
                      <option key={crop} value={crop}>
                        {crop.charAt(0).toUpperCase() + crop.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-700 mb-2">
                    Area (Acres)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={waterForm.area}
                    onChange={(e) => setWaterForm({ ...waterForm, area: e.target.value })}
                    className="input-field"
                    placeholder="Enter area in acres"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? "Calculating..." : "Calculate Water Requirement"}
                </button>
              </form>
            </div>

            {/* Results */}
            {result && result.type === "water" && (
              <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300">
                <h3 className="text-xl font-bold text-blue-900 mb-4">📊 Calculation Results</h3>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                    <p className="text-sm text-blue-700 mb-1">Total Water Required</p>
                    <p className="text-3xl font-bold text-blue-900">{result.data.toFixed(2)} m³</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Crop:</strong> {waterForm.croptype.charAt(0).toUpperCase() + waterForm.croptype.slice(1)}
                    </p>
                    <p className="text-sm text-blue-800">
                      <strong>Area:</strong> {waterForm.area} acres
                    </p>
                    <p className="text-sm text-blue-800">
                      <strong>Water Source:</strong> {waterForm.watertype.charAt(0).toUpperCase() + waterForm.watertype.slice(1)}
                    </p>
                  </div>
                  <div className="bg-blue-900 text-white rounded-lg p-3">
                    <p className="text-xs font-semibold mb-1">💡 TIP</p>
                    <p className="text-sm">
                      Apply water in early morning or late evening to reduce evaporation losses.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Fertilizer Calculator Tab */}
        {activeTab === "fertilizer" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form */}
            <div className="card bg-white">
              <h2 className="text-2xl font-bold text-green-900 mb-4 flex items-center gap-2">
                <span>🌱</span>
                <span>Fertilizer Calculator</span>
              </h2>
              <p className="text-text-600 mb-6">
                Calculate the optimal fertilizer amount and application timing for your crops.
              </p>

              <form onSubmit={handleFertilizerSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-text-700 mb-2">
                    Crop Type
                  </label>
                  <select
                    value={fertilizerForm.croptype}
                    onChange={(e) => setFertilizerForm({ ...fertilizerForm, croptype: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Select crop type</option>
                    {cropOptions.map((crop) => (
                      <option key={crop} value={crop}>
                        {crop.charAt(0).toUpperCase() + crop.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-700 mb-2">
                    Area (Acres)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={fertilizerForm.area}
                    onChange={(e) => setFertilizerForm({ ...fertilizerForm, area: e.target.value })}
                    className="input-field"
                    placeholder="Enter area in acres"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full !bg-green-700 hover:!bg-green-800"
                >
                  {loading ? "Calculating..." : "Calculate Fertilizer Requirement"}
                </button>
              </form>
            </div>

            {/* Results */}
            {result && result.type === "fertilizer" && (
              <div className="card bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300">
                <h3 className="text-xl font-bold text-green-900 mb-4">📊 Fertilizer Recommendations</h3>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                    <p className="text-sm text-green-700 mb-1">Total Fertilizer Required</p>
                    <p className="text-3xl font-bold text-green-900">{result.data.totalFertilizerKg}</p>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <p className="text-sm text-green-800 mb-2">
                      <strong>Per Acre:</strong> {result.data.fertilizerPerAcre}
                    </p>
                    <p className="text-sm text-green-800 mb-2">
                      <strong>Crop:</strong> {result.data.croptype.charAt(0).toUpperCase() + result.data.croptype.slice(1)}
                    </p>
                    <p className="text-sm text-green-800">
                      <strong>Total Area:</strong> {result.data.area} acres
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-green-700 to-green-800 text-white rounded-lg p-4">
                    <p className="text-xs font-semibold mb-2">⏰ APPLICATION TIMING</p>
                    <p className="text-sm mb-3">{result.data.timing}</p>
                    <p className="text-xs font-semibold mb-1">🔄 NEXT USE</p>
                    <p className="text-sm">{result.data.nextUse}</p>
                  </div>

                  <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-3">
                    <p className="text-xs font-semibold text-yellow-900 mb-1">⚠️ IMPORTANT</p>
                    <p className="text-sm text-yellow-900">
                      Always conduct soil testing before application. Over-fertilization can harm crops and environment.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Electricity Estimator Tab */}
        {activeTab === "electricity" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form */}
            <div className="card bg-white">
              <h2 className="text-2xl font-bold text-amber-900 mb-4 flex items-center gap-2">
                <span>⚡</span>
                <span>Electricity Bill Estimator</span>
              </h2>
              <p className="text-text-600 mb-6">
                Estimate your farm's electricity bill based on equipment usage.
              </p>

              <form onSubmit={handleElectricitySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-text-700 mb-2">
                    Electricity Provider (Region)
                  </label>
                  <select
                    value={electricityForm.region}
                    onChange={(e) => setElectricityForm({ ...electricityForm, region: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Select your region</option>
                    {regionOptions.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-amber-900 mb-3">
                    Equipment Usage (Hours per Month)
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.keys(electricityForm.usage).map((equipment) => (
                      <div key={equipment}>
                        <label className="block text-xs font-medium text-text-700 mb-1">
                          {equipment.charAt(0).toUpperCase() + equipment.slice(1).replace(/([A-Z])/g, ' $1')}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={electricityForm.usage[equipment as keyof typeof electricityForm.usage]}
                          onChange={(e) =>
                            setElectricityForm({
                              ...electricityForm,
                              usage: {
                                ...electricityForm.usage,
                                [equipment]: parseInt(e.target.value) || 0,
                              },
                            })
                          }
                          className="input-field text-sm"
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full !bg-amber-700 hover:!bg-amber-800"
                >
                  {loading ? "Calculating..." : "Estimate Electricity Bill"}
                </button>
              </form>
            </div>

            {/* Results */}
            {result && result.type === "electricity" && (
              <div className="card bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-300">
                <h3 className="text-xl font-bold text-amber-900 mb-4">💡 Bill Estimate</h3>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border-2 border-amber-300">
                    <p className="text-sm text-amber-700 mb-1">Total Estimated Bill</p>
                    <p className="text-4xl font-bold text-amber-900">{result.data.totalCost}</p>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-amber-200 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-600">Total Units:</span>
                      <span className="font-semibold text-text-900">{result.data.totalUnits}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-600">Unit Rate:</span>
                      <span className="font-semibold text-text-900">{result.data.unitRate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-600">Energy Cost:</span>
                      <span className="font-semibold text-text-900">{result.data.energyCost}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-600">Fixed Charges:</span>
                      <span className="font-semibold text-text-900">{result.data.fixedCost}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-600">FCA:</span>
                      <span className="font-semibold text-text-900">{result.data.fcaCost}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-600">Duty:</span>
                      <span className="font-semibold text-text-900">{result.data.dutyCost}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-2">
                      <span className="text-text-600">GST:</span>
                      <span className="font-semibold text-text-900">{result.data.gstCost}</span>
                    </div>
                  </div>

                  {result.data.breakdown && result.data.breakdown.length > 0 && (
                    <div className="bg-white rounded-lg p-3 border border-amber-200">
                      <p className="text-sm font-semibold text-amber-900 mb-2">Equipment Breakdown:</p>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {result.data.breakdown.map((item: any, index: number) => (
                          <div key={index} className="text-xs text-text-700 flex justify-between">
                            <span>{item.equipment}: {item.hoursUsed}</span>
                            <span className="font-semibold">{item.cost}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-gradient-to-r from-amber-700 to-amber-800 text-white rounded-lg p-4">
                    <p className="text-xs font-semibold mb-2">💡 ENERGY SAVING TIP</p>
                    <p className="text-sm">{result.data.advice}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
