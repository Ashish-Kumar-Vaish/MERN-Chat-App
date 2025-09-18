const mongoose = require("mongoose");
const messageSchema = require("./messageSchema");

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
  messageHistory: [messageSchema],
});

const roomInfo = mongoose.model("roomInfo", chatSchema);

module.exports = roomInfo;
