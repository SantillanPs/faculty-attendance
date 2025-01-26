const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const db = require("./config/database");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));

app.set("views", path.join(__dirname, "/src/views"));
app.set("view engine", "ejs");

const employeeRoutes = require("./src/routes/employees");
const leaveRequestRoutes = require("./src/routes/leaveRequests");

app.use("/api/employees", employeeRoutes);
app.use("/api/leave-request", leaveRequestRoutes);

//GET
app.get("/", (req, res) => {
  res.render("landingpage", { error: null });
});

module.exports = app;
