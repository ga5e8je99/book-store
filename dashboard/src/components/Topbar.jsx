'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export default function Topbar() {
  const pathname = usePathname();

  const getPageTitle = () => {
    switch (pathname) {
      case '/': return { title: 'Dashboard Overview', icon: 'fa-chart-pie' };
      case '/books': return { title: 'Books Catalog Management', icon: 'fa-book' };
      case '/orders': return { title: 'Orders & Sales Transactions', icon: 'fa-shopping-cart' };
      case '/users': return { title: 'Registered Customers', icon: 'fa-users' };
      case '/settings': return { title: 'Store Settings & Promo Codes', icon: 'fa-sliders-h' };
      default: return { title: 'Admin Console', icon: 'fa-tachometer-alt' };
    }
  };

  const current = getPageTitle();

  return (
    <header className="dashboard-topbar">
      <div className="topbar-title-area">
        <h2>
          <i className={`fas ${current.icon}`} style={{ color: '#4f46e5' }}></i>
          {current.title}
        </h2>
      </div>

      <div className="topbar-actions">
        {/* Live Sync Status */}
        <div className="live-indicator">
          <span className="pulse-dot-green"></span>
          <span>Store Sync Active</span>
        </div>

        {/* Admin User Profile */}
        <div className="admin-avatar-box">
          <div className="admin-avatar">AD</div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff' }}>Store Manager</div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Super Administrator</div>
          </div>
        </div>
      </div>
    </header>
  );
}

