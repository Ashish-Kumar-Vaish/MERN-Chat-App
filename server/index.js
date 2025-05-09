const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();

// Node server which will handle socket.io connections
const { createServer } = require("http");
const { Server } = require("socket.io");
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.FRONT_END_URL },
});

// Connect to MongoDB
const mongoose = require("mongoose");
async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB!");
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
  }
}
main();

// EXPRESS
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(
  cors({
    origin: process.env.FRONT_END_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// ENDPOINTS
app.use("/api/auth", require("./routes/auth"));
app.use("/api/history", require("./routes/history"));
app.use("/api/rooms", require("./routes/rooms"));
app.use("/api/user", require("./routes/user"));

// SOCKET.IO
const roomInfo = require("./schemas/roomInfo");
const userInfo = require("./schemas/userInfo");
const directMessages = require("./schemas/directMessagesInfo");

// Push new message function
const updateDB = async (roomId, newItems) => {
  try {
    const updatedChat = await roomInfo.findOneAndUpdate(
      { roomId: roomId },
      { $push: { messageHistory: { $each: newItems } } },
      { new: true }
    );

    return updatedChat;
  } catch (error) {
    console.log(error);
  }
};

const userSockets = new Map();
const roomMap = new Map();

// io events
io.on("connection", async (socket) => {
  // User connects to room
  socket.on("userJoined", async (data) => {
    if (!data.username || !data.roomId) {
      return;
    }

    socket.room = data.roomId;
    socket.username = data.username;

    if (roomMap.has(socket.id) && roomMap.get(socket.id).has(socket.room)) {
      return;
    }

    if (!roomMap.has(socket.id)) {
      roomMap.set(socket.id, new Set());
    }

    roomMap.get(socket.id).add(socket.room);
    socket.join(socket.room);
  });

  // User sends a message
  socket.on("send", async (data) => {
    const newItems = [
      {
        message: data.message,
        position: "relative",
        senderUsername: data.senderUsername,
      },
    ];

    const updatedChat = await updateDB(socket.room, newItems);

    if (updatedChat) {
      socket.to(socket.room).emit("receive", {
        message: data.message,
        position: "relative",
        senderUsername: data.senderUsername,
      });
    }
  });

  // User disconnects
  socket.on("disconnect", async () => {
    if (socket.username) {
      const userSet = userSockets.get(socket.username);

      if (userSet) {
        userSet.delete(socket.id);

        if (userSet.size === 0) {
          userSockets.delete(socket.username);
        }
      }
    }

    const roomsToLeave = roomMap.get(socket.id);

    if (roomsToLeave) {
      for (let room of roomsToLeave) {
        socket.leave(room);
      }

      roomMap.delete(socket.id);
    }
  });

  // Join room
  socket.on("joinRoom", async (data) => {
    if (!data.username || !data.roomId) {
      return;
    }

    const user = await userInfo.findOne({ username: data.username });

    if (user.roomsJoined.find((room) => room.roomId === data.roomId)) {
      return;
    }

    const newItems = [
      {
        message: "joined the room",
        position: "center",
        senderUsername: data.username,
      },
    ];

    const updatedChat = await updateDB(data.roomId, newItems);

    const addRoom = await userInfo.findOneAndUpdate(
      { username: data.username },
      {
        $push: {
          roomsJoined: {
            $each: [{ roomId: data.roomId }],
          },
        },
      },
      { new: true }
    );

    const addRoomMember = await roomInfo.findOneAndUpdate(
      { roomId: data.roomId },
      {
        $push: {
          roomMembers: { memberUsername: data.username },
        },
      },
      { new: true }
    );

    if (addRoom && updatedChat && addRoomMember) {
      socket.to(data.roomId).emit("receive", {
        message: newItems[0].message,
        position: newItems[0].position,
        senderUsername: newItems[0].senderUsername,
      });
    }
  });

  // Leave room
  socket.on("leaveRoom", async (data) => {
    const updatedRooms = await userInfo.updateOne(
      { username: data.username },
      { $pull: { roomsJoined: { roomId: data.roomId } } }
    );

    const updatedRoomMembers = await roomInfo.updateOne(
      { roomId: data.roomId },
      { $pull: { roomMembers: { memberUsername: data.username } } }
    );

    const newItems = [
      {
        message: "left the room",
        position: "center",
        senderUsername: data.username,
      },
    ];

    const updatedChat = await updateDB(data.roomId, newItems);

    if (updatedRooms && updatedRoomMembers && updatedChat) {
      socket.to(data.roomId).emit("otherUserLeftRoom", {
        username: data.username,
      });
      socket.leave(data.roomId);
    }
  });

  // Update pfp
  socket.on("updatePfp", (data) => {
    io.emit("pfpUpdated", {
      username: data.username,
      newPfpUrl: data.newPfpUrl,
    });
  });

  // Private Connect
  socket.on("privateConnect", async (data) => {
    if (!data.username) {
      return;
    }

    socket.username = data.username;

    if (!userSockets.has(data.username)) {
      userSockets.set(data.username, new Set());
    }
    userSockets.get(data.username).add(socket.id);
  });

  // Private Message
  socket.on("privateMessage", async (data) => {
    if (data.senderUsername === data.receiverUsername) return;

    const emitToUserSockets = (username, payload) => {
      const sockets = userSockets.get(username);
      if (sockets) {
        sockets.forEach((id) => {
          io.to(id).emit("receivePrivateMessage", payload);
        });
      }
    };

    const messagePayload = {
      message: data.message,
      senderUsername: data.senderUsername,
    };

    const conversationUsers =
      (await directMessages.findOne({
        users: [data.senderUsername, data.receiverUsername],
      })) ||
      (await directMessages.findOne({
        users: [data.receiverUsername, data.senderUsername],
      }));

    if (conversationUsers) {
      const updatedConversation = await directMessages.findOneAndUpdate(
        { _id: conversationUsers._id },
        {
          $push: {
            messages: {
              $each: [
                { message: data.message, senderUsername: data.senderUsername },
              ],
            },
          },
        },
        { new: true }
      );

      if (updatedConversation) {
        emitToUserSockets(data.senderUsername, messagePayload);
        emitToUserSockets(data.receiverUsername, messagePayload);
      }
    } else {
      const newConversation = await directMessages.create({
        users: [data.senderUsername, data.receiverUsername],
        messages: [
          {
            message: data.message,
            senderUsername: data.senderUsername,
          },
        ],
      });

      await userInfo.findOneAndUpdate(
        { username: data.senderUsername },
        {
          $push: {
            chatWithUsers: {
              $each: [{ username: data.receiverUsername }],
            },
          },
        },
        { new: true }
      );

      await userInfo.findOneAndUpdate(
        { username: data.receiverUsername },
        {
          $push: {
            chatWithUsers: {
              $each: [{ username: data.senderUsername }],
            },
          },
        },
        { new: true }
      );

      if (newConversation) {
        emitToUserSockets(data.senderUsername, messagePayload);
        emitToUserSockets(data.receiverUsername, messagePayload);
      }
    }
  });
});

// SERVER START
const port = process.env.PORT || 8000;
httpServer.listen(port, () => {
  console.log(
    `The server has started successfully on http://localhost:${port}`
  );
});
