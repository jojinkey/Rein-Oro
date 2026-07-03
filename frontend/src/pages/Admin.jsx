import React, { useState, useEffect, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext, CMSContext } from "../App.jsx";
import { apiUrl } from "../config/api.js";
import { getGstSellerProfile } from "../config/gstProfile.js";

// Scoped fetch helper to ensure all API calls in this file use the env-configured backend url
const originalFetch = window.fetch;
const fetch = (resource, options) => {
 if (typeof resource === 'string' && resource.startsWith('/api') && !resource.startsWith('http')) {
  return originalFetch(apiUrl(resource), options);
 }
 return originalFetch(resource, options);
};

const getSelectorLabel = (selector) => {
 const labels = {
  "#scene-1 .eyebrow": "Home Page Hero Eyebrow Text",
  "#scene-1 h1": "Home Page Hero Title Text",
  "#scene-1 p": "Home Page Hero Paragraph Text",
  "#scene-5 h2": "Home Page Mid-Section Title Text",
  ".gifting-title": "Home Page Gifting Section Title",
  ".gifting-body": "Home Page Gifting Section Description",
  ".gift-box-img": "Home Page Gifting Section Image Path",
  ".craft-img-1": "Craft Section Image 1 (Slow Roasted)",
  ".craft-img-2": "Craft Section Image 2 (No Preservatives)",
  ".craft-img-3": "Craft Section Image 3 (Hygienic Pack)",
  ".craft-img-4": "Craft Section Image 4 (Finest Selection)",
  ".about-hero-section h1": "About Page Hero Title",
  ".about-hero-section p": "About Page Hero Subtitle",
  ".about-hero-img": "About Page Hero Image",
  ".about-sourcing-title": "About Page Sourcing Title",
  ".about-sourcing-body": "About Page Sourcing Description",
  ".about-sourcing-img": "About Page Sourcing Section Image",
  ".about-craft-title": "About Page Craftsmanship Title",
  ".about-craft-body": "About Page Craftsmanship Description",
  ".about-values-title": "About Page Core Values Title",
  ".about-values-body": "About Page Core Values Description",
  ".about-values-img": "About Page Core Values Image",
  ".about-cta-title": "About Page Bottom CTA Title",
  ".about-cta-body": "About Page Bottom CTA Description",
  ".about-cta-img": "About Page Bottom CTA Image",
  ".contact-header h1": "Contact Page Hero Title",
  ".contact-header p": "Contact Page Hero Subtitle",
  ".contact-address": "Contact Address Details",
  ".contact-email-1": "Customer Support Email",
  ".contact-email-2": "Business Support Email",
  ".contact-phone-1": "Customer Support Phone Number",
  ".contact-phone-2": "WhatsApp Phone Number",
  ".contact-hours": "Business Hours",
 };
 return labels[selector] || selector;
};

// Inline SVG Icon Helpers for Luxury Aesthetic
const IconDashboard = () => (
 <svg
  className="admin-dash-menu-icon"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  style={{ width: "16px", height: "16px" }}
 >
  <rect x="3" y="3" width="7" height="9" />
  <rect x="14" y="3" width="7" height="5" />
  <rect x="14" y="12" width="7" height="9" />
  <rect x="3" y="16" width="7" height="5" />
 </svg>
);
const IconPages = () => (
 <svg
  className="admin-dash-menu-icon"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  style={{ width: "16px", height: "16px" }}
 >
  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
  <polyline points="14 2 14 8 20 8" />
  <line x1="16" y1="13" x2="8" y2="13" />
  <line x1="16" y1="17" x2="8" y2="17" />
  <line x1="10" y1="9" x2="8" y2="9" />
 </svg>
);
const IconProducts = () => (
 <svg
  className="admin-dash-menu-icon"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  style={{ width: "16px", height: "16px" }}
 >
  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
  <line x1="12" y1="22.08" x2="12" y2="12" />
 </svg>
);
const IconCategories = () => (
 <svg
  className="admin-dash-menu-icon"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  style={{ width: "16px", height: "16px" }}
 >
  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
 </svg>
);
const IconBanners = () => (
 <svg
  className="admin-dash-menu-icon"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  style={{ width: "16px", height: "16px" }}
 >
  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
  <circle cx="8.5" cy="8.5" r="1.5" />
  <polyline points="21 15 16 10 5 21" />
 </svg>
);
const IconMedia = () => (
 <svg
  className="admin-dash-menu-icon"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  style={{ width: "16px", height: "16px" }}
 >
  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
  <circle cx="12" cy="13" r="4" />
 </svg>
);
const IconTestimonials = () => (
 <svg
  className="admin-dash-menu-icon"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  style={{ width: "16px", height: "16px" }}
 >
  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
 </svg>
);
const IconBlog = () => (
 <svg
  className="admin-dash-menu-icon"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  style={{ width: "16px", height: "16px" }}
 >
  <path d="M12 20h9" />
  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
 </svg>
);
const IconFAQ = () => (
 <svg
  className="admin-dash-menu-icon"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  style={{ width: "16px", height: "16px" }}
 >
  <circle cx="12" cy="12" r="10" />
  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
  <line x1="12" y1="17" x2="12.01" y2="17" />
 </svg>
);
const IconOrders = () => (
 <svg
  className="admin-dash-menu-icon"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  style={{ width: "16px", height: "16px" }}
 >
  <circle cx="9" cy="21" r="1" />
  <circle cx="20" cy="21" r="1" />
  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
 </svg>
);
const IconCustomers = () => (
 <svg
  className="admin-dash-menu-icon"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  style={{ width: "16px", height: "16px" }}
 >
  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
  <circle cx="9" cy="7" r="4" />
  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
 </svg>
);
const IconEnquiries = () => (
 <svg
  className="admin-dash-menu-icon"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  style={{ width: "16px", height: "16px" }}
 >
  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
  <polyline points="22,6 12,13 2,6" />
 </svg>
);
const IconCoupons = () => (
 <svg
  className="admin-dash-menu-icon"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  style={{ width: "16px", height: "16px" }}
 >
  <path d="M15 5H3a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z" />
  <path d="M21 7h-2v10h2a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
  <circle cx="6" cy="12" r="1" />
  <circle cx="12" cy="12" r="1" />
 </svg>
);
const IconNewsletter = () => (
 <svg
  className="admin-dash-menu-icon"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  style={{ width: "16px", height: "16px" }}
 >
  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
  <line x1="22" y1="6" x2="12" y2="13" />
  <line x1="2" y1="6" x2="12" y2="13" />
 </svg>
);
const IconSEO = () => (
 <svg
  className="admin-dash-menu-icon"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  style={{ width: "16px", height: "16px" }}
 >
  <circle cx="11" cy="11" r="8" />
  <line x1="21" y1="21" x2="16.65" y2="16.65" />
 </svg>
);
const IconSettings = () => (
 <svg
  className="admin-dash-menu-icon"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  style={{ width: "16px", height: "16px" }}
 >
  <circle cx="12" cy="12" r="3" />
  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
 </svg>
);
const IconPayment = () => (
 <svg
  className="admin-dash-menu-icon"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  style={{ width: "16px", height: "16px" }}
 >
  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
  <line x1="1" y1="10" x2="23" y2="10" />
 </svg>
);
const IconShipping = () => (
 <svg
  className="admin-dash-menu-icon"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  style={{ width: "16px", height: "16px" }}
 >
  <rect x="1" y="3" width="15" height="13" />
  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
  <circle cx="5.5" cy="18.5" r="2.5" />
  <circle cx="18.5" cy="18.5" r="2.5" />
 </svg>
);
const IconUsers = () => (
 <svg
  className="admin-dash-menu-icon"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  style={{ width: "16px", height: "16px" }}
 >
  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
  <circle cx="12" cy="7" r="4" />
 </svg>
);
const IconViewSite = () => (
 <svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  style={{ width: "14px", height: "14px" }}
 >
  <circle cx="12" cy="12" r="10" />
  <line x1="2" y1="12" x2="22" y2="12" />
  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
 </svg>
);
const IconSearch = () => (
 <svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  style={{ width: "14px", height: "14px" }}
 >
  <circle cx="11" cy="11" r="8" />
  <line x1="21" y1="21" x2="16.65" y2="16.65" />
 </svg>
);
const IconBell = () => (
 <svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  style={{ width: "18px", height: "18px" }}
 >
  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
 </svg>
);
const IconHamburger = () => (
 <svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  style={{ width: "18px", height: "18px" }}
 >
  <line x1="3" y1="12" x2="21" y2="12" />
  <line x1="3" y1="6" x2="21" y2="6" />
  <line x1="3" y1="18" x2="21" y2="18" />
 </svg>
);
const IconTrendingUp = () => (
 <svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2.5"
  strokeLinecap="round"
  strokeLinejoin="round"
  style={{ width: "12px", height: "12px" }}
 >
  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
  <polyline points="17 6 23 6 23 12" />
 </svg>
);
const IconShoppingBag = () => (
 <svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  style={{ width: "16px", height: "16px" }}
 >
  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
  <line x1="3" y1="6" x2="21" y2="6" />
  <path d="M16 10a4 4 0 0 1-8 0" />
 </svg>
);
const IconDollar = () => (
 <svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  style={{ width: "16px", height: "16px" }}
 >
  <line x1="12" y1="1" x2="12" y2="23" />
  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
 </svg>
);
const IconUsersGroup = () => (
 <svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  style={{ width: "16px", height: "16px" }}
 >
  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
  <circle cx="9" cy="7" r="4" />
 </svg>
);
const IconGift = () => (
 <svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  style={{ width: "16px", height: "16px" }}
 >
  <polyline points="20 12 20 22 4 22 4 12" />
  <rect x="2" y="7" width="20" height="5" />
  <line x1="12" y1="22" x2="12" y2="7" />
  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
 </svg>
);
const IconCalendar = () => (
 <svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  style={{ width: "12px", height: "12px" }}
 >
  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
  <line x1="16" y1="2" x2="16" y2="6" />
  <line x1="8" y1="2" x2="8" y2="6" />
  <line x1="3" y1="10" x2="21" y2="10" />
 </svg>
);
const IconChevronRight = () => (
 <svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  style={{ width: "16px", height: "16px" }}
 >
  <polyline points="9 18 15 12 9 6" />
 </svg>
);
const IconEdit = () => (
 <svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  style={{ width: "14px", height: "14px" }}
 >
  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
 </svg>
);
const IconDelete = () => (
 <svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  style={{ width: "14px", height: "14px" }}
 >
  <polyline points="3 6 5 6 21 6" />
  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  <line x1="10" y1="11" x2="10" y2="17" />
  <line x1="14" y1="11" x2="14" y2="17" />
 </svg>
);
const IconPlus = () => (
 <svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  style={{ width: "14px", height: "14px" }}
 >
  <line x1="12" y1="5" x2="12" y2="19" />
  <line x1="5" y1="12" x2="19" y2="12" />
 </svg>
);
const IconEye = () => (
 <svg
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  style={{ width: "14px", height: "14px" }}
 >
  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
  <circle cx="12" cy="12" r="3" />
 </svg>
);

const parseJsonishAdmin = (value, fallback) => {
 if (value === undefined || value === null || value === "") return fallback;
 if (typeof value !== "string") return value;
 try {
  return JSON.parse(value);
 } catch {
  return value;
 }
};

const toAdminArray = (value, fallback = []) => {
 const parsed = parseJsonishAdmin(value, fallback);
 if (Array.isArray(parsed)) return parsed;
 if (typeof parsed === "string") {
  return parsed
   .split(/[\n,]/)
   .map((item) => item.trim())
   .filter(Boolean);
 }
 return fallback;
};

const toAdminObject = (value, fallback = {}) => {
 const parsed = parseJsonishAdmin(value, fallback);
 return parsed && typeof parsed === "object" && !Array.isArray(parsed)
  ? parsed
  : fallback;
};

const toAdminNumber = (value, fallback = 0) => {
 const numeric = Number(value);
 return Number.isFinite(numeric) ? numeric : fallback;
};

const formatINR = (value) =>
 `₹${Math.round(toAdminNumber(value, 0)).toLocaleString("en-IN")}`;

const formatInvoiceINR = (value) =>
 `Rs. ${Math.round(toAdminNumber(value, 0)).toLocaleString("en-IN")}`;

const getOrderInvoice = (order = {}) => order.gst_invoice || order.invoice || null;

const getSellerAddressLines = (seller = {}) => {
 if (Array.isArray(seller.address_lines) && seller.address_lines.length) {
  return seller.address_lines;
 }
 return seller.address ? [seller.address] : [];
};

const escapeAdminHtml = (value) =>
 String(value || "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

const buildAdminInvoiceHtml = (order = {}) => {
 const invoice = getOrderInvoice(order);
 if (!invoice) return "";
 const seller = getGstSellerProfile(invoice.seller || {});
 const buyer = invoice.buyer || {};
 const address = buyer.address || {};
 const sellerAddressRows = getSellerAddressLines(seller)
  .map((line) => `<p>${escapeAdminHtml(line)}</p>`)
  .join("");
 const rows = (invoice.items || [])
  .map(
   (item) => `
    <tr>
     <td>${escapeAdminHtml(item.name)}</td>
     <td>${escapeAdminHtml(item.hsn || "-")}</td>
     <td>${escapeAdminHtml(item.qty)}</td>
     <td>${formatInvoiceINR(item.unit_price)}</td>
     <td>${formatInvoiceINR(item.line_total)}</td>
    </tr>
   `,
  )
  .join("");

 return `
  <!doctype html>
  <html>
   <head>
    <title>${escapeAdminHtml(invoice.invoice_no)}</title>
    <style>
     body { font-family: Arial, sans-serif; color: #111; padding: 32px; }
     .top { display: flex; justify-content: space-between; gap: 24px; margin-bottom: 28px; }
     .box { border: 1px solid #ddd; padding: 14px; margin-bottom: 18px; }
     table { width: 100%; border-collapse: collapse; margin-top: 16px; }
     th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 13px; }
     th { background: #f5f5f5; }
     .totals { max-width: 360px; margin-left: auto; margin-top: 18px; }
     .row { display: flex; justify-content: space-between; padding: 6px 0; }
     .total { font-weight: 700; border-top: 1px solid #111; margin-top: 8px; padding-top: 10px; }
    </style>
   </head>
   <body>
    <div class="top">
     <div>
      <h1>Tax Invoice</h1>
      <p>Invoice No: <strong>${escapeAdminHtml(invoice.invoice_no)}</strong></p>
      <p>Order ID: ${escapeAdminHtml(invoice.order_id || order.id)}</p>
     <p>Date: ${new Date(invoice.invoice_date || Date.now()).toLocaleString("en-IN")}</p>
     </div>
     <div>
      <h2>${escapeAdminHtml(seller.trade_name || seller.name || "Rein Oro Foods")}</h2>
      <p>Legal Name: ${escapeAdminHtml(seller.legal_name || "-")}</p>
      <p>GSTIN / Registration No.: ${escapeAdminHtml(seller.gstin || seller.registration_no || "-")}</p>
      <p>Constitution: ${escapeAdminHtml(seller.constitution || "-")}</p>
      ${sellerAddressRows}
     </div>
    </div>
    <div class="box">
     <h3>Bill To</h3>
     <p><strong>${escapeAdminHtml(buyer.name || order.user_email)}</strong></p>
     <p>${escapeAdminHtml(buyer.email || order.user_email)} ${buyer.phone ? `| ${escapeAdminHtml(buyer.phone)}` : ""}</p>
     <p>GSTIN: ${escapeAdminHtml(buyer.gstin || "-")}</p>
     <p>${escapeAdminHtml(address.street || "")} ${escapeAdminHtml(address.apartment || "")}</p>
     <p>${escapeAdminHtml(address.city || "")}, ${escapeAdminHtml(address.state || "")} ${escapeAdminHtml(address.pincode || "")}</p>
    </div>
    <table>
     <thead>
      <tr><th>Item</th><th>HSN</th><th>Qty</th><th>Rate</th><th>Amount</th></tr>
     </thead>
     <tbody>${rows}</tbody>
    </table>
    <div class="totals">
     <div class="row"><span>Taxable Value</span><span>${formatInvoiceINR(invoice.taxable_value)}</span></div>
     <div class="row"><span>CGST</span><span>${formatInvoiceINR(invoice.cgst)}</span></div>
     <div class="row"><span>SGST</span><span>${formatInvoiceINR(invoice.sgst)}</span></div>
     <div class="row"><span>IGST</span><span>${formatInvoiceINR(invoice.igst)}</span></div>
     <div class="row total"><span>Total</span><span>${formatInvoiceINR(invoice.total || order.total)}</span></div>
    </div>
    <script>window.print();</script>
   </body>
  </html>
 `;
};

const openAdminInvoicePrintWindow = (order = {}) => {
 const html = buildAdminInvoiceHtml(order);
 if (!html) {
  alert("GST invoice is not available for this order yet.");
  return;
 }
 const printWindow = window.open("", "_blank", "noopener,noreferrer");
 if (!printWindow) {
  alert("Please allow popups to print the GST invoice.");
  return;
 }
 printWindow.document.write(html);
 printWindow.document.close();
};

const sumOrderTotals = (rows = []) =>
 rows.reduce((sum, order) => sum + toAdminNumber(order?.total, 0), 0);

const ADMIN_NOTIFICATION_SEEN_KEY = "rein_oro_admin_notifications_seen_at";
const DASHBOARD_RANGES = {
 "30d": { label: "Last 30 Days", days: 30 },
 "7d": { label: "Last 7 Days", days: 7 },
};
const VISITOR_SOURCE_COLORS = [
 "var(--color-gold)",
 "var(--color-white)",
 "rgba(255,255,255,0.3)",
 "rgba(201,168,76,0.3)",
 "#4cd964",
 "#ff9500",
];

const getAdminTimestamp = (value) => {
 if (!value) return 0;
 if (typeof value === "number") return value;
 if (typeof value?.toDate === "function") return value.toDate().getTime();
 if (value?._seconds) return value._seconds * 1000;
 const normalized = String(value).replace(" at ", " ");
 const parsed = Date.parse(normalized);
 return Number.isFinite(parsed) ? parsed : 0;
};

const formatAdminTimestamp = (timestamp) => {
 if (!timestamp) return "Just now";
 return new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
 }).format(new Date(timestamp));
};

const formatSignedPercent = (value) => {
 const numeric = toAdminNumber(value, 0);
 return `${numeric >= 0 ? "+" : ""}${numeric}%`;
};

const formatDashboardDateRange = (rangeKey) => {
 const days = DASHBOARD_RANGES[rangeKey]?.days || 30;
 const end = new Date();
 const start = new Date(end);
 start.setDate(end.getDate() - (days - 1));
 const formatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
 });
 return `${formatter.format(start)} - ${formatter.format(end)}`;
};

const getTrendType = (value) =>
 toAdminNumber(value, 0) < 0 ? "negative" : "positive";

const getSalesChartPoints = (series = [], metric = "revenue") => {
 const rows = series.length
  ? series
  : [{ label: "No Data", revenue: 0, orders: 0 }];
 const values = rows.map((row) => toAdminNumber(row?.[metric], 0));
 const maxValue = Math.max(...values, 1);
 const width = 460;
 const xStart = 20;
 const xGap = rows.length > 1 ? width / (rows.length - 1) : 0;
 return rows.map((row, index) => {
  const value = toAdminNumber(row?.[metric], 0);
  return {
   label: row.label,
   value,
   x: xStart + index * xGap,
   y: 160 - (value / maxValue) * 110,
  };
 });
};

const getLinePath = (points = []) =>
 points
  .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x},${point.y}`)
  .join(" ");

const getAreaPath = (points = []) => {
 if (!points.length) return "";
 return `${getLinePath(points)} L ${points[points.length - 1].x},160 L ${points[0].x},160 Z`;
};

const getVisitorRingSegments = (sources = []) => {
 const circumference = 345;
 let offset = 86;
 return sources.slice(0, 6).map((source, index) => {
  const arc = Math.max(0, (toAdminNumber(source.percent, 0) / 100) * circumference);
  const segment = {
   ...source,
   color: VISITOR_SOURCE_COLORS[index % VISITOR_SOURCE_COLORS.length],
   dasharray: `${arc} ${circumference}`,
   dashoffset: offset,
  };
  offset -= arc;
  return segment;
 });
};

const getCmsPageFieldCount = (cmsContent, pageName) =>
 Object.keys(cmsContent?.[pageName] || {}).length;

const getOrderItemLabel = (order = {}) => {
 const items = Array.isArray(order.items) ? order.items : [];
 if (!items.length) return "items";
 const first = items[0]?.name || "item";
 if (items.length === 1) return first;
 return `${first} +${items.length - 1} more`;
};

const getNotificationIconText = (item) => {
 if (item.kind === "payment") return "Rs";
 if (item.kind === "order") return "#";
 if (item.kind === "enquiry") return "!";
 return "i";
};

const buildAdminNotifications = (orders = [], activity = []) => {
 const orderNotifications = [];

 for (const order of orders || []) {
  const orderId = order.id || "unknown";
  const timestamp =
   getAdminTimestamp(order.paid_at) ||
   getAdminTimestamp(order.created_at) ||
   getAdminTimestamp(order.date) ||
   getAdminTimestamp(order.firestore_updated_at);
  const amount = formatINR(order.total);
  const customer = order.user_email || "Customer";
  const paymentStatus = String(order.payment_status || "").toLowerCase();
  const isPaid = paymentStatus === "paid" || Boolean(order.payment_id);

  orderNotifications.push({
   key: `order-${orderId}-${timestamp || order.date || ""}`,
   kind: "order",
   type: isPaid ? "success" : "warning",
   title: `New order #${orderId}`,
   text: `${customer} ordered ${getOrderItemLabel(order)} for ${amount}.`,
   time: formatAdminTimestamp(timestamp),
   timestampMs: timestamp,
  });

  orderNotifications.push({
   key: `payment-${order.payment_id || orderId}-${timestamp || order.date || ""}`,
   kind: "payment",
   type: isPaid ? "success" : "warning",
   title: isPaid ? "Payment received" : "Payment pending",
   text: isPaid
    ? `${amount} Razorpay payment confirmed for order #${orderId}.`
    : `Order #${orderId} is waiting for verified Razorpay payment.`,
   time: formatAdminTimestamp(timestamp),
   timestampMs: timestamp,
  });
 }

 const activityNotifications = (activity || [])
  .filter((item) => item?.type !== "order")
  .map((item) => {
   const timestamp = getAdminTimestamp(item.created_at);
   const isEnquiry = item.type === "enquiry";
   const isNewsletter = item.type === "newsletter";
   return {
    key: `activity-${item.type}-${item.id || item.actor || timestamp}`,
    kind: item.type || "activity",
    type: isEnquiry ? "warning" : "info",
    title: isEnquiry
     ? "New enquiry"
     : isNewsletter
       ? "Newsletter signup"
       : "Admin activity",
    text: isEnquiry
     ? `${item.actor || "Customer"} asked about ${item.value || "an enquiry"}.`
     : isNewsletter
       ? `${item.actor || "Customer"} subscribed to newsletter.`
       : `${item.actor || "Admin"} updated ${item.value || "activity"}.`,
    time: formatAdminTimestamp(timestamp),
    timestampMs: timestamp,
   };
  });

 return [...orderNotifications, ...activityNotifications]
  .sort((a, b) => b.timestampMs - a.timestampMs)
  .slice(0, 12);
};

const slugifyProduct = (value) =>
 String(value || "")
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

