import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CMSContext } from '../App.jsx';
import useSEO from '../hooks/useSEO.js';

export default function About() {
  const navigate = useNavigate();
  const { getCMSValue } = useContext(CMSContext);

  useSEO({
    title: 'Our Story & Heritage | Rein Oro',
    description: 'Learn about the House of Rein Oro. Our journey of sourcing organic lotus seeds from pristine wetlands, slow-roasting in controlled dry pans, and double-sorting for elite quality.',
    image: 'images/finest_selection.png',
    path: '/about'
  });

  return (
    <main className="cart-page-main">
      {/* Visual Split Hero */}
      <section className="about-hero-section">
        <div>
          <span style={{ fontSize: '0.7rem', color: 'var(--color-gold)', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '1rem', display: 'inline-block' }}>Our Heritage</span>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 300, color: 'var(--color-white)', marginBottom: '1.2rem', lineHeight: 1.1 }}>
            {getCMSValue('about.html', '.about-hero-section h1', 'Purity, Tradition. Timeless Taste.')}
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '500px' }}>
            {getCMSValue('about.html', '.about-hero-section p', 'At the House of Rein Oro, we view healthy snacking not as a compromise, but as a crowning luxury. Our journey began with a singular focus: to elevate standard dry fruits and lotus seeds into premium, culinary works of art.')}
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/shop')}>Explore Collection</button>
        </div>
        <div className="about-hero-visual-frame">
          <img src={getCMSValue('about.html', '.about-hero-img', 'images/finest_selection.png')} alt="Rein Oro Assortment" className="about-hero-img" />
        </div>
      </section>

      {/* Bento Grid System */}
      <section className="about-bento-grid">
        
        {/* Row 1: Story & Promises */}
        <div className="about-bento-row-1">
          
          {/* Our Story Cell */}
          <div className="about-bento-card">
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 300, color: 'var(--color-white)', marginBottom: '1.2rem' }}>
              {getCMSValue('about.html', '.about-sourcing-title', 'Our Sourcing Philosophy')}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
              {getCMSValue('about.html', '.about-sourcing-body', 'We source our raw lotus seeds from clean, organic wetlands, double-sorting them to verify uniform quality and maximum size. Our dry fruits—from California almonds to Iranian pistachios—are select harvests sourced directly from global vineyards and orchards.')}
            </p>
            <div className="about-sourcing-grid">
              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-gold)' }}>👑</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-white)', fontWeight: 500 }}>Double-Sorted Selection</span>
              </div>
              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-gold)' }}>🌿</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-white)', fontWeight: 500 }}>100% Organic Sourcing</span>
              </div>
              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-gold)' }}>📦</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-white)', fontWeight: 500 }}>Vacuum Sealed Packaging</span>
              </div>
              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                <span style={{ color: 'var(--color-gold)' }}>✨</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-white)', fontWeight: 500 }}>Royal Quality Guarantee</span>
              </div>
            </div>
          </div>

          {/* Core Guarantees Cell */}
          <div className="about-guarantees-card">
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 300, color: 'var(--color-white)', textAlign: 'center' }}>Our Royal Guarantees</h3>
            {[
              { label: 'Finest Ingredients', desc: 'Sourced globally from premier crops.' },
              { label: 'Artisanal Prep', desc: 'Slow roasted in small batches.' },
              { label: 'Discerning Taste', desc: 'Unique gourmet seasoning selections.' }
            ].map((g, idx) => (
              <div key={idx} style={{ borderBottom: idx === 2 ? 'none' : '1px solid rgba(255,255,255,0.04)', paddingBottom: idx === 2 ? 0 : '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--color-gold)', fontWeight: 600, marginBottom: '0.2rem' }}>{g.label}</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>{g.desc}</p>
              </div>
            ))}
          </div>

        </div>

        {/* Row 2: Craftsmanship Detail */}
        <div className="about-bento-row-2">
          
          {/* Craftsmanship & Quality Cell */}
          <div className="about-bento-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 300, color: 'var(--color-white)' }}>
              {getCMSValue('about.html', '.about-craft-title', 'Craftsmanship & Quality')}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)', lineHeight: 1.6 }}>
              {getCMSValue('about.html', '.about-craft-body', 'Our signature lotus seeds are processed under clean temperature monitors and slow-roasted without oil. We season them with pure rock salts and organic spices to lock in nutritional wellness, ensuring each seed delivers a signature high-density crunch.')}
            </p>
            <div style={{ marginTop: '1rem', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', overflow: 'hidden' }}>
              <img src={getCMSValue('about.html', '.about-sourcing-img', 'images/slow_roasted.png')} alt="Roasting Quality" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
            </div>
          </div>

          {/* Our Core Values Cell */}
          <div className="about-bento-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 300, color: 'var(--color-white)' }}>
              {getCMSValue('about.html', '.about-values-title', 'Royal Core Values')}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)', lineHeight: 1.6 }}>
              {getCMSValue('about.html', '.about-values-body', 'Purity is not a covenant, it is our covenant. We believe in providing natural, health-focused alternatives to processed snacks while retaining absolute gourmet taste and presentation aesthetics.')}
            </p>
            <div style={{ marginTop: '1rem', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', overflow: 'hidden' }}>
              <img src={getCMSValue('about.html', '.about-values-img', 'images/makhana_bowl_love.png')} alt="Wellness Bowl" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
            </div>
          </div>

        </div>

        {/* Row 3: Stats Summary */}
        <div className="about-stats-row">
          {[
            { metric: '100%', label: 'Naturally Sourced' },
            { metric: '50k+', label: 'Delighted Royals' },
            { metric: '12+', label: 'Unique Flavors' },
            { metric: '0%', label: 'Preservatives' },
            { metric: '100%', label: 'Hygienic Chambers' }
          ].map((stat, idx) => (
            <div key={idx} className="about-stat-item">
              <h4 style={{ fontSize: '1.8rem', color: 'var(--color-gold)', fontWeight: 600 }}>{stat.metric}</h4>
              <p style={{ fontSize: '0.72rem', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.3rem' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Row 4: Call to Action Cell */}
        <div className="about-cta-container">
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 300, color: 'var(--color-white)', marginBottom: '1rem', lineHeight: 1.2 }}>
              {getCMSValue('about.html', '.about-cta-title', 'Experience Gourmet Magnificence')}
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: '2rem' }}>
              {getCMSValue('about.html', '.about-cta-body', 'Treat yourself or surprise a partner with our signature gift assortments, packed inside gold-embossed chambers to preserve natural flavors.')}
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/shop')}>Shop Selection</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <img src={getCMSValue('about.html', '.about-cta-img', 'images/gift_box.png')} alt="Royal Gift Assortment" style={{ maxHeight: '200px', objectFit: 'contain' }} />
          </div>
        </div>

      </section>
    </main>
  );
}
