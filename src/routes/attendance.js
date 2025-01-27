const express = require("express");
const router = express.Router();
const db = require("../../config/database");

router.post("/", (req, res) => {
  const { employeeId, clockInTime, status, date } = req.body;
  const query = `
     INSERT INTO attendance (employee_id, clock_in_time, status, date)
    VALUES (?, ?, ?, ?)
    `;
  db.run(query, [employeeId, clockInTime, status, date], function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ id: this.lastID });
  });
});

router.get("/userId=:id", (req, res) => {
  const employeeId = req.params.id;

  const query = `
    SELECT * FROM attendance WHERE employee_id = ?
  `;

  db.all(query, [employeeId], (err, rows) => {
    if (err) {
      console.error("Error fetching attendance data:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    res.json(rows);
  });
});

router.put("/:id/clock-out", (req, res) => {
  const { clockOutTime } = req.body;
  const query = `
      UPDATE attendance
      SET clock_out_time = ?
      WHERE id = ?
    `;
  db.run(query, [clockOutTime, req.params.id], function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ changes: this.changes });
  });
});

router.get("/", (req, res) => {
  const query = "SELECT * FROM attendance";
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json(rows);
  });
});

module.exports = router;
