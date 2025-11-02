import { useState } from "react";
import type { Route } from "./+types/farming-tools";
import { Link } from "react-router";
import { API_ENDPOINTS, apiRequest } from "../config/api";
import jsPDF from "jspdf";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Farming Tools & Calculators - Cache Me If You Can" },
    { name: "description", content: "Calculate water consumption, fertilizer requirements, and electricity costs for your farm" },
  ];
}

export default function FarmingTools() {
  const [activeTab, setActiveTab] = useState<"water" | "fertilizer" | "electricity">("water");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  // Water consumption form
  const [waterForm, setWaterForm] = useState({
    watertype: "",
    croptype: "",
    area: "",
  });

  // Fertilizer form
  const [fertilizerForm, setFertilizerForm] = useState({
    croptype: "",
    area: "",
  });

  // Electricity form
  const [electricityForm, setElectricityForm] = useState({
    region: "",
    tubewell: "",
    waterPump: "",
    fan: "",
    light: "",
    mill: "",
    thresher: "",
    waterCooler: "",
    motorTools: "",
  });

  const cropTypes = [
    "rice", "wheat", "maize", "sugarcane", "cotton", "potato", 
    "tomato", "onion", "cabbage", "millet", "lentil", "mustard", "groundnut"
  ];

  const regions = [
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

      // Backend returns raw number as data
      setResult({
        type: "water",
        data: {
          waterRequired: response.data,
          croptype: waterForm.croptype,
          area: waterForm.area,
        },
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
      // Build usage object with only non-empty values
      const usage: any = {};
      if (electricityForm.tubewell) usage.tubewell = parseFloat(electricityForm.tubewell);
      if (electricityForm.waterPump) usage.waterPump = parseFloat(electricityForm.waterPump);
      if (electricityForm.fan) usage.fan = parseFloat(electricityForm.fan);
      if (electricityForm.light) usage.light = parseFloat(electricityForm.light);
      if (electricityForm.mill) usage.mill = parseFloat(electricityForm.mill);
      if (electricityForm.thresher) usage.thresher = parseFloat(electricityForm.thresher);
      if (electricityForm.waterCooler) usage.waterCooler = parseFloat(electricityForm.waterCooler);
      if (electricityForm.motorTools) usage.motorTools = parseFloat(electricityForm.motorTools);

      const response = await apiRequest(`${API_ENDPOINTS.TOOLS}/electricity-bill-estimator`, {
        method: "POST",
        body: JSON.stringify({
          region: electricityForm.region,
          usage,
        }),
      });

      setResult({
        type: "electricity",
        data: response.data,
        message: response.message,
      });
    } catch (err: any) {
      setError(err.message || "Failed to calculate electricity bill");
    } finally {
      setLoading(false);
    }
  };

  const downloadElectricityBillPDF = () => {
    if (!result || result.type !== "electricity") return;

    const doc = new jsPDF();
    const data = result.data;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // ============= HEADER SECTION =============
    // Header background with gradient effect (using multiple rectangles)
    doc.setFillColor(245, 158, 11);
    doc.rect(0, 0, pageWidth, 45, "F");
    doc.setFillColor(217, 119, 6);
    doc.rect(0, 35, pageWidth, 10, "F");
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("ELECTRICITY BILL ESTIMATE", pageWidth / 2, 20, { align: "center" });
    
    // Subtitle
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Cache Me If You Can - Farming Tools", pageWidth / 2, 30, { align: "center" });
    
    // ============= INFO BOX =============
    let yPos = 55;
    doc.setFillColor(255, 251, 235); // Light amber background
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, yPos, pageWidth - 30, 20, 3, 3, "FD");
    
    doc.setTextColor(120, 53, 15); // Dark amber
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${new Date().toLocaleString('en-US', { 
      dateStyle: 'full', 
      timeStyle: 'short' 
    })}`, 20, yPos + 8);
    doc.text(`Region: ${electricityForm.region}`, 20, yPos + 15);
    
    // ============= SUMMARY SECTION =============
    yPos += 30;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Bill Summary", 15, yPos);
    
    yPos += 10;
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(15, yPos - 5, pageWidth - 30, 60, 2, 2, "F");
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    const summaryItems = [
      { label: "Total Units Consumed", value: data.totalUnits },
      { label: "Unit Rate", value: data.unitRate },
      { label: "Energy Cost", value: data.energyCost },
      { label: "Fixed Charges", value: data.fixedCost },
      { label: "FCA (Fuel Cost Adjustment)", value: data.fcaCost },
      { label: "Electricity Duty (1.5%)", value: data.dutyCost },
      { label: "GST (18%)", value: data.gstCost },
    ];
    
    summaryItems.forEach((item, index) => {
      doc.setTextColor(60, 60, 60);
      doc.text(item.label, 20, yPos + (index * 8));
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(item.value, pageWidth - 20, yPos + (index * 8), { align: "right" });
      doc.setFont("helvetica", "normal");
    });
    
    // ============= TOTAL SECTION =============
    yPos += 65;
    doc.setFillColor(245, 158, 11);
    doc.roundedRect(15, yPos, pageWidth - 30, 15, 3, 3, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL ESTIMATED BILL", 20, yPos + 10);
    doc.setFontSize(14);
    doc.text(data.totalCost, pageWidth - 20, yPos + 10, { align: "right" });
    
    // ============= EQUIPMENT BREAKDOWN =============
    yPos += 25;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text("Equipment Usage Breakdown", 15, yPos);
    
    yPos += 8;
    
    // Table header
    doc.setFillColor(245, 158, 11);
    doc.rect(15, yPos - 3, pageWidth - 30, 10, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Equipment", 20, yPos + 4);
    doc.text("Hours", 90, yPos + 4);
    doc.text("Energy (kWh)", 120, yPos + 4);
    doc.text("Cost", pageWidth - 20, yPos + 4, { align: "right" });
    
    yPos += 10;
    
    // Table rows
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    data.breakdown.forEach((item: any, index: number) => {
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = 20;
      }
      
      // Alternating row colors
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(15, yPos - 4, pageWidth - 30, 8, "F");
      }
      
      doc.setFontSize(9);
      doc.text(item.equipment, 20, yPos + 2);
      doc.text(item.hoursUsed.replace(' hours', 'h'), 90, yPos + 2);
      doc.text(item.energyKWh, 120, yPos + 2);
      doc.text(item.cost, pageWidth - 20, yPos + 2, { align: "right" });
      yPos += 8;
    });
    
    // ============= ADVICE SECTION =============
    if (data.advice) {
      yPos += 10;
      if (yPos > pageHeight - 50) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFillColor(209, 250, 229); // Light green
      doc.setDrawColor(16, 185, 129);
      doc.setLineWidth(1);
      doc.roundedRect(15, yPos, pageWidth - 30, 30, 3, 3, "FD");
      
      doc.setTextColor(6, 78, 59); // Dark green
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Energy Saving Advice", 20, yPos + 8);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const adviceLines = doc.splitTextToSize(data.advice, pageWidth - 50);
      doc.text(adviceLines, 20, yPos + 16);
    }
    
    // ============= FOOTER ON ALL PAGES =============
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer line
      doc.setDrawColor(245, 158, 11);
      doc.setLineWidth(0.5);
      doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);
      
      // Footer text
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
      doc.text(
        "Cache Me If You Can - Farming Tools",
        pageWidth / 2,
        pageHeight - 6,
        { align: "center" }
      );
    }
    
    // Save PDF with formatted filename
    const dateStr = new Date().toISOString().split('T')[0];
    doc.save(`Electricity-Bill-${electricityForm.region}-${dateStr}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-primary-200 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/farmer-dashboard" className="flex items-center gap-2 text-primary-700 hover:text-primary-800 font-semibold">
              <span>←</span>
              <span>Back to Dashboard</span>
            </Link>
            <h1 className="text-2xl font-bold text-text-900">
              🧮 Farming Calculators
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Tabs */}
        <div className="card bg-white mb-6">
          <div className="flex flex-wrap gap-2 border-b border-text-200 pb-4">
            <button
              onClick={() => {
                setActiveTab("water");
                setResult(null);
                setError("");
              }}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "water"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100"
              }`}
            >
              💧 Water Calculator
            </button>
            <button
              onClick={() => {
                setActiveTab("fertilizer");
                setResult(null);
                setError("");
              }}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "fertilizer"
                  ? "bg-green-600 text-white shadow-md"
                  : "bg-green-50 text-green-700 hover:bg-green-100"
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
                  ? "bg-amber-600 text-white shadow-md"
                  : "bg-amber-50 text-amber-700 hover:bg-amber-100"
              }`}
            >
              ⚡ Electricity Calculator
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="card bg-white">
            {activeTab === "water" && (
              <div>
                <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <span>💧</span>
                  <span>Water Consumption Calculator</span>
                </h2>
                <p className="text-sm text-text-600 mb-6">
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
                      required
                      className="w-full px-4 py-3 border-2 border-text-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      required
                      className="w-full px-4 py-3 border-2 border-text-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select crop type</option>
                      {cropTypes.map((crop) => (
                        <option key={crop} value={crop}>
                          {crop.charAt(0).toUpperCase() + crop.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-700 mb-2">
                      Area (in Acres)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={waterForm.area}
                      onChange={(e) => setWaterForm({ ...waterForm, area: e.target.value })}
                      required
                      placeholder="Enter area in acres"
                      className="w-full px-4 py-3 border-2 border-text-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary py-3 text-lg font-bold"
                  >
                    {loading ? "Calculating..." : "Calculate Water Need"}
                  </button>
                </form>
              </div>
            )}

            {activeTab === "fertilizer" && (
              <div>
                <h2 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                  <span>🌱</span>
                  <span>Fertilizer Calculator</span>
                </h2>
                <p className="text-sm text-text-600 mb-6">
                  Get fertilizer recommendations with optimal timing and application schedule.
                </p>

                <form onSubmit={handleFertilizerSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-700 mb-2">
                      Crop Type
                    </label>
                    <select
                      value={fertilizerForm.croptype}
                      onChange={(e) => setFertilizerForm({ ...fertilizerForm, croptype: e.target.value })}
                      required
                      className="w-full px-4 py-3 border-2 border-text-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select crop type</option>
                      {cropTypes.map((crop) => (
                        <option key={crop} value={crop}>
                          {crop.charAt(0).toUpperCase() + crop.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text-700 mb-2">
                      Area (in Acres)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={fertilizerForm.area}
                      onChange={(e) => setFertilizerForm({ ...fertilizerForm, area: e.target.value })}
                      required
                      placeholder="Enter area in acres"
                      className="w-full px-4 py-3 border-2 border-text-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-lg font-bold transition-colors"
                  >
                    {loading ? "Calculating..." : "Calculate Fertilizer Need"}
                  </button>
                </form>
              </div>
            )}

            {activeTab === "electricity" && (
              <div>
                <h2 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
                  <span>⚡</span>
                  <span>Electricity Bill Estimator</span>
                </h2>
                <p className="text-sm text-text-600 mb-6">
                  Estimate your monthly electricity bill based on equipment usage.
                </p>

                <form onSubmit={handleElectricitySubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-700 mb-2">
                      Region (Electricity Provider)
                    </label>
                    <select
                      value={electricityForm.region}
                      onChange={(e) => setElectricityForm({ ...electricityForm, region: e.target.value })}
                      required
                      className="w-full px-4 py-3 border-2 border-text-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    >
                      <option value="">Select your region</option>
                      {regions.map((region) => (
                        <option key={region} value={region}>
                          {region}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="border-2 border-amber-200 rounded-lg p-4 bg-amber-50">
                    <h3 className="font-bold text-amber-900 mb-3">Equipment Usage (Hours per Month)</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-text-700 mb-1">
                          Tubewell (3700W)
                        </label>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={electricityForm.tubewell}
                          onChange={(e) => setElectricityForm({ ...electricityForm, tubewell: e.target.value })}
                          placeholder="Hours"
                          className="w-full px-3 py-2 border border-text-200 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-text-700 mb-1">
                          Water Pump (1000W)
                        </label>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={electricityForm.waterPump}
                          onChange={(e) => setElectricityForm({ ...electricityForm, waterPump: e.target.value })}
                          placeholder="Hours"
                          className="w-full px-3 py-2 border border-text-200 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-text-700 mb-1">
                          Fan (75W)
                        </label>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={electricityForm.fan}
                          onChange={(e) => setElectricityForm({ ...electricityForm, fan: e.target.value })}
                          placeholder="Hours"
                          className="w-full px-3 py-2 border border-text-200 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-text-700 mb-1">
                          Light (15W)
                        </label>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={electricityForm.light}
                          onChange={(e) => setElectricityForm({ ...electricityForm, light: e.target.value })}
                          placeholder="Hours"
                          className="w-full px-3 py-2 border border-text-200 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-text-700 mb-1">
                          Mill (1500W)
                        </label>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={electricityForm.mill}
                          onChange={(e) => setElectricityForm({ ...electricityForm, mill: e.target.value })}
                          placeholder="Hours"
                          className="w-full px-3 py-2 border border-text-200 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-text-700 mb-1">
                          Thresher (2500W)
                        </label>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={electricityForm.thresher}
                          onChange={(e) => setElectricityForm({ ...electricityForm, thresher: e.target.value })}
                          placeholder="Hours"
                          className="w-full px-3 py-2 border border-text-200 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-text-700 mb-1">
                          Water Cooler (200W)
                        </label>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={electricityForm.waterCooler}
                          onChange={(e) => setElectricityForm({ ...electricityForm, waterCooler: e.target.value })}
                          placeholder="Hours"
                          className="w-full px-3 py-2 border border-text-200 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-text-700 mb-1">
                          Motor Tools (500W)
                        </label>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={electricityForm.motorTools}
                          onChange={(e) => setElectricityForm({ ...electricityForm, motorTools: e.target.value })}
                          placeholder="Hours"
                          className="w-full px-3 py-2 border border-text-200 rounded text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg text-lg font-bold transition-colors"
                  >
                    {loading ? "Calculating..." : "Estimate Bill"}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="card bg-white">
            <h2 className="text-xl font-bold text-text-900 mb-4 flex items-center gap-2">
              <span>📊</span>
              <span>Results</span>
            </h2>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 font-semibold">⚠️ {error}</p>
              </div>
            )}

            {!result && !error && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🧮</div>
                <p className="text-text-600">
                  Fill out the form and click calculate to see results
                </p>
              </div>
            )}

            {result && result.type === "water" && (
              <div className="space-y-4">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-blue-900 mb-2">💧 Water Required</h3>
                  <p className="text-4xl font-bold text-blue-700">
                    {typeof result.data.waterRequired === 'number' 
                      ? result.data.waterRequired.toLocaleString() 
                      : result.data.waterRequired} <span className="text-2xl">m³</span>
                  </p>
                  <p className="text-sm text-blue-600 mt-2">
                    Total water consumption for the season
                  </p>
                  <p className="text-xs text-blue-500 mt-2">
                    Crop: <strong>{result.data.croptype}</strong> | Area: <strong>{result.data.area} acres</strong>
                  </p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Tip:</strong> Consider drip irrigation to save up to 50% water!
                  </p>
                </div>
              </div>
            )}

            {result && result.type === "fertilizer" && (
              <div className="space-y-4">
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-green-900 mb-2">🌱 Fertilizer Requirement</h3>
                  <p className="text-3xl font-bold text-green-700 mb-2">
                    {result.data.totalFertilizerKg}
                  </p>
                  <p className="text-sm text-green-600">
                    Per Acre: {result.data.fertilizerPerAcre}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4">
                  <h4 className="font-bold text-green-900 mb-2">📅 Application Timing:</h4>
                  <p className="text-sm text-green-800 mb-3">{result.data.timing}</p>
                  <h4 className="font-bold text-green-900 mb-2">🔄 Next Application:</h4>
                  <p className="text-sm text-green-800">{result.data.nextUse}</p>
                </div>
              </div>
            )}

            {result && result.type === "electricity" && (
              <div className="space-y-4">
                <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-amber-900">⚡ Estimated Bill</h3>
                    <button
                      onClick={downloadElectricityBillPDF}
                      className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                    >
                      📄 Download PDF
                    </button>
                  </div>
                  <p className="text-4xl font-bold text-amber-700">
                    {result.data.totalCost}
                  </p>
                  <p className="text-sm text-amber-600 mt-2">
                    Total Units: {result.data.totalUnits}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-lg p-4">
                  <h4 className="font-bold text-amber-900 mb-2">💰 Cost Breakdown:</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-amber-700">Energy Cost:</span>
                      <span className="font-semibold text-amber-900">{result.data.energyCost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-700">Fixed Charges:</span>
                      <span className="font-semibold text-amber-900">{result.data.fixedCost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-700">FCA:</span>
                      <span className="font-semibold text-amber-900">{result.data.fcaCost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-700">Duty:</span>
                      <span className="font-semibold text-amber-900">{result.data.dutyCost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-700">GST (18%):</span>
                      <span className="font-semibold text-amber-900">{result.data.gstCost}</span>
                    </div>
                  </div>
                </div>

                {result.data.breakdown && result.data.breakdown.length > 0 && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg p-4">
                    <h4 className="font-bold text-amber-900 mb-3">📋 Equipment Usage:</h4>
                    <div className="space-y-2">
                      {result.data.breakdown.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center text-sm bg-white p-2 rounded">
                          <div>
                            <span className="font-semibold text-amber-800">{item.equipment}</span>
                            <span className="text-amber-600 text-xs ml-2">({item.hoursUsed})</span>
                          </div>
                          <div className="text-right">
                            <div className="text-amber-700">{item.energyKWh}</div>
                            <div className="text-amber-900 font-semibold text-xs">{item.cost}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.data.advice && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800">
                      💡 <strong>Advice:</strong> {result.data.advice}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
