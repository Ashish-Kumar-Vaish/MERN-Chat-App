const mongoose = require("mongoose");

// DEFINE USER SCHEMA
const chatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 20,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 20,
    trim: true,
    validate: [
      {
        validator: function (v) {
          return !/\s/.test(v);
        },
        message: "Username cannot contain spaces!",
      },
      {
        validator: function (v) {
          return /^[a-z0-9_]+$/.test(v);
        },
        message:
          "Not a valid username! Only lowercase letters, numbers, and underscores are allowed",
      },
    ],
  },
  email: {
    type: String,
    required: true,
    match: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  pfp: {
    type: String,
    required: true,
    default: "/assets/defaultPfp.png",
  },
  roomsJoined: [
    {
      roomId: {
        type: String,
        required: true,
      },
    },
  ],
  chatWithUsers: [
    {
      username: {
        type: String,
        required: true,
      },
    },
  ],
  friends: [
    {
      username: {
        type: String,
        required: true,
      },
    },
  ],
  requests: [
    {
      username: {
        type: String,
        required: true,
      },
    },
  ],
  sentFriendRequests: [
    {
      username: {
        type: String,
        required: true,
      },
    },
  ],
});

const userInfo = mongoose.model("userInfo", chatSchema);

module.exports = userInfo;
