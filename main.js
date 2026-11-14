/**
 * Book Store — Modern Identity & Interaction/Animation Engine
 */

// Book Catalog for Search & Quick View
const bookCatalog = [
  { image: 'image/image 6.png', title: 'Los Compas y la Maldición', price: 30, category: 'Adventure', description: 'Mike and Timba have organized a huge birthday party for Trolli in La Pluma Negra. A terrible curse threatens them!' },
  { image: 'image/image 7.png', title: 'La buena cocina', price: 60, category: 'Cooking', description: 'The art of picking and combining ingredients. Over 900 delicious, accessible recipes for healthy daily meals.' },
  { image: 'image/image 8.png', title: 'Aquitania', price: 45, category: 'History', description: 'A powerful historical thriller crossing a century filled with intrigue, revenge, and royalty. Winner of the Planeta Prize.' },
  { image: 'image/image 9.png', title: 'El bosque de los cuatro vientos', price: 15, category: 'Mystery', description: 'At the start of the 19th century, Doctor Vallejo and Marina uncover secrets in a remote ancient monastery.' },
  { image: 'image/9780778368274 1.png', title: 'Their Monstrous Hearts', price: 52, category: 'Fantasy', description: 'Deluxe edition with shimmering jacket, intricate illustrations, and sprayed edges. A dark fantasy romance.' },
  { image: 'image/9781525809811 1.png', title: 'The Madness', price: 32, category: 'Thriller', description: 'A chilling psychological journey into obsession, hidden truths, and ancient alliances under siege.' },
  { image: 'image/30.png', title: 'Flamboyants', price: 32, category: 'Fiction', description: 'A vivid and enchanting literary novel of love, artistic ambition, and resilience set against a tumultuous historical era.' },
  { image: 'image/31.png', title: 'The Silent Woods', price: 28, category: 'Mystery', description: 'Deep in the heart of the northern forest, a hidden community guards a generational secret.' },
  { image: 'image/32.png', title: 'Cosmic Wonders', price: 45, category: 'Science', description: 'An unforgettable illustrated journey across galaxies, black holes, and the foundational discoveries of astrophysics.' },
  { image: 'image/33.png', title: 'Harvest Vase', price: 78, category: 'Art & Design', description: 'A philosophical narrative exploring the intersection of craftsmanship, art, and the passage of generations.' },
  { image: 'image/34.png', title: '1984: Julia', price: 32, category: 'Dystopian', description: 'A gripping reimagining of George Orwell masterpiece, told through the fearless eyes of Julia.' },
  { image: 'image/35.png', title: 'Echoes of the Sea', price: 38, category: 'Novel', description: 'A lyrical epic celebrating coastal traditions, sea-faring families, and tales of extraordinary courage.' },
  { image: 'image/50.png', title: 'Liberation Day', price: 45, category: 'Novel', description: 'Booker Prize winner George Saunders returns with an electrifying collection of stories.' },
  { image: 'image/51.png', title: 'Flying Lessons', price: 23, category: 'Story', description: 'A heartwarming, uplifting anthology celebrating diverse childhood voices and youthful ambition.' },
  { image: 'image/53.png', title: 'White Cat, Black Dog', price: 30, category: 'Fantasy', description: 'Seven remixed fairy tales blending dark intrigue with surreal dreamscapes.' },
  { image: 'image/54.png', title: 'Banyan Moon', price: 26, category: 'Drama', description: 'An intimate multigenerational saga of a Vietnamese-American family, their heirloom house, and sacrifices.' },
  { image: 'image/55.png', title: 'The Island of Missing Trees', price: 35, category: 'Fiction', description: 'A rich, magical tale about belonging, identity, love, and trauma set in divided Cyprus.' }
];

let currentModalBook = null;

// ==========================================================================
// Cart Operations
// ==========================================================================
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

