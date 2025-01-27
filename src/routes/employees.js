const express = require("express");
const router = express.Router();
const db = require("../../config/database");

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

// Fetch Faculty Member by ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM employees WHERE id = ?";
  db.get(query, [id], (err, row) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.json(row);
  });
});

// src/routes/attendance.js
router.get("/:employeeId/status", (req, res) => {
  const query = `
    SELECT * FROM attendance
    WHERE employee_id = ? AND date = ?
    ORDER BY clock_in_time DESC
    LIMIT 1
  `;
  const currentDate = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format
  db.get(query, [req.params.employeeId, currentDate], (err, row) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json(row);
  });
});

module.exports = router;
