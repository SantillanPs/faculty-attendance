const express = require("express");
const router = express.Router();
const db = require("../../config/database");
const { error } = require("console");

router.post("/", (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    department,
    designation,
    dateOfJoining,
    employmentType,
    profilePicture,
  } = req.body;

  const query = `INSERT INTO employees (first_name, last_name, email, phone, department, designation, date_of_joining, employment_type, profile_picture) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.run(
    query,
    [
      firstName,
      lastName,
      email,
      phone,
      department,
      designation,
      dateOfJoining,
      employmentType,
      profilePicture,
    ],
    function (err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.json({ id: this.lastID });
    }
  );
});

router.get("/", (req, res) => {
  const query = "SELECT * FROM employees";
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json(rows);
  });
});

router.get("/:employeeId/status", async (req, res) => {
  const { employeeId } = req.params;

  try {
    const row = await db.get(
      "SELECT is_logged_in FROM employees WHERE id = ?",
      [employeeId]
    );
    res.status(200).json({ is_logged_in: row.is_logged_in });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch status." });
  }
});

router.get("/:id", (req, res) => {
  const params = req.params.id; // Use the ID from the URL
  const query = "SELECT * FROM employees WHERE id = ?";
  db.get(query, [params], (error, user) => {
    if (error) {
      console.error("Error", error);
      res.status(500).json({ error: "Failed to fetch employee" });
    }
    res.json(user);
  });
});
module.exports = router;
