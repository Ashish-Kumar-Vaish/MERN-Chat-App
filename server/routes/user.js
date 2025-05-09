require("dotenv").config();
const express = require("express");
const router = express.Router();
const userInfo = require("../schemas/userInfo");
const roomInfo = require("../schemas/roomInfo");
const directMessages = require("../schemas/directMessagesInfo");
const { verifyToken } = require("../middleware/verifyToken");

// rooms Joined
router.get("/roomsJoined", verifyToken, async (req, res) => {
  try {
    const user = req.user;

    if (!user.username) {
      return res.status(400).json({ error: "Username is required." });
    }

    res.json({
      success: true,
      roomsJoined: user.roomsJoined,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

// edit user
router.put("/editUser", verifyToken, async (req, res) => {
  try {
    const user = req.user;
    const { name, username, pfp } = req.body;

    const updateFields = {};

    if (name && name !== user.name) {
      updateFields.name = name;
    }
    if (username && username !== user.username) {
      const usernameExists = await userInfo.findOne({ username: username });

      if (usernameExists) {
        return res.status(400).json({ error: "Username already taken." });
      }
      updateFields.username = username;

      for (let room of user.roomsJoined) {
        const updatedRoom = await roomInfo.findOneAndUpdate(
          {
            roomId: room.roomId,
            "roomMembers.memberUsername": user.username,
          },
          {
            $set: { "roomMembers.$.memberUsername": username },
          },
          { new: true }
        );

        if (updatedRoom) {
          await roomInfo.updateMany(
            {
              roomId: room.roomId,
              "messageHistory.senderUsername": user.username,
            },
            {
              $set: { "messageHistory.$.senderUsername": username },
            }
          );

          if (updatedRoom.roomOwner === user.username) {
            await roomInfo.updateOne(
              { roomId: room.roomId },
              { $set: { roomOwner: username } }
            );
          }
        }
      }

      for (let friend of user.friends) {
        await userInfo.updateOne(
          { username: friend.username, "friends.username": user.username },
          { $set: { "friends.$.username": username } }
        );
      }

      for (let request of user.requests) {
        await userInfo.updateOne(
          {
            username: request.username,
            "sentFriendRequests.username": user.username,
          },
          { $set: { "sentFriendRequests.$.username": username } }
        );
      }

      for (let sent of user.sentFriendRequests) {
        await userInfo.updateOne(
          { username: sent.username, "requests.username": user.username },
          { $set: { "requests.$.username": username } }
        );
      }

      for (let chat of user.chatWithUsers) {
        await userInfo.updateOne(
          { username: chat.username, "chatWithUsers.username": user.username },
          { $set: { "chatWithUsers.$.username": username } }
        );
      }

      await directMessages.updateMany(
        {
          users: user.username,
        },
        {
          $set: {
            "users.$[elem]": username,
            "messages.$[msg].senderUsername": username,
          },
        },
        {
          arrayFilters: [
            { elem: user.username },
            { "msg.senderUsername": user.username },
          ],
        }
      );
    }
    if (pfp && pfp !== user.pfp) {
      updateFields.pfp = pfp;
    }

    if (!Object.keys(updateFields).length) {
      return res
        .status(200)
        .json({ success: true, user: user, error: "No changes made" });
    }

    const updatedUser = await userInfo.findOneAndUpdate(
      { username: user.username },
      { $set: updateFields },
      { new: true }
    );

    if (updatedUser) {
      res.status(200).json({ success: true, user: updatedUser });
    } else {
      res.status(400).json({ error: "You are not authorized." });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

// delete user
router.delete("/deleteUser", verifyToken, async (req, res) => {
  try {
    const user = req.user;

    for (let room of user.roomsJoined) {
      const updatedRoom = await roomInfo.findOneAndUpdate(
        { roomId: room.roomId },
        { $pull: { roomMembers: { memberUsername: user.username } } }
      );

      if (updatedRoom.roomOwner === user.username) {
        const newOwner = updatedRoom.roomMembers[0].memberUsername;

        const newItems = [
          {
            message: `gave room ownership to ${newOwner}`,
            position: "center",
            senderUsername: user.username,
          },
        ];

        await roomInfo.updateOne(
          { roomId: room.roomId },
          { $set: { roomOwner: newOwner } },
          { $push: { messageHistory: { $each: newItems } } }
        );
      }
    }

    for (let friend of user.friends) {
      await userInfo.updateOne(
        { username: friend.username },
        { $pull: { friends: { username: user.username } } }
      );
    }

    for (let request of user.requests) {
      await userInfo.updateOne(
        { username: request.username },
        { $pull: { sentFriendRequests: { username: user.username } } }
      );
    }

    for (let sent of user.sentFriendRequests) {
      await userInfo.updateOne(
        { username: sent.username },
        { $pull: { requests: { username: user.username } } }
      );
    }

    await userInfo.deleteOne({ _id: user._id });

    res
      .status(200)
      .json({ success: true, message: "User deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// get user
router.get("/getUserDetails", verifyToken, async (req, res) => {
  try {
    const user = req.user;

    const username = req.query.username;

    if (!username) {
      return res.status(400).json({ success: false, error: "Invalid request" });
    }

    if (username === user.username) {
      return res.status(200).json({
        success: true,
        name: user.name,
        username: user.username,
        pfp: user.pfp,
        chatWithUsers: user.chatWithUsers,
        friends: user.friends,
        requests: user.requests,
        sentFriendRequests: user.sentFriendRequests,
      });
    }

    const userDetails = await userInfo.findOne({ username: username });

    if (!userDetails) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.status(200).json({
      success: true,
      name: userDetails.name,
      username: userDetails.username,
      pfp: userDetails.pfp,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch multiple users by usernames
router.post("/getMultipleUserDetails", async (req, res) => {
  try {
    const { usernames } = req.body;

    if (!Array.isArray(usernames)) {
      return res.status(400).json({ success: false, error: "Invalid request" });
    }

    if (!usernames.length) {
      return res.status(200).json({ success: true, users: [] });
    }

    const usernamesList = usernames.map((user) => user.username);

    const users = await userInfo
      .find({ username: { $in: usernamesList } })
      .select("username name pfp");

    return res.status(200).json({ success: true, users: users });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// add friend
router.post("/addFriend", verifyToken, async (req, res) => {
  try {
    const user = req.user;
    const { friendRequestTo } = req.query;

    if (!friendRequestTo) {
      return res.status(400).json({ success: false, error: "Invalid request" });
    }

    if (
      user.sentFriendRequests.some((sent) => sent.username === friendRequestTo)
    ) {
      return res
        .status(400)
        .json({ success: false, error: "Friend request already sent" });
    }

    if (!(await userInfo.findOne({ username: friendRequestTo }))) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (friendRequestTo === user.username) {
      return res.status(400).json({ success: false, error: "Invalid request" });
    }

    const friendExists = await userInfo.find({
      $or: [
        {
          username: user.username,
          "friends.username": friendRequestTo,
        },
        {
          username: friendRequestTo,
          "friends.username": user.username,
        },
      ],
    });

    if (friendExists.length) {
      return res
        .status(404)
        .json({ success: false, error: "Friend already exists" });
    }

    await userInfo.updateOne(
      { username: friendRequestTo },
      {
        $push: {
          requests: {
            $each: [{ username: user.username }],
          },
        },
      }
    );

    await userInfo.updateOne(
      { username: user.username },
      {
        $push: {
          sentFriendRequests: {
            $each: [{ username: friendRequestTo }],
          },
        },
      }
    );

    res
      .status(200)
      .json({ success: true, message: "Friend added successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// remove friend
router.post("/removeFriend", verifyToken, async (req, res) => {
  try {
    const { friendToRemove } = req.query;

    if (!friendToRemove) {
      return res.status(400).json({ success: false, error: "Invalid request" });
    }

    if (!(await userInfo.findOne({ username: friendToRemove }))) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const requester = req.user.username;

    const friendExists = await userInfo.find({
      $or: [
        {
          username: requester,
          "friends.username": friendToRemove,
        },
        {
          username: friendToRemove,
          "friends.username": requester,
        },
      ],
    });

    if (!friendExists.length) {
      return res
        .status(404)
        .json({ success: false, error: "Friend not found" });
    }

    await userInfo.updateOne(
      { username: requester },
      {
        $pull: {
          friends: {
            username: friendToRemove,
          },
        },
      }
    );

    await userInfo.updateOne(
      { username: friendToRemove },
      {
        $pull: {
          friends: {
            username: requester,
          },
        },
      }
    );

    res
      .status(200)
      .json({ success: true, message: "Friend removed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Accept friend request
router.post("/acceptFriendRequest", verifyToken, async (req, res) => {
  try {
    const { friendRequestToAccept } = req.query;

    if (!friendRequestToAccept) {
      return res.status(400).json({ success: false, error: "Invalid request" });
    }

    const requester = req.user.username;

    const friendExists = await userInfo.find({
      $or: [
        {
          username: requester,
          "friends.username": friendRequestToAccept,
        },
        {
          username: friendRequestToAccept,
          "friends.username": requester,
        },
      ],
    });

    if (friendExists.length) {
      return res
        .status(404)
        .json({ success: false, error: "Friend already exists" });
    }

    await userInfo.updateOne(
      { username: requester },
      {
        $pull: {
          requests: {
            username: friendRequestToAccept,
          },
        },
        $push: {
          friends: {
            $each: [{ username: friendRequestToAccept }],
          },
        },
      }
    );

    await userInfo.updateOne(
      { username: friendRequestToAccept },
      {
        $pull: {
          sentFriendRequests: {
            username: requester,
          },
        },
        $push: {
          friends: {
            $each: [{ username: requester }],
          },
        },
      }
    );

    res
      .status(200)
      .json({ success: true, message: "Friend request accepted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reject friend request
router.post("/rejectFriendRequest", verifyToken, async (req, res) => {
  try {
    const { friendRequestToReject } = req.query;

    if (!friendRequestToReject) {
      return res.status(400).json({ success: false, error: "Invalid request" });
    }

    const requester = req.user.username;

    const friendExists = await userInfo.find({
      $or: [
        {
          username: requester,
          "friends.username": friendRequestToReject,
        },
        {
          username: friendRequestToReject,
          "friends.username": requester,
        },
      ],
    });

    if (friendExists.length) {
      return res
        .status(404)
        .json({ success: false, error: "Friend already exists" });
    }

    await userInfo.updateOne(
      { username: requester },
      {
        $pull: {
          requests: {
            username: friendRequestToReject,
          },
        },
      }
    );

    await userInfo.updateOne(
      { username: friendRequestToReject },
      {
        $pull: {
          sentFriendRequests: {
            username: requester,
          },
        },
      }
    );

    res
      .status(200)
      .json({ success: true, message: "Friend request rejected successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search users
router.post("/searchUsers", async (req, res) => {
  try {
    const { searchUser, limit } = req.body;

    if (!searchUser) {
      return res.status(400).json({ success: false, error: "Invalid request" });
    }

    const searchedUsers = await userInfo
      .find(
        {
          $or: [
            { name: new RegExp(searchUser, "i") },
            { username: searchUser },
          ],
        },
        { username: 1, name: 1, pfp: 1, _id: 0 }
      )
      .sort({ username: 1 })
      .limit(limit);

    if (!searchedUsers) {
      return res.status(400).json({ success: false, error: "No users found." });
    }

    res.json({
      success: true,
      searchedUsers: searchedUsers,
    });
  } catch (err) {
    res.status(500).json({ err: "Server error." });
  }
});

module.exports = router;
