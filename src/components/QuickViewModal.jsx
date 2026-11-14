'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

export default function QuickViewModal() {
  const { quickViewBook, closeModal, addToCart } = useCart();
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setQty(1);
  }, [quickViewBook]);

  if (!quickViewBook) return null;

  const handleAdd = (e) => {
    addToCart(quickViewBook, qty, e.currentTarget);
    closeModal();
  };

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="book-modal-card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close-btn"
          onClick={closeModal}
          title="Close Modal"
        >
          <i className="fas fa-times"></i>
        </button>

        <div className="modal-image-col">
          <img src={quickViewBook.image} alt={quickViewBook.title} />
        </div>

        <div className="modal-info-col">
          <span className="modal-book-badge">{quickViewBook.category || 'Featured'}</span>
          <h3 className="modal-book-title">{quickViewBook.title}</h3>
          <div className="modal-book-price">${quickViewBook.price}</div>
          <p className="modal-book-desc">{quickViewBook.description}</p>

          <div className="modal-controls-row">
            <div className="modal-qty-box">
              <button
                type="button"
                className="modal-qty-btn"
                onClick={() => setQty((prev) => Math.max(1, prev - 1))}
              >
                -
              </button>
              <input
                type="text"
                readOnly
                value={qty}
                className="modal-qty-input"
              />
              <button
                type="button"
                className="modal-qty-btn"
                onClick={() => setQty((prev) => prev + 1)}
              >
                +
              </button>
            </div>

            <button
              type="button"
              className="modal-add-cart-btn"
              onClick={handleAdd}
            >
              <i className="fas fa-cart-plus"></i> Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

