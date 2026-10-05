const express = require("express");

const {
    requestRide,
    getRide,
    acceptRide,
    startRide,
    completeRide,
    cancelRide
} = require("../controllers/rideController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Rider requests a ride
router.post("/request", authMiddleware, requestRide);

// Get ride details
router.get("/:id", authMiddleware, getRide);

// Driver accepts ride
router.put("/:id/accept", authMiddleware, acceptRide);

// Start ride
router.put("/:id/start", authMiddleware, startRide);

// Complete ride
router.put("/:id/complete", authMiddleware, completeRide);

// Cancel ride
router.put("/:id/cancel", authMiddleware, cancelRide);

module.exports = router;