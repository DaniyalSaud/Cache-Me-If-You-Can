import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema(
  {
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        sellerId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "shipped",
        "completed",
        "disputed",
        "refunded",
        "cancelled",
      ],
      default: "pending",
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentIntentId: {
      type: String,
    },
    shippingAddress: {
      fullName: String,
      phone: String,
      addressLine1: String,
      addressLine2: String,
      address: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },
    shippingProvider: {
      type: String,
    },
    trackingNumber: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
