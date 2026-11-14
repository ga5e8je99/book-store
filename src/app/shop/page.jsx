'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';

export default function ShopCartPage() {
  const {
    cart,
    isClient,
    totalCount,
    subtotal,
    discountPercent,
    discountAmount,
    shipping,
    grandTotal,
    removeFromCart,
    updateQuantity,
    applyPromoCode,
    clearCart
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState(null);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    const res = applyPromoCode(promoInput);
    setPromoMessage(res);
  };

  if (!isClient) {
    return (
      <div className="cart-page-wrapper">
        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
          <i className="fas fa-spinner fa-spin fa-2x" style={{ color: '#4f46e5' }}></i>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="cart-page-wrapper">
        <div className="cart-layout-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="empty-cart-state">
            <div className="empty-cart-icon">
              <i className="fas fa-shopping-bag"></i>
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '10px' }}>Your Cart is Empty</h2>
            <p style={{ color: '#64748b', marginBottom: '25px' }}>
              Looks like you haven&apos;t added any books to your shopping bag yet.
            </p>
            <Link
              href="/"
              className="user-auth-btn btn-solid"
              style={{ padding: '12px 28px', fontSize: '1rem' }}
            >
              Start Exploring Books &rarr;
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-wrapper">
      <div className="cart-layout-grid">
        {/* Left: Items Column */}
        <div className="cart-items-column">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 className="cart-header-title" style={{ margin: 0 }}>
              <i className="fas fa-shopping-bag text-primary" style={{ color: '#4f46e5' }}></i>
              Shopping Bag ({totalCount})
            </h2>
            <button
              type="button"
              onClick={clearCart}
              style={{
                background: 'none',
                border: 'none',
                color: '#ef4444',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <i className="fas fa-trash-alt me-1"></i> Clear Cart
            </button>
          </div>

          <div>
            {cart.map((item, index) => (
              <div key={`${item.title}-${index}`} className="cart-item-row">
                <img src={item.image} alt={item.title} className="cart-item-img" />

                <div className="cart-item-details">
                  <h4>{item.title}</h4>
                  <div className="cart-item-category">{item.type || 'Book'}</div>
                  <div className="cart-item-unit-price">${item.price} each</div>
                </div>

                <div className="cart-item-controls">
                  <button
                    type="button"
                    className="cart-item-ctrl-btn"
                    onClick={() => updateQuantity(item.title, item.quantity - 1)}
                  >
                    -
                  </button>
                  <div className="cart-item-qty-display">{item.quantity}</div>
                  <button
                    type="button"
                    className="cart-item-ctrl-btn"
                    onClick={() => updateQuantity(item.title, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  className="cart-item-remove-btn"
                  onClick={() => removeFromCart(item.title)}
                  title="Remove book from cart"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Summary Column */}
        <div className="cart-summary-column">
          <h3 className="summary-title">Order Summary</h3>

          <div className="summary-row">
            <span>Subtotal ({totalCount} items)</span>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>${subtotal.toFixed(2)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="summary-row" style={{ color: '#059669' }}>
              <span>Promo Discount ({discountPercent}%)</span>
              <span style={{ fontWeight: 700 }}>-${discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="summary-row">
            <span>Shipping</span>
            <span>
              {shipping === 0 ? (
                <span style={{ color: '#059669', fontWeight: 700 }}>FREE</span>
              ) : (
                `$${shipping.toFixed(2)}`
              )}
            </span>
          </div>

          <form onSubmit={handleApplyPromo} className="promo-input-group">
            <input
              type="text"
              placeholder="Promo Code (try BOOK20)"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
            />
            <button type="submit">Apply</button>
          </form>

          {promoMessage && (
            <div
              style={{
                fontSize: '0.85rem',
                color: promoMessage.success ? '#059669' : '#ef4444',
                marginTop: '-10px',
                marginBottom: '15px'
              }}
            >
              {promoMessage.message}
            </div>
          )}

          <div className="summary-row total">
            <span>Grand Total</span>
            <span>${grandTotal.toFixed(2)}</span>
          </div>

          <Link href="/payment" className="btn-checkout">
            Proceed to Checkout <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
      </div>
    </div>
  );
}

