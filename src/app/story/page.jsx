'use client';

import React from 'react';
import BookCard from '../../components/BookCard';
import { categoryBooks } from '../../data/books';

export default function StoryPage() {
  const books = categoryBooks.story;

  return (
    <div className="category-page-wrapper">
      <div className="category-hero">
        <img src="/image/bannerstory.jpg" alt="Novels Banner" />
        <div className="category-hero-content">
          <h1>Novels &amp; Stories</h1>
          <p>Explore immersive literary epics, generational drama, and captivating storytelling.</p>
        </div>
      </div>

      <section className="section-wrapper">
        <div className="section-header">
          <h2 className="section-title">
            <div className="section-title-icon" style={{ background: '#ffe4e6', color: '#e11d48' }}>
              <i className="fas fa-book-open"></i>
            </div>
            Featured Novels Catalog ({books.length})
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

