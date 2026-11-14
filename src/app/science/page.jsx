'use client';

import React from 'react';
import BookCard from '../../components/BookCard';
import { categoryBooks } from '../../data/books';

export default function SciencePage() {
  const books = categoryBooks.science;

  return (
    <div className="category-page-wrapper">
      <div className="category-hero">
        <img src="/image/science.jpg" alt="Science Banner" />
        <div className="category-hero-content">
          <h1>Science &amp; Technology</h1>
          <p>Pioneering astrophysical frontiers, living systems, and groundbreaking discoveries.</p>
        </div>
      </div>

      <section className="section-wrapper">
        <div className="section-header">
          <h2 className="section-title">
            <div className="section-title-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              <i className="fas fa-flask"></i>
            </div>
            Science Catalog ({books.length})
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

