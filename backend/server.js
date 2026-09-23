require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const jwt = require("jsonwebtoken");
const Message = require("./models/Message");
const RoomMember = require("./models/RoomMember");
const User = require("./models/User");
const messageRoutes = require("./routes/messageRoutes");
const roomRoutes = require("./routes/roomRoutes");
const userRoutes = require("./routes/userRoutes");
const passwordRoutes = require("./routes/passwordRoutes");
const imageRoutes = require("./routes/imageRoutes");
const audioRoutes = require("./routes/audioRoutes");
const cors = require("cors");
const app = express();
// Track currently online users
const onlineUsers = new Map();
app.use(cors());

const http = require("http");
const { Server } = require("socket.io");



// Connect to MongoDB
connectDB();

// Create Express app


// Middleware
app.use(express.json());

// Auth routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/users", userRoutes);
app.use("/api/password", passwordRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/audio", audioRoutes);

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "Chat Collaboration API is running",
    });
});

// Port
const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

app.set("io", io);
// Send online users to everyone
const sendOnlineUsers = async () => {
    try {
        const userIds = Array.from(onlineUsers.keys());

        const users = await User.find({
            _id: { $in: userIds },
        }).select("_id name avatar");

        io.emit("onlineUsers", users);
    } catch (error) {
        console.error(
            "Error getting online users:",
            error
        );
    }
};

// Socket.IO connection
io.use((socket, next) => {
    try {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error("Authentication token required"));
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        socket.userId = decoded.userId;

        next();
    } catch (error) {
        next(new Error("Invalid token"));
    }
});

io.on("connection", (socket) => {
    console.log("User connected:", socket.userId);
    // Join a personal room using the user's ID
socket.join(socket.userId);

        // Add user to online users
    onlineUsers.set(socket.userId, socket.id);

    console.log(
        "Online users:",
        Array.from(onlineUsers.keys())
    );

    sendOnlineUsers();

    // Join a chat room
    socket.on("joinRoom", async (roomId) => {
    try {
        socket.join(roomId);

        // Check if the user is already a member
        const existingMember = await RoomMember.findOne({
            roomId,
            user: socket.userId,
        });

        // If this is the user's first time joining,
        // create their membership record
        if (!existingMember) {
            await RoomMember.create({
                roomId,
                user: socket.userId,
            });

            console.log(
                `New room member: ${socket.userId} joined ${roomId}`
            );
        } else {
            console.log(
                `User ${socket.userId} joined room: ${roomId}`
            );
        }
    } catch (error) {
        console.error("Join room error:", error);
    }
});

// Typing indicator
socket.on("typing", async (roomId) => {
    try {
        const User = require("./models/User");

        const user = await User.findById(socket.userId).select("name");

        socket.to(roomId).emit("userTyping", {
            userId: socket.userId,
            name: user?.name || "User",
        });
    } catch (error) {
        console.error("Typing error:", error);
    }
});

socket.on("stopTyping", (roomId) => {
    socket.to(roomId).emit("userStoppedTyping", {
        userId: socket.userId,
    });
});

// Send role update to a specific user
socket.on("roleUpdated", ({ userId, role }) => {
    const targetSocketId = onlineUsers.get(userId);

    if (!targetSocketId) {
        return;
    }

    io.to(targetSocketId).emit("roleUpdated", {
        role,
    });

    console.log(
        `Role update sent to ${userId}: ${role}`
    );
});

    // Send a message
    socket.on("sendMessage", async (data) => {
    try {
        const {
    roomId,
    message,
    imageUrl,
    audioUrl,
    replyTo,
} = data;

        // Check if room is provided
        if (!roomId) {
            return;
        }

        // A message must contain either text or an image
        // A message must contain text, an image, or audio
if (!message && !imageUrl && !audioUrl) {
    return;
}

// Get the original message being replied to
let repliedMessage = null;

if (replyTo) {
    repliedMessage = await Message.findOne({
        _id: replyTo,
        roomId: roomId,
    });

    // Stop if the original message doesn't exist in this room
    if (!repliedMessage) {
        return;
    }
}
        // Save message in MongoDB
        const newMessage = await Message.create({
    roomId,
    sender: socket.userId,
    message: message || "",
    imageUrl: imageUrl || "",
    audioUrl: audioUrl || "",

    // Reply details
    replyTo: repliedMessage ? repliedMessage._id : null,
    replyToSender: repliedMessage
        ? String(repliedMessage.sender)
        : "",
    replyToMessage: repliedMessage
        ? repliedMessage.message
        : "",
    replyToImage: repliedMessage
        ? repliedMessage.imageUrl
        : "",
    replyToAudio: repliedMessage
        ? repliedMessage.audioUrl
        : "",
});

        // Send message to everyone in the room
        io.to(roomId).emit("receiveMessage", {
    _id: newMessage._id,
    roomId: newMessage.roomId,
    sender: newMessage.sender,
    message: newMessage.message,
    imageUrl: newMessage.imageUrl,
    audioUrl: newMessage.audioUrl,

    // Reply details
    replyTo: newMessage.replyTo,
    replyToSender: newMessage.replyToSender,
    replyToMessage: newMessage.replyToMessage,
    replyToImage: newMessage.replyToImage,
    replyToAudio: newMessage.replyToAudio,

    createdAt: newMessage.createdAt,
});

        console.log(
            `Message saved: ${socket.userId} → ${roomId}`
        );
    } catch (error) {
        console.error(
            "Message error:",
            error
        );
    }
});

    // Disconnect
    socket.on("disconnect", () => {
    // Remove user from online users
    onlineUsers.delete(socket.userId);

    console.log(
        "User disconnected:",
        socket.userId
    );

    console.log(
        "Online users:",
        Array.from(onlineUsers.keys())
    );

    sendOnlineUsers();
});
});

// Start server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});