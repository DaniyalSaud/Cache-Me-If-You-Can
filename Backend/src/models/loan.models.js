import mongoose, { Schema } from "mongoose";

const loanSchema = new Schema(
  {
    farmerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    loanType: {
      type: String,
      required: true,
      enum: [
        "Agricultural Equipment",
        "Crop Production",
        "Livestock Purchase",
        "Land Development",
        "Irrigation System",
        "Storage Facility",
        "Working Capital",
        "Other",
      ],
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    purpose: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: Number, // in months
      required: true,
      min: 1,
    },
    farmSize: {
      type: Number, // in acres
      required: true,
    },
    annualIncome: {
      type: Number,
      required: true,
    },
    collateral: {
      type: String,
      required: true,
      trim: true,
    },
    cnicNumber: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "under-review", "approved", "rejected", "disbursed"],
      default: "pending",
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewDate: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    approvalNotes: {
      type: String,
      trim: true,
    },
    disbursementDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Loan = mongoose.model("Loan", loanSchema);
