import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext, AuthContext } from '../App.jsx';

export default function Header() {
  const { 
    cart, updateQty, removeFromCart, giftNote, setGiftNote, 
    appliedPromo, discountRate, applyPromoCode, removePromoCode,
    subtotal, discount, shipping, tax, total, cartCount,
    isCartOpen: isDrawerOpen, setIsCartOpen: setIsDrawerOpen
  } = useContext(CartContext);

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isGiftOpen, setIsGiftOpen] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState({ text: '', error: false });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync class name on document body for layout lock if drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.classList.add('drawer-open');
    } else {
      document.body.classList.remove('drawer-open');
    }
  }, [isDrawerOpen]);

  const handleOpenDrawer = () => setIsDrawerOpen(true);
  const handleCloseDrawer = () => setIsDrawerOpen(false);

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    const res = await applyPromoCode(promoInput);
    if (res.success) {
      setPromoMessage({ text: res.message, error: false });
    } else {
      setPromoMessage({ text: res.message, error: true });
    }
  };

  const handleRemovePromo = () => {
    removePromoCode();
    setPromoInput('');
    setPromoMessage({ text: '', error: false });
  };

  // Shipping progress calculation
  const freeShippingThreshold = 599;
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const awayAmount = freeShippingThreshold - subtotal;

  const handleAccountClick = () => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <>
      {/* Top Utility Header Banner */}
      <div className="utility-banner">
        <div className="utility-container">
          <span className="utility-left">Purity Crowned in Gold</span>
          <div className="utility-right">
            <span className="utility-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Free Shipping on Orders ₹599+
            </span>
            <span className="utility-item" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              Track Order
            </span>
            <span className="utility-item currency-selector">
              India (INR ₹) 
              <svg style={{ marginLeft: 3 }} xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <nav id="main-nav" className="scrolled">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <img src="images/logo.png" alt="Rein Oro Foods Logo" className="brand-logo-img" />
          </Link>
          <div className="nav-links">
            <Link to="/" prefetch="true">Home</Link>
            <Link to="/shop" prefetch="true">Shop</Link>
            <Link to="/shop?category=Makhana" prefetch="true">Makhana</Link>
            <Link to="/shop?category=Nuts" prefetch="true">Premium Nuts</Link>
            <Link to="/about" prefetch="true">About Us</Link>
            <Link to="/contact" prefetch="true">Contact Us</Link>
          </div>
          <div className="nav-icons">
            <button className="nav-icon-btn" aria-label="Search" onClick={() => navigate('/shop')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </button>
            <button className="nav-icon-btn" aria-label="Account" onClick={handleAccountClick}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </button>
            <button className="nav-icon-btn bag-btn" aria-label="Shopping Bag" onClick={handleOpenDrawer}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-bag"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              <span className="bag-count">{cartCount}</span>
            </button>
            <button 
              className="nav-icon-btn hamburger-btn" 
              aria-label="Toggle Menu" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Backdrop & Drawer */}
      <div 
        className={`mobile-menu-overlay ${isMobileMenuOpen ? 'open' : ''}`} 
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>
      <div className={`mobile-menu-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-links">
          <Link to="/" prefetch="true" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          <Link to="/shop" prefetch="true" onClick={() => setIsMobileMenuOpen(false)}>Shop All</Link>
          <Link to="/shop?category=Makhana" prefetch="true" onClick={() => setIsMobileMenuOpen(false)}>Makhana</Link>
          <Link to="/shop?category=Nuts" prefetch="true" onClick={() => setIsMobileMenuOpen(false)}>Premium Nuts</Link>
          <Link to="/about" prefetch="true" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
          <Link to="/contact" prefetch="true" onClick={() => setIsMobileMenuOpen(false)}>Contact Us</Link>
          {user ? (
            <Link 
              to={user.role === 'admin' ? '/admin' : '/dashboard'} 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {user.role === 'admin' ? 'Admin Panel' : 'My Account'}
            </Link>
          ) : (
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
          )}
        </div>
      </div>

      {/* Cart Drawer Backdrop Overlay */}
      <div 
        id="cart-drawer-overlay" 
        className={`cart-drawer-overlay ${isDrawerOpen ? 'open' : ''}`}
        onClick={handleCloseDrawer}
      ></div>

      {/* Slide Cart Drawer Panel */}
      <div 
        id="cart-drawer" 
        className={`cart-drawer ${isDrawerOpen ? 'open' : ''}`}
        role="dialog" 
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
      >
        <div className="cart-drawer-header">
          <div>
            <h2 id="cart-drawer-title" className="cart-drawer-headline">Your Cart</h2>
            <p className="cart-drawer-subtitle"><span>{cartCount}</span> items in your cart</p>
          </div>
          <button id="btn-close-drawer" className="btn-close-drawer" aria-label="Close Cart" onClick={handleCloseDrawer}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="cart-drawer-body">
          {cart.length === 0 ? (
            <div id="cart-empty-message" className="cart-empty-message" style={{ display: 'flex' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="empty-bag-icon"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              <p>Your shopping bag is empty</p>
              <button 
                className="btn btn-outline empty-shop-btn" 
                onClick={() => { handleCloseDrawer(); navigate('/shop'); }}
              >
                Shop Collection
              </button>
            </div>
          ) : (
            <>
              {/* Cart items list */}
              <div id="cart-items-list" className="cart-items-list" style={{ display: 'block' }}>
                {cart.map(item => (
                  <div key={item.cartKey || `${item.id}::${item.weight || ''}`} className="cart-item-card">
                    <div className="cart-item-img-frame">
                      <img src={item.image} alt={item.title} />
                    </div>
                    <div className="cart-item-info">
                      <h4 className="cart-item-title">{item.name}</h4>
                      <p className="cart-item-flavor">{item.flavor} &bull; {item.weight}</p>
                      <div className="cart-item-qty-row">
                        <div className="cart-item-qty-spinner">
                          <button className="cart-item-qty-btn dec-qty" onClick={() => updateQty(item.cartKey || `${item.id}::${item.weight || ''}`, item.qty - 1)}>-</button>
                          <span className="cart-item-qty-input">{item.qty}</span>
                          <button className="cart-item-qty-btn inc-qty" onClick={() => updateQty(item.cartKey || `${item.id}::${item.weight || ''}`, item.qty + 1)}>+</button>
                        </div>
                      </div>
                    </div>
                    <div className="cart-item-price">₹{item.price * item.qty}</div>
                    <button className="btn-remove-cart-item" onClick={() => removeFromCart(item.cartKey || `${item.id}::${item.weight || ''}`)} aria-label="Remove item">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Gift Note Toggle Row */}
              <div className="gift-note-container">
                <button 
                  id="gift-note-toggle" 
                  className={`gift-note-toggle ${isGiftOpen ? 'active' : ''}`}
                  onClick={() => setIsGiftOpen(!isGiftOpen)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v14"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 4.8 0 0 1 12 8a4.8 4.8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/></svg>
                  <span>Add a Gift Note</span>
                  <svg style={{ transform: isGiftOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.3s ease' }} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="chevron-icon"><path d="m9 18 6-6-6-6"/></svg>
                </button>
                <div id="gift-note-input-wrapper" className="gift-note-input-wrapper" style={{ display: isGiftOpen ? 'block' : 'none' }}>
                  <textarea 
                    id="gift-note-text" 
                    placeholder="Enter your personalized gift message here..." 
                    rows="3" 
                    className="gift-note-textarea"
                    value={giftNote}
                    onChange={(e) => setGiftNote(e.target.value)}
                  ></textarea>
                </div>
              </div>

              {/* Promo Code Input Row */}
              <div className="promo-code-container">
                <div className="promo-input-row">
                  <div className="promo-field-wrapper">
                    <svg className="promo-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.05 2.05h10l9.74 9.74a2.85 2.85 0 0 1 0 4.03l-5.66 5.66a2.85 2.85 0 0 1-4.03 0l-9.74-9.74v-10z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                    <input 
                      type="text" 
                      id="promo-code-input" 
                      placeholder={appliedPromo ? `Promo: ${appliedPromo}` : "Have a promo code?"} 
                      className="promo-input"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      disabled={!!appliedPromo}
                    />
                  </div>
                  {appliedPromo ? (
                    <button id="promo-apply-btn" className="promo-apply-btn remove-promo" onClick={handleRemovePromo}>Remove</button>
                  ) : (
                    <button id="promo-apply-btn" className="promo-apply-btn" onClick={handleApplyPromo}>Apply</button>
                  )}
                </div>
                {promoMessage.text && (
                  <div className={`promo-status-msg ${promoMessage.error ? 'error' : 'success'}`} style={{ display: 'block' }}>
                    {promoMessage.text}
                  </div>
                )}
              </div>

              {/* Order Summary metrics */}
              <div className="cart-order-summary">
                <h3 className="summary-headline">Order Summary</h3>
                <div className="summary-row">
                  <span>Subtotal ({cartCount} items)</span>
                  <span>₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="summary-row" id="discount-row">
                    <span className="discount-label">Discount ({Math.round(discountRate * 100)}% Off)</span>
                    <span id="cart-summary-discount" className="discount-value">-₹{discount}</span>
                  </div>
                )}
                <div className="summary-row">
                  <span>Shipping</span>
                  <div className="shipping-value-col">
                    <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                    <p className="shipping-hint">Free shipping on orders above ₹599</p>
                  </div>
                </div>
                <div className="summary-row">
                  <span>Tax (18%)</span>
                  <span>₹{tax}</span>
                </div>
                <hr className="summary-divider" />
                <div className="summary-row total-row">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>

              {/* Free Shipping Tracker */}
              <div className="shipping-tracker-wrapper">
                <p id="shipping-tracker-text" className="shipping-tracker-text">
                  {subtotal >= 599 
                    ? "Congratulations! You qualify for FREE shipping!" 
                    : `You are ₹${awayAmount} away from FREE shipping!`
                  }
                </p>
                <div className="shipping-progress-bg">
                  <div id="shipping-progress-bar" className="shipping-progress-fill" style={{ width: `${progressPercent}%` }}></div>
                  <div 
                    id="shipping-progress-truck" 
                    className="shipping-progress-truck" 
                    style={{ left: `calc(${progressPercent}% - 7px)` }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 18H3c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v5h4l5 2 2 2v2c0 1.1-.9 2-2 2h-2"/><circle cx="7.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                  </div>
                </div>
              </div>

              {/* Checkout Trigger */}
              <button 
                id="btn-proceed-checkout" 
                className="btn btn-detail-primary checkout-btn"
                onClick={() => { handleCloseDrawer(); navigate('/cart'); }}
              >
                Proceed to Checkout
              </button>
            </>
          )}

          {/* Trust Signals */}
          <div className="cart-trust-signals">
            <div className="trust-signal-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="trust-icon"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
              <div>
                <strong>Secure Payments</strong>
                <span>100% secure checkout</span>
              </div>
            </div>
            <div className="trust-signal-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="trust-icon"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              <div>
                <strong>Easy Returns</strong>
                <span>Hassle-free returns</span>
              </div>
            </div>
            <div className="trust-signal-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="trust-icon"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
              <div>
                <strong>24/7 Support</strong>
                <span>We're here to help</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
