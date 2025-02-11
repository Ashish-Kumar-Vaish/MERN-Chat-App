const express = require("express");
const router = express.Router();
const userInfo = require("../schemas/userInfo");
const roomInfo = require("../schemas/roomInfo");

// rooms Joined
router.get("/roomsJoined", async (req, res) => {
  try {
    const rooms = await userInfo.findOne({
      username: req.headers["username"],
    });
    if (rooms) {
      res.json({
        success: true,
        roomsJoined: rooms.roomsJoined,
      });
    } else {
      res.status(400).json({ err: "No rooms joined." });
    }
  } catch (err) {
    res.status(500).json({ err: "Server error." });
  }
});

// edit user
router.post("/editUser", async (req, res) => {
  try {
    const user = await userInfo.findOneAndUpdate(
      { username: req.body.senderUsername },
      {
        $set: {
          name: req.body.name,
          username: req.body.username,
          pfp: req.body.pfp,
        },
      },
      { new: true }
    );

    if (user) {
      res.status(200).json({ success: true, user: user });
    } else {
      res.status(400).json({ err: "You are not authorized." });
    }
  } catch (err) {
    res.status(500).json({ err: "Server error." });
  }
});

// delete user
router.post("/deleteUser", async (req, res) => {
  try {
    const user = await userInfo.findOne({
      username: req.body.username,
    });

    for (let room of user.roomsJoined) {
      const updatedRoomMembers = await roomInfo.updateOne(
        { roomId: room.roomId },
        { $pull: { roomMembers: { memberUsername: user.username } } }
      );
    }

    const deletedUser = await userInfo.deleteOne({
      username: req.body.username,
    });

    if (user) {
      res.status(200).json({ success: true, user: user });
    } else {
      res.status(400).json({ err: "You are not authorized." });
    }
  } catch (err) {
    res.status(500).json({ err: "Server error." });
  }
});

// get user
router.get("/getUserPfp", async (req, res) => {
  try {
    const user = await userInfo.findOne({ username: req.headers["username"] });
    if (user) {
      res.status(200).json({ success: true, userPfp: user.pfp });
    } else {
      res.status(400).json({ err: "No user found." });
    }
  } catch (err) {
    res.status(500).json({ err: "Server error." });
  }
});

module.exports = router;
