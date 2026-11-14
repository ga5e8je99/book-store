'use client';

import React, { useState, useEffect } from 'react';

export default function OrdersSalesPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/api/orders');
      const data = await res.json();
      setOrders(data.data?.orders || []);
    } catch (e) {
      console.error('Failed to load orders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch('http://localhost:3000/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus })
      });
      if (res.ok) {
        showToast(`Order #${orderId.slice(-6)} marked as ${newStatus}!`);
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId || o.id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
  const avgOrder = orders.length > 0 ? totalRevenue / orders.length : 0;

  const filteredOrders = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchesSearch =
      (o._id || '').toLowerCase().includes(q) ||
      (o.cardName || '').toLowerCase().includes(q) ||
      (o.cardNumber || '').includes(q);
    const matchesStatus =
      statusFilter === 'All' ||
      (o.status || 'success').toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {toastMessage && (
        <div className="admin-toast">
          <i className="fas fa-check-circle" style={{ color: '#34d399' }}></i>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Summary KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
        <div className="stat-card" style={{ padding: '1.2rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>TOTAL ORDERS</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>{orders.length}</div>
          </div>
          <i className="fas fa-shopping-bag fa-2x" style={{ color: '#818cf8', opacity: 0.5 }}></i>
        </div>

        <div className="stat-card" style={{ padding: '1.2rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>TOTAL REVENUE</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399' }}>${totalRevenue.toFixed(2)}</div>
          </div>
          <i className="fas fa-dollar-sign fa-2x" style={{ color: '#34d399', opacity: 0.5 }}></i>
        </div>

        <div className="stat-card" style={{ padding: '1.2rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>AVG. ORDER VALUE</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24' }}>${avgOrder.toFixed(2)}</div>
          </div>
          <i className="fas fa-chart-line fa-2x" style={{ color: '#fbbf24', opacity: 0.5 }}></i>
        </div>
      </div>

      {/* Orders Table Panel */}
      <div className="panel-card">
        <div className="panel-header">
          <h3 className="panel-title">
            <i className="fas fa-clipboard-list text-primary" style={{ color: '#4f46e5' }}></i>
            Customer Orders Log
          </h3>

          <button type="button" className="btn-primary-admin" onClick={fetchOrders}>
            <i className="fas fa-sync-alt"></i> Refresh Log
          </button>
        </div>

        {/* Filter bar */}
        <div className="filter-bar">
          <input
            type="text"
            className="search-input-admin"
            placeholder="Search by customer, order ID, or card..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="category-select-admin"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="success">Success</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <i className="fas fa-spinner fa-spin fa-2x"></i>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
            No orders match your filter criteria.
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Customer Name</th>
                  <th>Payment Type</th>
                  <th>Card Mask / Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((ord) => {
                  const isCod = ord.paymentMethod === 'cod';
                  return (
                    <tr key={ord._id || ord.id || ord.orderId}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 800, color: '#818cf8' }}>
                        {ord.orderId ? `#${ord.orderId}` : `#${ord._id?.slice(-8) || 'ORD'}`}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#ffffff' }}>
                          {ord.customerName || ord.cardName || 'Valued Customer'}
                        </div>
                        {ord.phone && (
                          <div style={{ fontSize: '0.75rem', color: '#38bdf8' }}>
                            <i className="fas fa-phone-alt me-1"></i> {ord.phone}
                          </div>
                        )}
                        {(ord.shippingAddress?.address || ord.address) && (
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <i className="fas fa-map-marker-alt me-1"></i> {ord.shippingAddress?.address || ord.address}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`badge-status ${isCod ? 'badge-success' : 'badge-indigo'}`}>
                          {isCod ? 'Cash on Delivery (COD)' : (ord.paymentMethod || 'Credit Card')}
                        </span>
                      </td>
                      <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                        {isCod ? 'Cash Payment to Courier' : (ord.cardNumber || 'Standard')}
                      </td>
                      <td style={{ fontWeight: 800, color: '#34d399', fontSize: '1rem' }}>
                        ${Number(ord.amount).toFixed(2)}
                      </td>
                      <td>
                        <span className={`badge-status ${
                          ord.status === 'delivered' || ord.status === 'success' || ord.status === 'completed'
                            ? 'badge-success'
                            : ord.status === 'shipped'
                            ? 'badge-info'
                            : ord.status === 'cancelled'
                            ? 'badge-danger'
                            : 'badge-warning'
                        }`}>
                          {ord.status || 'processing'}
                        </span>
                      </td>
                      <td>
                        <select
                          value={ord.status || 'processing'}
                          onChange={(e) => handleStatusChange(ord._id || ord.id || ord.orderId, e.target.value)}
                          style={{
                            background: '#1e293b',
                            border: '1px solid #334155',
                            color: '#ffffff',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontSize: '0.82rem',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped (Out for Delivery)</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