const normalizeVariantRows = (prod = {}) => {
 const variants = toAdminArray(prod.variants, [])
  .map((variant) => ({
   weight: String(variant?.weight || "").trim(),
   mrp: toAdminNumber(variant?.mrp, toAdminNumber(prod.mrp, prod.price || 0)),
   sale_price: toAdminNumber(
    variant?.sale_price ?? variant?.salePrice ?? variant?.price,
    toAdminNumber(prod.sale_price ?? prod.price, 0),
   ),
   stock: Math.max(0, Math.floor(toAdminNumber(variant?.stock, prod.stock || 0))),
   active:
    variant?.active === undefined
     ? true
     : variant.active === true ||
       variant.active === "true" ||
       variant.active === 1 ||
       variant.active === "1",
  }))
  .filter((variant) => variant.weight);
 if (variants.length) return variants;
 return [
  {
   weight: prod.weight || "",
   mrp: toAdminNumber(prod.mrp, prod.price || 0),
   sale_price: toAdminNumber(prod.sale_price ?? prod.price, 0),
   stock: Math.max(0, Math.floor(toAdminNumber(prod.stock, 0))),
   active: true,
  },
 ];
};

export default function Admin() {
 const { user, login, logout } = useContext(AuthContext);
 const { cmsContent, cmsStyles, fetchCMSData, getCMSValue } =
  useContext(CMSContext);
 const navigate = useNavigate();

 // Authentication gate states
 const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
 const [authEmail, setAuthEmail] = useState("");
 const [authPassword, setAuthPassword] = useState("");

 // CMS Panel States
 const [activePanel, setActivePanel] = useState("overview");
 const [isSidebarOpen, setIsSidebarOpen] = useState(false);
 const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
 const [dashboardRange, setDashboardRange] = useState("30d");
 const [visitorRange, setVisitorRange] = useState("30d");
 const [salesMetric, setSalesMetric] = useState("revenue");
 const [notificationsSeenAt, setNotificationsSeenAt] = useState(() => {
  const stored = Number(
   window.localStorage.getItem(ADMIN_NOTIFICATION_SEEN_KEY),
  );
  return Number.isFinite(stored) ? stored : 0;
 });

 const handlePanelSelect = (panelId) => {
  setActivePanel(panelId);
  setIsSidebarOpen(false);
  setIsNotificationsOpen(false);
 };
 const [products, setProducts] = useState([]);
 const [orders, setOrders] = useState([]);

 // Product Modal State
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [modalMode, setModalMode] = useState("create"); // 'create' or 'edit'
 const [productForm, setProductForm] = useState({
  id: "",
  name: "",
  flavor: "",
  title: "",
  price: 0,
  mrp: 0,
  sale_price: 0,
  stock: 0,
  featured: false,
  slug: "",
  seo_title: "",
  meta_description: "",
  image: "",
  images: "",
  description: "",
  weight: "",
  variants: [{ weight: "", mrp: 0, sale_price: 0, stock: 0, active: true }],
  benefits: "",
  benefits_image: "images/makhana_bowl_love.png",
  ingredients: [],
  specs: {},
  nutrition: {},
 });

 const [slotUploadingIndex, setSlotUploadingIndex] = useState(null);
 const [thumbnailUploading, setThumbnailUploading] = useState(false);
 const [benefitsUploading, setBenefitsUploading] = useState(false);
 const [altImageSlots, setAltImageSlots] = useState([]);

 // Styles Form State
 const [stylesForm, setStylesForm] = useState({
  colorBg: "#050505",
  colorGold: "#c9a84c",
  colorGoldHover: "#dfc476",
  colorWhite: "#f5f5f7",
  colorMuted: "#86868b",
  fontHeading: "Cormorant Garamond",
  fontBody: "Inter",
  textSizeOffset: "100%",
  customCSS: "",
 });

 // Content Page Form State
 const [selectedPage, setSelectedPage] = useState("index.html");
 const [contentForm, setContentForm] = useState({});

 // Extended DB states for panels
 const [categories, setCategories] = useState([]);
 const [banners, setBanners] = useState([]);
 const [media, setMedia] = useState([]);
 const [testimonials, setTestimonials] = useState([]);
 const [blogs, setBlogs] = useState([]);
 const [faqs, setFaqs] = useState([]);
 const [enquiries, setEnquiries] = useState([]);
 const [coupons, setCoupons] = useState([]);
 const [newsletterList, setNewsletterList] = useState([]);
 const [usersList, setUsersList] = useState([]);

 // Active item for edit forms
 const [editingCategory, setEditingCategory] = useState(null);
 const [editingBanner, setEditingBanner] = useState(null);
 const [editingTestimonial, setEditingTestimonial] = useState(null);
 const [editingBlog, setEditingBlog] = useState(null);
 const [editingFaq, setEditingFaq] = useState(null);
 const [editingCoupon, setEditingCoupon] = useState(null);

 // Media creation form state
 const [mediaForm, setMediaForm] = useState({ name: "", url: "" });

 // Settings forms
 const [seoSettings, setSeoSettings] = useState({
  titleTemplate: "",
  metaDescription: "",
 });
 const [paymentSettings, setPaymentSettings] = useState({});
 const [shippingSettings, setShippingSettings] = useState({
  freeShippingThreshold: "",
  shippingFee: "",
 });
 const [gatewaySettings, setGatewaySettings] = useState({
  razorpay_key_id: "",
  razorpay_key_secret: "",
 });
 const [ownerDashboard, setOwnerDashboard] = useState(null);
 const [firestoreStatus, setFirestoreStatus] = useState(null);
 const [confirmDialog, setConfirmDialog] = useState(null);

  const triggerConfirm = (message, onConfirm) => {
   setConfirmDialog({ message, onConfirm });
  };

  const getAuthHeaders = () =>
   user?.token ? { Authorization: `Bearer ${user.token}` } : {};

 const fetchCategories = () => {
  fetch("/api/categories")
   .then((res) => res.json())
   .then((data) => setCategories(data))
   .catch((err) => console.error(err));
 };
 const fetchBanners = () => {
  fetch("/api/banners")
   .then((res) => res.json())
   .then((data) => setBanners(data))
   .catch((err) => console.error(err));
 };
 const fetchMedia = () => {
  fetch("/api/media")
   .then((res) => res.json())
   .then((data) => setMedia(data))
   .catch((err) => console.error(err));
 };
 const fetchTestimonials = () => {
  fetch("/api/testimonials")
   .then((res) => res.json())
   .then((data) => setTestimonials(data))
   .catch((err) => console.error(err));
 };
 const fetchBlogs = () => {
  fetch("/api/blog")
   .then((res) => res.json())
   .then((data) => setBlogs(data))
   .catch((err) => console.error(err));
 };
 const fetchFaqs = () => {
  fetch("/api/faqs")
   .then((res) => res.json())
   .then((data) => setFaqs(data))
   .catch((err) => console.error(err));
 };
 const fetchEnquiries = () => {
  fetch("/api/enquiries")
   .then((res) => res.json())
   .then((data) => setEnquiries(data))
   .catch((err) => console.error(err));
 };
 const fetchCoupons = () => {
  fetch("/api/coupons")
   .then((res) => res.json())
   .then((data) => setCoupons(data))
   .catch((err) => console.error(err));
 };
 const fetchNewsletter = () => {
  fetch("/api/newsletter")
   .then((res) => res.json())
   .then((data) => setNewsletterList(data))
   .catch((err) => console.error(err));
 };
 const fetchUsers = () => {
  fetch("/api/users")
   .then((res) => res.json())
   .then((data) => setUsersList(data))
   .catch((err) => console.error(err));
 };
 const fetchSeoSettings = () => {
  fetch("/api/settings/seo")
   .then((res) => res.json())
   .then((data) => setSeoSettings(data))
   .catch((err) => console.error(err));
 };
 const fetchPaymentSettings = () => {
  fetch("/api/settings/payment")
   .then((res) => res.json())
   .then((data) => setPaymentSettings(data))
   .catch((err) => console.error(err));
 };
 const fetchShippingSettings = () => {
  fetch("/api/settings/shipping")
   .then((res) => res.json())
   .then((data) => setShippingSettings(data))
   .catch((err) => console.error(err));
 };
 const fetchGatewaySettings = () => {
  fetch("/api/settings/gateway", { headers: getAuthHeaders() })
   .then((res) => res.json())
   .then((data) => setGatewaySettings(data))
   .catch((err) => console.error(err));
 };
 const fetchOrders = () => {
  fetch("/api/orders")
   .then((res) => res.json())
   .then((data) => setOrders(Array.isArray(data) ? data : []))
   .catch((err) => console.error(err));
 };
 const fetchOwnerDashboard = () => {
  fetch("/api/owner/dashboard")
   .then((res) => res.json())
   .then((data) => {
    setOwnerDashboard(data);
    setFirestoreStatus(data.firestore || null);
   })
   .catch((err) => console.error(err));
 };
 const fetchFirestoreStatus = () => {
  fetch("/api/firestore/status")
   .then((res) => res.json())
   .then((data) => setFirestoreStatus(data))
   .catch((err) => console.error(err));
 };

 // Check role and login status
 useEffect(() => {
  if (user === null) {
   setIsAdminLoggedIn(false);
   return;
  }
  if (user.role === "admin") {
   setIsAdminLoggedIn(true);
   return;
  }
  setIsAdminLoggedIn(false);
  navigate("/login");
 }, [user, navigate]);

 // Fetch Dashboard statistics and lists
 useEffect(() => {
  if (!isAdminLoggedIn) return;

  // Fetch products
  fetch("/api/products")
   .then((res) => res.json())
   .then((data) => setProducts(data))
   .catch((err) => console.error(err));

  fetchOrders();

  fetchCategories();
  fetchBanners();
  fetchMedia();
  fetchTestimonials();
  fetchBlogs();
  fetchFaqs();
  fetchEnquiries();
  fetchCoupons();
  fetchNewsletter();
  fetchUsers();
  fetchSeoSettings();
  fetchPaymentSettings();
  fetchShippingSettings();
  fetchGatewaySettings();
  fetchOwnerDashboard();
  fetchFirestoreStatus();

  // Sync styles form
  if (cmsStyles) {
   setStylesForm((prev) => ({
    ...prev,
    ...cmsStyles,
   }));
  }
 }, [isAdminLoggedIn, cmsStyles]);

 useEffect(() => {
  if (!isAdminLoggedIn) return undefined;
  const timer = window.setInterval(() => {
   fetchOrders();
   fetchOwnerDashboard();
  }, 15000);
  return () => window.clearInterval(timer);
 }, [isAdminLoggedIn]);

 // Setup Page Content form values
 useEffect(() => {
  if (selectedPage === "index.html") {
   setContentForm({
    "#scene-1 .eyebrow": getCMSValue(
     "index.html",
     "#scene-1 .eyebrow",
     "Gourmet Selection",
    ),
    "#scene-1 h1": getCMSValue(
     "index.html",
     "#scene-1 h1",
     "The Gold Standard of Healthy Snacking.",
    ),
    "#scene-1 p": getCMSValue(
     "index.html",
     "#scene-1 p",
     "Purity Crowned In Gold.",
    ),
    "#scene-5 h2": getCMSValue(
     "index.html",
     "#scene-5 h2",
     "Purity Crowned in Gold.",
    ),
    ".gifting-title": getCMSValue(
     "index.html",
     ".gifting-title",
     "Bulk Orders & Corporate Gifting",
    ),
    ".gifting-body": getCMSValue(
     "index.html",
     ".gifting-body",
     "Looking for healthy gifting solutions for your employees, clients, events, or special occasions? Rein Oro Foods offers premium makhana and dry fruit gift packs customized for bulk orders and corporate gifting.",
    ),
    ".gift-box-img": getCMSValue(
     "index.html",
     ".gift-box-img",
     "images/gift_box.png",
    ),
    ".craft-img-1": getCMSValue(
     "index.html",
     ".craft-img-1",
     "images/slow_roasted.png",
    ),
    ".craft-img-2": getCMSValue(
     "index.html",
     ".craft-img-2",
     "images/no_preservatives.png",
    ),
    ".craft-img-3": getCMSValue(
     "index.html",
     ".craft-img-3",
     "images/hygienically_packed.png",
    ),
    ".craft-img-4": getCMSValue(
     "index.html",
     ".craft-img-4",
     "images/finest_selection.png",
    ),
   });
  } else if (selectedPage === "about.html") {
   setContentForm({
    ".about-hero-section h1": getCMSValue(
     "about.html",
     ".about-hero-section h1",
     "Purity, Tradition. Timeless Taste.",
    ),
    ".about-hero-section p": getCMSValue(
     "about.html",
     ".about-hero-section p",
     "Rein Oro Foods brings premium-quality makhana and dry fruits to customers who value purity, nutrition, freshness, and excellence.",
    ),
    ".about-hero-img": getCMSValue(
     "about.html",
     ".about-hero-img",
     "images/finest_selection.png",
    ),
    ".about-sourcing-title": getCMSValue(
     "about.html",
     ".about-sourcing-title",
     "Our Sourcing Philosophy",
    ),
    ".about-sourcing-body": getCMSValue(
     "about.html",
     ".about-sourcing-body",
     "We source our raw lotus seeds from clean, organic wetlands, double-sorting them to verify uniform quality and maximum size. Our dry fruits—from California almonds to Iranian pistachios—are select harvests sourced directly from global vineyards and orchards.",
    ),
    ".about-sourcing-img": getCMSValue(
     "about.html",
     ".about-sourcing-img",
     "images/slow_roasted.png",
    ),
    ".about-craft-title": getCMSValue(
     "about.html",
     ".about-craft-title",
     "Craftsmanship & Quality",
    ),
    ".about-craft-body": getCMSValue(
     "about.html",
     ".about-craft-body",
     "Our signature lotus seeds are processed under clean temperature monitors and slow-roasted without oil. We season them with pure rock salts and organic spices to lock in nutritional wellness, ensuring each seed delivers a signature high-density crunch.",
    ),
    ".about-values-title": getCMSValue(
     "about.html",
     ".about-values-title",
     "Our Core Values",
    ),
    ".about-values-body": getCMSValue(
     "about.html",
     ".about-values-body",
     "Purity is not a metric, it is our covenant. We believe in providing natural, health-focused alternatives to processed snacks while retaining absolute gourmet taste and presentation aesthetics.",
    ),
    ".about-values-img": getCMSValue(
     "about.html",
     ".about-values-img",
     "images/makhana_bowl_love.png",
    ),
    ".about-cta-title": getCMSValue(
     "about.html",
     ".about-cta-title",
     "Experience Gourmet Magnificence",
    ),
    ".about-cta-body": getCMSValue(
     "about.html",
     ".about-cta-body",
     "Treat yourself or surprise a partner with our signature gift assortments, packed inside gold-embossed chambers to preserve natural flavors.",
    ),
    ".about-cta-img": getCMSValue(
     "about.html",
     ".about-cta-img",
     "images/gift_box.png",
    ),
   });
  } else if (selectedPage === "contact.html") {
   setContentForm({
    ".contact-header h1": getCMSValue(
     "contact.html",
     ".contact-header h1",
     "Contact Rein Oro Foods",
    ),
    ".contact-header p": getCMSValue(
     "contact.html",
     ".contact-header p",
     "Have questions about our products, orders, wholesale inquiries, or partnerships? Our team is here to help. Reach out to us and we will get back to you as soon as possible.",
    ),
    ".contact-address": getCMSValue(
     "contact.html",
     ".contact-address",
     "Business Name: Rein Oro Foods\nProprietor: Vaibhav Singh Panwar\nF-499/3, Gali No.-11,\nRajendranagar,\nRoorkee,\nDistrict Haridwar,\nUttarakhand - 247667,\nIndia",
    ),
    ".contact-email-1": getCMSValue(
     "contact.html",
     ".contact-email-1",
     "wecare.reinoro@gmail.com",
    ),
    ".contact-email-2": getCMSValue(
     "contact.html",
     ".contact-email-2",
     "wecare.reinoro@gmail.com",
    ),
    ".contact-phone-1": getCMSValue(
     "contact.html",
     ".contact-phone-1",
     "+91 99999 88888",
    ),
    ".contact-phone-2": getCMSValue(
     "contact.html",
     ".contact-phone-2",
     "+91 99999 77777",
    ),
    ".contact-hours": getCMSValue(
     "contact.html",
     ".contact-hours",
     "Monday - Saturday: 9:30 AM - 6:30 PM IST\nSunday: Closed",
    ),
   });
  }
 }, [selectedPage, cmsContent]);

 // --- Auth Handlers ---
 const handleAdminGateSubmit = async (e) => {
  e.preventDefault();
  try {
   const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: authEmail, password: authPassword }),
   });
   const data = await res.json();
   if (!res.ok) {
    throw new Error(data.error || "Access Denied");
   }

   if (data.user?.role !== "admin") {
    throw new Error("Access Denied. Admin privileges required.");
   }

    login(data.user?.email || authEmail, data.user?.role || "admin", data.token || "");
   setIsAdminLoggedIn(true);
   alert("Administrative authentication successful.");
  } catch (err) {
   alert(err.message);
  }
 };

  const handleThumbnailUpload = async (e) => {
   const file = e.target.files[0];
   if (!file) return;
   if (!productForm.id || !String(productForm.id).trim()) {
    alert("Please fill in the Product ID (Unique) first before uploading images.");
    return;
   }
   setThumbnailUploading(true);
   const formData = new FormData();
   formData.append("image", file);
   formData.append("productId", String(productForm.id).trim());
   formData.append("type", "thumbnail");
   try {
    const res = await fetch("/api/upload", {
     method: "POST",
     body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    setProductForm((prev) => ({ ...prev, image: data.url }));
   } catch (err) {
    alert(`Thumbnail Upload Error: ${err.message}`);
   } finally {
    setThumbnailUploading(false);
   }
  };

  const handleBenefitsUpload = async (e) => {
   const file = e.target.files[0];
   if (!file) return;
   if (!productForm.id || !String(productForm.id).trim()) {
    alert("Please fill in the Product ID (Unique) first before uploading images.");
    return;
   }
   setBenefitsUploading(true);
   const formData = new FormData();
   formData.append("image", file);
   formData.append("productId", String(productForm.id).trim());
   formData.append("type", "benefit");
   try {
    const res = await fetch("/api/upload", {
     method: "POST",
     body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    setProductForm((prev) => ({ ...prev, benefits_image: data.url }));
   } catch (err) {
    alert(`Benefits Image Upload Error: ${err.message}`);
   } finally {
    setBenefitsUploading(false);
   }
  };

  const handleUploadSlotImage = async (e, idx) => {
   const file = e.target.files[0];
   if (!file) return;
   if (!productForm.id || !String(productForm.id).trim()) {
    alert("Please fill in the Product ID (Unique) first before uploading images.");
    return;
   }
   setSlotUploadingIndex(idx);
   const formData = new FormData();
   formData.append("image", file);
   formData.append("productId", String(productForm.id).trim());
   formData.append("type", "alternate");
   try {
    const res = await fetch("/api/upload", {
     method: "POST",
     body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    setAltImageSlots((prev) => {
     const next = [...prev];
     next[idx] = data.url;
     return next;
    });
   } catch (err) {
    alert(`Slot Upload Error: ${err.message}`);
   } finally {
    setSlotUploadingIndex(null);
   }
  };

 // --- Product CRUD Handlers ---
 const handleOpenProductModal = (mode, prod = null) => {
  setModalMode(mode);
  if (mode === "edit" && prod) {
   const allImages = toAdminArray(prod.images, []);
   const altImagesOnly = allImages[0] === prod.image ? allImages.slice(1) : allImages;
   setAltImageSlots(altImagesOnly);
   setProductForm({
    id: prod.id,
    name: prod.name,
    flavor: prod.flavor,
    title: prod.title,
    price: prod.price,
    mrp: prod.mrp ?? prod.price,
    sale_price: prod.sale_price ?? prod.price,
    stock: prod.stock ?? 0,
    featured: !!prod.featured,
    slug: prod.slug || slugifyProduct(prod.title || prod.name || prod.id),
    seo_title: prod.seo_title || "",
    meta_description: prod.meta_description || "",
    image: prod.image,
    images: toAdminArray(prod.images, []).join(", "),
    description: prod.description,
    weight: prod.weight,
    variants: normalizeVariantRows(prod),
    benefits: toAdminArray(prod.benefits, []).join(", "),
    benefits_image: prod.benefits_image,
    ingredients: toAdminArray(prod.ingredients, []),
    specs: toAdminObject(prod.specs, {}),
    nutrition:
     toAdminObject(prod.nutrition, {}),
   });
  } else {
    setAltImageSlots([]);
    setProductForm({
    id: "",
    name: "",
    flavor: "",
    title: "",
    price: 0,
    mrp: 0,
    sale_price: 0,
    stock: 0,
    featured: false,
    slug: "",
    seo_title: "",
    meta_description: "",
    image: "",
    images: "",
    description: "",
    weight: "",
    variants: [{ weight: "", mrp: 0, sale_price: 0, stock: 0, active: true }],
    benefits: "",
    benefits_image: "images/makhana_bowl_love.png",
    ingredients: [],
    specs: {
     Brand: "Rein Oro",
     Flavour: "",
     "Net Weight": "",
     "Diet Type": "Vegetarian",
     "Shelf Life": "6 Months from date of packaging",
     "Country of Origin": "India",
    },
    nutrition: {
     Calories: "",
     Protein: "",
     "Total Carbohydrates": "",
     "Dietary Fiber": "",
     "Total Fat": "",
     "Trans Fat": "0g",
     Sodium: "",
    },
   });
  }
  setIsModalOpen(true);
 };

 const handleProductSubmit = async (e) => {
  e.preventDefault();
 const payload = {
   ...productForm,
   price: toAdminNumber(productForm.sale_price || productForm.price),
   mrp: toAdminNumber(productForm.mrp || productForm.price),
   sale_price: toAdminNumber(productForm.sale_price || productForm.price),
   stock: Math.max(0, Math.floor(toAdminNumber(productForm.stock, 0))),
   featured: !!productForm.featured,
   slug:
    productForm.slug ||
    slugifyProduct(productForm.title || productForm.name || productForm.id),
   seo_title: productForm.seo_title,
   meta_description: productForm.meta_description,
    images: altImageSlots.filter((url) => url && url.trim()),
   variants: (productForm.variants || [])
    .map((variant) => ({
     weight: String(variant.weight || "").trim(),
     mrp: toAdminNumber(variant.mrp, productForm.mrp || productForm.price),
     sale_price: toAdminNumber(
      variant.sale_price,
      productForm.sale_price || productForm.price,
     ),
     price: toAdminNumber(
      variant.sale_price,
      productForm.sale_price || productForm.price,
     ),
     stock: Math.max(0, Math.floor(toAdminNumber(variant.stock, 0))),
     active: variant.active !== false,
    }))
    .filter((variant) => variant.weight),
   benefits: productForm.benefits
    .split(",")
    .map((b) => b.trim())
    .filter(Boolean),
   ingredients: productForm.ingredients,
   specs: productForm.specs,
   nutrition: productForm.nutrition,
  };
  if (!payload.weight && payload.variants.length) {
   payload.weight = payload.variants[0].weight;
  }

  try {
   const method = modalMode === "create" ? "POST" : "PUT";
   const endpoint =
    modalMode === "create"
     ? "/api/products"
     : `/api/products/${productForm.id}`;
   const res = await fetch(endpoint, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
   });

   if (!res.ok) {
    const data = await res.json();
    const errorMsg = data.details && Array.isArray(data.details)
     ? `${data.error}: ${data.details.join(", ")}`
     : (data.error || "Product operation failed");
    throw new Error(errorMsg);
   }

   alert(
    `Product ${modalMode === "create" ? "created" : "updated"} successfully.`,
   );
   setIsModalOpen(false);
   // Reload products list
   const updatedRes = await fetch("/api/products");
   const updatedData = await updatedRes.json();
   setProducts(updatedData);
  } catch (err) {
   alert(`Error: ${err.message}`);
  }
 };  
 const handleDeleteProduct = (id) => {
   triggerConfirm("Are you sure you want to permanently delete this product?", async () => {
    try {
     const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
     if (!res.ok) throw new Error("Deletion failed");

     alert("Product deleted successfully.");
     setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
     alert(err.message);
    }
   });
  };

 // --- Styles Editor Handler ---
 const handleSaveStyles = async (e) => {
  e.preventDefault();
  try {
   const res = await fetch("/api/cms/styles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(stylesForm),
   });
   if (!res.ok) throw new Error("Styles saving failed");

   alert("Styles and theme overrides saved successfully.");
   fetchCMSData(); // Refresh App state styles
  } catch (err) {
   alert(err.message);
  }
 };

 // --- Content Editor Handler ---
 const handleSaveContent = async (selector, value) => {
  try {
   const res = await fetch("/api/cms/content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
     page_name: selectedPage,
     selector,
     content_value: value,
    }),
   });
   if (!res.ok) throw new Error("Content saving failed");

   setContentForm((prev) => ({ ...prev, [selector]: value }));
   fetchCMSData(); // Refresh App context
  } catch (err) {
   alert(err.message);
  }
 };

 // --- Category CRUD Handlers ---
 const handleSaveCategory = async (e) => {
  e.preventDefault();
  const isEdit = !!editingCategory.id;
  const endpoint = isEdit
   ? `/api/categories/${editingCategory.id}`
   : "/api/categories";
  const method = isEdit ? "PUT" : "POST";
  try {
   const res = await fetch(endpoint, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(editingCategory),
   });
   if (!res.ok) throw new Error("Failed to save category");
   alert(`Category ${isEdit ? "updated" : "created"} successfully.`);
   setEditingCategory(null);
   fetchCategories();
  } catch (err) {
   alert(err.message);
  }
 };

 const handleDeleteCategory = (id) => {
   triggerConfirm("Are you sure you want to delete this category?", async () => {
    try {
     const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
     if (!res.ok) throw new Error("Deletion failed");
     alert("Category deleted successfully.");
     fetchCategories();
    } catch (err) {
     alert(err.message);
    }
   });
  };

 // --- Banner CRUD Handlers ---
 const handleSaveBanner = async (e) => {
  e.preventDefault();
  const isEdit = !!editingBanner.id;
  const endpoint = isEdit ? `/api/banners/${editingBanner.id}` : "/api/banners";
  const method = isEdit ? "PUT" : "POST";
  try {
   const res = await fetch(endpoint, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(editingBanner),
   });
   if (!res.ok) throw new Error("Failed to save banner");
   alert(`Banner ${isEdit ? "updated" : "created"} successfully.`);
   setEditingBanner(null);
   fetchBanners();
  } catch (err) {
   alert(err.message);
  }
 };

 const handleDeleteBanner = (id) => {
   triggerConfirm("Are you sure you want to delete this banner?", async () => {
    try {
     const res = await fetch(`/api/banners/${id}`, { method: "DELETE" });
     if (!res.ok) throw new Error("Deletion failed");
     alert("Banner deleted successfully.");
     fetchBanners();
    } catch (err) {
     alert(err.message);
    }
   });
  };

 // --- Media Handlers ---
 const handleSaveMedia = async (e) => {
  e.preventDefault();
  try {
   const res = await fetch("/api/media", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mediaForm),
   });
   if (!res.ok) throw new Error("Failed to save media item");
   alert("Media item registered successfully.");
   setMediaForm({ name: "", url: "" });
   fetchMedia();
  } catch (err) {
   alert(err.message);
  }
 };

 const handleDeleteMedia = (id) => {
   triggerConfirm("Are you sure you want to delete this media item?", async () => {
    try {
     const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
     if (!res.ok) throw new Error("Deletion failed");
     alert("Media item deleted successfully.");
     fetchMedia();
    } catch (err) {
     alert(err.message);
    }
   });
  };

 // --- Testimonial CRUD Handlers ---
 const handleSaveTestimonial = async (e) => {
  e.preventDefault();
  const isEdit = !!editingTestimonial.id;
  const endpoint = isEdit
   ? `/api/testimonials/${editingTestimonial.id}`
   : "/api/testimonials";
  const method = isEdit ? "PUT" : "POST";
  try {
   const res = await fetch(endpoint, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(editingTestimonial),
   });
   if (!res.ok) throw new Error("Failed to save testimonial");
   alert(`Testimonial ${isEdit ? "updated" : "created"} successfully.`);
   setEditingTestimonial(null);
   fetchTestimonials();
  } catch (err) {
   alert(err.message);
  }
 };

 const handleDeleteTestimonial = (id) => {
   triggerConfirm("Are you sure you want to delete this testimonial?", async () => {
    try {
     const res = await fetch(`/api/testimonials/${id}`, { method: "DELETE" });
     if (!res.ok) throw new Error("Deletion failed");
     alert("Testimonial deleted successfully.");
     fetchTestimonials();
    } catch (err) {
     alert(err.message);
    }
   });
  };

 // --- Blog CRUD Handlers ---
 const handleSaveBlog = async (e) => {
  e.preventDefault();
  const isEdit = !!editingBlog.id;
  const endpoint = isEdit ? `/api/blog/${editingBlog.id}` : "/api/blog";
  const method = isEdit ? "PUT" : "POST";
  try {
   const res = await fetch(endpoint, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(editingBlog),
   });
   if (!res.ok) throw new Error("Failed to save blog post");
   alert(`Blog post ${isEdit ? "updated" : "created"} successfully.`);
   setEditingBlog(null);
   fetchBlogs();
  } catch (err) {
   alert(err.message);
  }
 };

 const handleDeleteBlog = (id) => {
   triggerConfirm("Are you sure you want to delete this blog post?", async () => {
    try {
     const res = await fetch(`/api/blog/${id}`, { method: "DELETE" });
     if (!res.ok) throw new Error("Deletion failed");
     alert("Blog post deleted successfully.");
     fetchBlogs();
    } catch (err) {
     alert(err.message);
    }
   });
  };

 // --- FAQ CRUD Handlers ---
 const handleSaveFaq = async (e) => {
  e.preventDefault();
  const isEdit = !!editingFaq.id;
  const endpoint = isEdit ? `/api/faqs/${editingFaq.id}` : "/api/faqs";
  const method = isEdit ? "PUT" : "POST";
  try {
   const res = await fetch(endpoint, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(editingFaq),
   });
   if (!res.ok) throw new Error("Failed to save FAQ");
   alert(`FAQ ${isEdit ? "updated" : "created"} successfully.`);
   setEditingFaq(null);
   fetchFaqs();
  } catch (err) {
   alert(err.message);
  }
 };

 const handleDeleteFaq = (id) => {
   triggerConfirm("Are you sure you want to delete this FAQ?", async () => {
    try {
     const res = await fetch(`/api/faqs/${id}`, { method: "DELETE" });
     if (!res.ok) throw new Error("Deletion failed");
     alert("FAQ deleted successfully.");
     fetchFaqs();
    } catch (err) {
     alert(err.message);
    }
   });
  };

 // --- Coupon CRUD Handlers ---
 const handleSaveCoupon = async (e) => {
  e.preventDefault();
  const isEdit = !!editingCoupon.originalCode;
  const endpoint = isEdit
   ? `/api/coupons/${editingCoupon.originalCode}`
   : "/api/coupons";
  const method = isEdit ? "PUT" : "POST";
  try {
   const res = await fetch(endpoint, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(editingCoupon),
   });
   if (!res.ok) throw new Error("Failed to save coupon");
   alert(`Coupon ${isEdit ? "updated" : "created"} successfully.`);
   setEditingCoupon(null);
   fetchCoupons();
  } catch (err) {
   alert(err.message);
  }
 };

 const handleDeleteCoupon = (code) => {
   triggerConfirm(`Are you sure you want to delete coupon ${code}?`, async () => {
    try {
     const res = await fetch(`/api/coupons/${code}`, { method: "DELETE" });
     if (!res.ok) throw new Error("Deletion failed");
     alert("Coupon deleted successfully.");
     fetchCoupons();
    } catch (err) {
     alert(err.message);
    }
   });
  };

  // --- Orders Handlers ---
  const handleUpdateOrderStatus = async (id, status) => {
   try {
    const res = await fetch(`/api/orders/${id}/status`, {
     method: "PUT",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ status }),
    });
     if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Status update failed");
     }
     alert(`Order status updated to ${status}.`);
    setOrders((prev) =>
     prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
   } catch (err) {
    alert(err.message);
   }
  };

  // --- Enquiries Handlers ---
 const handleUpdateEnquiryStatus = async (id, status) => {
  try {
   const res = await fetch(`/api/enquiries/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
   });
   if (!res.ok) throw new Error("Status update failed");
   alert(`Enquiry status updated to ${status}.`);
   fetchEnquiries();
  } catch (err) {
   alert(err.message);
  }
 };

 const handleDeleteEnquiry = (id) => {
   triggerConfirm("Are you sure you want to delete this enquiry log?", async () => {
    try {
     const res = await fetch(`/api/enquiries/${id}`, { method: "DELETE" });
     if (!res.ok) throw new Error("Deletion failed");
     alert("Enquiry deleted successfully.");
     fetchEnquiries();
    } catch (err) {
     alert(err.message);
    }
   });
  };

 // --- Newsletter Handlers ---
 const handleDeleteNewsletter = (id) => {
   triggerConfirm("Remove this subscriber email from the list?", async () => {
    try {
     const res = await fetch(`/api/newsletter/${id}`, { method: "DELETE" });
     if (!res.ok) throw new Error("Deletion failed");
     alert("Subscriber email removed successfully.");
     fetchNewsletter();
    } catch (err) {
     alert(err.message);
    }
   });
  };

 // --- User Handlers ---
 const handleUpdateUserRole = async (id, role) => {
  try {
   const res = await fetch(`/api/users/${id}/role`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
   });
   if (!res.ok) throw new Error("Role update failed");
   alert(`User role updated to ${role}.`);
   fetchUsers();
  } catch (err) {
   alert(err.message);
  }
 };

 const handleDeleteUser = (id) => {
   triggerConfirm("Permanently delete this user account?", async () => {
    try {
     const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
     if (!res.ok) throw new Error("Deletion failed");
     alert("User account deleted successfully.");
     fetchUsers();
    } catch (err) {
     alert(err.message);
    }
   });
  };

 // --- Settings Handlers ---
 const handleSaveSeoSettings = async (e) => {
  e.preventDefault();
  try {
   const res = await fetch("/api/settings/seo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(seoSettings),
   });
   if (!res.ok) throw new Error("Failed to save SEO settings");
   alert("SEO settings saved successfully.");
   fetchSeoSettings();
  } catch (err) {
   alert(err.message);
  }
 };

 const handleSavePaymentSettings = async (methodName, enabled) => {
  try {
   const updated = { ...paymentSettings, [methodName]: enabled };
   const res = await fetch("/api/settings/payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updated),
   });
   if (!res.ok) throw new Error("Failed to save payment settings");
   setPaymentSettings(updated);
  } catch (err) {
   alert(err.message);
  }
 };

 const handleSaveShippingSettings = async (e) => {
  e.preventDefault();
  try {
   const res = await fetch("/api/settings/shipping", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(shippingSettings),
   });
   if (!res.ok) throw new Error("Failed to save shipping settings");
   alert("Shipping settings saved successfully.");
   fetchShippingSettings();
  } catch (err) {
   alert(err.message);
  }
 };

 const handleSaveGatewaySettings = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch("/api/settings/gateway", {
     method: "POST",
     headers: { "Content-Type": "application/json", ...getAuthHeaders() },
     body: JSON.stringify(gatewaySettings),
    });
   if (!res.ok) throw new Error("Gateway settings save failed");
   alert("Razorpay gateway keys updated successfully.");
   fetchGatewaySettings();
  } catch (err) {
   alert(err.message);
  }
 };

 // --- System Reset ---
 const handleFactoryReset = () => {
   triggerConfirm(
    "Warning: This will clear all product database updates, styles, and page content edits, reverting Rein Oro back to default layouts. Proceed?",
    async () => {
     try {
      const res = await fetch("/api/cms/reset", { method: "POST" });
      if (!res.ok) throw new Error("Reset failed");

      alert("Factory reset completed successfully. Re-seeding tables...");
      window.location.reload();
     } catch (err) {
      alert(err.message);
     }
    }
   );
  };

 const notificationItems = useMemo(
  () => buildAdminNotifications(orders, ownerDashboard?.activity || []),
  [orders, ownerDashboard],
 );
 const latestNotificationAt = notificationItems[0]?.timestampMs || 0;
 const unreadNotificationCount = notificationItems.filter(
  (item) => item.timestampMs > notificationsSeenAt,
 ).length;

 const markNotificationsRead = () => {
  if (!latestNotificationAt) return;
  setNotificationsSeenAt(latestNotificationAt);
  window.localStorage.setItem(
   ADMIN_NOTIFICATION_SEEN_KEY,
   String(latestNotificationAt),
  );
 };

 const handleNotificationBellClick = () => {
  setIsNotificationsOpen((open) => !open);
  if (!isNotificationsOpen) {
   markNotificationsRead();
  }
 };

 const handleNotificationItemClick = (item) => {
  setIsNotificationsOpen(false);
  if (item.kind === "order" || item.kind === "payment") {
   setActivePanel("orders");
   return;
  }
  if (item.kind === "enquiry") {
   setActivePanel("enquiries");
   return;
  }
  if (item.kind === "newsletter") {
   setActivePanel("newsletter");
  }
 };

 const activeTrends = ownerDashboard?.trends?.[dashboardRange] || {};
 const salesSeries = ownerDashboard?.sales_series?.[dashboardRange] || [];
 const salesChartPoints = getSalesChartPoints(salesSeries, salesMetric);
 const visitorStats = ownerDashboard?.visitors?.[visitorRange] || {
  total: 0,
  previous: 0,
  change: 0,
  sources: [],
 };
 const visitorSegments = getVisitorRingSegments(visitorStats.sources || []);
 const kpiComparisonLabel = `vs previous ${DASHBOARD_RANGES[dashboardRange]?.days || 30} days`;

 const getPanelTitle = (panel) => {
  const titles = {
   overview: "Dashboard",
   content: "Page Content Editor",
   products: "Manage Catalog",
   orders: "Customer Orders Log",
   styles: "Theme Style Editor",
   system: "General Settings & System Controls",
  };
  return titles[panel] || panel.charAt(0).toUpperCase() + panel.slice(1);
 };

 if (!isAdminLoggedIn) {
  return null;
 }

 return (
  <div className="admin-dash-container">
   {/* Sidebar overlay backdrop on mobile */}
   <div
    className={`admin-dash-sidebar-overlay ${isSidebarOpen ? "show" : ""}`}
    onClick={() => setIsSidebarOpen(false)}
   />

   {/* Sidebar Nav */}
   <aside className={`admin-dash-sidebar ${isSidebarOpen ? "open" : ""}`}>
    <div className="admin-dash-logo-section">
     <h1>REIN ORO</h1>
     <p>Purity Crowned in Gold</p>
    </div>

    <div className="admin-dash-sidebar-menu">
     {/* Group: Overview */}
     <div className="admin-dash-menu-group">
      <button
       className={`admin-dash-menu-item ${activePanel === "overview" ? "active" : ""}`}
       onClick={() => handlePanelSelect("overview")}
      >
       <IconDashboard />
       Dashboard
      </button>
     </div>

     {/* Group: Content Management */}
     <div className="admin-dash-menu-group">
      <div className="admin-dash-group-title">Content Management</div>
      {[
       { id: "content", label: "Pages", icon: <IconPages /> },
       { id: "products", label: "Products", icon: <IconProducts /> },
       { id: "categories", label: "Categories", icon: <IconCategories /> },
       { id: "banners", label: "Banners", icon: <IconBanners /> },
       { id: "media", label: "Media Library", icon: <IconMedia /> },
       {
        id: "testimonials",
        label: "Testimonials",
        icon: <IconTestimonials />,
       },
       { id: "blog", label: "Blog", icon: <IconBlog /> },
       { id: "faqs", label: "FAQs", icon: <IconFAQ /> },
      ].map((item) => (
       <button
        key={item.id}
        className={`admin-dash-menu-item ${activePanel === item.id ? "active" : ""}`}
        onClick={() => handlePanelSelect(item.id)}
       >
        {item.icon}
        {item.label}
       </button>
      ))}
     </div>

     {/* Group: Orders & Customers */}
     <div className="admin-dash-menu-group">
      <div className="admin-dash-group-title">Orders & Customers</div>
      {[
       { id: "orders", label: "Orders", icon: <IconOrders /> },
       { id: "customers", label: "Customers", icon: <IconCustomers /> },
       { id: "enquiries", label: "Enquiries", icon: <IconEnquiries /> },
      ].map((item) => (
       <button
        key={item.id}
        className={`admin-dash-menu-item ${activePanel === item.id ? "active" : ""}`}
        onClick={() => handlePanelSelect(item.id)}
       >
        {item.icon}
        {item.label}
       </button>
      ))}
     </div>

     {/* Group: Marketing */}
     <div className="admin-dash-menu-group">
      <div className="admin-dash-group-title">Marketing</div>
      {[
       { id: "coupons", label: "Coupons", icon: <IconCoupons /> },
       { id: "newsletter", label: "Newsletter", icon: <IconNewsletter /> },
       { id: "seo", label: "SEO Settings", icon: <IconSEO /> },
      ].map((item) => (
       <button
        key={item.id}
        className={`admin-dash-menu-item ${activePanel === item.id ? "active" : ""}`}
        onClick={() => handlePanelSelect(item.id)}
       >
        {item.icon}
        {item.label}
       </button>
      ))}
     </div>

     {/* Group: Settings */}
     <div className="admin-dash-menu-group">
      <div className="admin-dash-group-title">Settings</div>
      {[
       { id: "system", label: "General Settings", icon: <IconSettings /> },
       { id: "styles", label: "Theme Style Editor", icon: <IconSettings /> },
       { id: "payment", label: "Payment Methods", icon: <IconPayment /> },
       { id: "shipping", label: "Shipping Settings", icon: <IconShipping /> },
       { id: "users", label: "Users & Roles", icon: <IconUsers /> },
      ].map((item) => (
       <button
        key={item.id}
        className={`admin-dash-menu-item ${activePanel === item.id ? "active" : ""}`}
        onClick={() => handlePanelSelect(item.id)}
       >
        {item.icon}
        {item.label}
       </button>
      ))}
     </div>

     {/* Logout Trigger */}
     <div
      className="admin-dash-menu-group"
      style={{
       marginTop: "1rem",
       borderTop: "1px solid rgba(255,255,255,0.04)",
       paddingTop: "1rem",
      }}
     >
      <button
       onClick={() => {
        logout();
        navigate("/");
       }}
       className="admin-dash-menu-item"
       style={{ color: "rgba(255,80,80,0.8)" }}
      >
       <svg
        className="admin-dash-menu-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: "16px", height: "16px" }}
       >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
       </svg>
       Logout Console
      </button>
     </div>
    </div>

    <div className="admin-dash-sidebar-footer">
     <button onClick={() => navigate("/")} className="admin-dash-view-site-btn">
      <IconViewSite />
      View Website
     </button>
    </div>
   </aside>

   {/* Main Viewport */}
   <main className="admin-dash-main">
    {/* Header Bar */}
    <header className="admin-dash-header">
     <div className="admin-dash-header-left">
      <button
       className="admin-dash-hamburger"
       onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
       <IconHamburger />
      </button>
      <h2 className="admin-dash-header-title">{getPanelTitle(activePanel)}</h2>
     </div>

     <div className="admin-dash-header-right">
      <div className="admin-dash-search-container">
       <span className="admin-dash-search-icon">
        <IconSearch />
       </span>
       <input
        type="text"
        className="admin-dash-search-input"
        placeholder="Search anything..."
       />
      </div>

      <div className="admin-dash-notification-wrap">
       <button
        type="button"
        className={`admin-dash-bell-btn ${isNotificationsOpen ? "active" : ""}`}
        aria-label="Open live notifications"
        aria-haspopup="menu"
        aria-expanded={isNotificationsOpen}
        onClick={handleNotificationBellClick}
       >
        <IconBell />
        {unreadNotificationCount > 0 && (
         <span className="admin-dash-bell-badge">
          {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
         </span>
        )}
       </button>

       {isNotificationsOpen && (
        <div className="admin-dash-notification-panel" role="menu">
         <div className="admin-dash-notification-head">
          <div>
           <span className="admin-dash-notification-title">
            Live Notifications
           </span>
           <span className="admin-dash-notification-subtitle">
            Orders, payments, enquiries
           </span>
          </div>
          <span className="admin-dash-notification-live">Live</span>
         </div>

         <div className="admin-dash-notification-list">
          {notificationItems.length === 0 ? (
           <div className="admin-dash-notification-empty">
            No live notifications yet.
           </div>
          ) : (
           notificationItems.map((item) => (
            <button
             type="button"
             key={item.key}
             className="admin-dash-notification-item"
             role="menuitem"
             onClick={() => handleNotificationItemClick(item)}
            >
             <span
              className={`admin-dash-notification-icon ${item.type === "success" ? "success" : item.type === "warning" ? "warning" : ""}`}
             >
              {getNotificationIconText(item)}
             </span>
             <span className="admin-dash-notification-copy">
              <strong>{item.title}</strong>
              <span>{item.text}</span>
              <small>{item.time}</small>
             </span>
            </button>
           ))
          )}
         </div>
        </div>
       )}
      </div>

      <div className="admin-dash-profile">
       <img
        src="images/cashews_roasted.png"
        alt="Admin Profile"
        className="admin-dash-avatar"
        onError={(e) =>
         (e.target.src = "https://via.placeholder.com/32/1a1a1a/c9a84c?text=A")
        }
       />
       <div className="admin-dash-profile-info">
        <span className="admin-dash-profile-name">Admin User</span>
        <span className="admin-dash-profile-role">Super Admin</span>
       </div>
      </div>
     </div>
    </header>

    {/* Dashboard Panels */}
    <div className="admin-dash-content">
     {activePanel === "overview" && (
      <>
       {/* Date Filter & KPI summary row */}
       <div
        style={{
         display: "flex",
         justifyContent: "flex-end",
         marginBottom: "0.5rem",
        }}
       >
        <div className="admin-dash-date-picker">
         <IconCalendar />
         <select
          className="admin-dash-select-filter"
          value={dashboardRange}
          onChange={(e) => setDashboardRange(e.target.value)}
         >
          {Object.entries(DASHBOARD_RANGES).map(([value, range]) => (
           <option key={value} value={value}>
            {range.label}
           </option>
          ))}
         </select>
         <span>{formatDashboardDateRange(dashboardRange)}</span>
        </div>
       </div>

       <div className="admin-dash-kpi-grid">
        {/* Orders */}
        <div className="admin-dash-kpi-card">
         <div className="admin-dash-kpi-header">
          <span className="admin-dash-kpi-title">Total Orders</span>
          <div className="admin-dash-kpi-icon-wrapper">
           <IconShoppingBag />
          </div>
         </div>
         <div className="admin-dash-kpi-body">
          <div className="admin-dash-kpi-value-row">
           <h4 className="admin-dash-kpi-value">
             {ownerDashboard?.kpis?.total_orders ?? orders.length}
            </h4>
           <span
            className={`admin-dash-kpi-trend ${getTrendType(activeTrends.orders?.change)}`}
           >
            <IconTrendingUp />
            {formatSignedPercent(activeTrends.orders?.change)}
           </span>
          </div>
          <p className="admin-dash-kpi-comparison">{kpiComparisonLabel}</p>
         </div>
        </div>

        {/* Revenue */}
        <div className="admin-dash-kpi-card">
         <div className="admin-dash-kpi-header">
          <span className="admin-dash-kpi-title">Total Revenue</span>
          <div className="admin-dash-kpi-icon-wrapper">
           <IconDollar />
          </div>
         </div>
         <div className="admin-dash-kpi-body">
          <div className="admin-dash-kpi-value-row">
           <h4 className="admin-dash-kpi-value">
             {formatINR(ownerDashboard?.kpis?.revenue ?? sumOrderTotals(orders))}
            </h4>
           <span
            className={`admin-dash-kpi-trend ${getTrendType(activeTrends.revenue?.change)}`}
           >
            <IconTrendingUp />
            {formatSignedPercent(activeTrends.revenue?.change)}
           </span>
          </div>
          <p className="admin-dash-kpi-comparison">{kpiComparisonLabel}</p>
         </div>
        </div>

        {/* Customers */}
        <div className="admin-dash-kpi-card">
         <div className="admin-dash-kpi-header">
          <span className="admin-dash-kpi-title">Total Customers</span>
          <div className="admin-dash-kpi-icon-wrapper">
           <IconUsersGroup />
          </div>
         </div>
         <div className="admin-dash-kpi-body">
          <div className="admin-dash-kpi-value-row">
           <h4 className="admin-dash-kpi-value">
             {ownerDashboard?.kpis?.customers ?? usersList.length}
            </h4>
           <span
            className={`admin-dash-kpi-trend ${getTrendType(activeTrends.customers?.change)}`}
           >
            <IconTrendingUp />
            {formatSignedPercent(activeTrends.customers?.change)}
           </span>
          </div>
          <p className="admin-dash-kpi-comparison">{kpiComparisonLabel}</p>
         </div>
        </div>

        {/* Products */}
        <div className="admin-dash-kpi-card">
         <div className="admin-dash-kpi-header">
          <span className="admin-dash-kpi-title">Total Products</span>
          <div className="admin-dash-kpi-icon-wrapper">
           <IconGift />
          </div>
         </div>
         <div className="admin-dash-kpi-body">
          <div className="admin-dash-kpi-value-row">
           <h4 className="admin-dash-kpi-value">
             {products.length}
            </h4>
           <span
            className={`admin-dash-kpi-trend ${getTrendType(activeTrends.products?.change)}`}
           >
            <IconTrendingUp />
            {formatSignedPercent(activeTrends.products?.change)}
           </span>
          </div>
          <p className="admin-dash-kpi-comparison">{kpiComparisonLabel}</p>
         </div>
        </div>

        {/* Active Coupons */}
        <div
         className="admin-dash-kpi-card active-coupon-card"
         style={{ padding: "1.2rem 1rem" }}
        >
         <div className="admin-dash-kpi-header">
          <span className="admin-dash-kpi-title" style={{ fontSize: "0.6rem" }}>
           Product Reviews
          </span>
          <div
           className="admin-dash-kpi-icon-wrapper"
           style={{ width: "28px", height: "28px" }}
          >
           <IconCoupons />
          </div>
         </div>
         <div className="admin-dash-kpi-body" style={{ marginTop: "0.5rem" }}>
          <div className="admin-dash-kpi-value-row" style={{ gap: "0.3rem" }}>
           <h4 className="admin-dash-kpi-value" style={{ fontSize: "1.4rem" }}>
            {ownerDashboard?.kpis?.reviews ?? 0}
           </h4>
           <span
            className={`admin-dash-kpi-trend ${getTrendType(activeTrends.reviews?.change)}`}
            style={{ fontSize: "0.65rem" }}
           >
            {formatSignedPercent(activeTrends.reviews?.change)}
           </span>
          </div>
          <p
           className="admin-dash-kpi-comparison"
           style={{ fontSize: "0.6rem", marginTop: "0.2rem" }}
          >
           {ownerDashboard?.kpis?.pending_reviews ?? 0} pending reviews
          </p>
         </div>
        </div>
       </div>

       {/* Chart Widgets Row */}
       <div className="admin-dash-widgets-grid">
        {/* Sales spline curve */}
        <div className="admin-dash-widget-box" style={{ gridColumn: "span 2" }}>
         <div className="admin-dash-widget-header">
          <h3 className="admin-dash-widget-title">Sales Overview</h3>
          <div className="admin-dash-widget-header-actions">
           <div className="admin-dash-chart-tabs">
            <button
             className={`admin-dash-chart-tab ${salesMetric === "revenue" ? "active" : ""}`}
             onClick={() => setSalesMetric("revenue")}
            >
             Revenue
            </button>
            <button
             className={`admin-dash-chart-tab ${salesMetric === "orders" ? "active" : ""}`}
             onClick={() => setSalesMetric("orders")}
            >
             Orders
            </button>
           </div>
           <select
            className="admin-dash-select-filter"
            value={dashboardRange}
            onChange={(e) => setDashboardRange(e.target.value)}
           >
            {Object.entries(DASHBOARD_RANGES).map(([value, range]) => (
             <option key={value} value={value}>
              {range.label}
             </option>
            ))}
           </select>
          </div>
         </div>
         <div className="admin-dash-chart-container">
          <svg
           viewBox="0 0 500 200"
           width="100%"
           height="200"
           style={{ overflow: "visible" }}
          >
           <defs>
            <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
             <stop
              offset="0%"
              stopColor="var(--color-gold)"
              stopOpacity="0.35"
             />
             <stop
              offset="100%"
              stopColor="var(--color-gold)"
              stopOpacity="0.0"
             />
            </linearGradient>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
             <stop offset="0%" stopColor="var(--color-gold)" />
             <stop offset="100%" stopColor="#dfc476" />
            </linearGradient>
           </defs>
           <line
            x1="0"
            y1="40"
            x2="500"
            y2="40"
            stroke="rgba(255,255,255,0.02)"
           />
           <line
            x1="0"
            y1="80"
            x2="500"
            y2="80"
            stroke="rgba(255,255,255,0.02)"
           />
           <line
            x1="0"
            y1="120"
            x2="500"
            y2="120"
            stroke="rgba(255,255,255,0.02)"
           />
           <line
            x1="0"
            y1="160"
            x2="500"
            y2="160"
            stroke="rgba(255,255,255,0.02)"
           />

           <path d={getAreaPath(salesChartPoints)} fill="url(#chartGlow)" />

           <path
            d={getLinePath(salesChartPoints)}
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
           />

           {salesChartPoints.map((point, index) => (
            <circle
             key={`${point.label}-${index}`}
             cx={point.x}
             cy={point.y}
             r={index === salesChartPoints.length - 1 ? 5 : 4}
             fill={
              index === salesChartPoints.length - 1
               ? "var(--color-white)"
               : "var(--color-gold)"
             }
             stroke="var(--color-gold)"
             strokeWidth="2"
             style={
              index === salesChartPoints.length - 1
               ? { filter: "drop-shadow(0 0 5px var(--color-gold))" }
               : undefined
             }
            />
           ))}

           {salesChartPoints.map((point, index) => (
            <text
             key={`${point.label}-label-${index}`}
             x={point.x}
             y="185"
             fill="var(--color-muted)"
             fontSize="9"
             textAnchor="middle"
            >
             {point.label}
            </text>
           ))}
          </svg>
         </div>
        </div>

        {/* Top Selling list */}
        <div className="admin-dash-widget-box">
         <div className="admin-dash-widget-header">
          <h3 className="admin-dash-widget-title">Top Selling Products</h3>
          <button
           className="btn btn-outline"
           style={{ height: "24px", fontSize: "0.65rem", padding: "0 0.5rem" }}
           onClick={() => setActivePanel("products")}
          >
           View All
          </button>
         </div>
         <div className="admin-dash-product-list">
          {(ownerDashboard?.top_products || []).length === 0 ? (
           <p style={{ color: "var(--color-muted)", fontSize: "0.78rem" }}>
            No paid product sales yet.
           </p>
          ) : (
           ownerDashboard.top_products.slice(0, 5).map((prod) => (
            <div
             className="admin-dash-product-item"
             key={prod.product_id || prod.name}
            >
             <div className="admin-dash-prod-left">
              <div className="admin-dash-prod-img-wrapper">
               <img src={prod.image} alt={prod.name} />
              </div>
              <div className="admin-dash-prod-info">
               <span className="admin-dash-prod-name">{prod.name}</span>
               <span className="admin-dash-prod-flavor">{prod.flavor}</span>
              </div>
             </div>
             <div className="admin-dash-prod-stats">
              <span className="admin-dash-prod-orders">
               {prod.units_sold || 0} units
              </span>
              <span className="admin-dash-prod-revenue">
               {formatINR(prod.revenue)}
              </span>
             </div>
            </div>
           ))
          )}
         </div>
        </div>
       </div>

       {/* Bottom Row Layout */}
       <div className="admin-dash-widgets-grid">
        {/* Content Pages list */}
        <div className="admin-dash-widget-box" style={{ gridColumn: "span 2" }}>
         <div
          className="admin-dash-widget-header"
          style={{ marginBottom: "1rem" }}
         >
          <h3 className="admin-dash-widget-title">Content Pages</h3>
          <button
           className="btn btn-primary"
           style={{ height: "28px", padding: "0 0.8rem", fontSize: "0.68rem" }}
           onClick={() => setActivePanel("content")}
          >
           + Add New Page
          </button>
         </div>

         <div style={{ overflowX: "auto" }}>
          <table className="admin-dash-table">
           <thead>
            <tr>
             <th>Page Title</th>
             <th>Type</th>
             <th>Status</th>
             <th>CMS Data</th>
             <th>Source</th>
             <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
           </thead>
           <tbody>
            {[
             {
              title: "Home Page",
              file: "index.html",
              type: "Landing Page",
             },
             {
              title: "About Us",
              file: "about.html",
              type: "Static Page",
             },
             {
              title: "Contact Rein Oro Foods",
              file: "contact.html",
              type: "Static Page",
             },
            ].map((pg) => (
             <tr key={pg.file}>
              <td className="highlight">{pg.title}</td>
              <td>{pg.type}</td>
              <td>
               <span className="admin-dash-status-badge published">
                Published
               </span>
              </td>
              <td>
               {getCmsPageFieldCount(cmsContent, pg.file) > 0
                ? `${getCmsPageFieldCount(cmsContent, pg.file)} live fields`
                : "Default content"}
              </td>
              <td>CMS</td>
              <td style={{ textAlign: "right" }}>
               <div className="admin-dash-action-btn-row">
                <button
                 className="admin-dash-action-btn"
                 onClick={() => {
                  setSelectedPage(pg.file);
                  setActivePanel("content");
                 }}
                 title="Edit Content"
                >
                 <IconEdit />
                </button>
               </div>
              </td>
             </tr>
            ))}
           </tbody>
          </table>
         </div>
        </div>

        {/* Donut visitors chart */}
        <div className="admin-dash-widget-box">
         <div className="admin-dash-widget-header">
          <h3 className="admin-dash-widget-title">Website Visitors</h3>
          <select
           className="admin-dash-select-filter"
           value={visitorRange}
           onChange={(e) => setVisitorRange(e.target.value)}
          >
           {Object.entries(DASHBOARD_RANGES).map(([value, range]) => (
            <option key={value} value={value}>
             {range.label}
            </option>
           ))}
          </select>
         </div>

         <div
          style={{
           display: "flex",
           flexDirection: "column",
           alignItems: "center",
           justifyContent: "center",
           flex: 1,
          }}
         >
          <svg
           viewBox="0 0 160 160"
           width="130"
           height="130"
           style={{ overflow: "visible" }}
          >
           <defs>
            <linearGradient id="donutGold" x1="0" y1="0" x2="0" y2="1">
             <stop offset="0%" stopColor="var(--color-gold)" />
             <stop offset="100%" stopColor="#8d6e24" />
            </linearGradient>
            <linearGradient id="donutWhite" x1="0" y1="0" x2="0" y2="1">
             <stop offset="0%" stopColor="#f5f5f7" />
             <stop offset="100%" stopColor="#86868b" />
            </linearGradient>
           </defs>
           <circle
            cx="80"
            cy="80"
            r="55"
            fill="transparent"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth="14"
           />

           {visitorSegments.length === 0 ? (
            <circle
             cx="80"
             cy="80"
             r="55"
             fill="transparent"
             stroke="rgba(201,168,76,0.22)"
             strokeWidth="15"
             strokeDasharray="20 345"
             strokeDashoffset="86"
             strokeLinecap="round"
            />
           ) : (
            visitorSegments.map((segment, index) => (
             <circle
              key={segment.source}
              cx="80"
              cy="80"
              r="55"
              fill="transparent"
              stroke={segment.color}
              strokeWidth={15 - Math.min(index, 4)}
              strokeDasharray={segment.dasharray}
              strokeDashoffset={segment.dashoffset}
              strokeLinecap="round"
             />
            ))
           )}
           <text
            x="80"
            y="76"
            fill="var(--color-white)"
            fontSize="16"
            fontWeight="bold"
            textAnchor="middle"
           >
            {visitorStats.total.toLocaleString("en-IN")}
           </text>
           <text
            x="80"
            y="92"
            fill="var(--color-muted)"
            fontSize="8"
            letterSpacing="0.05em"
            textAnchor="middle"
           >
            TOTAL VISITORS
           </text>
           <text
            x="80"
            y="106"
            fill={visitorStats.change >= 0 ? "#4cd964" : "#ff5050"}
            fontSize="8"
            fontWeight="bold"
            textAnchor="middle"
           >
            {formatSignedPercent(visitorStats.change)}
           </text>
          </svg>

          <div
           className="admin-dash-donut-legend"
           style={{ width: "100%", marginTop: "1.5rem" }}
          >
           {(visitorSegments.length
            ? visitorSegments
            : [{ source: "No visits yet", count: 0, percent: 0, color: "rgba(255,255,255,0.18)" }]
           ).map((leg) => (
            <div className="admin-dash-legend-item" key={leg.source}>
             <div className="admin-dash-legend-label">
              <span
               className="admin-dash-legend-dot"
               style={{ backgroundColor: leg.color }}
              />
              {leg.source}
             </div>
             <div className="admin-dash-legend-value">
              {Number(leg.count || 0).toLocaleString("en-IN")}{" "}
              <span className="admin-dash-legend-percent">
               ({leg.percent || 0}%)
              </span>
             </div>
            </div>
           ))}
          </div>
         </div>
        </div>
       </div>

       {/* Timeline activity log */}
       <div
        className="admin-dash-widgets-grid"
        style={{ gridTemplateColumns: "1fr" }}
       >
        <div className="admin-dash-widget-box">
         <div className="admin-dash-widget-header">
          <h3 className="admin-dash-widget-title">Recent Activity</h3>
         </div>
         <div className="admin-dash-activity-list">
          {notificationItems.length === 0 ? (
           <p style={{ color: "var(--color-muted)", fontSize: "0.78rem" }}>
            No live activity yet.
           </p>
          ) : (
           notificationItems.slice(0, 8).map((act) => (
           <div className="admin-dash-activity-item" key={act.key}>
            <div
             className={`admin-dash-activity-icon-wrapper ${act.type === "success" ? "success" : act.type === "warning" ? "warning" : ""}`}
            >
             {getNotificationIconText(act)}
            </div>
            <div className="admin-dash-activity-details">
             <span className="admin-dash-activity-text">{act.text}</span>
             <span className="admin-dash-activity-time">{act.time}</span>
            </div>
           </div>
           ))
          )}
         </div>
        </div>
       </div>
      </>
     )}

     {activePanel === "products" && (
      <div className="admin-dash-table-card">
       <div className="admin-dash-table-toolbar">
        <h3
         className="admin-dash-widget-title"
         style={{ fontSize: "1.2rem", fontFamily: "var(--font-heading)" }}
        >
         Product Inventory Catalog
        </h3>
        <div className="admin-dash-table-actions">
         <button
          className="btn btn-primary"
          onClick={() => handleOpenProductModal("create")}
          style={{ height: "32px", padding: "0 1rem", fontSize: "0.72rem" }}
         >
          <IconPlus /> Add Product
         </button>
        </div>
       </div>

       <div style={{ overflowX: "auto" }}>
        <table className="admin-dash-table">
         <thead>
          <tr>
           <th>Thumbnail</th>
           <th>Title</th>
           <th>Flavor</th>
           <th>Price</th>
           <th>Weight</th>
           <th style={{ textAlign: "right" }}>Actions</th>
          </tr>
         </thead>
         <tbody>
          {products.map((p) => (
           <tr key={p.id}>
            <td>
             <div
              style={{
               width: "40px",
               height: "40px",
               backgroundColor: "rgba(255,255,255,0.02)",
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               borderRadius: "4px",
               border: "1px solid rgba(255,255,255,0.05)",
              }}
             >
              <img
               src={p.image}
               alt={p.title}
               style={{
                maxWidth: "85%",
                maxHeight: "85%",
                objectFit: "contain",
               }}
              />
             </div>
            </td>
            <td className="highlight">{p.title}</td>
            <td>{p.flavor}</td>
            <td style={{ color: "var(--color-gold)", fontWeight: 600 }}>
             ₹{p.price}
            </td>
            <td>{p.weight}</td>
            <td style={{ textAlign: "right" }}>
             <div className="admin-dash-action-btn-row">
              <button
               onClick={() => handleOpenProductModal("edit", p)}
               className="admin-dash-action-btn"
               title="Edit Product"
              >
               <IconEdit />
              </button>
              <button
               onClick={() => handleDeleteProduct(p.id)}
               className="admin-dash-action-btn delete"
               title="Delete Product"
              >
               <IconDelete />
              </button>
             </div>
            </td>
           </tr>
          ))}
         </tbody>
        </table>
       </div>
      </div>
     )}

     {activePanel === "content" && (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
       <div
        style={{
         display: "flex",
         justifyContent: "space-between",
         alignItems: "center",
        }}
       >
        <h3
         className="admin-dash-widget-title"
         style={{ fontSize: "1.25rem", fontFamily: "var(--font-heading)" }}
        >
         Select Page Layout to Customize
        </h3>
        <select
         value={selectedPage}
         onChange={(e) => setSelectedPage(e.target.value)}
         className="admin-dash-select-filter"
         style={{ height: "36px", padding: "0 1rem", fontSize: "0.82rem" }}
        >
         <option value="index.html">Home Page (index.html)</option>
         <option value="about.html">About Page (about.html)</option>
         <option value="contact.html">Contact Page (contact.html)</option>
        </select>
       </div>

       {/* Dynamic CMS Page Form */}
       <div
        style={{
         display: "flex",
         flexDirection: "column",
         gap: "1.5rem",
         border: "1px solid rgba(255,255,255,0.03)",
         borderRadius: "8px",
         padding: "2rem",
         backgroundColor: "#0a0a0a",
        }}
       >
        {Object.entries(contentForm).map(([selector, value]) => (
         <div
          key={selector}
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
         >
          <div
           style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
           }}
          >
           <div
            style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}
           >
            <span
             style={{
              fontSize: "0.85rem",
              color: "var(--color-white)",
              fontWeight: 500,
             }}
            >
             {getSelectorLabel(selector)}
            </span>
            <span
             style={{
              fontSize: "0.65rem",
              color: "var(--color-muted)",
              fontFamily: "monospace",
             }}
            >
             {selector}
            </span>
           </div>
           <button
            onClick={() => handleSaveContent(selector, contentForm[selector])}
            style={{
             background: "transparent",
             border: "none",
             color: "var(--color-gold)",
             cursor: "pointer",
             fontSize: "0.78rem",
             fontWeight: 600,
             textDecoration: "underline",
            }}
           >
            Update Node
           </button>
          </div>
          {selector.includes("img") ||
          (typeof value === "string" &&
           (value.includes("images/") ||
            value.endsWith(".png") ||
            value.endsWith(".jpg") ||
            value.endsWith(".jpeg"))) ? (
           <div
            style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}
           >
            <span style={{ fontSize: "0.72rem", color: "var(--color-gold)" }}>
             Image URL (Use Imgur, Cloudinary, or image hosting)
            </span>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
             <input
              type="text"
              className="contact-form-input"
              value={value}
              onChange={(e) =>
               setContentForm((prev) => ({
                ...prev,
                [selector]: e.target.value,
               }))
              }
              placeholder="https://example.com/image.jpg"
              style={{ flex: 1 }}
             />
             {value && (
              <div
               style={{
                width: "48px",
                height: "48px",
                backgroundColor: "rgba(255,255,255,0.02)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "6px",
                border: "1px solid rgba(255,255,255,0.08)",
               }}
              >
               <img
                src={value}
                alt="Preview"
                style={{
                 maxWidth: "90%",
                 maxHeight: "90%",
                 objectFit: "contain",
                }}
                onError={(e) => (e.target.style.opacity = "0.3")}
               />
              </div>
             )}
            </div>
           </div>
          ) : (
           <textarea
            className="contact-form-textarea"
            rows={
             selector.includes("body") ||
             selector.includes("p") ||
             selector.includes("h1") ||
             selector.includes("h2")
              ? 3
              : 1
            }
            value={value}
            onChange={(e) =>
             setContentForm((prev) => ({ ...prev, [selector]: e.target.value }))
            }
            style={{ minHeight: "auto" }}
           />
          )}
         </div>
        ))}
       </div>
      </div>
     )}

     {activePanel === "styles" && (
      <form
       onSubmit={handleSaveStyles}
       style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
      >
       <div
        style={{
         border: "1px solid rgba(255,255,255,0.03)",
         borderRadius: "8px",
         padding: "2rem",
         backgroundColor: "#0a0a0a",
         display: "flex",
         flexDirection: "column",
         gap: "1.5rem",
        }}
       >
        <h3
         style={{
          fontSize: "1.1rem",
          fontFamily: "var(--font-heading)",
          color: "var(--color-white)",
          marginBottom: "0.5rem",
         }}
        >
         Global Theme Palette
        </h3>

        <div
         style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.5rem",
         }}
        >
         <div className="contact-form-group">
          <label className="contact-form-label">
           Background Color (--color-bg)
          </label>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
           <input
            type="color"
            value={stylesForm.colorBg}
            onChange={(e) =>
             setStylesForm((prev) => ({ ...prev, colorBg: e.target.value }))
            }
            style={{
             border: "none",
             background: "transparent",
             width: "40px",
             height: "40px",
             cursor: "pointer",
            }}
           />
           <span
            style={{
             fontSize: "0.85rem",
             fontFamily: "monospace",
             color: "var(--color-muted)",
            }}
           >
            {stylesForm.colorBg}
           </span>
          </div>
         </div>

         <div className="contact-form-group">
          <label className="contact-form-label">
           Gold Accent Color (--color-gold)
          </label>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
           <input
            type="color"
            value={stylesForm.colorGold}
            onChange={(e) =>
             setStylesForm((prev) => ({ ...prev, colorGold: e.target.value }))
            }
            style={{
             border: "none",
             background: "transparent",
             width: "40px",
             height: "40px",
             cursor: "pointer",
            }}
           />
           <span
            style={{
             fontSize: "0.85rem",
             fontFamily: "monospace",
             color: "var(--color-muted)",
            }}
           >
            {stylesForm.colorGold}
           </span>
          </div>
         </div>

         <div className="contact-form-group">
          <label className="contact-form-label">
           Gold Hover Accent (--color-gold-hover)
          </label>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
           <input
            type="color"
            value={stylesForm.colorGoldHover}
            onChange={(e) =>
             setStylesForm((prev) => ({
              ...prev,
              colorGoldHover: e.target.value,
             }))
            }
            style={{
             border: "none",
             background: "transparent",
             width: "40px",
             height: "40px",
             cursor: "pointer",
            }}
           />
           <span
            style={{
             fontSize: "0.85rem",
             fontFamily: "monospace",
             color: "var(--color-muted)",
            }}
           >
            {stylesForm.colorGoldHover}
           </span>
          </div>
         </div>

         <div className="contact-form-group">
          <label className="contact-form-label">
           Primary Text Color (--color-white)
          </label>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
           <input
            type="color"
            value={stylesForm.colorWhite}
            onChange={(e) =>
             setStylesForm((prev) => ({ ...prev, colorWhite: e.target.value }))
            }
            style={{
             border: "none",
             background: "transparent",
             width: "40px",
             height: "40px",
             cursor: "pointer",
            }}
           />
           <span
            style={{
             fontSize: "0.85rem",
             fontFamily: "monospace",
             color: "var(--color-muted)",
            }}
           >
            {stylesForm.colorWhite}
           </span>
          </div>
         </div>
        </div>

        <hr
         style={{
          border: "none",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          margin: "1rem 0",
         }}
        />

        <h3
         style={{
          fontSize: "1.1rem",
          fontFamily: "var(--font-heading)",
          color: "var(--color-white)",
          marginBottom: "0.5rem",
         }}
        >
         Typography & Text Styling
        </h3>

        <div
         style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "1.5rem",
         }}
        >
         <div className="contact-form-group">
          <label className="contact-form-label">Heading Font Family</label>
          <select
           value={stylesForm.fontHeading || "Cormorant Garamond"}
           onChange={(e) =>
            setStylesForm((prev) => ({ ...prev, fontHeading: e.target.value }))
           }
           style={{
            background: "#0a0a0a",
            color: "var(--color-white)",
            border: "1px solid rgba(255,255,255,0.08)",
            padding: "0.6rem 1rem",
            fontSize: "0.85rem",
            outline: "none",
            borderRadius: "4px",
            width: "100%",
           }}
          >
           <option value="Cormorant Garamond">
            Cormorant Garamond (Serif Default)
           </option>
           <option value="Playfair Display">
            Playfair Display (Elegant Serif)
           </option>
           <option value="Cinzel">Cinzel (Classical Serif)</option>
           <option value="Lora">Lora (Contemporary Serif)</option>
           <option value="Georgia">Georgia (Standard Serif)</option>
           <option value="Montserrat">Montserrat (Modern Sans)</option>
           <option value="Outfit">Outfit (Luxury Minimalist)</option>
          </select>
         </div>

         <div className="contact-form-group">
          <label className="contact-form-label">Body Font Family</label>
          <select
           value={stylesForm.fontBody || "Inter"}
           onChange={(e) =>
            setStylesForm((prev) => ({ ...prev, fontBody: e.target.value }))
           }
           style={{
            background: "#0a0a0a",
            color: "var(--color-white)",
            border: "1px solid rgba(255,255,255,0.08)",
            padding: "0.6rem 1rem",
            fontSize: "0.85rem",
            outline: "none",
            borderRadius: "4px",
            width: "100%",
           }}
          >
           <option value="Inter">Inter (Clean Sans Default)</option>
           <option value="Montserrat">Montserrat (Geometric Sans)</option>
           <option value="Outfit">Outfit (Luxury Minimalist)</option>
           <option value="Roboto">Roboto (Neo-Grotesque)</option>
           <option value="Open Sans">Open Sans (Neutral Sans)</option>
           <option value="Lato">Lato (Warm Sans)</option>
          </select>
         </div>

         <div className="contact-form-group">
          <label className="contact-form-label">Base Text Size Scale</label>
          <select
           value={stylesForm.textSizeOffset || "100%"}
           onChange={(e) =>
            setStylesForm((prev) => ({
             ...prev,
             textSizeOffset: e.target.value,
            }))
           }
           style={{
            background: "#0a0a0a",
            color: "var(--color-white)",
            border: "1px solid rgba(255,255,255,0.08)",
            padding: "0.6rem 1rem",
            fontSize: "0.85rem",
            outline: "none",
            borderRadius: "4px",
            width: "100%",
           }}
          >
           <option value="95%">95% (Compact)</option>
           <option value="100%">100% (Default Size)</option>
           <option value="105%">105% (Slightly Larger)</option>
           <option value="110%">110% (Medium Scale)</option>
           <option value="115%">115% (Large Scale)</option>
           <option value="120%">120% (Extra Large)</option>
          </select>
         </div>
        </div>

        <div className="contact-form-group" style={{ marginTop: "1.5rem" }}>
         <label className="contact-form-label">Custom CSS Overrides</label>
         <textarea
          className="contact-form-textarea"
          placeholder="/* Write custom CSS styles here... e.g. .brand-logo-img { filter: drop-shadow(0 0 5px rgba(255,255,255,0.2)) } */"
          value={stylesForm.customCSS}
          onChange={(e) =>
           setStylesForm((prev) => ({ ...prev, customCSS: e.target.value }))
          }
          style={{
           minHeight: "140px",
           fontFamily: "monospace",
           fontSize: "0.82rem",
          }}
         />
        </div>

        <button
         type="submit"
         className="btn btn-primary"
         style={{ height: "44px", marginTop: "1rem", alignSelf: "flex-start" }}
        >
         SAVE THEME STYLES
        </button>
       </div>
      </form>
     )}

     {activePanel === "orders" && (
      <div className="admin-dash-table-card">
       <div className="admin-dash-table-toolbar">
        <h3
         className="admin-dash-widget-title"
         style={{ fontSize: "1.2rem", fontFamily: "var(--font-heading)" }}
        >
         Customer Orders Log
        </h3>
        <div className="admin-dash-table-search">
         <span className="admin-dash-table-search-icon">
          <IconSearch />
         </span>
         <input
          type="text"
          className="admin-dash-table-search-input"
          placeholder="Search orders..."
         />
        </div>
       </div>

       <div style={{ overflowX: "auto" }}>
        <table className="admin-dash-table">
         <thead>
          <tr>
           <th>Order ID</th>
           <th>Customer Email</th>
            <th>Date</th>
            <th>Payment Method</th>
            <th>Payment Status</th>
            <th>Payment ID</th>
            <th>GST Invoice</th>
            <th>Subtotal</th>
            <th>Total Paid</th>
            <th>Status</th>
          </tr>
         </thead>
         <tbody>
          {orders.length === 0 ? (
           <tr>
            <td
              colSpan="10"
             style={{
              textAlign: "center",
              padding: "3rem",
              color: "var(--color-muted)",
             }}
            >
             No orders registered in system.
            </td>
           </tr>
          ) : (
           orders.map((o) => (
            <tr key={o.id}>
             <td className="highlight" style={{ fontFamily: "monospace" }}>
              #{o.id}
             </td>
              <td>{o.user_email}</td>
              <td>{o.date}</td>
              <td>{o.payment_method}</td>
              <td>{o.payment_status || "Pending"}</td>
              <td style={{ fontFamily: "monospace", fontSize: "0.72rem" }}>
               {o.payment_id || "-"}
              </td>
              <td>
               {getOrderInvoice(o) ? (
                <button
                 type="button"
                 className="btn btn-outline"
                 onClick={() => openAdminInvoicePrintWindow(o)}
                 style={{
                  height: "28px",
                  padding: "0 0.7rem",
                  fontSize: "0.68rem",
                  color: "var(--color-gold)",
                  borderColor: "rgba(201,168,76,0.35)",
                 }}
                >
                 {getOrderInvoice(o).invoice_no}
                </button>
               ) : (
                "-"
               )}
              </td>
              <td>₹{o.subtotal}</td>
             <td style={{ color: "var(--color-gold)", fontWeight: 600 }}>
              ₹{o.total}
             </td>
             <td>
               <select
                value={o.status || "Processing"}
                onChange={(e) =>
                 handleUpdateOrderStatus(o.id, e.target.value)
                }
                style={{
                 backgroundColor: "#050505",
                 color:
                  o.status === "Delivered"
                   ? "#10b981"
                   : o.status === "Cancelled"
                     ? "#ef4444"
                     : o.status === "Shipped"
                       ? "#3b82f6"
                       : "#c9a84c",
                 border: "1px solid rgba(255,255,255,0.08)",
                 borderRadius: "4px",
                 fontSize: "0.75rem",
                 padding: "2px 4px",
                 cursor: "pointer",
                }}
               >
                <option value="Processing" style={{ backgroundColor: "#050505", color: "#c9a84c" }}>Processing</option>
                <option value="Confirmed" style={{ backgroundColor: "#050505", color: "#c9a84c" }}>Confirmed</option>
                <option value="Shipped" style={{ backgroundColor: "#050505", color: "#3b82f6" }}>Shipped</option>
                <option value="Delivered" style={{ backgroundColor: "#050505", color: "#10b981" }}>Delivered</option>
                <option value="Cancelled" style={{ backgroundColor: "#050505", color: "#ef4444" }}>Cancelled</option>
               </select>
              </td>
            </tr>
           ))
          )}
         </tbody>
        </table>
       </div>
      </div>
     )}

     {activePanel === "system" && (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
       <div
        style={{
         border: "1px solid rgba(255,255,255,0.03)",
         borderRadius: "8px",
         padding: "2.5rem",
         backgroundColor: "#0a0a0a",
         display: "flex",
         flexDirection: "column",
         gap: "2rem",
        }}
       >
        <div>
         <h3
          style={{
           fontSize: "1.05rem",
           color: "var(--color-white)",
           marginBottom: "0.5rem",
          }}
         >
          Factory Reset DB
         </h3>
         <p
          style={{
           fontSize: "0.85rem",
           color: "var(--color-muted)",
           marginBottom: "1.2rem",
           lineHeight: 1.5,
          }}
         >
          Clears all modifications to page content, product inventories, and
          style overrides, restoring the original Rein Oro aesthetic layouts
          from baseline seeds.
         </p>
         <button
          className="btn"
          onClick={handleFactoryReset}
          style={{
           border: "1px solid rgba(255,80,80,0.5)",
           color: "rgba(255,80,80,0.9)",
          }}
         >
          FACTORY RESET DB
         </button>
        </div>

        <hr
         style={{
          border: "none",
          borderTop: "1px solid rgba(255,255,255,0.05)",
         }}
        />

        <div>
         <h3
          style={{
           fontSize: "1.05rem",
           color: "var(--color-white)",
           marginBottom: "0.5rem",
          }}
         >
          Backup Database Settings
         </h3>
         <p
          style={{
           fontSize: "0.85rem",
           color: "var(--color-muted)",
           marginBottom: "1.2rem",
           lineHeight: 1.5,
          }}
         >
          Download the current active CMS settings (products database, page text
          overrides, theme colors) as a JSON configuration backup file.
         </p>
         <button
          className="btn btn-outline"
          onClick={() => {
           const dataStr =
            "data:text/json;charset=utf-8," +
            encodeURIComponent(
             JSON.stringify({ cmsContent, cmsStyles, products }),
            );
           const downloadAnchor = document.createElement("a");
           downloadAnchor.setAttribute("href", dataStr);
           downloadAnchor.setAttribute("download", "rein_oro_backup.json");
           document.body.appendChild(downloadAnchor);
           downloadAnchor.click();
           downloadAnchor.remove();
          }}
         >
          EXPORT BACKUP
         </button>
        </div>
       </div>
      </div>
     )}

     {activePanel === "categories" && (
      <div className="admin-dash-table-card">
       <div
        className="admin-dash-table-toolbar"
        style={{
         display: "flex",
         justifyContent: "space-between",
         alignItems: "center",
         marginBottom: "1.5rem",
        }}
       >
        <h3
         className="admin-dash-widget-title"
         style={{ fontSize: "1.2rem", fontFamily: "var(--font-heading)" }}
        >
         Product Categories
        </h3>
        {!editingCategory && (
         <button
          onClick={() =>
           setEditingCategory({ name: "", description: "", image: "" })
          }
          className="btn btn-primary"
          style={{
           padding: "8px 16px",
           fontSize: "0.85rem",
           display: "flex",
           alignItems: "center",
           gap: "6px",
          }}
         >
          <IconPlus /> Add Category
         </button>
        )}
       </div>

       {editingCategory ? (
        <form
         onSubmit={handleSaveCategory}
         style={{
          border: "1px solid rgba(255,255,255,0.05)",
          padding: "2rem",
          borderRadius: "8px",
          backgroundColor: "rgba(255,255,255,0.01)",
          display: "flex",
          flexDirection: "column",
          gap: "1.2rem",
          marginBottom: "2rem",
         }}
        >
         <h4
          style={{
           color: "var(--color-white)",
           fontFamily: "var(--font-heading)",
           fontSize: "1.1rem",
          }}
         >
          {editingCategory.id ? "Edit Category" : "Create Category"}
         </h4>
         <div className="contact-form-group">
          <label className="contact-form-label">Category Name</label>
          <input
           type="text"
           className="contact-form-input"
           required
           value={editingCategory.name}
           onChange={(e) =>
            setEditingCategory((prev) => ({ ...prev, name: e.target.value }))
           }
           placeholder="e.g. Exotic Nuts"
          />
         </div>
         <div className="contact-form-group">
          <label className="contact-form-label">Description</label>
          <textarea
           className="contact-form-textarea"
           value={editingCategory.description || ""}
           onChange={(e) =>
            setEditingCategory((prev) => ({
             ...prev,
             description: e.target.value,
            }))
           }
           placeholder="Brief summary of the category..."
           style={{ minHeight: "80px" }}
          />
         </div>
         <div className="contact-form-group">
          <label className="contact-form-label">Image URL</label>
          <input
           type="text"
           className="contact-form-input"
           value={editingCategory.image || ""}
           onChange={(e) =>
            setEditingCategory((prev) => ({ ...prev, image: e.target.value }))
           }
           placeholder="https://example.com/category.png"
          />
         </div>
         <div style={{ display: "flex", gap: "1rem" }}>
          <button
           type="submit"
           className="btn btn-primary"
           style={{ height: "36px", fontSize: "0.8rem" }}
          >
           Save Category
          </button>
          <button
           type="button"
           onClick={() => setEditingCategory(null)}
           className="btn btn-outline"
           style={{ height: "36px", fontSize: "0.8rem" }}
          >
           Cancel
          </button>
         </div>
        </form>
       ) : (
        <div style={{ overflowX: "auto" }}>
         <table className="admin-dash-table">
          <thead>
           <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Description</th>
            <th style={{ textAlign: "right" }}>Actions</th>
           </tr>
          </thead>
          <tbody>
           {categories.map((cat) => (
            <tr key={cat.id}>
             <td>
              <img
               src={cat.image || "https://via.placeholder.com/48"}
               alt={cat.name}
               style={{
                width: "40px",
                height: "40px",
                objectFit: "contain",
                borderRadius: "4px",
                border: "1px solid rgba(255,255,255,0.06)",
               }}
              />
             </td>
             <td style={{ fontWeight: 600, color: "var(--color-white)" }}>
              {cat.name}
             </td>
             <td
              style={{
               color: "var(--color-muted)",
               maxWidth: "300px",
               overflow: "hidden",
               textOverflow: "ellipsis",
               whiteSpace: "nowrap",
              }}
             >
              {cat.description}
             </td>
             <td style={{ textAlign: "right" }}>
              <div style={{ display: "inline-flex", gap: "0.5rem" }}>
               <button
                onClick={() => setEditingCategory(cat)}
                className="admin-dash-action-btn edit"
                title="Edit"
               >
                <IconEdit />
               </button>
               <button
                onClick={() => handleDeleteCategory(cat.id)}
                className="admin-dash-action-btn delete"
                title="Delete"
               >
                <IconDelete />
               </button>
              </div>
             </td>
            </tr>
           ))}
          </tbody>
         </table>
        </div>
       )}
      </div>
     )}

     {activePanel === "banners" && (
      <div className="admin-dash-table-card">
       <div
        className="admin-dash-table-toolbar"
        style={{
         display: "flex",
         justifyContent: "space-between",
         alignItems: "center",
         marginBottom: "1.5rem",
        }}
       >
        <h3
         className="admin-dash-widget-title"
         style={{ fontSize: "1.2rem", fontFamily: "var(--font-heading)" }}
        >
         Store Banners
        </h3>
        {!editingBanner && (
         <button
          onClick={() =>
           setEditingBanner({ title: "", subtitle: "", image: "", link: "" })
          }
          className="btn btn-primary"
          style={{
           padding: "8px 16px",
           fontSize: "0.85rem",
           display: "flex",
           alignItems: "center",
           gap: "6px",
          }}
         >
          <IconPlus /> Add Banner
         </button>
        )}
       </div>

       {editingBanner ? (
        <form
         onSubmit={handleSaveBanner}
         style={{
          border: "1px solid rgba(255,255,255,0.05)",
          padding: "2rem",
          borderRadius: "8px",
          backgroundColor: "rgba(255,255,255,0.01)",
          display: "flex",
          flexDirection: "column",
          gap: "1.2rem",
          marginBottom: "2rem",
         }}
        >
         <h4
          style={{
           color: "var(--color-white)",
           fontFamily: "var(--font-heading)",
           fontSize: "1.1rem",
          }}
         >
          {editingBanner.id ? "Edit Banner" : "Create Banner"}
         </h4>
         <div className="contact-form-group">
          <label className="contact-form-label">Banner Title</label>
          <input
           type="text"
           className="contact-form-input"
           required
           value={editingBanner.title || ""}
           onChange={(e) =>
            setEditingBanner((prev) => ({ ...prev, title: e.target.value }))
           }
           placeholder="e.g. Premium Gifting Box Collection"
          />
         </div>
         <div className="contact-form-group">
          <label className="contact-form-label">Subtitle</label>
          <input
           type="text"
           className="contact-form-input"
           value={editingBanner.subtitle || ""}
           onChange={(e) =>
            setEditingBanner((prev) => ({ ...prev, subtitle: e.target.value }))
           }
           placeholder="e.g. Exclusive gold embossed luxury selection..."
          />
         </div>
         <div className="contact-form-group">
          <label className="contact-form-label">Image URL</label>
          <input
           type="text"
           className="contact-form-input"
           required
           value={editingBanner.image || ""}
           onChange={(e) =>
            setEditingBanner((prev) => ({ ...prev, image: e.target.value }))
           }
           placeholder="https://example.com/banner.jpg"
          />
         </div>
         <div className="contact-form-group">
          <label className="contact-form-label">Redirection Link</label>
          <input
           type="text"
           className="contact-form-input"
           value={editingBanner.link || ""}
           onChange={(e) =>
            setEditingBanner((prev) => ({ ...prev, link: e.target.value }))
           }
           placeholder="e.g. /shop or /contact"
          />
         </div>
         <div style={{ display: "flex", gap: "1rem" }}>
          <button
           type="submit"
           className="btn btn-primary"
           style={{ height: "36px", fontSize: "0.8rem" }}
          >
           Save Banner
          </button>
          <button
           type="button"
           onClick={() => setEditingBanner(null)}
           className="btn btn-outline"
           style={{ height: "36px", fontSize: "0.8rem" }}
          >
           Cancel
          </button>
         </div>
        </form>
       ) : (
        <div style={{ overflowX: "auto" }}>
         <table className="admin-dash-table">
          <thead>
           <tr>
            <th>Preview</th>
            <th>Title</th>
            <th>Subtitle</th>
            <th>Link</th>
            <th style={{ textAlign: "right" }}>Actions</th>
           </tr>
          </thead>
          <tbody>
           {banners.map((banner) => (
            <tr key={banner.id}>
             <td>
              <img
               src={banner.image || "https://via.placeholder.com/120x60"}
               alt={banner.title}
               style={{
                width: "100px",
                height: "50px",
                objectFit: "cover",
                borderRadius: "4px",
                border: "1px solid rgba(255,255,255,0.06)",
               }}
              />
             </td>
             <td style={{ fontWeight: 600, color: "var(--color-white)" }}>
              {banner.title}
             </td>
             <td
              style={{
               color: "var(--color-muted)",
               maxWidth: "250px",
               overflow: "hidden",
               textOverflow: "ellipsis",
               whiteSpace: "nowrap",
              }}
             >
              {banner.subtitle}
             </td>
             <td style={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
              {banner.link}
             </td>
             <td style={{ textAlign: "right" }}>
              <div style={{ display: "inline-flex", gap: "0.5rem" }}>
               <button
                onClick={() => setEditingBanner(banner)}
                className="admin-dash-action-btn edit"
                title="Edit"
               >
                <IconEdit />
               </button>
               <button
                onClick={() => handleDeleteBanner(banner.id)}
                className="admin-dash-action-btn delete"
                title="Delete"
               >
                <IconDelete />
               </button>
              </div>
             </td>
            </tr>
           ))}
          </tbody>
         </table>
        </div>
       )}
      </div>
     )}

     {activePanel === "media" && (
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
       <div className="admin-dash-table-card" style={{ padding: "2rem" }}>
        <h3
         className="admin-dash-widget-title"
         style={{
          fontSize: "1.2rem",
          fontFamily: "var(--font-heading)",
          marginBottom: "1.2rem",
         }}
        >
         Upload / Register Hosted Asset
        </h3>
        <form
         onSubmit={handleSaveMedia}
         style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr auto",
          gap: "1.2rem",
          alignItems: "end",
         }}
        >
         <div className="contact-form-group">
          <label className="contact-form-label">Asset Name / Description</label>
          <input
           type="text"
           className="contact-form-input"
           required
           value={mediaForm.name}
           onChange={(e) =>
            setMediaForm((prev) => ({ ...prev, name: e.target.value }))
           }
           placeholder="e.g. Himalayan Salt Packet"
          />
         </div>
         <div className="contact-form-group">
          <label className="contact-form-label">Asset Image URL</label>
          <input
           type="text"
           className="contact-form-input"
           required
           value={mediaForm.url}
           onChange={(e) =>
            setMediaForm((prev) => ({ ...prev, url: e.target.value }))
           }
           placeholder="Paste direct hosted link here..."
          />
         </div>
         <button
          type="submit"
          className="btn btn-primary"
          style={{ height: "40px", padding: "0 24px", fontSize: "0.85rem" }}
         >
          Add Asset
         </button>
        </form>
       </div>

       <div
        style={{
         display: "grid",
         gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
         gap: "1.5rem",
        }}
       >
        {media.map((m) => (
         <div
          key={m.id}
          style={{
           border: "1px solid rgba(255,255,255,0.05)",
           borderRadius: "8px",
           padding: "1.2rem",
           backgroundColor: "#0a0a0a",
           display: "flex",
           flexDirection: "column",
           gap: "0.8rem",
          }}
         >
          <div
           style={{
            width: "100%",
            height: "140px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#050505",
            borderRadius: "4px",
            overflow: "hidden",
           }}
          >
           <img
            src={m.url}
            alt={m.name}
            style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain" }}
            onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
           />
          </div>
          <div
           style={{
            fontSize: "0.8rem",
            color: "var(--color-white)",
            fontWeight: 600,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
           }}
          >
           {m.name}
          </div>
          <div style={{ display: "flex", gap: "0.6rem" }}>
           <button
            onClick={() => {
             navigator.clipboard.writeText(m.url);
             alert("Image URL copied to clipboard.");
            }}
            className="btn btn-outline"
            style={{ height: "32px", flex: 1, fontSize: "0.75rem", padding: 0 }}
           >
            Copy URL
           </button>
           <button
            onClick={() => handleDeleteMedia(m.id)}
            className="btn"
            style={{
             height: "32px",
             flex: 1,
             fontSize: "0.75rem",
             padding: 0,
             border: "1px solid rgba(255,80,80,0.3)",
             color: "rgba(255,80,80,0.8)",
            }}
           >
            Delete
           </button>
          </div>
         </div>
        ))}
       </div>
      </div>
     )}

     {activePanel === "testimonials" && (
      <div className="admin-dash-table-card">
       <div
        className="admin-dash-table-toolbar"
        style={{
         display: "flex",
         justifyContent: "space-between",
         alignItems: "center",
         marginBottom: "1.5rem",
        }}
       >
        <h3
         className="admin-dash-widget-title"
         style={{ fontSize: "1.2rem", fontFamily: "var(--font-heading)" }}
        >
         Customer Testimonials
        </h3>
        {!editingTestimonial && (
         <button
          onClick={() =>
           setEditingTestimonial({ name: "", quote: "", rating: 5, avatar: "" })
          }
          className="btn btn-primary"
          style={{
           padding: "8px 16px",
           fontSize: "0.85rem",
           display: "flex",
           alignItems: "center",
           gap: "6px",
          }}
         >
          <IconPlus /> Add Testimonial
         </button>
        )}
       </div>

       {editingTestimonial ? (
        <form
         onSubmit={handleSaveTestimonial}
         style={{
          border: "1px solid rgba(255,255,255,0.05)",
          padding: "2rem",
          borderRadius: "8px",
          backgroundColor: "rgba(255,255,255,0.01)",
          display: "flex",
          flexDirection: "column",
          gap: "1.2rem",
          marginBottom: "2rem",
         }}
        >
         <h4
          style={{
           color: "var(--color-white)",
           fontFamily: "var(--font-heading)",
           fontSize: "1.1rem",
          }}
         >
          {editingTestimonial.id ? "Edit Testimonial" : "Create Testimonial"}
         </h4>
         <div className="contact-form-group">
          <label className="contact-form-label">Client Name</label>
          <input
           type="text"
           className="contact-form-input"
           required
           value={editingTestimonial.name || ""}
           onChange={(e) =>
            setEditingTestimonial((prev) => ({ ...prev, name: e.target.value }))
           }
           placeholder="e.g. Vikram Malhotra"
          />
         </div>
         <div className="contact-form-group">
          <label className="contact-form-label">Quote Content</label>
          <textarea
           className="contact-form-textarea"
           required
           value={editingTestimonial.quote || ""}
           onChange={(e) =>
            setEditingTestimonial((prev) => ({
             ...prev,
             quote: e.target.value,
            }))
           }
           placeholder="Their experience with Rein Oro..."
           style={{ minHeight: "80px" }}
          />
         </div>
         <div className="contact-form-group">
          <label className="contact-form-label">Rating (1 to 5 Stars)</label>
          <select
           className="contact-form-input"
           value={editingTestimonial.rating || 5}
           onChange={(e) =>
            setEditingTestimonial((prev) => ({
             ...prev,
             rating: parseInt(e.target.value),
            }))
           }
           style={{ backgroundColor: "#050505", color: "#fff" }}
          >
           <option value="5">5 Stars</option>
           <option value="4">4 Stars</option>
           <option value="3">3 Stars</option>
           <option value="2">2 Stars</option>
           <option value="1">1 Star</option>
          </select>
         </div>
         <div className="contact-form-group">
          <label className="contact-form-label">
           Avatar Image URL (Optional)
          </label>
          <input
           type="text"
           className="contact-form-input"
           value={editingTestimonial.avatar || ""}
           onChange={(e) =>
            setEditingTestimonial((prev) => ({
             ...prev,
             avatar: e.target.value,
            }))
           }
           placeholder="https://example.com/avatar.jpg"
          />
         </div>
         <div style={{ display: "flex", gap: "1rem" }}>
          <button
           type="submit"
           className="btn btn-primary"
           style={{ height: "36px", fontSize: "0.8rem" }}
          >
           Save Testimonial
          </button>
          <button
           type="button"
           onClick={() => setEditingTestimonial(null)}
           className="btn btn-outline"
           style={{ height: "36px", fontSize: "0.8rem" }}
          >
           Cancel
          </button>
         </div>
        </form>
       ) : (
        <div style={{ overflowX: "auto" }}>
         <table className="admin-dash-table">
          <thead>
           <tr>
            <th>Client</th>
            <th>Quote</th>
            <th>Rating</th>
            <th style={{ textAlign: "right" }}>Actions</th>
           </tr>
          </thead>
          <tbody>
           {testimonials.map((t) => (
            <tr key={t.id}>
             <td style={{ fontWeight: 600, color: "var(--color-white)" }}>
              {t.name}
             </td>
             <td
              style={{
               color: "var(--color-muted)",
               fontStyle: "italic",
               maxWidth: "350px",
               overflow: "hidden",
               textOverflow: "ellipsis",
               whiteSpace: "nowrap",
              }}
             >
              "{t.quote}"
             </td>
             <td style={{ color: "var(--color-gold)" }}>
              {"★".repeat(t.rating)}
              {"☆".repeat(5 - t.rating)}
             </td>
             <td style={{ textAlign: "right" }}>
              <div style={{ display: "inline-flex", gap: "0.5rem" }}>
               <button
                onClick={() => setEditingTestimonial(t)}
                className="admin-dash-action-btn edit"
                title="Edit"
               >
                <IconEdit />
               </button>
               <button
                onClick={() => handleDeleteTestimonial(t.id)}
                className="admin-dash-action-btn delete"
                title="Delete"
               >
                <IconDelete />
               </button>
              </div>
             </td>
            </tr>
           ))}
          </tbody>
         </table>
        </div>
       )}
      </div>
     )}

     {activePanel === "blog" && (
      <div className="admin-dash-table-card">
       <div
        className="admin-dash-table-toolbar"
        style={{
         display: "flex",
         justifyContent: "space-between",
         alignItems: "center",
         marginBottom: "1.5rem",
        }}
       >
        <h3
         className="admin-dash-widget-title"
         style={{ fontSize: "1.2rem", fontFamily: "var(--font-heading)" }}
        >
         Blog Editorial Posts
        </h3>
        {!editingBlog && (
         <button
          onClick={() => setEditingBlog({ title: "", content: "", image: "" })}
          className="btn btn-primary"
          style={{
           padding: "8px 16px",
           fontSize: "0.85rem",
           display: "flex",
           alignItems: "center",
           gap: "6px",
          }}
         >
          <IconPlus /> Add Post
         </button>
        )}
       </div>

       {editingBlog ? (
        <form
         onSubmit={handleSaveBlog}
         style={{
          border: "1px solid rgba(255,255,255,0.05)",
          padding: "2rem",
          borderRadius: "8px",
          backgroundColor: "rgba(255,255,255,0.01)",
          display: "flex",
          flexDirection: "column",
          gap: "1.2rem",
          marginBottom: "2rem",
         }}
        >
         <h4
          style={{
           color: "var(--color-white)",
           fontFamily: "var(--font-heading)",
           fontSize: "1.1rem",
          }}
         >
          {editingBlog.id ? "Edit Blog Post" : "Create Blog Post"}
         </h4>
         <div className="contact-form-group">
          <label className="contact-form-label">Article Title</label>
          <input
           type="text"
           className="contact-form-input"
           required
           value={editingBlog.title || ""}
           onChange={(e) =>
            setEditingBlog((prev) => ({ ...prev, title: e.target.value }))
           }
           placeholder="e.g. Sourcing Organic Wetland Lotus Seeds"
          />
         </div>
         <div className="contact-form-group">
          <label className="contact-form-label">Main Content</label>
          <textarea
           className="contact-form-textarea"
           required
           value={editingBlog.content || ""}
           onChange={(e) =>
            setEditingBlog((prev) => ({ ...prev, content: e.target.value }))
           }
           placeholder="Write details here..."
           style={{ minHeight: "180px" }}
          />
         </div>
         <div className="contact-form-group">
          <label className="contact-form-label">Image URL</label>
          <input
           type="text"
           className="contact-form-input"
           value={editingBlog.image || ""}
           onChange={(e) =>
            setEditingBlog((prev) => ({ ...prev, image: e.target.value }))
           }
           placeholder="https://example.com/blog_image.jpg"
          />
         </div>
         <div style={{ display: "flex", gap: "1rem" }}>
          <button
           type="submit"
           className="btn btn-primary"
           style={{ height: "36px", fontSize: "0.8rem" }}
          >
           Publish Post
          </button>
          <button
           type="button"
           onClick={() => setEditingBlog(null)}
           className="btn btn-outline"
           style={{ height: "36px", fontSize: "0.8rem" }}
          >
           Cancel
          </button>
         </div>
        </form>
       ) : (
        <div style={{ overflowX: "auto" }}>
         <table className="admin-dash-table">
          <thead>
           <tr>
            <th>Thumbnail</th>
            <th>Title</th>
            <th>Content Preview</th>
            <th>Published Date</th>
            <th style={{ textAlign: "right" }}>Actions</th>
           </tr>
          </thead>
          <tbody>
           {blogs.map((post) => (
            <tr key={post.id}>
             <td>
              <img
               src={post.image || "https://via.placeholder.com/80x50"}
               alt={post.title}
               style={{
                width: "60px",
                height: "40px",
                objectFit: "cover",
                borderRadius: "4px",
                border: "1px solid rgba(255,255,255,0.06)",
               }}
              />
             </td>
             <td style={{ fontWeight: 600, color: "var(--color-white)" }}>
              {post.title}
             </td>
             <td
              style={{
               color: "var(--color-muted)",
               maxWidth: "250px",
               overflow: "hidden",
               textOverflow: "ellipsis",
               whiteSpace: "nowrap",
              }}
             >
              {post.content}
             </td>
             <td style={{ color: "var(--color-muted)", fontSize: "0.8rem" }}>
              {post.date}
             </td>
             <td style={{ textAlign: "right" }}>
              <div style={{ display: "inline-flex", gap: "0.5rem" }}>
               <button
                onClick={() => setEditingBlog(post)}
                className="admin-dash-action-btn edit"
                title="Edit"
               >
                <IconEdit />
               </button>
               <button
                onClick={() => handleDeleteBlog(post.id)}
                className="admin-dash-action-btn delete"
                title="Delete"
               >
                <IconDelete />
               </button>
              </div>
             </td>
            </tr>
           ))}
          </tbody>
         </table>
        </div>
       )}
      </div>
     )}

     {activePanel === "faqs" && (
      <div className="admin-dash-table-card">
       <div
        className="admin-dash-table-toolbar"
        style={{
         display: "flex",
         justifyContent: "space-between",
         alignItems: "center",
         marginBottom: "1.5rem",
        }}
       >
        <h3
         className="admin-dash-widget-title"
         style={{ fontSize: "1.2rem", fontFamily: "var(--font-heading)" }}
        >
         Frequently Asked Questions
        </h3>
        {!editingFaq && (
         <button
          onClick={() => setEditingFaq({ question: "", answer: "" })}
          className="btn btn-primary"
          style={{
           padding: "8px 16px",
           fontSize: "0.85rem",
           display: "flex",
           alignItems: "center",
           gap: "6px",
          }}
         >
          <IconPlus /> Add FAQ
         </button>
        )}
       </div>

       {editingFaq ? (
        <form
         onSubmit={handleSaveFaq}
         style={{
          border: "1px solid rgba(255,255,255,0.05)",
          padding: "2rem",
          borderRadius: "8px",
          backgroundColor: "rgba(255,255,255,0.01)",
          display: "flex",
          flexDirection: "column",
          gap: "1.2rem",
          marginBottom: "2rem",
         }}
        >
         <h4
          style={{
           color: "var(--color-white)",
           fontFamily: "var(--font-heading)",
           fontSize: "1.1rem",
          }}
         >
          {editingFaq.id ? "Edit FAQ" : "Create FAQ"}
         </h4>
         <div className="contact-form-group">
          <label className="contact-form-label">Question</label>
          <input
           type="text"
           className="contact-form-input"
           required
           value={editingFaq.question || ""}
           onChange={(e) =>
            setEditingFaq((prev) => ({ ...prev, question: e.target.value }))
           }
           placeholder="e.g. Do you ship internationally?"
          />
         </div>
         <div className="contact-form-group">
          <label className="contact-form-label">Answer</label>
          <textarea
           className="contact-form-textarea"
           required
           value={editingFaq.answer || ""}
           onChange={(e) =>
            setEditingFaq((prev) => ({ ...prev, answer: e.target.value }))
           }
           placeholder="Write answer here..."
           style={{ minHeight: "100px" }}
          />
         </div>
         <div style={{ display: "flex", gap: "1rem" }}>
          <button
           type="submit"
           className="btn btn-primary"
           style={{ height: "36px", fontSize: "0.8rem" }}
          >
           Save FAQ
          </button>
          <button
           type="button"
           onClick={() => setEditingFaq(null)}
           className="btn btn-outline"
           style={{ height: "36px", fontSize: "0.8rem" }}
          >
           Cancel
          </button>
         </div>
        </form>
       ) : (
        <div style={{ overflowX: "auto" }}>
         <table className="admin-dash-table">
          <thead>
           <tr>
            <th>Question</th>
            <th>Answer</th>
            <th style={{ textAlign: "right" }}>Actions</th>
           </tr>
          </thead>
          <tbody>
           {faqs.map((faq) => (
            <tr key={faq.id}>
             <td style={{ fontWeight: 600, color: "var(--color-white)" }}>
              {faq.question}
             </td>
             <td
              style={{
               color: "var(--color-muted)",
               maxWidth: "400px",
               overflow: "hidden",
               textOverflow: "ellipsis",
               whiteSpace: "nowrap",
              }}
             >
              {faq.answer}
             </td>
             <td style={{ textAlign: "right" }}>
              <div style={{ display: "inline-flex", gap: "0.5rem" }}>
               <button
                onClick={() => setEditingFaq(faq)}
                className="admin-dash-action-btn edit"
                title="Edit"
               >
                <IconEdit />
               </button>
               <button
                onClick={() => handleDeleteFaq(faq.id)}
                className="admin-dash-action-btn delete"
                title="Delete"
               >
                <IconDelete />
               </button>
              </div>
             </td>
            </tr>
           ))}
          </tbody>
         </table>
        </div>
       )}
      </div>
     )}

     {activePanel === "customers" && (
      <div className="admin-dash-table-card">
       <div
        className="admin-dash-table-toolbar"
        style={{
         display: "flex",
         justifyContent: "space-between",
         alignItems: "center",
         marginBottom: "1.5rem",
        }}
       >
        <h3
         className="admin-dash-widget-title"
         style={{ fontSize: "1.2rem", fontFamily: "var(--font-heading)" }}
        >
         Registered Customers Directory
        </h3>
       </div>

       <div style={{ overflowX: "auto" }}>
        <table className="admin-dash-table">
         <thead>
          <tr>
           <th>Customer Email</th>
           <th>Mobile Number</th>
           <th>Account Role</th>
           <th>Registered On</th>
           <th>Orders Placed</th>
          </tr>
         </thead>
         <tbody>
          {usersList.map((u) => {
           const orderCount = orders.filter(
            (o) => o.user_email === u.email,
           ).length;
           return (
            <tr key={u.id}>
             <td style={{ fontWeight: 600, color: "var(--color-white)" }}>
              {u.email}
             </td>
             <td style={{ color: "var(--color-muted)", fontSize: "0.8rem" }}>
              {u.phone || "-"}
             </td>
             <td>
              <span
               className={`admin-dash-status-badge ${u.role === "admin" ? "published" : "pending"}`}
              >
               {u.role}
              </span>
             </td>
             <td style={{ color: "var(--color-muted)", fontSize: "0.8rem" }}>
              {u.member_since}
             </td>
             <td style={{ fontWeight: "bold", color: "var(--color-gold)" }}>
              {orderCount} order(s)
             </td>
            </tr>
           );
          })}
         </tbody>
        </table>
       </div>
      </div>
     )}

     {activePanel === "enquiries" && (
      <div className="admin-dash-table-card">
       <div
        className="admin-dash-table-toolbar"
        style={{
         display: "flex",
         justifyContent: "space-between",
         alignItems: "center",
         marginBottom: "1.5rem",
        }}
       >
        <h3
         className="admin-dash-widget-title"
         style={{ fontSize: "1.2rem", fontFamily: "var(--font-heading)" }}
        >
         Contact & Customer Support Enquiries
        </h3>
       </div>

       <div style={{ overflowX: "auto" }}>
        <table className="admin-dash-table">
         <thead>
          <tr>
           <th>Name / Email</th>
           <th>Subject</th>
           <th>Message Details</th>
           <th>Received Date</th>
           <th>Status Flag</th>
           <th style={{ textAlign: "right" }}>Actions</th>
          </tr>
         </thead>
         <tbody>
          {enquiries.map((enq) => (
           <tr key={enq.id}>
            <td>
             <div style={{ fontWeight: 600, color: "var(--color-white)" }}>
              {enq.name}
             </div>
             <div style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>
              {enq.email}
             </div>
            </td>
            <td style={{ fontWeight: 500, color: "var(--color-gold)" }}>
             {enq.subject}
            </td>
            <td
             style={{
              fontSize: "0.8rem",
              color: "var(--color-muted)",
              maxWidth: "300px",
              whiteSpace: "pre-line",
             }}
            >
             {enq.message}
            </td>
            <td style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>
             {enq.date}
            </td>
            <td>
             <select
              value={enq.status || "New"}
              onChange={(e) =>
               handleUpdateEnquiryStatus(enq.id, e.target.value)
              }
              style={{
               backgroundColor: "#050505",
               color: enq.status === "Resolved" ? "#10b981" : "#c9a84c",
               border: "1px solid rgba(255,255,255,0.08)",
               borderRadius: "4px",
               fontSize: "0.75rem",
               padding: "2px 4px",
              }}
             >
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
             </select>
            </td>
            <td style={{ textAlign: "right" }}>
             <button
              onClick={() => handleDeleteEnquiry(enq.id)}
              className="admin-dash-action-btn delete"
              title="Delete Log"
             >
              <IconDelete />
             </button>
            </td>
           </tr>
          ))}
         </tbody>
        </table>
       </div>
      </div>
     )}

     {activePanel === "coupons" && (
      <div className="admin-dash-table-card">
       <div
        className="admin-dash-table-toolbar"
        style={{
         display: "flex",
         justifyContent: "space-between",
         alignItems: "center",
         marginBottom: "1.5rem",
        }}
       >
        <h3
         className="admin-dash-widget-title"
         style={{ fontSize: "1.2rem", fontFamily: "var(--font-heading)" }}
        >
         Marketing Discount Coupons
        </h3>
        {!editingCoupon && (
         <button
          onClick={() =>
           setEditingCoupon({ code: "", discount_rate: 0.1, active: 1 })
          }
          className="btn btn-primary"
          style={{
           padding: "8px 16px",
           fontSize: "0.85rem",
           display: "flex",
           alignItems: "center",
           gap: "6px",
          }}
         >
          <IconPlus /> Add Coupon
         </button>
        )}
       </div>

       {editingCoupon ? (
        <form
         onSubmit={handleSaveCoupon}
         style={{
          border: "1px solid rgba(255,255,255,0.05)",
          padding: "2rem",
          borderRadius: "8px",
          backgroundColor: "rgba(255,255,255,0.01)",
          display: "flex",
          flexDirection: "column",
          gap: "1.2rem",
          marginBottom: "2rem",
         }}
        >
         <h4
          style={{
           color: "var(--color-white)",
           fontFamily: "var(--font-heading)",
           fontSize: "1.1rem",
          }}
         >
          {editingCoupon.originalCode ? "Edit Coupon" : "Create Coupon"}
         </h4>
         <div className="contact-form-group">
          <label className="contact-form-label">Coupon Code (Uppercase)</label>
          <input
           type="text"
           className="contact-form-input"
           required
           disabled={!!editingCoupon.originalCode}
           value={editingCoupon.code || ""}
           onChange={(e) =>
            setEditingCoupon((prev) => ({
             ...prev,
             code: e.target.value.toUpperCase(),
            }))
           }
           placeholder="e.g. WELCOME20"
          />
         </div>
         <div className="contact-form-group">
          <label className="contact-form-label">
           Discount Rate (e.g. 0.15 for 15% discount)
          </label>
          <input
           type="number"
           step="0.01"
           min="0"
           max="1"
           className="contact-form-input"
           required
           value={editingCoupon.discount_rate}
           onChange={(e) =>
            setEditingCoupon((prev) => ({
             ...prev,
             discount_rate: parseFloat(e.target.value),
            }))
           }
          />
         </div>
         <label
          className="checkbox-label"
          style={{
           display: "flex",
           alignItems: "center",
           gap: "0.6rem",
           fontSize: "0.85rem",
           color: "var(--color-white)",
           cursor: "pointer",
          }}
         >
          <input
           type="checkbox"
           checked={!!editingCoupon.active}
           onChange={(e) =>
            setEditingCoupon((prev) => ({
             ...prev,
             active: e.target.checked ? 1 : 0,
            }))
           }
           style={{
            accentColor: "var(--color-gold)",
            opacity: 1,
            position: "static",
            height: "16px",
            width: "16px",
            cursor: "pointer",
           }}
          />
          Coupon is currently active and can be used on checkout
         </label>
         <div style={{ display: "flex", gap: "1rem" }}>
          <button
           type="submit"
           className="btn btn-primary"
           style={{ height: "36px", fontSize: "0.8rem" }}
          >
           Save Coupon
          </button>
          <button
           type="button"
           onClick={() => setEditingCoupon(null)}
           className="btn btn-outline"
           style={{ height: "36px", fontSize: "0.8rem" }}
          >
           Cancel
          </button>
         </div>
        </form>
       ) : (
        <div style={{ overflowX: "auto" }}>
         <table className="admin-dash-table">
          <thead>
           <tr>
            <th>Code</th>
            <th>Discount Rate</th>
            <th>Percent Off</th>
            <th>Status</th>
            <th style={{ textAlign: "right" }}>Actions</th>
           </tr>
          </thead>
          <tbody>
           {coupons.map((cp) => (
            <tr key={cp.code}>
             <td
              style={{
               fontWeight: 700,
               color: "var(--color-gold)",
               fontFamily: "monospace",
              }}
             >
              {cp.code}
             </td>
             <td>{cp.discount_rate}</td>
             <td style={{ fontWeight: 600 }}>
              {Math.round(cp.discount_rate * 100)}% OFF
             </td>
             <td>
              <span
               className={`admin-dash-status-badge ${cp.active ? "published" : "pending"}`}
              >
               {cp.active ? "Active" : "Inactive"}
              </span>
             </td>
             <td style={{ textAlign: "right" }}>
              <div style={{ display: "inline-flex", gap: "0.5rem" }}>
               <button
                onClick={() =>
                 setEditingCoupon({ ...cp, originalCode: cp.code })
                }
                className="admin-dash-action-btn edit"
                title="Edit"
               >
                <IconEdit />
               </button>
               <button
                onClick={() => handleDeleteCoupon(cp.code)}
                className="admin-dash-action-btn delete"
                title="Delete"
               >
                <IconDelete />
               </button>
              </div>
             </td>
            </tr>
           ))}
          </tbody>
         </table>
        </div>
       )}
      </div>
     )}

     {activePanel === "newsletter" && (
      <div className="admin-dash-table-card">
       <div
        className="admin-dash-table-toolbar"
        style={{
         display: "flex",
         justifyContent: "space-between",
         alignItems: "center",
         marginBottom: "1.5rem",
        }}
       >
        <h3
         className="admin-dash-widget-title"
         style={{ fontSize: "1.2rem", fontFamily: "var(--font-heading)" }}
        >
         Newsletter Subscribers ({newsletterList.length})
        </h3>
        <button
         onClick={() => {
          const emails = newsletterList.map((n) => n.email).join("\n");
          navigator.clipboard.writeText(emails);
          alert(
           "All subscriber emails copied to clipboard (newline separated).",
          );
         }}
         className="btn btn-outline"
         style={{ height: "36px", fontSize: "0.8rem" }}
        >
         Export / Copy Emails list
        </button>
       </div>

       <div style={{ overflowX: "auto" }}>
        <table className="admin-dash-table">
         <thead>
          <tr>
           <th>Subscriber Email Address</th>
           <th>Subscribed On</th>
           <th style={{ textAlign: "right" }}>Remove</th>
          </tr>
         </thead>
         <tbody>
          {newsletterList.map((news) => (
           <tr key={news.id}>
            <td style={{ fontWeight: 600, color: "var(--color-white)" }}>
             {news.email}
            </td>
            <td style={{ color: "var(--color-muted)", fontSize: "0.8rem" }}>
             {news.subscribed_at}
            </td>
            <td style={{ textAlign: "right" }}>
             <button
              onClick={() => handleDeleteNewsletter(news.id)}
              className="admin-dash-action-btn delete"
              title="Unsubscribe"
             >
              <IconDelete />
             </button>
            </td>
           </tr>
          ))}
         </tbody>
        </table>
       </div>
      </div>
     )}

     {activePanel === "seo" && (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
       <form
        onSubmit={handleSaveSeoSettings}
        style={{
         border: "1px solid rgba(255,255,255,0.03)",
         borderRadius: "8px",
         padding: "2.5rem",
         backgroundColor: "#0a0a0a",
         display: "flex",
         flexDirection: "column",
         gap: "1.5rem",
        }}
       >
        <h3
         style={{
          fontSize: "1.2rem",
          fontFamily: "var(--font-heading)",
          color: "var(--color-white)",
          marginBottom: "0.5rem",
         }}
        >
         SEO Settings Override
        </h3>

        <div className="contact-form-group">
         <label className="contact-form-label">
          Global Page Title Template
         </label>
         <input
          type="text"
          className="contact-form-input"
          required
          value={seoSettings.titleTemplate || ""}
          onChange={(e) =>
           setSeoSettings((prev) => ({
            ...prev,
            titleTemplate: e.target.value,
           }))
          }
          placeholder="e.g. Rein Oro - Purity Crowned in Gold"
         />
        </div>

        <div className="contact-form-group">
         <label className="contact-form-label">Global Meta Description</label>
         <textarea
          className="contact-form-textarea"
          required
          value={seoSettings.metaDescription || ""}
          onChange={(e) =>
           setSeoSettings((prev) => ({
            ...prev,
            metaDescription: e.target.value,
           }))
          }
          placeholder="Description for search engines..."
          style={{ minHeight: "100px" }}
         />
        </div>

        <button
         type="submit"
         className="btn btn-primary"
         style={{ height: "40px", alignSelf: "flex-start" }}
        >
         Save SEO Settings
        </button>
       </form>
      </div>
     )}

     {activePanel === "payment" && (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
       <div
        style={{
         border: "1px solid rgba(255,255,255,0.03)",
         borderRadius: "8px",
         padding: "2.5rem",
         backgroundColor: "#0a0a0a",
         display: "flex",
         flexDirection: "column",
         gap: "1.5rem",
        }}
       >
        <h3
         style={{
          fontSize: "1.2rem",
          fontFamily: "var(--font-heading)",
          color: "var(--color-white)",
         }}
        >
         Checkout Payment Options
        </h3>
        <p
         style={{
          fontSize: "0.85rem",
          color: "var(--color-muted)",
          marginBottom: "1rem",
         }}
        >
         Configure payment processors and gateways displayed at buyer checkout.
        </p>
        <div
         style={{
          border: "1px solid rgba(201,168,76,0.16)",
          borderRadius: "6px",
          padding: "1rem",
          backgroundColor: "rgba(201,168,76,0.04)",
          fontSize: "0.8rem",
          color: "var(--color-muted)",
         }}
        >
         <strong style={{ color: "var(--color-white)" }}>Firestore:</strong>{" "}
         {firestoreStatus?.mode || "sqlite-local"} -{" "}
         {firestoreStatus?.message || "Checking sync status..."}
        </div>

        {["Razorpay (Online Payment)"].map((methodName) => (
         <label
          key={methodName}
          className="checkbox-label"
          style={{
           display: "flex",
           alignItems: "center",
           gap: "0.8rem",
           padding: "1rem",
           border: "1px solid rgba(255,255,255,0.04)",
           borderRadius: "6px",
           cursor: "pointer",
           backgroundColor: "rgba(255,255,255,0.01)",
           paddingLeft: "1rem",
          }}
         >
          <input
           type="checkbox"
           checked={
            paymentSettings[methodName] === 1 ||
            paymentSettings[methodName] === true
           }
           onChange={(e) =>
            handleSavePaymentSettings(methodName, e.target.checked)
           }
           style={{
            accentColor: "var(--color-gold)",
            opacity: 1,
            position: "static",
            height: "16px",
            width: "16px",
            cursor: "pointer",
            transform: "scale(1.15)",
           }}
          />
          <div>
           <span
            style={{
             fontSize: "0.9rem",
             color: "var(--color-white)",
             fontWeight: 600,
            }}
           >
            {methodName}
           </span>
           <div style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>
            Status: {paymentSettings[methodName] ? "Enabled" : "Disabled"}
           </div>
          </div>
         </label>
        ))}
       </div>

       <form
        onSubmit={handleSaveGatewaySettings}
        style={{
         border: "1px solid rgba(255,255,255,0.03)",
         borderRadius: "8px",
         padding: "2.5rem",
         backgroundColor: "#0a0a0a",
         display: "flex",
         flexDirection: "column",
         gap: "1.2rem",
        }}
       >
        <h3
         style={{
          fontSize: "1.2rem",
          fontFamily: "var(--font-heading)",
          color: "var(--color-white)",
          marginBottom: "0.5rem",
         }}
        >
         Razorpay Payment Gateway API Keys
        </h3>
        <p
         style={{
          fontSize: "0.85rem",
          color: "var(--color-muted)",
          marginBottom: "1rem",
          lineHeight: 1.5,
         }}
        >
         Configure your Razorpay Key ID and Secret to enable real online
         checkouts. Leave both blank to keep checkout in sandbox simulation mode.
        </p>

        <div className="contact-form-group">
         <label className="contact-form-label">Razorpay Key ID</label>
         <input
          type="text"
          className="contact-form-input"
          required
          value={gatewaySettings.razorpay_key_id || ""}
          onChange={(e) =>
           setGatewaySettings((prev) => ({
            ...prev,
            razorpay_key_id: e.target.value,
           }))
          }
          placeholder="rzp_test_xxxxxx"
         />
        </div>

        <div className="contact-form-group">
         <label className="contact-form-label">Razorpay Key Secret</label>
         <input
          type="password"
          className="contact-form-input"
          required
          value={gatewaySettings.razorpay_key_secret || ""}
          onChange={(e) =>
           setGatewaySettings((prev) => ({
            ...prev,
            razorpay_key_secret: e.target.value,
           }))
          }
          placeholder="xxxxxxxx"
         />
        </div>

        <button
         type="submit"
         className="btn btn-primary"
         style={{ height: "40px", alignSelf: "flex-start" }}
        >
         Save Razorpay Keys
        </button>
       </form>
      </div>
     )}

     {activePanel === "shipping" && (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
       <form
        onSubmit={handleSaveShippingSettings}
        style={{
         border: "1px solid rgba(255,255,255,0.03)",
         borderRadius: "8px",
         padding: "2.5rem",
         backgroundColor: "#0a0a0a",
         display: "flex",
         flexDirection: "column",
         gap: "1.5rem",
        }}
       >
        <h3
         style={{
          fontSize: "1.2rem",
          fontFamily: "var(--font-heading)",
          color: "var(--color-white)",
          marginBottom: "0.5rem",
         }}
        >
         Shipping Cost & Rules
        </h3>

        <div className="contact-form-group">
         <label className="contact-form-label">
          Free Shipping Threshold Amount (INR ₹)
         </label>
         <input
          type="number"
          className="contact-form-input"
          required
          value={shippingSettings.freeShippingThreshold || ""}
          onChange={(e) =>
           setShippingSettings((prev) => ({
            ...prev,
            freeShippingThreshold: e.target.value,
           }))
          }
         />
        </div>

        <div className="contact-form-group">
         <label className="contact-form-label">
          Standard Shipping Fee Amount (INR ₹)
         </label>
         <input
          type="number"
          className="contact-form-input"
          required
          value={shippingSettings.shippingFee || ""}
          onChange={(e) =>
           setShippingSettings((prev) => ({
            ...prev,
            shippingFee: e.target.value,
           }))
          }
         />
        </div>

        <button
         type="submit"
         className="btn btn-primary"
         style={{ height: "40px", alignSelf: "flex-start" }}
        >
         Save Shipping Rules
        </button>
       </form>
      </div>
     )}

     {activePanel === "users" && (
      <div className="admin-dash-table-card">
       <div
        className="admin-dash-table-toolbar"
        style={{
         display: "flex",
         justifyContent: "space-between",
         alignItems: "center",
         marginBottom: "1.5rem",
        }}
       >
        <h3
         className="admin-dash-widget-title"
         style={{ fontSize: "1.2rem", fontFamily: "var(--font-heading)" }}
        >
         Administrative Users & Roles Management
        </h3>
       </div>

       <div style={{ overflowX: "auto" }}>
        <table className="admin-dash-table">
         <thead>
          <tr>
           <th>Account Email</th>
           <th>Mobile Number</th>
           <th>Registered Date</th>
           <th>Current Role</th>
           <th style={{ textAlign: "right" }}>Actions</th>
          </tr>
         </thead>
         <tbody>
          {usersList.map((u) => (
           <tr key={u.id}>
            <td style={{ fontWeight: 600, color: "var(--color-white)" }}>
             {u.email}
            </td>
            <td style={{ color: "var(--color-muted)", fontSize: "0.8rem" }}>
             {u.phone || "-"}
            </td>
            <td style={{ color: "var(--color-muted)", fontSize: "0.8rem" }}>
             {u.member_since}
            </td>
            <td>
             <select
              value={u.role || "user"}
              onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
              style={{
               backgroundColor: "#050505",
               color: "#fff",
               border: "1px solid rgba(255,255,255,0.08)",
               borderRadius: "4px",
               fontSize: "0.8rem",
               padding: "2px 6px",
              }}
             >
              <option value="user">User</option>
              <option value="admin">Admin</option>
             </select>
            </td>
            <td style={{ textAlign: "right" }}>
             <button
              onClick={() => handleDeleteUser(u.id)}
              className="admin-dash-action-btn delete"
              title="Delete Account"
              disabled={u.email === "admin@reinoro.com"}
              style={{ opacity: u.email === "admin@reinoro.com" ? 0.3 : 1 }}
             >
              <IconDelete />
             </button>
            </td>
           </tr>
          ))}
         </tbody>
        </table>
       </div>
      </div>
     )}
    </div>
   </main>

   {/* Product Create/Edit Modal popup */}
   {isModalOpen && (
    <div
     style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.85)",
      zIndex: 10000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
     }}
    >
     <div
      style={{
       border: "1px solid var(--color-gold-border)",
       borderRadius: "12px",
       width: "100%",
       maxWidth: "640px",
       padding: "2.5rem",
       backgroundColor: "#090909",
       position: "relative",
       maxHeight: "90vh",
       overflowY: "auto",
      }}
     >
      <h3
       style={{
        fontFamily: "var(--font-heading)",
        fontSize: "1.6rem",
        color: "var(--color-white)",
        fontWeight: 300,
        marginBottom: "1.5rem",
       }}
      >
       {modalMode === "create"
        ? "Create Gourmet Offering"
        : "Edit Product Details"}
      </h3>

      <form
       onSubmit={handleProductSubmit}
       style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}
      >
       <div
        style={{
         display: "grid",
         gridTemplateColumns: "1fr 1fr",
         gap: "1.2rem",
        }}
       >
        <div className="contact-form-group">
         <label className="contact-form-label">Product ID (Unique)</label>
         <input
          type="text"
          className="contact-form-input"
          required
          disabled={modalMode === "edit"}
          value={productForm.id}
          onChange={(e) =>
           setProductForm((prev) => ({ ...prev, id: e.target.value }))
          }
          placeholder="e.g. makhana_saffron"
         />
        </div>
        <div className="contact-form-group">
         <label className="contact-form-label">Product Category Name</label>
         <input
          type="text"
          className="contact-form-input"
          required
          value={productForm.name}
          onChange={(e) =>
           setProductForm((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="e.g. Makhana or Nuts"
         />
        </div>
       </div>

       <div
        style={{
         display: "grid",
         gridTemplateColumns: "1fr 1fr",
         gap: "1.2rem",
        }}
       >
        <div className="contact-form-group">
         <label className="contact-form-label">Product Flavor Tag</label>
         <input
          type="text"
          className="contact-form-input"
          required
          value={productForm.flavor}
          onChange={(e) =>
           setProductForm((prev) => ({ ...prev, flavor: e.target.value }))
          }
          placeholder="e.g. Saffron Infused"
         />
        </div>
        <div className="contact-form-group">
         <label className="contact-form-label">Detailed Page Title</label>
         <input
          type="text"
          className="contact-form-input"
          required
          value={productForm.title}
          onChange={(e) =>
           setProductForm((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="e.g. Makhana Premium Saffron"
         />
        </div>
       </div>

       <div
        style={{
         display: "grid",
         gridTemplateColumns: "1fr 1fr",
         gap: "1.2rem",
        }}
       >
        <div className="contact-form-group">
         <label className="contact-form-label">Price (INR ₹)</label>
         <input
          type="number"
          className="contact-form-input"
          required
          value={productForm.price}
          onChange={(e) =>
           setProductForm((prev) => ({ ...prev, price: e.target.value }))
          }
         />
        </div>
        <div className="contact-form-group">
         <label className="contact-form-label">Net Weight</label>
         <input
          type="text"
          className="contact-form-input"
          required
          value={productForm.weight}
          onChange={(e) =>
           setProductForm((prev) => ({ ...prev, weight: e.target.value }))
          }
          placeholder="e.g. 100g"
         />
       </div>
      </div>

       <div
        style={{
         display: "grid",
         gridTemplateColumns: "1fr 1fr 1fr",
         gap: "1.2rem",
        }}
       >
        <div className="contact-form-group">
         <label className="contact-form-label">MRP (INR)</label>
         <input
          type="number"
          className="contact-form-input"
          value={productForm.mrp}
          onChange={(e) =>
           setProductForm((prev) => ({ ...prev, mrp: e.target.value }))
          }
          placeholder="e.g. 249"
         />
        </div>
        <div className="contact-form-group">
         <label className="contact-form-label">Sale Price (INR)</label>
         <input
          type="number"
          className="contact-form-input"
          value={productForm.sale_price}
          onChange={(e) =>
           setProductForm((prev) => ({
            ...prev,
            sale_price: e.target.value,
            price: e.target.value,
           }))
          }
          placeholder="e.g. 199"
         />
        </div>
        <div className="contact-form-group">
         <label className="contact-form-label">Total Stock</label>
         <input
          type="number"
          min="0"
          className="contact-form-input"
          value={productForm.stock}
          onChange={(e) =>
           setProductForm((prev) => ({ ...prev, stock: e.target.value }))
          }
          placeholder="e.g. 50"
         />
        </div>
       </div>

       <div
        style={{
         display: "grid",
         gridTemplateColumns: "1fr 1fr",
         gap: "1.2rem",
        }}
       >
        <label
         className="checkbox-label"
         style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          color: "var(--color-white)",
          fontSize: "0.85rem",
          paddingLeft: 0,
         }}
        >
         <input
          type="checkbox"
          checked={!!productForm.featured}
          onChange={(e) =>
           setProductForm((prev) => ({ ...prev, featured: e.target.checked }))
          }
          style={{
           accentColor: "var(--color-gold)",
           opacity: 1,
           position: "static",
           height: "16px",
           width: "16px",
           cursor: "pointer",
          }}
         />
         Show as Featured product on homepage
        </label>
        <div className="contact-form-group">
         <label className="contact-form-label">Product URL Slug</label>
         <input
          type="text"
          className="contact-form-input"
          value={productForm.slug}
          onChange={(e) =>
           setProductForm((prev) => ({ ...prev, slug: e.target.value }))
          }
          placeholder="e.g. premium-makhana-250g"
         />
        </div>
       </div>

       <div className="contact-form-group" style={{ gridColumn: "span 2" }}>
        <label className="contact-form-label">Weight Variants</label>
        <div
         style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.8rem",
          border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: "8px",
          padding: "1rem",
          backgroundColor: "rgba(0,0,0,0.22)",
         }}
        >
         {(productForm.variants || []).map((variant, index) => (
          <div
           key={index}
           style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr auto",
            gap: "0.65rem",
            alignItems: "center",
           }}
          >
           <input
            type="text"
            className="contact-form-input"
            placeholder="Weight e.g. 250g"
            value={variant.weight || ""}
            onChange={(e) => {
             const variants = [...(productForm.variants || [])];
             variants[index] = { ...variants[index], weight: e.target.value };
             setProductForm((prev) => ({ ...prev, variants }));
            }}
           />
           <input
            type="number"
            className="contact-form-input"
            placeholder="MRP"
            value={variant.mrp ?? ""}
            onChange={(e) => {
             const variants = [...(productForm.variants || [])];
             variants[index] = { ...variants[index], mrp: e.target.value };
             setProductForm((prev) => ({ ...prev, variants }));
            }}
           />
           <input
            type="number"
            className="contact-form-input"
            placeholder="Sale"
            value={variant.sale_price ?? ""}
            onChange={(e) => {
             const variants = [...(productForm.variants || [])];
             variants[index] = { ...variants[index], sale_price: e.target.value };
             setProductForm((prev) => ({ ...prev, variants }));
            }}
           />
           <input
            type="number"
            min="0"
            className="contact-form-input"
            placeholder="Stock"
            value={variant.stock ?? ""}
            onChange={(e) => {
             const variants = [...(productForm.variants || [])];
             variants[index] = { ...variants[index], stock: e.target.value };
             setProductForm((prev) => ({ ...prev, variants }));
            }}
           />
           <button
            type="button"
            onClick={() => {
             const variants = (productForm.variants || []).filter((_, i) => i !== index);
             setProductForm((prev) => ({ ...prev, variants }));
            }}
            className="admin-dash-action-btn delete"
            title="Remove variant"
           >
            <IconDelete />
           </button>
          </div>
         ))}
         <button
          type="button"
          className="btn btn-outline"
          onClick={() =>
           setProductForm((prev) => ({
            ...prev,
            variants: [
             ...(prev.variants || []),
             { weight: "", mrp: prev.mrp || prev.price, sale_price: prev.sale_price || prev.price, stock: 0, active: true },
            ],
           }))
          }
          style={{ height: "34px", fontSize: "0.75rem", alignSelf: "flex-start" }}
         >
          + Add Weight Variant
         </button>
        </div>
       </div>

       <div
        style={{
         display: "grid",
         gridTemplateColumns: "1fr 1fr",
         gap: "1.2rem",
        }}
       >
        <div className="contact-form-group">
         <label className="contact-form-label">SEO Title</label>
         <input
          type="text"
          className="contact-form-input"
          value={productForm.seo_title}
          onChange={(e) =>
           setProductForm((prev) => ({ ...prev, seo_title: e.target.value }))
          }
          placeholder="Title shown in Google/browser"
         />
        </div>
        <div className="contact-form-group">
         <label className="contact-form-label">Meta Description</label>
         <input
          type="text"
          className="contact-form-input"
          value={productForm.meta_description}
          onChange={(e) =>
           setProductForm((prev) => ({
            ...prev,
            meta_description: e.target.value,
           }))
          }
          placeholder="Short product summary for search engines"
         />
        </div>
       </div>

       <div className="contact-form-group" style={{ gridColumn: "span 2" }}>
        <label className="contact-form-label">
         Product Thumbnail
        </label>
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
         <div>
          <button
           type="button"
           className="btn btn-outline"
           disabled={thumbnailUploading}
           style={{
            height: "40px",
            borderColor: "var(--color-gold)",
            color: "var(--color-gold)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            whiteSpace: "nowrap"
           }}
           onClick={() => document.getElementById("thumbnail-file-input").click()}
          >
           <span>{thumbnailUploading ? "Uploading..." : "Upload Thumbnail"}</span>
          </button>
          <input
           type="file"
           id="thumbnail-file-input"
           accept="image/*"
           style={{ display: "none" }}
           onChange={handleThumbnailUpload}
          />
         </div>
         <div
          style={{
           width: "80px",
           height: "80px",
           border: "1px solid rgba(255,255,255,0.06)",
           borderRadius: "8px",
           backgroundColor: "rgba(0,0,0,0.3)",
           display: "flex",
           alignItems: "center",
           justifyContent: "center",
           overflow: "hidden",
           position: "relative",
           cursor: "pointer"
          }}
          onClick={() => document.getElementById("thumbnail-file-input").click()}
         >
          {productForm.image ? (
           <>
            <img
             src={productForm.image}
             alt="Thumbnail Preview"
             style={{ width: "90%", height: "90%", objectFit: "contain" }}
            />
            <div
             style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              color: "var(--color-gold)",
              fontSize: "0.65rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0,
              transition: "opacity 0.2s ease",
              textTransform: "uppercase"
             }}
             onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
             onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
            >
             Change
            </div>
           </>
          ) : (
           <span style={{ fontSize: "0.7rem", color: "var(--color-muted)", textAlign: "center", padding: "0.2rem" }}>
            No Image
           </span>
          )}
         </div>
        </div>
       </div>

       <div className="contact-form-group" style={{ gridColumn: "span 2" }}>
        <label className="contact-form-label">
         Alternate Product Images
         <span style={{ color: "var(--color-gold)", fontSize: "0.72rem", textTransform: "none", marginLeft: "0.5rem" }}>
          (Click + to add a slot, click a slot to upload/select a file)
         </span>
        </label>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
         {altImageSlots.map((imgUrl, idx) => (
          <div
           key={idx}
           style={{
            width: "80px",
            height: "80px",
            backgroundColor: "rgba(255,255,255,0.01)",
            border: imgUrl ? "1px solid rgba(255,255,255,0.08)" : "1px dashed rgba(199, 168, 76, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "8px",
            position: "relative",
            cursor: "pointer",
            overflow: "hidden"
           }}
           onClick={(e) => {
            if (e.target.tagName !== "BUTTON" && e.target.parentElement?.tagName !== "BUTTON") {
             document.getElementById(`alt-file-input-${idx}`).click();
            }
           }}
          >
           {slotUploadingIndex === idx ? (
            <span style={{ fontSize: "0.7rem", color: "var(--color-gold)" }}>Uploading...</span>
           ) : imgUrl ? (
            <img
             src={imgUrl}
             alt={`Alt ${idx}`}
             style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
           ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "var(--color-gold)" }}>
             <span style={{ fontSize: "1.2rem" }}>+</span>
             <span style={{ fontSize: "0.6rem", textTransform: "uppercase" }}>Slot</span>
            </div>
           )}
           
           <input
            type="file"
            id={`alt-file-input-${idx}`}
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => handleUploadSlotImage(e, idx)}
           />

           <button
            type="button"
            style={{
             position: "absolute",
             top: "2px",
             right: "2px",
             width: "18px",
             height: "18px",
             borderRadius: "50%",
             backgroundColor: "rgba(239, 68, 68, 0.85)",
             color: "var(--color-white)",
             border: "none",
             fontSize: "11px",
             display: "flex",
             alignItems: "center",
             justifyContent: "center",
             cursor: "pointer",
             lineHeight: 1,
             zIndex: 10
            }}
            onClick={(e) => {
             e.stopPropagation();
             setAltImageSlots(prev => prev.filter((_, i) => i !== idx));
            }}
           >
            &times;
           </button>
          </div>
         ))}

         <button
          type="button"
          className="btn btn-outline"
          style={{
           width: "80px",
           height: "80px",
           borderColor: "rgba(199, 168, 76, 0.3)",
           color: "var(--color-gold)",
           display: "flex",
           flexDirection: "column",
           alignItems: "center",
           justifyContent: "center",
           borderRadius: "8px",
           gap: "0.2rem"
          }}
          onClick={() => {
           setAltImageSlots(prev => [...prev, ""]);
          }}
         >
          <span style={{ fontSize: "1.5rem", lineHeight: 1 }}>+</span>
          <span style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>Add Slot</span>
         </button>
        </div>
       </div>

       <div className="contact-form-group" style={{ gridColumn: "span 2" }}>
        <label className="contact-form-label">
         Benefits Section Image
        </label>
        <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
         <div style={{ flex: 1 }}>
          <button
           type="button"
           className="btn btn-outline"
           disabled={benefitsUploading}
           style={{
            height: "40px",
            borderColor: "var(--color-gold)",
            color: "var(--color-gold)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            whiteSpace: "nowrap",
            marginBottom: "0.5rem"
           }}
           onClick={() => document.getElementById("benefits-file-input").click()}
          >
           <span>{benefitsUploading ? "Uploading..." : "Upload Benefits Image"}</span>
          </button>
          <p style={{ fontSize: "0.75rem", color: "var(--color-muted)", margin: 0 }}>
           Transparent background PNG recommended. Displays in the storefront product benefits section.
          </p>
          <input
           type="file"
           id="benefits-file-input"
           accept="image/*"
           style={{ display: "none" }}
           onChange={handleBenefitsUpload}
          />
         </div>
         <div
          style={{
           width: "120px",
           height: "120px",
           border: "1px solid rgba(255,255,255,0.06)",
           borderRadius: "8px",
           backgroundColor: "rgba(0,0,0,0.3)",
           display: "flex",
           alignItems: "center",
           justifyContent: "center",
           overflow: "hidden",
           position: "relative"
          }}
         >
          {productForm.benefits_image ? (
           <img
            src={productForm.benefits_image}
            alt="Benefits Section Preview"
            style={{ width: "90%", height: "90%", objectFit: "contain" }}
            onError={(e) => (e.target.style.opacity = "0.3")}
           />
          ) : (
           <span style={{ fontSize: "0.75rem", color: "var(--color-muted)", textAlign: "center", padding: "0.5rem" }}>
            No image uploaded
           </span>
          )}
         </div>
        </div>
       </div>

       <div className="contact-form-group">
        <label className="contact-form-label">Description Summary</label>
        <textarea
         className="contact-form-textarea"
         required
         value={productForm.description}
         onChange={(e) =>
          setProductForm((prev) => ({ ...prev, description: e.target.value }))
         }
         style={{ minHeight: "80px" }}
        />
       </div>

       <div className="contact-form-group">
        <label className="contact-form-label">
         Benefits Checklist (Comma separated list)
        </label>
        <input
         type="text"
         className="contact-form-input"
         value={productForm.benefits}
         onChange={(e) =>
          setProductForm((prev) => ({ ...prev, benefits: e.target.value }))
         }
         placeholder="Roasted Not Fried, Zero Trans Fat, Crunchy"
        />
       </div>

       {/* Ingredients UI */}
       <div className="contact-form-group" style={{ gridColumn: "span 2" }}>
        <label
         className="contact-form-label"
         style={{ fontSize: "0.95rem", color: "var(--color-white)" }}
        >
         Key Ingredients
        </label>
        <div
         style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.8rem",
          border: "1px solid rgba(255,255,255,0.03)",
          padding: "1rem",
          borderRadius: "8px",
          backgroundColor: "rgba(0,0,0,0.2)",
         }}
        >
         {productForm.ingredients &&
          productForm.ingredients.map((ing, index) => (
           <div
            key={index}
            style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}
           >
            <input
             type="text"
             className="contact-form-input"
             placeholder="Ingredient Name (e.g. Makhana)"
             value={ing.name || ""}
             onChange={(e) => {
              const newIngs = [...productForm.ingredients];
              newIngs[index].name = e.target.value;

              // Auto-map name to image if possible!
              const knownMap = {
               makhana: "images/ingredient_makhana.png",
               "cheese powder": "images/ingredient_cheese.png",
               "onion powder": "images/ingredient_onion.png",
               "rock salt": "images/ingredient_salt.png",
               salt: "images/ingredient_salt.png",
               "pink himalayan salt": "images/ingredient_salt.png",
               "spices & herbs": "images/ingredient_spices.png",
               "olive oil": "images/ingredient_spices.png",
               "cold pressed oil": "images/ingredient_spices.png",
               "premium almonds": "images/almonds_california.png",
               "creamy cashews": "images/cashews_roasted.png",
               "iranian pistachios": "images/pistachios_roasted.png",
               "green raisins": "images/raisins_premium.png",
              };
              const key = e.target.value.toLowerCase().trim();
              if (knownMap[key]) {
               newIngs[index].img = knownMap[key];
              }
              setProductForm((prev) => ({ ...prev, ingredients: newIngs }));
             }}
             style={{ flex: 1 }}
            />
            <input
             type="text"
             className="contact-form-input"
             placeholder="Image URL (e.g. https://example.com/image.png)"
             value={ing.img || ""}
             onChange={(e) => {
              const newIngs = [...productForm.ingredients];
              newIngs[index].img = e.target.value;
              setProductForm((prev) => ({ ...prev, ingredients: newIngs }));
             }}
             style={{ flex: 1 }}
            />
            {ing.img && (
             <div
              style={{
               width: "32px",
               height: "32px",
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               border: "1px solid rgba(255,255,255,0.1)",
               borderRadius: "4px",
               backgroundColor: "rgba(255,255,255,0.02)",
              }}
             >
              <img
               src={ing.img}
               alt=""
               style={{
                maxWidth: "90%",
                maxHeight: "90%",
                objectFit: "contain",
               }}
               onError={(e) => (e.target.style.display = "none")}
              />
             </div>
            )}
            <button
             type="button"
             onClick={() => {
              const newIngs = productForm.ingredients.filter(
               (_, i) => i !== index,
              );
              setProductForm((prev) => ({ ...prev, ingredients: newIngs }));
             }}
             style={{
              background: "rgba(255,80,80,0.15)",
              color: "rgba(255,80,80,0.9)",
              border: "none",
              borderRadius: "4px",
              width: "32px",
              height: "32px",
              cursor: "pointer",
              fontSize: "1.2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
             }}
            >
             &times;
            </button>
           </div>
          ))}
         <button
          type="button"
          onClick={() => {
           setProductForm((prev) => ({
            ...prev,
            ingredients: [...(prev.ingredients || []), { name: "", img: "" }],
           }));
          }}
          className="btn btn-outline"
          style={{
           height: "32px",
           fontSize: "0.75rem",
           alignSelf: "flex-start",
          }}
         >
          + Add Ingredient Item
         </button>
        </div>
       </div>

       {/* Specifications UI */}
       <div className="contact-form-group" style={{ gridColumn: "span 2" }}>
        <label
         className="contact-form-label"
         style={{ fontSize: "0.95rem", color: "var(--color-white)" }}
        >
         Product Specifications
        </label>
        <div
         style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          border: "1px solid rgba(255,255,255,0.03)",
          padding: "1rem",
          borderRadius: "8px",
          backgroundColor: "rgba(0,0,0,0.2)",
         }}
        >
         {[
          "Brand",
          "Flavour",
          "Net Weight",
          "Diet Type",
          "Shelf Life",
          "Country of Origin",
         ].map((specName) => (
          <div key={specName} className="contact-form-group">
           <label
            className="contact-form-label"
            style={{ fontSize: "0.7rem", color: "var(--color-muted)" }}
           >
            {specName}
           </label>
           <input
            type="text"
            className="contact-form-input"
            value={
             productForm.specs && productForm.specs[specName] !== undefined
              ? productForm.specs[specName]
              : ""
            }
            onChange={(e) => {
             setProductForm((prev) => ({
              ...prev,
              specs: {
               ...(prev.specs || {}),
               [specName]: e.target.value,
              },
             }));
            }}
            placeholder={`e.g. ${specName === "Brand" ? "Rein Oro" : specName === "Flavour" ? "Cheese & Onion" : ""}`}
           />
          </div>
         ))}
        </div>
       </div>

       {/* Nutrition UI */}
       <div className="contact-form-group" style={{ gridColumn: "span 2" }}>
        <label
         className="contact-form-label"
         style={{ fontSize: "0.95rem", color: "var(--color-white)" }}
        >
         Nutritional Information (per 100g/serving)
        </label>
        <div
         style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "1rem",
          border: "1px solid rgba(255,255,255,0.03)",
          padding: "1rem",
          borderRadius: "8px",
          backgroundColor: "rgba(0,0,0,0.2)",
         }}
        >
         {[
          "Calories",
          "Protein",
          "Total Carbohydrates",
          "Dietary Fiber",
          "Total Fat",
          "Trans Fat",
          "Sodium",
         ].map((nutName) => (
          <div key={nutName} className="contact-form-group">
           <label
            className="contact-form-label"
            style={{ fontSize: "0.7rem", color: "var(--color-muted)" }}
           >
            {nutName}
           </label>
           <input
            type="text"
            className="contact-form-input"
            value={
             productForm.nutrition &&
             productForm.nutrition[nutName] !== undefined
              ? productForm.nutrition[nutName]
              : ""
            }
            onChange={(e) => {
             setProductForm((prev) => ({
              ...prev,
              nutrition: {
               ...(prev.nutrition || {}),
               [nutName]: e.target.value,
              },
             }));
            }}
            placeholder={`e.g. ${nutName === "Calories" ? "380 Kcal" : nutName === "Protein" ? "9.5g" : "0g"}`}
           />
          </div>
         ))}
        </div>
       </div>

       <div style={{ display: "flex", gap: "1.5rem", marginTop: "1rem" }}>
        <button
         type="submit"
         className="btn btn-primary"
         style={{ flex: 1, height: "40px" }}
        >
         SAVE CHANGES
        </button>
        <button
         type="button"
         className="btn btn-outline"
         onClick={() => setIsModalOpen(false)}
         style={{ flex: 1, height: "40px" }}
        >
         CANCEL
        </button>
        </div>
       </form>
      </div>
     </div>
    )}

   {selectedOrder && (
    <div
     style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.85)",
      zIndex: 10000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
     }}
    >
     <div
      style={{
       border: "1px solid var(--color-gold-border)",
       borderRadius: "12px",
       width: "100%",
       maxWidth: "680px",
       padding: "2.5rem",
       backgroundColor: "#090909",
       position: "relative",
       maxHeight: "90vh",
       overflowY: "auto",
      }}
     >
      <button
       type="button"
       onClick={() => setSelectedOrder(null)}
       style={{
        position: "absolute",
        top: "1.5rem",
        right: "1.5rem",
        background: "none",
        border: "none",
        color: "var(--color-muted)",
        fontSize: "1.5rem",
        cursor: "pointer",
        lineHeight: 1,
       }}
      >
       &times;
      </button>

      <h3
       style={{
        fontFamily: "var(--font-heading)",
        fontSize: "1.8rem",
        color: "var(--color-white)",
        fontWeight: 300,
        marginBottom: "1.5rem",
       }}
      >
       Order Details
      </h3>

      <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1.5rem" }}>
       <div>
        <p style={{ margin: "0.2rem 0", color: "var(--color-muted)", fontSize: "0.85rem" }}>
         Order ID: <span style={{ color: "var(--color-white)", fontFamily: "monospace" }}>#{selectedOrder.id}</span>
        </p>
        <p style={{ margin: "0.2rem 0", color: "var(--color-muted)", fontSize: "0.85rem" }}>
         Date Placed: <span style={{ color: "var(--color-white)" }}>{selectedOrder.date}</span>
        </p>
        <p style={{ margin: "0.2rem 0", color: "var(--color-muted)", fontSize: "0.85rem" }}>
         Customer Email: <span style={{ color: "var(--color-white)" }}>{selectedOrder.user_email}</span>
        </p>
        <p style={{ margin: "0.2rem 0", color: "var(--color-muted)", fontSize: "0.85rem" }}>
         Payment Method: <span style={{ color: "var(--color-white)" }}>{selectedOrder.payment_method}</span>
        </p>
        <p style={{ margin: "0.2rem 0", color: "var(--color-muted)", fontSize: "0.85rem" }}>
         Payment Status: <span style={{ color: "var(--color-white)" }}>{selectedOrder.payment_status || "Pending"}</span>
        </p>
        {selectedOrder.payment_id && (
         <p style={{ margin: "0.2rem 0", color: "var(--color-muted)", fontSize: "0.85rem" }}>
          Payment ID: <span style={{ color: "var(--color-white)", fontFamily: "monospace" }}>{selectedOrder.payment_id}</span>
         </p>
        )}
        {getOrderInvoice(selectedOrder) && (
         <p style={{ margin: "0.2rem 0", color: "var(--color-muted)", fontSize: "0.85rem" }}>
          GST Invoice: <span style={{ color: "var(--color-white)", fontFamily: "monospace" }}>{getOrderInvoice(selectedOrder).invoice_no}</span>
         </p>
        )}
       </div>
       <div style={{ textAlign: "right" }}>
        <label style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase", color: "var(--color-gold)", marginBottom: "0.4rem" }}>
         Order Status
        </label>
        <select
         value={selectedOrder.status || "Processing"}
         onChange={(e) => {
          const newStatus = e.target.value;
          handleUpdateOrderStatus(selectedOrder.id, newStatus);
          setSelectedOrder(prev => ({ ...prev, status: newStatus }));
         }}
         style={{
          backgroundColor: "#050505",
          color:
           selectedOrder.status === "Delivered"
            ? "#10b981"
            : selectedOrder.status === "Cancelled"
              ? "#ef4444"
              : selectedOrder.status === "Shipped"
                ? "#3b82f6"
                : "#c9a84c",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "4px",
          fontSize: "0.85rem",
          padding: "6px 12px",
          cursor: "pointer",
         }}
        >
         <option value="Processing" style={{ backgroundColor: "#050505", color: "#c9a84c" }}>Processing</option>
         <option value="Confirmed" style={{ backgroundColor: "#050505", color: "#c9a84c" }}>Confirmed</option>
         <option value="Shipped" style={{ backgroundColor: "#050505", color: "#3b82f6" }}>Shipped</option>
         <option value="Delivered" style={{ backgroundColor: "#050505", color: "#10b981" }}>Delivered</option>
         <option value="Cancelled" style={{ backgroundColor: "#050505", color: "#ef4444" }}>Cancelled</option>
        </select>
       </div>
      </div>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "1.5rem 0", marginBottom: "1.5rem" }}>
       <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", color: "var(--color-white)", fontWeight: 300, marginBottom: "1rem" }}>
        Ordered Items
       </h4>
       <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item, idx) => (
         <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
           <div style={{
            width: "50px",
            height: "50px",
            backgroundColor: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden"
           }}>
            {item.image ? (
             <img src={item.image} alt={item.name} style={{ width: "90%", height: "90%", objectFit: "contain" }} />
            ) : (
             <span style={{ fontSize: "0.6rem", color: "var(--color-muted)" }}>No image</span>
            )}
           </div>
           <div>
            <span style={{ display: "block", color: "var(--color-white)", fontSize: "0.9rem", fontWeight: 500 }}>
             {item.name || item.title || "Gourmet Offering"}
            </span>
            <span style={{ display: "block", color: "var(--color-muted)", fontSize: "0.8rem" }}>
             {item.weight || item.variant || "Standard"} {item.flavor ? `• ${item.flavor}` : ""}
            </span>
           </div>
          </div>
          <div style={{ textAlign: "right" }}>
           <span style={{ display: "block", color: "var(--color-white)", fontSize: "0.9rem" }}>
            {item.qty || item.quantity || 0} x ₹{item.price}
           </span>
           <span style={{ display: "block", color: "var(--color-gold)", fontSize: "0.9rem", fontWeight: 600 }}>
            ₹{((item.qty || item.quantity || 0) * item.price).toLocaleString("en-IN")}
           </span>
          </div>
         </div>
        ))}
       </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
       <div>
        <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", color: "var(--color-white)", fontWeight: 300, marginBottom: "0.8rem" }}>
         Payment Details
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.85rem" }}>
         <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "var(--color-muted)" }}>Subtotal</span>
          <span style={{ color: "var(--color-white)" }}>₹{(selectedOrder.subtotal || 0).toLocaleString("en-IN")}</span>
         </div>
         {selectedOrder.discount > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
           <span style={{ color: "var(--color-muted)" }}>Coupon Discount</span>
           <span style={{ color: "#ef4444" }}>-₹{(selectedOrder.discount).toLocaleString("en-IN")}</span>
          </div>
         )}
         <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "var(--color-muted)" }}>Shipping</span>
          <span style={{ color: "var(--color-white)" }}>
           {selectedOrder.shipping > 0 ? `₹${selectedOrder.shipping.toLocaleString("en-IN")}` : "Free"}
          </span>
         </div>
         {selectedOrder.tax > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
           <span style={{ color: "var(--color-muted)" }}>GST/Tax</span>
           <span style={{ color: "var(--color-white)" }}>₹{(selectedOrder.tax).toLocaleString("en-IN")}</span>
          </div>
         )}
         {selectedOrder.cod_fee > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
           <span style={{ color: "var(--color-muted)" }}>COD Fee</span>
           <span style={{ color: "var(--color-white)" }}>₹{(selectedOrder.cod_fee).toLocaleString("en-IN")}</span>
          </div>
         )}
         <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "0.4rem", marginTop: "0.4rem", fontSize: "1.05rem", fontWeight: 600 }}>
          <span style={{ color: "var(--color-white)" }}>Total Paid</span>
          <span style={{ color: "var(--color-gold)" }}>₹{(selectedOrder.total || 0).toLocaleString("en-IN")}</span>
         </div>
        </div>
       </div>

       <div>
        <h4 style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", color: "var(--color-white)", fontWeight: 300, marginBottom: "0.8rem" }}>
         Delivery Address
        </h4>
        {selectedOrder.shipping_address ? (
         <div style={{ fontSize: "0.85rem", color: "var(--color-white)", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
          <strong>{selectedOrder.shipping_address.fullName}</strong>
          <span>{selectedOrder.shipping_address.street} {selectedOrder.shipping_address.apartment ? `, ${selectedOrder.shipping_address.apartment}` : ""}</span>
          <span>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} - {selectedOrder.shipping_address.pincode}</span>
          <span>{selectedOrder.shipping_address.country}</span>
          <span style={{ color: "var(--color-muted)", marginTop: "0.4rem" }}>Phone: {selectedOrder.shipping_address.phone}</span>
         </div>
        ) : loadingAddresses ? (
         <p style={{ fontSize: "0.85rem", color: "var(--color-muted)" }}>Loading delivery address...</p>
        ) : selectedOrderAddresses.length > 0 ? (
         <div style={{ fontSize: "0.85rem", color: "var(--color-white)", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
          <strong>{selectedOrderAddresses[0].name || selectedOrder.user_email}</strong>
          <span>{selectedOrderAddresses[0].address}</span>
          <span>{selectedOrderAddresses[0].city}{selectedOrderAddresses[0].state ? `, ${selectedOrderAddresses[0].state}` : ""} - {selectedOrderAddresses[0].pincode}</span>
          <span>{selectedOrderAddresses[0].country || "India"}</span>
          <span style={{ color: "var(--color-muted)", marginTop: "0.4rem" }}>Phone: {selectedOrderAddresses[0].phone || "N/A"}</span>
         </div>
        ) : (
         <p style={{ fontSize: "0.85rem", color: "var(--color-muted)" }}>No delivery address recorded.</p>
        )}
       </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1.5rem" }}>
       {getOrderInvoice(selectedOrder) && (
        <button
         type="button"
         className="btn btn-primary"
         onClick={() => openAdminInvoicePrintWindow(selectedOrder)}
         style={{ width: "190px", height: "40px" }}
        >
         PRINT GST INVOICE
        </button>
       )}
       <button
        type="button"
        className="btn btn-outline"
        onClick={() => setSelectedOrder(null)}
        style={{ width: "150px", height: "40px" }}
       >
        CLOSE
       </button>
      </div>
     </div>
    </div>
   )}

   {confirmDialog && (
    <div
     style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      backdropFilter: "blur(6px)",
      zIndex: 999999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
     }}
    >
     <div
      style={{
       width: "100%",
       maxWidth: "400px",
       backgroundColor: "#0B0B0B",
       border: "1px solid rgba(201, 168, 76, 0.25)",
       borderRadius: "8px",
       padding: "2.2rem",
       textAlign: "center",
       boxShadow: "0 10px 45px rgba(0,0,0,0.8)",
      }}
     >
      <div style={{ fontSize: "2rem", marginBottom: "0.8rem" }}>⚠️</div>
      <h3
       style={{
        fontFamily: "var(--font-heading)",
        fontSize: "1.4rem",
        color: "var(--color-white)",
        fontWeight: 400,
        marginBottom: "0.8rem",
       }}
      >
       Confirm Action
      </h3>
      <p
       style={{
        fontSize: "0.85rem",
        color: "var(--color-muted)",
        lineHeight: 1.5,
        marginBottom: "1.8rem",
       }}
      >
       {confirmDialog.message}
      </p>
      <div style={{ display: "flex", gap: "1rem" }}>
       <button
        className="btn btn-primary"
        onClick={() => {
         confirmDialog.onConfirm();
         setConfirmDialog(null);
        }}
        style={{
         flex: 1,
         height: "40px",
         backgroundColor: "var(--color-gold)",
         color: "#000",
         border: "none",
         fontWeight: "bold",
         cursor: "pointer",
         borderRadius: "4px",
        }}
       >
        CONFIRM
       </button>
       <button
        className="btn btn-outline"
        onClick={() => setConfirmDialog(null)}
        style={{
         flex: 1,
         height: "40px",
         backgroundColor: "transparent",
         color: "var(--color-white)",
         border: "1px solid rgba(255,255,255,0.2)",
         cursor: "pointer",
         borderRadius: "4px",
        }}
       >
        CANCEL
       </button>
      </div>
     </div>
    </div>
   )}
  </div>
 );
}
