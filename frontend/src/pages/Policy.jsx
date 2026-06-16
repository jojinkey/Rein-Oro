import React, { useEffect, useState } from 'react';

const POLICY_DATA = {
  privacy: {
    title: 'Privacy Policy',
    sidebar: [
      { id: 'sec-intro', label: '1. Introduction' },
      { id: 'sec-data-collect', label: '2. Data We Collect' },
      { id: 'sec-data-use', label: '3. How We Use Data' },
      { id: 'sec-cookies', label: '4. Cookies & Trackers' },
      { id: 'sec-security', label: '5. Data Protection' },
      { id: 'sec-support', label: '6. Contact Support' }
    ],
    content: (
      <>
        <section className="policy-section" id="sec-intro">
          <h2>1. Introduction</h2>
          <p>Welcome to Rein Oro ("we," "our," "us"). We are dedicated to providing you with the highest quality gourmet dry fruits and makhanas while ensuring your personal information is protected with absolute discretion and luxury standards.</p>
          <p>This Privacy Policy outlines how your personal data is collected, stored, processed, and secured when you visit our website, contact our support team, or purchase our premium products.</p>
        </section>

        <section className="policy-section" id="sec-data-collect">
          <h2>2. Data We Collect</h2>
          <p>To serve you with the distinction that defines the Rein Oro brand, we collect specific details when you use our website, register a royal membership account, or purchase items:</p>
          <ul>
            <li><strong>Personal Identifiers:</strong> Name, delivery address, phone number, and email address.</li>
            <li><strong>Account Credentials:</strong> Password hashes used to validate access to your secure user dashboard.</li>
            <li><strong>Order Details:</strong> Purchased items, applied promo codes, checkout amounts, and delivery parameters.</li>
            <li><strong>Digital Fingerprints:</strong> IP address, device specifications, browser type, and navigation histories.</li>
          </ul>
        </section>

        <section className="policy-section" id="sec-data-use">
          <h2>3. How We Use Data</h2>
          <p>Your details are processed to manage logistics, customize interfaces, and deliver exclusive memberships. We do not sell or lease your personal information to third parties.</p>
          <ul>
            <li>Fulfill your purchase orders, calculate shipping rates, and simulate delivery timelines.</li>
            <li>Synchronize recent orders, reward points, and profile details inside your Member Dashboard.</li>
            <li>Conduct promotional discounts, newsletter subscriptions, and seasonal corporate gifting campaigns.</li>
            <li>Identify and prevent fraudulent checkout attempts or security breaches.</li>
          </ul>
        </section>

        <section className="policy-section" id="sec-cookies">
          <h2>4. Cookies & Trackers</h2>
          <p>Our website utilizes cookies and similar tracking methods to maintain active shopping carts, preserve user credentials, and provide a premium experience.</p>
          <div className="policy-callout-box">
            <span className="policy-callout-icon">ℹ️</span>
            <div className="policy-callout-text">
              <h4>Essential Cookies</h4>
              <p>Essential cookies are automatically enabled to remember your cart items, dashboard sessions, and checkout progress. Disabling cookies in your browser settings will prevent correct site functionality.</p>
            </div>
          </div>
        </section>

        <section className="policy-section" id="sec-security">
          <h2>5. Data Protection</h2>
          <p>We implement advanced technical and organizational measures to defend your personal data. All payment details are processed securely through certified, encrypted gateways, and your contact records are stored locally with strict access controls.</p>
          <p>We preserve records of your purchases solely for business compliance, order tracking, and loyalty rewards points management, and delete or anonymize data once it is no longer required.</p>
        </section>

        <section className="policy-section" id="sec-support">
          <h2>6. Contact Support</h2>
          <p>If you have any questions regarding your digital records, wish to request account deletion, or seek details about our compliance standards, please reach out to our legal desk:</p>
          <p>
            Email: <a href="mailto:wecare.reinoro@gmail.com" style={{ color: 'var(--color-gold)', textDecoration: 'none' }}>wecare.reinoro@gmail.com</a><br />
            Post: Rein Oro Privacy Department, 12-A Connaught Place, Block C, New Delhi, 110001, India
          </p>
        </section>
      </>
    )
  },
  terms: {
    title: 'Terms & Conditions',
    sidebar: [
      { id: 'sec-agreement', label: '1. Agreement of Terms' },
      { id: 'sec-intellectual', label: '2. Intellectual Property' },
      { id: 'sec-purchases', label: '3. Purchases & Pricing' },
      { id: 'sec-liability', label: '4. Limitation of Liability' },
      { id: 'sec-governing', label: '5. Governing Law' }
    ],
    content: (
      <>
        <section className="policy-section" id="sec-agreement">
          <h2>1. Agreement of Terms</h2>
          <p>By accessing the website and purchasing products of Rein Oro, you acknowledge and agree to abide by these Terms and Conditions. These terms apply to all visitors, users, and customers of the platform.</p>
          <p>We reserve the right to modify these terms at any time without prior notification. Continued use of the platform represents acceptance of modifications.</p>
        </section>

        <section className="policy-section" id="sec-intellectual">
          <h2>2. Intellectual Property</h2>
          <p>All content available on this site, including logos, typography, visual designs, imagery, product configurations, and copy, is the exclusive property of Rein Oro Foods and is protected by applicable copyright laws.</p>
          <p>No content may be reproduced, copied, or sold for commercial gains without explicit written authorization from our legal department.</p>
        </section>

        <section className="policy-section" id="sec-purchases">
          <h2>3. Purchases & Pricing</h2>
          <p>Prices displayed on the platform are in Indian Rupees (INR) and are inclusive of standard local taxes unless specified otherwise. We reserve the right to alter pricing catalogs or discontinue collections without notification.</p>
          <p>In the event of a simulated order or price discrepancy, we reserve the right to cancel checkout orders and refund full paid amounts.</p>
        </section>

        <section className="policy-section" id="sec-liability">
          <h2>4. Limitation of Liability</h2>
          <p>Rein Oro Foods shall not be held liable for any indirect, incidental, or consequential damages arising from the use of our products, delivery delays, or platform downtime.</p>
          <p>Snack consumption details (allergens, ingredients) are clearly labeled on product packaging. Customers are advised to review ingredients to prevent allergic reactions.</p>
        </section>

        <section className="policy-section" id="sec-governing">
          <h2>5. Governing Law</h2>
          <p>These terms, purchasing conditions, and digital operations are governed by and construed in accordance with the laws of India. Any legal disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in New Delhi, India.</p>
        </section>
      </>
    )
  },
  shipping: {
    title: 'Shipping Policy',
    sidebar: [
      { id: 'sec-dispatch', label: '1. Dispatch Timelines' },
      { id: 'sec-rates', label: '2. Shipping Rates & Speeds' },
      { id: 'sec-tracking', label: '3. Order Tracking' },
      { id: 'sec-packaging', label: '4. Packaging Standards' },
      { id: 'sec-claims', label: '5. Claims & Damages' }
    ],
    content: (
      <>
        <section className="policy-section" id="sec-dispatch">
          <h2>1. Dispatch Timelines</h2>
          <p>All Rein Oro orders are prepared fresh and slow-roasted in small batches. Orders are processed and dispatched within 24 to 48 hours of order confirmation. We do not dispatch orders on Sundays or local public holidays.</p>
          <p>During peak holiday seasons or corporate gifting events, processing times may extend slightly. Our support team will notify you of any schedule alterations.</p>
        </section>

        <section className="policy-section" id="sec-rates">
          <h2>2. Shipping Rates & Speeds</h2>
          <p>We deliver across major metropolitan cities and regions in India. Delivery rates are calculated at checkout based on order subtotal and chosen delivery speed:</p>
          
          <div className="policy-table-wrapper">
            <table className="policy-table">
              <thead>
                <tr>
                  <th>Delivery Method</th>
                  <th>Order Value Threshold</th>
                  <th>Flat Shipping Fee</th>
                  <th>Estimated Timelines</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Standard Delivery</td>
                  <td>Below ₹999</td>
                  <td>₹99</td>
                  <td>4 - 6 Business Days</td>
                </tr>
                <tr>
                  <td>Standard Delivery</td>
                  <td>₹999 and Above</td>
                  <td>FREE</td>
                  <td>4 - 6 Business Days</td>
                </tr>
                <tr>
                  <td>Express Priority</td>
                  <td>All Orders</td>
                  <td>₹149</td>
                  <td>2 - 3 Business Days</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="policy-callout-box">
            <span className="policy-callout-icon">🚚</span>
            <div className="policy-callout-text">
              <h4>Free Shipping Threshold</h4>
              <p>Add items to your bag crossing ₹999 to automatically qualify for free standard delivery during checkout.</p>
            </div>
          </div>
        </section>

        <section className="policy-section" id="sec-tracking">
          <h2>3. Order Tracking</h2>
          <p>Upon order dispatch from our Delhi sorting chamber, a tracking ID and link will be emailed to your address. You can monitor delivery status in real-time via the tracking portal or inside your Member Dashboard.</p>
        </section>

        <section className="policy-section" id="sec-packaging">
          <h2>4. Packaging Standards</h2>
          <p>To preserve crunchiness, fresh flavors, and natural nutrition, all products are packed in moisture-proof, vacuum-sealed nitrogen chambers and encased inside custom gold-embossed containers before dispatch.</p>
        </section>

        <section className="policy-section" id="sec-claims">
          <h2>5. Claims & Damages</h2>
          <p>We are dedicated to transit safety. If your package is severely damaged or seals are broken upon delivery, please contact our support team within 24 hours with photograph evidence to schedule a priority replacement.</p>
        </section>
      </>
    )
  },
  returns: {
    title: 'Returns & Refunds',
    sidebar: [
      { id: 'sec-window', label: '1. Return Window' },
      { id: 'sec-process', label: '2. Return Process' },
      { id: 'sec-timelines', label: '3. Refund Timelines' },
      { id: 'sec-damaged', label: '4. Damaged Items' },
      { id: 'sec-perishable', label: '5. Perishable Exclusions' }
    ],
    content: (
      <>
        <section className="policy-section" id="sec-window">
          <h2>1. Return Window</h2>
          <p>We take pride in our gourmet snacks. If you are not completely satisfied with your purchase, you may initiate a return or exchange request within <strong>15 days</strong> of product delivery.</p>
          <p>Products must be returned in their original packaging, unused, and with seals intact to be eligible for refunds.</p>
        </section>

        <section className="policy-section" id="sec-process">
          <h2>2. Return Process</h2>
          <p>To initiate a returns courier collection, please perform the following steps:</p>
          <ul>
            <li>Contact our support team at <a href="mailto:wecare.reinoro@gmail.com" style={{ color: 'var(--color-gold)', textDecoration: 'none' }}>wecare.reinoro@gmail.com</a> detailing your order number and reasons for return.</li>
            <li>Our partner logistics courier will schedule a pickup from your delivery address within 48 hours.</li>
            <li>Affix the printed returns label sent by support on the outer box.</li>
          </ul>
        </section>

        <section className="policy-section" id="sec-timelines">
          <h2>3. Refund Timelines</h2>
          <p>Once returned items are received and inspected inside our Delhi warehouse, we will notify you of approval or rejection status. Approved refunds are processed immediately back to the original payment source:</p>
          
          <div className="policy-table-wrapper">
            <table className="policy-table">
              <thead>
                <tr>
                  <th>Payment Source</th>
                  <th>Refund Action Method</th>
                  <th>Estimated Processing Timeline</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>UPI / Paytm Wallet</td>
                  <td>Direct Wallet Credit</td>
                  <td>1 - 2 Business Days</td>
                </tr>
                <tr>
                  <td>Credit / Debit Card</td>
                  <td>Card Bank Reversal</td>
                  <td>5 - 7 Business Days</td>
                </tr>
                <tr>
                  <td>Net Banking</td>
                  <td>Direct Bank Account Transfer</td>
                  <td>3 - 5 Business Days</td>
                </tr>
                <tr>
                  <td>Cash on Delivery (COD)</td>
                  <td>Bank Transfer/Coupon Voucher</td>
                  <td>2 - 4 Business Days</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="policy-section" id="sec-damaged">
          <h2>4. Damaged Items</h2>
          <p>If you receive damaged, defective, or incorrect flavor items, we will arrange a priority dispatch replacement or process a 100% refund without requiring you to return the damaged item. Contact us immediately with receipt details.</p>
        </section>

        <section className="policy-section" id="sec-perishable">
          <h2>5. Perishable Exclusions</h2>
          <p>To maintain absolute safety standards, open snack packets or gift boxes containing open bags cannot be returned or refunded. Only vacuum-sealed, unopened gourmet products qualify for refund processing.</p>
        </section>
      </>
    )
  }
};

