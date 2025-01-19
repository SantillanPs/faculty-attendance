document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const clockButton = document.getElementById("clockButton");

  if (!token) {
    alert("You are not logged in. Redirecting to login page...");
    window.location.href = "/";
    return;
  }

  fetch("http://localhost:3000/", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch profile data");
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      document.getElementById("profileName").textContent = data.name;
      document.getElementById("profileEmail").textContent = data.email;

      const userId = data.id;

      clockButton.addEventListener("click", () => {
        const currentAction =
          clockButton.textContent === "Clock In" ? "clockIn" : "clockOut";
        handleClock(currentAction, userId);
      });
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Failed to fetch profile data. Please try again.");
      window.location.href = "/";
    });

  async function handleClock(action, userId) {
    const url =
      action === "clockIn"
        ? "http://localhost:3000/dashboard/clock-in"
        : "http://localhost:3000/dashboard/clock-out";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to perform clock action");
      }

      const result = await response.json();

      if (result.status === "On Duty") {
        clockButton.textContent = "Clock Out";
        clockButton.classList.remove("btn-primary");
        clockButton.classList.add("btn-warning");
      } else if (result.status === "Off Duty") {
        clockButton.textContent = "Clock In";
        clockButton.classList.remove("btn-warning");
        clockButton.classList.add("btn-primary");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to perform clock action. Please try again");
    }
  }
});
