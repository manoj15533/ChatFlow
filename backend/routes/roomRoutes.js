const express = require("express");

const {
    createRoom,
    getRooms,
    deleteRoom,
} = require("../controllers/roomController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

// Get all rooms
router.get("/", protect, getRooms);

// Create a room - Admin only
router.post("/", protect, adminOnly, createRoom);

// Delete a room - Admin only
router.delete("/:roomId", protect, adminOnly, deleteRoom);

module.exports = router;