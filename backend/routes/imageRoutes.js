const express = require("express");

const {
    uploadImage,
} = require("../controllers/imageController");

const protect = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

// Upload image
router.post(
    "/upload",
    protect,
    upload.single("image"),
    uploadImage
);

module.exports = router;