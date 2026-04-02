const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
});

db.connect(err => {
  if (err) {
    console.error("DB connection error:", err);
  } else {
    console.log("MySQL Connected...");
    // Drop database if exists and recreate
    db.query("DROP DATABASE IF EXISTS sbpmns_db", (err) => {
      if (err) {
        console.error("Error dropping database:", err);
      } else {
        console.log("Database dropped");
        db.query("CREATE DATABASE sbpmns_db", (err) => {
          if (err) {
            console.error("Error creating database:", err);
          } else {
            console.log("Database sbpmns_db ready");
            db.changeUser({ database: "sbpmns_db" }, (err) => {
              if (err) {
                console.error("Error switching to database:", err);
              } else {
                console.log("Switched to sbpmns_db");
                // Now create tables
                require("../utils/createTables")();
              }
            });
          }
        });
      }
    });
  }
});

module.exports = db;