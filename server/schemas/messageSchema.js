const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  message: {
    type: String,
    default: null,
  },
  media: [
    {
      url: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
        default: "Unknown File",
      },
      type: {
        type: String,
        required: true,
      },
    },
  ],
  position: {
    type: String,
    required: true,
  },
  senderUsername: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "sent", "failed"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = messageSchema;
