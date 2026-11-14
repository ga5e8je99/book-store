'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useCart();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && (data.status === 'success' || data.success)) {
        const userData = data.data?.result || data.user || { name: email.split('@')[0], email };
        login(userData);
        showToast(`Welcome back, <b>${userData.name || 'Reader'}</b>!`);
        router.push('/');
      } else {
        setError(data.message || 'Invalid email or password.');
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
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Log in to access your digital bookshelf and order history.</p>

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
              <label className="form-label-custom">Email Address</label>
              <input
                type="email"
                required
                className="form-control-custom"
                placeholder="name@example.com"
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-auth-submit"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Signing In...
                </>
              ) : (
                'Sign In to Account'
              )}
            </button>
          </form>

          <div className="auth-switch-text">
            Don&apos;t have an account yet? <Link href="/signup">Sign up for free</Link>
          </div>
        </div>

        {/* Right Visual Column */}
        <div className="auth-visual-column">
          <img src="/image/undraw_book_lover_re_rwjy.svg" alt="Reading" />
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>
            Unlimited Stories Await
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '280px', margin: 0 }}>
            Unlock exclusive literary member perks, personalized author recommendations, and order tracking.
          </p>
        </div>
      </div>
    </div>
  );
}

