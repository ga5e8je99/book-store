/**
 * Book Store - Category Pages Script
 */

function getCart() {
  try {
    const raw = localStorage.getItem('product');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('product', JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;

  const cart = getCart();
  const totalCount = cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  badge.textContent = totalCount;
}

function addBookToCart(image, title, price, category = 'Book') {
  const cart = getCart();
  const numPrice = Number(price) || 0;

  // Check if item exists
  const existing = cart.find(item => item.title === title);
  if (existing) {
    existing.quantity = (Number(existing.quantity) || 1) + 1;
  } else {
    cart.push({
      image: image,
      title: title,
      price: numPrice,
      type: category,
      quantity: 1
    });
  }

  saveCart(cart);
  showToast(`Added "${title}" to your cart!`, 'View Cart', 'shop.html');
}

function showToast(message, actionText = '', actionUrl = '') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container-custom';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast-custom';

  let actionHtml = '';
  if (actionText && actionUrl) {
    actionHtml = `<a href="${actionUrl}" class="toast-action">${actionText} &rarr;</a>`;
  }

  toast.innerHTML = `
    <i class="fas fa-check-circle"></i>
    <div class="toast-content">${message}</div>
    ${actionHtml}
  `;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 400);
  }, 3500);
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
});

