function toggleLeaveRequests() {
  const container = document.getElementById("leaveRequestsContainer");
  const arrow = document.querySelector(".dropdown-arrow");

  if (container.classList.contains("max-h-0")) {
    container.classList.remove("max-h-0");
    container.classList.add("max-h-64");
    arrow.classList.add("active");
  } else {
    container.classList.remove("max-h-64");
    container.classList.add("max-h-0");
    arrow.classList.remove("active");
  }
}

// Prevent search input from triggering dropdown
document.getElementById("leaveSearch").addEventListener("click", function (e) {
  e.stopPropagation();
});

async function fetchEmployees() {
  try {
    const response = await fetch("/api/employees"); // Replace with your actual API endpoint
    if (!response.ok) {
      throw new Error("Failed to fetch employees");
    }
    const employees = await response.json();
    return employees;
  } catch (error) {
    console.error("Error fetching employees:", error);
    return [];
  }
}

async function renderEmployeeDirectory(employees = null) {
  const data = employees || (await fetchEmployees());
  const tableBody = document.querySelector("#employeeDirectory tbody");

  // Clear existing rows
  tableBody.innerHTML = "";

  // Add rows for each employee
  data.forEach((employees) => {
    const row = document.createElement("tr");
    row.classList.add("border-b");

    row.innerHTML = `
      <td class="py-3 px-4">${employees.first_name} ${employees.last_name}</td>
      <td class="py-3 px-4">${employees.role}</td>
      <td class="py-3 px-4">${employees.department}</td>
      <td class="py-3 px-4">${employees.email}</td>
    `;

    tableBody.appendChild(row);
  });
}
async function fetchLeaveRequests() {
  try {
    const response = await fetch("/api/leave-requests"); // Replace with your actual API endpoint
    if (!response.ok) {
      throw new Error("Failed to fetch leave requests");
    }
    const leaveRequests = await response.json();
    return leaveRequests;
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    return [];
  }
}

// Function to render leave requests
async function renderLeaveRequests(filteredRequests = null) {
  const leaveRequests = await fetchLeaveRequests();
  console.log(leaveRequests);
  const container = document.getElementById("leaveRequestsContainer");
  container.innerHTML = "";

  // Filter leave requests to include only those with status "pending"
  const pendingRequests = filteredRequests
    ? filteredRequests.filter((request) => request.status === "Pending")
    : leaveRequests.filter((request) => request.status === "Pending");

  // Render only pending leave requests
  pendingRequests.forEach((request) => {
    const requestElement = document.createElement("div");
    requestElement.classList.add("leave-request-card", "p-4");

    requestElement.innerHTML = `
      <div class="flex flex-col md:flex-row justify-between items-start bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
  <!-- Employee Details Section -->
  <div class="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-4 flex-1">
    <!-- Profile Picture -->
    <img
      src="/img/${request.employee.profile_picture}"
      alt="${request.employee.first_name} ${request.employee.last_name}"
      class="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
    />
    <!-- Employee Information -->
    <div class="flex-1">
      <h3 class="font-semibold text-xl text-gray-800 mb-1">
        ${request.employee.first_name} ${request.employee.last_name}
      </h3>
      <p class="text-sm text-gray-600 mb-4">
        <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          ${request.type}
        </span>
        <span class="ml-2">${request.duration}</span>
      </p>
      <!-- Reason Section -->
      <div class="bg-gray-50 p-4 rounded-lg mb-4">
        <p class="text-gray-700 font-medium mb-1">Reason:</p>
        <p class="text-gray-600">${request.reason}</p>
      </div>
      <!-- Date Range -->
      <p class="text-sm text-gray-500">
        <span class="font-medium">From:</span> <b>${request.start_date}</b> |
        <span class="font-medium">To:</span> <b>${request.end_date}</b>
      </p>
    </div>
  </div>

  <!-- Action Buttons Section -->
  <div class="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-2 mt-4 md:mt-0 ml-0 md:ml-4">
    <!-- Approve Button -->
    <button
      onclick="approveLeave(${request.id})"
      class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center justify-center"
    >
      <i class="fas fa-check-circle mr-2"></i>
      Approve
    </button>
    <!-- Reject Button -->
    <button
      onclick="rejectLeave(${request.id})"
      class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center justify-center"
    >
      <i class="fas fa-times-circle mr-2"></i>
      Reject
    </button>
  </div>
</div>
    `;

    container.appendChild(requestElement);
  });
}

// Functions to handle leave approval/rejection
async function approveLeave(id) {
  try {
    const response = await fetch(`/api/leave-requests/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "approved" }), // Update status to "approved"
    });
    if (response.ok) {
      renderLeaveRequests(); // Re-render the leave requests to reflect changes
    } else {
      alert("Failed to approve leave request");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred. Please try again");
  }
}

async function rejectLeave(id) {
  try {
    const response = await fetch(`/api/leave-requests/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "rejected" }), // Update status to "rejected"
    });
    if (response.ok) {
      renderLeaveRequests(); // Re-render the leave requests to reflect changes
    } else {
      alert("Failed to reject leave request.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred. Please try again.");
  }
}

document
  .querySelector("#employeeDirectory")
  .addEventListener("input", async (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const employees = await fetchEmployees();

    // Filter employees based on the search term
    const filteredEmployees = employees.filter(
      (employees) =>
        employees.first_name.toLowerCase().includes(searchTerm) ||
        employees.last_name.toLowerCase().includes(searchTerm) ||
        employees.role.toLowerCase().includes(searchTerm) ||
        employees.department.toLowerCase().includes(searchTerm) ||
        employees.email.toLowerCase().includes(searchTerm)
    );

    // Re-render the table with filtered results
    renderEmployeeDirectory(filteredEmployees);
  });

document
  .querySelector("#leaveRequestsContainer")
  .addEventListener("input", async (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const leaveRequests = await fetchLeaveRequests();

    // Filter leave requests based on the search term
    const filteredRequests = leaveRequests.filter((request) =>
      `${request.employees.first_name} ${request.employees.last_name}`
        .toLowerCase()
        .includes(searchTerm)
    );

    // Re-render the leave requests with filtered results
    renderLeaveRequests(filteredRequests);
  });

document.querySelector("#leaveSearch").addEventListener("input", async (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const leaveRequests = await fetchLeaveRequests();

  // Filter leave requests based on the employee's full name and status "pending"
  const filteredRequests = leaveRequests.filter(
    (request) =>
      `${request.employee.first_name} ${request.employee.last_name}`
        .toLowerCase()
        .includes(searchTerm) && request.status === "pending"
  );

  // Re-render the leave requests with filtered results
  renderLeaveRequests(filteredRequests);
});

document.addEventListener("DOMContentLoaded", () => {
  renderEmployeeDirectory();
  renderLeaveRequests(); // Render leave requests on page load
});
