const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
        },

        avatar: {
            type: String,
            default: "",
        },

        role: {
    type: String,
    enum: ["owner", "admin", "member"],
    default: "member",
},

resetPasswordToken: {
    type: String,
    default: null,
},

resetPasswordExpires: {
    type: Date,
    default: null,
},

        status: {
            type: String,
            default: "Hey there! I am using Chat App.",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);