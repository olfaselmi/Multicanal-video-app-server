const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../../mongodb/models/user");
const router = express.Router();
const bcrypt = require("bcryptjs");

//@author Olfa selmi
//@Route GET api/auth
//@Description  This is a test route
//@Access Public
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ message: "User not found!" });
    }
    let isMatch = bcrypt.compare(password.toString(), user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password!" });
    }
    const payload = { user: { id: user.id, email: user.email } };
    let jwToken = jwt.sign(payload, "this a scret key");
    return res.status(200).json({
      message: "User connected!",
      user: {
        _id: user.user,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      token: jwToken,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Server error");
  }
});

module.exports = router;
