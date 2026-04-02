const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// DB
require("./sbpmns-backend/config/db");

// Routes
const sbpmnsRoutes = require("./sbpmns-backend/routes/sbpmnsRoutes");
app.use("/api/sbpmns", sbpmnsRoutes);

app.get("/", (req, res) => {
  res.send("SBPMNS API Running...");
});

app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});