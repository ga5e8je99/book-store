'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { allBooks } from '../data/books';

export default function Navbar() {
  const pathname = usePathname();
  const { totalCount, cartShaking, openModal } = useCart();
  const { user, isClient, logout } = useAuth();
  
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
    setShowDropdown(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (!q.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    const matches = allBooks.filter(
      (b) =>
        b.title.toLowerCase().includes(q.toLowerCase()) ||
        b.category.toLowerCase().includes(q.toLowerCase())
    );
    setSuggestions(matches);
    setShowDropdown(true);
  };

  const navLinks = [
    { href: '/', label: 'Home', icon: 'fa-home' },
    { href: '/story', label: 'Novels', icon: 'fa-book' },
    { href: '/science', label: 'Science', icon: 'fa-flask' },
    { href: '/bestsaller', label: 'Best Sellers', icon: 'fa-fire' },
    { href: '/newbook', label: 'New Releases', icon: 'fa-sparkles' },
  ];

  return (
    <>
      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-inner">
          {/* Mobile Hamburger Toggle (Left on mobile) */}
          <button
            type="button"
            className="mobile-hamburger-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            <span className={`hamburger-bar ${isMobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-bar ${isMobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-bar ${isMobileMenuOpen ? 'open' : ''}`}></span>
          </button>

          {/* Brand Logo */}
          <Link href="/" className="logo-wrapper">
            <div className="logo-icon-box">
              <i className="fas fa-book-open"></i>
            </div>
            <h1 className="logo-text">Book<span>Store</span></h1>
          </Link>

          {/* Desktop Navigation Menu (hidden on mobile) */}
          <ul className="nav-menu">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href} className="nav-item">
                  <Link href={link.href} className={`nav-link ${isActive ? 'active' : ''}`}>
                    <i className={`fas ${link.icon}`}></i> {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Desktop Live Search with Autocomplete */}
          <div className="search-container d-desktop-only" ref={searchRef}>
            <div className="search-input-wrapper">
              <svg className="search_icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <path d="M46.599 46.599a4.498 4.498 0 0 1-6.363 0l-7.941-7.941C29.028 40.749 25.167 42 21 42 9.402 42 0 32.598 0 21S9.402 0 21 0s21 9.402 21 21c0 4.167-1.251 8.028-3.342 11.295l7.941 7.941a4.498 4.498 0 0 1 0 6.363zM21 6C12.717 6 6 12.714 6 21s6.717 15 15 15c8.286 0 15-6.714 15-15S29.286 6 21 6z"/>
              </svg>
              <input
                type="text"
                placeholder="Search books, authors, genres..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchQuery.trim() && setShowDropdown(true)}
              />
            </div>

            {showDropdown && (
              <div className="suggestions-dropdown">
                {suggestions.length === 0 ? (
                  <div style={{ padding: '14px', color: '#64748b', fontSize: '0.88rem', textAlign: 'center' }}>
                    <i className="fas fa-search me-1"></i> No books found matching &quot;<b>{searchQuery}</b>&quot;
                  </div>
                ) : (
                  <ul>
                    {suggestions.slice(0, 6).map((book) => (
                      <li key={book.id || book.title}>
                        <button
                          type="button"
                          onClick={() => {
                            openModal(book);
                            setShowDropdown(false);
                            setSearchQuery('');
                          }}
                        >
                          <img src={book.image} alt={book.title} />
                          <div className="suggestion-info">
                            <span className="suggestion-title">{book.title}</span>
                            <span className="suggestion-price">${book.price} &bull; {book.category}</span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Header Right Actions */}
          <div className="header-actions">
            {/* Mobile Search Toggle Button (visible only on mobile) */}
            <button
              type="button"
              className="header-icon-btn d-mobile-only"
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              title="Search"
              aria-label="Toggle Mobile Search"
            >
              <i className={`fas ${isMobileSearchOpen ? 'fa-times' : 'fa-search'}`}></i>
            </button>

            {/* Shopping Cart Icon */}
            <div className="cart-btn-wrapper">
              <Link
                href="/shop"
                id="headerCartBtn"
                className={`header-icon-btn ${cartShaking ? 'cart-animate-shake' : ''}`}
                title="View Shopping Cart"
              >
                <i className="fas fa-shopping-bag"></i>
                {isClient && totalCount > 0 && (
                  <span className="cart-badge">{totalCount}</span>
                )}
              </Link>
            </div>

            {/* User Auth Buttons or Profile Pill */}
            {isClient && user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link
                  href="/profile"
                  className="user-profile-pill d-desktop-only"
                  title="View Profile & Track Orders"
                  style={{ textDecoration: 'none' }}
                >
                  <i className="fas fa-user-circle"></i>
                  <span>{user.name || 'Profile'}</span>
                </Link>
                <button
                  type="button"
                  className="header-icon-btn d-desktop-only"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    color: '#ef4444',
                    border: '1px solid #fee2e2',
                    background: '#fef2f2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    if (confirm(`Sign out from ${user.name || 'your account'}?`)) {
                      logout();
                    }
                  }}
                  title="Sign Out"
                >
                  <i className="fas fa-sign-out-alt"></i>
                </button>
              </div>
            ) : (
              <div className="auth-buttons-desktop d-desktop-only">
                <Link href="/login" className="user-auth-btn">Log In</Link>
                <Link href="/signup" className="user-auth-btn btn-solid">Sign Up</Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Expandable Bar */}
        {isMobileSearchOpen && (
          <div className="mobile-search-bar" ref={mobileSearchRef}>
            <div className="mobile-search-input-box">
              <i className="fas fa-search" style={{ color: '#64748b' }}></i>
              <input
                type="text"
                autoFocus
                placeholder="Search titles, authors, categories..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', color: '#94a3b8' }}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>

            {searchQuery.trim() && (
              <div className="mobile-search-results">
                {suggestions.length === 0 ? (
                  <div style={{ padding: '12px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                    No results for &quot;<b>{searchQuery}</b>&quot;
                  </div>
                ) : (
                  suggestions.slice(0, 5).map((book) => (
                    <div
                      key={book.id || book.title}
                      className="mobile-search-item"
                      onClick={() => {
                        openModal(book);
                        setIsMobileSearchOpen(false);
                        setSearchQuery('');
                      }}
                    >
                      <img src={book.image} alt={book.title} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>{book.title}</div>
                        <div style={{ fontSize: '0.78rem', color: '#4f46e5', fontWeight: 600 }}>
                          ${book.price} &bull; {book.category}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </header>

      {/* ================= Mobile Slide-Out Drawer ================= */}
      <div
        className={`mobile-nav-backdrop ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <aside className={`mobile-nav-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
        {/* Drawer Header */}
        <div className="mobile-drawer-header">
          <Link href="/" className="logo-wrapper" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="logo-icon-box" style={{ width: '34px', height: '34px', fontSize: '1.1rem' }}>
              <i className="fas fa-book-open"></i>
            </div>
            <h2 className="logo-text" style={{ fontSize: '1.25rem' }}>Book<span>Store</span></h2>
          </Link>

          <button
            type="button"
            className="mobile-drawer-close-btn"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close Menu"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Drawer Links */}
        <div className="mobile-drawer-body">
          <div className="mobile-nav-group-label">Navigation</div>
          <ul className="mobile-nav-list">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <i className={`fas ${link.icon} mobile-nav-icon`}></i>
                    <span>{link.label}</span>
                    <i className="fas fa-chevron-right mobile-nav-arrow"></i>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mobile-nav-group-label" style={{ marginTop: '1.5rem' }}>Shopping Bag</div>
          <Link
            href="/shop"
            className="mobile-cart-preview-card"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="mobile-cart-icon-circle">
                <i className="fas fa-shopping-bag"></i>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>My Shopping Bag</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  {totalCount > 0 ? `${totalCount} item(s) selected` : 'Cart is empty'}
                </div>
              </div>
            </div>
            <span className="mobile-cart-count-badge">{totalCount}</span>
          </Link>
        </div>

        {/* Drawer Footer / User Account */}
        <div className="mobile-drawer-footer">
          {isClient && user ? (
            <div className="mobile-user-card">
              <Link
                href="/profile"
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="mobile-user-avatar">
                  {(user.name || 'M')[0].toUpperCase()}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {user.name || 'Reader'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#4f46e5', fontWeight: 700 }}>
                    <i className="fas fa-truck-fast me-1"></i> My Orders &rarr;
                  </div>
                </div>
              </Link>

              <button
                type="button"
                className="mobile-logout-btn"
                onClick={() => {
                  if (confirm(`Sign out from ${user.name || 'your account'}?`)) {
                    logout();
                    setIsMobileMenuOpen(false);
                  }
                }}
                title="Log Out"
              >
                <i className="fas fa-sign-out-alt"></i>
              </button>
            </div>
          ) : (
            <div className="mobile-auth-actions">
              <Link
                href="/login"
                className="mobile-btn-login"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="mobile-btn-signup"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
