import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/Apierror.js";
import { Product } from "../models/product.models.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { Order } from "../models/order.models.js";
import { Auditlog } from "../models/auditlog.models.js";

// Order creation logic
// basic logic with Auditlog done
// ______________________________HAVE TO DISCUSS SOME LOGIC WITH TEAM
const createOrder = asyncHandler(async (req, res) => {
  const buyerId = req.user._id;
  const { products, shippingAddress, transactionId } = req.body;

  if (!buyerId) {
    throw new APIError(400, "Authentication required");
  }

  if (!products || !Array.isArray(products) || products.length === 0) {
    throw new APIError(400, "Cart is empty");
  }

  if (!shippingAddress) {
    throw new APIError(400, "Shipping address is required");
  }

  if (!transactionId) {
    throw new APIError(400, "Transaction ID is required");
  }

  // Verify buyer exists
  const buyer = await User.findById(buyerId).select("_id email");
  if (!buyer) {
    throw new APIError(404, "Buyer Not Found");
  }

  let totalAmount = 0;
  const orderProducts = [];

  // Process each product in the order
  for (const item of products) {
    const product = await Product.findById(item.productId).select("price sellerId title");
    if (!product) {
      throw new APIError(404, `Product not found: ${item.productId}`);
    }

    const itemTotal = product.price * item.quantity;
    totalAmount += itemTotal;

    orderProducts.push({
      productId: item.productId,
      quantity: item.quantity,
      price: product.price,
      sellerId: product.sellerId,
    });
  }


  // Create order without payment for now (can add Stripe later)
  
  const createdOrder = await Order.create({
    buyerId,
    products: orderProducts,
    status: "pending",
    totalAmount,
    paymentStatus: "paid", // Mark as paid since transaction ID is provided
    paymentIntentId: transactionId, // Store the Easypaisa transaction ID
    shippingAddress,
  });

  if (!createdOrder) {
    throw new APIError(500, "Failed to create order");
  }

  console.log(" Order created:", createdOrder._id);

  // Create audit logs for each seller
  const sellers = [...new Set(orderProducts.map(p => p.sellerId.toString()))];
  for (const sellerId of sellers) {
    await Auditlog.create({
      OrderId: createdOrder._id,
      amount: totalAmount, // Can be refined to seller-specific amount
      userId: buyerId,
      sellerId: sellerId,
      Action: "Order Created",
    });
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "Order Created Successfully", createdOrder));
});


const getOrderById = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const buyerId = req.user._id;

  if (!(orderId && buyerId)) {
    throw new APIError(400, "Something Went Wrong, Try Refreshing Page");
  }
  const order = await Order.findById(orderId).populate('products.productId');
  if (!order) {
    throw new APIError(404, "Order Not Found");
  }
  
  // Verify the user has permission to view this order
  if (order.buyerId.toString() !== buyerId.toString()) {
    throw new APIError(403, "You don't have permission to view this order");
  }
  
  return res
    .status(200)
    .json(new ApiResponse(200, "Order Fetched Successfully", order));
});

// Working ( NOT TESTED FOR MULTIPLE CASES)
const cancelOrder = asyncHandler(async (req, res) => {
  const OrderId = req.params.id;
  const buyerId = req.user._id;

  if (!(OrderId && buyerId)) {
    throw new APIError(400, "Something Went Wrong, Try Refresing Page");
  }
  
  const order = await Order.findById(OrderId);

  if (!order) {
    throw new APIError(404, "Order Not Found or Can't be cancelled");
  }

  if (order.status !== "processing") {
    throw new APIError(400, "Only processing orders can be cancelled");
  }

  try {
    // Refund the payment through Stripe
    if (order.stripePaymentIntentId) {
      const refund = await stripe.refunds.create({
        payment_intent: order.stripePaymentIntentId,
        reason: 'requested_by_customer'
      });

      if (refund.status !== 'succeeded') {
        throw new APIError(500, "Failed to process refund");
      }
    }

    // Update order status to cancelled
    const updatedOrder = await Order.findByIdAndUpdate(
      OrderId,
      { 
        status: "cancelled",
        refundId: refund?.id
      },
      { new: true }
    );

    await Auditlog.create({
      OrderId: order._id,
      userId: buyerId,
      sellerId: order.sellerId,
      action: "Order Cancelled and Refunded",
      amount: order.amount,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, "Order Cancelled and Refunded Successfully", updatedOrder));
  } catch (error) {
    if (error.type === 'StripeError') {
      throw new APIError(500, "Failed to process refund: " + error.message);
    }
    throw error;
  }
});

