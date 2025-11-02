import mongoose from "mongoose";

const wasteCollectionCenterSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
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
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: false,
            trim: true
        },
        division: {
            type: String,
            required: false,
            trim: true
        },
        country: {
            type: String,
            required: false,
            trim: true
        },
        contactNumber: {
            type: String,
            required: true
        },
        acceptedCropTypes: [{
            type: String,
            required: true
        }],
        currentCapacity: {
            type: Number,
            required: true,
            min: 0
        },
        maxCapacity: {
            type: Number,
            required: true,
            min: 0
        }
    },
    { timestamps: true }
);

// Create a 2dsphere index for geospatial queries
wasteCollectionCenterSchema.index({ location: "2dsphere" });

export const WasteCenter = mongoose.model("WasteCenter", wasteCollectionCenterSchema);