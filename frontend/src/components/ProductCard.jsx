import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../App.jsx';

export default function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <div className="product-card" data-product-id={product.id}>
      <div className="product-image-wrapper">
        <Link to={`/product/${product.id}`}>
          <img src={product.image} alt={product.title} className="product-img" loading="lazy" />
        </Link>
        <button className="quick-add-btn" aria-label="Add to Bag" onClick={handleQuickAdd}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        </button>
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-flavor">{product.flavor}</p>
        {product.stock !== undefined && product.stock < 15 && product.stock > 0 && (
          <p className="scarcity-warning" style={{ color: 'var(--rein-gold-light)', fontSize: '0.72rem', fontWeight: 500, marginTop: '0.25rem', marginBottom: '0.25rem', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
            Only {product.stock} left
          </p>
        )}
        <span className="product-price">₹{product.price}</span>
      </div>
    </div>
  );
}
