'use client';

import React, { useState, useEffect } from 'react';

export default function CustomersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/api/users');
      const data = await res.json();
      setUsers(data.data?.users || []);
    } catch (e) {
      console.error('Failed to load users:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (user) => {
    if (confirm(`Are you sure you want to permanently delete customer account "${user.name || user.email}"?`)) {
      try {
        const res = await fetch(`http://localhost:3000/api/users?id=${user._id || user.id}&email=${encodeURIComponent(user.email)}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          showToast(`User ${user.email} deleted successfully.`);
          setUsers((prev) => prev.filter((u) => u._id !== user._id && u.email !== user.email));
        } else {
          alert('Failed to delete user');
        }
      } catch (e) {
        alert('Network error while deleting user');
      }
    }
  };

  const handleClearTestUsers = async () => {
    if (confirm('Are you sure you want to delete all fake test accounts (@example.com / @test.com)?')) {
      try {
        const res = await fetch('http://localhost:3000/api/users', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'clear_test_users' })
        });
        const data = await res.json();
        if (res.ok) {
          showToast(data.message || 'Cleaned test user accounts!');
          fetchUsers();
          setSelectedIds([]);
        } else {
          alert('Failed to clean test users');
        }
      } catch (e) {
        alert('Network error');
      }
    }
  };

  const toggleSelectUser = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredUsers.map((u) => u._id || u.id || u.email));
    } else {
      setSelectedIds([]);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Are you sure you want to permanently delete ${selectedIds.length} selected reader accounts?`)) {
      try {
        const res = await fetch('http://localhost:3000/api/users', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedIds })
        });
        if (res.ok) {
          showToast(`Deleted ${selectedIds.length} users successfully!`);
          setUsers((prev) =>
            prev.filter((u) => !selectedIds.includes(u._id) && !selectedIds.includes(u.id) && !selectedIds.includes(u.email))
          );
          setSelectedIds([]);
        } else {
          alert('Failed to delete selected users');
        }
      } catch (e) {
        alert('Network error while deleting users');
      }
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
  });

  return (
    <div>
      {toastMessage && (
        <div className="admin-toast">
          <i className="fas fa-check-circle" style={{ color: '#34d399' }}></i>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="panel-card">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">
              <i className="fas fa-users text-primary" style={{ color: '#4f46e5' }}></i>
              Registered Customers ({users.length})
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0' }}>
              Customer accounts created via the store checkout and registration system.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handleClearTestUsers}
              style={{
                background: '#dc2626',
                color: '#ffffff',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Delete all demo test accounts"
            >
              <i className="fas fa-trash-alt"></i> Clean Test Accounts
            </button>
            <button type="button" className="btn-primary-admin" onClick={fetchUsers}>
              <i className="fas fa-sync-alt"></i> Refresh Readers
            </button>
          </div>
        </div>

        <div className="filter-bar">
          <input
            type="text"
            className="search-input-admin"
            placeholder="Search by name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <i className="fas fa-spinner fa-spin fa-2x"></i>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
            No registered users found.
          </div>
        ) : (
          <div>
            {selectedIds.length > 0 && (
              <div style={{
                background: '#1e293b',
                border: '1px solid #4f46e5',
                padding: '10px 16px',
                borderRadius: '8px',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0', fontSize: '0.9rem', fontWeight: 600 }}>
                  <i className="fas fa-check-square" style={{ color: '#818cf8' }}></i>
                  <span>{selectedIds.length} customer{selectedIds.length > 1 ? 's' : ''} selected</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    style={{
                      background: '#dc2626',
                      color: '#ffffff',
                      border: 'none',
                      padding: '7px 14px',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <i className="fas fa-trash-alt"></i> Delete Selected ({selectedIds.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedIds([])}
                    style={{
                      background: 'transparent',
                      color: '#94a3b8',
                      border: '1px solid #475569',
                      padding: '7px 12px',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            )}

            <div className="data-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={filteredUsers.length > 0 && selectedIds.length === filteredUsers.length}
                        onChange={handleSelectAll}
                        style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#4f46e5' }}
                        title="Select All"
                      />
                    </th>
                    <th>Reader</th>
                    <th>Email</th>
                    <th>Customer ID</th>
                    <th>Join Date</th>
                    <th>Membership Tier</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const userKey = u._id || u.id || u.email;
                    const isSelected = selectedIds.includes(userKey);
                    return (
                      <tr
                        key={userKey}
                        style={{ background: isSelected ? 'rgba(79, 70, 229, 0.12)' : 'transparent' }}
                      >
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectUser(userKey)}
                            style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#4f46e5' }}
                          />
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              background: '#4f46e5',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.85rem'
                            }}>
                              {(u.name || 'M')[0].toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 700, color: '#ffffff' }}>
                              {u.name || 'Member'}
                            </span>
                          </div>
                        </td>
                        <td style={{ color: '#94a3b8' }}>{u.email}</td>
                        <td style={{ fontFamily: 'monospace', color: '#818cf8', fontSize: '0.85rem' }}>
                          #{u._id?.slice(-8) || 'USR'}
                        </td>
                        <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active Member'}
                        </td>
                        <td>
                          <span className="badge-status badge-success">
                            <i className="fas fa-check-circle me-1"></i> Verified Reader
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u)}
                            title="Delete user account"
                            style={{
                              background: 'transparent',
                              border: '1px solid #ef4444',
                              color: '#ef4444',
                              borderRadius: '6px',
                              padding: '5px 10px',
                              cursor: 'pointer',
                              fontSize: '0.82rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <i className="fas fa-trash-alt"></i> Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

