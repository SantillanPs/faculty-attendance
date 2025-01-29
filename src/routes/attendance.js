const express = require("express");
const router = express.Router();
const db = require("../../config/database");

router.post("/", async (req, res) => {
  const { employeeId, clockInTime, status, date, is_logged_in } = req.body;

  try {
    // Insert attendance record
    await db.run(
      "INSERT INTO attendance (employee_id, clock_in_time, status, date) VALUES (?, ?, ?, ?)",
      [employeeId, clockInTime, status, date]
    );

    // Update is_logged_in status
    await db.run("UPDATE employees SET is_logged_in = ? WHERE id = ?", [
      is_logged_in,
      employeeId,
    ]);

    res.status(200).json({ message: "Clocked in successfully." });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to clock in." });
  }
});

router.get("/:id/status", (req, res) => {
  const params = req.params.id;
  const query = "SELECT * FROM employees WHERE id = ?";
  db.get(query, [params], (err, users) => {
    if (err) {
      console.error("Error fetching attendance data:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    res.json(users);
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

router.put("/:id/clock-out", async (req, res) => {
  const { id } = req.params; // Use `id` from the URL params
  const { clockOutTime } = req.body; // Extract `clockOutTime` from the request body

  try {
    // Step 1: Update the most recent attendance record with the clock-out time
    await db.run(
      `UPDATE attendance 
       SET clock_out_time = ? 
       WHERE employee_id = ? 
       AND clock_out_time IS NULL`, // Ensure we're updating the most recent record
      [clockOutTime, id]
    );

    // Step 2: Update the `is_logged_in` status in the `employees` table
    await db.run(
      `UPDATE employees 
       SET is_logged_in = ? 
       WHERE id = ?`,
      [false, id] // Set `is_logged_in` to `false`
    );

    res.status(200).json({ message: "Clocked out successfully." });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to clock out." });
  }
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
