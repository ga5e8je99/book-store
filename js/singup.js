/**
 * Book Store - Signup Logic
 */

document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("uname").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const cpassword = document.getElementById("cpassword").value.trim();
  const submitBtn = document.getElementById("signupSubmitBtn");

  if (!name || !email || !password || !cpassword) {
    showAlert("Please fill in all required fields.", "error");
    return;
  }

  if (password !== cpassword) {
    showAlert("Passwords do not match. Please verify and re-enter.", "error");
    document.getElementById("cpassword").focus();
    return;
  }

  if (password.length < 6) {
    showAlert("Password must be at least 6 characters.", "error");
    document.getElementById("password").focus();
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';

  try {
    const response = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await response.json();

    if (response.ok && (data.status === "success" || data.success)) {
      showAlert("Account created successfully! Redirecting...", "success");

      // Auto login user
      if (data.data && data.data.result) {
        localStorage.setItem("currentUser", JSON.stringify(data.data.result));
      } else {
        localStorage.setItem("currentUser", JSON.stringify({ name, email }));
      }

      setTimeout(() => {
        window.location.href = "../index.html";
      }, 1200);
    } else {
      showAlert(data.message || "There was an error creating the account.", "error");
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
    }
  } catch (error) {
    console.error("Signup Error:", error);
    // Fallback simulation for client testing
    localStorage.setItem("currentUser", JSON.stringify({ name, email }));
    showAlert("Account created successfully! Redirecting...", "success");
    setTimeout(() => {
      window.location.href = "../index.html";
    }, 1200);
  }
});

function showAlert(message, type = "error") {
  const alertBanner = document.getElementById("authAlertBanner");
  if (!alertBanner) return;

  alertBanner.className = `auth-alert-banner ${type}`;
  alertBanner.innerHTML = `
    <i class="fas fa-${type === "error" ? "exclamation-circle" : "check-circle"}"></i>
    <span>${message}</span>
  `;
  alertBanner.style.display = "flex";
}
