import { Router } from 'express';
import { 
    waterconsumption,
    fertilizerConsumption,
    reportCropWaste,
    getFarmerWasteRequests,
    updateWasteRequestStatus,
    addWasteCollectionCenter,
    getAllWasteCenters,
    electricityBillEstimator,
} from '../controllers/tools.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';
import { getGeminiResponse } from "../controllers/Gemini.controller.js";

const router = Router();


//_____________________________________________________________

// Water consumption route
// Tested Working

router.route('/water-consumption')
    .post(verifyJWT, authorizeRoles("seller", "admin"), waterconsumption);

router.route('/fertilizer-consumption').post(verifyJWT, authorizeRoles("seller", "admin"),fertilizerConsumption);

router.route('/electricity-bill-estimator').post(verifyJWT, authorizeRoles("seller", "admin"),electricityBillEstimator);

router.route('/ask').post(verifyJWT,authorizeRoles("seller","admin"),getGeminiResponse);









// Waste management routes
router.route('/waste/report')
    .post(verifyJWT, authorizeRoles("seller", "admin"), reportCropWaste);

router.route('/waste/requests')
    .get(verifyJWT, getFarmerWasteRequests);

router.route('/waste/requests/:requestId')
    .patch(verifyJWT, updateWasteRequestStatus);

router.route('/waste/center')
    .post(verifyJWT, authorizeRoles("admin"), addWasteCollectionCenter);

router.route('/waste/centers')
    .get(verifyJWT, getAllWasteCenters);

export default router;
