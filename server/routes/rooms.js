const express = require("express");
const router = express.Router();
const userInfo = require("../schemas/userInfo");
const roomInfo = require("../schemas/roomInfo");
const { v4: uuidv4 } = require("uuid");

// room details
router.get("/roomDetails", async (req, res) => {
  try {
    const room = await roomInfo.findOne({
      roomId: req.headers["roomid"],
    });
    if (room) {
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
    } else {
      res.status(400).json({ err: "No rooms joined." });
    }
  } catch (err) {
    res.status(500).json({ err: "Server error." });
  }
});

// featured rooms
router.get("/featuredRooms", async (req, res) => {
  try {
    const featuredRooms = await roomInfo
      .find({}, { roomId: 1, roomName: 1, roomPfp: 1, _id: 0 })
      .limit(10);

    if (featuredRooms) {
      res.json({
        success: true,
        featuredRooms: featuredRooms,
      });
    } else {
      res.status(400).json({ err: "No featured rooms." });
    }
  } catch (err) {
    res.status(500).json({ err: "Server error." });
  }
});

// search rooms
router.post("/search", async (req, res) => {
  try {
    const searchedRooms = await roomInfo
      .find(
        { roomName: new RegExp(req.body.searchRooms, "i") },
        { roomId: 1, roomName: 1, roomPfp: 1, _id: 0 }
      )
      .sort({ roomMembers: 1 })
      .limit(15);

    if (searchedRooms) {
      res.json({
        success: true,
        searchedRooms: searchedRooms,
      });
    } else {
      res.status(400).json({ err: "No rooms found." });
    }
  } catch (err) {
    res.status(500).json({ err: "Server error." });
  }
});

// create room
router.post("/createRoom", async (req, res) => {
  try {
    const id = uuidv4();
    const room = await roomInfo.insertMany({
      roomName: req.body.roomName,
      roomId: id,
      roomPfp: req.body.roomPfp,
      roomDescription: req.body.roomDescription,
      roomOwner: req.body.senderUsername,
      roomMembers: [
        {
          memberUsername: req.body.senderUsername,
        },
      ],
      messageHistory: [
        {
          message: `created the room on ${new Date().toLocaleString()}`,
          position: "center",
          senderUsername: req.body.senderUsername,
        },
      ],
    });

    await userInfo.findOneAndUpdate(
      { username: req.body.senderUsername },
      {
        $push: {
          roomsJoined: {
            $each: [{ roomId: room[0].roomId }],
          },
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      roomId: room[0].roomId,
    });
  } catch (err) {
    res.status(500).json({ err: "Server error." });
  }
});

// edit room
router.post("/editRoom", async (req, res) => {
  try {
    const user = await roomInfo.findOneAndUpdate(
      { roomId: req.body.roomId },
      {
        $set: {
          roomName: req.body.roomName,
          roomPfp: req.body.roomPfp,
          roomDescription: req.body.roomDescription,
        },
      },
      { new: true }
    );

    if (user) {
      res.status(200).json({ success: true, roomId: user.roomId });
    } else {
      res.status(400).json({ err: "You are not the owner of this room." });
    }
  } catch (err) {
    res.status(500).json({ err: "Server error." });
  }
});

// delete room
router.post("/deleteRoom", async (req, res) => {
  try {
    const user = await userInfo.findOne({ username: req.body.username });
    const room = await roomInfo.findOne({ roomId: req.body.roomId });

    for (let roomMember of room.roomMembers) {
      const updatedRoomJoined = await userInfo.updateOne(
        { username: roomMember.memberUsername },
        { $pull: { roomsJoined: { roomId: req.body.roomId } } }
      );
    }

    if (room.roomOwner === user.username) {
      const deletedRoom = await roomInfo.deleteOne({
        roomId: req.body.roomId,
      });
      res.status(200).json({
        success: true,
        deletedRoom: deletedRoom,
      });
    } else {
      res.status(400).json({ err: "You are not the owner of this room." });
    }
  } catch (err) {
    res.status(500).json({ err: "Server error." });
  }
});

module.exports = router;
