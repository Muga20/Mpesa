const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const moment = require("moment");

const STKRouter = require('./routes/stkPush')

// const db = require("./config/config");
require("dotenv").config();

// Create an Express application
const app = express();
const PORT = process.env.PORT;

// Middleware for parsing request bodies here:
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// Create an HTTP server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});


// Routes
app.use("/", STKRouter);


module.exports = app; 
