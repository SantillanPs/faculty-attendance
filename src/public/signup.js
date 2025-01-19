function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  errorElement.textContent = message;
  errorElement.style.display = "block";
}

function hideError(elementId) {
  const errorElement = document.getElementById(elementId);
  errorElement.style.display = "none";
}

document
  .getElementById("signupForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    // Get form values
    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Validate password match
    if (password.length < 8) {
      showError("passwordError", "Password must be at least 8 characters");
      return;
    } else {
      hideError("passwordError");
    }

    if (password !== confirmPassword) {
      showError("confirmPasswordError", "Passwords do not match!");
      return;
    } else {
      hideError("confirmPasswordError");
    }

    try {
      const response = await fetch("http://localhost:3000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fullName, email, password }),
      });

      if (response.ok) {
        alert("Registration successful!");
        window.location.href = "/"; // Redirect to the home page
      } else {
        const errorData = await response.json();
        alert("Error: " + errorData.error);
      }
    } catch (error) {
      console.error("Error: ", error); // Fix the syntax error
      alert("An error occurred. Please try again");
    }
  });
