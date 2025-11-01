import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/Apierror.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { CropWaste } from "../models/cropwaste.models.js";
import { WasteCenter } from "../models/wastecenter.models.js";
import { getVideoTranscript } from "../utils/transcript.utils.js";

// src/controllers/tools.controller.js
//import { asyncHandler } from "../utils/asyncHandler.js";
//import { APIError } from "../utils/Apierror.js";
//import { ApiResponse } from "../utils/ApiResponse.js";
import { transcribeFromUrl } from "../utils/Deepgram.utils.js";

export const transcribeFromLink = asyncHandler(async (req, res) => {
  const { videoUrl, options = {} } = req.body;

  if (!videoUrl) {
    throw new APIError(400, "videoUrl is required");
  }

  try {
    const dgResponse = await transcribeFromUrl(videoUrl, options);

    const transcript =
      dgResponse?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

    return res
      .status(200)
      .json(
        new ApiResponse(200, { transcript, raw: dgResponse }, "Transcription successful")
      );
  } catch (err) {
    console.error("Deepgram error:", err);
    throw new APIError(500, "Failed to transcribe audio/video from URL");
  }
});


// import { transcribeFromUrl } from "../utils/Deepgram.utils.js";

// export const postTranscribeYoutube = asyncHandler(async (req, res) => {
//   const { youtubeUrl, options = {} } = req.body;
//   if (!youtubeUrl) throw new APIError(400, "youtubeUrl is required");

//   try {
//     const dgResponse = await transcribeFromUrl(youtubeUrl, options);

//     const transcript =
//       dgResponse.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? "";

//     return res
//       .status(200)
//       .json(new ApiResponse(200, "Transcription successful", { transcript }));
//   } catch (err) {
//     console.error("Deepgram transcription error:", err);
//     throw new APIError(500, "Failed to transcribe video via Deepgram");
//   }
// });

// import { transcribeYoutube } from "../utils/Info.utils.js";

// /**
//  * POST /api/tools/transcribe/youtube
//  * Body: { youtubeUrl: string, options?: { punctuate, diarize, language, model, tier } }
//  */
// export const postTranscribeYoutube = asyncHandler(async (req, res) => {
//   const { youtubeUrl, options = {} } = req.body;

//   if (!youtubeUrl) {
//     throw new APIError(400, "youtubeUrl is required");
//   }

//   try {
//     const dgResponse = await transcribeYoutube(youtubeUrl, options);

//     const transcript =
//       dgResponse?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? "";

//     return res
//       .status(200)
//       .json(new ApiResponse(200, "Transcription successful", { transcript, raw: dgResponse }));
//   } catch (err) {
//     // If Info.utils throws a normal Error, convert to APIError for consistent handling
//     const message = err?.message || "Failed to transcribe YouTube video";
//     throw new APIError(500, message);
//   }
// });

