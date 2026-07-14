import React, { useContext, useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext, CartContext } from "../App.jsx";
import { apiUrl } from "../config/api.js";
import {
 getFirebaseClient,
 isFirebaseClientConfigured,
} from "../config/firebase.js";
import { getGstSellerProfile } from "../config/gstProfile.js";

function normalizeProfilePhone(value) {
 const raw = String(value || "").trim();
 const digits = raw.replace(/\D/g, "");
 if (raw.startsWith("+") && digits.length >= 10 && digits.length <= 15) {
  return `+${digits}`;
 }
 if (digits.length === 10) return `+91${digits}`;
 if (digits.length === 11 && digits.startsWith("0")) {
  return `+91${digits.slice(1)}`;
 }
 if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
 if (digits.length >= 11 && digits.length <= 15) return `+${digits}`;
 return raw;
}

function getProfilePhoneKey(value) {
 return normalizeProfilePhone(value).replace(/\D/g, "");
}

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
        text-align: center;
        font-size: 10px;
        color: #777;
        margin-top: 45px;
        border-top: 1px solid #eee;
        padding-top: 12px;
        font-family: 'Courier New', Courier, monospace;
        letter-spacing: 0.02em;
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

async function downloadInvoicePdf(order) {
 const invoice = getOrderInvoice(order);
 if (!invoice) {
  alert("GST invoice is not available for this order yet.");
  return;
 }
 const html = buildInvoiceHtml(order);
 if (!html) return;

 try {
  const html2pdf = await loadHtml2Pdf();
  const element = document.createElement("div");
  const bodyContent = html.substring(html.indexOf("<body>") + 6, html.indexOf("</body>"));
  element.innerHTML = `
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
   html2canvas: { scale: 2, logging: false, useCORS: true },
   jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
  };

  await html2pdf().from(element).set(opt).save();
 } catch (err) {
  console.error("PDF generation failed:", err);
  alert("Failed to download PDF invoice. Please check your connection.");
 }
}

export default function Dashboard() {
 const { user, login, logout, wishlist, toggleWishlist, syncProfile } = useContext(AuthContext);
 const { addToCart } = useContext(CartContext);
 const navigate = useNavigate();
 const profileRecaptchaRef = useRef(null);

 // Profile state
 const [showEditProfileModal, setShowEditProfileModal] = useState(false);
 const [modalProfileForm, setModalProfileForm] = useState({ name: "" });
 const [modalProfileLoading, setModalProfileLoading] = useState(false);

 // Email update state
 const [showEmailModal, setShowEmailModal] = useState(false);
 const [emailForm, setEmailForm] = useState({ newEmail: "" });
 const [emailLoading, setEmailLoading] = useState(false);

 // Password change state
 const [showPasswordModal, setShowPasswordModal] = useState(false);
 const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
 const [passwordLoading, setPasswordLoading] = useState(false);

 const [activeTab, setActiveTab] = useState("dashboard");
 const [wishlistedProducts, setWishlistedProducts] = useState([]);
 const [wishlistLoading, setWishlistLoading] = useState(false);
 const [profileForm, setProfileForm] = useState({
  name: "",
  email: "",
  phone: "",
  phoneOtp: "",
  currentPassword: "",
  newPassword: "",
 });
 const [profileNotice, setProfileNotice] = useState("");
 const [profileError, setProfileError] = useState("");
 const [profileLoading, setProfileLoading] = useState("");
 const [phoneVerification, setPhoneVerification] = useState(null);

 useEffect(() => {
  if (!user) return;
  setProfileForm((prev) => ({
   ...prev,
   name: user.name || "",
   email: user.email || "",
   phone: user.phone || "",
   phoneOtp: "",
   currentPassword: "",
   newPassword: "",
  }));
 }, [user]);

 useEffect(() => {
  if (!user || activeTab !== "wishlist") return;
  setWishlistLoading(true);
  fetch(apiUrl(`/api/users/wishlist?email=${encodeURIComponent(user.email)}`))
   .then((res) => {
    if (!res.ok) throw new Error("Failed to load wishlist details");
    return res.json();
   })
   .then((data) => {
    setWishlistedProducts(data.products || []);
   })
   .catch((err) => {
    console.error("Wishlist load error:", err);
   })
   .finally(() => {
    setWishlistLoading(false);
   });
 }, [user, activeTab, wishlist]);
 const [orders, setOrders] = useState([]);
 const [recProducts, setRecProducts] = useState([]);
 const [recIndex, setRecIndex] = useState(0);

 const [addresses, setAddresses] = useState([]);
 const [isEditing, setIsEditing] = useState(false);
 const [currentAddress, setCurrentAddress] = useState(null);
 const [addressForm, setAddressForm] = useState({
  fullName: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
 });
 const [addressLoading, setAddressLoading] = useState(false);
 const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
 const [addressToDelete, setAddressToDelete] = useState(null);
 const [orderToCancel, setOrderToCancel] = useState(null);

 const setProfileMessage = (type, message) => {
  setProfileNotice(type === "success" ? message : "");
  setProfileError(type === "error" ? message : "");
 };

 const updateLocalProfile = (updates) => {
  const nextUser = { ...user, ...updates };
  login(nextUser, nextUser.role || "user", nextUser.token || user.token || "");
 };

 const getActiveFirebaseUser = async (auth) => {
  if (auth.currentUser) return auth.currentUser;
  const { onAuthStateChanged } = await import("firebase/auth");
  return new Promise((resolve) => {
   let done = false;
   const timer = setTimeout(() => {
    if (!done) {
     done = true;
     resolve(null);
    }
   }, 2500);
   const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
    if (done) return;
    done = true;
    clearTimeout(timer);
    unsubscribe();
    resolve(firebaseUser);
   });
  });
 };

 const getProfileFirebaseContext = async () => {
  if (!isFirebaseClientConfigured) {
   throw new Error("Firebase client is not configured.");
  }
  const firebaseClient = await getFirebaseClient();
  const firebaseUser = await getActiveFirebaseUser(firebaseClient.auth);
  if (!firebaseUser) {
   throw new Error("Please sign out and sign in again before changing profile security details.");
  }
  return { ...firebaseClient, firebaseUser };
 };

 const getProfileRecaptchaVerifier = async (auth) => {
  if (profileRecaptchaRef.current) return profileRecaptchaRef.current;
  const { RecaptchaVerifier } = await import("firebase/auth");
  profileRecaptchaRef.current = new RecaptchaVerifier(
   auth,
   "profile-phone-recaptcha",
   { size: "invisible" },
  );
  return profileRecaptchaRef.current;
 };

 const handleSaveProfileName = async (event) => {
  event.preventDefault();
  const cleanName = profileForm.name.trim();
  if (!cleanName) {
   setProfileMessage("error", "Name is required.");
   return;
  }
  setProfileLoading("name");
  setProfileMessage("success", "");
  try {
   const { auth, db, firebaseUser } = await getProfileFirebaseContext();
   const [{ updateProfile }, { doc, setDoc, serverTimestamp }] =
    await Promise.all([import("firebase/auth"), import("firebase/firestore")]);
   await updateProfile(firebaseUser, { displayName: cleanName });
   await setDoc(
    doc(db, "users", firebaseUser.uid),
    { name: cleanName, updatedAt: serverTimestamp() },
    { merge: true },
   );
   const token = await auth.currentUser.getIdToken(true);
   updateLocalProfile({ name: cleanName, token });
   setProfileMessage("success", "Name updated successfully.");
  } catch (err) {
   setProfileMessage("error", err.message || "Unable to update name.");
  } finally {
   setProfileLoading("");
  }
 };

 const handleSendPhoneOtp = async (event) => {
  event.preventDefault();
  const cleanPhone = normalizeProfilePhone(profileForm.phone);
  if (!/^\+[1-9]\d{9,14}$/.test(cleanPhone)) {
   setProfileMessage("error", "Enter a valid mobile number with country code.");
   return;
  }
  setProfileLoading("phone-send");
  setProfileMessage("success", "");
  try {
   const { auth } = await getProfileFirebaseContext();
   const { PhoneAuthProvider } = await import("firebase/auth");
   const appVerifier = await getProfileRecaptchaVerifier(auth);
   const provider = new PhoneAuthProvider(auth);
   const verificationId = await provider.verifyPhoneNumber(cleanPhone, appVerifier);
   setPhoneVerification({ verificationId, phone: cleanPhone });
   setProfileForm((prev) => ({ ...prev, phone: cleanPhone, phoneOtp: "" }));
   setProfileMessage("success", "OTP sent to the new mobile number.");
  } catch (err) {
   setProfileMessage("error", err.message || "Unable to send mobile OTP.");
  } finally {
   setProfileLoading("");
  }
 };

 const handleVerifyPhoneOtp = async (event) => {
  event.preventDefault();
  const code = profileForm.phoneOtp.trim();
  if (!phoneVerification?.verificationId) {
   setProfileMessage("error", "Please send OTP first.");
   return;
  }
  if (!/^\d{6}$/.test(code)) {
   setProfileMessage("error", "Enter a valid 6-digit OTP.");
   return;
  }
  setProfileLoading("phone-verify");
  setProfileMessage("success", "");
  try {
   const { auth, db, firebaseUser } = await getProfileFirebaseContext();
   const [
    { PhoneAuthProvider, updatePhoneNumber },
    { deleteDoc, doc, setDoc, serverTimestamp },
   ] = await Promise.all([import("firebase/auth"), import("firebase/firestore")]);
   const credential = PhoneAuthProvider.credential(
    phoneVerification.verificationId,
    code,
   );
   await updatePhoneNumber(firebaseUser, credential);
   const newPhone = phoneVerification.phone;
   await setDoc(
    doc(db, "users", firebaseUser.uid),
    { phone: newPhone, phoneVerifiedAt: serverTimestamp(), updatedAt: serverTimestamp() },
    { merge: true },
   );
   await setDoc(
    doc(db, "phone_login", getProfilePhoneKey(newPhone)),
    {
     uid: firebaseUser.uid,
     email: firebaseUser.email || user.email,
     phone: newPhone,
     updatedAt: serverTimestamp(),
    },
    { merge: true },
   );
   const oldPhoneKey = getProfilePhoneKey(user.phone);
   const newPhoneKey = getProfilePhoneKey(newPhone);
   if (oldPhoneKey && oldPhoneKey !== newPhoneKey) {
    await deleteDoc(doc(db, "phone_login", oldPhoneKey)).catch(() => {});
   }
   const token = await auth.currentUser.getIdToken(true);
   updateLocalProfile({ phone: newPhone, token });
   setPhoneVerification(null);
   setProfileForm((prev) => ({ ...prev, phone: newPhone, phoneOtp: "" }));
   setProfileMessage("success", "Mobile number verified and updated.");
  } catch (err) {
   setProfileMessage("error", err.message || "OTP verification failed.");
  } finally {
   setProfileLoading("");
  }
 };

 const handleSendEmailVerification = async (event) => {
  event.preventDefault();
  const nextEmail = profileForm.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
   setProfileMessage("error", "Enter a valid email address.");
   return;
  }
  if (nextEmail === String(user.email || "").toLowerCase()) {
   setProfileMessage("success", "This email is already active on your account.");
   return;
  }
  setProfileLoading("email");
  setProfileMessage("success", "");
  try {
   const { db, firebaseUser } = await getProfileFirebaseContext();
   const [{ verifyBeforeUpdateEmail }, { doc, setDoc, serverTimestamp }] =
    await Promise.all([import("firebase/auth"), import("firebase/firestore")]);
   await verifyBeforeUpdateEmail(firebaseUser, nextEmail);
   await setDoc(
    doc(db, "users", firebaseUser.uid),
    { pendingEmail: nextEmail, emailChangeRequestedAt: serverTimestamp() },
    { merge: true },
   );
   setProfileMessage(
    "success",
    "Verification link sent. Open it from your email, then return here and refresh verified email.",
   );
  } catch (err) {
   setProfileMessage("error", err.message || "Unable to send verification email.");
  } finally {
   setProfileLoading("");
  }
 };

 const handleRefreshVerifiedEmail = async () => {
  setProfileLoading("email-refresh");
  setProfileMessage("success", "");
  try {
   const { auth, db, firebaseUser } = await getProfileFirebaseContext();
   const [{ doc, setDoc, deleteField, serverTimestamp }] = await Promise.all([
    import("firebase/firestore"),
   ]);
   await firebaseUser.reload();
   const refreshedUser = auth.currentUser;
   const activeEmail = String(refreshedUser.email || "").toLowerCase();
   if (!activeEmail || activeEmail === String(user.email || "").toLowerCase()) {
    setProfileMessage("success", "No verified email change found yet.");
    return;
   }
   await setDoc(
    doc(db, "users", refreshedUser.uid),
    {
     email: activeEmail,
     pendingEmail: deleteField(),
     emailVerifiedAt: serverTimestamp(),
     updatedAt: serverTimestamp(),
    },
    { merge: true },
   );
   const phoneKey = getProfilePhoneKey(user.phone);
   if (phoneKey) {
    await setDoc(
     doc(db, "phone_login", phoneKey),
     { email: activeEmail, updatedAt: serverTimestamp() },
     { merge: true },
    );
   }
   const token = await refreshedUser.getIdToken(true);
   updateLocalProfile({ email: activeEmail, token });
   setProfileForm((prev) => ({ ...prev, email: activeEmail }));
   setProfileMessage("success", "Verified email synced successfully.");
  } catch (err) {
   setProfileMessage("error", err.message || "Unable to refresh verified email.");
  } finally {
   setProfileLoading("");
  }
 };

 const handleChangePassword = async (event) => {
  event.preventDefault();
  if (!profileForm.currentPassword || profileForm.newPassword.length < 6) {
   setProfileMessage(
    "error",
    "Enter current password and a new password of at least 6 characters.",
   );
   return;
  }
  setProfileLoading("password");
  setProfileMessage("success", "");
  try {
   const { firebaseUser } = await getProfileFirebaseContext();
   const {
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
   } = await import("firebase/auth");
   const emailForAuth = firebaseUser.email || user.email;
   if (!emailForAuth) {
    throw new Error("Password change requires an email/password account.");
   }
   const credential = EmailAuthProvider.credential(
    emailForAuth,
    profileForm.currentPassword,
   );
   await reauthenticateWithCredential(firebaseUser, credential);
   await updatePassword(firebaseUser, profileForm.newPassword);
   setProfileForm((prev) => ({
    ...prev,
    currentPassword: "",
    newPassword: "",
   }));
   setProfileMessage("success", "Password changed successfully.");
  } catch (err) {
   setProfileMessage("error", err.message || "Unable to change password.");
  } finally {
   setProfileLoading("");
  }
 };

 const executeDeleteAddress = async () => {
  if (!addressToDelete) return;

  setAddressLoading(true);
  const updatedAddresses = addresses.filter((addr) => addr.id !== addressToDelete);

  try {
   const res = await fetch(apiUrl("/api/users/addresses"), {
    method: "PUT",
    headers: {
     "Content-Type": "application/json",
    },
    body: JSON.stringify({
     email: user.email,
     addresses: updatedAddresses,
    }),
   });

   const data = await res.json();
   if (!res.ok) {
    throw new Error(data.error || "Failed to delete address");
   }

   setAddresses(updatedAddresses);
   alert("Address deleted successfully.");
  } catch (err) {
   alert("Error: " + err.message);
  } finally {
   setAddressLoading(false);
   setAddressToDelete(null);
  }
 };

 // Fetch user addresses from database
 useEffect(() => {
  if (!user) return;
  fetch(apiUrl(`/api/users/addresses?email=${encodeURIComponent(user.email)}`))
   .then((res) => {
    if (!res.ok) throw new Error("Failed to load addresses");
    return res.json();
   })
   .then((data) => {
    setAddresses(Array.isArray(data) ? data : []);
   })
   .catch((err) => {
    console.error("Failed to load addresses:", err);
   });
 }, [user]);

 // Auto-fill City & State via India Post Pincode API
 useEffect(() => {
  const pincode = addressForm.pincode.trim();
  if (pincode.length === 6 && /^\d+$/.test(pincode)) {
   fetch(`https://api.postalpincode.in/pincode/${pincode}`)
    .then((res) => res.json())
    .then((data) => {
     if (data && data[0] && data[0].Status === "Success") {
      const postOffice = data[0].PostOffice && data[0].PostOffice[0];
      if (postOffice) {
       setAddressForm((prev) => ({
        ...prev,
        city: postOffice.District || postOffice.Block || prev.city,
        state: postOffice.State || prev.state,
       }));
      }
     }
    })
    .catch((err) => console.error("Pincode API Error:", err));
  }
 }, [addressForm.pincode]);

 const handleOpenAddForm = () => {
  setAddressForm({
   fullName: "",
   street: "",
   city: "",
   state: "",
   pincode: "",
   country: "India",
  });
  setCurrentAddress(null);
  setIsEditing(true);
 };

 const handleOpenEditForm = (addr) => {
  setAddressForm({
   fullName: addr.fullName || "",
   street: addr.street || "",
   city: addr.city || "",
   state: addr.state || "",
   pincode: addr.pincode || "",
   country: addr.country || "India",
  });
  setCurrentAddress(addr);
  setIsEditing(true);
 };

 const handleSaveAddress = async (e) => {
  e.preventDefault();
  if (
   !addressForm.fullName.trim() ||
   !addressForm.street.trim() ||
   !addressForm.city.trim() ||
   !addressForm.state.trim() ||
   !addressForm.pincode.trim() ||
   !addressForm.country.trim()
  ) {
   alert("Please fill in all address fields.");
   return;
  }

  setAddressLoading(true);
  let updatedAddresses = [];

  if (currentAddress) {
   // Edit mode
   updatedAddresses = addresses.map((addr) =>
    addr.id === currentAddress.id ? { ...addr, ...addressForm } : addr,
   );
  } else {
   // Add mode
   const newAddress = {
    id: Date.now().toString(),
    ...addressForm,
   };
   updatedAddresses = [...addresses, newAddress];
  }

  try {
   const res = await fetch(apiUrl("/api/users/addresses"), {
    method: "PUT",
    headers: {
     "Content-Type": "application/json",
    },
    body: JSON.stringify({
     email: user.email,
     addresses: updatedAddresses,
    }),
   });

   const data = await res.json();
   if (!res.ok) {
    throw new Error(data.error || "Failed to save address");
   }

   setAddresses(updatedAddresses);
   setIsEditing(false);
   alert(
    currentAddress
     ? "Address updated successfully."
     : "Address added successfully.",
   );
  } catch (err) {
   alert("Error: " + err.message);
  } finally {
   setAddressLoading(false);
  }
 };

 const executeCancelOrder = async () => {
  if (!orderToCancel) return;
  try {
   const res = await fetch(apiUrl(`/api/orders/${orderToCancel}/status`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "Cancelled" }),
   });
   if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Order cancellation failed");
   }
   alert("Your order has been cancelled.");
   setOrders((prev) =>
    prev.map((o) => (o.id === orderToCancel ? { ...o, status: "Cancelled" } : o))
   );
  } catch (err) {
   alert(err.message);
  } finally {
   setOrderToCancel(null);
  }
 };

 // Route Guard
 useEffect(() => {
  if (!user) {
   navigate("/login");
  }
 }, [user, navigate]);

 // Fetch user orders from database
 useEffect(() => {
  if (!user) return;
  fetch(apiUrl(`/api/orders?email=${encodeURIComponent(user.email)}`))
   .then((res) => res.json())
   .then((data) => {
    setOrders(Array.isArray(data) ? data : []);
   })
   .catch((err) => {
    console.error("Failed to load orders:", err);
    setOrders([]);
   });
 }, [user]);

 // Fetch recommendations
 useEffect(() => {
  fetch(apiUrl("/api/products"))
   .then((res) => res.json())
   .then((data) => {
    setRecProducts(data.slice(0, 5));
   })
   .catch((err) => console.error("Failed to load recommendations:", err));
  }, []);

   const handleOpenEditProfile = () => {
    setProfileForm({
     name: user.name || "",
    });
    setShowEditProfileModal(true);
   };

    const handleSaveProfile = async (e) => {
     e.preventDefault();
     const cleanName = profileForm.name.trim();
     if (!cleanName) {
      alert("Please enter your name.");
      return;
     }
     setProfileLoading("name");
     try {
      const { auth, db, firebaseUser } = await getProfileFirebaseContext();
      const { updateProfile } = await import("firebase/auth");
      const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");

      // Update name if changed
      if (cleanName !== (user.name || "")) {
       await updateProfile(firebaseUser, { displayName: cleanName });
       await setDoc(
        doc(db, "users", firebaseUser.uid),
        { name: cleanName, updatedAt: serverTimestamp() },
        { merge: true }
       );
       const token = await auth.currentUser.getIdToken(true);
       updateLocalProfile({ name: cleanName, token });
       const syncRes = await syncProfile(token);
       if (!syncRes || !syncRes.success) {
        throw new Error(syncRes?.error || "Failed to sync name changes to the database.");
       }
      }

      alert("Profile name updated successfully.");
      setShowEditProfileModal(false);
     } catch (err) {
      alert("Profile update error: [" + (err.code || "Error") + "] " + err.message);
     } finally {
      setProfileLoading("");
     }
    };

    const handleUpdateEmail = async (e) => {
     e.preventDefault();
     const newEmail = emailForm.newEmail.trim().toLowerCase();
     if (!newEmail || !/\S+@\S+\.\S+/.test(newEmail)) {
      alert("Please enter a valid email address.");
      return;
     }

     setEmailLoading(true);
     try {
      const { firebaseUser } = await getProfileFirebaseContext();
      const { verifyBeforeUpdateEmail } = await import("firebase/auth");
      await verifyBeforeUpdateEmail(firebaseUser, newEmail);
      alert(
       "A verification link has been sent to " +
        newEmail +
        ".\n\nPlease verify by clicking the link in the email, then click 'Sync Profile' to complete the change."
      );
      setShowEmailModal(false);
      setEmailForm({ newEmail: "" });
     } catch (err) {
      alert("Email update error: " + err.message);
     } finally {
      setEmailLoading(false);
     }
    };

   const handleModalChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
     alert("Please enter your current password.");
     return;
    }
    if (passwordForm.newPassword.length < 6) {
     alert("New password must be at least 6 characters.");
     return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
     alert("Passwords do not match.");
     return;
    }

    setPasswordLoading(true);
    try {
     const { firebaseUser } = await getProfileFirebaseContext();
     const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } = await import("firebase/auth");
     const credential = EmailAuthProvider.credential(firebaseUser.email || user.email, passwordForm.currentPassword);
     await reauthenticateWithCredential(firebaseUser, credential);
     await updatePassword(firebaseUser, passwordForm.newPassword);
     alert("Password updated successfully.");
     setShowPasswordModal(false);
     setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
     alert("Password update error: " + err.message);
    } finally {
     setPasswordLoading(false);
    }
   };

     if (!user) return null;

  // Format greeting name from email prefix
  const username = user.email.split("@")[0];
  const greetingName = user.name || (username.charAt(0).toUpperCase() + username.slice(1));

  const handleLogoutConfirm = () => {
   logout();
   navigate("/");
  };

 // Recommendations carousel navigation
 const handleRecNext = () => {
  setRecIndex((prev) => Math.min(recProducts.length - 3, prev + 1));
 };
 const handleRecPrev = () => {
  setRecIndex((prev) => Math.max(0, prev - 1));
 };

 const getTrackingSteps = (status = "Processing") => {
  const steps = [
   "Processing",
   "Confirmed",
   "Shipped",
   "Delivered",
  ];
  const normalizedStatus = String(status || "Processing").toLowerCase();
  const currentIndex = Math.max(
   0,
   steps.findIndex((step) => step.toLowerCase() === normalizedStatus),
  );

  return steps.map((step, index) => ({
   label: step,
   done: index <= currentIndex && normalizedStatus !== "cancelled",
  }));
 };

 const isOrderCancelable = (order) => {
  if (order.status === "Delivered" || order.status === "Cancelled") {
   return false;
  }
  let creationTime = null;
  if (order.created_at) {
   creationTime = new Date(order.created_at).getTime();
  } else if (order.date) {
   const cleanDate = order.date.replace(" at ", " ");
   creationTime = Date.parse(cleanDate);
  }
  if (!creationTime || isNaN(creationTime)) {
   return true; // Fallback if no valid date found
  }
  const sixHoursInMs = 6 * 60 * 60 * 1000;
  return (Date.now() - creationTime) <= sixHoursInMs;
 };

 return (
  <main className="cart-page-main">
   <div className="dashboard-page-container">
    {/* Left Sidebar Menu */}
    <aside
     className="dashboard-sidebar"
     style={{
      border: "1px solid rgba(255,255,255,0.03)",
      borderRadius: "8px",
      padding: "1.5rem",
      backgroundColor: "rgba(15,15,15,0.4)",
     }}
    >
     <div
      className="welcome-greeting"
      style={{
       borderBottom: "1px solid rgba(255,255,255,0.05)",
       paddingBottom: "1.2rem",
       marginBottom: "1.5rem",
       textAlign: "center",
      }}
     >
      <span
       style={{
        fontSize: "0.7rem",
        color: "var(--color-muted)",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
       }}
      >
       Welcome back,
      </span>
      <h3
       style={{
        fontFamily: "var(--font-heading)",
        fontSize: "1.5rem",
        color: "var(--color-white)",
        fontWeight: 400,
        marginTop: "0.2rem",
       }}
      >
       {greetingName}
      </h3>
      {user.role === "admin" && (
       <span
        style={{
         display: "inline-block",
         backgroundColor: "var(--color-gold)",
         color: "#000",
         fontSize: "0.65rem",
         fontWeight: "bold",
         padding: "0.1rem 0.5rem",
         borderRadius: "10px",
         marginTop: "0.4rem",
         textTransform: "uppercase",
        }}
       >
        Admin Role
       </span>
      )}
     </div>

     <ul
      className="sidebar-menu-list"
      style={{
       listStyle: "none",
       display: "flex",
       flexDirection: "column",
       gap: "0.5rem",
      }}
     >
      {[
       { id: "dashboard", label: "Dashboard Hub" },
       { id: "orders", label: "Order History" },
       { id: "wishlist", label: "Wishlist Items" },
       { id: "addresses", label: "Saved Addresses" },
      ].map((tab) => (
       <li key={tab.id}>
        <button
         onClick={() => setActiveTab(tab.id)}
         style={{
          width: "100%",
          textAlign: "left",
          background:
           activeTab === tab.id ? "rgba(201,168,76,0.06)" : "transparent",
          border: "none",
          color:
           activeTab === tab.id ? "var(--color-gold)" : "var(--color-muted)",
          padding: "0.6rem 1rem",
          fontSize: "0.82rem",
          cursor: "pointer",
          borderRadius: "4px",
          fontWeight: activeTab === tab.id ? 600 : 400,
          borderLeft:
           activeTab === tab.id ? "2px solid var(--color-gold)" : "none",
          transition: "all 0.2s",
         }}
        >
         {tab.label}
        </button>
       </li>
      ))}

      <li
       style={{
        marginTop: "1.5rem",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        paddingTop: "1.2rem",
       }}
      >
       <button
        onClick={() => setShowLogoutConfirm(true)}
        style={{
         width: "100%",
         textAlign: "left",
         background: "transparent",
         border: "none",
         color: "rgba(255,50,50,0.8)",
         padding: "0.6rem 1rem",
         fontSize: "0.82rem",
         cursor: "pointer",
        }}
       >
        Logout Sign Out
       </button>
      </li>
     </ul>
    </aside>
      <div id="profile-phone-recaptcha" style={{ display: "none" }} />

    {/* Right Main Content Area */}
    <section
     className="dashboard-content-area"
     style={{ flex: 1, minWidth: 0 }}
    >
     {activeTab === "dashboard" && (
      <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
       {/* Royal Profile Details */}
       <div
        style={{
         border: "1px solid rgba(201, 168, 76, 0.15)",
         borderRadius: "8px",
         padding: "2rem",
         backgroundColor: "rgba(15,15,15,0.4)",
         display: "flex",
         flexDirection: "column",
         gap: "1.5rem",
        }}
       >
        <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)", paddingBottom: "1rem" }}>
         <h3
          style={{
           fontFamily: "var(--font-heading)",
           fontSize: "1.4rem",
           fontWeight: 300,
           color: "var(--color-white)",
           margin: 0,
          }}
         >
          👑 Royal Profile Details
         </h3>
         <p style={{ color: "var(--color-muted)", fontSize: "0.8rem", marginTop: "0.2rem" }}>
          Manage your personal information, contact credentials, and security preferences.
         </p>
        </div>

        <div
         style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "2rem",
         }}
        >
         <div>
          <span style={{ fontSize: "0.7rem", color: "var(--color-muted)", textTransform: "uppercase" }}>Name</span>
          <h4 style={{ color: "var(--color-white)", fontSize: "1.1rem", fontWeight: 400, marginTop: "0.2rem", wordBreak: "break-word" }}>
           {user.name || "Not set"}
          </h4>
         </div>
         <div>
          <span style={{ fontSize: "0.7rem", color: "var(--color-muted)", textTransform: "uppercase" }}>Email Address</span>
          <h4 style={{ color: "var(--color-white)", fontSize: "1.1rem", fontWeight: 400, marginTop: "0.2rem", wordBreak: "break-word" }}>
           {user.email}
          </h4>
         </div>
        </div>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1.2rem" }}>
         <button
          className="btn btn-outline"
          onClick={handleOpenEditProfile}
          style={{ height: "36px", fontSize: "0.75rem", padding: "0 1.2rem", borderColor: "rgba(201, 168, 76, 0.3)", color: "var(--color-gold)" }}
         >
          Edit Name
         </button>
         <button
          className="btn btn-outline"
          onClick={() => setShowEmailModal(true)}
          style={{ height: "36px", fontSize: "0.75rem", padding: "0 1.2rem", borderColor: "rgba(201, 168, 76, 0.3)", color: "var(--color-gold)" }}
         >
          Update Email
         </button>
         <button
          className="btn btn-outline"
          onClick={() => setShowPasswordModal(true)}
          style={{ height: "36px", fontSize: "0.75rem", padding: "0 1.2rem", borderColor: "rgba(201, 168, 76, 0.3)", color: "var(--color-gold)" }}
         >
          Change Password
         </button>
         <button
          className="btn btn-outline"
          onClick={async () => {
            const res = await syncProfile();
            if (res && res.success) {
              alert("Profile synced successfully with Firebase!");
            } else {
              alert("Sync failed: " + (res?.error || "Unknown error"));
            }
          }}
          style={{ height: "36px", fontSize: "0.75rem", padding: "0 1.2rem", borderColor: "rgba(255, 255, 255, 0.1)", color: "var(--color-white)" }}
         >
          Sync Profile
         </button>
        </div>
       </div>

       {/* Recaptcha container placeholder */}
       <div id="recaptcha-container"></div>

       {/* Summary Cards */}
       <div className="dashboard-summary-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <div className="summary-metric-card" style={{ textAlign: "center" }}>
         <span
          style={{
           fontSize: "0.68rem",
           color: "var(--color-muted)",
           textTransform: "uppercase",
           letterSpacing: "0.05em",
          }}
         >
          Total Orders
         </span>
         <h4
          style={{
           fontSize: "1.8rem",
           color: "var(--color-white)",
           fontWeight: 600,
           marginTop: "0.3rem",
          }}
         >
          {orders.length}
         </h4>
        </div>
        <div className="summary-metric-card" style={{ textAlign: "center" }}>
         <span
          style={{
           fontSize: "0.68rem",
           color: "var(--color-muted)",
           textTransform: "uppercase",
           letterSpacing: "0.05em",
          }}
         >
          Wishlist items
         </span>
         <h4
          style={{
           fontSize: "1.8rem",
           color: "var(--color-white)",
           fontWeight: 600,
           marginTop: "0.3rem",
          }}
         >
          {wishlist?.length || 0}
         </h4>
        </div>
        <div className="summary-metric-card" style={{ textAlign: "center" }}>
         <span
          style={{
           fontSize: "0.68rem",
           color: "var(--color-muted)",
           textTransform: "uppercase",
           letterSpacing: "0.05em",
          }}
         >
          Saved Addresses
         </span>
         <h4
          style={{
           fontSize: "1.8rem",
           color: "var(--color-white)",
           fontWeight: 600,
           marginTop: "0.3rem",
          }}
         >
          {addresses.length}
         </h4>
        </div>
       </div>

       {/* Recent Orders Log Table */}
       <div
        style={{
         border: "1px solid rgba(255,255,255,0.04)",
         borderRadius: "8px",
         padding: "2rem",
         backgroundColor: "rgba(15,15,15,0.4)",
        }}
       >
        <h3
         style={{
          fontFamily: "var(--font-heading)",
          fontSize: "1.4rem",
          fontWeight: 300,
          color: "var(--color-white)",
          marginBottom: "1.5rem",
         }}
        >
         Recent Orders
        </h3>
        {orders.length === 0 ? (
         <p style={{ color: "var(--color-muted)", fontSize: "0.85rem" }}>
          No orders found in your account history. Place an order to see it
          logged here.
         </p>
        ) : (
         <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {orders.slice(0, 3).map((order) => (
           <div
            key={order.id}
            style={{
             display: "flex",
             justifyContent: "space-between",
             alignItems: "center",
             padding: "1.2rem",
             border: "1px solid rgba(255,255,255,0.03)",
             borderRadius: "6px",
             backgroundColor: "rgba(5,5,5,0.2)",
            }}
           >
            <div>
             <h4
              style={{
               fontSize: "0.88rem",
               color: "var(--color-white)",
               fontWeight: 600,
              }}
             >
              Order #{order.id}
             </h4>
             <p style={{ fontSize: "0.72rem", color: "var(--color-muted)" }}>
              {order.date} &bull; {order.items?.length || 0} Items
             </p>
            </div>
            <div
             style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}
            >
             <span
              style={{
               backgroundColor:
                order.status === "Delivered"
                 ? "rgba(50,200,50,0.1)"
                 : "rgba(201,168,76,0.1)",
               color:
                order.status === "Delivered" ? "#32c832" : "var(--color-gold)",
               fontSize: "0.7rem",
               fontWeight: "bold",
               padding: "0.2rem 0.6rem",
               borderRadius: "4px",
               textTransform: "uppercase",
              }}
             >
              {order.status}
             </span>
             <span
              style={{
               fontSize: "0.95rem",
               color: "var(--color-white)",
               fontWeight: 600,
              }}
             >
              ₹{order.total}
             </span>
            </div>
           </div>
          ))}
         </div>
        )}
       </div>

       {/* Slider recommendations */}
       <div>
        <div
         style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
         }}
        >
         <h3
          style={{
           fontFamily: "var(--font-heading)",
           fontSize: "1.4rem",
           fontWeight: 300,
           color: "var(--color-white)",
          }}
         >
          Exclusive Recommendations
         </h3>
         {recProducts.length > 3 && (
          <div style={{ display: "flex", gap: "0.5rem" }}>
           <button
            className="arrow-left"
            onClick={handleRecPrev}
            disabled={recIndex === 0}
            style={{
             width: "28px",
             height: "28px",
             borderRadius: "50%",
             background: "transparent",
             border: "1px solid rgba(255,255,255,0.1)",
             color: "var(--color-gold)",
             cursor: "pointer",
             opacity: recIndex === 0 ? 0.3 : 1,
            }}
           >
            &lt;
           </button>
           <button
            className="arrow-right"
            onClick={handleRecNext}
            disabled={recIndex >= recProducts.length - 3}
            style={{
             width: "28px",
             height: "28px",
             borderRadius: "50%",
             background: "transparent",
             border: "1px solid rgba(255,255,255,0.1)",
             color: "var(--color-gold)",
             cursor: "pointer",
             opacity: recIndex >= recProducts.length - 3 ? 0.3 : 1,
            }}
           >
            &gt;
           </button>
          </div>
         )}
        </div>

        <div
         className="slider-viewport"
         style={{ overflow: "hidden", width: "100%" }}
        >
         <div
          className="slider-track"
          style={{
           display: "flex",
           gap: "1.5rem",
           transition: "transform 0.4s ease",
           transform: `translateX(-${recIndex * 280}px)`,
          }}
         >
          {recProducts.map((p) => (
           <div key={p.id} style={{ minWidth: "256px", maxWidth: "256px" }}>
            <div className="product-card" style={{ padding: "1.5rem 1rem" }}>
             <div
              className="product-image-wrapper"
              style={{
               height: "140px",
               aspectRatio: "auto",
               marginBottom: "1rem",
              }}
             >
              <Link to={`/product/${p.id}`}>
               <img
                src={p.image}
                alt={p.title}
                style={{ maxHeight: "110px" }}
               />
              </Link>
             </div>
             <div className="product-info" style={{ textAlign: "center" }}>
              <h4
               style={{
                fontSize: "1rem",
                color: "var(--color-white)",
                fontWeight: 500,
               }}
              >
               {p.name}
              </h4>
              <p
               style={{
                fontSize: "0.68rem",
                color: "var(--color-muted)",
                textTransform: "uppercase",
                marginBottom: "0.5rem",
               }}
              >
               {p.flavor}
              </p>
              <span style={{ fontSize: "0.88rem", color: "var(--color-gold)" }}>
               ₹{p.price}
              </span>
              <button
               className="btn btn-outline"
               onClick={() => addToCart(p, 1)}
               style={{
                width: "100%",
                height: "32px",
                fontSize: "0.65rem",
                padding: 0,
                marginTop: "0.8rem",
               }}
              >
               Add to Bag
              </button>
             </div>
            </div>
           </div>
          ))}
         </div>
        </div>
       </div>
      </div>
     )}

          {activeTab === "orders" && (
      <div
       style={{
        border: "1px solid rgba(255,255,255,0.04)",
        borderRadius: "8px",
        padding: "2rem",
        backgroundColor: "rgba(15,15,15,0.4)",
       }}
      >
       <h2
        style={{
         fontFamily: "var(--font-heading)",
         fontSize: "1.8rem",
         fontWeight: 300,
         color: "var(--color-white)",
         marginBottom: "2rem",
        }}
       >
        Your Complete Order History
       </h2>
       {orders.length === 0 ? (
        <p style={{ color: "var(--color-muted)", fontSize: "0.85rem" }}>
         No orders placed yet.
        </p>
       ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
         {orders.map((order) => (
          <div
           key={order.id}
           style={{
            border: "1px solid rgba(255,255,255,0.04)",
            borderRadius: "6px",
            backgroundColor: "rgba(5,5,5,0.2)",
            overflow: "hidden",
           }}
          >
           {/* Order Title row */}
           <div
            style={{
             display: "flex",
             justifyContent: "space-between",
             padding: "1rem 1.5rem",
             backgroundColor: "rgba(255,255,255,0.01)",
             borderBottom: "1px solid rgba(255,255,255,0.03)",
            }}
           >
            <div>
             <span
              style={{
               fontSize: "0.85rem",
               fontWeight: 600,
               color: "var(--color-white)",
              }}
             >
              Order ID: #{order.id}
             </span>
             <span
              style={{
               fontSize: "0.75rem",
               color: "var(--color-muted)",
               marginLeft: "1rem",
              }}
             >
              Placed: {order.date}
             </span>
            </div>
            <span
             style={{
              backgroundColor:
               order.status === "Delivered"
                ? "rgba(50,200,50,0.1)"
                : "rgba(201,168,76,0.1)",
              color:
               order.status === "Delivered" ? "#32c832" : "var(--color-gold)",
              fontSize: "0.65rem",
              fontWeight: "bold",
              padding: "0.15rem 0.5rem",
              borderRadius: "4px",
              textTransform: "uppercase",
             }}
            >
             {order.status}
            </span>
           </div>

           {/* Items loop */}
           <div style={{ padding: "1.5rem" }}>
            {order.items?.map((item, index) => (
             <div
              key={index}
              style={{
               display: "flex",
               gap: "1rem",
               alignItems: "center",
               marginBottom: index === order.items.length - 1 ? 0 : "1rem",
              }}
             >
              <div
               style={{
                width: "40px",
                height: "40px",
                backgroundColor: "rgba(5,5,5,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "2px",
                border: "1px solid rgba(255,255,255,0.04)",
               }}
              >
               <img
                src={item.image}
                alt={item.name}
                style={{
                 maxWidth: "80%",
                 maxHeight: "80%",
                 objectFit: "contain",
                }}
               />
              </div>
              <div style={{ flex: 1 }}>
               <h5
                style={{
                 fontSize: "0.82rem",
                 color: "var(--color-white)",
                 fontWeight: 500,
                }}
               >
                {item.name}
               </h5>
               <p style={{ fontSize: "0.7rem", color: "var(--color-muted)" }}>
                {item.flavor} &bull; Qty: {item.qty} &bull; {item.weight}
               </p>
              </div>
              <span
               style={{ fontSize: "0.82rem", color: "var(--color-white)" }}
              >
               ₹{item.price * item.qty}
              </span>
             </div>
            ))}
           </div>

           {/* Totals tally */}
           <div
            style={{
             display: "flex",
             justifyContent: "space-between",
             padding: "1rem 1.5rem",
             borderTop: "1px solid rgba(255,255,255,0.03)",
             fontSize: "0.82rem",
             color: "var(--color-muted)",
            }}
           >
            <span>Method: {order.payment_method}</span>
            <span>
             Total Paid:{" "}
             <strong
              style={{ color: "var(--color-gold)", fontSize: "0.95rem" }}
             >
              ₹{order.total}
             </strong>
            </span>
           </div>

           <div
            style={{
             padding: "0 1.5rem 1.3rem",
             borderTop: "1px solid rgba(255,255,255,0.03)",
            }}
           >
            {order.status !== "Cancelled" && (
             <p
              style={{
               fontSize: "0.75rem",
               color: "var(--color-muted)",
               marginBottom: "0.8rem",
              }}
             >
              {order.status === "Delivered" ? (
               <span>
                Delivery Status:{" "}
                <strong style={{ color: "#10b981", fontWeight: 600 }}>
                 ✓ Delivered
                </strong>
               </span>
              ) : (
               <span>
                Estimated Delivery:{" "}
                <strong style={{ color: "var(--color-gold)" }}>
                 {order.est_delivery || "Updating soon"}
                </strong>
               </span>
              )}
             </p>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
             <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {order.status === "Cancelled" ? (
               <span style={{ color: "#ff5050", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }}>Order Cancelled</span>
              ) : (
               getTrackingSteps(order.status).map((step) => (
                <span
                 key={step.label}
                 style={{
                  fontSize: "0.68rem",
                  padding: "0.25rem 0.55rem",
                  borderRadius: "999px",
                  backgroundColor: step.done
                   ? "rgba(201,168,76,0.16)"
                   : "rgba(255,255,255,0.05)",
                  color: step.done ? "var(--color-gold)" : "var(--color-muted)",
                  border: step.done
                   ? "1px solid rgba(201,168,76,0.35)"
                   : "1px solid rgba(255,255,255,0.06)",
                 }}
                >
                 {step.label}
                </span>
               ))
              )}
             </div>
             
             <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              {getOrderInvoice(order) && (
               <button
                className="btn btn-outline"
                onClick={() => downloadInvoicePdf(order)}
                style={{
                 height: "30px",
                 padding: "0 1rem",
                 fontSize: "0.72rem",
                 borderColor: "rgba(201,168,76,0.3)",
                 color: "var(--color-gold)",
                 cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(201,168,76,0.1)";
                  e.currentTarget.style.borderColor = "var(--color-gold)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.borderColor = "rgba(201,168,76,0.3)";
                }}
               >
                Download GST invoice
               </button>
              )}

              {order.status !== "Delivered" && order.status !== "Cancelled" && (
               <button
                className="btn btn-outline"
                disabled={!isOrderCancelable(order)}
                onClick={() => setOrderToCancel(order.id)}
                style={{
                 height: "30px",
                 padding: "0 1rem",
                 fontSize: "0.72rem",
                 borderColor: isOrderCancelable(order) ? "rgba(255,80,80,0.3)" : "rgba(255,255,255,0.05)",
                 color: isOrderCancelable(order) ? "#ff5050" : "var(--color-muted)",
                 cursor: isOrderCancelable(order) ? "pointer" : "not-allowed",
                 opacity: isOrderCancelable(order) ? 1 : 0.5,
                }}
                onMouseEnter={(e) => {
                  if (isOrderCancelable(order)) {
                    e.currentTarget.style.backgroundColor = "rgba(255,80,80,0.1)";
                    e.currentTarget.style.borderColor = "#ff5050";
                  }
                }}
                onMouseLeave={(e) => {
                  if (isOrderCancelable(order)) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.borderColor = "rgba(255,80,80,0.3)";
                  }
                }}
               >
                CANCEL ORDER
               </button>
              )}
             </div>
            </div>
           </div>
          </div>
         ))}
        </div>
       )}
      </div>
     )}

      {activeTab === "wishlist" && (
       <div
        style={{
         border: "1px solid rgba(255,255,255,0.04)",
         borderRadius: "8px",
         padding: "2rem",
         backgroundColor: "rgba(15,15,15,0.4)",
        }}
       >
        <h2
         style={{
          fontFamily: "var(--font-heading)",
          fontSize: "1.8rem",
          fontWeight: 300,
          color: "var(--color-white)",
          marginBottom: "2rem",
         }}
        >
         Your Wishlist Items
        </h2>
        {wishlistLoading ? (
         <p style={{ color: "var(--color-muted)", fontSize: "0.85rem" }}>
          Loading your wishlist...
         </p>
        ) : wishlistedProducts.length === 0 ? (
         <p style={{ color: "var(--color-muted)", fontSize: "0.85rem", lineHeight: "1.6" }}>
          Your wishlist is currently empty. Explore our gourmet collection to add your favorites.
         </p>
        ) : (
         <div
          style={{
           display: "grid",
           gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
           gap: "1.5rem",
          }}
         >
          {wishlistedProducts.map((p) => {
           const displayPrice = p.price;
           const isOutOfStock = p.stock === 0 || p.stock === "0";
           return (
            <div
             key={p.id}
             className="product-card"
             style={{
              padding: "1.5rem 1rem",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: "100%",
             }}
            >
             <button
              onClick={(e) => {
               e.preventDefault();
               e.stopPropagation();
               toggleWishlist(p.id);
              }}
              style={{
               position: "absolute",
               top: "10px",
               right: "10px",
               background: "rgba(0, 0, 0, 0.4)",
               border: "none",
               borderRadius: "50%",
               width: "32px",
               height: "32px",
               display: "flex",
               alignItems: "center",
               justifyContent: "center",
               cursor: "pointer",
               zIndex: 2,
               transition: "all 0.2s ease",
              }}
              title="Remove from Wishlist"
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
             >
              <svg
               xmlns="http://www.w3.org/2000/svg"
               width="14"
               height="14"
               viewBox="0 0 24 24"
               fill="none"
               stroke="var(--color-gold)"
               strokeWidth="2"
               strokeLinecap="round"
               strokeLinejoin="round"
              >
               <line x1="18" y1="6" x2="6" y2="18"></line>
               <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
             </button>

             <Link to={`/product/${p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div
               className="product-image-wrapper"
               style={{
                height: "140px",
                aspectRatio: "auto",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
               }}
              >
               <img
                src={p.image}
                alt={p.title}
                style={{ maxHeight: "110px", objectFit: "contain" }}
               />
              </div>
              <div className="product-info" style={{ textAlign: "center" }}>
               <h4
                style={{
                 fontSize: "1rem",
                 color: "var(--color-white)",
                 fontWeight: 500,
                 marginBottom: "0.2rem",
                 whiteSpace: "nowrap",
                 overflow: "hidden",
                 textOverflow: "ellipsis",
                }}
                title={p.title}
               >
                {p.title}
               </h4>
               {p.flavor && (
                <p
                 style={{
                  fontSize: "0.68rem",
                  color: "var(--color-muted)",
                  textTransform: "uppercase",
                  marginBottom: "0.5rem",
                 }}
                >
                 {p.flavor}
                </p>
               )}
               <span style={{ fontSize: "0.88rem", color: "var(--color-gold)", display: "block", marginBottom: "0.8rem" }}>
                Rs. {displayPrice}
               </span>
              </div>
             </Link>

             <button
              className="btn btn-outline"
              onClick={() => addToCart(p, 1)}
              disabled={isOutOfStock}
              style={{
               width: "100%",
               height: "32px",
               fontSize: "0.65rem",
               padding: 0,
               marginTop: "auto",
               opacity: isOutOfStock ? 0.45 : 1,
               cursor: isOutOfStock ? "not-allowed" : "pointer",
              }}
             >
              {isOutOfStock ? "Out of Stock" : "Add to Bag"}
             </button>
            </div>
           );
          })}
         </div>
        )}
       </div>
      )}

     {activeTab === "addresses" && (
      <div
       style={{
        border: "1px solid rgba(255,255,255,0.04)",
        borderRadius: "8px",
        padding: "2rem",
        backgroundColor: "rgba(15,15,15,0.4)",
       }}
      >
       <div
        style={{
         display: "flex",
         justifyContent: "space-between",
         alignItems: "center",
         marginBottom: "1.5rem",
        }}
       >
        <h2
         style={{
          fontFamily: "var(--font-heading)",
          fontSize: "1.8rem",
          fontWeight: 300,
          color: "var(--color-white)",
          margin: 0,
         }}
        >
         Saved Addresses
        </h2>
        {!isEditing && (
         <button
          className="btn btn-outline"
          onClick={handleOpenAddForm}
          style={{
           height: "36px",
           fontSize: "0.75rem",
           padding: "0 1.2rem",
           border: "1px solid var(--color-gold)",
           color: "var(--color-gold)",
          }}
         >
          + Add New Address
         </button>
        )}
       </div>

       {isEditing ? (
        <form
         onSubmit={handleSaveAddress}
         style={{
          border: "1px solid rgba(201,168,76,0.15)",
          borderRadius: "6px",
          padding: "2rem",
          backgroundColor: "rgba(5,5,5,0.3)",
          display: "flex",
          flexDirection: "column",
          gap: "1.2rem",
          maxWidth: "600px",
         }}
        >
         <h3
          style={{
           fontFamily: "var(--font-heading)",
           fontSize: "1.2rem",
           color: "var(--color-white)",
           fontWeight: 400,
           marginBottom: "0.5rem",
           borderBottom: "1px solid rgba(255,255,255,0.05)",
           paddingBottom: "0.5rem",
          }}
         >
          {currentAddress ? "Edit Saved Address" : "Add New Address"}
         </h3>

         <div className="contact-form-group">
          <label htmlFor="fullName" className="contact-form-label">
           Name / Label
          </label>
          <input
           type="text"
           id="fullName"
           className="contact-form-input"
           placeholder="e.g. Home, Office, Vaibhav Bharti"
           required
           value={addressForm.fullName}
           onChange={(e) =>
            setAddressForm({ ...addressForm, fullName: e.target.value })
           }
          />
         </div>

         <div className="contact-form-group">
          <label htmlFor="street" className="contact-form-label">
           Street Address
          </label>
          <input
           type="text"
           id="street"
           className="contact-form-input"
           placeholder="e.g. 12-A Connaught Place, Block C"
           required
           value={addressForm.street}
           onChange={(e) =>
            setAddressForm({ ...addressForm, street: e.target.value })
           }
          />
         </div>

         <div
          className="checkout-form-row"
          style={{ display: "flex", gap: "1rem" }}
         >
          <div className="contact-form-group" style={{ flex: 1 }}>
           <label htmlFor="pincode" className="contact-form-label">
            Pincode
           </label>
           <input
            type="text"
            id="pincode"
            className="contact-form-input"
            placeholder="6-digit Pincode"
            required
            value={addressForm.pincode}
            onChange={(e) =>
             setAddressForm({ ...addressForm, pincode: e.target.value })
            }
           />
          </div>

          <div className="contact-form-group" style={{ flex: 1 }}>
           <label htmlFor="city" className="contact-form-label">
            City
           </label>
           <input
            type="text"
            id="city"
            className="contact-form-input"
            placeholder="City"
            required
            value={addressForm.city}
            onChange={(e) =>
             setAddressForm({ ...addressForm, city: e.target.value })
            }
           />
          </div>
         </div>

         <div
          className="checkout-form-row"
          style={{ display: "flex", gap: "1rem" }}
         >
          <div className="contact-form-group" style={{ flex: 1 }}>
           <label htmlFor="state" className="contact-form-label">
            State / Region
           </label>
           <input
            type="text"
            id="state"
            className="contact-form-input"
            placeholder="State"
            required
            value={addressForm.state || ""}
            onChange={(e) =>
             setAddressForm({ ...addressForm, state: e.target.value })
            }
           />
          </div>

          <div className="contact-form-group" style={{ flex: 1 }}>
           <label htmlFor="country" className="contact-form-label">
            Country
           </label>
           <input
            type="text"
            id="country"
            className="contact-form-input"
            placeholder="Country"
            required
            value={addressForm.country}
            onChange={(e) =>
             setAddressForm({ ...addressForm, country: e.target.value })
            }
           />
          </div>
         </div>

         <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <button
           type="submit"
           className="btn btn-primary"
           disabled={addressLoading}
           style={{
            height: "40px",
            padding: "0 2rem",
            backgroundColor: "var(--color-gold)",
            color: "#000",
            fontWeight: "bold",
            border: "none",
            cursor: "pointer",
            borderRadius: "4px",
           }}
          >
           {addressLoading ? "Saving..." : "Save Address"}
          </button>
          <button
           type="button"
           className="btn btn-outline"
           onClick={() => setIsEditing(false)}
           style={{
            height: "40px",
            padding: "0 2rem",
            backgroundColor: "transparent",
            color: "var(--color-white)",
            border: "1px solid rgba(255,255,255,0.2)",
            cursor: "pointer",
            borderRadius: "4px",
           }}
          >
           Cancel
          </button>
         </div>
        </form>
       ) : (
        <div>
         {addresses.length === 0 ? (
          <p style={{ color: "var(--color-muted)", fontSize: "0.85rem" }}>
           No saved addresses. Add a new address to speed up your checkout
           process.
          </p>
         ) : (
          <div
           style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.5rem",
           }}
          >
           {addresses.map((addr) => (
            <div
             key={addr.id}
             style={{
              border: "1px solid rgba(201,168,76,0.15)",
              borderRadius: "6px",
              padding: "1.5rem",
              backgroundColor: "rgba(5,5,5,0.2)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
             }}
            >
             <div>
              <h4
               style={{
                fontSize: "0.95rem",
                color: "var(--color-white)",
                fontWeight: 600,
                marginBottom: "0.6rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
               }}
              >
               <span>{addr.fullName}</span>
               <span
                style={{
                 fontSize: "0.65rem",
                 color: "var(--color-gold)",
                 border: "1px solid rgba(201,168,76,0.2)",
                 padding: "0.1rem 0.4rem",
                 borderRadius: "3px",
                 textTransform: "uppercase",
                }}
               >
                Saved
               </span>
              </h4>
              <p
               style={{
                fontSize: "0.82rem",
                color: "var(--color-muted)",
                lineHeight: 1.5,
                marginBottom: "1.5rem",
               }}
              >
               {addr.street}
               <br />
               {addr.city}{addr.state ? `, ${addr.state}` : ""} - {addr.pincode}
               <br />
               {addr.country}
              </p>
             </div>
             <div
              style={{
               display: "flex",
               gap: "0.8rem",
               borderTop: "1px solid rgba(255,255,255,0.05)",
               paddingTop: "1rem",
              }}
             >
              <button
               className="btn btn-outline"
               onClick={() => handleOpenEditForm(addr)}
               disabled={addressLoading}
               style={{
                height: "30px",
                fontSize: "0.7rem",
                padding: "0 0.8rem",
                flex: 1,
                borderColor: "rgba(201,168,76,0.3)",
                color: "var(--color-gold)",
               }}
              >
               Edit
              </button>
              <button
               className="btn btn-outline"
               onClick={() => setAddressToDelete(addr.id)}
               disabled={addressLoading}
               style={{
                height: "30px",
                fontSize: "0.7rem",
                padding: "0 0.8rem",
                flex: 1,
                borderColor: "rgba(255,80,80,0.2)",
                color: "rgba(255,80,80,0.8)",
               }}
              >
               Delete
              </button>
             </div>
            </div>
           ))}
          </div>
         )}
        </div>
       )}
      </div>
     )}
    </section>
   </div>

   {/* Custom Logout Confirmation Dialog Modal */}
   {showLogoutConfirm && (
    <div
     style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      backdropFilter: "blur(6px)",
      zIndex: 99999,
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
      <div style={{ fontSize: "2rem", marginBottom: "0.8rem" }}>👑</div>
      <h3
       style={{
        fontFamily: "var(--font-heading)",
        fontSize: "1.4rem",
        color: "var(--color-white)",
        fontWeight: 400,
        marginBottom: "0.8rem",
       }}
      >
       Sign Out
      </h3>
      <p
       style={{
        fontSize: "0.85rem",
        color: "var(--color-muted)",
        lineHeight: 1.5,
        marginBottom: "1.8rem",
       }}
      >
       Are you sure you want to sign out from your royal account?
      </p>
      <div style={{ display: "flex", gap: "1rem" }}>
       <button
        className="btn btn-primary"
        onClick={handleLogoutConfirm}
        style={{
          flex: 1,
          height: "40px",
          backgroundColor: "var(--color-gold)",
          color: "#000",
          border: "none",
          fontWeight: "bold",
          cursor: "pointer",
          borderRadius: "4px",
          fontSize: "0.75rem",
          padding: 0,
         }}
       >
        YES, SIGN OUT
       </button>
       <button
        className="btn btn-outline"
        onClick={() => setShowLogoutConfirm(false)}
        style={{
          flex: 1,
          height: "40px",
          backgroundColor: "transparent",
          color: "var(--color-white)",
          border: "1px solid rgba(255,255,255,0.2)",
          cursor: "pointer",
          borderRadius: "4px",
          fontSize: "0.75rem",
          padding: 0,
         }}
       >
        CANCEL
       </button>
      </div>
     </div>
    </div>
   )}

   {/* Custom Address Deletion Confirmation Dialog Modal */}
   {addressToDelete && (
    <div
     style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      backdropFilter: "blur(6px)",
      zIndex: 99999,
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
       border: "1px solid rgba(255, 80, 80, 0.25)",
       borderRadius: "8px",
       padding: "2.2rem",
       textAlign: "center",
       boxShadow: "0 10px 45px rgba(0,0,0,0.8)",
      }}
     >
      <div style={{ fontSize: "2rem", marginBottom: "0.8rem" }}>🗑️</div>
      <h3
       style={{
        fontFamily: "var(--font-heading)",
        fontSize: "1.4rem",
        color: "var(--color-white)",
        fontWeight: 400,
        marginBottom: "0.8rem",
       }}
      >
       Delete Address
      </h3>
      <p
       style={{
        fontSize: "0.85rem",
        color: "var(--color-muted)",
        lineHeight: 1.5,
        marginBottom: "1.8rem",
       }}
      >
       Are you sure you want to permanently delete this saved address? This action cannot be undone.
      </p>
      <div style={{ display: "flex", gap: "1rem" }}>
       <button
        className="btn btn-primary"
        onClick={executeDeleteAddress}
        style={{
         flex: 1,
         height: "40px",
         backgroundColor: "#ff5050",
         color: "#fff",
         border: "none",
         fontWeight: "bold",
         cursor: "pointer",
         borderRadius: "4px",
        }}
       >
        YES, DELETE
       </button>
       <button
        className="btn btn-outline"
        onClick={() => setAddressToDelete(null)}
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

   {/* Custom Order Cancellation Confirmation Dialog Modal */}
   {orderToCancel && (
    <div
     style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      backdropFilter: "blur(6px)",
      zIndex: 99999,
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
       border: "1px solid rgba(255, 80, 80, 0.25)",
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
       Cancel Order
      </h3>
      <p
       style={{
        fontSize: "0.85rem",
        color: "var(--color-muted)",
        lineHeight: 1.5,
        marginBottom: "1.8rem",
       }}
      >
       Are you sure you want to cancel this order? This action will set the status of your order to Cancelled.
      </p>
      <div style={{ display: "flex", gap: "1rem" }}>
       <button
        className="btn btn-primary"
        onClick={executeCancelOrder}
        style={{
         flex: 1,
         height: "40px",
         backgroundColor: "#ff5050",
         color: "#fff",
         border: "none",
         fontWeight: "bold",
         cursor: "pointer",
         borderRadius: "4px",
        }}
       >
        YES, CANCEL ORDER
       </button>
       <button
        className="btn btn-outline"
        onClick={() => setOrderToCancel(null)}
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
        NO, KEEP IT
       </button>
      </div>
     </div>
    </div>
   )}

   {/* Edit Profile Modal */}
   {showEditProfileModal && (
    <div
     style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      backdropFilter: "blur(6px)",
      zIndex: 99999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
     }}
    >
     <form
      onSubmit={handleSaveProfile}
      style={{
       width: "100%",
       maxWidth: "450px",
       backgroundColor: "#0B0B0B",
       border: "1px solid rgba(201, 168, 76, 0.25)",
       borderRadius: "8px",
       padding: "2.2rem",
       boxShadow: "0 10px 45px rgba(0,0,0,0.8)",
       display: "flex",
       flexDirection: "column",
       gap: "1.2rem",
      }}
     >
      <h3
       style={{
        fontFamily: "var(--font-heading)",
        fontSize: "1.4rem",
        color: "var(--color-white)",
        fontWeight: 400,
        marginBottom: "0.5rem",
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        paddingBottom: "0.5rem",
       }}
      >
       Edit Royal Profile
      </h3>

      <div className="contact-form-group">
       <label htmlFor="profileNameInput" className="contact-form-label">
        Full Name
       </label>
       <input
        type="text"
        id="profileNameInput"
        className="contact-form-input"
        placeholder="e.g. Vaibhav Bharti"
        required
        value={profileForm.name}
        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
       />
      </div>

      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
       <button
        type="submit"
        className="btn btn-primary"
        disabled={profileLoading}
        style={{
         flex: 1,
         height: "40px",
         backgroundColor: "var(--color-gold)",
         color: "#000",
         fontWeight: "bold",
         border: "none",
         cursor: "pointer",
         borderRadius: "4px",
        }}
       >
        {profileLoading ? "Verifying..." : "SAVE PROFILE"}
       </button>
       <button
        type="button"
        className="btn btn-outline"
        onClick={() => setShowEditProfileModal(false)}
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
     </form>
    </div>
   )}

      {/* Email Update Modal */}
   {showEmailModal && (
    <div
     style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      backdropFilter: "blur(6px)",
      zIndex: 99999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
     }}
    >
     <form
      onSubmit={handleUpdateEmail}
      style={{
       width: "100%",
       maxWidth: "450px",
       backgroundColor: "#0B0B0B",
       border: "1px solid rgba(201, 168, 76, 0.25)",
       borderRadius: "8px",
       padding: "2.2rem",
       boxShadow: "0 10px 45px rgba(0,0,0,0.8)",
       display: "flex",
       flexDirection: "column",
       gap: "1.2rem",
      }}
     >
      <h3
       style={{
        fontFamily: "var(--font-heading)",
        fontSize: "1.4rem",
        color: "var(--color-white)",
        fontWeight: 400,
        marginBottom: "0.5rem",
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        paddingBottom: "0.5rem",
       }}
      >
       Change Royal Email
      </h3>

      <div className="contact-form-group">
       <label htmlFor="newEmailInput" className="contact-form-label">
        New Email Address
       </label>
       <input
        type="email"
        id="newEmailInput"
        className="contact-form-input"
        placeholder="e.g. new.email@reinoro.com"
        required
        value={emailForm.newEmail}
        onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
       />
       <span style={{ fontSize: "0.65rem", color: "var(--color-muted)", marginTop: "0.2rem", display: "block" }}>
        Note: You will receive a verification link at this address. You must verify it before syncing changes.
       </span>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
       <button
        type="submit"
        className="btn btn-primary"
        disabled={emailLoading}
        style={{
         flex: 1,
         height: "40px",
         backgroundColor: "var(--color-gold)",
         color: "#000",
         fontWeight: "bold",
         border: "none",
         cursor: "pointer",
         borderRadius: "4px",
        }}
       >
        {emailLoading ? "Sending Link..." : "SEND VERIFICATION"}
       </button>
       <button
        type="button"
        className="btn btn-outline"
        onClick={() => setShowEmailModal(false)}
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
     </form>
    </div>
   )}

   {/* Password Change Modal */}
   {showPasswordModal && (
    <div
     style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      backdropFilter: "blur(6px)",
      zIndex: 99999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
     }}
    >
     <form
      onSubmit={handleModalChangePassword}
      style={{
       width: "100%",
       maxWidth: "450px",
       backgroundColor: "#0B0B0B",
       border: "1px solid rgba(201, 168, 76, 0.25)",
       borderRadius: "8px",
       padding: "2.2rem",
       boxShadow: "0 10px 45px rgba(0,0,0,0.8)",
       display: "flex",
       flexDirection: "column",
       gap: "1.2rem",
      }}
     >
      <h3
       style={{
        fontFamily: "var(--font-heading)",
        fontSize: "1.4rem",
        color: "var(--color-white)",
        fontWeight: 400,
        marginBottom: "0.5rem",
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        paddingBottom: "0.5rem",
       }}
      >
       Change Royal Password
      </h3>

      <div className="contact-form-group">
       <label htmlFor="currentPasswordInput" className="contact-form-label">
        Current Password
       </label>
       <input
        type="password"
        id="currentPasswordInput"
        className="contact-form-input"
        placeholder="Enter your current password"
        required
        value={passwordForm.currentPassword}
        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
       />
      </div>

      <div className="contact-form-group">
       <label htmlFor="newPasswordInput" className="contact-form-label">
        New Password
       </label>
       <input
        type="password"
        id="newPasswordInput"
        className="contact-form-input"
        placeholder="At least 6 characters"
        required
        value={passwordForm.newPassword}
        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
       />
      </div>

      <div className="contact-form-group">
       <label htmlFor="confirmPasswordInput" className="contact-form-label">
        Confirm New Password
       </label>
       <input
        type="password"
        id="confirmPasswordInput"
        className="contact-form-input"
        placeholder="Repeat new password"
        required
        value={passwordForm.confirmPassword}
        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
       />
      </div>

      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
       <button
        type="submit"
        className="btn btn-primary"
        disabled={passwordLoading}
        style={{
         flex: 1,
         height: "40px",
         backgroundColor: "var(--color-gold)",
         color: "#000",
         fontWeight: "bold",
         border: "none",
         cursor: "pointer",
         borderRadius: "4px",
        }}
       >
        {passwordLoading ? "Updating..." : "UPDATE PASSWORD"}
       </button>
       <button
        type="button"
        className="btn btn-outline"
        onClick={() => setShowPasswordModal(false)}
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
     </form>
    </div>
   )}
  </main>
 );
}
