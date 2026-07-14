import React, { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CartContext } from "../App.jsx";
import { apiUrl } from "../config/api.js";
import { getGstSellerProfile } from "../config/gstProfile.js";

const formatINR = (value) =>
 `Rs. ${Math.round(Number(value || 0)).toLocaleString("en-IN")}`;

function escapeHtml(value) {
 return String(value || "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");
}

function getOrderInvoice(order) {
 return order?.gst_invoice || order?.invoice || null;
}

function getSellerAddressLines(seller = {}) {
 if (Array.isArray(seller.address_lines) && seller.address_lines.length) {
  return seller.address_lines;
 }
 return seller.address ? [seller.address] : [];
}

function buildInvoiceHtml(order = {}) {
 const invoice = getOrderInvoice(order);
 if (!invoice) return "";
 const buyer = invoice.buyer || {};
 const seller = getGstSellerProfile(invoice.seller || {});
 const address = buyer.address || {};

 const formatINR = (val) => {
  const num = Number(val || 0);
  return "Rs. " + num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
 };

 const escapeHtml = (str) => {
  return String(str || "")
   .replace(/&/g, "&amp;")
   .replace(/</g, "&lt;")
   .replace(/>/g, "&gt;")
   .replace(/"/g, "&quot;")
   .replace(/'/g, "&#039;");
 };

 const sellerAddressRows = getSellerAddressLines(seller)
  .map((line) => `<p style="margin: 2px 0;">${escapeHtml(line)}</p>`)
  .join("");

 const sellerState = seller.state || "Uttarakhand";
 const buyerState = address.state || buyer.state || "";
 const isIntraState = sellerState.trim().toLowerCase() === buyerState.trim().toLowerCase();

 const rawSubtotal = Number(invoice.subtotal || order.subtotal || 0);
 const rawDiscount = Number(invoice.discount || order.discount || 0);
 const shipping = Number(invoice.shipping || order.shipping || 0);

 // Taxable Value is subtotal - discount (product value)
 const taxableBase = Math.max(0, rawSubtotal - rawDiscount);

 // GST amount (18% of taxable base)
 const totalGst = Math.round(taxableBase * 0.18);
 const cgst = isIntraState ? Math.round(totalGst / 2) : 0;
 const sgst = isIntraState ? Math.round(totalGst / 2) : 0;
 const igst = isIntraState ? 0 : totalGst;

 const totalVal = taxableBase + totalGst + shipping;

 const shippingRow = shipping > 0
  ? `
    <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px;">
      <span style="color: #555;">Delivery Charges</span>
      <strong style="color: #111;">${formatINR(shipping)}</strong>
    </div>`
  : "";

 const itemRows = (invoice.items || [])
  .map(
   (item) => `
    <tr style="border-bottom: 1px solid #eee;">
     <td style="padding: 10px 12px; color: #111; font-size: 13px; text-align: left; border: 1px solid #ddd;">
       <div style="font-weight: bold; color: #111;">${escapeHtml(item.name)}</div>
       ${item.flavor ? `<div style="color: #666; font-size: 11px;">Flavor: ${escapeHtml(item.flavor)}</div>` : ""}
       ${item.weight ? `<div style="color: #666; font-size: 11px;">Weight: ${escapeHtml(item.weight)}</div>` : ""}
     </td>
     <td style="padding: 10px 12px; color: #333; font-size: 13px; text-align: left; border: 1px solid #ddd;">${escapeHtml(item.hsn || "-")}</td>
     <td style="padding: 10px 12px; color: #333; font-size: 13px; text-align: left; border: 1px solid #ddd;">${escapeHtml(item.qty)}</td>
     <td style="padding: 10px 12px; color: #333; font-size: 13px; text-align: left; border: 1px solid #ddd;">${formatINR(item.unit_price)}</td>
     <td style="padding: 10px 12px; color: #111; font-size: 13px; text-align: right; font-weight: bold; border: 1px solid #ddd;">${formatINR(item.line_total)}</td>
    </tr>
   `,
  )
  .join("");

 return `
  <!doctype html>
  <html>
   <head>
    <title>${escapeHtml(invoice.invoice_no)}</title>
    <style>
     * { box-sizing: border-box; }
     body {
       font-family: Arial, sans-serif;
       color: #111;
       background: #fff;
       padding: 0;
       margin: 0;
     }
     .invoice-card {
       background: #ffffff;
       padding: 10px;
       max-width: 800px;
       margin: 0 auto;
     }
     table {
       width: 100%;
       border-collapse: collapse;
       margin: 15px 0;
     }
     th {
       color: #000;
       background: #f2f2f2;
       font-weight: bold;
       text-transform: uppercase;
       font-size: 11px;
       letter-spacing: 0.05em;
       padding: 10px 12px;
       text-align: left;
       border: 1px solid #ddd;
     }
     .grand-total {
       border-top: 2px solid #000;
       padding-top: 8px;
       margin-top: 4px;
       color: #000 !important;
       font-size: 16px !important;
       font-weight: bold;
     }
     .footer-note {
         text-align: left;
         font-size: 13px;
         color: #111;
         margin-top: 35px;
         line-height: 1.5;
       }
     </style>
    </head>
    <body>
     <div class="invoice-card">
       <table style="width: 100%; margin-bottom: 25px; border: none !important;">
         <tr style="border: none !important;">
           <td style="text-align: left; width: 50%; vertical-align: top; border: none !important; padding: 0;">
             <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #000;">Tax Invoice</h1>
             <p style="margin: 12px 0 4px 0; font-size: 13px; color: #111;"><strong>Invoice No:</strong> ${escapeHtml(invoice.invoice_no)}</p>
             <p style="margin: 4px 0; font-size: 13px; color: #111;"><strong>Order ID:</strong> ${escapeHtml(invoice.order_id || order.id || order.orderId)}</p>
             <p style="margin: 4px 0; font-size: 13px; color: #111;"><strong>Date:</strong> ${new Date(invoice.invoice_date || Date.now()).toLocaleString("en-IN")}</p>
           </td>
           <td style="text-align: right; width: 50%; vertical-align: top; border: none !important; padding: 0;">
             <h2 style="margin: 0 0 6px 0; font-size: 22px; font-weight: bold; color: #000;">REIN ORO FOODS</h2>
             <p style="margin: 3px 0; font-size: 13px; color: #333;"><strong>Legal Name:</strong> ${escapeHtml(seller.legal_name || "VAIBHAV SINGH PANWAR")}</p>
             <p style="margin: 3px 0; font-size: 13px; color: #333;"><strong>GSTIN / Registration No.:</strong> ${escapeHtml(seller.gstin || "05GMOPP5339F1ZN")}</p>
             <p style="margin: 3px 0; font-size: 13px; color: #333;"><strong>Constitution:</strong> Proprietorship</p>
             <p style="margin: 3px 0; font-size: 13px; color: #333;">Building No./Flat No.: 499/3</p>
             <p style="margin: 3px 0; font-size: 13px; color: #333;">Street Number 11, Rajender Nagar</p>
             <p style="margin: 3px 0; font-size: 13px; color: #333;">Near Vashu Electricals & All Dish Services</p>
             <p style="margin: 3px 0; font-size: 13px; color: #333;">Roorkee, Haridwar, Uttarakhand - 247667</p>
           </td>
         </tr>
       </table>
       
       <div style="border-bottom: 1px solid #ddd; margin-bottom: 20px;"></div>
       
       <div style="border: 1px solid #ddd; border-radius: 6px; padding: 15px; background: #fafafa; margin-bottom: 20px;">
        <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; text-transform: uppercase; color: #000; border-bottom: 1px solid #eee; padding-bottom: 4px;">Bill To</h3>
        <p style="margin: 4px 0; font-size: 13px; font-weight: bold; color: #000;">${escapeHtml(buyer.name || order.customer_email || order.user_email)}</p>
        <p style="margin: 3px 0; font-size: 13px; color: #333;">${escapeHtml(buyer.email || order.customer_email || order.user_email)} | ${escapeHtml(buyer.phone || order.customer_phone || address.phone || "-")}</p>
        <p style="margin: 3px 0; font-size: 13px; color: #333;"><strong>GSTIN:</strong> ${escapeHtml(buyer.gstin || "-")}</p>
        <p style="margin: 3px 0; font-size: 13px; color: #333;">${escapeHtml(address.street || "")} ${escapeHtml(address.apartment || "")}</p>
        <p style="margin: 3px 0; font-size: 13px; color: #333;">${escapeHtml(address.city || "")}, ${escapeHtml(address.state || "")} ${escapeHtml(address.pincode || "")}</p>
      </div>

      <table style="width: 100%; border: 1px solid #ddd; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="border: 1px solid #ddd; background: #f2f2f2; padding: 10px; font-size: 12px; text-align: left;">Item</th>
            <th style="border: 1px solid #ddd; background: #f2f2f2; padding: 10px; font-size: 12px; text-align: left;">HSN</th>
            <th style="border: 1px solid #ddd; background: #f2f2f2; padding: 10px; font-size: 12px; text-align: left;">Qty</th>
            <th style="border: 1px solid #ddd; background: #f2f2f2; padding: 10px; font-size: 12px; text-align: left;">Rate</th>
            <th style="border: 1px solid #ddd; background: #f2f2f2; padding: 10px; font-size: 12px; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>
      
      <table style="width: 100%; margin-top: 15px; border: none !important;">
        <tr style="border: none !important;">
          <td style="width: 55%; text-align: left; padding-right: 20px; vertical-align: top; border: none !important;">
            <p style="margin: 0; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #000; border-bottom: 1px solid #eee; padding-bottom: 4px;">Payment Information</p>
            <p style="margin: 6px 0 3px 0; font-size: 13px; color: #333;"><strong>Method:</strong> ${escapeHtml(order.payment_method || invoice.payment_method || "Paid via Razorpay Online")}</p>
            <p style="margin: 3px 0; font-size: 13px; color: #333;"><strong>Transaction ID:</strong> ${escapeHtml(invoice.payment_id || order.payment_id || "-")}</p>
            <p style="margin: 3px 0; font-size: 13px; color: #333;"><strong>Place of Supply:</strong> ${escapeHtml(invoice.place_of_supply || buyerState || "Uttarakhand")}</p>
            <p style="margin: 3px 0; font-size: 13px; color: #333;"><strong>Tax Type:</strong> ${isIntraState ? "CGST + SGST (Intra-State)" : "IGST (Inter-State)"}</p>
          </td>
          <td style="width: 45%; vertical-align: top; border: none !important;">
            <div style="width: 100%;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px;">
                <span style="color: #555;">Taxable Value</span>
                <strong style="color: #111;">${formatINR(taxableBase)}</strong>
              </div>
              ${shippingRow}
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px;">
                <span style="color: #555;">CGST (9%)</span>
                <strong style="color: #111;">${formatINR(cgst)}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px;">
                <span style="color: #555;">SGST (9%)</span>
                <strong style="color: #111;">${formatINR(sgst)}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px;">
                <span style="color: #555;">IGST (18%)</span>
                <strong style="color: #111;">${formatINR(igst)}</strong>
              </div>
              <div class="grand-total" style="display: flex; justify-content: space-between; font-size: 16px;">
                <span>Total</span>
                <strong>${formatINR(totalVal)}</strong>
              </div>
            </div>
          </td>
        </tr>
      </table>
      
      <p class="footer-note">
        This is a system-generated invoice and does not require a physical signature.<br/>
        Website: <strong>www.reinoro.com</strong> | Thank you for shopping with us!
      </p>
     </div>
    </body>
   </html>
  `;
}

const loadHtml2Pdf = () => {
 return new Promise((resolve, reject) => {
  if (window.html2pdf) {
   resolve(window.html2pdf);
   return;
  }
  const script = document.createElement("script");
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
  script.crossOrigin = "anonymous";
  script.referrerPolicy = "no-referrer";
  script.onload = () => resolve(window.html2pdf);
  script.onerror = (err) => reject(err);
  document.body.appendChild(script);
 });
};

async function printInvoice(order) {
 const invoice = order?.gst_invoice || order?.invoice || null;
 if (!invoice) {
  alert("GST invoice is not available for this order yet.");
  return;
 }
 const html = buildInvoiceHtml(order);
 if (!html) return;

 try {
  const html2pdf = await loadHtml2Pdf();
  const element = document.createElement("div");
  const styleStart = html.indexOf("<style>");
  const styleEnd = html.indexOf("</style>");
  const styleTag = styleStart !== -1 && styleEnd !== -1 
   ? html.substring(styleStart, styleEnd + 8) 
   : "";
  const bodyContent = html.substring(html.indexOf("<body>") + 6, html.indexOf("</body>"));
  element.innerHTML = `
    ${styleTag}
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #111; max-width: 800px; margin: 0 auto; background: #fff;">
      ${bodyContent}
    </div>
  `;
  const scripts = element.getElementsByTagName("script");
  for (let i = scripts.length - 1; i >= 0; i--) {
   scripts[i].parentNode.removeChild(scripts[i]);
  }

  const opt = {
   margin: [0.5, 0.5, 0.5, 0.5],
   filename: `${invoice.invoice_no}.pdf`,
   image: { type: "jpeg", quality: 0.98 },
   html2canvas: { scale: 2, logging: false, useCORS: true, scrollY: 0, scrollX: 0 },
   jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
  };

  await html2pdf().from(element).set(opt).save();
 } catch (err) {
  console.error("PDF generation failed:", err);
  alert("Failed to download PDF invoice. Please check your connection.");
 }
}

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
 const invoice = getOrderInvoice(order);
 const seller = invoice ? getGstSellerProfile(invoice.seller || {}) : null;
 const sellerAddressLines = seller ? getSellerAddressLines(seller) : [];
 const buyer = invoice?.buyer || {};
 const buyerAddress = buyer.address || {};
 const invoiceItems = Array.isArray(invoice?.items) ? invoice.items : [];

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
        {order.status === "Delivered" ? (
         <>
          <span className="label">Delivery Status:</span>
          <span className="value" style={{ color: "#10b981", fontWeight: 600 }}>✓ Delivered</span>
         </>
        ) : (
         <>
          <span className="label">Estimated Delivery:</span>
          <span className="value">{order.estDelivery || order.est_delivery}</span>
         </>
        )}
       </div>
       <div>
        <span className="label">Payment Method:</span>
       <span className="value">{order.paymentMethod || order.payment_method}</span>
       </div>
       {invoice && (
        <div>
         <span className="label">GST Invoice:</span>
         <span className="value">{invoice.invoice_no}</span>
        </div>
       )}
       <button
        className="btn btn-outline"
        onClick={() => navigate("/dashboard")}
        style={{ width: "100%", marginTop: "1rem", height: "40px", padding: 0 }}
       >
        Track Your Order
       </button>
       {invoice && (
        <button
         className="btn btn-primary"
         onClick={() => printInvoice(order)}
         style={{ width: "100%", marginTop: "0.8rem", height: "40px", padding: 0 }}
        >
         Download GST invoice
        </button>
       )}
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

    {invoice && seller && (
     <section className="gst-invoice-preview-section" style={{ background: "rgba(15,15,15,0.4)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", padding: "1.5rem", marginTop: "2rem" }}>
      <div className="gst-invoice-preview-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "1rem" }}>
       <div>
        <span className="gst-invoice-kicker" style={{ textTransform: "uppercase", fontSize: "0.68rem", color: "var(--color-gold)", letterSpacing: "0.05em" }}>GST Tax Invoice</span>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.4rem", fontWeight: 300, color: "var(--color-white)", margin: "0.2rem 0 0 0" }}>{invoice.invoice_no}</h2>
        <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.75rem", color: "var(--color-muted)" }}>Generated after verified Razorpay payment.</p>
       </div>
       <button
        className="btn btn-primary"
        onClick={() => printInvoice(order)}
        type="button"
        style={{ height: "36px", padding: "0 1.2rem", fontSize: "0.75rem" }}
       >
        Download GST invoice
       </button>
      </div>

      <div 
        style={{ 
          background: "#fff", 
          color: "#111", 
          borderRadius: "6px", 
          padding: "15px", 
          overflowX: "auto"
        }}
        dangerouslySetInnerHTML={{ 
          __html: (() => {
            const htmlInvoice = buildInvoiceHtml(order);
            const styleStart = htmlInvoice.indexOf("<style>");
            const styleEnd = htmlInvoice.indexOf("</style>");
            const styleTag = styleStart !== -1 && styleEnd !== -1 
              ? htmlInvoice.substring(styleStart, styleEnd + 8) 
              : "";
            const bodyContent = htmlInvoice.substring(
              htmlInvoice.indexOf("<body>") + 6, 
              htmlInvoice.indexOf("</body>")
            );
            return `${styleTag}${bodyContent}`;
          })()
        }}
      />
     </section>
    )}

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
