const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        roomId: {
            type: String,
            required: true,
        },

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        message: {
            type: String,
            required: false,
            trim: true,
            default: "",
        },

        imageUrl: {
            type: String,
            required: false,
            default: "",
        },

        audioUrl: {
    type: String,
    required: false,
    default: "",
},

replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
    default: null,
},

replyToSender: {
    type: String,
    default: "",
},

replyToMessage: {
    type: String,
    default: "",
},

replyToImage: {
    type: String,
    default: "",
},

replyToAudio: {
    type: String,
    default: "",
},
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Message", messageSchema);