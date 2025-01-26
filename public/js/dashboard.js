// Attendance Records Data
const attendanceData = [
  { name: "John Doe", status: "Present", time: "08:15 AM" },
  { name: "Jane Smith", status: "Late", time: "08:45 AM" },
  { name: "Alice Johnson", status: "Absent", time: "--" },
  { name: "Bob Brown", status: "Present", time: "08:10 AM" },
  { name: "Charlie Davis", status: "Present", time: "08:05 AM" },
  { name: "Eve Wilson", status: "Present", time: "08:20 AM" },
  { name: "Frank Moore", status: "Late", time: "08:50 AM" },
];

// Calendar Attendance Data
const calendarAttendanceData = {
  "2025-01-01": "present",
  "2025-01-02": "present",
  "2025-01-03": "present",
  "2025-01-06": "present",
  "2025-01-07": "absent",
  "2025-01-08": "present",
  "2025-01-09": "present",
  "2025-01-10": "leave",
  "2025-01-13": "leave",
  "2025-01-14": "present",
  "2025-01-15": "present",
  "2025-01-16": "present",
};

// Clock In Button
document.getElementById("clockInBtn").addEventListener("click", () => {
  const currentTime = new Date().toLocaleTimeString();
  alert(`Clocked in at ${currentTime}`);
});

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
  for (let year = currentYear - 5; year <= currentYear + 5; year++) {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  }
  yearSelect.value = currentYear; // Set default to current year
}

// Render Calendar
function renderCalendar() {
  const calendarDays = document.getElementById("calendarDays");
  if (!calendarDays) {
    console.error("calendarDays element not found!");
    return;
  }
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

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(
      Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), day)
    );
    const dateString = date.toISOString().split("T")[0]; // Use UTC date
    const status = calendarAttendanceData[dateString] || "future";

    const dayCell = document.createElement("div");
    dayCell.classList.add(
      "text-center",
      "p-2",
      "rounded",
      "cursor-pointer",
      "hover:bg-gray-100"
    );

    // Color coding based on status
    switch (status) {
      case "present":
        dayCell.classList.add("bg-green-100", "text-green-800");
        break;
      case "absent":
        dayCell.classList.add("bg-red-100", "text-red-800");
        break;
      case "leave":
        dayCell.classList.add("bg-blue-100", "text-blue-800");
        break;
      default:
        dayCell.classList.add("bg-gray-100", "text-gray-400");
    }

    dayCell.textContent = day;
    calendarDays.appendChild(dayCell);
  }
}

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
