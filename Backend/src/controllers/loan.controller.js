import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/Apierror.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Loan } from "../models/loan.models.js";
import { User } from "../models/user.models.js";

// Apply for a loan (Farmer)
const applyForLoan = asyncHandler(async (req, res) => {
  const farmerId = req.user._id;

  const {
    loanType,
    amount,
    purpose,
    duration,
    farmSize,
    annualIncome,
    collateral,
    cnicNumber,
  } = req.body;

  // Validate all required fields
  if (
    !loanType ||
    !amount ||
    !purpose ||
    !duration ||
    !farmSize ||
    !annualIncome ||
    !collateral ||
    !cnicNumber
  ) {
    throw new APIError(400, "All fields are required");
  }

  // Validate numeric fields
  if (amount <= 0 || duration <= 0 || farmSize <= 0 || annualIncome <= 0) {
    throw new APIError(400, "Amount, duration, farm size, and annual income must be positive numbers");
  }

  // Create loan application
  const loan = await Loan.create({
    farmerId,
    loanType,
    amount,
    purpose,
    duration,
    farmSize,
    annualIncome,
    collateral,
    cnicNumber,
    status: "pending",
  });

  const populatedLoan = await Loan.findById(loan._id).populate(
    "farmerId",
    "username email phoneno"
  );

  return res
    .status(201)
    .json(new ApiResponse(201, "Loan application submitted successfully", populatedLoan));
});

// Get all loan applications (Admin)
const getAllLoans = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const filter = {};
  if (status) {
    filter.status = status;
  }

  const loans = await Loan.find(filter)
    .populate("farmerId", "username email phoneno")
    .populate("reviewedBy", "username email")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, "Loans fetched successfully", { loans }));
});

// Get farmer's own loan applications
const getMyLoanApplications = asyncHandler(async (req, res) => {
  const farmerId = req.user._id;

  const loans = await Loan.find({ farmerId })
    .populate("reviewedBy", "username email")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, "Your loan applications fetched successfully", { loans }));
});

// Get single loan details
const getLoanById = asyncHandler(async (req, res) => {
  const { loanId } = req.params;

  const loan = await Loan.findById(loanId)
    .populate("farmerId", "username email phoneno")
    .populate("reviewedBy", "username email");

  if (!loan) {
    throw new APIError(404, "Loan application not found");
  }

  // Check if user is authorized (admin or the farmer who applied)
  if (
    req.user.role !== "admin" &&
    loan.farmerId._id.toString() !== req.user._id.toString()
  ) {
    throw new APIError(403, "You are not authorized to view this loan application");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Loan details fetched successfully", loan));
});

// Update loan status (Admin)
const updateLoanStatus = asyncHandler(async (req, res) => {
  const { loanId } = req.params;
  const { status, rejectionReason, approvalNotes } = req.body;
  const adminId = req.user._id;

  if (!status) {
    throw new APIError(400, "Status is required");
  }

  const validStatuses = ["under-review", "approved", "rejected", "disbursed"];
  if (!validStatuses.includes(status)) {
    throw new APIError(400, "Invalid status");
  }

  if (status === "rejected" && !rejectionReason) {
    throw new APIError(400, "Rejection reason is required");
  }

  const loan = await Loan.findById(loanId);

  if (!loan) {
    throw new APIError(404, "Loan application not found");
  }

  // Update loan
  loan.status = status;
  loan.reviewedBy = adminId;
  loan.reviewDate = new Date();

  if (status === "rejected") {
    loan.rejectionReason = rejectionReason;
  }

  if (status === "approved") {
    loan.approvalNotes = approvalNotes;
  }

  if (status === "disbursed") {
    loan.disbursementDate = new Date();
  }

  await loan.save();

  const updatedLoan = await Loan.findById(loanId)
    .populate("farmerId", "username email phoneno")
    .populate("reviewedBy", "username email");

  return res
    .status(200)
    .json(new ApiResponse(200, "Loan status updated successfully", updatedLoan));
});

// Delete loan application (Admin)
const deleteLoanApplication = asyncHandler(async (req, res) => {
  const { loanId } = req.params;

  const loan = await Loan.findById(loanId);

  if (!loan) {
    throw new APIError(404, "Loan application not found");
  }

  await Loan.findByIdAndDelete(loanId);

  return res
    .status(200)
    .json(new ApiResponse(200, "Loan application deleted successfully", null));
});

export {
  applyForLoan,
  getAllLoans,
  getMyLoanApplications,
  getLoanById,
  updateLoanStatus,
  deleteLoanApplication,
};
