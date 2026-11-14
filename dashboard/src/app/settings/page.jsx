'use client';

import React, { useState, useEffect } from 'react';

export default function StoreSettingsPage() {
  const [settings, setSettings] = useState({
    storeName: 'BookStore',
    contactEmail: 'support@bookstore.com',
    heroAnnouncement: {
      text: 'Spring Literary Season • Use code BOOK20 for 20% off',
      code: 'BOOK20',
      active: true
    },
    promoCodes: []
  });
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  // New code inputs
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState(20);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/api/settings');
      const data = await res.json();
      if (data.data?.settings) {
        setSettings(data.data.settings);
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const saveSettings = async (updated) => {
    try {
      const res = await fetch('http://localhost:3000/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        setSettings(updated);
        showToast('Settings saved successfully!');
      } else {
        alert('Failed to save settings');
      }
    } catch (e) {
      alert('Network error while saving settings');
    }
  };

  const handleAnnouncementSubmit = (e) => {
    e.preventDefault();
    saveSettings(settings);
  };

  const handleAddPromoCode = (e) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    const codeUpper = newCode.trim().toUpperCase();
    const existing = settings.promoCodes?.find((p) => p.code === codeUpper);
    if (existing) {
      alert('Promo code already exists!');
      return;
    }

    const updatedPromos = [
      ...(settings.promoCodes || []),
      {
        code: codeUpper,
        discount: Number(newDiscount) || 10,
        active: true,
        usageCount: 0
      }
    ];

    const updatedSettings = { ...settings, promoCodes: updatedPromos };
    saveSettings(updatedSettings);
    setNewCode('');
    setNewDiscount(20);
  };

  const handleTogglePromo = (code) => {
    const updatedPromos = settings.promoCodes.map((p) =>
      p.code === code ? { ...p, active: !p.active } : p
    );
    saveSettings({ ...settings, promoCodes: updatedPromos });
  };

  const handleDeletePromo = (code) => {
    if (confirm(`Delete promo code "${code}"?`)) {
      const updatedPromos = settings.promoCodes.filter((p) => p.code !== code);
      saveSettings({ ...settings, promoCodes: updatedPromos });
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        <i className="fas fa-spinner fa-spin fa-2x"></i>
      </div>
    );
  }

  return (
    <div>
      {toastMessage && (
        <div className="admin-toast">
          <i className="fas fa-check-circle" style={{ color: '#34d399' }}></i>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Announcement Settings */}
      <div className="panel-card">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">
              <i className="fas fa-bullhorn text-primary" style={{ color: '#4f46e5' }}></i>
              Live Store Announcement Bar
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0' }}>
              Control the top announcement banner displayed on the storefront home page.
            </p>
          </div>
        </div>

        <form onSubmit={handleAnnouncementSubmit}>
          <div className="form-group-admin">
            <label className="form-label-admin">Announcement Text</label>
            <input
              type="text"
              required
              className="form-input-admin"
              value={settings.heroAnnouncement?.text || ''}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  heroAnnouncement: { ...settings.heroAnnouncement, text: e.target.value }
                })
              }
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
              <input
                type="checkbox"
                checked={settings.heroAnnouncement?.active ?? true}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    heroAnnouncement: { ...settings.heroAnnouncement, active: e.target.checked }
                  })
                }
              />
              Show banner on storefront
            </label>

            <button type="submit" className="btn-primary-admin">
              <i className="fas fa-save me-1"></i> Save Announcement
            </button>
          </div>
        </form>
      </div>

      {/* Promo Codes Manager */}
      <div className="panel-card">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">
              <i className="fas fa-percent text-primary" style={{ color: '#059669' }}></i>
              Discount Promo Codes
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0' }}>
              Create and manage promotional discount coupons for checkout customers.
            </p>
          </div>
        </div>

        {/* Add Promo Code Form */}
        <form onSubmit={handleAddPromoCode} style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            required
            className="search-input-admin"
            placeholder="New Code (e.g. FLASH30)"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            style={{ textTransform: 'uppercase' }}
          />

          <input
            type="number"
            min="1"
            max="100"
            required
            className="search-input-admin"
            placeholder="Discount %"
            value={newDiscount}
            onChange={(e) => setNewDiscount(e.target.value)}
            style={{ width: '130px', minWidth: 'unset' }}
          />

          <button type="submit" className="btn-primary-admin" style={{ background: '#059669' }}>
            <i className="fas fa-plus"></i> Add Coupon
          </button>
        </form>

        {/* Promo Codes Table */}
        <div className="data-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Coupon Code</th>
                <th>Discount Percentage</th>
                <th>Redemptions</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(settings.promoCodes || []).map((promo) => (
                <tr key={promo.code}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 800, color: '#ffffff', fontSize: '1rem' }}>
                    {promo.code}
                  </td>
                  <td style={{ fontWeight: 800, color: '#34d399' }}>
                    {promo.discount}% OFF
                  </td>
                  <td style={{ color: '#94a3b8' }}>
                    {promo.usageCount || 0} times
                  </td>
                  <td>
                    <span className={`badge-status ${promo.active ? 'badge-success' : 'badge-danger'}`}>
                      {promo.active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-action-icon"
                      onClick={() => handleTogglePromo(promo.code)}
                      title={promo.active ? 'Disable Coupon' : 'Enable Coupon'}
                    >
                      <i className={`fas ${promo.active ? 'fa-ban' : 'fa-check'}`}></i>
                    </button>
                    <button
                      type="button"
                      className="btn-action-icon btn-danger"
                      onClick={() => handleDeletePromo(promo.code)}
                      title="Delete Coupon"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

