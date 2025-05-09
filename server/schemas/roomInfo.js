const mongoose = require("mongoose");

// DEFINE ROOM SCHEMA
const chatSchema = new mongoose.Schema({
  roomName: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 25,
    trim: true,
  },
  roomId: {
    type: String,
    required: true,
    unique: true,
  },
  roomPfp: {
    type: String,
    required: true,
    default: "/assets/defaultPfp.png",
  },
  roomDescription: {
    type: String,
    maxlength: 400,
    trim: true,
  },
  roomOwner: {
    type: String,
    required: true,
  },
  roomMembers: [
    {
      memberUsername: {
        type: String,
        required: true,
      },
    },
  ],
  messageHistory: [
    {
      message: {
        type: String,
        required: true,
      },
      position: {
        type: String,
        required: true,
      },
      senderUsername: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const roomInfo = mongoose.model("roomInfo", chatSchema);

module.exports = roomInfo;
