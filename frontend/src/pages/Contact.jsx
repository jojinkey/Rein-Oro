import React, { useState, useContext } from 'react';
import { CMSContext } from '../App.jsx';
import useSEO from '../hooks/useSEO.js';

export default function Contact() {
  const { getCMSValue } = useContext(CMSContext);

  useSEO({
    title: 'Concierge Contact Support | Rein Oro',
    description: 'Reach the House of Rein Oro concierge. Contact us for custom orders, corporate gifting inquiries, distribution opportunities, or client support.',
    image: 'images/makhana_cheese_onion.png',
    path: '/contact'
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit enquiry');
      }
      alert('Thank you for contacting Rein Oro. Our concierge desk will review your request and get back to you shortly.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      alert(`Error submitting enquiry: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="cart-page-main" style={{ minHeight: '90vh' }}>
      
      <div className="contact-header" style={{ textAlign: 'center', marginBottom: '4.5rem', maxWidth: '700px', margin: '0 auto 4rem auto' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 300, color: 'var(--color-white)', marginBottom: '0.8rem' }}>
          {getCMSValue('contact.html', '.contact-header h1', 'Contact Our House')}
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--color-muted)' }}>
          {getCMSValue('contact.html', '.contact-header p', 'Our concierge team is at your service for any inquiries, corporate commissions, or bespoke requests.')}
        </p>
      </div>
 
      <div className="contact-grid">
        
        {/* Left Column: Info Card */}
        <section className="contact-info-card">
          
          {/* Address */}
          <div className="contact-info-group">
            <span className="contact-info-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </span>
            <div className="contact-info-details">
              <h4>Royal Chambers</h4>
              <p style={{ whiteSpace: 'pre-line' }}>
                {getCMSValue('contact.html', '.contact-address', 'Rein Oro Foods Private Limited\n12-A Connaught Place, Block C\nNew Delhi, 110001, India')}
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="contact-info-group">
            <span className="contact-info-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </span>
            <div className="contact-info-details">
              <h4>Concierge Desk</h4>
              <p>
                <a href={`mailto:${getCMSValue('contact.html', '.contact-email-1', 'concierge@reinoro.com')}`}>
                  {getCMSValue('contact.html', '.contact-email-1', 'concierge@reinoro.com')}
                </a>
              </p>
              <p>
                <a href={`mailto:${getCMSValue('contact.html', '.contact-email-2', 'support@reinoro.com')}`}>
                  {getCMSValue('contact.html', '.contact-email-2', 'support@reinoro.com')}
                </a>
              </p>
            </div>
          </div>

          {/* Phone */}
          <div className="contact-info-group">
            <span className="contact-info-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </span>
            <div className="contact-info-details">
              <h4>Direct Inquiries</h4>
              <p>Concierge: {getCMSValue('contact.html', '.contact-phone-1', '+91 99999 88888')}</p>
              <p>Support: {getCMSValue('contact.html', '.contact-phone-2', '+91 99999 77777')}</p>
            </div>
          </div>

          {/* Hours */}
          <div className="contact-info-group">
            <span className="contact-info-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-clock"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </span>
            <div className="contact-info-details">
              <h4>Business Hours</h4>
              <p style={{ whiteSpace: 'pre-line' }}>
                {getCMSValue('contact.html', '.contact-hours', 'Monday - Saturday: 9:30 AM - 6:30 PM IST\nSunday: Closed')}
              </p>
            </div>
          </div>

          {/* Social */}
          <div className="contact-info-group">
            <span className="contact-info-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-globe"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
            </span>
            <div className="contact-info-details">
              <h4>Follow Our House</h4>
              <div className="contact-social-row">
                <a href="#" aria-label="Instagram">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
                <a href="#" aria-label="Facebook">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                <a href="#" aria-label="Twitter">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                </a>
              </div>
            </div>
          </div>

        </section>

        {/* Right Column: Form */}
        <section className="contact-form-card">
          <form onSubmit={handleSubmit} className="contact-form-element">
            
            <div className="contact-form-row-2">
              <div className="contact-form-group">
                <label htmlFor="name" className="contact-form-label">Full Name</label>
                <input 
                  type="text" 
                  id="name" 
                  className="contact-form-input" 
                  placeholder="Your name" 
                  required 
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
              </div>
              <div className="contact-form-group">
                <label htmlFor="email" className="contact-form-label">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  className="contact-form-input" 
                  placeholder="Your email address" 
                  required 
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="contact-form-group">
              <label htmlFor="subject" className="contact-form-label">Subject</label>
              <input 
                type="text" 
                id="subject" 
                className="contact-form-input" 
                placeholder="How can we assist you?" 
                required 
                value={formData.subject}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </div>

            <div className="contact-form-group">
              <label htmlFor="message" className="contact-form-label">Message</label>
              <textarea 
                id="message" 
                className="contact-form-textarea" 
                placeholder="Describe your request in detail..." 
                required 
                value={formData.message}
                onChange={handleInputChange}
                disabled={isSubmitting}
              ></textarea>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary contact-submit-btn" 
              disabled={isSubmitting}
              style={{ height: '48px' }}
            >
              {isSubmitting ? (
                <>
                  <svg className="spinner-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
                  Sending Message...
                </>
              ) : (
                'Send Message'
              )}
            </button>

          </form>
        </section>

      </div>
    </main>
  );
}
