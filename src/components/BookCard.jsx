'use client';

import React from 'react';
import { useCart } from '../context/CartContext';

export default function BookCard({ book }) {
  const { addToCart, openModal } = useCart();

  const handleAddClick = (e) => {
    e.stopPropagation();
    addToCart(book, 1, e.currentTarget);
  };

  return (
    <div className="book-card-item" onClick={() => openModal(book)}>
      <div className="book-card-cover-wrapper">
        {book.badge && (
          <span className={`book-card-badge ${book.badge.includes('Best') ? 'bestseller' : ''}`}>
            {book.badge}
          </span>
        )}
        <img src={book.image} className="book-card-cover" alt={book.title} />
      </div>

      <div className="book-card-body">
        <span className="book-card-category">{book.category}</span>
        <h4 className="book-card-title">{book.title}</h4>

        <div className="book-card-rating">
          <i className="fas fa-star"></i>
          <i className="fas fa-star"></i>
          <i className="fas fa-star"></i>
          <i className="fas fa-star"></i>
          <i className="fas fa-star-half-alt"></i>
          <span style={{ fontSize: '0.78rem', color: '#64748b', marginLeft: '4px' }}>
            ({book.rating || 4.9})
          </span>
        </div>

        <div className="book-card-footer">
          <span className="book-card-price">${book.price}</span>
          <button
            type="button"
            className="book-card-add-btn"
            onClick={handleAddClick}
            title={`Add ${book.title} to cart`}
          >
            <i className="fas fa-plus"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

