'use client';

import React from 'react';
import BookCard from '../../components/BookCard';
import { categoryBooks } from '../../data/books';

export default function BestSellerPage() {
  const books = categoryBooks.bestsaller;

  return (
    <div className="category-page-wrapper">
      <div className="category-hero">
        <img src="/image/bestSeller.jpg" alt="Best Seller Banner" />
        <div className="category-hero-content">
          <h1>Trending Best Sellers</h1>
          <p>Top chart titles and critically acclaimed international bestsellers loved by millions.</p>
        </div>
      </div>

      <section className="section-wrapper">
        <div className="section-header">
          <h2 className="section-title">
            <div className="section-title-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <i className="fas fa-fire"></i>
            </div>
            Bestselling Collection ({books.length})
          </h2>
        </div>

        <div className="cardcontent">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>
    </div>
  );
}

