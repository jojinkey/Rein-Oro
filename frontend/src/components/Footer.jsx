import React from "react";
import { Link } from "react-router-dom";
import { apiUrl } from "../config/api.js";
import { GST_BUSINESS_PROFILE } from "../config/gstProfile.js";

const SUPPORT_EMAIL = 'wecare.reinoro@gmail.com';
const WHATSAPP_URL = 'https://wa.me/916397003303';
const INSTAGRAM_URL = 'https://www.instagram.com/reinoro.in?igsh=MW4xYnMzMHQzN29qdQ%3D%3D&utm_source=qr';

export default function Footer() {
  const handleSubscribe = async (e) => {
    e.preventDefault();
    const emailInput = e.target.querySelector('.newsletter-input');
    const email = emailInput ? emailInput.value.trim() : '';
    if (!email) return;

    try {
      const res = await fetch(apiUrl('/api/newsletter'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }
      alert('Thank you for subscribing to Rein Oro Foods.');
      e.target.reset();
    } catch (err) {
      alert(`Subscription issue: ${err.message}`);
    }
  };

  return (
    <footer className="footer-section" id="footer-section">
      <div className="footer-container">
        <div className="footer-brand-col">
          <Link to="/" className="footer-logo">
            <img src="images/logo.png" alt="Rein Oro Foods Logo" className="footer-logo-img" />
          </Link>
          <p className="brand-tagline">Premium Makhana and Dry Fruits.</p>
          <div className="social-links">
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label="Instagram reinoro.in">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" aria-label="WhatsApp Rein Oro Foods">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 8.5-8.5h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            </a>
            <a href={`mailto:${SUPPORT_EMAIL}`} aria-label="Email Rein Oro Foods">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </a>
          </div>
        </div>

        <div className="footer-links-col">
          <h4>Shop</h4>
          <Link to="/shop">All Products</Link>
          <Link to="/shop?category=Makhana">Makhana</Link>
          <Link to="/shop?category=Nuts">Premium Nuts</Link>
          <Link to="/shop">Healthy Snacks</Link>
          <Link to="/shop">New Arrivals</Link>
        </div>

        <div className="footer-links-col">
          <h4>Customer Care</h4>
          <Link to="/dashboard">Track Order</Link>
          <Link to="/shipping">Shipping Policy</Link>
          <Link to="/returns">Returns & Refunds</Link>
          <Link to="/contact">Customer Support</Link>
          <Link to="/contact">Wholesale Inquiry</Link>
        </div>

        <div className="footer-links-col">
          <h4>Company</h4>
          <Link to="/about">About Us</Link>
          <Link to="/about">Our Journey</Link>
          <Link to="/contact">Partnerships</Link>
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">Instagram: reinoro.in</a>
        </div>

        <div className="footer-links-col newsletter-col">
          <h4>Newsletter</h4>
          <p>Subscribe for product launches, offers, healthy snacking tips, and exclusive discounts.</p>
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <input type="email" className="newsletter-input" placeholder="Enter your email" required aria-label="Email address" />
            <button type="submit" className="btn btn-primary subscribe-btn">Subscribe</button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Rein Oro Foods. All Rights Reserved.</p>
        <div className="footer-compliance">
          <span>FSSAI License No.: 22626233000105</span>
          <span>Made in India 🇮🇳</span>
          <span>Roorkee, Uttarakhand</span>
          <span>GSTIN: {GST_BUSINESS_PROFILE.gstin}</span>
        </div>
        <div className="footer-bottom-links">
          <Link to="/terms">Terms & Conditions</Link> &bull; <Link to="/privacy">Privacy Policy</Link>
        </div>
        <div className="footer-bottom-payments">
          <span>VISA</span>
          <span>MASTERCARD</span>
          <span>UPI</span>
          <span>RUPAY</span>
        </div>
      </div>
    </footer>
  );
}
