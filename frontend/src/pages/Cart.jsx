import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../App.jsx';

export default function Cart() {
  const {
    cart, updateQty, removeFromCart, clearCart,
    appliedPromo, discountRate, subtotal, discount, shipping, tax, total, cartCount
  } = useContext(CartContext);

  const navigate = useNavigate();

  const freeShippingThreshold = 599;
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const awayAmount = freeShippingThreshold - subtotal;

  if (cart.length === 0) {
    return (
      <div style={{ padding: '12rem 2rem', textAlign: 'center', backgroundColor: 'var(--color-bg)' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1.5rem', opacity: 0.8 }}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 300, color: 'var(--color-white)', marginBottom: '1rem' }}>Your shopping bag is empty</h1>
        <p style={{ color: 'var(--color-muted)', marginBottom: '2rem' }}>Add some gourmet delicacies to start your experience.</p>
        <Link to="/shop" className="btn btn-primary">Shop Collection</Link>
      </div>
    );
  }

  return (
    <main className="cart-page-main">
      <div className="cart-page-layout">
        
        {/* Left Column: Products Table */}
        <section className="cart-products-column">
          <h1 className="cart-title">
            Your Shopping Bag
          </h1>

          <div className="cart-table-container">
            {cart.map(item => (
              <div 
                key={item.cartKey || `${item.id}::${item.weight || ''}`} 
                className="cart-table-row" 
              >
                {/* Thumbnail */}
                <div className="cart-item-thumbnail">
                  <img src={item.image} alt={item.title} />
                </div>

                {/* Details */}
                <div className="cart-item-details">
                  <h3 className="item-name">{item.name}</h3>
                  <p className="item-meta">
                    {item.flavor} &bull; {item.weight}
                  </p>
                  <div className="item-actions">
                    <button 
                      onClick={() => removeFromCart(item.cartKey || `${item.id}::${item.weight || ''}`)}
                      className="btn-remove"
                    >
                      Delete
                    </button>
                    <span className="stock-status">In Stock</span>
                  </div>
                </div>

                {/* Spinner */}
                <div className="qty-spinner">
                  <button 
                    className="qty-btn dec-qty" 
                    onClick={() => updateQty(item.cartKey || `${item.id}::${item.weight || ''}`, item.qty - 1)}
                  >
                    -
                  </button>
                  <span className="qty-value">
                    {item.qty}
                  </span>
                  <button 
                    className="qty-btn inc-qty" 
                    onClick={() => updateQty(item.cartKey || `${item.id}::${item.weight || ''}`, item.qty + 1)}
                  >
                    +
                  </button>
                </div>

                {/* Total Price */}
                <div className="item-total-price">
                  ₹{item.price * item.qty}
                </div>
              </div>
            ))}
          </div>

          <div className="cart-footer-actions">
            <Link to="/shop" className="continue-shopping">
              &larr; Continue Shopping
            </Link>
            <button 
              onClick={clearCart}
              className="btn-clear-cart"
            >
              Clear Cart
            </button>
          </div>
        </section>

        {/* Right Column: Sticky Summary */}
        <section className="cart-page-right">
          <div className="cart-order-summary">
            <h2 className="summary-title">
              Order Summary
            </h2>
            
            <div className="summary-row">
              <span>Subtotal ({cartCount} items)</span>
              <span>₹{subtotal}</span>
            </div>
            {discount > 0 && (
              <div className="summary-row">
                <span className="discount-label">Discount ({Math.round(discountRate * 100)}% Off)</span>
                <span className="discount-value">-₹{discount}</span>
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
            <div className="summary-row total-row" style={{ marginBottom: '1.8rem' }}>
              <span>Total</span>
              <span>₹{total}</span>
            </div>

            {/* Shipping Progress tracker */}
            <div className="shipping-tracker-wrapper" style={{ margin: '1.5rem 0 2rem 0' }}>
              <p className="shipping-tracker-text" style={{ fontSize: '0.78rem', marginBottom: '0.5rem' }}>
                {subtotal >= 599 
                  ? "Congratulations! You qualify for FREE shipping!" 
                  : `You are ₹${awayAmount} away from FREE shipping!`
                }
              </p>
              <div className="shipping-progress-bg">
                <div className="shipping-progress-fill" style={{ width: `${progressPercent}%` }}></div>
                <div className="shipping-progress-truck" style={{ left: `calc(${progressPercent}% - 7px)` }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 18H3c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v5h4l5 2 2 2v2c0 1.1-.9 2-2 2h-2"/><circle cx="7.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                </div>
              </div>
            </div>

            <button 
              className="btn btn-primary checkout-btn" 
              onClick={() => navigate('/checkout')}
              style={{ width: '100%', height: '48px' }}
            >
              Proceed to Checkout
            </button>

            {/* Trusted payment partners */}
            <div className="we-accept-row" style={{ marginTop: '2.2rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.8rem' }}>
              <p style={{ fontSize: '0.68rem', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.8rem' }}>We Accept</p>
              <div className="footer-bottom-payments" style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem' }}>
                <img src="images/logo.png" alt="Visa" className="partner-logo-img visa-mock" style={{ height: '14px', filter: 'grayscale(1) brightness(0.6)' }} />
                <img src="images/logo.png" alt="Mastercard" className="partner-logo-img mastercard-mock" style={{ height: '14px', filter: 'grayscale(1) brightness(0.6)' }} />
                <img src="images/logo.png" alt="UPI" className="partner-logo-img upi-mock" style={{ height: '14px', filter: 'grayscale(1) brightness(0.6)' }} />
                <img src="images/logo.png" alt="Paytm" className="partner-logo-img paytm-mock" style={{ height: '14px', filter: 'grayscale(1) brightness(0.6)' }} />
                <img src="images/logo.png" alt="RuPay" className="partner-logo-img rupay-mock" style={{ height: '14px', filter: 'grayscale(1) brightness(0.6)' }} />
              </div>
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}