//____________________________________________________________________________________________________
//TOOL no 1
const waterconsumption = asyncHandler(async (req, res) => {
  const sellerid = req.user._id;

  const { watertype, croptype, area } = req.body;

  if (!sellerid) {
    throw new APIError(400, "Seller ID is required");
  }
  const check = await User.findById(sellerid);
  if (check.role === "buyer" || !check.role) {
    throw new APIError(403, "Only sellers can access this resource");
  }
  if (
    [watertype, croptype, area].some((field) => !field || field.trim() === "")
  ) {
    throw new APIError(400, "Watertype, croptype and area is required");
  }
  const ACRE_TO_HECTARE = 0.404686;
  const areaInHectare = area * ACRE_TO_HECTARE;
  const cropWaterData = {
    rice: 8000,
    sugarcane: 7000,
    cotton: 6000,
    maize: 5500,
    banana: 7500,
    wheat: 4500,
    potato: 4000,
    tomato: 4200,
    onion: 3800,
    cabbage: 3500,
    millet: 2500,
    lentil: 2300,
    mustard: 2200,
    groundnut: 2000,
  };
  const waterRequired = (cropWaterData[croptype] || 4000) * areaInHectare; // Default to 4000 if crop type not found

  if (!waterRequired) {
    throw new APIError(400, "Invalid crop type provided");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Water consumption calculated", waterRequired));
});

// TOOL no 2
// working
const fertilizerConsumption = asyncHandler(async (req, res) => {
  const { croptype, area } = req.body;

  if (!croptype || !area || area <= 0) {
    throw new APIError(400, "Croptype and area (in acres) are required");
  }

  const cropFertilizerData = {
    rice: 110,
    wheat: 100,
    maize: 101,
    sugarcane: 160,
    cotton: 130,
    potato: 120,
    tomato: 80,
    onion: 70,
    cabbage: 60,
    millet: 50,
    lentil: 40,
    mustard: 45,
    groundnut: 55,
  };

  const fertilizerPerAcre = cropFertilizerData[croptype.toLowerCase()] || 60;

  const totalFertilizerKg = fertilizerPerAcre * area;

  let timing = "Apply entire dose at sowing stage.";
  let nextUse = "No reapplication required for single-season crops.";

  switch (croptype.toLowerCase()) {
    case "rice":
      timing =
        "Apply 1/3 at transplanting, 1/3 at 25 days, and 1/3 at 45 days after transplanting.";
      break;
    case "wheat":
      timing =
        "Apply half at sowing and remaining half at first irrigation (20-25 days).";
      break;
    case "maize":
      timing =
        "Apply 1/3 at sowing, 1/3 at knee height, and 1/3 before tasseling.";
      break;
    case "sugarcane":
      timing = "Apply 1/2 at planting and remaining 1/2 at 3 months.";
      nextUse = "Reapply every 3–4 months for ratoon crop.";
      break;
    case "cotton":
      timing =
        "Apply 1/3 at sowing, 1/3 at squaring, and 1/3 at flowering stage.";
      break;
    case "potato":
      timing = "Apply 2/3 at planting and 1/3 after 30 days of emergence.";
      break;
    case "tomato":
    case "onion":
    case "cabbage":
      timing = "Apply half at transplanting and remaining half 30 days later.";
      break;
    case "millet":
      timing = "Apply all fertilizer at sowing for rainfed areas.";
      break;
    case "lentil":
    case "mustard":
    case "groundnut":
      timing =
        "Apply all fertilizer at sowing stage (legumes fix nitrogen naturally).";
      break;
  }

  return res.status(200).json(
    new ApiResponse(200, "Fertilizer consumption calculated successfully", {
      croptype,
      area,
      fertilizerPerAcre: `${fertilizerPerAcre} kg/acre`,
      totalFertilizerKg: `${totalFertilizerKg.toFixed(2)} kg total`,
      timing,
      nextUse,
    })
  );
});

// region = K-ELECTRIC and so on FRONTEND NEEDS WORK HERE
// Tool no 3
// working
const electricityBillEstimator = asyncHandler(async (req, res) => {
  const { region, usage } = req.body;

  if (!region || typeof region !== "string") {
    throw new APIError(400, "Region is required");
  }

  if (!usage || typeof usage !== "object" || Object.keys(usage).length === 0) {
    throw new APIError(400, "Usage data is required with equipment hours");
  }

  const equipmentPowerData = {
    tubewell: 3700,
    waterPump: 1000,
    fan: 75,
    light: 15,
    mill: 1500,
    thresher: 2500,
    waterCooler: 200,
    motorTools: 500,
  };

  const tariffData = {
    "K-Electric": {
      slabs: [{ upto: Infinity, rate: 28.0, fixedCharge: 400 }],
      fcaRate: 1.75,
      dutyRate: 0.015,
      gstRate: 0.18,
    },
    LESCO: {
      slabs: [{ upto: Infinity, rate: 28.9, fixedCharge: 400 }],
      fcaRate: 1.85,
      dutyRate: 0.015,
      gstRate: 0.18,
    },
    IESCO: {
      slabs: [{ upto: Infinity, rate: 28.9, fixedCharge: 400 }],
      fcaRate: 1.9,
      dutyRate: 0.015,
      gstRate: 0.18,
    },
    FESCO: {
      slabs: [{ upto: Infinity, rate: 28.7, fixedCharge: 400 }],
      fcaRate: 1.6,
      dutyRate: 0.015,
      gstRate: 0.18,
    },
    GEPCO: {
      slabs: [{ upto: Infinity, rate: 28.8, fixedCharge: 400 }],
      fcaRate: 1.55,
      dutyRate: 0.015,
      gstRate: 0.18,
    },
    MEPCO: {
      slabs: [{ upto: Infinity, rate: 28.75, fixedCharge: 400 }],
      fcaRate: 1.7,
      dutyRate: 0.015,
      gstRate: 0.18,
    },
    HESCO: {
      slabs: [{ upto: Infinity, rate: 29.0, fixedCharge: 400 }],
      fcaRate: 2.0,
      dutyRate: 0.015,
      gstRate: 0.18,
    },
    SEPCO: {
      slabs: [{ upto: Infinity, rate: 29.2, fixedCharge: 400 }],
      fcaRate: 2.05,
      dutyRate: 0.015,
      gstRate: 0.18,
    },
    PESCO: {
      slabs: [{ upto: Infinity, rate: 28.6, fixedCharge: 400 }],
      fcaRate: 1.65,
      dutyRate: 0.015,
      gstRate: 0.18,
    },
    QESCO: {
      slabs: [{ upto: Infinity, rate: 29.1, fixedCharge: 400 }],
      fcaRate: 1.8,
      dutyRate: 0.015,
      gstRate: 0.18,
    },
  };

  const regionInfo = tariffData[region];
  if (!regionInfo) {
    throw new APIError(400, `Unsupported region: ${region}`);
  }

  let totalUnits = 0;
  const breakdown = [];

  for (const [equipment, hoursUsed] of Object.entries(usage)) {
    const power = equipmentPowerData[equipment.toLowerCase()];
    if (!power || hoursUsed <= 0) continue;

    const energyKWh = (power * hoursUsed) / 1000;
    totalUnits += energyKWh;

    breakdown.push({
      equipment,
      hoursUsed: `${hoursUsed} hours`,
      power: `${power} W`,
      energyKWh: `${energyKWh.toFixed(2)} kWh`,
    });
  }

  if (breakdown.length === 0) {
    throw new APIError(400, "No valid equipment data provided");
  }

  const slab =
    regionInfo.slabs.find((s) => totalUnits <= s.upto) || regionInfo.slabs[0];
  const energyCost = totalUnits * slab.rate;
  const fixedCost = slab.fixedCharge;
  const fcaCost = totalUnits * regionInfo.fcaRate;
  const dutyCost = energyCost * regionInfo.dutyRate;

  const subtotal = energyCost + fixedCost + fcaCost + dutyCost;
  const gstCost = subtotal * regionInfo.gstRate;
  const totalCost = subtotal + gstCost;

  breakdown.forEach((item) => {
    const portion = parseFloat(item.energyKWh) / totalUnits;
    item.cost = `Rs. ${(energyCost * portion).toFixed(2)}`;
  });

  let advice =
    "Use LED bulbs, efficient motors, and schedule pump hours in off-peak times.";
  if (totalCost > 30000)
    advice =
      "Consider hybrid or solar setups for high-consumption devices like tubewells.";

  return res.status(200).json(
    new ApiResponse(200, "Electricity bill estimated successfully", {
      region,
      totalUnits: `${totalUnits.toFixed(2)} kWh`,
      unitRate: `Rs. ${slab.rate}/kWh`,
      energyCost: `Rs. ${energyCost.toFixed(2)}`,
      fixedCost: `Rs. ${fixedCost.toFixed(2)}`,
      fcaCost: `Rs. ${fcaCost.toFixed(2)}`,
      dutyCost: `Rs. ${dutyCost.toFixed(2)}`,
      gstCost: `Rs. ${gstCost.toFixed(2)}`,
      totalCost: `Rs. ${totalCost.toFixed(2)}`,
      breakdown,
      advice,
    })
  );
});

// const electricityBillEstimator = asyncHandler(async (req, res) => {
//   const { usage } = req.body;

//   if (!usage || typeof usage !== "object" || Object.keys(usage).length === 0) {
//     throw new APIError(400, "Usage data is required with equipment hours");
//   }

//   const equipmentPowerData = {
//     tubewell: 3700,
//     waterPump: 1000,
//     fan: 75,
//     light: 15,
//     mill: 1500,
//     thresher: 2500,
//     waterCooler: 200,
//     motorTools: 500,
//   };

//   const UNIT_RATE = 30;

//   let totalUnits = 0;
//   const breakdown = [];

//   for (const [equipment, hoursUsed] of Object.entries(usage)) {
//     const power = equipmentPowerData[equipment.toLowerCase()];
//     if (!power || hoursUsed <= 0) continue;

//     const energyKWh = (power * hoursUsed) / 1000;
//     const cost = energyKWh * UNIT_RATE;
//     totalUnits += energyKWh;

//     breakdown.push({
//       equipment,
//       hoursUsed: `${hoursUsed} hours`,
//       power: `${power} W`,
//       energyKWh: `${energyKWh.toFixed(2)} kWh`,
//       cost: `Rs. ${cost.toFixed(2)}`,
//     });
//   }
//   const basiccost = 35
//   const totalCost = basiccost + totalUnits * UNIT_RATE;

//   if (breakdown.length === 0) {
//     throw new APIError(400, "No valid equipment data provided");
//   }

//   let advice = "Use LED lights and efficient motors to reduce cost.";
//   if (totalCost > 20000) advice = "Consider using solar panels for high-consumption equipment like tubewells.";

//   return res.status(200).json(
//     new ApiResponse(200, "Electricity bill estimated successfully", {
//       usage,
//       unitRate: `${UNIT_RATE} Rs/kWh`,
//       totalUnits: `${totalUnits.toFixed(2)} kWh`,
//       totalCost: `Rs. ${totalCost.toFixed(2)}`,
//       breakdown,
//       advice,
//     })
//   );
// });

//______________________TO BE IMPLEMENTED_______________________________________
// Report crop waste and find nearest collection centers
const reportCropWaste = asyncHandler(async (req, res) => {
  const { cropType, quantity, latitude, longitude } = req.body;
  const farmerId = req.user._id;

  // Validate input
  if (!(cropType && quantity && latitude && longitude)) {
    throw new APIError(
      400,
      "All fields are required: cropType, quantity, latitude, longitude"
    );
  }

  if (quantity <= 0) {
    throw new APIError(400, "Quantity must be greater than 0");
  }

  // Find nearest waste collection centers that accept this crop type
  // and have available capacity
  const nearestCenters = await WasteCenter.find({
    acceptedCropTypes: cropType,
    currentCapacity: { $lte: quantity },
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        $maxDistance: 100000, // 100 kilometers
      },
    },
  })
    .limit(5)
    .select("name location address contactNumber currentCapacity maxCapacity");

  if (!nearestCenters.length) {
    throw new APIError(404, "No suitable collection centers found nearby");
  }

  // Create crop waste request
  const cropWaste = await CropWaste.create({
    farmerId,
    cropType,
    quantity,
    location: {
      type: "Point",
      coordinates: [longitude, latitude],
    },
    status: "pending",
  });

  // Format the response with centers and their distances
  const centersWithDistance = nearestCenters.map((center) => {
    const distance = calculateDistance(
      latitude,
      longitude,
      center.location.coordinates[1],
      center.location.coordinates[0]
    );

    return {
      ...center.toObject(),
      distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
      mapUrl: generateMapUrl(
        latitude,
        longitude,
        center.location.coordinates[1],
        center.location.coordinates[0]
      ),
    };
  });

  return res.status(201).json(
    new ApiResponse(201, "Crop waste reported successfully", {
      wasteRequest: cropWaste,
      nearestCenters: centersWithDistance,
    })
  );
});

