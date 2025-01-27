const express = require("express");
const router = express.Router();
const db = require("../../config/database");

router.post("/", (req, res) => {
  const { employeeId, type, duration, startDate, endDate, reason } = req.body;

  // Validate required fields
  if (!employeeId || !type || !duration || !startDate || !endDate || !reason) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const query = `
    INSERT INTO leave_requests (employee_id, type, duration, start_date, end_date, reason)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [employeeId, type, duration, startDate, endDate, reason],
    function (err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.json({ id: this.lastID });
    }
  );
});

router.get("/", (req, res) => {
  const query = `
    SELECT 
      lr.id AS leave_id,
      lr.employee_id,
      lr.type,
      lr.duration,
      lr.start_date,
      lr.end_date,
      lr.reason,
      lr.status,
      e.first_name,
      e.last_name,
      e.email,
      e.profile_picture
    FROM 
      leave_requests lr
    JOIN 
      employees e ON lr.employee_id = e.id;
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    // Format the response to include employee details
    const formattedRows = rows.map((row) => ({
      id: row.leave_id,
      employee_id: row.employee_id,
      type: row.type,
      duration: row.duration,
      start_date: row.start_date,
      end_date: row.end_date,
      reason: row.reason,
      status: row.status,
      employee: {
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        profile_picture: row.profile_picture,
      },
    }));

    res.json(formattedRows);
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