// UNFINISHED
// Not Tested NO ADMIN RN
const updateOrder = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const adminId = req.user._id;
  const { status } = req.body;

  if (!orderId) {
    throw new APIError(400, "Order ID is required");
  }

  const adminCheck = await User.findById(adminId).select("role");
  if (!adminCheck || adminCheck.role !== "admin") {
    throw new APIError(403, "You are not authorized to perform this action");
  }

  const allowedStatuses = ["processing", "shipped", "delivered", "completed"];
  if (status && !allowedStatuses.includes(status)) {
    throw new APIError(400, "Invalid order status");
  }

  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    { status },
    { 
      new: true,
      runValidators: true 
    }
  ).populate('products.productId');

  if (!updatedOrder) {
    throw new APIError(404, "Order Not Found or Can't be updated");
  }

  // Create audit log for status update
  await Auditlog.create({
    OrderId: orderId,
    userId: adminId,
    action: `Order Status Updated to ${status}`,
    amount: updatedOrder.totalAmount
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Order Updated Successfully", updatedOrder));
});

// Working
const getOrdersByUser = asyncHandler(async (req, res) => {
  const buyerId = req.user._id;

  if (!buyerId) {
    throw new APIError(400, "Something Went Wrong, Try Refresing Page");
  }

  const orders = await Order.find({ buyerId: buyerId });
  return res
    .status(200)
    .json(new ApiResponse(200, "Orders Fetched Successfully", orders));
});

// Get orders for a seller
const getOrdersBySeller = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;

  if (!sellerId) {
    throw new APIError(401, "Authentication Error");
  }

  console.log(" Fetching orders for seller:", sellerId);

  // Find all orders that contain products from this seller
  const orders = await Order.find({
    "products.sellerId": sellerId,
  })
    .populate("buyerId", "username phoneno")
    .populate("products.productId", "title images")
    .sort({ createdAt: -1 });

  // Calculate revenue statistics
  const totalRevenue = orders
    .filter(o => o.paymentStatus === "paid" && o.status === "completed")
    .reduce((sum, order) => {
      const sellerProducts = order.products.filter(
        p => p.sellerId.toString() === sellerId.toString()
      );
      return sum + sellerProducts.reduce((s, p) => s + (p.price * p.quantity), 0);
    }, 0);

  const pendingOrders = orders.filter(o => o.status === "pending").length;

  console.log(` Found ${orders.length} orders for seller`);

  res.status(200).json(
    new ApiResponse(200, "Orders Fetched Successfully", {
      orders,
      stats: {
        totalRevenue,
        totalOrders: orders.length,
        pendingOrders,
      },
    })
  );
});

// UNFINISHED
const HoldinEscrow = asyncHandler(async (req, res) => {});
//
const releaseEscrow = asyncHandler(async (req, res) => {});
//
const refundOrder = asyncHandler(async (req, res) => {});

const raiseDispute = asyncHandler(async (req, res) => {
    const buyerId = req.user._id;
    const orderId = req.params.id;
    const { reason } = req.body;

    if (!(buyerId && orderId)) {
        throw new APIError(400, "Authentication Error, Try Refreshing Page OR Login Again");
    }
    if (!reason){
        throw new APIError(400, "Dispute reason is required");
    }

    const order = await Order.findById(orderId);
    if (!order) {
        throw new APIError(404, "Order Not Found");
    }
    if (order.buyerId.toString() !== buyerId.toString()) {
        throw new APIError(403, "You are not authorized to raise dispute for this order");
    }

    const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { 
            status: "disputed",
            disputeReason: reason,
            disputeDate: new Date()
        },
        { new: true }
    );

    await Auditlog.create({
        OrderId: orderId,
        userId: buyerId,
        action: "Dispute Raised",
        amount: order.totalAmount,
        details: reason
    });

    return res
        .status(200)
        .json(new ApiResponse(200, "Dispute Raised Successfully", updatedOrder));
});



export {
  createOrder,
  getOrderById,
  cancelOrder,
  updateOrder,
  raiseDispute,
  getOrdersByUser,
  getOrdersBySeller,
  HoldinEscrow,
  releaseEscrow,
  refundOrder,
  //LogOrderAction,
};
