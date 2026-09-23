const express = require("express");

const { uploadAudio } = require("../controllers/audioController");

const protect = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Upload voice note
router.post(
    "/upload",
    protect,
    upload.single("audio"),
    uploadAudio
);

module.exports = router;