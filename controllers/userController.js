const User = require("../models/User");


// Get User Profile
const getUserProfile = async (req, res) => {
    try {

        const user = await User.findById(req.user.id)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            message: "User profile",
            user
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to get profile",
            error: error.message
        });
    }
};


// Update User Profile
const updateUserProfile = async (req, res) => {
    try {

        const { name, email } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                name,
                email
            },
            {
                new: true,
                runValidators: true
            }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            message: "Profile updated successfully",
            user
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update profile",
            error: error.message
        });
    }
};


module.exports = {
    getUserProfile,
    updateUserProfile
};