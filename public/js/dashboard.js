// Fetch users and populate the dropdown
async function fetchUsers() {
  try {
    const response = await fetch("/api/employees"); // Update with your actual API endpoint
    const users = await response.json();
    const userSelect = document.getElementById("userSelect");

    users.forEach((user) => {
      const option = document.createElement("option");
      const fullName = user.first_name + " " + user.last_name;
      option.value = user.id; // Assume each user has a unique ID
      option.textContent = fullName; // Display user name in the dropdown
      userSelect.appendChild(option);
    });

    // Set default user (employee ID 1)
    const defaultUser = users.find((user) => user.id === 1); // Find the user with ID 1
    if (defaultUser) {
      updateUserDetails(defaultUser);
      renderCalendar(1); // Render the calendar for employee ID 1
    } else if (users.length > 0) {
      // Fallback to the first user if ID 1 is not found
      updateUserDetails(users[0]);
      renderCalendar(users[0].id);
    }
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

function changeUser() {
  const userSelect = document.getElementById("userSelect");
  const selectedUserId = userSelect.value;

  // Fetch selected user details
  fetch(`/api/employees/${selectedUserId}`) // Replace with your actual API endpoint
    .then((response) => response.json())
    .then((user) => {
      updateUserDetails(user);
      // Re-render the calendar for the selected user
      renderCalendar(selectedUserId); // Pass the selected user ID
    })
    .catch((error) => {
      console.error("Error fetching user details:", error);
    });
}

// Update user-related information on the page
function updateUserDetails(user) {
  const first_name = user.first_name;
  const last_name = user.last_name;

  const photo = document.getElementById("profilePhoto");
  const photoUrl = user.profile_picture;
  photo.src = `/img/${photoUrl}`;
  document.getElementById(
    "profileName"
  ).textContent = `${first_name} ${last_name}`;
  document.getElementById("designation").textContent = user.designation;

  // You can also update attendance, leave request, etc., based on the selected user
}

// Track the clock-in status
let isClockedIn = false;

// Function to update the clock-in status indicator
function updateClockStatus() {
  const clockStatus = document.getElementById("clockStatus");
  if (isClockedIn) {
    clockStatus.classList.remove("clocked-out");
    clockStatus.classList.add("clocked-in");
  } else {
    clockStatus.classList.remove("clocked-in");
    clockStatus.classList.add("clocked-out");
  }
}

// Clock In
document.getElementById("clockInBtn").addEventListener("click", async () => {
  isClockedIn = true;
  updateClockStatus();
  alert("You have clocked in.");

  const userSelect = document.getElementById("userSelect");
  const selectedUserId = userSelect.value; // Get the selected user ID

  const currentTime = new Date().toLocaleTimeString(); // Local time
  const currentDate = new Date().toLocaleDateString("en-CA"); // Local date in YYYY-MM-DD format

  try {
    const response = await fetch("/api/attendance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        employeeId: selectedUserId, // Use the selected user ID
        clockInTime: currentTime,
        status: "Present",
        date: currentDate, // Use local date
      }),
    });

    if (response.ok) {
      // console.log(`Clocked in at ${currentTime}`);
      // Reload the calendar after successful clock-in
      renderCalendar(selectedUserId); // Pass the selected user ID
    } else {
      alert("Failed to clock in. Please try again.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred. Please try again.");
  }
});
// Clock Out
document.getElementById("clockOutBtn").addEventListener("click", async () => {
  isClockedIn = false;
  updateClockStatus();
  alert("You have clocked out.");

  const userSelect = document.getElementById("userSelect");
  const selectedUserId = userSelect.value; // Get the selected user ID

  const currentTime = new Date().toLocaleTimeString();

  try {
    const response = await fetch(
      `/api/attendance/${selectedUserId}/clock-out`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clockOutTime: currentTime,
        }),
      }
    );

    if (response.ok) {
      console.log(`Clocked out at ${currentTime}`);
    } else {
      alert("Failed to clock out. Please try again.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred. Please try again.");
  }
});

