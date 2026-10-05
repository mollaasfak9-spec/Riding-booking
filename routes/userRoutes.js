const express = require("express");

const {
    getUserProfile,
    updateUserProfile
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get logged-in user profile
router.get("/profile", authMiddleware, getUserProfile);

// Update logged-in user profile
router.put("/profile", authMiddleware, updateUserProfile);

module.exports = router;