const sqlite3 = require("sqlite3").verbose();

const database = new sqlite3.Database("./faculty_attendance.db", (error) => {
  if (error) {
    console.error("error connecting to database: ", error.message);
  } else {
    console.log("connected to database");
  }
});

module.exports = database;
