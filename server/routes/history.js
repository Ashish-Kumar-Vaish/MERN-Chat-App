const express = require("express");
const router = express.Router();
const roomInfo = require("../schemas/roomInfo");
const directMessages = require("../schemas/directMessagesInfo");

// get room's message history
router.get("/getRoomHistory", async (req, res) => {
  try {
    const { roomid } = req.query;

    if (!roomid) {
      return res
        .status(400)
        .json({ success: false, message: "Room ID is required" });
    }

    const latestHistory = await roomInfo.findOne({ roomId: roomid });

    if (!latestHistory) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    res.json({ success: true, history: latestHistory.messageHistory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get dm's message history
router.get("/getDMHistory", async (req, res) => {
  const { sender, receiver } = req.query;

  if (!sender || !receiver) {
    return res
      .status(400)
      .json({ success: false, message: "Sender and receiver are required" });
  }

  try {
    const conversation = await directMessages.findOne({
      users: { $all: [sender, receiver] },
    });

    if (!conversation) {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
    }

    res.status(200).json({
      success: true,
      history: conversation.messages,
    });
  } catch (err) {
    res.status(500).json({ err: "Server error" });
  }
});

module.exports = router;
