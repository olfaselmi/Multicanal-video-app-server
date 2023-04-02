const express = require("express");
const { check, validationResult } = require("express-validator");
const Profile = require("../../mongodb/models/profile");
const User = require("../../mongodb/models/user");
const authMiddleware = require("../../middleware/authMiddleware");
const router = express.Router();
//@author Olfa Selmi
//@route GET api/profile/me
//@desc Get current users profile
//@access Private
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);

    // If there is no existing profile
    if (!profile) {
      return res
        .status(400)
        .json({ message: "There is no profile for this user " });
    }

    // If there is a profile
    res.json(profile);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

//@author Olfa selmi
//@Route POST api/profile/update
//@Description  This is an updateProfile route
//@Access Public
// Route to handle the profile update request

router.post(
  "/update",
  [
    authMiddleware,
    [
      check("company", "Company is required").not().isEmpty(),
      check("location", "Location is required").not().isEmpty(),
    ],
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

//@author Olfa Selmi
//@route DELETE api/profile
//@desc Delete profile , user & posts
//@access Private
router.delete("/", authMiddleware, async (req, res) => {
  try {
    // Remove profile
    await Profile.findOneAndRemove({ user: req.user.id });

    // Remove user
    await User.findOneAndRemove({ _id: req.user.id });

    // whatever comes later
    res.json({ message: "User deleted with success" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

//@author Olfa Selmi
//@route DELETE api/profile
//@desc Delete profile , user & posts by id
//@access Private
router.delete("/:id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      _id: req.params.id,
    }).populate("user", ["name", "avatar"]);

    const user = await User.findOne({ _id: profile.user });

    // Remove profile
    await Profile.findOneAndRemove({ _id: req.params.id });

    // Remove user
    await User.findOneAndRemove({ _id: user._id });

    await transporter.sendMail({
      to: user.email,
      from: "selmisolfa@gmail.com",
      subject: "Sign up success",
      html: "<h1>You account have been removed for some reasons , contact our service for more informations </h1>",
    });

    // whatever comes later
    res.json({ message: "User deleted with success" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});
//@author Olfa Selmi
//@route POST api/profile/report/:id
//@desc report a profile
//@access Private
router.post("/report/:id", authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ _id: req.params.id });

    if (!profile) {
      return res.status(404).json({ message: "Profile not Found " });
    }

    profile.reports.unshift({ user: req.user.id });

    await profile.save();

    res.json(profile.reports);
  } catch (error) {
    console.error(error.message);

    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Profile not Found " });
    }

    res.status(500).send("Server error");
  }
});
//@author Olfa Selmi
//@route GET api/profile
//@desc Get all profiles
//@access Private
router.get("/getmyall", authMiddleware, async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);

    const profile = await Profile.findOne({ user: req.user.id });

    const block_list = profile.block_list.filter((block) =>
      block.user.toString()
    );

    console.log(
      "voici la liste",
      block_list.filter(
        (block) => block.user.toString() === profiles[0].user.toString()
      ).length
    );

    for (var i = 0; i < profiles.length; i++) {
      if (
        profile.block_list.filter(
          (block) => block.user.toString() == profiles[i].user
        )
      ) {
        profiles.splice(i, 1);
      }
    }

    res.json(profiles.length);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

//@author Olfa Selmi
//@route PUT api/profile/block/:id
//@desc Block profile
//@access Private
router.put("/block/:id", authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    const blockedProfile = await Profile.findOne({ user: req.params.id });

    if (!blockedProfile) {
      return res.status(404).json({ message: "Post not Found " });
    }

    //Check if the profile is already blocked by the user
    if (
      profile.block_list.filter(
        (block) => block.user.toString() == blockedProfile.user
      ).length > 0
    ) {
      return res
        .status(400)
        .json({ message: "This user is already blocked !" });
    }

    profile.block_list.unshift({ user: blockedProfile.user });

    await profile.save();

    res.json(profile.block_list);
  } catch (error) {
    console.error(error.message);

    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Post not Found " });
    }

    res.status(500).send("Server error");
  }
});

