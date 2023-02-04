const express = require("express");
const startServer = require("./utils/startServer");

const auth = require("./routes/api/auth");

// server creation
const app = express();

// API endpoints
app.use("/api/auth", auth);

// function that starts server
startServer(app);
