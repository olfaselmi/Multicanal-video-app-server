const express = require("express");
const gravatar = require("gravatar");
const { check, validationResult } = require("express-validator");
const User = require("../../mongodb/models/user");
const bcrypt = require("bcryptjs");
const router = express.Router();
const jwt = require("jsonwebtoken");

//@author Olfa selmi
//@Route POST api/user/register
//@Description  This is a registeration route
//@Access Public

router.post(
  "/register",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please enter a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with at least 6 characters"
    ).isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
   // Check inputs validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      // Get user avatar
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });
    // This doesn't create the user it just create an inctance of it (we have to implement the .save();)
      user = new User({
        name,
        email,
        avatar,
        password,
      });

      // Password encryption
      const salt = await bcrypt.genSalt(10);
      // I added the toString() otherwise it didn't work thanks to : https://github.com/bradtraversy/nodeauthapp/issues/7
      user.password = await bcrypt.hash(password.toString(), salt);
      await user.save();
      res.status(200).json({
        msg: "User registered successfully",
        user: user,
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
