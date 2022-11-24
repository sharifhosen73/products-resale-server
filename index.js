const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

//MiddleWare
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Resale Bike Server is running");
});

app.listen(port, () => {
  console.log("Resale Bike Server is running", port);
});
