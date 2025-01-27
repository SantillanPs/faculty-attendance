const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const db = require("./config/database");
const fs = require("fs");
const multer = require("multer");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));

app.set("views", path.join(__dirname, "/src/views"));
app.set("view engine", "ejs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "public/img/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const employeeRoutes = require("./src/routes/employees");
const leaveRequestRoutes = require("./src/routes/leaveRequests");
const attendanceRoutes = require("./src/routes/attendance");
const userRoutes = require("./src/routes/userRoutes");

// Serve uploaded files statically
app.use("/uploads", express.static("uploads"));
app.use("/api/employees", employeeRoutes);
app.use("/api/leave-requests", leaveRequestRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/", userRoutes);

// Endpoint to handle file uploads
app.post("/add-employee", upload.single("profilePicture"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  const {
    firstName,
    lastName,
    email,
    role,
    department,
    designation,
    dateOfJoining,
    employmentType,
  } = req.body;
  const profilePicture = req.file.filename;

  // Insert employee data into the database
  const query = `
INSERT INTO employees (first_name, last_name, email, role, department, designation, date_of_joining, employment_type, profile_picture)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

  const params = [
    firstName,
    lastName,
    email,
    role,
    department,
    designation,
    dateOfJoining,
    employmentType,
    profilePicture,
  ];

  db.run(query, params, function (err) {
    if (err) {
      console.error("Error inserting employee:", err);
      return res.status(500).json({ message: "Failed to add employee." });
    }
    res.json({
      message: "Employee added successfully!",
      employeeId: this.lastID,
    });
  });
  const filePath = req.file.path;
  res.json({
    message: "File uploaded successfully!",
    filePath: filePath,
  });
});

app.post("/insert", (req, res) => {
  const { employee_id, clock_in_time, clock_out_time, status, date } = req.body;
  const query =
    "INSERT INTO attendance (employee_id, clock_in_time, clock_out_time, status, date) VALUES (?, ?, ?, ?, ?)";
  db.run(
    query,
    [employee_id, clock_in_time, clock_out_time, status, date],
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      }
      res.json("successfully data inserted");
    }
  );
});

module.exports = app;
