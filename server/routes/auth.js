require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const userInfo = require("../schemas/userInfo");
const router = express.Router();
var jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET_KEY;

// SIGNUP post
router.post("/signup", async (req, res) => {
  const parameter = {
    name: req.body.username,
    username: req.body.username,
    password: req.body.password,
  };

  const existingUser = await userInfo.findOne({ username: parameter.name });

  if (existingUser) {
    res
      .status(201)
      .json(Object.assign(parameter, { err: "Username already exists." }));
  } else {
    if (parameter.password.length < 8) {
      return res.status(201).json(
        Object.assign(parameter, {
          err: "Password should be atleast 8 characters long.",
        })
      );
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(parameter.password, saltRounds);
    parameter.password = hashedPassword;

    try {
      const user = await userInfo.insertMany(parameter);
      res.json({ name: parameter.name, success: true });
    } catch (err) {
      res.status(500).json(Object.assign(parameter, { err: `${err.errors}` }));
    }
  }
});

// LOGIN get
router.get("/login", async (req, res) => {
  try {
    const jwtResult = jwt.verify(req.headers["token"], JWT_SECRET);

    if (jwtResult) {
      const decodedJWT = jwt.decode(req.headers["token"], JWT_SECRET);
      const checkName = await userInfo.findOne({ _id: decodedJWT.id });

      res.json({
        success: true,
        name: checkName.name,
        username: checkName.username,
        pfp: checkName.pfp,
      });
    } else {
      res.status(400).json({ success: false, err: "Invalid token." });
    }
  } catch (err) {
    res.status(500).json({ success: false, err: "Modified auth token." });
  }
});

// LOGIN post
router.post("/login", async (req, res) => {
  const parameter = {
    name: req.body.username,
    username: req.body.username,
    password: req.body.password,
  };

  try {
    const checkName = await userInfo.findOne({ username: parameter.name });

    if (
      checkName &&
      (await bcrypt.compare(parameter.password, checkName.password))
    ) {
      const data = { username: checkName.username, id: checkName._id };
      const authtoken = jwt.sign(data, JWT_SECRET);

      res.json({
        success: true,
        authtoken,
        name: checkName.name,
        username: checkName.username,
        pfp: checkName.pfp,
      });
    } else {
      res
        .status(400)
        .json(Object.assign(parameter, { err: "Wrong Username or Password." }));
    }
  } catch (err) {
    res.status(500).json(Object.assign(parameter, { err: "Server error." }));
  }
});

module.exports = router;
