const User = require("../models/User");

// Get all users
const getUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .sort({ name: 1 });

        res.status(200).json({
            users,
        });
    } catch (error) {
        console.error("Get users error:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};


// Change a user's role
const updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!["admin", "member"].includes(role)) {
            return res.status(400).json({
                message: "Invalid role",
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // Prevent the Owner from changing their own role
        if (user._id.toString() === req.userId) {
            return res.status(403).json({
                message: "You cannot change your own role",
            });
        }

        // Prevent changing another Owner's role
if (user.role === "owner") {
    return res.status(403).json({
        message: "You cannot change an Owner's role",
    });
}

        user.role = role;

        await user.save();

        // Notify the user about their role change
const io = req.app.get("io");

if (io) {
    io.to(user._id.toString()).emit("roleUpdated", {
        role: user.role,
    });
}

        res.status(200).json({
            message: `User role updated to ${role}`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                status: user.status,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Update user role error:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};


module.exports = {
    getUsers,
    updateUserRole,
};