// Helper function to calculate distance between two points using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (value) => {
  return (value * Math.PI) / 180;
};

// Generate Google Maps URL for directions
const generateMapUrl = (startLat, startLon, endLat, endLon) => {
  return `https://www.google.com/maps/dir/${startLat},${startLon}/${endLat},${endLon}`;
};

// Get all waste requests for a farmer
const getFarmerWasteRequests = asyncHandler(async (req, res) => {
  const farmerId = req.user._id;

  const requests = await CropWaste.find({ farmerId })
    .populate("assignedCenter", "name address contactNumber")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Waste requests retrieved successfully", requests)
    );
});

// Update waste request status
const updateWasteRequestStatus = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { status, centerId } = req.body;

  const wasteRequest = await CropWaste.findById(requestId);
  if (!wasteRequest) {
    throw new APIError(404, "Waste request not found");
  }

  if (status === "assigned" && !centerId) {
    throw new APIError(400, "Collection center ID is required for assignment");
  }

  wasteRequest.status = status;
  if (centerId) {
    wasteRequest.assignedCenter = centerId;
  }

  await wasteRequest.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Waste request updated successfully", wasteRequest)
    );
});

// Add waste collection center
const addWasteCollectionCenter = asyncHandler(async (req, res) => {
  const {
    name,
    latitude,
    longitude,
    address,
    contactNumber,
    acceptedCropTypes,
    maxCapacity,
  } = req.body;

  // Validate input
  if (
    !(
      name &&
      latitude &&
      longitude &&
      address &&
      contactNumber &&
      acceptedCropTypes &&
      maxCapacity
    )
  ) {
    throw new APIError(400, "All fields are required");
  }

  const center = await WasteCenter.create({
    name,
    location: {
      type: "Point",
      coordinates: [longitude, latitude],
    },
    address,
    contactNumber,
    acceptedCropTypes,
    currentCapacity: 0,
    maxCapacity,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, "Waste collection center added successfully", center)
    );
});

// Get all waste collection centers
const getAllWasteCenters = asyncHandler(async (req, res) => {
  const centers = await WasteCenter.find()
    .select("-__v")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Waste centers retrieved successfully", centers)
    );
});

// Get transcript from YouTube video
const getYouTubeTranscript = asyncHandler(async (req, res) => {
    const { videoUrl } = req.body;

    if (!videoUrl) {
        throw new APIError(400, "Video URL is required");
    }

    const transcript = await getVideoTranscript(videoUrl);

    return res.status(200).json(
        new ApiResponse(200, "Video transcript generated successfully", transcript)
    );
});

export {
    reportCropWaste,
    getFarmerWasteRequests,
    updateWasteRequestStatus,
    addWasteCollectionCenter,
    getAllWasteCenters,
    waterconsumption,
    fertilizerConsumption,
    electricityBillEstimator,
    getYouTubeTranscript
};
