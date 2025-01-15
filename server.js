const express = require("express");
const path = require("path");
const db = require("./database");
const bcrypt = require("bcrypt");
const session = require("express-session");
const app = express();

const saltRounds = 10;
// const mongoose = require("./mongoDB");

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.set("views", path.join(__dirname, "/src"));
app.set("view engine", "ejs");

//GET
app.get("/", (req, res) => {
  res.render("login", { error: null });
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

// app.get("/users", (req, res) => {
//   db.all(`select * from faculty`, [], (err, users) => {
//     if (err) {
//       console.error("Database query failed:", err);
//       res.status(500).send("Internal Server Error");
//     } else {
//       res.json(users);
//     }
//   });
// });

//POST
app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;

  db.get(`SELECT * FROM faculty WHERE email = ?`, [email], (err, user) => {
    if (err) {
      return res
        .status(500)
        .render("index", { error: "Internal server error." });
    }

    if (!user) {
      document.getElementById("errorMessage").innerHTML =
        "Invalid email or Password";
    }

    const passwordMatch = bcrypt.compareSync(password, user.password);
    if (!passwordMatch) {
      document.getElementById("errorMessage").innerHTML =
        "Invalid email or Password";
    }

    req.session.userId = user.id;
    res.redirect("/dashboard");
  });
});

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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
