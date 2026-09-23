const cloudinary = require("../config/cloudinary");

// Upload image to Cloudinary
const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "No image selected",
            });
        }

        const uploadStream =
            cloudinary.uploader.upload_stream(
                {
                    folder: "chatflow/images",
                    resource_type: "image",
                },
                (error, result) => {
                    if (error) {
                        console.error(
                            "Cloudinary upload error:",
                            error
                        );

                        return res.status(500).json({
                            message: "Image upload failed",
                        });
                    }

                    res.status(200).json({
                        message: "Image uploaded successfully",
                        imageUrl: result.secure_url,
                    });
                }
            );

        uploadStream.end(req.file.buffer);
    } catch (error) {
        console.error(
            "Image upload error:",
            error
        );

        res.status(500).json({
            message: "Image upload failed",
        });
    }
};

module.exports = {
    uploadImage,
};