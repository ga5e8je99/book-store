/**
 * Book Store - Shopping Cart Manager
 */

let cart = [];
let discountRate = 0; // e.g. 0.20 for 20%
let discountFixed = 0;

function loadCart() {
  try {
    const raw = localStorage.getItem('product');
    cart = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(cart)) cart = [];
  } catch (e) {
    cart = [];
  }
}

function saveCart() {
  localStorage.setItem('product', JSON.stringify(cart));
}

function renderCart() {
  loadCart();

  const container = document.getElementById('cartItemsList');
  const headerCount = document.getElementById('cartHeaderCount');
  const summarySubtotal = document.getElementById('summarySubtotal');
  const summaryTotal = document.getElementById('summaryTotal');
  const shippingSelect = document.getElementById('shippingOption');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const summaryCol = document.getElementById('cartSummaryColumn');

  if (!container) return;

  const totalItemsCount = cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  if (headerCount) {
    headerCount.textContent = `${totalItemsCount} ${totalItemsCount === 1 ? 'Item' : 'Items'}`;
  }

  // Handle Empty Cart
  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart-state">
        <div class="empty-cart-icon"><i class="fas fa-shopping-basket"></i></div>
        <h4>Your Shopping Cart is Empty</h4>
        <p>Looks like you haven't added any books to your cart yet. Explore our bestsellers and novels!</p>
        <a href="../index.html" class="btn-checkout" style="max-width: 240px; margin: 0 auto; text-decoration: none;">
          <i class="fas fa-book-open"></i> Browse Books
        </a>
      </div>
    `;

    if (summarySubtotal) summarySubtotal.textContent = '$0.00';
    if (summaryTotal) summaryTotal.textContent = '$0.00';
    if (checkoutBtn) checkoutBtn.disabled = true;
    localStorage.setItem('productPrice', '0.00');
    return;
  }

  if (checkoutBtn) checkoutBtn.disabled = false;

  // Render populated cart items
  let subtotal = 0;

  container.innerHTML = cart.map((item, index) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 1;
    const itemTotal = price * qty;
    subtotal += itemTotal;

    // Handle relative vs absolute image paths
    let imgSrc = item.image || '';
    if (imgSrc.startsWith('image/')) {
      imgSrc = '../' + imgSrc;
    }

    return `
      <div class="cart-item-row">
        <img src="${imgSrc}" class="cart-item-img" alt="${item.title}">
        <div class="cart-item-details">
          <h6>${item.title}</h6>
          <span class="cart-item-category">${item.type || 'Book'}</span>
        </div>
        <div class="cart-qty-ctrl">
          <button type="button" onclick="changeQuantity(${index}, -1)" title="Decrease">-</button>
          <span>${qty}</span>
          <button type="button" onclick="changeQuantity(${index}, 1)" title="Increase">+</button>
        </div>
        <div class="cart-item-price">$${itemTotal.toFixed(2)}</div>
        <button class="cart-item-remove-btn" onclick="removeItem(${index})" title="Remove item">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    `;
  }).join('');

  // Calculate Shipping
  let shippingCost = Number(shippingSelect ? shippingSelect.value : 5);
  // Auto free shipping over $50 if standard selected
  if (subtotal >= 50 && shippingCost === 5) {
    shippingCost = 0;
    if (shippingSelect) shippingSelect.value = '0';
  }

  // Calculate Discount
  let discountAmount = 0;
  if (discountRate > 0) {
    discountAmount = subtotal * discountRate;
  } else if (discountFixed > 0) {
    discountAmount = Math.min(discountFixed, subtotal);
  }

  const discountRow = document.getElementById('discountRow');
  const discountAmountEl = document.getElementById('discountAmount');
  if (discountAmount > 0) {
    if (discountRow) discountRow.style.display = 'flex';
    if (discountAmountEl) discountAmountEl.textContent = `-$${discountAmount.toFixed(2)}`;
  } else {
    if (discountRow) discountRow.style.display = 'none';
  }

  const finalTotal = Math.max(0, subtotal - discountAmount + shippingCost);

  if (summarySubtotal) summarySubtotal.textContent = `$${subtotal.toFixed(2)}`;
  if (summaryTotal) summaryTotal.textContent = `$${finalTotal.toFixed(2)}`;

  // Store final order total for payment page
  localStorage.setItem('productPrice', finalTotal.toFixed(2));
}

function changeQuantity(index, delta) {
  loadCart();
  if (index >= 0 && index < cart.length) {
    let currentQty = Number(cart[index].quantity) || 1;
    currentQty += delta;
    if (currentQty <= 0) {
      cart.splice(index, 1);
    } else {
      cart[index].quantity = currentQty;
    }
    saveCart();
    renderCart();
  }
}

function removeItem(index) {
  loadCart();
  if (index >= 0 && index < cart.length) {
    cart.splice(index, 1);
    saveCart();
    renderCart();
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  renderCart();

  const shippingSelect = document.getElementById('shippingOption');
  if (shippingSelect) {
    shippingSelect.addEventListener('change', renderCart);
  }

  const applyPromoBtn = document.getElementById('applyPromoBtn');
  const promoInput = document.getElementById('promoInput');
  const promoFeedback = document.getElementById('promoFeedback');

  if (applyPromoBtn && promoInput) {
    applyPromoBtn.addEventListener('click', () => {
      const code = promoInput.value.trim().toUpperCase();
      if (!code) return;

      if (code === 'BOOK20') {
        discountRate = 0.20;
        discountFixed = 0;
        promoFeedback.style.display = 'block';
        promoFeedback.style.color = '#27ae60';
        promoFeedback.textContent = 'Success! 20% discount applied.';
      } else if (code === 'WELCOME10') {
        discountRate = 0.10;
        discountFixed = 0;
        promoFeedback.style.display = 'block';
        promoFeedback.style.color = '#27ae60';
        promoFeedback.textContent = 'Success! 10% discount applied.';
      } else if (code === 'READ5') {
        discountRate = 0;
        discountFixed = 5;
        promoFeedback.style.display = 'block';
        promoFeedback.style.color = '#27ae60';
        promoFeedback.textContent = 'Success! $5.00 discount applied.';
      } else {
        promoFeedback.style.display = 'block';
        promoFeedback.style.color = '#e74c3c';
        promoFeedback.textContent = 'Invalid promo code. Try "BOOK20".';
      }
      renderCart();
    });
  }

  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
      }
      window.location.href = 'payment.html';
    });
  }
});
