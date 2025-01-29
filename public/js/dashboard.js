async function fetchClockStatus(userId) {
  try {
    const response = await fetch(`/api/attendance/${userId}/status`);
    console.log(response);
    if (response.ok) {
      const data = await response.json();
      return data.is_logged_in; // Return the status from the database
    } else {
      console.error("Failed to fetch clock status.");
      return false; // Default to false if the request fails
    }
  } catch (error) {
    console.error("Error fetching clock status:", error);
    return false; // Default to false if an error occurs
  }
}

// Function to update the clock-in status indicator
function updateClockStatus(isClockedIn) {
  const profilePhoto = document.getElementById("profilePhoto");
  const clockInBtn = document.getElementById("clockInBtn");
  const clockOutBtn = document.getElementById("clockOutBtn");

  if (!profilePhoto) {
    console.error("Error: #profilePhoto element not found!");
    return;
  }

  // Update the class based on the clock-in status
  if (isClockedIn) {
    clockInBtn.classList.add("hidden");
    clockInBtn.classList.remove("block");

    clockOutBtn.classList.add("block");
    clockOutBtn.classList.remove("hidden");

    profilePhoto.classList.add("clocked-in");
  } else {
    profilePhoto.classList.remove("clocked-in");

    clockOutBtn.classList.remove("block");
    clockOutBtn.classList.add("hidden");

    clockInBtn.classList.add("block");
    clockInBtn.classList.remove("hidden");
  }
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

async function changeUser() {
  const userSelect = document.getElementById("userSelect");
  const selectedUserId = userSelect.value;

  // Fetch selected user details
  try {
    const userResponse = await fetch(`/api/employees/${selectedUserId}`);
    const user = await userResponse.json();
    updateUserDetails(user);

    // Fetch and update the clock status
    const isClockedIn = await fetchClockStatus(selectedUserId);
    updateClockStatus(isClockedIn);

    // Re-render the calendar for the selected user
    renderCalendar(selectedUserId);
  } catch (error) {
    console.error("Error fetching user details:", error);
  }
}

// Clock In
document.getElementById("clockInBtn").addEventListener("click", async () => {
  const userSelect = document.getElementById("userSelect");
  const selectedUserId = userSelect.value;

  const currentTime = new Date().toLocaleTimeString();
  const currentDate = new Date().toLocaleDateString("en-CA");

  try {
    const response = await fetch("/api/attendance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        employeeId: selectedUserId,
        clockInTime: currentTime,
        status: "Present",
        date: currentDate,
        is_logged_in: true, // Set is_logged_in to true in the database
      }),
    });

    if (response.ok) {
      const isClockedIn = await fetchClockStatus(selectedUserId); // Fetch the updated status
      updateClockStatus(isClockedIn); // Update the UI
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
  const userSelect = document.getElementById("userSelect");
  const selectedUserId = userSelect.value;

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
          is_logged_in: false, // Set is_logged_in to false in the database
        }),
      }
    );

    if (response.ok) {
      const isClockedIn = await fetchClockStatus(selectedUserId); // Fetch the updated status
      updateClockStatus(isClockedIn); // Update the UI
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

async function initializeDashboard() {
  const defaultUserId = 1; // Default user ID
  const isClockedIn = await fetchClockStatus(defaultUserId);
  updateClockStatus(isClockedIn);
  fetchUsers();
  populateYearDropdown();
}

// Call the initialization function when the page loads
initializeDashboard();
