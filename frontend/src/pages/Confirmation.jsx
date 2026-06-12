import React, { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CartContext } from "../App.jsx";
import { apiUrl } from "../config/api.js";

export default function Confirmation() {
 const navigate = useNavigate();
 const { addToCart } = useContext(CartContext);
 const [order, setOrder] = useState(null);
 const [products, setProducts] = useState([]);
 const [addedMessage, setAddedMessage] = useState("");

 useEffect(() => {
  fetch(apiUrl("/api/products"))
   .then((res) => res.json())
   .then((data) => {
    const orderItemIds =
     order && order.items ? order.items.map((item) => item.id) : [];
    const upsellCandidates = data.filter((p) => !orderItemIds.includes(p.id));
    setProducts(upsellCandidates.slice(0, 3));
   })
   .catch((err) => console.error("Failed to load upsell products:", err));
 }, [order]);

 useEffect(() => {
  const lastOrderData = localStorage.getItem("rein_oro_last_order");
  if (!lastOrderData) {
   navigate("/");
   return;
  }
  try {
   setOrder(JSON.parse(lastOrderData));
  } catch {
   navigate("/");
  }
 }, [navigate]);

 if (!order) return null;

 return (
  <main className="cart-page-main">
   <div className="confirmation-layout">
    {/* Header checkmark */}
    <section className="thank-you-header">
     <div className="success-checkmark-circle">
      <svg
       xmlns="http://www.w3.org/2000/svg"
       width="32"
       height="32"
       viewBox="0 0 24 24"
       fill="none"
       stroke="currentColor"
       strokeWidth="2.5"
       strokeLinecap="round"
       strokeLinejoin="round"
      >
       <polyline points="20 6 9 17 4 12" />
      </svg>
     </div>
     <h1>Thank You!</h1>
     <p>
      Your order has been placed successfully. A receipt has been sent to your
      email.
     </p>

     <div className="order-id-badge">
      <span>Order ID:</span> &nbsp;
      <span className="badge-val">{order.orderId || order.id}</span>
     </div>
    </section>

    {/* Receipt Columns Grid */}
    <section className="confirmation-columns-grid">
     {/* Column 1: Order Details */}
     <div className="receipt-col-card">
      <h3 className="card-title">Order Details</h3>
      <div className="card-content">
       <div>
        <span className="label">Order Date:</span>
        <span className="value">{order.date}</span>
       </div>
       <div>
        <span className="label">Estimated Delivery:</span>
        <span className="value">{order.estDelivery}</span>
       </div>
       <div>
        <span className="label">Payment Method:</span>
        <span className="value">{order.paymentMethod}</span>
       </div>
       <button
        className="btn btn-outline"
        onClick={() => navigate("/dashboard")}
        style={{ width: "100%", marginTop: "1rem", height: "40px", padding: 0 }}
       >
        Track Your Order
       </button>
      </div>
     </div>

     {/* Column 2: Order Summary */}
     <div className="receipt-col-card">
      <h3 className="card-title">Summary</h3>

      {/* Scrollable Items */}
      <div className="receipt-items-list">
       {order.items.map((item, i) => (
        <div key={i} className="item-row">
         <span className="item-name">
          {item.name} <span className="item-qty">x{item.qty}</span>
         </span>
         <span className="item-price">₹{item.price * item.qty}</span>
        </div>
       ))}
      </div>

      <div className="summary-footer">
       <div className="summary-row">
        <span className="label">Subtotal</span>
        <span className="value">₹{order.subtotal}</span>
       </div>
       {order.discount > 0 && (
        <div className="summary-row">
         <span className="label">Discount</span>
         <span className="discount-value">-₹{order.discount}</span>
        </div>
       )}
       <div className="summary-row">
        <span className="label">Shipping</span>
        <span className="value">
         {order.shipping === 0 ? "Free" : `₹${order.shipping}`}
        </span>
       </div>
       <div className="summary-row">
        <span className="label">Tax (18%)</span>
        <span className="value">₹{order.tax}</span>
       </div>
       {order.codFee > 0 && (
        <div className="summary-row">
         <span className="label">COD Fee</span>
         <span className="value">₹{order.codFee}</span>
        </div>
       )}
       <hr className="divider" />
       <div className="summary-total">
        <span className="label">Total Paid</span>
        <span className="total-value">₹{order.total}</span>
       </div>
      </div>
     </div>

     {/* Column 3: Branding Promotion */}
     <div className="receipt-col-card highlight-card">
      <img src="images/logo.png" alt="Rein Oro Crown" className="brand-logo" />
      <h4 className="brand-tagline">Purity. Passion. Perfection.</h4>
      <p className="brand-desc">
       Crafted with love, delivered with care. Your snacks are prepared inside
       highly sanitized, vacuum-sealed chambers and shipped securely to retain
       maximum crunch. Thank you for choosing Rein Oro.
      </p>
     </div>
    </section>

    {/* Progress tracking timeline */}
    <section className="confirmation-timeline-section">
     <h2 className="timeline-heading">Delivery Progress Timeline</h2>

     <div className="confirmation-timeline-container">
      {/* Horizontal Timeline Connector */}
      <div className="timeline-line">
       <div className="timeline-progress-fill"></div>
      </div>

      {[
       { label: "Order Placed", desc: "Confirmed", active: true },
       { label: "Packing", desc: "In Progress", active: false },
       { label: "On The Way", desc: "Pending", active: false },
       { label: "Delivered", desc: "Estimated 4-6 Days", active: false },
      ].map((step, idx) => (
       <div
        key={idx}
        className={`timeline-step ${step.active ? "active" : ""}`}
       >
        <div className={`timeline-dot ${step.active ? "active" : ""}`}>
         {idx + 1}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
         <h4 className="step-label" style={{ margin: 0 }}>
          {step.label}
         </h4>
         <p className="step-desc" style={{ margin: "2px 0 0 0" }}>
          {step.desc}
         </p>
        </div>
       </div>
      ))}
     </div>
    </section>

    {/* Post-Purchase Upsell Section */}
    {products.length > 0 && (
     <section
      className="confirmation-upsell-section"
      style={{
       marginTop: "4rem",
       borderTop: "1px solid rgba(255,255,255,0.04)",
       paddingTop: "3rem",
      }}
     >
      <h2
       className="timeline-heading"
       style={{ marginBottom: "0.5rem", textAlign: "center" }}
      >
       Complete Your Collection
      </h2>
      <p
       style={{
        color: "var(--color-muted)",
        fontSize: "0.9rem",
        marginBottom: "2rem",
        textAlign: "center",
       }}
      >
       Add these royal snacks to your next delivery for an exclusive taste.
      </p>
      {addedMessage && (
       <div
        style={{
         backgroundColor: "rgba(201,168,76,0.1)",
         border: "1px solid var(--color-gold)",
         color: "var(--color-white)",
         padding: "1rem",
         borderRadius: "4px",
         textAlign: "center",
         marginBottom: "1.5rem",
         fontSize: "0.9rem",
        }}
       >
        {addedMessage}
       </div>
      )}
      <div
       className="products-grid"
       style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "2rem",
       }}
      >
       {products.map((p) => (
        <div
         key={p.id}
         className="product-card"
         style={{
          border: "1px solid rgba(201,168,76,0.12)",
          borderRadius: "4px",
          overflow: "hidden",
          backgroundColor: "#141414",
          transition: "transform 0.3s",
         }}
        >
         <div
          style={{
           height: "220px",
           backgroundColor: "#1C1A16",
           display: "flex",
           alignItems: "center",
           justifyContent: "center",
           position: "relative",
          }}
         >
          <img
           src={p.image}
           alt={p.title}
           style={{ maxHeight: "80%", maxWidth: "80%", objectFit: "contain" }}
          />
         </div>
         <div style={{ padding: "1.5rem", textAlign: "center" }}>
          <h3
           style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.2rem",
            color: "var(--color-white)",
            marginBottom: "0.4rem",
           }}
          >
           {p.title}
          </h3>
          <p
           style={{
            fontSize: "0.78rem",
            color: "var(--color-gold)",
            textTransform: "uppercase",
            marginBottom: "0.5rem",
           }}
          >
           {p.flavor} &bull; {p.weight}
          </p>
          <p
           style={{
            fontFamily: "var(--font-body)",
            fontSize: "1.1rem",
            color: "var(--color-gold)",
            fontWeight: 500,
            marginBottom: "1.2rem",
           }}
          >
           ₹{p.price}
          </p>
          <button
           className="btn btn-primary"
           onClick={() => {
            addToCart(p, 1);
            setAddedMessage(`"${p.title}" added to your next order bag!`);
            setTimeout(() => setAddedMessage(""), 5000);
           }}
           style={{ width: "100%", height: "40px", padding: 0 }}
          >
           Add to Next Order
          </button>
         </div>
        </div>
       ))}
      </div>
     </section>
    )}
   </div>
  </main>
 );
}
