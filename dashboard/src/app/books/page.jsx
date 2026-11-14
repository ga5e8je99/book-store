'use client';

import React, { useState, useEffect } from 'react';

const CATEGORIES = [
  'All',
  'Novel',
  'Novels',
  'Science',
  'Best Seller',
  'New Releases',
  'Adventure',
  'Cooking',
  'History',
  'Mystery',
  'Fantasy',
  'Thriller',
  'Drama',
  'Fiction'
];

export default function BooksManagerPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: 'Novels',
    price: '',
    stock: 50,
    badge: 'Popular',
    image: '/image/30.png',
    description: ''
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/api/books');
      const data = await res.json();
      setBooks(data.data?.books || []);
    } catch (e) {
      console.error('Failed to load books:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const openAddModal = () => {
    setEditingBook(null);
    setFormData({
      title: '',
      author: 'Acclaimed Author',
      category: 'Novels',
      price: '29.99',
      stock: 50,
      badge: 'New',
      image: '/image/30.png',
      description: 'A compelling addition to the store collection.'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author || 'Author',
      category: book.category,
      price: book.price,
      stock: book.stock || 50,
      badge: book.badge || '',
      image: book.image,
      description: book.description || ''
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBook) {
        // Update Book
        const res = await fetch('http://localhost:3000/api/books', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingBook.id, ...formData })
        });
        if (res.ok) {
          showToast(`Updated "${formData.title}" successfully!`);
          setIsModalOpen(false);
          fetchBooks();
        } else {
          alert('Failed to update book');
        }
      } else {
        // Create Book
        const res = await fetch('http://localhost:3000/api/books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          showToast(`Created "${formData.title}" successfully!`);
          setIsModalOpen(false);
          fetchBooks();
        } else {
          alert('Failed to create book');
        }
      }
    } catch (err) {
      alert('Network error while saving book');
    }
  };

  const handleDelete = async (book) => {
    if (confirm(`Are you sure you want to delete "${book.title}" from the store catalog?`)) {
      try {
        const res = await fetch(`http://localhost:3000/api/books?id=${book.id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          showToast(`Deleted "${book.title}" from catalog.`);
          setBooks((prev) => prev.filter((b) => b.id !== book.id));
        } else {
          alert('Failed to delete book');
        }
      } catch (err) {
        alert('Network error');
      }
    }
  };

  const filteredBooks = books.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author?.toLowerCase().includes(search.toLowerCase());
    const matchesCat =
      categoryFilter === 'All' ||
      b.category?.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCat;
  });

  return (
    <div>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="admin-toast">
          <i className="fas fa-check-circle" style={{ color: '#34d399' }}></i>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Panel Card */}
      <div className="panel-card">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">
              <i className="fas fa-book-open text-primary" style={{ color: '#4f46e5' }}></i>
              Book Titles Inventory ({books.length})
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0' }}>
              Add, edit, and organize all books visible to customers on the live storefront.
            </p>
          </div>

          <button type="button" className="btn-primary-admin" onClick={openAddModal}>
            <i className="fas fa-plus"></i> Add New Book
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="filter-bar">
          <input
            type="text"
            className="search-input-admin"
            placeholder="Search by title, author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="category-select-admin"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <span style={{ fontSize: '0.82rem', color: '#94a3b8', marginLeft: 'auto' }}>
            Showing {filteredBooks.length} of {books.length} titles
          </span>
        </div>

        {/* Books Table */}
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <i className="fas fa-spinner fa-spin fa-2x"></i>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Badge</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((book) => (
                  <tr key={book.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={book.image}
                          alt={book.title}
                          style={{
                            width: '38px',
                            height: '52px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            background: '#1e293b'
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: '#ffffff' }}>{book.title}</div>
                          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                            {book.author || 'Author'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge-status badge-indigo">
                        {book.category}
                      </span>
                    </td>
                    <td style={{ fontWeight: 800, color: '#34d399' }}>
                      ${Number(book.price).toFixed(2)}
                    </td>
                    <td>
                      <span style={{ color: book.stock < 10 ? '#fb7185' : '#ffffff', fontWeight: 600 }}>
                        {book.stock || 50} in stock
                      </span>
                    </td>
                    <td>
                      {book.badge ? (
                        <span className="badge-status badge-warning">{book.badge}</span>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>None</span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-action-icon"
                        onClick={() => openEditModal(book)}
                        title="Edit Book"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        type="button"
                        className="btn-action-icon btn-danger"
                        onClick={() => handleDelete(book)}
                        title="Delete Book"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-admin-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-admin-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                {editingBook ? 'Edit Book Details' : 'Add New Book to Store'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="form-group-admin">
                <label className="form-label-admin">Book Title *</label>
                <input
                  type="text"
                  required
                  className="form-input-admin"
                  placeholder="e.g. The Quantum Paradox"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group-admin">
                  <label className="form-label-admin">Author Name</label>
                  <input
                    type="text"
                    className="form-input-admin"
                    placeholder="Author"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  />
                </div>

                <div className="form-group-admin">
                  <label className="form-label-admin">Category</label>
                  <select
                    className="form-input-admin"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group-admin">
                  <label className="form-label-admin">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="form-input-admin"
                    placeholder="29.99"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>

                <div className="form-group-admin">
                  <label className="form-label-admin">Stock Quantity</label>
                  <input
                    type="number"
                    className="form-input-admin"
                    placeholder="50"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group-admin">
                  <label className="form-label-admin">Badge Label</label>
                  <input
                    type="text"
                    className="form-input-admin"
                    placeholder="e.g. #1 Best Seller, Must Read"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  />
                </div>

                <div className="form-group-admin">
                  <label className="form-label-admin">Cover Image Path</label>
                  <input
                    type="text"
                    className="form-input-admin"
                    placeholder="/image/30.png"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group-admin">
                <label className="form-label-admin">Description</label>
                <textarea
                  rows="3"
                  className="form-input-admin"
                  placeholder="Summary or synopsis of the book..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    background: '#1e293b',
                    color: '#ffffff',
                    border: '1px solid #334155',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-admin">
                  {editingBook ? 'Save Changes' : 'Create Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

