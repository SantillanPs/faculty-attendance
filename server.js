const express = require("express");
const path = require("path");
const db = require("./database");
const bcrypt = require("bcrypt");
const session = require("express-session");
const app = express();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "/src/views"));
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (request, response) => {
  response.render("index", { error: null });
});

app.post("/auth/login", (request, response) => {
  const { email, password } = request.body;

  db.get(`SELECT * FROM faculty WHERE email = ?`, [email], (err, user) => {
    if (err) {
      return response
        .status(500)
        .render("index", { error: "Internal server error." });
    }

    if (!user) {
      document.getElementById("errorMessage").innerHTML =
        "Invalid email or Password";
    }

    const passwordMatch = bcrypt.compareSync(password, user.password);
    if (!passwordMatch) {
      document.getElementById("errorMessage").innerHTML =
        "Invalid email or Password";
    }

    request.session.userId = user.id;
    response.redirect("/dashboard");
  });
});

app.get("/dashboard", (request, response) => {
  response.render("dashboard");
});

app.get("/admin-dashboard", (request, response) => {
  response.render("administrator");
});

app.use((request, response) => {
  response.status(404).render("404");
});

app.post("/dashboard/clock-in", (request, response) => {
  const { id } = request.body;
  const clockInTime = new Date().toLocaleTimeString();
  const date = new Date().toLocaleDateString();
  const status = "On Duty";

  db.run(
    `INSERT INTO attendance (faculty_id, clock_in_time, attendance_date) VALUES (?, ?, ?)`,
    [id, clockInTime, date],
    (err) => {
      if (err) return response.status(500).json({ error: err.message });
      db.run(
        `UPDATE faculty SET status = ? WHERE id = ?`,
        [status, id],
        (err) => {
          if (err) return response.status(500).json({ error: err.message });
          response.json({ message: "Clocked in successfully", status });
        }
      );
    }
  );
});

app.post("/dashboard/clock-out", (request, response) => {
  const { id } = request.body;
  const clockOutTime = new Date().toLocaleTimeString();
  const date = new Date().toLocaleDateString();
  const status = "Off Duty";

  db.run(
    `UPDATE attendance SET clock_out_time = ? WHERE faculty_id = ? AND attendance_date = ?`,
    [clockOutTime, id, date],
    (err) => {
      if (err) return response.status(500).json({ error: err.message });
      db.run(
        `UPDATE faculty SET status = ? WHERE id = ?`,
        [status, id],
        (err) => {
          if (err) return response.status(500).json({ error: err.message });
          response.json({ message: "Clocked out successfully", status });
        }
      );
    }
  );
});

// const mockUsers = [
//   { id: 1, username: "sebastian", displayName: "sebastian" },
//   { id: 2, username: "sebastian2", displayName: "sebastian2" },
//   { id: 3, username: "sebastian3", displayName: "sebastian3" },
// ];

// app.get("/", (request, response) => {
//   response.status(201).send({ msg: "hello world!" });
// });

// app.get("/api/users", (request, response) => {
//   response.send(mockUsers);
// });

// app.get("/api/users/:id", (request, response) => {
//   console.log(request.params);
//   const parsedId = parseInt(request.params.id);
//   if (isNaN(parsedId)) return response.status(400).send({ msg: "bad request" });

//   const findUser = mockUsers.find((user) => user.id === parsedId);
//   if (!findUser) return response.sendStatus(404);
//   return response.send(findUser);
// });

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
