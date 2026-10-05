const express = require("express");

const {
    registerDriver,
    getDriverProfile,
    updateDriverStatus
} = require("../controllers/driverController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Driver registration
router.post("/register", authMiddleware, registerDriver);

// Get driver profile
router.get("/profile", authMiddleware, getDriverProfile);

// Online / Offline
router.put("/status", authMiddleware, updateDriverStatus);

module.exports = router;