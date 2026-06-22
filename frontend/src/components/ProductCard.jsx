import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext, AuthContext } from '../App.jsx';

function toNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

export default function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);
  const { wishlist, toggleWishlist, reviewsSummary } = useContext(AuthContext);
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const totalStock =
    product.stock !== undefined
      ? toNumber(product.stock)
      : variants.reduce((sum, variant) => sum + toNumber(variant.stock, 0), 0);
  const displayPrice = toNumber(
    product.sale_price ?? product.price ?? variants[0]?.sale_price ?? variants[0]?.price,
    0,
  );
  const displayMrp = toNumber(product.mrp ?? variants[0]?.mrp, displayPrice);
  const isOutOfStock = totalStock <= 0;
  const productPath = `/product/${encodeURIComponent(product.slug || product.id)}`;

  const isWishlisted = Array.isArray(wishlist) && wishlist.includes(product.id);

  // Ratings calculation matching ProductDetails fallback values
  const summary = (reviewsSummary && (reviewsSummary[product.id] || reviewsSummary[product.slug] || reviewsSummary[product.title])) || { average: 4.9, total: 124 };
  const average = summary.average;
  const total = summary.total;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div className="product-card" data-product-id={product.id}>
      <Link
        to={productPath}
        style={{
          textDecoration: 'none',
          color: 'inherit',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          height: '100%'
        }}
      >
        <div className="product-image-wrapper" style={{ position: 'relative' }}>
          <img src={product.image} alt={product.title} className="product-img" loading="lazy" />
          <button
            onClick={handleWishlistToggle}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'rgba(0, 0, 0, 0.4)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 2,
              transition: 'all 0.2s ease',
            }}
            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={isWishlisted ? "var(--color-gold)" : "none"} stroke="var(--color-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-heart">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
          <button
            className="quick-add-btn"
            aria-label="Add to Bag"
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            style={{ opacity: isOutOfStock ? 0.45 : 1, cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          </button>
        </div>
        <div className="product-info" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 className="product-name" style={{ marginBottom: '0.4rem', textAlign: 'center' }}>{product.title}</h3>
          
          {/* Rating stars and reviews count row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.6rem', fontSize: '0.78rem', color: 'var(--color-muted)' }}>
            <div style={{ display: 'flex', gap: '0.1rem' }}>
              {[1, 2, 3, 4, 5].map((star) => {
                const isFull = star <= Math.floor(average);
                const isHalf = !isFull && star === Math.ceil(average) && average % 1 !== 0;
                
                let fillVal = "none";
                if (isFull) fillVal = "var(--color-gold)";
                else if (isHalf) fillVal = `url(#half-star-${product.id})`;
                
                return (
                  <svg key={star} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill={fillVal} stroke="var(--color-gold)" strokeWidth="2">
                    {isHalf && (
                      <defs>
                        <linearGradient id={`half-star-${product.id}`}>
                          <stop offset="50%" stopColor="var(--color-gold)" />
                          <stop offset="50%" stopColor="transparent" stopOpacity="1" />
                        </linearGradient>
                      </defs>
                    )}
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                );
              })}
            </div>
            <span style={{ color: 'var(--color-white)', fontWeight: 600 }}>{average}</span>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user" style={{ opacity: 0.6 }}>
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>{total} reviews</span>
            </div>
          </div>

          <span className="product-price">Rs. {displayPrice}</span>
        </div>
      </Link>
    </div>
  );
}
