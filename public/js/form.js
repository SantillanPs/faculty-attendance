// Handle profile picture upload and preview
const profilePictureInput = document.getElementById("profilePicture");
const profilePicturePreview = document.getElementById("profilePicturePreview");

profilePictureInput.addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      profilePicturePreview.src = e.target.result;
      profilePicturePreview.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
  }
});

// Handle form submission
document
  .getElementById("addEmployeeForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(e.target);

    try {
      // Send the form data (including the file) to the backend
      const response = await fetch("/add-employee", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to add employee.");
      }

      // alert("Employee added successfully!");
      e.target.reset();
      profilePicturePreview.src = "#";
      profilePicturePreview.classList.add("hidden");
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to add employee. Please try again.");
    }
  });
