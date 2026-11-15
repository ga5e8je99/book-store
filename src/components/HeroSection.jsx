'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';

const spotlightBooks = [
  {
    id: 'spot-1',
    title: 'By Any Other Name',
    author: 'Jodi Picoult',
    category: 'Historical Fiction',
    price: 45,
    rating: '5.0',
    reviews: '2,840',
    badge: "Editor's Spotlight",
    badgeColor: '#4f46e5',
    image: '/image/image 8.png',
    quote: 'A profound and thrilling masterpiece crossing centuries, exploring courage, identity, and the power of written word.',
    description: 'A dazzling novel of two women separated by centuries, daring to fight for their creative voices in a society governed by men.'
  },
  {
    id: 'spot-2',
    title: 'Their Monstrous Hearts',
    author: 'K.A. Reynolds',
    category: 'Dark Fantasy',
    price: 52,
    rating: '4.9',
    reviews: '1,420',
    badge: '#1 Fantasy Choice',
    badgeColor: '#059669',
    image: '/image/9780778368274 1.png',
    quote: 'An astonishing dark fantasy romance rich with mythological depth, sprayed edges, and breathtaking illustrations.',
    description: 'Deluxe collector edition exploring an epic quest where ancient secrets and forbidden love clash under siege.'
  },
  {
    id: 'spot-3',
    title: 'Cosmic Wonders',
    author: 'Astrophysics Foundation',
    category: 'Science & Cosmos',
    price: 45,
    rating: '5.0',
    reviews: '3,100',
    badge: 'Essential Science',
    badgeColor: '#d97706',
    image: '/image/32.png',
    quote: 'The ultimate visual guide to our cosmos from quantum gravitational fields to uncharted interstellar galaxies.',
    description: 'An unforgettable journey across galaxies, black holes, and the foundational astrophysical discoveries of modern science.'
  }
];

