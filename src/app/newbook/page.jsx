'use client';

import React from 'react';
import BookCard from '../../components/BookCard';
import { categoryBooks } from '../../data/books';

export default function NewReleasesPage() {
  const books = categoryBooks.newbook;

  return (
    <div className="category-page-wrapper">
      <div className="category-hero">
        <img src="/image/new.jpg" alt="New Releases Banner" />
        <div className="category-hero-content">
          <h1>New Releases</h1>
          <p>Discover recently published masterpieces and newly arriving authors on the literary scene.</p>
        </div>
      </div>

      <section className="section-wrapper">
        <div className="section-header">
          <h2 className="section-title">
            <div className="section-title-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
              <i className="fas fa-sparkles"></i>
            </div>
            New Arrivals Catalog ({books.length})
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

