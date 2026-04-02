const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: "../.env" });

const app = express();

app.use(cors());
app.use(express.json());

// DB
const db = require("./config/db");

// Routes
const sbpmnsRoutes = require("./routes/sbpmnsRoutes");
app.use("/api/sbpmns", sbpmnsRoutes);

app.get("/test", (req, res) => {
  res.send("Server is running");
});

const PORT = process.env.PORT || 5000;

// Ping DB before starting server
const startServer = () => {
  db.query("SELECT 1", (err) => {
    if (err) {
      console.error("Cannot start server: Database ping failed.", err);
      console.error("Make sure MySQL is running and accessible with current DB settings.");
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log("Server running on port " + PORT);
    });
  });
};

startServer();