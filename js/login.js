document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent page refresh on form submission

    // Get values from input fields
    const emailValue = document.getElementById('email').value;
    const passwordValue = document.getElementById('password').value;

    // Send the data to the server
    fetch('http://localhost:8000/api/login', { // Update URL if needed
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: emailValue,
            password: passwordValue 
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Invalid email or password'); // Handle non-200 responses
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Redirect user to homepage
            window.location.href = '../index.html'; // Update the redirect URL as needed
        } else {
            alert('Error: Invalid email or password.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    });
});
