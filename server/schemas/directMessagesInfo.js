const mongoose = require("mongoose");

// DEFINE DIRECT MESSAGES SCHEMA
const directMessagesSchema = new mongoose.Schema({
  users: [
    {
      type: String,
      required: true,
    },
  ],
  messages: [
    {
      message: {
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

const directMessages = mongoose.model("directMessages", directMessagesSchema);

module.exports = directMessages;
