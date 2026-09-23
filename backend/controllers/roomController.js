const Room = require("../models/Room");
const Message = require("../models/Message");
const RoomMember = require("../models/RoomMember");

// Create a new room
const createRoom = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Room name is required",
            });
        }

        const room = await Room.create({
            name,
            description,
            createdBy: req.userId,
        });

        res.status(201).json({
            message: "Room created successfully",
            room,
        });
    } catch (error) {
        console.error("Create room error:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

// Get all rooms
const getRooms = async (req, res) => {
    try {
        const rooms = await Room.find()
            .populate("createdBy", "name")
            .sort({ createdAt: -1 });

        res.status(200).json({
            rooms,
        });
    } catch (error) {
        console.error("Get rooms error:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

// Delete a room
const deleteRoom = async (req, res) => {
    try {
        const { roomId } = req.params;

        // Find the room
        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({
                message: "Room not found",
            });
        }

        // Only the room creator can delete it
        if (room.createdBy.toString() !== req.userId) {
            return res.status(403).json({
                message: "You can only delete rooms you created",
            });
        }

        // Delete the room
        await Room.findByIdAndDelete(roomId);

        // Delete messages belonging to this room
        await Message.deleteMany({
            roomId: roomId,
        });

        // Delete room memberships
        await RoomMember.deleteMany({
            roomId: roomId,
        });

        res.status(200).json({
            message: "Room deleted successfully",
        });
    } catch (error) {
        console.error("Delete room error:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

module.exports = {
    createRoom,
    getRooms,
    deleteRoom,
};