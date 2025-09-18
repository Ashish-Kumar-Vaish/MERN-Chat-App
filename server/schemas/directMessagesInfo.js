const mongoose = require("mongoose");
const messageSchema = require("./messageSchema");

// DEFINE DIRECT MESSAGES SCHEMA
const directMessagesSchema = new mongoose.Schema({
  users: [
    {
      type: String,
      required: true,
    },
  ],
  messages: [messageSchema],
});

const directMessages = mongoose.model("directMessages", directMessagesSchema);

module.exports = directMessages;
