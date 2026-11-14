'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const slides = [
  {
    image: '/image/PICOULT_Jodi_ByAnyOtherName_HC_Bookshop_HeroBanner_Desktop_2048x600_(2).webp',
    badge: 'Featured Premiere',
    badgeClass: '',
    title: 'By Any Other Name',
    description: 'The sensational new historical masterpiece by Jodi Picoult',
    link: '/story',
    btnText: 'Explore Now →'
  },
  {
    image: '/image/Uncanny_Hero_2048x600_(1).webp',
    badge: 'Special Edition',
    badgeClass: 'badge-emerald',
    title: 'Uncanny Valley & Beyond',
    description: 'Discover groundbreaking speculative fiction and futuristic marvels',
    link: '/newbook',
    btnText: 'View Releases →'
  },
  {
    image: '/image/banner.jpg',
    badge: 'Exclusive Offer',
    badgeClass: 'badge-amber',
    title: 'Up to 40% Off Science & Fiction',
    description: 'Limited seasonal celebration for book club members and collectors',
    link: '/bestsaller',
    btnText: 'Shop Sale →'
  }
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const slide = slides[current];

  return (
    <section className="hero-carousel-section">
      <div className="carousel-slide-item">
        <img src={slide.image} alt={slide.title} />

        <div className="carousel-overlay-content">
          <div>
            <span className={`carousel-overlay-badge ${slide.badgeClass}`}>
              <i className="fas fa-star me-1" style={{ marginRight: '6px' }}></i> {slide.badge}
            </span>
            <h2 style={{ color: '#ffffff', fontWeight: 900, fontSize: '1.9rem', marginBottom: '6px' }}>
              {slide.title}
            </h2>
            <p style={{ color: '#e2e8f0', fontSize: '0.95rem', margin: 0 }}>
              {slide.description}
            </p>
          </div>

          <Link
            href={slide.link}
            style={{
              padding: '10px 22px',
              borderRadius: '9999px',
              background: '#ffffff',
              color: '#0f172a',
              fontWeight: 700,
              fontSize: '0.92rem',
              display: 'inline-block',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              whiteSpace: 'nowrap'
            }}
          >
            {slide.btnText}
          </Link>
        </div>
      </div>

      <button
        type="button"
        className="carousel-nav-btn prev"
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        <i className="fas fa-chevron-left"></i>
      </button>

      <button
        type="button"
        className="carousel-nav-btn next"
        onClick={nextSlide}
        aria-label="Next slide"
      >
        <i className="fas fa-chevron-right"></i>
      </button>

      <div className="carousel-dots">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            className={`carousel-dot ${current === idx ? 'active' : ''}`}
            onClick={() => setCurrent(idx)}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

