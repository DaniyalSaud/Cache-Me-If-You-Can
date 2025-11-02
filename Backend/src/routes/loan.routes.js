import { Router } from "express";
import {
  applyForLoan,
  getAllLoans,
  getMyLoanApplications,
  getLoanById,
  updateLoanStatus,
  deleteLoanApplication,
} from "../controllers/loan.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

// Farmer routes
router.route("/apply").post(verifyJWT, authorizeRoles("seller", "admin"), applyForLoan);

router.route("/my-applications").get(verifyJWT, authorizeRoles("seller", "admin"), getMyLoanApplications);

// Admin routes
router.route("/all").get(verifyJWT, authorizeRoles("admin"), getAllLoans);

router.route("/:loanId")
  .get(verifyJWT, getLoanById)
  .patch(verifyJWT, authorizeRoles("admin"), updateLoanStatus)
  .delete(verifyJWT, authorizeRoles("admin"), deleteLoanApplication);

export default router;
