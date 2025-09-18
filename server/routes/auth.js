require("dotenv").config();
const express = require("express");
const router = express.Router();
const userInfo = require("../schemas/userInfo");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET_KEY;

// SIGNUP post
router.post("/signup", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    const existingUser = await userInfo.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error:
          existingUser.email === email
            ? "Email already in use."
            : "Username already in use.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 8 characters long.",
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await userInfo.create({
      email: email,
      name: username,
      username: username,
      password: hashedPassword,
    });

    if (!newUser) {
      return res.status(500).json({ success: false, error: "Server error." });
    }

    res.json({ success: true, username: newUser.username });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// LOGIN post
router.post("/login", async (req, res) => {
  const { email, username, password } = req.body;

  try {
    const user = email
      ? await userInfo.findOne({ email: email })
      : await userInfo.findOne({ username: username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials." });
    }

    const authtoken = jwt.sign(
      { username: user.username, id: user._id },
      JWT_SECRET,
      { expiresIn: "14d" }
    );

    res.json({
      success: true,
      authtoken,
      email: user.email,
      name: user.name,
      username: user.username,
      pfp: user.pfp,
    });
  } catch (error) {
    res.status(500).json(Object.assign(parameter, { error: "Server error: " + error.message }));
  }
});

// GET me
router.get("/me", async (req, res) => {
  try {
    const auth = req.headers["token"];

    if (!auth) {
      res.status(401).json({ error: "Token is not formatted correctly." });
    }

    let jwtResult;
    try {
      jwtResult = jwt.verify(auth, JWT_SECRET);
    } catch (error) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid or expired token." });
    }

    const user = await userInfo.findOne({ _id: jwtResult.id });

    if (!user) {
      res.status(404).json({ error: "User not found." });
    }

    res.json({
      success: true,
      email: user.email,
      name: user.name,
      username: user.username,
      pfp: user.pfp,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
