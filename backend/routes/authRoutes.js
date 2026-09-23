const express = require("express");
const {
    registerUser,
    loginUser,
    getCurrentUser,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Register user
router.post("/register", registerUser);

// Login user
router.post("/login", loginUser);

// Protected test route
router.get("/protected", protect, (req, res) => {
    res.status(200).json({
        message: "You have access to the protected route",
        userId: req.userId,
    });
});

// Get current logged-in user's latest information
router.get("/me", protect, getCurrentUser);

module.exports = router;