export default function Policy({ type }) {
  const data = POLICY_DATA[type] || POLICY_DATA.privacy;
  const [activeSec, setActiveSec] = useState('');

  // Smooth Scroll offset handler
  const handleLinkClick = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const headerOffset = 100;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // Update URL hash safely
      history.pushState(null, null, `#${id}`);
      setActiveSec(id);
    }
  };

  // Scrollspy Intersection Observer
  useEffect(() => {
    const sections = document.querySelectorAll('.policy-section');
    if (sections.length === 0) return;

    const observerOptions = {
      root: null,
      rootMargin: '-120px 0px -60% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSec(entry.target.getAttribute('id'));
        }
      });
    }, observerOptions);

    sections.forEach(sec => observer.observe(sec));

    return () => {
      sections.forEach(sec => observer.unobserve(sec));
    };
  }, [type]);

  return (
    <main style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Policy Hero Section */}
      <header className="policy-hero-section">
        <div className="policy-hero-container">
          <span className="policy-hero-eyebrow">Legal Information</span>
          <h1 className="policy-hero-title">{data.title}</h1>
        </div>
      </header>

      {/* Grid container */}
      <div className="policy-page-container">
        
        {/* Left Sidebar Table of Contents */}
        <aside className="policy-sidebar">
          <h3 className="policy-sidebar-title">{data.title}</h3>
          {data.sidebar.map(item => (
            <a 
              key={item.id} 
              href={`#${item.id}`} 
              className={`policy-sidebar-link ${activeSec === item.id ? 'active' : ''}`}
              onClick={(e) => handleLinkClick(e, item.id)}
            >
              {item.label}
            </a>
          ))}
        </aside>

        {/* Right Article column */}
        <article className="policy-content">
          {data.content}
        </article>

      </div>
    </main>
  );
}
