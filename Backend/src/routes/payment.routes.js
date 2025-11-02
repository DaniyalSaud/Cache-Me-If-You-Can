import express from "express";
import {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  getEasypaisaNumber,
} from "../controllers/payment.controller.js";
const router = express.Router();

router.get("/easypaisa-number", getEasypaisaNumber);
router.get("/", getAllPayments); // Gets all payment record;
router.get("/:id", getPaymentById);
router.post("/", createPayment);
router.put("/:id", updatePayment);
router.delete("/:id", deletePayment);

export default router;