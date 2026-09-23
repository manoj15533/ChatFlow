const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Not authorized, token missing",
            });
        }

        // Extract token
        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Store user ID in request
        req.userId = decoded.userId;

        // Continue to the next middleware/route
        next();
    } catch (error) {
        console.error("Authentication error:", error);

        return res.status(401).json({
            message: "Not authorized, invalid token",
        });
    }
};

module.exports = protect;