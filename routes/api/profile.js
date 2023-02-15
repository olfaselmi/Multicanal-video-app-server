const express = require("express");
const request = require("request");
const config = require("config");
const { check, validationResult } = require("express-validator/check");
const auth = require("../api/auth");
const Profile = require("../../mongodb/models/profile");
const User = require("../../mongodb/models/user");
//@author Olfa selmi
//@Route POST api/updateprofile
//@Description  This is an updateProfile route
//@Access Public
router.post("/update", [auth, [check("email", "Please include a valid email").isEmail ,
check("password", "Please enter a password with 6 or more characters").isLength({ min: 6 })]],
async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user.id).select("-password");
 
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername) profileFields.githubusername = req.body.githubusername;
    if (req.body.linkedin) profileFields.linkedin = req.body.linkedin;
    if (req.body.twitter) profileFields.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.facebook = req.body.facebook;
    if (req.body.youtube) profileFields.youtube = req.body.youtube;
    if (req.body.instagram) profileFields.instagram = req.body.instagram;

    try  {
        let profile = await Profile.findOne({ user: req.user.id });
        if (profile) {
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
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
)