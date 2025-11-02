import { asyncHandler } from "../utils/asyncHandler.js";
import { Payment } from "../models/payment.models.js";
import { User } from "../models/user.models.js";
export const getEasypaisaNumber = asyncHandler(async (req, res) => {
  // Return a static Easypaisa number for payments
  const admin = await User.findOne({ role: "admin" });
  if (!admin) {
    return res.status(404).json({ message: "Admin user not found" });
  }
  console.log("Easypaisa Number:", admin.phoneno);
  res.json({ easypaisaNumber: admin.phoneno });
});

export const getAllPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find().sort({ createdAt: -1 });
  res.json(payments);
});

export const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }
  res.json(payment);
});

// To be used by admin
export const createPayment = asyncHandler(async (req, res) => {
  const { amount, method, status, orderId, transactionId } = req.body;

  const payment = new Payment({
    amount,
    method,
    status: "pending",
    orderId, // Payment against the order
    transactionId, // Transaction ID
  });

  await payment.save();
  res.status(201).json(payment);
});

// To be used by admin
export const updatePayment = asyncHandler(async (req, res) => {
  const { amount, method, status } = req.body;
  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }
  payment.amount = amount !== undefined ? amount : payment.amount;
  payment.method = method !== undefined ? method : payment.method;
  payment.status = status !== undefined ? status : payment.status;
  await payment.save();
  res.json(payment);
});

// To be used by admin
export const deletePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }
  await payment.remove();
  res.json({ message: "Payment deleted successfully" });
});
