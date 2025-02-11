const express = require("express");
const router = express.Router();
const roomInfo = require("../schemas/roomInfo");

// get message history
router.get("/getHistory", async (req, res) => {
  try {
    const latestHistory = await roomInfo.findOne({
      roomId: req.headers["roomid"],
    });
    if (latestHistory) {
      res.json({ success: true, history: latestHistory.messageHistory });
    } else {
      res.status(400).json({ err: "Wrong roomId." });
    }
  } catch (err) {
    res.status(500).json({ err: "Server error." });
  }
});

module.exports = router;
