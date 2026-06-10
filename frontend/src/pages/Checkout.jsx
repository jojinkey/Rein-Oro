import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext, AuthContext } from '../App.jsx';

export default function Checkout() {
  const { cart, giftNote, appliedPromo, discountRate, subtotal, discount, shipping: baseShipping, tax, total: baseTotal, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: user ? user.email : '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    pincode: '',
    saveAddress: false
  });
  const [deliveryMethod, setDeliveryMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [enabledPayments, setEnabledPayments] = useState({});
  const [showMockPaymentModal, setShowMockPaymentModal] = useState(false);
  const [mockOrderPayload, setMockOrderPayload] = useState(null);
  const [mockPaymentMeta, setMockPaymentMeta] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    fetch('/api/settings/payment')
      .then(res => res.json())
      .then(data => {
        setEnabledPayments(data);
        const keys = Object.keys(data);
        if (data['Razorpay (Online Payment)']) {
          setPaymentMethod('razorpay');
        } else if (keys.length > 0) {
          const firstEnabled = keys.find(k => data[k]);
          if (firstEnabled === 'Cash on Delivery (COD)') setPaymentMethod('cod');
          else if (firstEnabled === 'UPI / NetBanking') setPaymentMethod('upi');
          else if (firstEnabled === 'Credit / Debit Card') setPaymentMethod('card');
          else setPaymentMethod('upi');
        }
      })
      .catch(err => console.error(err));
  }, []);

  // Auto-fill City & State via India Post Pincode API
  React.useEffect(() => {
    const pincode = formData.pincode.trim();
    if (pincode.length === 6 && /^\d+$/.test(pincode)) {
      fetch(`https://api.postalpincode.in/pincode/${pincode}`)
        .then(res => res.json())
        .then(data => {
          if (data && data[0] && data[0].Status === 'Success') {
            const postOffice = data[0].PostOffice && data[0].PostOffice[0];
            if (postOffice) {
              setFormData(prev => ({
                ...prev,
                city: postOffice.District || postOffice.Block || prev.city,
                state: postOffice.State || prev.state
              }));
            }
          }
        })
        .catch(err => console.error('Pincode API Error:', err));
    }
  }, [formData.pincode]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Recalculations based on checkout selections
  const shippingFee = deliveryMethod === 'standard' ? (subtotal >= 599 ? 0 : 99) : 149;
  const codFee = paymentMethod === 'cod' ? 49 : 0;
  const totalAmount = (subtotal - discount) + shippingFee + tax + codFee;

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  const verifyRazorpayPayment = async ({ orderId, paymentId, signature, localOrderId, amount }) => {
    const response = await fetch('/api/payments/razorpay/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        order_id: localOrderId,
        amount
      })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Payment verification failed');
    }
    return data;
  };

  const saveOrderToDB = async (payload) => {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const resData = await response.json();
    if (!response.ok) {
      throw new Error(resData.error || 'Server rejected order details');
    }

    localStorage.setItem('rein_oro_last_order', JSON.stringify(payload));
    clearCart();
    navigate('/confirmation');
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!agreed) {
      alert('You must agree to our Terms & Conditions and Privacy Policy to place an order.');
      return;
    }

    setIsSubmitting(true);

    const orderId = `RO-${Math.floor(100000 + Math.random() * 900000)}`;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const formattedDate = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()} at ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const deliveryStart = new Date();
    deliveryStart.setDate(now.getDate() + 4);
    const deliveryEnd = new Date();
    deliveryEnd.setDate(now.getDate() + 6);
    const formattedDelivery = `${deliveryStart.getDate()} - ${deliveryEnd.getDate()} ${months[deliveryStart.getMonth()]} ${deliveryStart.getFullYear()}`;

    let paymentMethodName = 'Paid Online';
    if (paymentMethod === 'upi') paymentMethodName = 'Paid Online (UPI)';
    else if (paymentMethod === 'card') paymentMethodName = 'Paid Online (Card)';
    else if (paymentMethod === 'netbanking') paymentMethodName = 'Net Banking';
    else if (paymentMethod === 'cod') paymentMethodName = 'Cash on Delivery (COD)';
    else if (paymentMethod === 'razorpay') paymentMethodName = 'Razorpay Instant Payment (Simulated)';

    const orderPayload = {
      id: orderId,
      user_email: formData.email || 'guest@reinoro.com',
      date: formattedDate,
      est_delivery: formattedDelivery,
      payment_method: paymentMethodName,
      subtotal: subtotal,
      discount: discount,
      shipping: shippingFee,
      tax: tax,
      cod_fee: codFee,
      total: totalAmount,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        flavor: item.flavor,
        weight: item.weight,
        qty: item.qty,
        price: item.price,
        image: item.image
      }))
    };

    if (paymentMethod === 'razorpay') {
      try {
        const orderRes = await fetch('/api/payments/razorpay/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: totalAmount, receipt: orderId })
        });
        const orderData = await orderRes.json();
        if (!orderRes.ok) {
          throw new Error(orderData.error || 'Failed to create payment order');
        }

        if (orderData.isMock) {
          setMockOrderPayload(orderPayload);
          setMockPaymentMeta(orderData);
          setShowMockPaymentModal(true);
          setIsSubmitting(false);
        } else {
          const scriptLoaded = await loadRazorpayScript();
          if (!scriptLoaded) {
            alert('Failed to load Razorpay script. Check your internet connection.');
            setIsSubmitting(false);
            return;
          }

          const options = {
            key: orderData.keyId,
            amount: orderData.amount,
            currency: 'INR',
            name: 'Rein Oro Luxury Foods',
            description: 'Gourmet Order Payment',
            order_id: orderData.orderId,
            prefill: {
              name: formData.name,
              email: formData.email,
              contact: formData.phone
            },
            theme: {
              color: '#c9a84c'
            },
            handler: async function (response) {
              try {
                await verifyRazorpayPayment({
                  orderId: response.razorpay_order_id || orderData.orderId,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                  localOrderId: orderPayload.id,
                  amount: totalAmount
                });
                const finalPayload = {
                  ...orderPayload,
                  payment_method: 'Paid via Razorpay Online',
                  payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id || orderData.orderId,
                  razorpay_signature: response.razorpay_signature
                };
                await saveOrderToDB(finalPayload);
              } catch (err) {
                alert(`Order registration issue: ${err.message}`);
              } finally {
                setIsSubmitting(false);
              }
            },
            modal: {
              ondismiss: function () {
                setIsSubmitting(false);
              }
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        }
      } catch (err) {
        alert(`Razorpay checkout initialization failed: ${err.message}`);
        setIsSubmitting(false);
      }
    } else {
      try {
        await saveOrderToDB(orderPayload);
      } catch (err) {
        alert(`Failed to complete order checkout: ${err.message}`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (cart.length === 0) {
    return (
      <div style={{ padding: '12rem 2rem', textAlign: 'center', backgroundColor: 'var(--color-bg)' }}>
        <p style={{ color: 'var(--color-muted)' }}>No items in checkout cart...</p>
        <Link to="/shop" className="btn btn-outline" style={{ marginTop: '1.5rem' }}>View Catalog</Link>
      </div>
    );
  }

  return (
    <main className="cart-page-main">
      <form onSubmit={handlePlaceOrder} className="checkout-page-layout">
        
        {/* Left Column: Form Details */}
        <section className="checkout-forms-column" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.2rem', fontWeight: 300, color: 'var(--color-white)', marginBottom: '0.5rem' }}>
            Concierge Checkout
          </h1>

          {/* Step 1: Delivery Information */}
          <div className="checkout-step-card" style={{ border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', padding: '2.2rem', backgroundColor: 'rgba(15,15,15,0.4)' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--color-gold)', color: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>1</span>
              Delivery Address
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div className="checkout-form-row">
                <div className="contact-form-group">
                  <label htmlFor="name" className="contact-form-label">Full Name</label>
                  <input type="text" id="name" className="contact-form-input" placeholder="Receiver name" required value={formData.name} onChange={handleInputChange} />
                </div>
                <div className="contact-form-group">
                  <label htmlFor="phone" className="contact-form-label">Phone Number</label>
                  <input type="tel" id="phone" className="contact-form-input" placeholder="For delivery updates" required value={formData.phone} onChange={handleInputChange} />
                </div>
              </div>

              <div className="contact-form-group">
                <label htmlFor="email" className="contact-form-label">Email Address</label>
                <input type="email" id="email" className="contact-form-input" placeholder="Order receipt destination" required value={formData.email} onChange={handleInputChange} />
              </div>

              <div className="contact-form-group">
                <label htmlFor="address" className="contact-form-label">Street Address</label>
                <input type="text" id="address" className="contact-form-input" placeholder="Building, Street, Area" required value={formData.address} onChange={handleInputChange} />
              </div>

              <div className="checkout-form-row">
                <div className="contact-form-group">
                  <label htmlFor="apartment" className="contact-form-label">Apartment / Suite (Optional)</label>
                  <input type="text" id="apartment" className="contact-form-input" placeholder="Unit, Floor, etc." value={formData.apartment} onChange={handleInputChange} />
                </div>
                <div className="contact-form-group">
                  <label htmlFor="city" className="contact-form-label">City</label>
                  <input type="text" id="city" className="contact-form-input" placeholder="City name" required value={formData.city} onChange={handleInputChange} />
                </div>
              </div>

              <div className="checkout-form-row">
                <div className="contact-form-group">
                  <label htmlFor="state" className="contact-form-label">State / Region</label>
                  <input type="text" id="state" className="contact-form-input" placeholder="State" required value={formData.state} onChange={handleInputChange} />
                </div>
                <div className="contact-form-group">
                  <label htmlFor="pincode" className="contact-form-label">PIN / ZIP Code</label>
                  <input type="text" id="pincode" className="contact-form-input" placeholder="6-digit code" required value={formData.pincode} onChange={handleInputChange} />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', color: 'var(--color-muted)', cursor: 'pointer', marginTop: '0.5rem' }}>
                <input type="checkbox" id="saveAddress" checked={formData.saveAddress} onChange={handleInputChange} style={{ accentColor: 'var(--color-gold)', width: '16px', height: '16px', cursor: 'pointer' }} />
                Save this address for future royal transactions
              </label>
            </div>
          </div>

          {/* Step 2: Delivery Method */}
          <div className="checkout-step-card" style={{ border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', padding: '2.2rem', backgroundColor: 'rgba(15,15,15,0.4)' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--color-gold)', color: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>2</span>
              Delivery Option
            </h3>

            <div className="checkout-form-row">
              <div 
                className={`delivery-card ${deliveryMethod === 'standard' ? 'selected' : ''}`}
                onClick={() => setDeliveryMethod('standard')}
                style={{
                  border: deliveryMethod === 'standard' ? '1.5px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '6px',
                  padding: '1.2rem',
                  cursor: 'pointer',
                  backgroundColor: deliveryMethod === 'standard' ? 'rgba(201,168,76,0.02)' : 'transparent',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-white)' }}>Standard Delivery</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gold)' }}>
                    {subtotal >= 599 ? 'FREE' : '₹99'}
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>Delivered in 4 to 6 business days. Fully tracked.</p>
              </div>

              <div 
                className={`delivery-card ${deliveryMethod === 'express' ? 'selected' : ''}`}
                onClick={() => setDeliveryMethod('express')}
                style={{
                  border: deliveryMethod === 'express' ? '1.5px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '6px',
                  padding: '1.2rem',
                  cursor: 'pointer',
                  backgroundColor: deliveryMethod === 'express' ? 'rgba(201,168,76,0.02)' : 'transparent',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-white)' }}>Express Delivery</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-gold)' }}>₹149</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>Delivered in 2 to 3 business days. Priority priority.</p>
              </div>
            </div>
          </div>

          {/* Step 3: Payment Method */}
          <div className="checkout-step-card" style={{ border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', padding: '2.2rem', backgroundColor: 'rgba(15,15,15,0.4)' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--color-gold)', color: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>3</span>
              Payment Selection
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(() => {
                const paymentOptions = [];
                if (enabledPayments['UPI / NetBanking'] || enabledPayments['UPI / NetBanking'] === undefined) {
                  paymentOptions.push({ id: 'upi', label: 'Unified Payments Interface (UPI)', desc: 'Instant transfer via PhonePe, GPay, Paytm, or BHIM.' });
                }
                if (enabledPayments['Credit / Debit Card'] || enabledPayments['Credit / Debit Card'] === undefined) {
                  paymentOptions.push({ id: 'card', label: 'Credit or Debit Card', desc: 'Secure payment via Visa, Mastercard, or RuPay.' });
                }
                if (enabledPayments['Net Banking'] || enabledPayments['Net Banking'] === undefined) {
                  paymentOptions.push({ id: 'netbanking', label: 'Net Banking', desc: 'Direct secure access from major commercial banks.' });
                }
                if (enabledPayments['Razorpay (Online Payment)'] === 1 || enabledPayments['Razorpay (Online Payment)'] === true) {
                  paymentOptions.push({ id: 'razorpay', label: 'Razorpay Instant Payment (UPI/Card/NetBanking)', desc: 'Secure checkout with Razorpay. Supports cards, netbanking, and UPI.' });
                }
                if (enabledPayments['Cash on Delivery (COD)'] === 1 || enabledPayments['Cash on Delivery (COD)'] === true || enabledPayments['Cash on Delivery (COD)'] === undefined) {
                  paymentOptions.push({ id: 'cod', label: 'Cash on Delivery (COD)', desc: 'Pay with cash at your door. Adds flat ₹49 security fee.' });
                }

                return paymentOptions.map(pay => (
                  <div 
                    key={pay.id} 
                    className={`payment-row-item ${paymentMethod === pay.id ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod(pay.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem',
                      padding: '1.2rem',
                      border: paymentMethod === pay.id ? '1.5px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      backgroundColor: paymentMethod === pay.id ? 'rgba(201,168,76,0.02)' : 'transparent',
                      transition: 'all 0.2s'
                    }}
                  >
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      checked={paymentMethod === pay.id} 
                      onChange={() => {}} 
                      style={{ marginTop: '0.2rem', accentColor: 'var(--color-gold)' }} 
                    />
                    <div>
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-white)', marginBottom: '0.25rem' }}>{pay.label}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{pay.desc}</p>
                    </div>
                  </div>
                ));
              })()}
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.8rem', color: 'var(--color-muted)', cursor: 'pointer', marginTop: '1.8rem' }}>
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: '0.15rem', accentColor: 'var(--color-gold)', width: '16px', height: '16px', cursor: 'pointer' }} />
              <span>I have read and agree to the site's <Link to="/terms" target="_blank" style={{ color: 'var(--color-gold)', textDecoration: 'none' }}>Terms & Conditions</Link> and <Link to="/privacy" target="_blank" style={{ color: 'var(--color-gold)', textDecoration: 'none' }}>Privacy Policy</Link>.</span>
            </label>
          </div>

        </section>

        {/* Right Column: Sticky Summary & Products list */}
        <section className="cart-page-right">
          <div className="cart-order-summary" style={{ border: '1px solid rgba(201,168,76,0.15)', borderRadius: '12px', padding: '2.5rem', backgroundColor: 'rgba(15,15,15,0.75)', backdropFilter: 'blur(10px)' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 300, color: 'var(--color-white)', marginBottom: '1.5rem' }}>
              Your Order
            </h2>

            {/* List items */}
            <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem', marginBottom: '1.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '50px', height: '50px', backgroundColor: 'rgba(5,5,5,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '2px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <img src={item.image} alt={item.title} style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.8rem', color: 'var(--color-white)', fontWeight: 500 }}>{item.name}</h4>
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>{item.flavor} &bull; Qty: {item.qty}</p>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-white)' }}>
                    ₹{item.price * item.qty}
                  </div>
                </div>
              ))}
            </div>

            {/* Summaries values */}
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            {discount > 0 && (
              <div className="summary-row">
                <span className="discount-label">Discount (10% Off)</span>
                <span className="discount-value">-₹{discount}</span>
              </div>
            )}
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shippingFee === 0 ? 'Free' : `₹${shippingFee}`}</span>
            </div>
            <div className="summary-row">
              <span>Tax (18%)</span>
              <span>₹{tax}</span>
            </div>
            {codFee > 0 && (
              <div className="summary-row">
                <span style={{ color: 'var(--color-white)' }}>COD Fee</span>
                <span>₹{codFee}</span>
              </div>
            )}
            <hr className="summary-divider" />
            <div className="summary-row total-row" style={{ marginBottom: '2rem' }}>
              <span>Total Tally</span>
              <span style={{ color: 'var(--color-gold)' }}>₹{totalAmount}</span>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary checkout-btn" 
              disabled={isSubmitting}
              style={{ width: '100%', height: '48px' }}
            >
              {isSubmitting ? (
                <>
                  <svg className="spinner-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
                  Processing Order...
                </>
              ) : (
                'Place Order Securely'
              )}
            </button>
          </div>
        </section>

      </form>

      {/* Sandbox Payment Simulator Modal */}
      {showMockPaymentModal && mockOrderPayload && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ border: '1px solid var(--color-gold-border)', borderRadius: '12px', width: '100%', maxWidth: '440px', padding: '2.5rem', backgroundColor: '#090909', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--color-gold)', fontWeight: 300, marginBottom: '0.8rem' }}>
              Razorpay Sandbox Simulator
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '2rem', lineHeight: 1.5 }}>
              You are paying <strong>₹{mockOrderPayload.total}</strong> in sandbox test mode. No real money will be charged.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button
                onClick={async () => {
                  try {
                    setIsSubmitting(true);
                    const mockPaymentId = `pay_mock_${Date.now()}`;
                    await verifyRazorpayPayment({
                      orderId: mockPaymentMeta?.orderId,
                      paymentId: mockPaymentId,
                      signature: 'mock_signature',
                      localOrderId: mockOrderPayload.id,
                      amount: mockOrderPayload.total
                    });
                    const finalPayload = {
                      ...mockOrderPayload,
                      payment_method: 'Paid via Razorpay Online (Simulated)',
                      status: 'Processing',
                      payment_id: mockPaymentId,
                      razorpay_order_id: mockPaymentMeta?.orderId,
                      razorpay_signature: 'mock_signature'
                    };
                    await saveOrderToDB(finalPayload);
                    setShowMockPaymentModal(false);
                    setMockPaymentMeta(null);
                  } catch (err) {
                    alert(`Simulation error: ${err.message}`);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{ width: '100%', height: '44px' }}
              >
                Approve Payment (Simulate Success)
              </button>

              <button
                onClick={() => {
                  alert('Payment was cancelled/declined by user in simulation mode.');
                  setShowMockPaymentModal(false);
                  setMockPaymentMeta(null);
                  setIsSubmitting(false);
                }}
                disabled={isSubmitting}
                className="btn btn-outline"
                style={{ width: '100%', height: '44px', border: '1px solid rgba(255,80,80,0.3)', color: 'rgba(255,80,80,0.8)' }}
              >
                Decline Payment (Simulate Failure)
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
