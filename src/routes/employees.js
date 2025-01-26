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

module.exports = router;
