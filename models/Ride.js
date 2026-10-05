const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema(
    {
        rider: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true
        },
        driver: {
            type: mongoose.Schema.ObjectId,
            ref: "Driver",
            default: null
        },
        pickupLocation: {
            type: String,
            required: [true, "Pickup location is required"],
            trim: true
        },
        destinationLocation: {
            type: String,
            required: [true, "Destination location is required"],
            trim: true
        },
        fare: {
            type: Number,
            required: [true, "Fare is required"],
            min: [0, "Fare cannot be negative"]
        },
        status: {
            type: String,
            enum: ["requested", "accepted", "started", "completed", "cancelled"],
            default: "requested"
        },
        acceptedAt: {
            type: Date
        },
        startedAt: {
            type: Date
        },
        completedAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

rideSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.models.Ride || mongoose.model("Ride", rideSchema);
