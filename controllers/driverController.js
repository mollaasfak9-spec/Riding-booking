const Driver = require("../models/Driver");
const User = require("../models/User");


// Register Driver
const registerDriver = async (req, res) => {
    try {

        const {
            name,
            phone,
            vehicleNumber,
            vehicleType
        } = req.body;

        if (!name || !phone || !vehicleNumber || !vehicleType) {
            return res.status(400).json({
                message: "Please provide name, phone, vehicleNumber and vehicleType"
            });
        }

        // One driver profile per user
        const existingProfile = await Driver.findOne({
            user: req.user.id
        });

        if (existingProfile) {
            return res.status(400).json({
                message: "Driver profile already exists for this user"
            });
        }

        // Check driver already exists
        const existingDriver = await Driver.findOne({
            vehicleNumber: vehicleNumber.toUpperCase()
        });

        if (existingDriver) {
            return res.status(400).json({
                message: "Driver already registered"
            });
        }

        // Create driver
        const driver = await Driver.create({
            user: req.user.id,
            name,
            phone,
            vehicleNumber,
            vehicleType,
            status: "offline"
        });

        // Give the linked user the driver role
        await User.findByIdAndUpdate(req.user.id, { role: "driver" });

        res.status(201).json({
            message: "Driver registered successfully",
            driver
        });

    } catch (error) {
        res.status(500).json({
            message: "Driver registration failed",
            error: error.message
        });
    }
};


// Get Driver Profile
const getDriverProfile = async (req, res) => {
    try {

        const driver = await Driver.findOne({
            user: req.user.id
        });

        if (!driver) {
            return res.status(404).json({
                message: "Driver profile not found"
            });
        }

        res.json({
            message: "Driver profile",
            driver
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to get driver profile",
            error: error.message
        });
    }
};


// Update Driver Status
const updateDriverStatus = async (req, res) => {
    try {

        const { status } = req.body;

        if (!["online", "offline"].includes(status)) {
            return res.status(400).json({
                message: "Status must be online or offline"
            });
        }

        const driver = await Driver.findOneAndUpdate(
            {
                user: req.user.id
            },
            {
                status
            },
            {
                new: true
            }
        );

        if (!driver) {
            return res.status(404).json({
                message: "Driver not found"
            });
        }

        res.json({
            message: `Driver is now ${status}`,
            driver
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update driver status",
            error: error.message
        });
    }
};


module.exports = {
    registerDriver,
    getDriverProfile,
    updateDriverStatus
};