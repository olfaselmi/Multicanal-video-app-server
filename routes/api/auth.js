const express = require("express");

const router = express.Router();

//@author Olfa selmi
//@Route GET api/auth
//@Description  This is a test route
//@Access Public
router.get("/olfa", async (req, res) => {
  try {
    res.send("Hello from auth route");
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
