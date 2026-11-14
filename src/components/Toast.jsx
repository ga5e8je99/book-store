'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';

export default function Toast() {
  const { toasts } = useCart();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container-custom">
      {toasts.map((toast) => (
        <div key={toast.id} className="toast-custom">
          <div className="toast-custom-icon">
            <i className="fas fa-check"></i>
          </div>
          <div
            className="toast-content"
            dangerouslySetInnerHTML={{ __html: toast.message }}
          />
          {toast.actionText && toast.actionUrl && (
            <Link href={toast.actionUrl} className="toast-action">
              {toast.actionText} &rarr;
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}

