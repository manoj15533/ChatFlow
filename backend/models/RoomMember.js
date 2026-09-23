const mongoose = require("mongoose");

const roomMemberSchema = new mongoose.Schema(
    {
        roomId: {
            type: String,
            required: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        joinedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// A user should only have one membership record per room
roomMemberSchema.index(
    { roomId: 1, user: 1 },
    { unique: true }
);

module.exports = mongoose.model(
    "RoomMember",
    roomMemberSchema
);