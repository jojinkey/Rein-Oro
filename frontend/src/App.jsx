import React, { createContext, useState, useEffect, useContext } from "react";
import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Preloader from "./components/Preloader.jsx";
import ExitIntentModal from "./components/ExitIntentModal.jsx";
import WhatsAppFloat from "./components/WhatsAppFloat.jsx";
import { apiUrl } from "./config/api.js";

// Pages
import Home from "./pages/Home.jsx";
import Shop from "./pages/Shop.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Confirmation from "./pages/Confirmation.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Admin from "./pages/Admin.jsx";
import Policy from "./pages/Policy.jsx";

// Contexts
export const CartContext = createContext();
export const AuthContext = createContext();
export const CMSContext = createContext();

function getCartItemKey(item) {
 const weight = item?.selectedVariant?.weight || item?.weight || "";
 return item?.cartKey || `${item?.id || "item"}::${weight}`;
}

// Scroll to top on route change
function ScrollToTop() {
 const { pathname } = useLocation();
 useEffect(() => {
  window.scrollTo(0, 0);
 }, [pathname]);
 return null;
}

export default function App() {
 // --- Cart State ---
 const [cart, setCart] = useState(() => {
  try {
   return JSON.parse(localStorage.getItem("rein_oro_cart") || "[]");
  } catch {
   return [];
  }
 });
 const [giftNote, setGiftNote] = useState(
  () => localStorage.getItem("rein_oro_gift_note") || "",
 );
 const [appliedPromo, setAppliedPromo] = useState(
  () => localStorage.getItem("rein_oro_promo") || "",
 );
 const [discountRate, setDiscountRate] = useState(0.0);
 const [coupons, setCoupons] = useState([]);
 const [isCartOpen, setIsCartOpen] = useState(false);

 useEffect(() => {
  localStorage.setItem("rein_oro_cart", JSON.stringify(cart));
 }, [cart]);

 useEffect(() => {
  localStorage.setItem("rein_oro_gift_note", giftNote);
 }, [giftNote]);

 useEffect(() => {
  localStorage.setItem("rein_oro_promo", appliedPromo);
 }, [appliedPromo]);

  useEffect(() => {
  const fetchCoupons = async () => {
   try {
    const res = await fetch(apiUrl("/api/coupons?active=true"));
    const data = await res.json();
    setCoupons(Array.isArray(data) ? data.filter((coupon) => coupon.active) : []);

    // Revalidate localStorage promo code
    const savedPromo = localStorage.getItem("rein_oro_promo") || "";
    if (savedPromo) {
     const matched = (Array.isArray(data) ? data : []).find((c) => c.code === savedPromo && c.active);
     if (matched) {
      setDiscountRate(matched.discount_rate);
     } else {
      setAppliedPromo("");
      setDiscountRate(0.0);
      localStorage.removeItem("rein_oro_promo");
     }
    }
   } catch (err) {
    console.warn("Failed to load coupons from API", err);
   }
  };
  fetchCoupons();
 }, []);

 const addToCart = (product, qty = 1) => {
  setCart((prevCart) => {
   const cartKey = getCartItemKey(product);
   const idx = prevCart.findIndex((item) => getCartItemKey(item) === cartKey);
   if (idx > -1) {
    const newCart = [...prevCart];
    newCart[idx].qty += qty;
    return newCart;
   } else {
    return [...prevCart, { ...product, cartKey, qty }];
   }
  });
  setIsCartOpen(true);
 };

 const updateQty = (itemKey, qty) => {
  if (qty <= 0) {
   removeFromCart(itemKey);
   return;
  }
  setCart((prev) =>
   prev.map((item) => (getCartItemKey(item) === itemKey ? { ...item, qty } : item)),
  );
 };

 const removeFromCart = (itemKey) => {
  setCart((prev) => prev.filter((item) => getCartItemKey(item) !== itemKey));
 };

 const clearCart = () => {
  setCart([]);
  setGiftNote("");
  setAppliedPromo("");
  setDiscountRate(0.0);
  localStorage.removeItem("rein_oro_cart");
  localStorage.removeItem("rein_oro_promo");
  localStorage.removeItem("rein_oro_gift_note");
 };

  const applyPromoCode = async (code) => {
   const uppercaseCode = code.trim().toUpperCase();
   try {
    const res = await fetch(apiUrl(`/api/coupons/${encodeURIComponent(uppercaseCode)}`));
    if (!res.ok) {
     return { success: false, message: "Invalid promo code" };
    }
    const coupon = await res.json();
    const isActive = coupon && (coupon.active === true || coupon.active === "true" || coupon.active === 1 || coupon.active === "1");
    if (isActive) {
     setAppliedPromo(uppercaseCode);
     setDiscountRate(Number(coupon.discount_rate) || 0.0);
     return {
      success: true,
      message: `Promo code applied successfully (${Math.round((Number(coupon.discount_rate) || 0.0) * 100)}% Off)!`,
     };
    } else {
     return { success: false, message: "Promo code is inactive" };
    }
   } catch (err) {
    console.warn("Failed to validate promo code live:", err);
    const matched = coupons.find((c) => c.code === uppercaseCode && c.active);
    if (matched) {
     setAppliedPromo(uppercaseCode);
     setDiscountRate(matched.discount_rate);
     return {
      success: true,
      message: `Promo code applied successfully (${Math.round(matched.discount_rate * 100)}% Off)!`,
     };
    } else {
     return { success: false, message: "Invalid promo code" };
    }
   }
  };

 const removePromoCode = () => {
  setAppliedPromo("");
  setDiscountRate(0.0);
 };

 const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
 const discount = Math.round(subtotal * discountRate);
 const shipping = subtotal === 0 ? 0 : subtotal >= 599 ? 0 : 99;
 const tax = Math.round((subtotal - discount) * 0.18);
 const total = subtotal - discount + shipping + tax;
 const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

 // --- Auth State ---
 const [user, setUser] = useState(() => {
  const logged = localStorage.getItem("rein_oro_user_logged_in") === "true";
  const email = localStorage.getItem("rein_oro_user_email");
  const role = String(localStorage.getItem("rein_oro_user_role") || "user")
   .trim()
   .toLowerCase();
  return logged ? { email, role } : null;
 });

 const login = (email, role = "user") => {
  const normalizedRole = String(role || "user")
   .trim()
   .toLowerCase();
  localStorage.setItem("rein_oro_user_logged_in", "true");
  localStorage.setItem("rein_oro_user_email", email);
  localStorage.setItem("rein_oro_user_role", normalizedRole);
  setUser({ email, role: normalizedRole });
 };

 const logout = () => {
  localStorage.removeItem("rein_oro_user_logged_in");
  localStorage.removeItem("rein_oro_user_email");
  localStorage.removeItem("rein_oro_user_role");
  setUser(null);
 };

 // --- CMS Content & Styles State ---
 const [cmsContent, setCmsContent] = useState({});
 const [cmsStyles, setCmsStyles] = useState({});

 const fetchCMSData = async () => {
  try {
   const contentRes = await fetch(apiUrl("/api/cms/content"));
   const content = await contentRes.json();
   setCmsContent(content);

   const stylesRes = await fetch(apiUrl("/api/cms/styles"));
   const styles = await stylesRes.json();
   setCmsStyles(styles);
   applyGlobalStyles(styles);
  } catch (e) {
   console.warn("Failed to load CMS overrides from backend", e);
  }
 };

 const applyGlobalStyles = (styles) => {
  if (!styles || Object.keys(styles).length === 0) return;

  // Dynamically inject Google Fonts if they are chosen
  const googleFonts = [];
  if (styles.fontHeading) googleFonts.push(styles.fontHeading);
  if (styles.fontBody) googleFonts.push(styles.fontBody);

  if (googleFonts.length > 0) {
   const fontFamiliesQuery = googleFonts
    .map((f) => `family=${f.replace(/ /g, "+")}:wght@300;400;500;600;700`)
    .join("&");
   const fontLinkHref = `https://fonts.googleapis.com/css2?${fontFamiliesQuery}&display=swap`;

   let linkTag = document.getElementById("rein-oro-cms-fonts");
   if (!linkTag) {
    linkTag = document.createElement("link");
    linkTag.id = "rein-oro-cms-fonts";
    linkTag.rel = "stylesheet";
    document.head.appendChild(linkTag);
   }
   linkTag.href = fontLinkHref;
  }

  // Create/update styling variables in :root
  let cssVariables = ":root {\n";
  if (styles.colorBg)
   cssVariables += `  --color-bg: ${styles.colorBg} !important;\n`;
  if (styles.colorGold)
   cssVariables += `  --color-gold: ${styles.colorGold} !important;\n`;
  if (styles.colorGoldHover)
   cssVariables += `  --color-gold-hover: ${styles.colorGoldHover} !important;\n`;
  if (styles.colorWhite)
   cssVariables += `  --color-white: ${styles.colorWhite} !important;\n`;
  if (styles.colorMuted)
   cssVariables += `  --color-muted: ${styles.colorMuted} !important;\n`;

  if (styles.fontHeading)
   cssVariables += `  --font-heading: '${styles.fontHeading}', serif !important;\n`;
  if (styles.fontBody)
   cssVariables += `  --font-body: '${styles.fontBody}', sans-serif !important;\n`;
  cssVariables += "}\n";

  if (styles.textSizeOffset) {
   cssVariables += `html { font-size: ${styles.textSizeOffset} !important; }\n`;
  }

  if (styles.customCSS) {
   cssVariables += styles.customCSS;
  }

  let styleTag = document.getElementById("rein-oro-cms-injected-styles");
  if (!styleTag) {
   styleTag = document.createElement("style");
   styleTag.id = "rein-oro-cms-injected-styles";
   document.head.appendChild(styleTag);
  }
  styleTag.textContent = cssVariables;
 };

 useEffect(() => {
  fetchCMSData();
 }, []);

 const getCMSValue = (pageName, selector, defaultValue) => {
  if (cmsContent[pageName] && cmsContent[pageName][selector]) {
   return cmsContent[pageName][selector];
  }
  return defaultValue;
 };

 return (
  <CMSContext.Provider
   value={{
    cmsContent,
    cmsStyles,
    fetchCMSData,
    getCMSValue,
    applyGlobalStyles,
   }}
  >
   <AuthContext.Provider value={{ user, login, logout }}>
    <CartContext.Provider
     value={{
      cart,
      addToCart,
      updateQty,
      removeFromCart,
      clearCart,
      giftNote,
      setGiftNote,
      appliedPromo,
      discountRate,
      applyPromoCode,
      removePromoCode,
      subtotal,
      discount,
      shipping,
      tax,
      total,
      cartCount,
      isCartOpen,
      setIsCartOpen,
     }}
    >
     <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <LayoutWrapper>
       <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/privacy" element={<Policy type="privacy" />} />
        <Route path="/terms" element={<Policy type="terms" />} />
        <Route path="/shipping" element={<Policy type="shipping" />} />
        <Route path="/returns" element={<Policy type="returns" />} />
       </Routes>
       <ExitIntentModal />
      </LayoutWrapper>
     </HashRouter>
    </CartContext.Provider>
   </AuthContext.Provider>
  </CMSContext.Provider>
 );
}

function LayoutWrapper({ children }) {
 const location = useLocation();
 const isAdminPath = location.pathname === "/admin";
 return (
  <>
   <ScrollToTop />
   <Preloader />
   {!isAdminPath && <Header />}
   {children}
   {!isAdminPath && <WhatsAppFloat />}
   {!isAdminPath && <Footer />}
  </>
 );
}
