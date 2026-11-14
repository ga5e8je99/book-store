'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isClient, login, logout } = useAuth();
  const { addToCart, showToast } = useCart();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'active' | 'delivered' | 'cancelled'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState(null);

  // Quick Tracker Search
  const [quickTrackInput, setQuickTrackInput] = useState('');
  const [quickTrackResult, setQuickTrackResult] = useState(null);
  const [quickTrackLoading, setQuickTrackLoading] = useState(false);
  const [quickTrackError, setQuickTrackError] = useState('');

  // Edit profile form state
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Copied states for UX feedback
  const [copiedId, setCopiedId] = useState(null);
  const [copiedPromo, setCopiedPromo] = useState(false);

  // Sync profile fields
  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditPhone(user.phone || '');
      setEditAddress(user.address || '');
      setEditCity(user.city || '');
    }
  }, [user]);

  // Fetch orders from API
  const fetchOrders = async (silent = false) => {
    if (!silent) setLoadingOrders(true);
    try {
      let url = '/api/orders';
      if (user?.email) {
        url = `/api/orders?email=${encodeURIComponent(user.email)}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.data?.orders) {
        setOrders(data.data.orders);
      } else {
        setOrders([]);
      }
    } catch (e) {
      console.error('Failed to load orders', e);
      setOrders([]);
    } finally {
      if (!silent) setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (isClient) {
      fetchOrders();
    }
  }, [isClient, user]);

  // Copy to clipboard helper
  const handleCopy = (text, type = 'id') => {
    navigator.clipboard?.writeText(text);
    if (type === 'id') {
      setCopiedId(text);
      setTimeout(() => setCopiedId(null), 2500);
    } else {
      setCopiedPromo(true);
      setTimeout(() => setCopiedPromo(false), 2500);
    }
  };

  // Re-order items
  const handleReorder = (order) => {
    if (!order.items || order.items.length === 0) {
      showToast('No items found in this order to reorder.');
      return;
    }
    order.items.forEach((item) => {
      addToCart({
        title: item.title,
        price: item.price,
        image: item.image,
        category: item.category || 'Book'
      }, item.quantity || 1);
    });
    showToast(`Added ${order.items.length} items from #${order.orderId || 'order'} to your cart!`, 'View Cart', '/shop');
  };

  // Save profile edits
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!user?.email) return;

    setSavingProfile(true);
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: editName,
          phone: editPhone,
          address: editAddress,
          city: editCity
        })
      });
      const data = await res.json();
      if (res.ok && data.data?.user) {
        login(data.data.user);
        setIsEditModalOpen(false);
        showToast('Profile & shipping preferences updated successfully!');
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (err) {
      alert('Error updating profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // Quick Tracker Search
  const handleQuickTrack = async (e) => {
    e.preventDefault();
    if (!quickTrackInput.trim()) return;

    setQuickTrackLoading(true);
    setQuickTrackError('');
    setQuickTrackResult(null);

    try {
      const q = encodeURIComponent(quickTrackInput.trim());
      const res = await fetch(`/api/orders?orderId=${q}`);
      const data = await res.json();

      if (res.ok && data.data?.orders?.length > 0) {
        setQuickTrackResult(data.data.orders[0]);
      } else {
        const res2 = await fetch(`/api/orders?email=${q}`);
        const data2 = await res2.json();
        if (res2.ok && data2.data?.orders?.length > 0) {
          setQuickTrackResult(data2.data.orders[0]);
        } else {
          setQuickTrackError('No matching order found for this reference or email.');
        }
      }
    } catch (err) {
      setQuickTrackError('Failed to track package. Please check network.');
    } finally {
      setQuickTrackLoading(false);
    }
  };

  // Map order status to numeric step index (1 to 4)
  const getStepIndex = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'cancelled') return -1;
    if (s === 'delivered') return 4;
    if (s === 'shipped') return 3;
    if (s === 'ready' || s === 'packed' || s === 'processing') return 2;
    return 1;
  };

  // Filter orders
  const filteredOrders = orders.filter((ord) => {
    const s = (ord.status || 'processing').toLowerCase();
    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'active' && (s === 'processing' || s === 'shipped' || s === 'ready')) ||
      (activeFilter === 'delivered' && s === 'delivered') ||
      (activeFilter === 'cancelled' && s === 'cancelled');

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (ord.orderId || '').toLowerCase().includes(q) ||
      (ord._id || '').toLowerCase().includes(q) ||
      (ord.customerName || '').toLowerCase().includes(q) ||
      (ord.items || []).some((it) => it.title.toLowerCase().includes(q));

    return matchesFilter && matchesSearch;
  });

  const activeOrders = orders.filter((o) => {
    const s = (o.status || '').toLowerCase();
    return s === 'processing' || s === 'shipped' || s === 'ready';
  });

  const totalSpent = orders
    .filter((o) => (o.status || '').toLowerCase() !== 'cancelled')
    .reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

  const totalBooks = orders.reduce((sum, o) => sum + (Number(o.itemsCount) || 1), 0);

  // Stepper Visual Component
  const StepperPipeline = ({ status }) => {
    const currentStep = getStepIndex(status);

    if (currentStep === -1) {
      return (
        <div className="stepper-cancelled-card">
          <div className="cancelled-badge-icon">
            <i className="fas fa-ban"></i>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#991b1b' }}>Shipment Cancelled</div>
            <div style={{ fontSize: '0.82rem', color: '#b91c1c' }}>
              This order was cancelled. Feel free to re-order your titles anytime.
            </div>
          </div>
        </div>
      );
    }

    const steps = [
      { step: 1, label: 'Order Confirmed', sub: 'Verified & Queued', icon: 'fa-file-invoice' },
      { step: 2, label: 'Packed & Ready', sub: 'Boxed & Sealed', icon: 'fa-box-archive' },
      { step: 3, label: 'Out for Delivery', sub: 'With Local Courier', icon: 'fa-truck-fast' },
      { step: 4, label: 'Delivered', sub: 'Handed to Customer', icon: 'fa-house-circle-check' }
    ];

    const progressWidth = ((currentStep - 1) / 3) * 100;

    return (
      <div className="modern-stepper-wrap">
        <div className="modern-stepper-bar">
          <div className="modern-stepper-fill" style={{ width: `${progressWidth}%` }}></div>
        </div>

        <div className="modern-stepper-milestones">
          {steps.map((st) => {
            const isCompleted = currentStep > st.step;
            const isCurrent = currentStep === st.step;
            const isPending = currentStep < st.step;

            return (
              <div
                key={st.step}
                className={`modern-milestone ${isCurrent ? 'is-active' : ''} ${isCompleted ? 'is-completed' : ''} ${isPending ? 'is-pending' : ''}`}
              >
                <div className="milestone-bubble">
                  {isCompleted ? (
                    <i className="fas fa-check"></i>
                  ) : (
                    <i className={`fas ${st.icon}`}></i>
                  )}
                  {isCurrent && <span className="milestone-pulse"></span>}
                </div>

                <div className="milestone-details">
                  <div className="milestone-title">{st.label}</div>
                  <div className="milestone-sub">{st.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!isClient) return null;

  return (
    <div className="profile-dashboard-layout">
      {/* =========================================================
          Top Hero Profile Card (Modern Slate-Dark Theme)
         ========================================================= */}
      <section className="profile-hero-card">
        <div className="profile-hero-left">
          <div className="profile-hero-avatar-box">
            <div className="profile-hero-avatar">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : <i className="fas fa-user"></i>}
            </div>
            <div className="profile-hero-avatar-pulse"></div>
          </div>

          <div className="profile-hero-meta">
            <div className="profile-hero-top-tags">
              <h1 className="profile-hero-fullname">{user?.name || 'Valued Reader'}</h1>
              <span className="profile-badge-vip">
                <i className="fas fa-crown"></i> VIP Member
              </span>
              <span className="profile-badge-verified">
                <i className="fas fa-circle-check"></i> Verified Account
              </span>
            </div>

            <div className="profile-hero-chips">
              <div className="profile-hero-chip">
                <i className="fas fa-envelope"></i>
                <span>{user?.email || 'Guest Explorer'}</span>
              </div>
              {user?.phone && (
                <div className="profile-hero-chip">
                  <i className="fas fa-phone"></i>
                  <span>{user.phone}</span>
                </div>
              )}
              <div className="profile-hero-chip">
                <i className="fas fa-calendar-days"></i>
                <span>Member since Nov 2026</span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-hero-actions">
          {user ? (
            <>
              <button
                type="button"
                className="btn-hero-action btn-hero-edit"
                onClick={() => setIsEditModalOpen(true)}
              >
                <i className="fas fa-user-pen"></i> Edit Profile
              </button>

              <button
                type="button"
                className="btn-hero-action btn-hero-logout"
                onClick={() => {
                  if (confirm(`Sign out from ${user.name || 'your account'}?`)) {
                    logout();
                  }
                }}
                title="Sign out of your account"
              >
                <i className="fas fa-arrow-right-from-bracket"></i> Sign Out
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link href="/login" className="btn-hero-action btn-hero-login">
                Sign In
              </Link>
              <Link href="/signup" className="btn-hero-action btn-hero-signup">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================
          Quick Bento KPI Cards Strip
         ========================================================= */}
      <section className="profile-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: '#ede9fe', color: '#4f46e5' }}>
            <i className="fas fa-receipt"></i>
          </div>
          <div>
            <div className="kpi-label">TOTAL ORDERS</div>
            <div className="kpi-number">{orders.length}</div>
            <div className="kpi-desc">Lifetime bookstore purchases</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>
            <i className="fas fa-truck-fast"></i>
          </div>
          <div>
            <div className="kpi-label">ACTIVE DELIVERIES</div>
            <div className="kpi-number" style={{ color: activeOrders.length > 0 ? '#d97706' : '#0f172a' }}>
              {activeOrders.length}
            </div>
            <div className="kpi-desc">
              {activeOrders.length > 0 ? 'Currently on the move' : 'All packages delivered'}
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: '#dcfce7', color: '#059669' }}>
            <i className="fas fa-wallet"></i>
          </div>
          <div>
            <div className="kpi-label">TOTAL INVESTMENT</div>
            <div className="kpi-number" style={{ color: '#059669' }}>
              ${totalSpent.toFixed(2)}
            </div>
            <div className="kpi-desc">Saved with free doorstep shipping</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: '#e0e7ff', color: '#3730a3' }}>
            <i className="fas fa-book-bookmark"></i>
          </div>
          <div>
            <div className="kpi-label">BOOKS ACQUIRED</div>
            <div className="kpi-number">{totalBooks}</div>
            <div className="kpi-desc">Personal library collection</div>
          </div>
        </div>
      </section>

      {/* =========================================================
          Main Content Split: 70% Left (Orders & Tracking) + 30% Right (Sidebar)
         ========================================================= */}
      <div className="profile-split-container">
        {/* Left Column: Orders & Package Tracker */}
        <div className="profile-main-col">
          {/* Controls Bar: Filter Chips & Search Box */}
          <div className="orders-toolbar-card">
            <div className="orders-filter-chips">
              <button
                type="button"
                className={`filter-chip-btn ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                All Orders ({orders.length})
              </button>

              <button
                type="button"
                className={`filter-chip-btn ${activeFilter === 'active' ? 'active' : ''}`}
                onClick={() => setActiveFilter('active')}
              >
                <i className="fas fa-truck-fast me-1" style={{ color: activeFilter === 'active' ? '#ffffff' : '#d97706' }}></i>
                In Transit ({activeOrders.length})
              </button>

              <button
                type="button"
                className={`filter-chip-btn ${activeFilter === 'delivered' ? 'active' : ''}`}
                onClick={() => setActiveFilter('delivered')}
              >
                <i className="fas fa-circle-check me-1" style={{ color: activeFilter === 'delivered' ? '#ffffff' : '#059669' }}></i>
                Delivered ({orders.filter((o) => (o.status || '').toLowerCase() === 'delivered').length})
              </button>

              <button
                type="button"
                className={`filter-chip-btn ${activeFilter === 'cancelled' ? 'active' : ''}`}
                onClick={() => setActiveFilter('cancelled')}
              >
                Cancelled ({orders.filter((o) => (o.status || '').toLowerCase() === 'cancelled').length})
              </button>
            </div>

            <div className="orders-search-box">
              <i className="fas fa-magnifying-glass"></i>
              <input
                type="text"
                placeholder="Search by order ID or book title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="btn-clear-search">
                  <i className="fas fa-xmark"></i>
                </button>
              )}
            </div>
          </div>

          {/* Loading Indicator */}
          {loadingOrders ? (
            <div className="orders-loading-state">
              <i className="fas fa-spinner fa-spin fa-2x" style={{ color: '#4f46e5' }}></i>
              <p>Fetching your shipment telemetry...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="orders-empty-state">
              <div className="empty-box-icon">
                <i className="fas fa-box-open"></i>
              </div>
              <h3>No Orders Found</h3>
              <p>
                {searchQuery
                  ? `No orders matching "${searchQuery}". Try a different keyword.`
                  : activeFilter !== 'all'
                  ? `You have no ${activeFilter} shipments right now.`
                  : 'You have not placed any orders yet. Explore our bestsellers and pay with Cash on Delivery!'}
              </p>
              <Link href="/" className="btn-explore-catalog">
                <i className="fas fa-book-open"></i> Explore Books
              </Link>
            </div>
          ) : (
            <div className="orders-list-stack">
              {filteredOrders.map((order) => {
                const isCod = order.paymentMethod === 'cod';
                const isLiveInTransit = order.status === 'processing' || order.status === 'shipped';
                const formattedDate = order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Recent';

                return (
                  <article
                    key={order._id || order.id || order.orderId}
                    className={`order-card-card ${isLiveInTransit ? 'is-active-shipment' : ''}`}
                  >
                    {/* Header Strip */}
                    <div className="order-header-strip">
                      <div className="order-header-left">
                        <div className="order-id-group">
                          <span className="order-id-code">
                            #{order.orderId || order._id?.slice(-8) || 'ORD'}
                          </span>

                          <button
                            type="button"
                            className="btn-copy-id"
                            onClick={() => handleCopy(order.orderId || order._id || '', 'id')}
                            title="Copy Order ID"
                          >
                            <i className={copiedId === (order.orderId || order._id) ? 'fas fa-check text-success' : 'far fa-copy'}></i>
                            <span>{copiedId === (order.orderId || order._id) ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>

                        <div className="order-timestamp">
                          <i className="far fa-clock"></i> Placed on {formattedDate}
                        </div>
                      </div>

                      <div className="order-header-right">
                        {isCod ? (
                          <span className="badge-cod-pill">
                            <i className="fas fa-hand-holding-dollar"></i> Cash on Delivery
                          </span>
                        ) : (
                          <span className="badge-card-pill">
                            <i className="fas fa-credit-card"></i> Card (Paid)
                          </span>
                        )}

                        <span
                          className={`badge-status-pill ${
                            order.status === 'delivered'
                              ? 'status-delivered'
                              : order.status === 'shipped'
                              ? 'status-shipped'
                              : order.status === 'cancelled'
                              ? 'status-cancelled'
                              : 'status-processing'
                          }`}
                        >
                          <i
                            className={
                              order.status === 'delivered'
                                ? 'fas fa-check-double'
                                : order.status === 'shipped'
                                ? 'fas fa-truck-fast'
                                : order.status === 'cancelled'
                                ? 'fas fa-ban'
                                : 'fas fa-box-archive'
                            }
                          ></i>
                          {order.status === 'delivered'
                            ? 'Delivered'
                            : order.status === 'shipped'
                            ? 'Out for Delivery'
                            : order.status === 'cancelled'
                            ? 'Cancelled'
                            : 'In Preparation'}
                        </span>
                      </div>
                    </div>

                    {/* Active Shipment Banner */}
                    {isLiveInTransit && (
                      <div className="active-shipment-banner">
                        <div className="live-pulse-indicator">
                          <span className="live-dot"></span>
                          <span>LIVE DISPATCH STATUS</span>
                        </div>
                        <div className="delivery-eta-badge">
                          <i className="fas fa-bolt"></i> Estimated Delivery: <b>Within 24 Hours</b>
                        </div>
                      </div>
                    )}

                    {/* Visual Stepper */}
                    <div className="order-stepper-section">
                      <StepperPipeline status={order.status} />
                    </div>

                    {/* Cash on Delivery Courier Notice */}
                    {isCod && isLiveInTransit && (
                      <div className="cod-courier-notice">
                        <div className="notice-icon">
                          <i className="fas fa-phone-volume"></i>
                        </div>
                        <div className="notice-body">
                          <div className="notice-title">Courier Handover Instructions</div>
                          <div className="notice-text">
                            Our delivery courier will call{' '}
                            <b>{order.phone || 'your phone number'}</b> prior to arrival. Please ensure{' '}
                            <b style={{ color: '#15803d' }}>${Number(order.amount).toFixed(2)}</b> in exact cash is ready upon handover.
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Destination & Meta Strip */}
                    <div className="order-meta-deck">
                      <div className="meta-tile">
                        <div className="tile-label">RECIPIENT</div>
                        <div className="tile-value">{order.customerName || order.cardName || 'Valued Reader'}</div>
                      </div>

                      <div className="meta-tile">
                        <div className="tile-label">CONTACT PHONE</div>
                        <div className="tile-value">
                          {order.phone ? (
                            <a href={`tel:${order.phone}`} className="phone-link">
                              <i className="fas fa-phone fa-xs me-1"></i> {order.phone}
                            </a>
                          ) : (
                            'Not specified'
                          )}
                        </div>
                      </div>

                      <div className="meta-tile">
                        <div className="tile-label">SHIPPING ADDRESS</div>
                        <div className="tile-value">
                          {order.shippingAddress?.address || order.address || 'Standard Delivery'}
                          {order.shippingAddress?.city ? `, ${order.shippingAddress.city}` : ''}
                        </div>
                      </div>

                      <div className="meta-tile">
                        <div className="tile-label">TOTAL AMOUNT</div>
                        <div className="tile-value value-price">${Number(order.amount).toFixed(2)}</div>
                      </div>
                    </div>

                    {/* Package Books Items Preview */}
                    {order.items && order.items.length > 0 && (
                      <div className="order-items-deck">
                        <div className="items-deck-heading">
                          <span>Package Items ({order.items.length})</span>
                          <span className="items-sub-total">
                            Subtotal: ${(Number(order.amount)).toFixed(2)}
                          </span>
                        </div>

                        <div className="items-scroll-row">
                          {order.items.map((book, idx) => (
                            <div key={idx} className="book-item-pill">
                              <img src={book.image} alt={book.title} />
                              <div className="book-pill-info">
                                <div className="book-pill-title" title={book.title}>
                                  {book.title}
                                </div>
                                <div className="book-pill-pricing">
                                  <span>Qty: <b>{book.quantity || 1}</b></span>
                                  <span>&bull;</span>
                                  <span>${(Number(book.price) * Number(book.quantity || 1)).toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Card Footer Actions */}
                    <div className="order-card-footer">
                      <div className="footer-left-info">
                        <i className="fas fa-shield-halved text-success me-1"></i> Guaranteed Safe Delivery
                      </div>

                      <div className="footer-actions-group">
                        <button
                          type="button"
                          className="btn-order-action btn-refresh-act"
                          onClick={() => fetchOrders(true)}
                          title="Sync status with bookstore warehouse"
                        >
                          <i className="fas fa-arrows-rotate"></i> Sync
                        </button>

                        <button
                          type="button"
                          className="btn-order-action btn-invoice-act"
                          onClick={() => setInvoiceOrder(order)}
                        >
                          <i className="fas fa-file-invoice"></i> Receipt
                        </button>

                        <button
                          type="button"
                          className="btn-order-action btn-reorder-act"
                          onClick={() => handleReorder(order)}
                        >
                          <i className="fas fa-arrow-rotate-right"></i> Buy Again
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Premium Sidebar Widgets */}
        <aside className="profile-sidebar-col">
          {/* Widget 1: VIP Reading Club & Coupon */}
          <div className="sidebar-widget-card loyalty-widget">
            <div className="widget-header">
              <div className="widget-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
                <i className="fas fa-gem"></i>
              </div>
              <div>
                <h3 className="widget-title">Bookworm Club</h3>
                <p className="widget-subtitle">VIP Reader Rewards</p>
              </div>
            </div>

            <div className="loyalty-progress-box">
              <div className="loyalty-progress-labels">
                <span>Next Milestone Reward</span>
                <b>{totalBooks >= 5 ? 'Unlocked!' : `${totalBooks} / 5 Books`}</b>
              </div>
              <div className="loyalty-bar">
                <div
                  className="loyalty-bar-fill"
                  style={{ width: `${Math.min(100, (totalBooks / 5) * 100)}%` }}
                ></div>
              </div>
              <div className="loyalty-hint">
                {totalBooks >= 5
                  ? 'Congratulations! You qualify for VIP tier perks.'
                  : `Order ${Math.max(0, 5 - totalBooks)} more book(s) to unlock an extra $10 gift voucher.`}
              </div>
            </div>

            <div className="promo-voucher-box">
              <div className="voucher-left">
                <div className="voucher-tag">PROMO CODE</div>
                <div className="voucher-code">READMORE15</div>
              </div>
              <button
                type="button"
                className="btn-copy-voucher"
                onClick={() => handleCopy('READMORE15', 'promo')}
              >
                {copiedPromo ? (
                  <>
                    <i className="fas fa-check text-success"></i> Copied
                  </>
                ) : (
                  <>
                    <i className="far fa-copy"></i> Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Widget 2: Default Shipping Destination */}
          <div className="sidebar-widget-card">
            <div className="widget-header">
              <div className="widget-icon" style={{ background: '#ede9fe', color: '#4f46e5' }}>
                <i className="fas fa-location-dot"></i>
              </div>
              <div>
                <h3 className="widget-title">Delivery Destination</h3>
                <p className="widget-subtitle">Default Shipping Details</p>
              </div>
            </div>

            <div className="address-display-box">
              <div className="address-name">{user?.name || 'Valued Customer'}</div>
              <div className="address-street">
                {user?.address || '124 Market St, Suite 500'}
              </div>
              <div className="address-city">
                {user?.city || 'San Francisco, CA'}
              </div>
              {user?.phone && (
                <div className="address-phone">
                  <i className="fas fa-phone fa-xs me-1"></i> {user.phone}
                </div>
              )}
            </div>

            <button
              type="button"
              className="btn-widget-link"
              onClick={() => setIsEditModalOpen(true)}
            >
              <i className="fas fa-pen-to-square me-1"></i> Edit Address &amp; Contact
            </button>
          </div>

          {/* Widget 3: Quick Package Tracker (Lookup any Order ID) */}
          <div className="sidebar-widget-card">
            <div className="widget-header">
              <div className="widget-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                <i className="fas fa-barcode"></i>
              </div>
              <div>
                <h3 className="widget-title">Quick Package Lookup</h3>
                <p className="widget-subtitle">Track any order instantly</p>
              </div>
            </div>

            <form onSubmit={handleQuickTrack} className="quick-track-form">
              <input
                type="text"
                placeholder="Enter Order ID (e.g. ORD-777888)..."
                value={quickTrackInput}
                onChange={(e) => setQuickTrackInput(e.target.value)}
                required
              />
              <button type="submit" disabled={quickTrackLoading} className="btn-quick-track-submit">
                {quickTrackLoading ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-magnifying-glass"></i>
                )}
              </button>
            </form>

            {quickTrackError && (
              <div className="quick-track-error">
                <i className="fas fa-circle-exclamation me-1"></i> {quickTrackError}
              </div>
            )}

            {quickTrackResult && (
              <div className="quick-track-popup-card">
                <div className="popup-top">
                  <span className="popup-id">#{quickTrackResult.orderId || quickTrackResult._id?.slice(-8)}</span>
                  <span className="popup-status">{quickTrackResult.status || 'Processing'}</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
                  Total: <b>${Number(quickTrackResult.amount).toFixed(2)}</b> &bull; {quickTrackResult.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card'}
                </div>
                <button
                  type="button"
                  className="btn-view-quick-order"
                  onClick={() => {
                    setInvoiceOrder(quickTrackResult);
                  }}
                >
                  View Details &rarr;
                </button>
              </div>
            )}
          </div>

          {/* Widget 4: Courier Support Helpline */}
          <div className="sidebar-widget-card support-widget">
            <div className="widget-header">
              <div className="widget-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                <i className="fas fa-headset"></i>
              </div>
              <div>
                <h3 className="widget-title">Courier Assistance</h3>
                <p className="widget-subtitle">Need Help with Delivery?</p>
              </div>
            </div>

            <p style={{ fontSize: '0.86rem', color: '#64748b', lineHeight: '1.5', margin: '8px 0 14px' }}>
              Have questions about your Cash on Delivery package or courier arrival time? Our concierge team is available 24/7.
            </p>

            <a href="mailto:support@bookstore.com" className="btn-support-contact">
              <i className="fas fa-envelope"></i> Contact Dispatch Support
            </a>
          </div>
        </aside>
      </div>

      {/* =========================================================
          MODAL 1: Edit Profile & Shipping Preferences
         ========================================================= */}
      {isEditModalOpen && (
        <div className="modal-backdrop-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-box-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-box-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="modal-icon-badge">
                  <i className="fas fa-user-gear"></i>
                </div>
                <div>
                  <h3 className="modal-title">Account Preferences</h3>
                  <p className="modal-subtitle">Update contact phone and default delivery address</p>
                </div>
              </div>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setIsEditModalOpen(false)}
              >
                <i className="fas fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="modal-form-body">
              <div className="form-group-custom">
                <label className="form-label-custom">Full Name</label>
                <input
                  type="text"
                  required
                  className="form-control-custom"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Gamal Ahmed"
                />
              </div>

              <div className="form-group-custom">
                <label className="form-label-custom">Contact Phone (Required for Cash on Delivery)</label>
                <input
                  type="tel"
                  className="form-control-custom"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="e.g. +20 1012345678"
                />
              </div>

              <div className="form-group-custom">
                <label className="form-label-custom">Default Delivery Address</label>
                <input
                  type="text"
                  className="form-control-custom"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Street, building, apartment number"
                />
              </div>

              <div className="form-group-custom">
                <label className="form-label-custom">City &amp; Region</label>
                <input
                  type="text"
                  className="form-control-custom"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  placeholder="e.g. Cairo / San Francisco, CA"
                />
              </div>

              <div className="modal-actions-bar">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn-modal-save"
                >
                  {savingProfile ? (
                    <>
                      <i className="fas fa-spinner fa-spin me-1"></i> Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check me-1"></i> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: Receipt / Invoice Modal
         ========================================================= */}
      {invoiceOrder && (
        <div className="modal-backdrop-overlay" onClick={() => setInvoiceOrder(null)}>
          <div className="invoice-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="invoice-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="logo-icon-box" style={{ width: '38px', height: '38px', fontSize: '1.2rem' }}>
                  <i className="fas fa-book-open"></i>
                </div>
                <div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a' }}>
                    Book<span style={{ color: '#4f46e5' }}>Store</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Official Order Receipt</div>
                </div>
              </div>

              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setInvoiceOrder(null)}
              >
                <i className="fas fa-xmark"></i>
              </button>
            </div>

            <div className="invoice-meta-banner">
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>ORDER REFERENCE</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#4f46e5', fontFamily: 'monospace' }}>
                  #{invoiceOrder.orderId || invoiceOrder._id?.slice(-8)}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>ORDER DATE</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
                  {invoiceOrder.createdAt ? new Date(invoiceOrder.createdAt).toLocaleDateString() : 'Recent'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>PAYMENT METHOD</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: invoiceOrder.paymentMethod === 'cod' ? '#059669' : '#0f172a' }}>
                  {invoiceOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Credit Card (Paid)'}
                </div>
              </div>
            </div>

            <div className="invoice-billing-info">
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '4px' }}>BILLED TO:</div>
                <div style={{ fontWeight: 800, color: '#0f172a' }}>{invoiceOrder.customerName || invoiceOrder.cardName}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{invoiceOrder.phone}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{invoiceOrder.customerEmail}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '4px' }}>DELIVER TO:</div>
                <div style={{ fontSize: '0.85rem', color: '#334155', maxWidth: '240px' }}>
                  {invoiceOrder.shippingAddress?.address || invoiceOrder.address}
                  {invoiceOrder.shippingAddress?.city ? `, ${invoiceOrder.shippingAddress.city}` : ''}
                </div>
              </div>
            </div>

            <div className="invoice-table-wrap">
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Unit Price</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(invoiceOrder.items || []).map((it, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{it.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{it.category || 'Curated Book'}</div>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>{it.quantity || 1}</td>
                      <td style={{ textAlign: 'right' }}>${Number(it.price).toFixed(2)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 800 }}>
                        ${(Number(it.price) * Number(it.quantity || 1)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="invoice-totals-box">
              <div className="totals-row">
                <span>Subtotal</span>
                <span>${Number(invoiceOrder.amount).toFixed(2)}</span>
              </div>
              <div className="totals-row">
                <span>Doorstep Courier Shipping</span>
                <span style={{ color: '#059669', fontWeight: 700 }}>FREE</span>
              </div>
              <div className="totals-row grand-total">
                <span>Total Amount Due</span>
                <span>${Number(invoiceOrder.amount).toFixed(2)}</span>
              </div>
            </div>

            <div className="invoice-footer-actions">
              <button
                type="button"
                className="btn-print-invoice"
                onClick={() => window.print()}
              >
                <i className="fas fa-print me-1"></i> Print Receipt
              </button>
              <button
                type="button"
                className="btn-close-invoice"
                onClick={() => setInvoiceOrder(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
