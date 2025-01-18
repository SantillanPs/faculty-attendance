const express = require("express");
const path = require("path");
const db = require("./database");
const bcrypt = require("bcrypt");
const session = require("express-session");
const app = express();
const jwt = require("jsonwebtoken");
const secretKey = "XsaJHmeUUEpMOnW4a9iuS6B4zOIiCqPi";
const saltRounds = 10;
// const mongoose = require("./mongoDB");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ error: "Access degnied. No token provided." });
  }

  jwt.verify(token, createSecretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    req.user = user;
    next();
  });
}

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/src/public")));

app.set("views", path.join(__dirname, "/src/views"));
app.set("view engine", "ejs");

//GET
app.get("/", (req, res) => {
  res.render("login", { error: null });
});

app.get("/profile", (req, res) => {
  res.render("/");
});

app.get("/dashboard", (req, res) => {
  res.render("dashboard");
});

app.get("/admin-dashboard", (req, res) => {
  res.render("administrator");
});

app.get("/register", (req, res) => {
  res.render("register");
});

//POST
app.post("/dashboard/clock-out", (req, res) => {
  const { id } = req.body;
  const clockOutTime = new Date().toLocaleTimeString();
  const date = new Date().toLocaleDateString();
  const status = "Off Duty";

  db.run(
    `UPDATE attendance SET clock_out_time = ? WHERE faculty_id = ? AND attendance_date = ?`,
    [clockOutTime, id, date],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      db.run(
        `UPDATE faculty SET status = ? WHERE id = ?`,
        [status, id],
        (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: "Clocked out successfully", status });
        }
      );
    }
  );
});

app.post("/dashboard/clock-in", (req, res) => {
  const { id } = req.body;
  const clockInTime = new Date().toLocaleTimeString();
  const date = new Date().toLocaleDateString();
  const status = "On Duty";

  db.run(
    `INSERT INTO attendance (faculty_id, clock_in_time, attendance_date) VALUES (?, ?, ?)`,
    [id, clockInTime, date],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      db.run(
        `UPDATE faculty SET status = ? WHERE id = ?`,
        [status, id],
        (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: "Clocked in successfully", status });
        }
      );
    }
  );
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Please provide name, email, and password" });
  }

  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const sql = `INSERT INTO faculty (name, email, password) VALUES (?, ?, ?)`;
  const params = [name, email, hashedPassword];

  db.run(sql, params, function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID });
  });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Please provide email and password" });
  }

  try {
    const sql = `SELECT * FROM faculty WHERE email = ?`;
    db.get(sql, [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }

      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, secretKey, {
        expiresIn: "1h",
      });
      res.json({ token });
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
