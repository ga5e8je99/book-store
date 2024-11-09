// Parse and display product details from localStorage
const product = JSON.parse(localStorage.getItem("product")) || []; // Handles case if product is not set
product.forEach(item => console.log(item.title));

// Display product price from localStorage
document.getElementById("priceItems").innerHTML = `: $${localStorage.getItem("productPrice") || '0.00'}`;

document.getElementById("cardNumber").addEventListener("input", function() {
    const cardNumber = this.value;
    const amexIcon = document.querySelector(".fa-cc-amex");
    const mastercardIcon = document.querySelector(".fa-cc-mastercard");
    const discoverIcon = document.querySelector(".fa-cc-discover");

    // Hide all icons by default
    amexIcon.style.display = "none";
    mastercardIcon.style.display = "none";
    discoverIcon.style.display = "none";

    // Show icon based on the card number prefix
    if (cardNumber.startsWith("5") || cardNumber.startsWith("2")) {
        mastercardIcon.style.display = "inline-block";
    } else if (cardNumber.startsWith("34") || cardNumber.startsWith("37")) {
        amexIcon.style.display = "inline-block";
    } else if (cardNumber.startsWith("6")) {
        discoverIcon.style.display = "inline-block";
    }
});

const cardNumberPattern = /^[0-9]{13,19}$/;
const expiryDatePattern = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
const cvvPattern = /^[0-9]{3,4}$/;
const cardNamePattern = /^[a-zA-Z\s]+$/;

function validateInput(inputElement, pattern) {
    inputElement.style.borderColor = pattern.test(inputElement.value) ? "rgb(173, 144, 102)" : "red";
}

function validateForm() {
    const cardNumber = document.getElementById("cardNumber");
    const cvv = document.getElementById("cvv");
    const cardName = document.getElementById("cardName");

    const isFormValid = 
        cardNumberPattern.test(cardNumber.value) &&                        
        cvvPattern.test(cvv.value) &&
        cardNamePattern.test(cardName.value);

    document.getElementById("submitButton").disabled = !isFormValid;
}

// Event listeners for validation
document.getElementById("cardNumber").addEventListener("input", function() {
    validateInput(this, cardNumberPattern);
    validateForm();
});

document.getElementById("cvv").addEventListener("input", function() {
    validateInput(this, cvvPattern);
    validateForm();
});

document.getElementById("cardName").addEventListener("input", function() {
    validateInput(this, cardNamePattern);
    validateForm();
});

document.getElementById("expiryDate").addEventListener("input", function(event) {
    const input = event.target;
    let value = input.value;

    value = value.replace(/[^\d\/]/g, ""); // Allow only digits and "/"

    // Automatically add "/" after the month
    if (value.length === 2 && !value.includes("/")) {
        input.value = value + "/";
    } else {
        input.value = value;
    }

    const errorMsg = document.getElementById("error-msg");
    const [month, year] = input.value.split("/");

    // Validate month and year
    if (
        (month && (parseInt(month) < 1 || parseInt(month) > 12)) ||  // Invalid month
        (year && (parseInt(year) < 25 || parseInt(year) > 30))       // Invalid year (example range 2025 - 2030)
    ) {
        errorMsg.style.display = "block";
        input.style.borderColor = "red"; 
    } else {
        errorMsg.style.display = "none";
        input.style.borderColor = "rgb(173, 144, 102)"; 
    }
});
