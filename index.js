const express = require("express");
const startServer = require("./utils/startServer");

// server creation 
const app = express();


app.get("/" , async (req ,res) => {
    res.send("Hello from the backend")
})
 

// function that starts server 
startServer(app);
