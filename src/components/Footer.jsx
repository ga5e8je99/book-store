import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link href="/" className="logo-wrapper" style={{ marginBottom: '14px', display: 'inline-flex' }}>
            <div className="logo-icon-box" style={{ width: '34px', height: '34px', fontSize: '1rem' }}>
              <i className="fas fa-book-open"></i>
            </div>
            <h3 className="logo-text" style={{ color: '#ffffff', fontSize: '1.25rem' }}>Book<span>Store</span></h3>
          </Link>
          <p>
            Your premier digital gateway to world literature, speculative fiction, scientific discovery, and modern knowledge.
          </p>
        </div>

        <div className="footer-col">
          <h5>Categories</h5>
          <ul>
            <li><Link href="/story">Novels & Fiction</Link></li>
            <li><Link href="/science">Science & Technology</Link></li>
            <li><Link href="/bestsaller">Trending Best Sellers</Link></li>
            <li><Link href="/newbook">New Releases</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h5>Quick Links</h5>
          <ul>
            <li><Link href="/shop">Shopping Cart</Link></li>
            <li><Link href="/payment">Checkout</Link></li>
            <li><Link href="/login">Account Login</Link></li>
            <li><Link href="/signup">Join Membership</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h5>Customer Care</h5>
          <ul>
            <li><a href="#support">Free Express Delivery</a></li>
            <li><a href="#support">30-Day Returns</a></li>
            <li><a href="#support">Privacy Policy</a></li>
            <li><a href="#support">Terms of Service</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>&copy; {new Date().getFullYear()} BookStore Platform. Built with Next.js. All rights reserved.</span>
        <span>Secure Payments &bull; Fast Delivery &bull; Solid Identity</span>
      </div>
    </footer>
  );
}

