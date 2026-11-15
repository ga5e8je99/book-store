'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AnalyticsCharts from '../components/AnalyticsCharts';

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState({
    revenue: 0,
    ordersCount: 0,
    booksCount: 0,
    usersCount: 0
  });
  const [rawOrders, setRawOrders] = useState([]);
  const [rawBooks, setRawBooks] = useState([]);
  const [rawUsers, setRawUsers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [ordersRes, booksRes, usersRes] = await Promise.all([
          fetch('http://localhost:3000/api/orders').then((r) => r.json()),
          fetch('http://localhost:3000/api/books').then((r) => r.json()),
          fetch('http://localhost:3000/api/users').then((r) => r.json())
        ]);

        const orders = ordersRes.data?.orders || [];
        const books = booksRes.data?.books || [];
        const users = usersRes.data?.users || [];

        setRawOrders(orders);
        setRawBooks(books);
        setRawUsers(users);

        const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

        setStats({
          revenue: totalRevenue,
          ordersCount: orders.length,
          booksCount: books.length,
          usersCount: users.length
        });

        setRecentOrders(orders.slice(-5).reverse());
      } catch (e) {
        console.error('Failed to fetch dashboard data:', e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch('http://localhost:3000/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus })
      });
      if (res.ok) {
        setRecentOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (e) {
      alert('Failed to update status');
    }
  };

  return (
    <div>
      {/* KPI Stat Cards Grid */}
      <div className="stat-cards-grid">
        <div className="stat-card">
          <div className="stat-card-info">
            <h5>Total Revenue</h5>
            <div className="stat-card-value">${stats.revenue.toFixed(2)}</div>
            <div className="stat-card-change positive">
              <i className="fas fa-arrow-up"></i> +18.4% from last month
            </div>
          </div>
          <div className="stat-card-icon icon-emerald">
            <i className="fas fa-dollar-sign"></i>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-info">
            <h5>Completed Orders</h5>
            <div className="stat-card-value">{stats.ordersCount}</div>
            <div className="stat-card-change positive">
              <i className="fas fa-arrow-up"></i> +12 new this week
            </div>
          </div>
          <div className="stat-card-icon icon-indigo">
            <i className="fas fa-shopping-bag"></i>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-info">
            <h5>Active Titles</h5>
            <div className="stat-card-value">{stats.booksCount}</div>
            <div className="stat-card-change neutral">
              <i className="fas fa-book"></i> In stock &amp; catalogued
            </div>
          </div>
          <div className="stat-card-icon icon-amber">
            <i className="fas fa-layer-group"></i>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-info">
            <h5>Registered Readers</h5>
            <div className="stat-card-value">{stats.usersCount}</div>
            <div className="stat-card-change positive">
              <i className="fas fa-arrow-up"></i> +4 signed up today
            </div>
          </div>
          <div className="stat-card-icon icon-rose">
            <i className="fas fa-users"></i>
          </div>
        </div>
      </div>

      {/* Annual Revenue, Users Growth & Best Sellers Analytics */}
      <AnalyticsCharts orders={rawOrders} books={rawBooks} users={rawUsers} />

      {/* Main Panel: Recent Orders */}
      <div className="panel-card">
        <div className="panel-header">
          <h3 className="panel-title">
            <i className="fas fa-receipt text-primary" style={{ color: '#4f46e5' }}></i>
            Recent Store Orders
          </h3>
          <Link href="/orders" className="btn-primary-admin" style={{ textDecoration: 'none' }}>
            View All Orders &rarr;
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <i className="fas fa-spinner fa-spin fa-2x"></i>
          </div>
        ) : recentOrders.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
            No recent orders recorded yet.
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Card Mask</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((ord) => (
                  <tr key={ord._id || ord.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#818cf8' }}>
                      #{ord._id?.slice(-6) || 'ORD'}
                    </td>
                    <td style={{ fontWeight: 600 }}>{ord.cardName || 'Customer'}</td>
                    <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{ord.cardNumber}</td>
                    <td style={{ fontWeight: 800, color: '#34d399' }}>${Number(ord.amount).toFixed(2)}</td>
                    <td>
                      <span className={`badge-status ${ord.status === 'success' || ord.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                        {ord.status || 'success'}
                      </span>
                    </td>
                    <td>
                      <select
                        value={ord.status || 'success'}
                        onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                        style={{
                          background: '#1e293b',
                          border: '1px solid #334155',
                          color: '#ffffff',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="success">Success</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Launchpad & Store Links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <div className="panel-card" style={{ marginBottom: 0 }}>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '12px' }}>
            <i className="fas fa-plus-circle me-2" style={{ color: '#4f46e5', marginRight: '8px' }}></i>
            Quick Add Book
          </h4>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '16px' }}>
            Add a new title, price, and category directly to the live customer catalog.
          </p>
          <Link href="/books" className="btn-primary-admin" style={{ display: 'inline-flex' }}>
            Open Books Catalog
          </Link>
        </div>

        <div className="panel-card" style={{ marginBottom: 0 }}>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '12px' }}>
            <i className="fas fa-tags me-2" style={{ color: '#059669', marginRight: '8px' }}></i>
            Promotions &amp; Codes
          </h4>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '16px' }}>
            Manage discount codes (e.g. BOOK20) and update the main store announcement.
          </p>
          <Link href="/settings" className="btn-primary-admin" style={{ background: '#059669' }}>
            Manage Promos
          </Link>
        </div>
      </div>
    </div>
  );
}

