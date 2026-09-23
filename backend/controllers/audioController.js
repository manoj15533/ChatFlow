const cloudinary = require("cloudinary").v2;

const uploadAudio = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "No audio file provided",
            });
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "chatflow/audio",
                resource_type: "video",
            },
            (error, result) => {
                if (error) {
                    console.error("Audio upload error:", error);

                    return res.status(500).json({
                        message: "Audio upload failed",
                    });
                }

                return res.status(200).json({
                    audioUrl: result.secure_url,
                });
            }
        );

        uploadStream.end(req.file.buffer);
    } catch (error) {
        console.error("Audio controller error:", error);

        return res.status(500).json({
            message: "Server error while uploading audio",
        });
    }
};

module.exports = { uploadAudio };