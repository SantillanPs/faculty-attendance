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
