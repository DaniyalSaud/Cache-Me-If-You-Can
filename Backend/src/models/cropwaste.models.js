import mongoose from "mongoose";

const cropWasteSchema = new mongoose.Schema(
    {
        farmerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        cropType: {
            type: String,
            required: false
        },
        cropTypes: [{
            type: String,
            required: false
        }],
        quantity: {
            type: Number,
            required: true,
            min: 0
        },
        location: {
            type: {
                type: String,
                default: "Point",
                enum: ["Point"]
            },
            coordinates: {
                type: [Number],
                required: true,
                // [longitude, latitude]
            }
        },
        status: {
            type: String,
            enum: ["pending", "assigned", "collected", "processed"],
            default: "pending"
        },
        assignedCenter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "WasteCenter"
        },
        preferredCenter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "WasteCenter"
        },
        expectedPickupDate: {
            type: Date
        },
        notes: {
            type: String
        }
    },
    { timestamps: true }
);

// Create a 2dsphere index for geospatial queries
cropWasteSchema.index({ location: "2dsphere" });

export const CropWaste = mongoose.model("CropWaste", cropWasteSchema);