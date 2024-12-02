document.addEventListener("DOMContentLoaded", () => {
  const clockButton = document.getElementById("clockButton");
  const id = "1"; // Replace with the actual user ID

  // Function to handle clocking in
  async function handleClock(action) {
    // Sets the endpoint URL based on action
    const url =
      action === "clockIn" ? "/dashboard/clock-in" : "/dashboard/clock-out";

    // Sends the AJAX request to the server
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }), // Sends faculty ID in the request body
    });

    // Processes the server response
    const result = await response.json();
    console.log(result.message); // Logs the server response message

    // Updates the button text based on the result status
    if (result.status === "On Duty") {
      clockButton.textContent = "Clock Out";
      clockButton.classList.remove("btn-primary");
      clockButton.classList.add("btn-warning");
    } else if (result.status === "Off Duty") {
      clockButton.textContent = "Clock In";
      clockButton.classList.remove("btn-warning");
      clockButton.classList.add("btn-primary");
    }
  }

  // Event listener for the button click
  clockButton.addEventListener("click", () => {
    // Determines whether to clock in or clock out
    const currentAction =
      clockButton.textContent === "Clock In" ? "clockIn" : "clockOut";
    // console.log(currentAction);
    handleClock(currentAction); // Calls handleClock function
  });
});

// const db = require("../db");

// const logAttendance = (facultyId) => {
//   const clockInTime = new Date().toLocaleTimeString();
//   const day = new Date().getDate();
//   const month = new Date().getMonth() + 1;
//   const year = new Date().getFullYear();
//   const date = `${day}/${month}/${year}`;
//   const status = "On Duty";

//   // Wrap the operations in db.serialize() to execute them sequentially
//   db.serialize(() => {
//     db.run(
//       `INSERT INTO attendance (faculty_id, clock_in_time, attendance_date) VALUES (?, ?, ?)`,
//       [facultyId, clockInTime, date],
//       function (err) {
//         if (err) {
//           console.error("Error inserting attendance:", err.message);
//         } else {
//           console.log(
//             `Attendance logged for faculty ID ${facultyId} at ${clockInTime} on ${date}. Status: ${status}`
//           );
//         }
//       }
//     );

//     db.run(
//       `UPDATE faculty SET status = ? WHERE id = ?`,
//       [status, facultyId],
//       function (err) {
//         if (err) {
//           console.error(`Error updating status for faculty ID ${facultyId}`);
//         } else {
//           console.log(`Status updated: ${status}`);
//         }
//       }
//     );
//   });
// };

// const logOutAttendance = (facultyId) => {
//   const clockOutTime = new Date().toLocaleTimeString();
//   const day = new Date().getDate();
//   const month = new Date().getMonth() + 1;
//   const year = new Date().getFullYear();
//   const date = `${day}/${month}/${year}`;
//   const status = "Off Duty";

//   // Use db.serialize() for sequential execution in logOutAttendance
//   db.serialize(() => {
//     db.run(
//       `UPDATE attendance SET clock_out_time = ? WHERE faculty_id = ? AND attendance_date = ?`,
//       [clockOutTime, facultyId, date],
//       function (err) {
//         if (err) {
//           console.error("Error updating attendance:", err.message);
//         } else {
//           console.log(
//             `Attendance updated for faculty ID ${facultyId} at ${clockOutTime}. Status: ${status}`
//           );
//         }
//       }
//     );

//     db.run(
//       `UPDATE faculty SET status = ? WHERE id = ? `,
//       [status, facultyId],
//       function (err) {
//         if (err) {
//           console.error(`Error updating status for faculty ID ${facultyId}`);
//         } else {
//           console.log(`Status updated: ${status}`);
//         }
//       }
//     );
//   });
// };

// const getFacultyStatus = async (id) => {
//   return new Promise((resolve, reject) => {
//     db.get(`SELECT status FROM faculty WHERE id = ?`, [id], (err, row) => {
//       if (err) {
//         reject(err);
//       } else if (row) {
//         resolve(row.status);
//       } else {
//         resolve(null);
//       }
//     });
//   });
// };

// const clockInClockOut = async () => {
//   try {
//     const status = await clockInClockOut("1");
//     if (status) {
//       console.log("Faculty Status:", status);
//       if (status === "Off Duty") {
//       }
//     } else {
//       console.log("Faculty not found.");
//     }
//   } catch (error) {
//     console.error("Error:", error.message);
//   }
// };
// document.addEventListener("DOMContentLoaded", () => {
//   const clockButton = document.getElementById("clockButton");

//   function changeButtonClass() {
//     clockButton.classList.remove("btn-primary");
//     clockButton.classList.add("btn-warning");
//   }

//   clockButton.addEventListener("click", changeButtonClass);
// });

// OLD UP | NEW DOWN
