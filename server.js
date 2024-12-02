const express = require("express");
const path = require("path");
const db = require("./db");
const bcrypt = require("bcrypt");
const session = require("express-session");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index", { error: null });
});

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

app.get("/dashboard", (req, res) => {
  res.render("dashboard");
});

app.get("/admin-dashboard", (req, res) => {
  res.render("administrator");
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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
