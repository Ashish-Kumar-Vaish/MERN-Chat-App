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
app.use(cors({ origin: process.env.FRONT_END_URL, methods: ["GET", "POST"] }));

// ENDPOINTS
app.use("/api/auth", require("./routes/auth"));
app.use("/api/history", require("./routes/history"));
app.use("/api/rooms", require("./routes/rooms"));
app.use("/api/user", require("./routes/user"));

// SOCKET.IO
const roomInfo = require("./schemas/roomInfo");
const userInfo = require("./schemas/userInfo");

// push new message function
const updateDB = async (roomId, newItems) => {
  try {
    const updatedChat = await roomInfo.findOneAndUpdate(
      { roomId: roomId },
      {
        $push: {
          messageHistory: { $each: newItems },
        },
      },
      { new: true }
    );
    return updatedChat;
  } catch (error) {
    console.log(error);
  }
};

// io events
io.on("connection", async (socket) => {
  const roomMap = new Map();

  // user connects to room
  socket.on("userJoined", async (data) => {
    if (!data.username || !data.roomId) {
      return;
    }

    socket.room = data.roomId;
    socket.username = data.username;

    if (roomMap.has(socket.id) && roomMap.get(socket.id).has(socket.room)) {
      return;
    } else if (!roomMap.has(socket.id)) {
      roomMap.set(socket.id, new Set());
    }

    roomMap.get(socket.id).add(socket.room);
    socket.join(socket.room);
  });

  // user sends a message
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
        position: "left",
        senderUsername: data.senderUsername,
      });
    }
  });

  // user disconnects
  socket.on("disconnect", async () => {
    if (!socket.username) {
      return;
    }

    const roomsToLeave = roomMap.get(socket.id);

    if (roomsToLeave) {
      for (let room of roomsToLeave) {
        socket.leave(room);
      }

      roomMap.delete(socket.id);
    }
  });

  // join room
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

  // leave room
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

  socket.on("updatePfp", (data) => {
    io.emit("pfpUpdated", {
      username: data.username,
      newPfpUrl: data.newPfpUrl,
    });
  });
});

// SERVER START
const port = process.env.PORT || 8000;
httpServer.listen(port, () => {
  console.log(
    `The server has started successfully on port http://localhost:${port}`
  );
});