// Parabolic Flying Add-to-Cart Animation
function triggerFlyAddToCart(buttonEl, image, title, price, category = 'Story', qty = 1) {
  const cartBtn = document.getElementById('headerCartBtn');

  if (buttonEl && cartBtn) {
    const startRect = buttonEl.getBoundingClientRect();
    const endRect = cartBtn.getBoundingClientRect();

    // Create flying clone
    const flyer = document.createElement('img');
    flyer.src = image;
    flyer.className = 'flying-cart-ghost';
    flyer.style.width = '55px';
    flyer.style.height = '75px';
    flyer.style.left = `${startRect.left}px`;
    flyer.style.top = `${startRect.top}px`;
    flyer.style.opacity = '1';
    flyer.style.transform = 'scale(1) rotate(0deg)';

    document.body.appendChild(flyer);

    // Force layout reflow
    flyer.getBoundingClientRect();

    // Animate to target
    flyer.style.left = `${endRect.left + 5}px`;
    flyer.style.top = `${endRect.top + 5}px`;
    flyer.style.transform = 'scale(0.15) rotate(720deg)';
    flyer.style.opacity = '0.3';

    setTimeout(() => {
      if (flyer.parentNode) flyer.parentNode.removeChild(flyer);

      // Trigger cart shake animation
      cartBtn.classList.remove('cart-animate-shake');
      void cartBtn.offsetWidth; // Trigger reflow
      cartBtn.classList.add('cart-animate-shake');

      // Update actual data
      quickAddToCart(image, title, price, category, qty);
    }, 750);
  } else {
    quickAddToCart(image, title, price, category, qty);
  }
}

function quickAddToCart(image, title, price, category = 'Story', qty = 1) {
  const cart = getCart();
  const numPrice = Number(price) || 0;
  const numQty = Number(qty) || 1;

  const existingIndex = cart.findIndex(item => item.title === title);
  if (existingIndex > -1) {
    cart[existingIndex].quantity = (Number(cart[existingIndex].quantity) || 1) + numQty;
  } else {
    cart.push({
      image: image,
      title: title,
      price: numPrice,
      type: category,
      quantity: numQty
    });
  }

  saveCart(cart);
  showToast(`Added <b>${title}</b> to your cart!`, 'View Cart', 'html/shop.html');
}

// ==========================================================================
// Modal Operations
// ==========================================================================
const modalOverlay = document.getElementById('modalOverlay');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalBookImage = document.getElementById('modalBookImage');
const modalBookBadge = document.getElementById('modalBookBadge');
const modalBookTitle = document.getElementById('modalBookTitle');
const modalBookDescription = document.getElementById('modalBookDescription');
const modalBookPrice = document.getElementById('modalBookPrice');
const modalQtyInput = document.getElementById('modalQtyInput');
const qtyMinusBtn = document.getElementById('qtyMinusBtn');
const qtyPlusBtn = document.getElementById('qtyPlusBtn');
const modalAddToCartBtn = document.getElementById('modalAddToCartBtn');

function openBookModal(image, title, description, price, category = 'Novel') {
  currentModalBook = { image, title, description, price, category };

  if (modalBookImage) modalBookImage.src = image;
  if (modalBookBadge) modalBookBadge.textContent = category;
  if (modalBookTitle) modalBookTitle.textContent = title;
  if (modalBookDescription) modalBookDescription.textContent = description;
  if (modalBookPrice) modalBookPrice.textContent = `$${price}`;
  if (modalQtyInput) modalQtyInput.value = '1';

  if (modalOverlay) {
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeBookModal() {
  if (modalOverlay) {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }
  currentModalBook = null;
}

if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeBookModal);

if (modalOverlay) {
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeBookModal();
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeBookModal();
});

// Quantity controls
if (qtyMinusBtn && modalQtyInput) {
  qtyMinusBtn.addEventListener('click', () => {
    let val = parseInt(modalQtyInput.value) || 1;
    if (val > 1) modalQtyInput.value = val - 1;
  });
}

if (qtyPlusBtn && modalQtyInput) {
  qtyPlusBtn.addEventListener('click', () => {
    let val = parseInt(modalQtyInput.value) || 1;
    modalQtyInput.value = val + 1;
  });
}

if (modalAddToCartBtn) {
  modalAddToCartBtn.addEventListener('click', function() {
    if (!currentModalBook) return;
    const qty = parseInt(modalQtyInput ? modalQtyInput.value : 1) || 1;
    triggerFlyAddToCart(
      this,
      currentModalBook.image,
      currentModalBook.title,
      currentModalBook.price,
      currentModalBook.category,
      qty
    );
    closeBookModal();
  });
}

