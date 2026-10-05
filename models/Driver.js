const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            maxlength: [50, "Name must be at most 50 characters"]
        },
        phone: {
            type: String,
            required: [true, "Phone is required"],
            trim: true,
            maxlength: [15, "Phone must be at most 15 characters"]
        },
        vehicleNumber: {
            type: String,
            required: [true, "Vehicle number is required"],
            unique: true,
            uppercase: true,
            trim: true
        },
        vehicleType: {
            type: String,
            required: [true, "Vehicle type is required"],
            trim: true,
            lowercase: true,
            default: "car"
        },
        status: {
            type: String,
            enum: ["online", "offline"],
            default: "offline"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.models.Driver || mongoose.model("Driver", driverSchema);
