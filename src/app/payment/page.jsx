'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function PaymentPage() {
  const router = useRouter();
  const { cart, grandTotal, totalCount, clearCart, isClient } = useCart();
  const { user } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState('cod'); // Default: Cash on Delivery
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '124 Market St, Suite 500',
    city: 'San Francisco, CA',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Sync user info if logged in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        cardName: user.name || prev.cardName,
        phone: user.phone || prev.phone,
        address: user.address || prev.address,
        city: user.city || prev.city
      }));
    }
  }, [user]);

  // Format Card Number with 4-digit spacing
  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
    let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setFormData((prev) => ({ ...prev, cardNumber: formatted }));
  };

  // Format Expiry MM/YY
  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 2) {
      val = val.slice(0, 2) + '/' + val.slice(2);
    }
    setFormData((prev) => ({ ...prev, expiryDate: val }));
  };

  const handleCvvChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    setFormData((prev) => ({ ...prev, cvv: val }));
  };

  const detectBrand = (num) => {
    const clean = num.replace(/\s+/g, '');
    if (clean.startsWith('4')) return { name: 'VISA', icon: 'fa-cc-visa', color: '#1a1f71' };
    if (/^(5[1-5]|2[2-7])/.test(clean)) return { name: 'Mastercard', icon: 'fa-cc-mastercard', color: '#eb001b' };
    if (/^3[47]/.test(clean)) return { name: 'Amex', icon: 'fa-cc-amex', color: '#006fcf' };
    return { name: 'Card', icon: 'fa-credit-card', color: '#94a3b8' };
  };

  const brand = detectBrand(formData.cardNumber);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim()) {
      setErrorMessage('Please provide your full recipient name.');
      return;
    }

    if (!formData.phone.trim()) {
      setErrorMessage('Please enter your contact phone number for courier delivery confirmation.');
      return;
    }

    if (paymentMethod === 'card') {
      const cleanNum = formData.cardNumber.replace(/\s+/g, '');
      if (cleanNum.length < 15) {
        setErrorMessage('Please enter a valid 16-digit card number.');
        return;
      }
      if (!formData.expiryDate.includes('/') || formData.expiryDate.length < 5) {
        setErrorMessage('Please enter a valid expiry date (MM/YY).');
        return;
      }
      if (formData.cvv.length < 3) {
        setErrorMessage('Please enter a valid 3 or 4-digit CVV.');
        return;
      }
    }

    setSubmitting(true);

    try {
      const generatedOrderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: generatedOrderId,
          customerName: formData.name,
          customerEmail: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          items: cart,
          itemsCount: totalCount,
          amount: grandTotal,
          paymentMethod: paymentMethod,
          cardName: formData.cardName || formData.name,
          cardNumber: formData.cardNumber || '',
          expiryDate: formData.expiryDate || '',
          cvv: formData.cvv || ''
        })
      });

      const resData = await response.json();

      if (response.ok && (resData.status === 'success' || resData.success)) {
        setOrderComplete({
          orderId: generatedOrderId,
          total: grandTotal,
          itemsCount: totalCount,
          paymentMethod: paymentMethod,
          phone: formData.phone,
          address: `${formData.address}, ${formData.city}`,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          customer: formData.name
        });
        clearCart();
      } else {
        setErrorMessage(resData.message || 'Payment processing failed. Please try again.');
      }
    } catch (err) {
      setErrorMessage('Network connection error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isClient) return null;

  if (orderComplete) {
    const isCod = orderComplete.paymentMethod === 'cod';

    return (
      <div className="payment-page-wrapper">
        <div className="payment-form-card" style={{ maxWidth: '640px', margin: '3rem auto', textAlign: 'center', padding: '3.5rem 2rem' }}>
          <div style={{
            width: '76px',
            height: '76px',
            borderRadius: '50%',
            background: '#dcfce7',
            color: '#16a34a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.4rem',
            margin: '0 auto 1.5rem',
            border: '2px solid #86efac'
          }}>
            <i className="fas fa-check"></i>
          </div>

          <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '8px', color: '#0f172a' }}>
            {isCod ? 'Order Placed Successfully!' : 'Payment Received!'}
          </h2>
          <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '1rem', lineHeight: '1.6' }}>
            Thank you, <b>{orderComplete.customer}</b>. We have registered your order and our dispatch team has begun packaging your books.
            {isCod && ' You will pay with cash directly upon delivery.'}
          </p>

          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '22px',
            marginBottom: '28px',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.95rem' }}>
              <span style={{ color: '#64748b' }}>Order Reference:</span>
              <span style={{ fontWeight: 800, color: '#4f46e5', fontFamily: 'monospace' }}>#{orderComplete.orderId}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.95rem' }}>
              <span style={{ color: '#64748b' }}>Payment Mode:</span>
              <span style={{ fontWeight: 700, color: isCod ? '#059669' : '#0f172a' }}>
                {isCod ? 'Cash on Delivery (COD)' : 'Credit Card (Paid)'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.95rem' }}>
              <span style={{ color: '#64748b' }}>Total Order Value:</span>
              <span style={{ fontWeight: 900, color: '#0f172a', fontSize: '1.1rem' }}>${orderComplete.total.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.95rem' }}>
              <span style={{ color: '#64748b' }}>Contact Phone:</span>
              <span style={{ fontWeight: 700, color: '#334155' }}>{orderComplete.phone}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
              <span style={{ color: '#64748b' }}>Destination:</span>
              <span style={{ fontWeight: 600, color: '#334155', maxWidth: '65%', textAlign: 'right' }}>{orderComplete.address}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/profile"
              className="btn-pay-now"
              style={{
                textDecoration: 'none',
                background: '#4f46e5',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px 28px'
              }}
            >
              <i className="fas fa-truck-fast"></i> Track Shipment in Profile &rarr;
            </Link>

            <Link
              href="/"
              className="btn-pay-now"
              style={{
                textDecoration: 'none',
                background: '#0f172a',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px 24px'
              }}
            >
              <i className="fas fa-home"></i> Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page-wrapper">
      <div className="payment-layout-grid">
        {/* Left: Payment Form Card */}
        <div className="payment-form-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
              <i className="fas fa-shield-halved text-primary" style={{ color: '#4f46e5', marginRight: '10px' }}></i>
              Checkout &amp; Payment
            </h2>
            <span style={{ fontSize: '0.85rem', color: '#059669', background: '#dcfce7', padding: '4px 12px', borderRadius: '20px', fontWeight: 700 }}>
              <i className="fas fa-lock me-1"></i> 256-Bit SSL Encrypted
            </span>
          </div>

          {errorMessage && (
            <div style={{
              background: '#fee2e2',
              color: '#b91c1c',
              border: '1px solid #f87171',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '0.9rem'
            }}>
              <i className="fas fa-circle-exclamation me-1"></i> {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Delivery Contact Info */}
            <div className="payment-section-heading">
              <i className="fas fa-location-dot"></i> Shipping Information
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <div className="form-group-custom">
                <label className="form-label-custom">Full Recipient Name *</label>
                <input
                  type="text"
                  required
                  className="form-control-custom"
                  placeholder="e.g. Gamal Ahmed"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group-custom">
                <label className="form-label-custom">Email Address *</label>
                <input
                  type="email"
                  required
                  className="form-control-custom"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <div className="form-group-custom">
                <label className="form-label-custom">Mobile Phone Number *</label>
                <input
                  type="tel"
                  required
                  className="form-control-custom"
                  placeholder="e.g. +20 1012345678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group-custom">
                <label className="form-label-custom">City &amp; Region *</label>
                <input
                  type="text"
                  required
                  className="form-control-custom"
                  placeholder="e.g. Cairo / San Francisco, CA"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group-custom">
              <label className="form-label-custom">Street Address &amp; Apartment *</label>
              <input
                type="text"
                required
                className="form-control-custom"
                placeholder="Street address, building number, flat"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            {/* Payment Method Selector */}
            <div className="payment-section-heading" style={{ marginTop: '2.2rem' }}>
              <i className="fas fa-wallet"></i> Select Payment Method
            </div>

            <div className="payment-method-selector">
              <button
                type="button"
                className={`payment-method-btn ${paymentMethod === 'cod' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('cod')}
              >
                <i className="fas fa-hand-holding-dollar fa-lg" style={{ color: paymentMethod === 'cod' ? '#ffffff' : '#059669' }}></i>
                <span>Cash on Delivery (COD)</span>
              </button>

              <button
                type="button"
                className={`payment-method-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                <i className="fas fa-credit-card fa-lg"></i>
                <span>Credit / Debit Card</span>
              </button>

              <button
                type="button"
                className={`payment-method-btn ${paymentMethod === 'paypal' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('paypal')}
              >
                <i className="fab fa-paypal fa-lg"></i>
                <span>PayPal Express</span>
              </button>
            </div>

            {/* COD Explanation Card */}
            {paymentMethod === 'cod' && (
              <div style={{
                background: '#f0fdf4',
                border: '1.5px solid #86efac',
                borderRadius: '14px',
                padding: '22px',
                margin: '1.5rem 0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: '#16a34a',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem'
                  }}>
                    <i className="fas fa-hand-holding-dollar"></i>
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#14532d' }}>
                      Pay Cash Upon Doorstep Delivery
                    </div>
                    <div style={{ fontSize: '0.86rem', color: '#15803d' }}>
                      Inspect your package first and pay the courier directly in cash.
                    </div>
                  </div>
                </div>

                <ul style={{ margin: '12px 0 0 16px', padding: 0, fontSize: '0.88rem', color: '#166534', lineHeight: '1.7' }}>
                  <li><i className="fas fa-check text-success me-2"></i> No credit card or pre-payment details required right now.</li>
                  <li><i className="fas fa-check text-success me-2"></i> Courier will call your phone prior to arrival to coordinate handover.</li>
                  <li><i className="fas fa-check text-success me-2"></i> Track your package milestone progress anytime in your Profile.</li>
                </ul>
              </div>
            )}

            {/* Credit Card Fields */}
            {paymentMethod === 'card' && (
              <>
                <div className="credit-card-preview">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="card-preview-chip"></div>
                    <i className={`fab ${brand.icon} fa-2x`} style={{ color: '#ffffff' }}></i>
                  </div>

                  <div className="card-preview-number">
                    {formData.cardNumber || '•••• •••• •••• ••••'}
                  </div>

                  <div className="card-preview-bottom">
                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>CARDHOLDER</div>
                      <div className="card-preview-name">{formData.cardName || formData.name || 'YOUR NAME'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>EXPIRES</div>
                      <div style={{ fontWeight: 700 }}>{formData.expiryDate || 'MM/YY'}</div>
                    </div>
                  </div>
                </div>

                <div className="form-group-custom">
                  <label className="form-label-custom">Cardholder Name</label>
                  <input
                    type="text"
                    required
                    className="form-control-custom"
                    placeholder="Full name as printed on card"
                    value={formData.cardName}
                    onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                  />
                </div>

                <div className="form-group-custom">
                  <label className="form-label-custom">Card Number</label>
                  <input
                    type="text"
                    required
                    className="form-control-custom"
                    placeholder="XXXX XXXX XXXX XXXX"
                    value={formData.cardNumber}
                    onChange={handleCardNumberChange}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group-custom">
                    <label className="form-label-custom">Expiry Date (MM/YY)</label>
                    <input
                      type="text"
                      required
                      className="form-control-custom"
                      placeholder="MM/YY"
                      value={formData.expiryDate}
                      onChange={handleExpiryChange}
                    />
                  </div>

                  <div className="form-group-custom">
                    <label className="form-label-custom">Security Code (CVV)</label>
                    <input
                      type="password"
                      required
                      className="form-control-custom"
                      placeholder="123"
                      value={formData.cvv}
                      onChange={handleCvvChange}
                    />
                  </div>
                </div>
              </>
            )}

            {/* PayPal Info Box */}
            {paymentMethod === 'paypal' && (
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center',
                margin: '1.5rem 0'
              }}>
                <i className="fab fa-paypal fa-3x" style={{ color: '#003087', marginBottom: '12px' }}></i>
                <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0 }}>
                  You will be securely redirected to PayPal to authorize your payment once you click Place Order.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-pay-now"
              style={{
                background: paymentMethod === 'cod' ? '#059669' : '#4f46e5',
                marginTop: '1.5rem'
              }}
            >
              {submitting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Processing Your Order...
                </>
              ) : paymentMethod === 'cod' ? (
                <>
                  <i className="fas fa-circle-check"></i> Confirm Cash on Delivery Order (${grandTotal.toFixed(2)})
                </>
              ) : (
                <>
                  <i className="fas fa-lock"></i> Pay ${grandTotal.toFixed(2)} Securely
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Order Summary Preview */}
        <div>
          <div className="cart-summary-column" style={{ borderRadius: '16px', border: '1px solid #e2e8f0', position: 'sticky', top: '90px' }}>
            <h3 className="summary-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Order Summary</span>
              <span style={{ fontSize: '0.88rem', color: '#4f46e5', fontWeight: 700 }}>{totalCount} item(s)</span>
            </h3>

            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '16px' }}>
              {cart.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{ width: '44px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#0f172a' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Qty: {item.quantity} &bull; ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#64748b', marginBottom: '6px' }}>
                <span>Subtotal</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#059669', marginBottom: '6px' }}>
                <span>Courier Express Shipping</span>
                <span style={{ fontWeight: 700 }}>FREE</span>
              </div>
            </div>

            <div className="summary-row total" style={{ marginTop: 'auto', paddingTop: '12px' }}>
              <span style={{ fontWeight: 800 }}>Total Due</span>
              <span style={{ fontWeight: 900, color: '#4f46e5' }}>${grandTotal.toFixed(2)}</span>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', marginTop: '16px' }}>
              <i className="fas fa-truck-moving me-1" style={{ color: '#059669' }}></i> Guaranteed doorstep delivery in 24 - 48 hours
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
