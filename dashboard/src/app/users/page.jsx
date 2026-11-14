'use client';

import React, { useState, useEffect } from 'react';

export default function CustomersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
  });

  return (
    <div>
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

          <button type="button" className="btn-primary-admin" onClick={fetchUsers}>
            <i className="fas fa-sync-alt"></i> Refresh Readers
          </button>
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
          <div className="data-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Reader</th>
                  <th>Email</th>
                  <th>Customer ID</th>
                  <th>Join Date</th>
                  <th>Membership Tier</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id || u.id}>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

