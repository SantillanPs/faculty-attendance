require("dotenv").config();
const express = require("express");
const path = require("path");
const db = require("./database");
const bcrypt = require("bcrypt");
const session = require("express-session");
const app = express();
const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET_KEY;
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/src/public")));

app.set("views", path.join(__dirname, "/src/views"));
app.set("view engine", "ejs");

const PORT = process.env.PORT || 3000;

const STATUS_ON_DUTY = "On Duty";
const STATUS_OFF_DUTY = "Off Duty";

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

app.get("/signup", (req, res) => {
  res.render("signup");
});

//POST
app.post("/dashboard/clock-in", authenticateToken, async (req, res) => {
  const { id } = req.body;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "Invalid faculty ID" });
  }

  const clockInTime = new Date().toLocaleTimeString();
  const date = new Date().toLocaleDateString();

  try {
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      db.run(
        `INSERT INTO attendance (faculty_id, clock_in_time, attendance_date) VALUES (?, ?, ?)`[
          (id, clockInTime, date)
        ],
        function (err) {
          if (err) {
            db.run("ROLLBACK");
            return res.status(500).json({ error: err.message });
          }

          db.run(
            `UPDATE faculty SET status = ? WHERE id = ?`,
            [STATUS_ON_DUTY, id],
            function (err) {
              if (err) {
                db.run("ROLLBACK");
                return res.status(500).json({ error: err.message });
              }

              db.run("COMMIT");
              res.json({
                message: "Clocked in successfully",
                status: STATUS_ON_DUTY,
              });
            }
          );
        }
      );
    });
  } catch (error) {
    console.error("Error during clock-in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/dashboard/clock-out", authenticateToken, async (req, res) => {
  const { id } = req.body;

  // Input validation
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "Invalid faculty ID" });
  }

  const clockOutTime = new Date().toLocaleTimeString();
  const date = new Date().toLocaleDateString();

  try {
    // Start a database transaction
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      // Update clock-out time in the attendance table
      db.run(
        `UPDATE attendance SET clock_out_time = ? WHERE faculty_id = ? AND attendance_date = ?`,
        [clockOutTime, id, date],
        function (err) {
          if (err) {
            db.run("ROLLBACK");
            return res.status(500).json({ error: err.message });
          }

          // Update faculty status to "Off Duty"
          db.run(
            `UPDATE faculty SET status = ? WHERE id = ?`,
            [STATUS_OFF_DUTY, id],
            function (err) {
              if (err) {
                db.run("ROLLBACK");
                return res.status(500).json({ error: err.message });
              }

              // Commit the transaction
              db.run("COMMIT");
              res.json({
                message: "Clocked out successfully",
                status: STATUS_OFF_DUTY,
              });
            }
          );
        }
      );
    });
  } catch (error) {
    console.error("Error during clock-out:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

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

app.post("/", async (req, res) => {
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
