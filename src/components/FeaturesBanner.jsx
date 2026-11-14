import React from 'react';

export default function FeaturesBanner() {
  const features = [
    {
      icon: 'fa-shipping-fast',
      title: 'Free Express Shipping',
      desc: 'On all orders over $50'
    },
    {
      icon: 'fa-shield-check',
      title: 'Secure & Direct Payment',
      desc: 'End-to-end encrypted checkout'
    },
    {
      icon: 'fa-headset',
      title: '24/7 Dedicated Support',
      desc: 'Expert literary consultations'
    },
    {
      icon: 'fa-rotate-left',
      title: 'Hassle-Free Returns',
      desc: '30-day money-back guarantee'
    }
  ];

  return (
    <section className="features-banner">
      <div className="features-grid">
        {features.map((feat, i) => (
          <div key={i} className="feature-box">
            <div className="feature-icon-circle">
              <i className={`fas ${feat.icon}`}></i>
            </div>
            <div className="feature-info">
              <h6>{feat.title}</h6>
              <p>{feat.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

