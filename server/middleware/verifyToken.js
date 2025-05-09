require("dotenv").config();
var jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET_KEY;
const userInfo = require("../schemas/userInfo");

// verify jwt auth token and return user info
const verifyToken = async (req, res, next) => {
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

    const user = await userInfo
      .findOne({ _id: jwtResult.id })
      .select("-password -email");

    if (!user) {
      res.status(404).json({ error: "User not found." });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { verifyToken };
