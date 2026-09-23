const express = require("express");

const {
    getRoomMessages,
} = require("../controllers/messageController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Get messages from a room
router.get("/:roomId", protect, getRoomMessages);

module.exports = router;