//@author Olfa Selmi
//@route DELETE api/profile/block/:id
//@desc Unblock profile
//@access Private
router.delete("/unblock/:id", authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    const blockedProfile = await Profile.findOne({ user: req.params.id });

    if (!blockedProfile) {
      return res.status(404).json({ message: "Post not Found " });
    }

    //Check if the profile is already unblocked by the user
    if (
      profile.block_list.filter(
        (block) => block.user.toString() == blockedProfile.user
      ).length == 0
    ) {
      return res.status(400).json({ message: "This user is not blocked !" });
    }

    //Remove Index
    const removeIndex = profile.block_list
      .map((block) => block.user.toString())
      .indexOf(blockedProfile.user);

    profile.block_list.splice(removeIndex, 1);

    await profile.save();

    res.json(profile.block_list);
  } catch (error) {
    console.error(error.message);

    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Post not Found " });
    }

    res.status(500).send("Server error");
  }
});

//@author Olfa Selmi
//@route POST api/profile/notification
//@desc Notify me
//@access Private
router.post("/notify-me", authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    profile.notification.unshift({ message: req.body.message });

    await profile.save();

    res.json(profile.notification);
  } catch (error) {
    console.error(error.message);

    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Post not Found " });
    }

    res.status(500).send("Server error");
  }
});

//@author Olfa Selmi
//@route POST api/profile/notify-other-user/:id
//@desc Notify other user
//@access Private
router.post("/notify-other-user/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    const profile = await Profile.findOne({ user: user._id });

    profile.notification.unshift({ message: req.body.message });

    await profile.save();

    res.json(profile.notification);
  } catch (error) {
    console.error(error.message);

    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Post not Found " });
    }

    res.status(500).send("Server error");
  }
});

//@author Olfa Selmi
//@route PUT api/profile/view/:id
//@desc view a profile
//@access Private
router.put("/view/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const profile = await Profile.findOne({ _id: req.params.id });

    const myProfile = await Profile.findOne({ user: req.user.id });

    console.log(profile);

    //Check if the view is already there
    if (
      profile.views_profile.filter(
        (view) => view.user.toString() === req.user.id
      ).length > 0
    ) {
      return res.status(400).json({ message: "Profile already viewed !" });
    }

    const newView = {
      user: req.user.id,
      profile: myProfile._id,
      name: user.name,
      avatar: user.avatar,
    };

    profile.views_profile.unshift(newView);

    await profile.save();
    res.json(profile.views_profile);
  } catch (error) {
    console.error(error.message);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Profile not Found " });
    }
    res.status(500).send("Server error");
  }
});

//@author Olfa Selmi
//@route GET api/profile/suggestion
//@desc get suggestions
//@access Private
router.get("/suggestion", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    const profile = await await Profile.findOne({ user: user._id });
    const profiles = await Profile.find();

    // If there is no existing profile
    if (!profile) {
      return res
        .status(400)
        .json({ message: "There is no profile for this user " });
    }

    const newSuggestions = {};

    for (let i = 0; i < profiles.length; i++) {
      if (profile.company === profiles[i].company) {
        newSuggestions.profile = profiles[i].user;
        newSuggestions.name = profiles[i].name;
        newSuggestions.avatar = profiles[i].avatar;
        profile.suggestions_friends.push(newSuggestions);
      }
      if (profile.status === profiles[i].status) {
        newSuggestions.profile = profiles[i].user;
        newSuggestions.name = profiles[i].name;
        newSuggestions.avatar = profiles[i].avatar;
        profile.suggestions_friends.push(newSuggestions);
      }

      for (let j = 0; j < profile.skills.length; j++) {
        for (k = 0; k < profiles[i].skills.length; k++) {
          if (
            profile.skills[j].toLowerCase() ===
            profiles[i].skills[k].toLowerCase()
          ) {
            newSuggestions.profile = profiles[i].user;
            newSuggestions.name = profiles[i].name;
            newSuggestions.avatar = profiles[i].avatar;
            profile.suggestions_friends.push(newSuggestions);
          }
        }
      }
    }

    let suggestionList = profile.suggestions_friends;

    suggestionList = suggestionList.reduce((acc, current) => {
      const x = acc.find((item) => item.name === current.name);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);

    suggestionList = suggestionList.filter(function (obj) {
      return obj.name !== profile.name;
    });

    //await profile.save();

    res.json(suggestionList);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
