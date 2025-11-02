import mongoose, { Schema, trusted } from "mongoose";

const loanSchema = new Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reason: {
      type: String,
      required: true,
    },
    timetoavail:{
        type:Date,
        required: true,
    }
  },
  { timestamps: true }
);

export const Loan = mongoose.model("Loan", loanSchema);
