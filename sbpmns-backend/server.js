const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: "../.env" });

const app = express();

app.use(cors());
app.use(express.json());

// DB
require("./config/db");

// Routes
const sbpmnsRoutes = require("./routes/sbpmnsRoutes");
app.use("/api/sbpmns", sbpmnsRoutes);

app.get("/test", (req, res) => {
  res.send("Server is running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});