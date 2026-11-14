'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Overview', icon: 'fa-chart-pie' },
    { href: '/books', label: 'Books Catalog', icon: 'fa-book' },
    { href: '/orders', label: 'Orders & Sales', icon: 'fa-shopping-cart' },
    { href: '/users', label: 'Customers', icon: 'fa-users' },
    { href: '/settings', label: 'Store & Promos', icon: 'fa-sliders-h' }
  ];

  return (
    <aside className="dashboard-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-icon-box">
          <i className="fas fa-book-open"></i>
        </div>
        <div className="brand-text">
          Book<span>Store</span>
        </div>
        <span className="brand-badge">ADMIN</span>
      </div>

      {/* Navigation Links */}
      <ul className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href} className="sidebar-nav-item">
              <Link href={item.href} className={`nav-link ${isActive ? 'active' : ''}`}>
                <i className={`fas ${item.icon} nav-icon`}></i>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Footer Link to Public Store */}
      <div className="sidebar-footer">
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="store-live-btn"
          title="Open live customer store"
        >
          <span><i className="fas fa-external-link-alt me-2" style={{ marginRight: '6px' }}></i> Live Store</span>
          <i className="fas fa-arrow-right"></i>
        </a>
      </div>
    </aside>
  );
}

