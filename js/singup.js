document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const name = document.getElementById("uname").value;

  try {
      const response = await fetch("http://localhost:8000/api/signup", {  // Make sure endpoint matches your backend
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) { // Handles any status that isn't 2xx
          alert(data.message || "There was an error creating the account.");
      } else {
          alert("The account has been created successfully!");
          window.location.href = "/login.html"; // Redirect to login page after successful sign-up
      }
  } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again later.");
  }
});
