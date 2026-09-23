const roomId = "room123";
const { io } = require("socket.io-client");

// Paste your JWT token here
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWE1MDgyYWFmMmY3MjlkY2U3NTA4NGUiLCJpYXQiOjE3ODkyMTk1NzYsImV4cCI6MTc4OTgyNDM3Nn0.RnBCTmo2IX7T_aADYPBat9-FdSXJOpk8-vqcZORCSfA";

const socket = io("http://localhost:4000", {
    auth: {
        token: token,
    },
});

socket.on("connect", () => {
    console.log("Connected to server!");
    console.log("Socket ID:", socket.id);

    // Join room
    socket.emit("joinRoom", roomId);

    // Send a test message
    /*setTimeout(() => {
        socket.emit("sendMessage", {
    roomId: roomId,
    message: "Hello from authenticated user!"
});
    }, 1000);*/
});

// Receive message
socket.on("receiveMessage", (data) => {
    console.log("New message received:");
    console.log(data);
});

// Authentication / connection error
socket.on("connect_error", (error) => {
    console.log("Connection error:", error.message);
});

socket.on("disconnect", () => {
    console.log("Disconnected from server");
});