async function fetchAttendanceData(userId) {
  try {
    const response = await fetch(`/api/attendance/userId=${userId}`); // Filter by user ID
    const data = await response.json();
    // console.log("Attendance data for user:", userId, data);
    const attendanceMap = {};
    data.forEach((record) => {
      attendanceMap[record.date] = record.status;
    });
    return attendanceMap;
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    return {};
  }
}
async function renderCalendar(userId) {
  const calendarDays = document.getElementById("calendarDays");
  if (!calendarDays) {
    console.error("calendarDays element not found!");
    return;
  }

  // Clear the calendar before re-rendering
  calendarDays.innerHTML = "";

  const firstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const lastDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay(); // 0 (Sunday) to 6 (Saturday)

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDay; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.classList.add("text-center", "text-gray-400");
    calendarDays.appendChild(emptyCell);
  }

  // Fetch attendance data for the selected user
  const attendanceData = await fetchAttendanceData(userId);
  const today = new Date(); // Get today's date

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(
      Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), day)
    );
    const dateString = date.toISOString().split("T")[0]; // Use UTC date
    const status = attendanceData[dateString] || "future";

    const dayCell = document.createElement("div");
    dayCell.classList.add("text-center", "p-2", "rounded", "cursor-pointer");

    // Color coding based on status
    switch (status) {
      case "Present":
        dayCell.classList.add("bg-green-100", "text-green-800");
        break;
      case "Late":
        dayCell.classList.add("bg-yellow-100", "text-yellow-800");
        break;
      case "Absent":
        dayCell.classList.add("bg-red-100", "text-red-800");
        break;
      case "Leave":
        dayCell.classList.add("bg-blue-100", "text-blue-800");
        break;
      default:
        dayCell.classList.add("bg-gray-100", "text-gray-400");
    }

    // Highlight today's date
    if (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    ) {
      dayCell.classList.add(
        "border-2",
        "border-blue-400",
        "text-blue-900",
        "font-bold"
      );
    }

    dayCell.textContent = day;
    calendarDays.appendChild(dayCell);
  }
}

// Update Time
function updateTime() {
  const timeDisplay = document.getElementById("currentTime");
  timeDisplay.textContent = new Date().toLocaleTimeString();
}
setInterval(updateTime, 1000);

// Calendar Logic
let currentDate = new Date();
const monthSelect = document.getElementById("monthSelect");
const yearSelect = document.getElementById("yearSelect");

// Populate Year Dropdown
function populateYearDropdown() {
  const currentYear = currentDate.getFullYear();
  for (let year = currentYear - 5; year <= currentYear; year++) {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  }
  yearSelect.value = currentYear; // Set default to current year
}

// Toggle Leave Request Form Visibility
function toggleLeaveRequest() {
  const formContainer = document.getElementById("leaveRequestFormContainer");
  const icon = document.getElementById("leaveRequestIcon");
  formContainer.classList.toggle("hidden");
  icon.classList.toggle("fa-chevron-down");
  icon.classList.toggle("fa-chevron-up");
}

// Submit Leave Request
document
  .querySelector("#leaveRequestFormContainer form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get the selected user's ID from the dropdown
    const userSelect = document.getElementById("userSelect");
    const selectedUserId = userSelect.value;

    // Collect form data
    const formData = new FormData(e.target);
    const leaveRequest = {
      employeeId: selectedUserId, // Use the selected user's ID
      type: formData.get("leaveType"),
      duration: formData.get("duration"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      reason: formData.get("reason"),
    };

    try {
      // Submit the leave request to the API
      const response = await fetch("/api/leave-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(leaveRequest),
      });

      if (response.ok) {
        alert("Leave request submitted successfully!");
        e.target.reset(); // Clear the form
        toggleLeaveRequest(); // Hide the form
      } else {
        alert("Failed to submit leave request. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  });

// Update calendar when month or year changes
function updateCalendar() {
  const selectedMonth = parseInt(monthSelect.value);
  const selectedYear = parseInt(yearSelect.value);
  currentDate = new Date(selectedYear, selectedMonth); // Update currentDate
  renderCalendar(); // Re-render the calendar
}

// Event Listeners
monthSelect.addEventListener("change", updateCalendar);
yearSelect.addEventListener("change", updateCalendar);

fetchUsers();
populateYearDropdown();
updateClockStatus();