// ==========================================================================
// Modern Toast Notification with Animated Countdown
// ==========================================================================
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
    <div class="toast-custom-icon"><i class="fas fa-check"></i></div>
    <div class="toast-content">${message}</div>
    ${actionHtml}
    <div class="toast-progress-bar"></div>
  `;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 450);
  }, 3500);
}

// ==========================================================================
// Live Search & Autocomplete
// ==========================================================================
const inputBox = document.getElementById('inputBox');
const suggestionsBox = document.getElementById('suggestions');
const suggestionsList = document.getElementById('suggestionsList');

if (inputBox && suggestionsBox && suggestionsList) {
  inputBox.addEventListener('input', () => {
    const query = inputBox.value.toLowerCase().trim();

    if (!query) {
      suggestionsBox.style.display = 'none';
      suggestionsList.innerHTML = '';
      return;
    }

    const matches = bookCatalog.filter(book =>
      book.title.toLowerCase().includes(query) ||
      book.category.toLowerCase().includes(query)
    );

    if (matches.length === 0) {
      suggestionsList.innerHTML = `
        <li style="padding: 14px; color: #64748b; font-size: 0.9rem; text-align: center;">
          <i class="fas fa-search me-1"></i> No books found matching "<b>${query}</b>"
        </li>
      `;
      suggestionsBox.style.display = 'block';
      return;
    }

    suggestionsList.innerHTML = matches.map(book => `
      <li>
        <a href="#" onclick="event.preventDefault(); openBookModal('${book.image}', '${book.title.replace(/'/g, "\\'")}', '${book.description.replace(/'/g, "\\'")}', ${book.price}, '${book.category}'); document.getElementById('suggestions').style.display='none';">
          <img src="${book.image}" alt="${book.title}">
          <div class="suggestion-info">
            <span class="suggestion-title">${book.title}</span>
            <span class="suggestion-price">$${book.price} &bull; ${book.category}</span>
          </div>
        </a>
      </li>
    `).join('');

    suggestionsBox.style.display = 'block';
  });

  document.addEventListener('click', (e) => {
    if (!inputBox.contains(e.target) && !suggestionsBox.contains(e.target)) {
      suggestionsBox.style.display = 'none';
    }
  });
}

// ==========================================================================
// Scroll Header Effect & Intersection Observer
// ==========================================================================
window.addEventListener('scroll', () => {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  if (window.scrollY > 25) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// ==========================================================================
// User Authentication State in Navbar
// ==========================================================================
function checkUserAuth() {
  const authArea = document.getElementById('userAuthArea');
  if (!authArea) return;

  const rawUser = localStorage.getItem('currentUser');
  if (rawUser) {
    try {
      const user = JSON.parse(rawUser);
      authArea.innerHTML = `
        <div class="user-dropdown">
          <div class="user-profile-pill" id="userPillBtn" title="Click to Logout">
            <i class="fas fa-user-circle"></i>
            <span>${user.name || 'Member'}</span>
            <i class="fas fa-sign-out-alt ms-1 text-danger" style="font-size: 0.8rem;"></i>
          </div>
        </div>
      `;

      document.getElementById('userPillBtn').addEventListener('click', () => {
        if (confirm(`Sign out from ${user.name || 'your account'}?`)) {
          localStorage.removeItem('currentUser');
          showToast('You have signed out successfully.');
          checkUserAuth();
        }
      });
      return;
    } catch (e) {}
  }

  authArea.innerHTML = `
    <a href="html/login.html" class="user-auth-btn">Log In</a>
    <a href="html/signup.html" class="user-auth-btn btn-solid d-none d-sm-inline-flex">Sign Up</a>
  `;
}

// ==========================================================================
// Newsletter Form Handler
// ==========================================================================
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('newsletterEmail');
    if (emailInput && emailInput.value) {
      showToast(`Welcome! Your 20% discount code has been sent to <b>${emailInput.value}</b>.`);
      emailInput.value = '';
    }
  });
}

// Initialization on Page Load
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  checkUserAuth();
});
