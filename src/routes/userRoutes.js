const express = require("express");
const router = express.Router();
const saltRounds = 10;
const db = require("../../config/database");
const bcrypt = require("bcrypt");

router.get("/dashboard", (req, res) => {
  res.render("dashboard");
});

router.get("/hr-dashboard", (req, res) => {
  res.render("hr");
});

router.get("/form", (req, res) => {
  res.render("form");
});

//GET
router.get("/", (req, res) => {
  res.render("landingpage", { error: null });
});

// router.get("/delete-user", (req, res) => {
//   const query = "DELETE FROM employees WHERE id = 5;";
//   db.all(query, [], (err) => {
//     if (err) {
//       res.status(500).json({ error: err.message });
//     }
//     res.json("successfully cleared table");
//   });
// });

router.get("/drop", (req, res) => {
  const query =
    "ALTER TABLE employees ADD COLUMN is_logged_in BOOLEAN DEFAULT FALSE;";
  db.all(query, [], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    }
    res.json("successfully modified table");
  });
});

// router.get("/users", (req, res) => {
//   const query = "select * from faculty";
//   db.all(query, [], (err, users) => {
//     if (err) {
//       res.status(500).json({ error: err.message });
//       return;
//     }
//     res.json(users);
//   });
// });

// router.post("/signup", async (req, res) => {
//   const { fullName, email, password } = req.body;

//   if (!fullName || !email || !password) {
//     return res
//       .status(400)
//       .json({ error: "Please provide name, email, and password" });
//   }

//   try {
//     const hashedPassword = await bcrypt.hash(password, saltRounds);

//     const sql = `INSERT INTO faculty (name, email, password) VALUES (?, ?, ?)`;
//     const params = [fullName, email, hashedPassword];

//     db.run(sql, params, function (err) {
//       if (err) {
//         return res.status(400).json({ error: err.message });
//       }
//       res.status(201).json({ id: this.lastID });
//     });
//   } catch (error) {
//     console.error("error during registration:", error);
//     res.status9500.json({ error: "Internal server error" });
//   }
// });

module.exports = router;
