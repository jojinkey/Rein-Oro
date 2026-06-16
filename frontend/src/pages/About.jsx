import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CMSContext } from '../App.jsx';
import useSEO from '../hooks/useSEO.js';

const missionItems = [
  'Deliver premium-quality makhana and dry fruits.',
  'Maintain strict quality and hygiene standards.',
  'Support healthy snacking habits.',
  'Build long-term customer trust through consistency and transparency.',
  'Promote Indian-grown products and local sourcing wherever possible.'
];

const trustBadges = [
  'FSSAI Certified',
  'Premium Quality Makhana',
  'Made in India',
  'Healthy Snacking',
  'Hygienically Packed',
  'Quality Assured'
];

export default function About() {
  const navigate = useNavigate();
  const { getCMSValue } = useContext(CMSContext);

  useSEO({
    title: 'About Rein Oro Foods | Premium Makhana & Dry Fruits',
    description: 'Discover Rein Oro Foods, founded by Vaibhav Singh Panwar in Roorkee, Uttarakhand, with a commitment to premium makhana, dry fruits, purity, nutrition, and hygiene.',
    image: 'images/finest_selection.png',
    path: '/about'
  });

  return (
    <main className="cart-page-main about-page-main">
      <section className="about-hero-section">
        <div className="about-hero-content">
          <span className="about-hero-eyebrow">About Rein Oro Foods</span>
          <h1 className="about-hero-title text-glow">
            {getCMSValue('about.html', '.about-hero-section h1', 'Premium Makhana and Dry Fruits, Packed With Trust.')}
          </h1>
          <p className="about-hero-desc text-readable">
            {getCMSValue('about.html', '.about-hero-section p', 'Rein Oro Foods brings premium-quality makhana and dry fruits to customers who value purity, nutrition, freshness, and excellence.')}
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/shop')}>Explore Products</button>
        </div>
        <div className="about-hero-visual-frame">
          <img src={getCMSValue('about.html', '.about-hero-img', 'images/finest_selection.png')} alt="Premium Rein Oro Foods assortment" className="about-hero-img" />
        </div>
      </section>

      <section className="about-bento-grid about-content-grid">
        <div className="about-bento-row-1">
          <article className="about-bento-card about-story-card">
            <span className="cell-eyebrow">Our Journey</span>
            <h2 className="text-glow">
              {getCMSValue('about.html', '.about-sourcing-title', 'Our Journey')}
            </h2>
            <p>
              Founded by Vaibhav Singh Panwar, Rein Oro Foods was established with a simple vision-to bring premium-quality makhana and dry fruits to customers who value purity, nutrition, and excellence.
            </p>
            <p>
              Based in Roorkee, Uttarakhand, Rein Oro Foods began its journey with a commitment to sourcing the finest products from trusted farmers and suppliers across India. We believe that healthy snacking should never compromise on quality, taste, or freshness.
            </p>
            <p>
              Every product is carefully selected, quality-checked, and hygienically packed to ensure that customers receive only the best. Our focus is on delivering natural, wholesome, and nutritious products that fit modern lifestyles while maintaining traditional values of trust and authenticity.
            </p>
            <p>
              As a proudly Indian brand, Rein Oro Foods aims to build a trusted name in the premium dry fruits and healthy snacks segment by consistently delivering products that meet the highest standards of quality and customer satisfaction.
            </p>
          </article>

          <aside className="about-guarantees-card about-founder-card">
            <span className="cell-eyebrow">Founder</span>
            <h3 className="text-glow">Vaibhav Singh Panwar</h3>
            <p className="founder-role">Founder &amp; Proprietor</p>
            <p>
              Driven by a passion for quality food products and entrepreneurship, Vaibhav Singh Panwar founded Rein Oro Foods with the goal of creating a premium Indian brand focused on purity, nutrition, and customer satisfaction.
            </p>
          </aside>
        </div>

        <div className="about-bento-row-2">
          <article className="about-bento-card">
            <span className="cell-eyebrow">Our Vision</span>
            <h3 className="text-glow">{getCMSValue('about.html', '.about-craft-title', 'Our Vision')}</h3>
            <p>
              To become one of India's most trusted premium dry fruits and healthy snacks brands by offering high-quality, naturally sourced, and hygienically packed products that promote healthy living.
            </p>
            <div className="about-image-strip">
              <img src={getCMSValue('about.html', '.about-sourcing-img', 'images/slow_roasted.png')} alt="Naturally sourced Rein Oro makhana" />
            </div>
          </article>

          <article className="about-bento-card">
            <span className="cell-eyebrow">Our Mission</span>
            <h3 className="text-glow">{getCMSValue('about.html', '.about-values-title', 'Our Mission')}</h3>
            <ul className="about-mission-list">
              {missionItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>

        <section className="about-trust-section">
          <div className="section-header compact">
            <span className="section-subtitle">Trust Badges</span>
            <h2 className="section-title text-glow">Quality You Can Count On</h2>
          </div>
          <div className="trust-badges-grid">
            {trustBadges.map((badge) => (
              <div key={badge} className="trust-badge-pill">{badge}</div>
            ))}
          </div>
        </section>

        <div className="about-cta-container">
          <div>
            <h2 className="text-glow">
              {getCMSValue('about.html', '.about-cta-title', 'Healthy Snacking, Made Premium.')}
            </h2>
            <p>
              {getCMSValue('about.html', '.about-cta-body', 'Explore premium makhana, dry fruits, and wholesome snacks from Rein Oro Foods.')}
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/shop')}>Shop Now</button>
          </div>
          <div className="about-cta-image">
            <img src={getCMSValue('about.html', '.about-cta-img', 'images/gift_box.png')} alt="Rein Oro Foods gift assortment" />
          </div>
        </div>
      </section>
    </main>
  );
}
