const express = require("express");
const app = express.Router();
const saltRounds = 10;
const db = require("../../config/database");
const bcrypt = require("bcrypt");

const STATUS_ON_DUTY = "On Duty";
const STATUS_OFF_DUTY = "Off Duty";

app.get("/dashboard", (req, res) => {
  res.render("dashboard");
});

app.get("/admin-dashboard", (req, res) => {
  res.render("administrator");
});

app.get("/form", (req, res) => {
  res.render("form");
});

app.get("/delete-users", (req, res) => {
  const query = "delete from faculty";
  db.all(query, [], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    }
    res.json("successfully cleared table");
  });
});
//, , ,
app.get("/droptables", (req, res) => {
  const query =
    "CREATE TABLE leave_requests (id INTEGER PRIMARY KEY AUTOINCREMENT,employee_id INTEGER NOT NULL,type TEXT NOT NULL,duration TEXT NOT NULL,start_date TEXT NOT NULL,end_date TEXT NOT NULL,reason TEXT NOT NULL,status TEXT DEFAULT 'Pending',FOREIGN KEY (employee_id) REFERENCES employees (id));";
  db.all(query, [], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    }
    res.json("successfully created table");
  });
});

app.get("/users", (req, res) => {
  const query = "select * from faculty";
  db.all(query, [], (err, users) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(users);
  });
});

//POST
app.post("/dashboard/clock-in", async (req, res) => {});

app.post("/dashboard/clock-out", async (req, res) => {});

app.post("/signup", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res
      .status(400)
      .json({ error: "Please provide name, email, and password" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const sql = `INSERT INTO faculty (name, email, password) VALUES (?, ?, ?)`;
    const params = [fullName, email, hashedPassword];

    db.run(sql, params, function (err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    });
  } catch (error) {
    console.error("error during registration:", error);
    res.status9500.json({ error: "Internal server error" });
  }
});

module.exports = app;
