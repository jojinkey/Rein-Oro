import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
 const handleSubscribe = async (e) => {
  e.preventDefault();
  const emailInput = e.target.querySelector(".newsletter-input");
  const email = emailInput ? emailInput.value : "";
  if (!email) return;

  try {
   const res = await fetch("/api/newsletter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
   });
   const data = await res.json();
   if (!res.ok) {
    throw new Error(data.error || "Failed to subscribe");
   }
   alert("Thank you for subscribing. Welcome to the Royal Circle.");
   e.target.reset();
  } catch (err) {
   alert(`Subscription issue: ${err.message}`);
  }
 };

 return (
  <footer className="footer-section" id="footer-section">
   <div className="footer-container">
    {/* Brand Column */}
    <div className="footer-brand-col">
     <Link to="/" className="footer-logo">
      <img
       src="images/logo.png"
       alt="Rein Oro Logo"
       className="footer-logo-img"
      />
     </Link>
     <p className="brand-tagline">Purity Crowned in Gold.</p>
     <div className="social-links">
      <a
       href="https://www.instagram.com/reinoro.in?igsh=MW4xYnMzMHQzN29qdQ%3D%3D&utm_source=qr"
       aria-label="Instagram"
      >
       <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-instagram"
       >
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
       </svg>
      </a>
      <a href="#" aria-label="Facebook">
       <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-facebook"
       >
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
       </svg>
      </a>
      <a href="#" aria-label="Twitter">
       <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-twitter"
       >
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
       </svg>
      </a>
      <a href="#" aria-label="Pinterest">
       <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-pin"
       >
        <line x1="12" y1="17" x2="12" y2="22" />
        <path d="M5 17h14v-1.76a2 2 0 0 0-.44-1.24l-2.33-2.92a3 3 0 0 1-.64-1.84V6a4 4 0 0 0-8 0v3.24c0 .68-.22 1.33-.63 1.84l-2.33 2.92A2 2 0 0 0 5 15.24Z" />
       </svg>
      </a>
     </div>
    </div>

    {/* Footer Columns */}
    <div className="footer-links-col">
     <h4>Shop</h4>
     <Link to="/shop">All Products</Link>
     <Link to="/shop?category=Makhana">Makhana</Link>
     <Link to="/shop?category=Nuts">Nuts</Link>
     <Link to="/shop">Combos</Link>
     <Link to="/shop">New Arrivals</Link>
    </div>

    <div className="footer-links-col">
     <h4>Collections</h4>
     <Link to="/shop?category=Nuts">Premium Nuts</Link>
     <Link to="/shop?category=Makhana">Makhana Collection</Link>
     <Link to="/shop">Healthy Snacks</Link>
     <Link to="/shop">Roasted Nuts</Link>
    </div>

    <div className="footer-links-col">
     <h4>Customer Care</h4>
     <Link to="/dashboard">Track Order</Link>
     <Link to="/shipping">Shipping Policy</Link>
     <Link to="/returns">Returns & Refunds</Link>
     <Link to="/contact">Concierge Help</Link>
     <Link to="/contact">Contact Us</Link>
    </div>

    <div className="footer-links-col">
     <h4>Company</h4>
     <Link to="/about">About Us</Link>
     <Link to="/about">Our Story</Link>
     <Link to="/contact">Corporate Gifting</Link>
    </div>

    {/* Newsletter Column */}
    <div className="footer-links-col newsletter-col">
     <h4>Newsletter</h4>
     <p>
      Subscribe for product launches, offers, healthy snacking tips, and
      exclusive discounts.
     </p>
     <form className="newsletter-form" onSubmit={handleSubscribe}>
      <input
       type="email"
       className="newsletter-input"
       placeholder="Enter your email"
       required
       aria-label="Email address"
      />
      <button type="submit" className="btn btn-primary subscribe-btn">
       Subscribe
      </button>
     </form>
    </div>
   </div>

   <div className="footer-bottom">
    <p>
     &copy; {new Date().getFullYear()} Rein Oro Luxury Foods. All rights
     reserved.
    </p>
    <div className="footer-bottom-links">
     <Link to="/terms">Terms & Conditions</Link> &bull;{" "}
     <Link to="/privacy">Privacy Policy</Link>
    </div>
    <div
     className="footer-bottom-payments"
     style={{
      display: "flex",
      gap: "0.6rem",
      alignItems: "center",
      color: "var(--color-muted)",
     }}
    >
     <span
      style={{
       fontSize: "0.65rem",
       border: "1px solid rgba(255,255,255,0.12)",
       padding: "2px 6px",
       borderRadius: "3px",
       letterSpacing: "0.05em",
       fontWeight: 600,
       opacity: 0.6,
      }}
     >
      VISA
     </span>
     <span
      style={{
       fontSize: "0.65rem",
       border: "1px solid rgba(255,255,255,0.12)",
       padding: "2px 6px",
       borderRadius: "3px",
       letterSpacing: "0.05em",
       fontWeight: 600,
       opacity: 0.6,
      }}
     >
      MASTERCARD
     </span>
     <span
      style={{
       fontSize: "0.65rem",
       border: "1px solid rgba(255,255,255,0.12)",
       padding: "2px 6px",
       borderRadius: "3px",
       letterSpacing: "0.05em",
       fontWeight: 600,
       opacity: 0.6,
      }}
     >
      UPI
     </span>
     <span
      style={{
       fontSize: "0.65rem",
       border: "1px solid rgba(255,255,255,0.12)",
       padding: "2px 6px",
       borderRadius: "3px",
       letterSpacing: "0.05em",
       fontWeight: 600,
       opacity: 0.6,
      }}
     >
      RUPAY
     </span>
    </div>
   </div>
  </footer>
 );
}
