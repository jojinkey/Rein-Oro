import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../App.jsx';

function toNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

export default function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);
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

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
  };

  return (
    <div className="product-card" data-product-id={product.id}>
      <div className="product-image-wrapper">
        <Link to={productPath}>
          <img src={product.image} alt={product.title} className="product-img" loading="lazy" />
        </Link>
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
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-flavor">{product.flavor}</p>
        {totalStock < 15 && totalStock > 0 && (
          <p className="scarcity-warning" style={{ color: 'var(--rein-gold-light)', fontSize: '0.72rem', fontWeight: 500, marginTop: '0.25rem', marginBottom: '0.25rem', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
            Only {totalStock} left
          </p>
        )}
        {isOutOfStock && (
          <p className="scarcity-warning" style={{ color: '#ffb4b4', fontSize: '0.72rem', fontWeight: 600, marginTop: '0.25rem', marginBottom: '0.25rem', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
            Out of stock
          </p>
        )}
        <span className="product-price">Rs. {displayPrice}</span>
        {displayMrp > displayPrice && <span className="product-mrp">MRP Rs. {displayMrp}</span>}
      </div>
    </div>
  );
}
