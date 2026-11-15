'use client';

import React, { useState, useEffect } from 'react';

export default function OrdersSalesPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

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

  const handleDeleteOrder = async (orderId) => {
    if (confirm(`Are you sure you want to permanently delete order #${orderId.slice(-6)}? This action cannot be undone.`)) {
      try {
        const res = await fetch(`http://localhost:3000/api/orders?id=${orderId}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          showToast(`Order #${orderId.slice(-6)} deleted successfully!`);
          setOrders((prev) => prev.filter((o) => o._id !== orderId && o.id !== orderId && o.orderId !== orderId));
        } else {
          alert('Failed to delete order');
        }
      } catch (e) {
        alert('Network error while deleting order');
      }
    }
  };

  const handleClearTestOrders = async () => {
    if (confirm('Are you sure you want to delete all legacy test transactions and keep only real customer orders with items?')) {
      try {
        const res = await fetch('http://localhost:3000/api/orders', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'clear_tests' })
        });
        const data = await res.json();
        if (res.ok) {
          showToast(data.message || 'Cleaned test orders!');
          fetchOrders();
          setSelectedIds([]);
        } else {
          alert('Failed to clean test orders');
        }
      } catch (e) {
        alert('Network error');
      }
    }
  };

  const toggleSelectOrder = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredOrders.map((o) => o._id || o.id || o.orderId));
    } else {
      setSelectedIds([]);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to permanently delete ${selectedIds.length} selected orders?`)) {
      try {
        const res = await fetch('http://localhost:3000/api/orders', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedIds })
        });
        if (res.ok) {
          showToast(`Deleted ${selectedIds.length} selected orders successfully!`);
          setOrders((prev) =>
            prev.filter(
              (o) =>
                !selectedIds.includes(o._id) &&
                !selectedIds.includes(o.id) &&
                !selectedIds.includes(o.orderId)
            )
          );
          setSelectedIds([]);
        } else {
          alert('Failed to delete selected orders');
        }
      } catch (e) {
        alert('Network error while deleting orders');
      }
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

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handleClearTestOrders}
              style={{
                background: '#dc2626',
                color: '#ffffff',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Delete dummy test orders and keep only real orders"
            >
              <i className="fas fa-trash-alt"></i> Clean Test Orders
            </button>
            <button type="button" className="btn-primary-admin" onClick={fetchOrders}>
              <i className="fas fa-sync-alt"></i> Refresh Log
            </button>
          </div>
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
          <div>
            {selectedIds.length > 0 && (
              <div style={{
                background: '#1e293b',
                border: '1px solid #4f46e5',
                padding: '10px 16px',
                borderRadius: '8px',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600 }}>
                  <i className="fas fa-check-square" style={{ color: '#818cf8' }}></i>
                  <span>{selectedIds.length} order{selectedIds.length > 1 ? 's' : ''} selected</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    style={{
                      background: '#dc2626',
                      color: '#ffffff',
                      border: 'none',
                      padding: '7px 14px',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <i className="fas fa-trash-alt"></i> Delete Selected ({selectedIds.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedIds([])}
                    style={{
                      background: 'transparent',
                      color: '#94a3b8',
                      border: '1px solid #475569',
                      padding: '7px 12px',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            )}

            <div className="data-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={filteredOrders.length > 0 && selectedIds.length === filteredOrders.length}
                        onChange={handleSelectAll}
                        style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#4f46e5' }}
                        title="Select All"
                      />
                    </th>
                    <th>Order Reference</th>
                    <th>Customer Name</th>
                    <th>Payment Type</th>
                    <th>Card Mask / Method</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Update Status</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((ord) => {
                    const isCod = ord.paymentMethod === 'cod';
                    const ordKey = ord._id || ord.id || ord.orderId;
                    const isSelected = selectedIds.includes(ordKey);
                    return (
                      <tr
                        key={ordKey}
                        style={{ background: isSelected ? 'rgba(79, 70, 229, 0.12)' : 'transparent' }}
                      >
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOrder(ordKey)}
                            style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#4f46e5' }}
                          />
                        </td>
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
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleDeleteOrder(ord._id || ord.id || ord.orderId)}
                          title="Delete this order permanently"
                          style={{
                            background: 'transparent',
                            border: '1px solid #ef4444',
                            color: '#ef4444',
                            borderRadius: '6px',
                            padding: '5px 10px',
                            cursor: 'pointer',
                            fontSize: '0.82rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <i className="fas fa-trash-alt"></i> Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

