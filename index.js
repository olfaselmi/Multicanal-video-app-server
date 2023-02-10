const express = require("express");
const connectDB = require("./mongodb/db");

const startServer = require("./utils/startServer");

const auth = require("./routes/api/auth");
const user = require("./routes/api/user");


//Connect Database
connectDB();
// server creation
const app = express();
//Init middleware (Body Parser , now it s included with express )
app.use(express.urlencoded())
app.use(express.json()) 
// API endpoints
app.use("/api/auth", auth);
app.use("/api/user", user);


// function that starts server
startServer(app);
              