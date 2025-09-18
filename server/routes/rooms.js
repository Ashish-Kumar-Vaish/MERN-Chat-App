const express = require("express");
const router = express.Router();
const userInfo = require("../schemas/userInfo");
const roomInfo = require("../schemas/roomInfo");
const { v4: uuidv4 } = require("uuid");
const { verifyToken } = require("../middleware/verifyToken");

// room details
router.get("/roomDetails", async (req, res) => {
  try {
    const roomId = req.headers["roomid"];

    if (!roomId) {
      return res.status(400).json({ error: "Room ID is required." });
    }

    const room = await roomInfo.findOne({
      roomId: roomId,
    });

    if (!room) {
      return res.status(404).json({ error: "No rooms found." });
    }

    res.json({
      success: true,
      roomDetails: {
        roomId: room.roomId,
        roomName: room.roomName,
        roomPfp: room.roomPfp,
        roomDescription: room.roomDescription,
        roomOwner: room.roomOwner,
        roomMembers: room.roomMembers,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Server error: " + error.message });
  }
});

// featured rooms
router.get("/featuredRooms", async (req, res) => {
  try {
    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 10;

    const featuredRooms = await roomInfo
      .find({}, { roomId: 1, roomName: 1, roomPfp: 1, _id: 0 })
      .skip(offset)
      .limit(limit);

    if (!featuredRooms.length) {
      return res.status(400).json({ error: "No featured rooms." });
    }

    const totalRooms = await roomInfo.countDocuments();

    res.json({
      success: true,
      featuredRooms: featuredRooms,
      hasMore: offset + limit < totalRooms,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error: " + error.message });
  }
});

// Search rooms
router.post("/searchRooms", async (req, res) => {
  try {
    const { searchQuery } = req.body;

    if (!searchQuery) {
      return res.status(400).json({ error: "Search query is required." });
    }

    const offset = parseInt(req.query.offset) || 0;
    const limit = parseInt(req.query.limit) || 10;

    const searchedRooms = await roomInfo
      .find(
        { roomName: new RegExp(searchQuery, "i") },
        { roomId: 1, roomName: 1, roomPfp: 1, _id: 0 }
      )
      .collation({ locale: "en", strength: 2 })
      .sort({ roomName: 1 })
      .skip(offset)
      .limit(limit);

    if (!searchedRooms.length) {
      return res.status(400).json({ error: "No rooms found." });
    }

    const totalRooms = await roomInfo.countDocuments({
      roomName: new RegExp(searchQuery, "i"),
    });

    res.json({
      success: true,
      searchedRooms: searchedRooms,
      hasMore: offset + limit < totalRooms,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error: " + error.message });
  }
});

// create room
router.post("/createRoom", async (req, res) => {
  try {
    const id = uuidv4();
    const { roomName, roomPfp, roomDescription, senderUsername } = req.body;

    if (!roomName || !senderUsername) {
      return res.status(400).json({ error: "Invalid request" });
    }

    const room = await roomInfo.create({
      roomName: roomName,
      roomId: id,
      roomPfp: roomPfp,
      roomDescription: roomDescription,
      roomOwner: senderUsername,
      roomMembers: [
        {
          memberUsername: senderUsername,
        },
      ],
      messageHistory: [
        {
          message: `created the room on ${new Date().toLocaleString()}`,
          position: "center",
          senderUsername: senderUsername,
        },
      ],
    });

    await userInfo.findOneAndUpdate(
      { username: senderUsername },
      {
        $push: {
          roomsJoined: {
            $each: [{ roomId: room.roomId }],
          },
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      roomId: room.roomId,
      roomName: room.roomName,
      roomPfp: room.roomPfp,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// edit room
router.post("/editRoom", verifyToken, async (req, res) => {
  try {
    const user = req.user;
    const { roomId, roomName, roomPfp, roomDescription } = req.body;

    const room = await roomInfo.findOne({ roomId: roomId });

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    if (room.roomOwner !== user.username) {
      return res
        .status(401)
        .json({ error: "You are not the owner of this room." });
    }

    await roomInfo.updateOne(
      { roomId: roomId },
      {
        $set: {
          roomName: roomName,
          roomPfp: roomPfp,
          roomDescription: roomDescription,
        },
      }
    );

    if (room) {
      res.status(200).json({ success: true, roomId: room.roomId });
    } else {
      res.status(400).json({ error: "You are not the owner of this room." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// delete room
router.delete("/deleteRoom", verifyToken, async (req, res) => {
  try {
    const user = req.user;
    const room = await roomInfo.findOne({ roomId: req.headers["roomid"] });

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    if (room.roomOwner !== user.username) {
      return res
        .status(401)
        .json({ error: "You are not the owner of this room" });
    }

    for (let roomMember of room.roomMembers) {
      await userInfo.updateOne(
        { username: roomMember.memberUsername },
        { $pull: { roomsJoined: { roomId: req.headers["roomid"] } } }
      );
    }

    const deletedRoom = await roomInfo.deleteOne({
      roomId: req.headers["roomid"],
    });

    res.status(200).json({
      success: true,
      deletedRoom: deletedRoom,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error: " + error.message });
  }
});

module.exports = router;
