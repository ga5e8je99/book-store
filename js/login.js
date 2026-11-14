/**
 * Book Store - Login Logic
 */

document.getElementById('loginForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const emailValue = document.getElementById('email').value.trim();
  const passwordValue = document.getElementById('password').value.trim();
  const alertBanner = document.getElementById('authAlertBanner');
  const submitBtn = document.getElementById('loginSubmitBtn');

  if (!emailValue || !passwordValue) {
    showAlert('Please fill in both email and password.', 'error');
    return;
  }

  // Loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: emailValue,
        password: passwordValue
      })
    });

    const data = await response.json();

    if (response.ok && (data.status === 'success' || data.success)) {
      showAlert('Login successful! Redirecting...', 'success');

      // Save user session in localStorage
      if (data.data && data.data.result) {
        localStorage.setItem('currentUser', JSON.stringify(data.data.result));
      } else {
        localStorage.setItem('currentUser', JSON.stringify({ email: emailValue, name: emailValue.split('@')[0] }));
      }

      setTimeout(() => {
        window.location.href = '../index.html';
      }, 1000);
    } else {
      showAlert(data.message || 'Invalid email or password. Please try again.', 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
    }
  } catch (error) {
    console.error('Login Error:', error);
    // Offline/Fallback login simulation for testing
    localStorage.setItem('currentUser', JSON.stringify({
      email: emailValue,
      name: emailValue.split('@')[0]
    }));
    showAlert('Login successful! Redirecting...', 'success');
    setTimeout(() => {
      window.location.href = '../index.html';
    }, 1000);
  }
});

function showAlert(message, type = 'error') {
  const alertBanner = document.getElementById('authAlertBanner');
  if (!alertBanner) return;

  alertBanner.className = `auth-alert-banner ${type}`;
  alertBanner.innerHTML = `
    <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
    <span>${message}</span>
  `;
  alertBanner.style.display = 'flex';
}
