import React, { useState, useEffect } from 'react';

export default function ExitIntentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [coupon, setCoupon] = useState(null);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/coupons?active=true')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        const activeCoupons = Array.isArray(data) ? data.filter((item) => item.active) : [];
        setCoupon(activeCoupons[0] || null);
      })
      .catch((err) => console.warn('Failed to load active exit coupon', err));
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!coupon) return;
    const shown = sessionStorage.getItem('rein_oro_exit_intent');
    if (shown === 'true') return;

    const handleMouseLeave = (e) => {
      if (e.clientY < 20 && window.innerWidth > 768) {
        setIsOpen(true);
        sessionStorage.setItem('rein_oro_exit_intent', 'true');
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [coupon]);

  const handleCopyCode = () => {
    if (!coupon?.code) return;
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen || !coupon) return null;

  return (
    <div
      className="exit-intent-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 10, 10, 0.9)',
        backdropFilter: 'blur(10px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}
    >
      <div
        className="exit-intent-card"
        style={{
          border: '1px solid var(--color-gold-border)',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '480px',
          padding: '3rem 2.5rem',
          backgroundColor: 'var(--rein-charcoal)',
          textAlign: 'center',
          position: 'relative',
          boxShadow: '0 24px 80px rgba(201, 168, 76, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.2rem'
        }}
      >
        <button
          onClick={() => setIsOpen(false)}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'transparent',
            border: 'none',
            color: 'var(--rein-gray-light)',
            cursor: 'pointer',
            fontSize: '1.5rem',
            lineHeight: 1
          }}
          aria-label="Close details"
        >
          &times;
        </button>

        <div style={{ color: 'var(--rein-gold-primary)', fontSize: '2.5rem', lineHeight: 1 }}>
          *
        </div>

        <div>
          <span style={{ fontSize: '0.72rem', color: 'var(--rein-gold-primary)', letterSpacing: '0.22em', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
            Before You Leave
          </span>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 300, color: 'var(--color-white)', lineHeight: 1.15 }}>
            Claim Your Active Rein Oro Offer
          </h2>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--rein-gray-light)', lineHeight: 1.6, maxWidth: '340px' }}>
          Use the current active coupon on premium makhana, dry fruits, and curated gift boxes.
        </p>

        <div
          style={{
            border: '1px dashed var(--rein-gold-dim)',
            borderRadius: '4px',
            padding: '0.8rem 2rem',
            backgroundColor: 'rgba(201,168,76,0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            marginTop: '0.5rem'
          }}
        >
          <div>
            <span style={{ fontSize: '0.62rem', color: 'var(--rein-gray-light)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', textAlign: 'left' }}>
              Active Coupon
            </span>
            <span style={{ fontSize: '1.25rem', fontFamily: 'var(--font-accent)', color: 'var(--rein-gold-primary)', fontWeight: 600, letterSpacing: '0.08em' }}>
              {coupon.code}
            </span>
            <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--rein-gray-light)', marginTop: '0.25rem' }}>
              {Math.round(Number(coupon.discount_rate || 0) * 100)}% off
            </span>
          </div>
          <button
            onClick={handleCopyCode}
            className="btn btn-outline"
            style={{
              padding: '0.4rem 1rem',
              fontSize: '0.72rem',
              height: 'auto'
            }}
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setIsOpen(false)}
          style={{
            width: '100%',
            height: '45px',
            padding: 0,
            marginTop: '0.5rem'
          }}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
