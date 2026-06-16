import React, { useState, useContext } from 'react';
import { CMSContext } from '../App.jsx';
import useSEO from '../hooks/useSEO.js';

const SUPPORT_EMAIL = 'wecare.reinoro@gmail.com';
const SUPPORT_PHONE = '+91 6397003303';
const WHATSAPP_URL = 'https://wa.me/916397003303';
const INSTAGRAM_URL = 'https://www.instagram.com/reinoro.in?igsh=MW4xYnMzMHQzN29qdQ%3D%3D&utm_source=qr';

export default function Contact() {
  const { getCMSValue } = useContext(CMSContext);

  useSEO({
    title: 'Contact Rein Oro Foods | Support, Orders & Partnerships',
    description: 'Contact Rein Oro Foods for product questions, orders, wholesale inquiries, partnerships, and customer support.',
    image: 'images/makhana_cheese_onion.png',
    path: '/contact'
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (status) setStatus(null);
  };

  const validateForm = () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[0-9+\-\s()]{8,20}$/;

    if (formData.name.trim().length < 2) {
      return 'Please enter your full name.';
    }
    if (!emailPattern.test(formData.email.trim())) {
      return 'Please enter a valid email address.';
    }
    if (formData.phone.trim() && !phonePattern.test(formData.phone.trim())) {
      return 'Please enter a valid mobile number.';
    }
    if (formData.subject.trim().length < 3) {
      return 'Please enter a clear subject.';
    }
    if (formData.message.trim().length < 10) {
      return 'Please write at least 10 characters in your message.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationMessage = validateForm();
    if (validationMessage) {
      setStatus({ type: 'error', message: validationMessage });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          recipient_email: SUPPORT_EMAIL,
          source: 'website_contact_form'
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit enquiry');
      }
      setStatus({
        type: 'success',
        message: `Thank you for contacting Rein Oro Foods. Our team will respond from ${SUPPORT_EMAIL} as soon as possible.`
      });
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      setStatus({
        type: 'error',
        message: `We could not submit your enquiry right now. Please email ${SUPPORT_EMAIL} or WhatsApp ${SUPPORT_PHONE}.`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="cart-page-main contact-page-main" style={{ minHeight: '90vh' }}>
      <div className="contact-header">
        <h1 className="text-glow">
          {getCMSValue('contact.html', '.contact-header h1', 'Contact Rein Oro Foods')}
        </h1>
        <p className="text-readable">
          {getCMSValue('contact.html', '.contact-header p', 'Have questions about our products, orders, wholesale inquiries, or partnerships? Our team is here to help. Reach out to us and we will get back to you as soon as possible.')}
        </p>
      </div>

      <div className="contact-grid">
        <section className="contact-info-card">
          <div className="contact-info-group">
            <span className="contact-info-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </span>
            <div className="contact-info-details">
              <h4>Company Information</h4>
              <p style={{ whiteSpace: 'pre-line' }}>
                {getCMSValue('contact.html', '.contact-address', 'Business Name: Rein Oro Foods\nProprietor: Vaibhav Singh Panwar\nF-499/3, Gali No.-11,\nRajendranagar,\nRoorkee,\nDistrict Haridwar,\nUttarakhand - 247667,\nIndia')}
              </p>
            </div>
          </div>

          <div className="contact-info-group">
            <span className="contact-info-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </span>
            <div className="contact-info-details">
              <h4>Customer Support</h4>
              <p><a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></p>
              <p><a href="https://www.reinoro.com" target="_blank" rel="noreferrer">www.reinoro.com</a></p>
            </div>
          </div>

          <div className="contact-info-group">
            <span className="contact-info-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </span>
            <div className="contact-info-details">
              <h4>Mobile & WhatsApp</h4>
              <p><a href={`tel:${SUPPORT_PHONE.replace(/\s/g, '')}`}>{SUPPORT_PHONE}</a></p>
              <p><a href={WHATSAPP_URL} target="_blank" rel="noreferrer">Chat on WhatsApp</a></p>
            </div>
          </div>

          <div className="contact-info-group">
            <span className="contact-info-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </span>
            <div className="contact-info-details">
              <h4>Business Hours</h4>
              <p style={{ whiteSpace: 'pre-line' }}>
                {getCMSValue('contact.html', '.contact-hours', 'Monday - Saturday: 9:00 AM - 7:00 PM\nSunday: Closed')}
              </p>
            </div>
          </div>

          <div className="contact-info-group">
            <span className="contact-info-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
            </span>
            <div className="contact-info-details">
              <h4>Social Media</h4>
              <div className="contact-social-row">
                <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label="Instagram reinoro.in">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
                <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" aria-label="WhatsApp Rein Oro Foods">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 8.5-8.5h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                </a>
                <a href={`mailto:${SUPPORT_EMAIL}`} aria-label="Email Rein Oro Foods">
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="contact-form-card">
          <form onSubmit={handleSubmit} className="contact-form-element" noValidate>
            <div className="contact-form-row-2">
              <div className="contact-form-group">
                <label htmlFor="name" className="contact-form-label">Full Name</label>
                <input type="text" id="name" className="contact-form-input" placeholder="Your full name" required value={formData.name} onChange={handleInputChange} disabled={isSubmitting} />
              </div>
              <div className="contact-form-group">
                <label htmlFor="email" className="contact-form-label">Email Address</label>
                <input type="email" id="email" className="contact-form-input" placeholder="you@example.com" required value={formData.email} onChange={handleInputChange} disabled={isSubmitting} />
              </div>
            </div>

            <div className="contact-form-row-2">
              <div className="contact-form-group">
                <label htmlFor="phone" className="contact-form-label">Mobile Number</label>
                <input type="tel" id="phone" className="contact-form-input" placeholder="+91 98765 43210" value={formData.phone} onChange={handleInputChange} disabled={isSubmitting} />
              </div>
              <div className="contact-form-group">
                <label htmlFor="subject" className="contact-form-label">Subject</label>
                <input type="text" id="subject" className="contact-form-input" placeholder="Orders, wholesale, products..." required value={formData.subject} onChange={handleInputChange} disabled={isSubmitting} />
              </div>
            </div>

            <div className="contact-form-group">
              <label htmlFor="message" className="contact-form-label">Message</label>
              <textarea id="message" className="contact-form-textarea" placeholder="Tell us how we can help..." required value={formData.message} onChange={handleInputChange} disabled={isSubmitting}></textarea>
            </div>

            {status && (
              <div className={`form-status-message ${status.type}`} role="status">
                {status.message}
              </div>
            )}

            <button type="submit" className="btn btn-primary contact-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Sending Message...' : 'Send Message'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
