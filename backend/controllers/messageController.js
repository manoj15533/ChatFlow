const Message = require("../models/Message");
const RoomMember = require("../models/RoomMember");

// Get messages from a room
const getRoomMessages = async (req, res) => {
    try {
        const { roomId } = req.params;

        // Find this user's membership in the room
        const membership = await RoomMember.findOne({
            roomId,
            user: req.userId,
        });

        // User has never joined this room before
        if (!membership) {
            return res.status(200).json({
                messages: [],
            });
        }

        // Only return messages from the time
        // this user joined the room
        const messages = await Message.find({
            roomId,
            createdAt: {
                $gte: membership.joinedAt,
            },
        })
            .sort({ createdAt: 1 })
            .populate("sender", "name avatar");

        res.status(200).json({
            messages,
        });
    } catch (error) {
        console.error("Get messages error:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

module.exports = {
    getRoomMessages,
};