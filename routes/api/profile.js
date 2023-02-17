const express = require("express");
const { check, validationResult } = require("express-validator");

const Profile = require("../../mongodb/models/profile");
const User = require("../../mongodb/models/user");

const router = express.Router();

//@author Olfa selmi
//@Route POST api/profile/update
//@Description  This is an updateProfile route
//@Access Public
// Route to handle the profile update request

router.post(
  "/update",
  [
    check("company", "Company is required").not().isEmpty(),
    check("location", "Location is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { id, company, location } = req.body;
    const user = await User.findOne({ id: id });
    if (!user) {
      return res.status(400).json({ message: "User not found!" });
    }
console.log(user);
    const profileFields = {};
    profileFields.user = id;
    if (company) profileFields.company = company;
    if (location) profileFields.location = location;

    try {
      let profile = await Profile.findOne({ user: id });
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      } else {
        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
  }
  }
);
module.exports = router;
