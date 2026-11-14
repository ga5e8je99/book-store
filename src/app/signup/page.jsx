'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useCart();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirm) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, passwordConfirm })
      });

      const data = await response.json();

      if (response.ok && (data.status === 'success' || data.success)) {
        const userData = data.data?.result || data.user || { name, email };
        login(userData);
        showToast(`Welcome to BookStore, <b>${name}</b>!`);
        router.push('/');
      } else {
        setError(data.message || 'Registration failed. Try a different email.');
      }
    } catch (err) {
      setError('Connection failure. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '1rem 1.5rem 4rem' }}>
      <div className="auth-page-wrapper">
        {/* Left Form Column */}
        <div className="auth-form-column">
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join thousands of passionate book lovers across the globe.</p>

          {error && (
            <div style={{
              background: '#fee2e2',
              color: '#b91c1c',
              border: '1px solid #f87171',
              padding: '10px 14px',
              borderRadius: '8px',
              marginBottom: '18px',
              fontSize: '0.88rem'
            }}>
              <i className="fas fa-exclamation-circle me-1"></i> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group-custom">
              <label className="form-label-custom">Full Name</label>
              <input
                type="text"
                required
                className="form-control-custom"
                placeholder="Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group-custom">
              <label className="form-label-custom">Email Address</label>
              <input
                type="email"
                required
                className="form-control-custom"
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group-custom">
              <label className="form-label-custom">Password</label>
              <input
                type="password"
                required
                className="form-control-custom"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="form-group-custom">
              <label className="form-label-custom">Confirm Password</label>
              <input
                type="password"
                required
                className="form-control-custom"
                placeholder="Re-type your password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-auth-submit"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Creating Account...
                </>
              ) : (
                'Create Your Account'
              )}
            </button>
          </form>

          <div className="auth-switch-text">
            Already have an account? <Link href="/login">Sign in instead</Link>
          </div>
        </div>

        {/* Right Visual Column */}
        <div className="auth-visual-column">
          <img src="/image/undraw_bibliophile_re_xarc.svg" alt="Bibliophile" />
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>
            A Haven for Readers
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '280px', margin: 0 }}>
            Enjoy customized reading suggestions, seasonal discounts, and fast doorstep shipping on every release.
          </p>
        </div>
      </div>
    </div>
  );
}

