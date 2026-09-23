const express = require("express");

const {
    getUsers,
    updateUserRole,
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");
const ownerOnly = require("../middleware/ownerMiddleware");

const router = express.Router();

// Get all users - Owner only
router.get("/", protect, ownerOnly, getUsers);

// Change user role - Owner only
router.patch("/:userId/role", protect, ownerOnly, updateUserRole);

module.exports = router;
