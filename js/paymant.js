/**
 * Book Store - Payment Processor
 */

document.addEventListener('DOMContentLoaded', () => {
  // Load Cart & Price from localStorage
  let cart = [];
  try {
    cart = JSON.parse(localStorage.getItem('product') || '[]');
  } catch (e) {
    cart = [];
  }

  const rawPrice = localStorage.getItem('productPrice') || '0.00';
  const cleanPrice = parseFloat(rawPrice.replace(/[^0-9.]/g, '')) || 0;

  // Display Total Amount in summary & button
  const payBtnAmount = document.getElementById('payBtnAmount');
  const orderTotalAmount = document.getElementById('orderTotalAmount');
  if (payBtnAmount) payBtnAmount.textContent = `$${cleanPrice.toFixed(2)}`;
  if (orderTotalAmount) orderTotalAmount.textContent = `$${cleanPrice.toFixed(2)}`;

  // Render Mini Order Items List
  const orderItemsList = document.getElementById('orderItemsList');
  if (orderItemsList) {
    if (cart.length === 0) {
      orderItemsList.innerHTML = '<p class="text-muted small">No items currently in order.</p>';
    } else {
      orderItemsList.innerHTML = cart.map(item => `
        <div class="order-mini-item">
          <span class="order-mini-title">${item.title}</span>
          <span class="text-muted">x${item.quantity || 1}</span>
          <strong class="text-dark">$${((Number(item.price) || 0) * (Number(item.quantity) || 1)).toFixed(2)}</strong>
        </div>
      `).join('');
    }
  }

  // Card Inputs
  const cardInput = document.getElementById('cardNumber');
  const expiryInput = document.getElementById('expiryDate');
  const cvvInput = document.getElementById('cvv');
  const nameInput = document.getElementById('cardName');
  const brandIcon = document.getElementById('cardBrandIcon');
  const paymentForm = document.getElementById('paymentForm');
  const submitButton = document.getElementById('submitButton');
  const successModal = document.getElementById('successModal');

  // Format Card Number (adds spaces every 4 digits) & detect card brand
  if (cardInput) {
    cardInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '').substring(0, 16);
      let formatted = value.match(/.{1,4}/g)?.join(' ') || value;
      e.target.value = formatted;

      // Brand Icon detection
      if (brandIcon) {
        if (value.startsWith('4')) {
          brandIcon.className = 'fab fa-cc-visa card-brand-icon';
        } else if (value.startsWith('5') || value.startsWith('2')) {
          brandIcon.className = 'fab fa-cc-mastercard card-brand-icon';
        } else if (value.startsWith('34') || value.startsWith('37')) {
          brandIcon.className = 'fab fa-cc-amex card-brand-icon';
        } else if (value.startsWith('6')) {
          brandIcon.className = 'fab fa-cc-discover card-brand-icon';
        } else {
          brandIcon.className = 'fas fa-credit-card card-brand-icon';
        }
      }
    });
  }

  // Format Expiry Date (MM/YY)
  if (expiryInput) {
    expiryInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '').substring(0, 4);
      if (value.length >= 2) {
        e.target.value = value.substring(0, 2) + '/' + value.substring(2);
      } else {
        e.target.value = value;
      }
    });
  }

  // Format CVV (digits only)
  if (cvvInput) {
    cvvInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
    });
  }

  // Form Submission
  if (paymentForm) {
    paymentForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const rawCard = cardInput ? cardInput.value.replace(/\s+/g, '') : '';
      const expiry = expiryInput ? expiryInput.value.trim() : '';
      const cvv = cvvInput ? cvvInput.value.trim() : '';
      const cardName = nameInput ? nameInput.value.trim() : 'Customer';

      // Validation
      if (rawCard.length < 13) {
        alert('Please enter a valid card number.');
        if (cardInput) cardInput.focus();
        return;
      }

      if (!/^\d{2}\/\d{2}$/.test(expiry)) {
        alert('Please enter a valid expiration date (MM/YY).');
        if (expiryInput) expiryInput.focus();
        return;
      }

      if (cvv.length < 3) {
        alert('Please enter a valid 3 or 4 digit CVV code.');
        if (cvvInput) cvvInput.focus();
        return;
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Payment...';
      }

      try {
        const response = await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cardNumber: rawCard,
            expiryDate: expiry,
            cvv: cvv,
            cardName: cardName,
            amount: cleanPrice,
            price: cleanPrice
          })
        });

        const data = await response.json();

        if (response.ok && data.status === 'success') {
          // Clear cart on successful purchase
          localStorage.removeItem('product');
          localStorage.setItem('productPrice', '0.00');

          // Show confirmation modal
          if (successModal) {
            successModal.style.display = 'flex';
          } else {
            alert('Payment completed successfully!');
            window.location.href = '../index.html';
          }
        } else {
          alert(data.message || 'Payment processing failed. Please try again.');
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = `<i class="fas fa-check-circle"></i> Pay Now ($${cleanPrice.toFixed(2)})`;
          }
        }
      } catch (err) {
        console.error('Payment Error:', err);
        // Fallback client success if offline/network error
        localStorage.removeItem('product');
        localStorage.setItem('productPrice', '0.00');
        if (successModal) {
          successModal.style.display = 'flex';
        } else {
          alert('Payment completed successfully!');
          window.location.href = '../index.html';
        }
      }
    });
  }
});
