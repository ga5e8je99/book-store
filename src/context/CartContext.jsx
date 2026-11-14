'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [quickViewBook, setQuickViewBook] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [cartShaking, setCartShaking] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    setIsClient(true);
    try {
      const stored = localStorage.getItem('product');
      if (stored) {
        setCart(JSON.parse(stored));
      }
    } catch (e) {
      setCart([]);
    }
  }, []);

  // Save to localStorage when cart changes
  const saveCartToStorage = (newCart) => {
    setCart(newCart);
    try {
      localStorage.setItem('product', JSON.stringify(newCart));
    } catch (e) {}
  };

  const showToast = (message, actionText = '', actionUrl = '') => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, actionText, actionUrl };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const triggerFlyAnimation = (buttonEl, book) => {
    const cartBtn = document.getElementById('headerCartBtn');
    if (buttonEl && cartBtn && typeof window !== 'undefined') {
      const startRect = buttonEl.getBoundingClientRect();
      const endRect = cartBtn.getBoundingClientRect();

      const flyer = document.createElement('img');
      flyer.src = book.image;
      flyer.className = 'flying-cart-ghost';
      flyer.style.width = '55px';
      flyer.style.height = '75px';
      flyer.style.left = `${startRect.left}px`;
      flyer.style.top = `${startRect.top}px`;
      flyer.style.opacity = '1';
      flyer.style.transform = 'scale(1) rotate(0deg)';

      document.body.appendChild(flyer);
      flyer.getBoundingClientRect(); // Reflow

      flyer.style.left = `${endRect.left + 5}px`;
      flyer.style.top = `${endRect.top + 5}px`;
      flyer.style.transform = 'scale(0.15) rotate(720deg)';
      flyer.style.opacity = '0.3';

      setTimeout(() => {
        if (flyer.parentNode) flyer.parentNode.removeChild(flyer);
        setCartShaking(true);
        setTimeout(() => setCartShaking(false), 450);
      }, 750);
    }
  };

  const addToCart = (book, qty = 1, buttonEl = null) => {
    const numQty = Number(qty) || 1;
    const numPrice = Number(book.price) || 0;

    if (buttonEl) {
      triggerFlyAnimation(buttonEl, book);
    }

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.title === book.title);
      let updated;
      if (existingIndex > -1) {
        updated = [...prevCart];
        updated[existingIndex].quantity = (Number(updated[existingIndex].quantity) || 1) + numQty;
      } else {
        updated = [
          ...prevCart,
          {
            image: book.image,
            title: book.title,
            price: numPrice,
            type: book.category || 'Book',
            quantity: numQty
          }
        ];
      }
      try {
        localStorage.setItem('product', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    showToast(`Added <b>${book.title}</b> to your cart!`, 'View Cart', '/shop');
  };

  const removeFromCart = (title) => {
    const updated = cart.filter((item) => item.title !== title);
    saveCartToStorage(updated);
    showToast(`Removed <b>${title}</b> from cart.`);
  };

  const updateQuantity = (title, newQty) => {
    if (newQty <= 0) {
      removeFromCart(title);
      return;
    }
    const updated = cart.map((item) => {
      if (item.title === title) {
        return { ...item, quantity: newQty };
      }
      return item;
    });
    saveCartToStorage(updated);
  };

  const clearCart = () => {
    saveCartToStorage([]);
  };

  const applyPromoCode = (code) => {
    const trimmed = (code || '').trim().toUpperCase();
    if (trimmed === 'BOOK20') {
      setDiscountPercent(20);
      setPromoCode('BOOK20');
      showToast('Promo code <b>BOOK20</b> applied: 20% Discount!');
      return { success: true, message: '20% discount applied!' };
    }
    setDiscountPercent(0);
    return { success: false, message: 'Invalid promo code. Use BOOK20' };
  };

  const totalCount = isClient ? cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0) : 0;
  const subtotal = isClient ? cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0) : 0;
  const discountAmount = subtotal * (discountPercent / 100);
  const shipping = subtotal > 50 || subtotal === 0 ? 0 : 5;
  const grandTotal = Math.max(0, subtotal - discountAmount + shipping);

  return (
    <CartContext.Provider
      value={{
        cart,
        isClient,
        totalCount,
        subtotal,
        discountPercent,
        discountAmount,
        shipping,
        grandTotal,
        promoCode,
        cartShaking,
        quickViewBook,
        toasts,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyPromoCode,
        openModal: (book) => setQuickViewBook(book),
        closeModal: () => setQuickViewBook(null),
        showToast
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

