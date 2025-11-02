import { useState, useEffect } from "react";
import { Link } from "react-router";
import { API_ENDPOINTS, apiRequest } from "../config/api";

export function meta() {
  return [
    { title: "Loan Application - Cache Me If You Can" },
    { name: "description", content: "Apply for agricultural loans and subsidies" },
  ];
}

type LoanApplication = {
  _id: string;
  loanType: string;
  amount: number;
  purpose: string;
  duration: number;
  farmSize: number;
  annualIncome: number;
  collateral: string;
  cnicNumber: string;
  status: string;
  reviewedBy?: { username: string; email: string };
  reviewDate?: string;
  rejectionReason?: string;
  approvalNotes?: string;
  disbursementDate?: string;
  createdAt: string;
};

export default function LoanApplication() {
  const [activeTab, setActiveTab] = useState<"apply" | "myApplications">("apply");
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    loanType: "",
    amount: "",
    purpose: "",
    duration: "",
    farmSize: "",
    annualIncome: "",
    collateral: "",
    cnicNumber: "",
  });

  const loanTypes = [
    "Agricultural Equipment",
    "Crop Production",
    "Livestock Purchase",
    "Land Development",
    "Irrigation System",
    "Storage Facility",
    "Working Capital",
    "Other",
  ];

  const fetchMyApplications = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiRequest(`${API_ENDPOINTS.LOANS}/my-applications`, {
        method: "GET",
      });
      setApplications(response.data.loans || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch loan applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "myApplications") {
      fetchMyApplications();
    }
  }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await apiRequest(`${API_ENDPOINTS.LOANS}/apply`, {
        method: "POST",
        body: JSON.stringify({
          loanType: formData.loanType,
          amount: parseFloat(formData.amount),
          purpose: formData.purpose,
          duration: parseInt(formData.duration),
          farmSize: parseFloat(formData.farmSize),
          annualIncome: parseFloat(formData.annualIncome),
          collateral: formData.collateral,
          cnicNumber: formData.cnicNumber,
        }),
      });

      setSuccess("Loan application submitted successfully!");
      setFormData({
        loanType: "",
        amount: "",
        purpose: "",
        duration: "",
        farmSize: "",
        annualIncome: "",
        collateral: "",
        cnicNumber: "",
      });

      // Switch to applications tab after 2 seconds
      setTimeout(() => {
        setActiveTab("myApplications");
        setSuccess("");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to submit loan application");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
      "under-review": { bg: "bg-blue-100", text: "text-blue-800", label: "Under Review" },
      approved: { bg: "bg-green-100", text: "text-green-800", label: "Approved" },
      rejected: { bg: "bg-red-100", text: "text-red-800", label: "Rejected" },
      disbursed: { bg: "bg-purple-100", text: "text-purple-800", label: "Disbursed" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text} border-2`}>
        {config.label}
      </span>
    );
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
              🏦 Loans & Subsidies
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Tabs */}
        <div className="card bg-white mb-6">
          <div className="flex gap-2 border-b border-text-200 pb-4">
            <button
              onClick={() => setActiveTab("apply")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "apply"
                  ? "bg-primary-600 text-white shadow-md"
                  : "bg-primary-50 text-primary-700 hover:bg-primary-100"
              }`}
            >
              📝 Apply for Loan
            </button>
            <button
              onClick={() => setActiveTab("myApplications")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === "myApplications"
                  ? "bg-primary-600 text-white shadow-md"
                  : "bg-primary-50 text-primary-700 hover:bg-primary-100"
              }`}
            >
              📋 My Applications
            </button>
          </div>
        </div>

        {/* Apply Tab */}
        {activeTab === "apply" && (
          <div className="card bg-white max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-text-900 mb-6 flex items-center gap-2">
              <span>📝</span>
              <span>Loan Application Form</span>
            </h2>

            {success && (
              <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <p className="text-green-800 font-semibold">✅ {success}</p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <p className="text-red-800 font-semibold">⚠️ {error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Loan Type */}
                <div>
                  <label className="block text-sm font-semibold text-text-700 mb-2">
                    Loan Type *
                  </label>
                  <select
                    value={formData.loanType}
                    onChange={(e) => setFormData({ ...formData, loanType: e.target.value })}
                    required
                    className="w-full px-4 py-3 border-2 border-text-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select loan type</option>
                    {loanTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Loan Amount */}
                <div>
                  <label className="block text-sm font-semibold text-text-700 mb-2">
                    Loan Amount (Rs.) *
                  </label>
                  <input
                    type="number"
                    step="1000"
                    min="10000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    placeholder="e.g., 500000"
                    className="w-full px-4 py-3 border-2 border-text-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-semibold text-text-700 mb-2">
                    Loan Duration (Months) *
                  </label>
                  <input
                    type="number"
                    min="6"
                    max="240"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    required
                    placeholder="e.g., 24"
                    className="w-full px-4 py-3 border-2 border-text-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Farm Size */}
                <div>
                  <label className="block text-sm font-semibold text-text-700 mb-2">
                    Farm Size (Acres) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={formData.farmSize}
                    onChange={(e) => setFormData({ ...formData, farmSize: e.target.value })}
                    required
                    placeholder="e.g., 10"
                    className="w-full px-4 py-3 border-2 border-text-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Annual Income */}
                <div>
                  <label className="block text-sm font-semibold text-text-700 mb-2">
                    Annual Income (Rs.) *
                  </label>
                  <input
                    type="number"
                    step="10000"
                    min="0"
                    value={formData.annualIncome}
                    onChange={(e) => setFormData({ ...formData, annualIncome: e.target.value })}
                    required
                    placeholder="e.g., 800000"
                    className="w-full px-4 py-3 border-2 border-text-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* CNIC Number */}
                <div>
                  <label className="block text-sm font-semibold text-text-700 mb-2">
                    CNIC Number *
                  </label>
                  <input
                    type="text"
                    value={formData.cnicNumber}
                    onChange={(e) => setFormData({ ...formData, cnicNumber: e.target.value })}
                    required
                    placeholder="12345-1234567-1"
                    maxLength={15}
                    className="w-full px-4 py-3 border-2 border-text-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-sm font-semibold text-text-700 mb-2">
                  Purpose of Loan *
                </label>
                <textarea
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  required
                  rows={3}
                  placeholder="Describe how you plan to use this loan..."
                  className="w-full px-4 py-3 border-2 border-text-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Collateral */}
              <div>
                <label className="block text-sm font-semibold text-text-700 mb-2">
                  Collateral Details *
                </label>
                <textarea
                  value={formData.collateral}
                  onChange={(e) => setFormData({ ...formData, collateral: e.target.value })}
                  required
                  rows={3}
                  placeholder="Describe the collateral you're offering (land, equipment, etc.)..."
                  className="w-full px-4 py-3 border-2 border-text-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-4 text-lg font-bold"
              >
                {loading ? "Submitting..." : "Submit Loan Application"}
              </button>
            </form>
          </div>
        )}

        {/* My Applications Tab */}
        {activeTab === "myApplications" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-text-900">
                My Loan Applications ({applications.length})
              </h2>
              <button
                onClick={fetchMyApplications}
                disabled={loading}
                className="btn-outline text-sm"
              >
                {loading ? "🔄 Loading..." : "🔄 Refresh"}
              </button>
            </div>

            {loading ? (
              <div className="card bg-white text-center py-12">
                <div className="flex items-center justify-center gap-2">
                  <span className="animate-spin text-4xl">🔄</span>
                  <span className="text-text-600">Loading applications...</span>
                </div>
              </div>
            ) : applications.length === 0 ? (
              <div className="card bg-white text-center py-12">
                <div className="text-5xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-text-900 mb-2">
                  No Applications Yet
                </h3>
                <p className="text-text-600 mb-4">
                  You haven't submitted any loan applications.
                </p>
                <button
                  onClick={() => setActiveTab("apply")}
                  className="btn-primary"
                >
                  Apply for Loan
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app._id} className="card bg-white hover:shadow-lg transition-shadow">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Application Details */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-text-900 mb-1">
                              {app.loanType}
                            </h3>
                            <p className="text-sm text-text-600">
                              Applied: {new Date(app.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {getStatusBadge(app.status)}
                        </div>

                        {/* Loan Info */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                            <p className="text-xs text-primary-700 mb-1">Amount</p>
                            <p className="text-lg font-bold text-primary-900">
                              Rs. {app.amount.toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-xs text-blue-700 mb-1">Duration</p>
                            <p className="text-lg font-bold text-blue-900">
                              {app.duration} months
                            </p>
                          </div>
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-xs text-green-700 mb-1">Farm Size</p>
                            <p className="text-lg font-bold text-green-900">
                              {app.farmSize} acres
                            </p>
                          </div>
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <p className="text-xs text-amber-700 mb-1">Income</p>
                            <p className="text-lg font-bold text-amber-900">
                              Rs. {app.annualIncome.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Purpose */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h4 className="font-bold text-gray-900 mb-2">Purpose:</h4>
                          <p className="text-sm text-gray-700">{app.purpose}</p>
                        </div>

                        {/* Approval Notes */}
                        {app.status === "approved" && app.approvalNotes && (
                          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                            <h4 className="font-bold text-green-900 mb-2">✅ Approval Notes:</h4>
                            <p className="text-sm text-green-800">{app.approvalNotes}</p>
                            {app.reviewedBy && (
                              <p className="text-xs text-green-600 mt-2">
                                Reviewed by: {app.reviewedBy.username}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Rejection Reason */}
                        {app.status === "rejected" && app.rejectionReason && (
                          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                            <h4 className="font-bold text-red-900 mb-2">❌ Rejection Reason:</h4>
                            <p className="text-sm text-red-800">{app.rejectionReason}</p>
                            {app.reviewedBy && (
                              <p className="text-xs text-red-600 mt-2">
                                Reviewed by: {app.reviewedBy.username}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Disbursement Info */}
                        {app.status === "disbursed" && app.disbursementDate && (
                          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                            <h4 className="font-bold text-purple-900 mb-2">💰 Loan Disbursed!</h4>
                            <p className="text-sm text-purple-800">
                              Disbursement Date: {new Date(app.disbursementDate).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
