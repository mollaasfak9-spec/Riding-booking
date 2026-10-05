const mongoose = require("mongoose");
const Ride = require("../models/Ride");
const Driver = require("../models/Driver");

const isValidId = (id) => mongoose.isValidObjectId(id);

// Find a ride by id and stop early on malformed ids
const findRide = async (id) => {
    if (!isValidId(id)) {
        return null;
    }

    return Ride.findById(id);
};

// Only the rider who booked the ride or the driver assigned to it
const isRideParticipant = (ride, userId) => {
    const riderId = ride.rider ? ride.rider.toString() : null;
    const driverId = ride.driver ? ride.driver.toString() : null;

    return riderId === userId || driverId === userId;
};

// Request Ride
const requestRide = async (req, res) => {
    try {
        const {
            pickupLocation,
            destinationLocation,
            fare
        } = req.body;

        if (!pickupLocation || !destinationLocation || fare === undefined) {
            return res.status(400).json({
                message: "Pickup location, destination location and fare are required"
            });
        }

        if (isNaN(Number(fare)) || Number(fare) < 0) {
            return res.status(400).json({
                message: "Fare must be a positive number"
            });
        }

        const ride = await Ride.create({
            rider: req.user.id,
            pickupLocation,
            destinationLocation,
            fare: Number(fare),
            status: "requested"
        });

        res.status(201).json({
            message: "Ride requested successfully",
            ride
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to request ride",
            error: error.message
        });
    }
};

// Get Ride
const getRide = async (req, res) => {
    try {
        const ride = await findRide(req.params.id);

        if (!ride) {
            return res.status(404).json({
                message: "Ride not found"
            });
        }

        await ride.populate("rider").populate("driver");

        res.json({
            message: "Ride details",
            ride
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to get ride",
            error: error.message
        });
    }
};

// Accept Ride
const acceptRide = async (req, res) => {
    try {
        const ride = await findRide(req.params.id);

        if (!ride) {
            return res.status(404).json({
                message: "Ride not found"
            });
        }

        if (ride.status !== "requested") {
            return res.status(400).json({
                message: "Ride is not available"
            });
        }

        // req.user.id is a User id, but the ride references a Driver profile
        const driver = await Driver.findOne({ user: req.user.id });

        if (!driver) {
            return res.status(403).json({
                message: "Only registered drivers can accept rides"
            });
        }

        ride.driver = driver._id;
        ride.status = "accepted";
        ride.acceptedAt = new Date();

        await ride.save();

        res.json({
            message: "Ride accepted",
            ride
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to accept ride",
            error: error.message
        });
    }
};

// Start Ride
const startRide = async (req, res) => {
    try {
        const ride = await findRide(req.params.id);

        if (!ride) {
            return res.status(404).json({
                message: "Ride not found"
            });
        }

        if (ride.status !== "accepted") {
            return res.status(400).json({
                message: "Ride cannot be started"
            });
        }

        const driver = await Driver.findOne({ user: req.user.id });

        if (!driver || ride.driver.toString() !== driver._id.toString()) {
            return res.status(403).json({
                message: "Only the assigned driver can start this ride"
            });
        }

        ride.status = "started";
        ride.startedAt = new Date();

        await ride.save();

        res.json({
            message: "Ride started",
            ride
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to start ride",
            error: error.message
        });
    }
};

// Complete Ride
const completeRide = async (req, res) => {
    try {
        const ride = await findRide(req.params.id);

        if (!ride) {
            return res.status(404).json({
                message: "Ride not found"
            });
        }

        if (ride.status !== "started") {
            return res.status(400).json({
                message: "Ride cannot be completed"
            });
        }

        const driver = await Driver.findOne({ user: req.user.id });

        if (!driver || ride.driver.toString() !== driver._id.toString()) {
            return res.status(403).json({
                message: "Only the assigned driver can complete this ride"
            });
        }

        ride.status = "completed";
        ride.completedAt = new Date();

        await ride.save();

        res.json({
            message: "Ride completed",
            ride
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to complete ride",
            error: error.message
        });
    }
};

// Cancel Ride
const cancelRide = async (req, res) => {
    try {
        const ride = await findRide(req.params.id);

        if (!ride) {
            return res.status(404).json({
                message: "Ride not found"
            });
        }

        if (
            ride.status === "completed" ||
            ride.status === "cancelled"
        ) {
            return res.status(400).json({
                message: "Ride cannot be cancelled"
            });
        }

        if (!isRideParticipant(ride, req.user.id)) {
            return res.status(403).json({
                message: "You are not allowed to cancel this ride"
            });
        }

        ride.status = "cancelled";

        await ride.save();

        res.json({
            message: "Ride cancelled",
            ride
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to cancel ride",
            error: error.message
        });
    }
};

module.exports = {
    requestRide,
    getRide,
    acceptRide,
    startRide,
    completeRide,
    cancelRide
};
