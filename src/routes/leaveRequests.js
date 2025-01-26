const express = require("express");
const router = express.Router();
const db = require("../../config/database");

router.post("/", (req, res) => {
  const { employeeId, type, duration, startDate, endDate, reason } = req.body;

  const query = `
    INSERT INTO leave_requests (employee_id, type, duration, start_date, end_date, reason)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [], function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ id: this.lastID });
  });
});

router.get("/", (req, res) => {
  const query = "SELECT * FROM leave_requests";
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json(rows);
  });
});

router.put("/:id", (req, res) => {
  const { status } = req.body;
  const query = "UPDATE leave_requests SET status = ? WHERE id = ?";

  db.run(query, [status, req.params.id], function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ changes: this.changes });
  });
});

module.exports = router;
