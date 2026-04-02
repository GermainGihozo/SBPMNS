const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST || "127.0.0.1",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "sbpmns_db",
  connectTimeout: 10000,
});

db.connect(err => {
  if (err) {
    console.error("DB connection error:", err);
    console.error("Ensure MySQL is running and DB_HOST/DB_PORT/DB_USER/DB_PASSWORD are correct.");
    return;
  }

  console.log("MySQL Connected...");

  const createDatabase = `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || "sbpmns_db"}`;
  db.query(createDatabase, (err) => {
    if (err) {
      console.error("Error creating database:", err);
      return;
    }

    console.log(`${process.env.DB_NAME || "sbpmns_db"} is ready`);

    db.changeUser({ database: process.env.DB_NAME || "sbpmns_db" }, (err) => {
      if (err) {
        console.error("Error switching to database:", err);
        return;
      }

      console.log(`Switched to ${process.env.DB_NAME || "sbpmns_db"}`);
      require("../utils/createTables")();
    });
  });
});

// Reconnect on server disconnect
db.on("error", (err) => {
  console.error("MySQL error event:", err);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    console.warn("MySQL connection lost. Reconnecting...");
    setTimeout(() => db.connect(), 2000);
  }
});

module.exports = db;