export default function HeroSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { addToCart, openModal } = useCart();

  const activeBook = spotlightBooks[activeIdx];

  // Auto-rotate spotlight every 6 seconds unless user pauses/hovers
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % spotlightBooks.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section className="hero-pro-section">
      <div className="hero-pro-grid">
        {/* Left Column: Compelling Editorial & CTAs */}
        <div className="hero-pro-content" data-aos="fade-right" data-aos-duration="700">
          {/* Top Live Announcement Pill */}
          <div className="hero-live-pill">
            <span className="hero-pulse-dot"></span>
            <span className="hero-pill-text">
              Spring Literary Season &bull; Use code <strong>BOOK20</strong> for 20% off
            </span>
            <i className="fas fa-arrow-right hero-pill-arrow"></i>
          </div>

          {/* Main Headline */}
          <h1 className="hero-pro-title">
            Where Great Stories Meet <span className="hero-title-highlight">Curious Minds</span>.
          </h1>

          {/* Editorial Subtext */}
          <p className="hero-pro-subtext">
            Immerse yourself in over 15,000 hand-curated titles — from award-winning fiction and timeless classics to groundbreaking science. Fast, carbon-neutral delivery straight to your doorstep.
          </p>

          {/* Quick Category Chips */}
          <div className="hero-category-chips">
            <span className="chips-label">Browse Genres:</span>
            <Link href="/story" className="hero-chip">
              <i className="fas fa-book me-1"></i> Novels
            </Link>
            <Link href="/science" className="hero-chip">
              <i className="fas fa-flask me-1"></i> Science
            </Link>
            <Link href="/bestsaller" className="hero-chip">
              <i className="fas fa-fire me-1"></i> Best Sellers
            </Link>
            <Link href="/newbook" className="hero-chip">
              <i className="fas fa-sparkles me-1"></i> New Releases
            </Link>
          </div>

          {/* Primary Action Buttons */}
          <div className="hero-actions-group">
            <Link href="/bestsaller" className="hero-btn-primary">
              Explore Best Sellers <i className="fas fa-arrow-right"></i>
            </Link>
            <Link href="/shop" className="hero-btn-secondary">
              <i className="fas fa-shopping-bag"></i> View Shopping Bag
            </Link>
          </div>

          {/* Social Proof & Trust Strip */}
          <div className="hero-trust-strip">
            <div className="hero-avatar-stack">
              <span className="hero-avatar" style={{ background: '#4f46e5' }}>AR</span>
              <span className="hero-avatar" style={{ background: '#059669' }}>JD</span>
              <span className="hero-avatar" style={{ background: '#d97706' }}>MK</span>
              <span className="hero-avatar" style={{ background: '#e11d48' }}>SL</span>
              <span className="hero-avatar hero-avatar-plus">+50k</span>
            </div>

            <div className="hero-trust-info">
              <div className="hero-trust-stars">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <span className="hero-trust-score">4.9 / 5</span>
              </div>
              <p className="hero-trust-label">
                Trusted by 50,000+ passionate readers &bull; 14,200+ verified 5-star reviews
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive 3D Book Spotlight Card */}
        <div
          className="hero-pro-showcase"
          data-aos="fade-left"
          data-aos-duration="700"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="spotlight-card">
            {/* Top Spotlight Header */}
            <div className="spotlight-card-header">
              <div
                className="spotlight-badge"
                style={{ background: activeBook.badgeColor }}
              >
                <i className="fas fa-award"></i> {activeBook.badge}
              </div>

              <div className="spotlight-rating-pill">
                <i className="fas fa-star"></i>
                <span>{activeBook.rating}</span>
                <span className="spotlight-review-count">({activeBook.reviews})</span>
              </div>
            </div>

            {/* Central Book Showcase */}
            <div className="spotlight-center-display">
              {/* 3D Physical Book Mock */}
              <div
                className="book-3d-wrapper"
                onClick={() => openModal(activeBook)}
                title="Click for quick preview"
              >
                <div className="book-3d-spine"></div>
                <img
                  src={activeBook.image}
                  alt={activeBook.title}
                  className="book-3d-cover"
                />
                <div className="book-3d-ribbon">Hardcover Edition</div>
              </div>

              {/* Book Details */}
              <div className="spotlight-book-details">
                <span className="spotlight-category-tag">{activeBook.category}</span>
                <h3 className="spotlight-book-title">{activeBook.title}</h3>
                <div className="spotlight-book-author">by {activeBook.author}</div>

                <p className="spotlight-book-quote">
                  &ldquo;{activeBook.quote}&rdquo;
                </p>

                {/* Price and Actions */}
                <div className="spotlight-action-row">
                  <div className="spotlight-price-tag">
                    <span className="price-currency">$</span>
                    <span className="price-number">{activeBook.price}</span>
                    <span className="price-badge">Free Delivery</span>
                  </div>

                  <div className="spotlight-buttons">
                    <button
                      type="button"
                      className="btn-spotlight-add"
                      onClick={(e) => addToCart(activeBook, 1, e.currentTarget)}
                      title={`Add ${activeBook.title} to bag`}
                    >
                      <i className="fas fa-plus me-1"></i> Add to Bag
                    </button>

                    <button
                      type="button"
                      className="btn-spotlight-preview"
                      onClick={() => openModal(activeBook)}
                      title="Quick Details"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Switcher Selector Tabs */}
            <div className="spotlight-tabs-bar">
              <span className="tabs-bar-label">Curated Selection:</span>
              <div className="spotlight-tabs-list">
                {spotlightBooks.map((book, idx) => (
                  <button
                    key={book.id}
                    type="button"
                    className={`spotlight-tab-item ${activeIdx === idx ? 'active' : ''}`}
                    onClick={() => setActiveIdx(idx)}
                  >
                    <img src={book.image} alt={book.title} className="tab-thumb" />
                    <div className="tab-text">
                      <span className="tab-title">{book.title}</span>
                      <span className="tab-author">{book.author}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

