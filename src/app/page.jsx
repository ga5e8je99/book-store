'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import HeroSection from '../components/HeroSection';
import FeaturesBanner from '../components/FeaturesBanner';
import BookCard from '../components/BookCard';
import { homeBooks } from '../data/books';
import { useCart } from '../context/CartContext';

export default function HomePage() {
  const { showToast } = useCart();
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      showToast(`Welcome! Your 20% discount code <b>BOOK20</b> has been sent to <b>${newsletterEmail}</b>.`);
      setNewsletterEmail('');
    }
  };

  return (
    <div style={{ maxWidth: '1340px', margin: '0 auto', padding: '1rem 1.5rem 3rem' }}>
      {/* Flagship Hero Section */}
      <HeroSection />

      {/* Value Features Banner */}
      <FeaturesBanner />

      {/* Section 1: Handpicked For You */}
      <section className="section-wrapper" data-aos="fade-up">
        <div className="section-header">
          <h2 className="section-title">
            <div className="section-title-icon"><i className="fas fa-sparkles"></i></div>
            Handpicked For You
          </h2>
          <Link href="/story" className="see-more-link">
            Explore all <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
        <div className="cardcontent">
          {homeBooks.handpicked.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      {/* Section 2: Trending Best Sellers */}
      <section className="section-wrapper" data-aos="fade-up">
        <div className="section-header">
          <h2 className="section-title">
            <div className="section-title-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <i className="fas fa-fire"></i>
            </div>
            Trending Best Sellers
          </h2>
          <Link href="/bestsaller" className="see-more-link">
            Explore all <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
        <div className="cardcontent">
          {homeBooks.trending.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      {/* Section 3: Novels & Fiction */}
      <section className="section-wrapper" data-aos="fade-up">
        <div className="section-header">
          <h2 className="section-title">
            <div className="section-title-icon" style={{ background: '#ffe4e6', color: '#e11d48' }}>
              <i className="fas fa-book-open"></i>
            </div>
            Novels & Fiction
          </h2>
          <Link href="/story" className="see-more-link">
            Explore all <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
        <div className="cardcontent">
          {homeBooks.novels.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>

      {/* Newsletter Subscription Card */}
      <section className="subscription-card" data-aos="zoom-in" data-aos-duration="600">
        <h2>Join Our Global Readers Club</h2>
        <p>
          Subscribe to our weekly dispatch for handpicked recommendations, author interviews, and an immediate 20% discount on your first checkout.
        </p>
        <form className="subscription-form-wrapper" onSubmit={handleNewsletterSubmit}>
          <input
            type="email"
            placeholder="Enter your email address..."
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
            required
          />
          <button type="submit">Join Free</button>
        </form>
      </section>
    </div>
  );
}

