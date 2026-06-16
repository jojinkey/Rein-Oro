import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CartContext } from '../App.jsx';
import useSEO from '../hooks/useSEO.js';
import { apiUrl } from '../config/api.js';

function parseJsonish(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function toArray(value, fallback = []) {
  const parsed = parseJsonish(value, fallback);
  if (Array.isArray(parsed)) return parsed;
  if (typeof parsed === 'string') {
    return parsed
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return fallback;
}

function toObject(value, fallback = {}) {
  const parsed = parseJsonish(value, fallback);
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : fallback;
}

function toNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function normalizeProduct(product) {
  if (!product) return null;
  const benefits = toArray(product.benefits, []);
  const ingredients = toArray(product.ingredients, []).map((item) =>
    typeof item === 'string' ? { name: item, img: 'images/ingredient_makhana.png' } : item
  );
  const variants = toArray(product.variants, [])
    .map((variant) => {
      const weight = String(variant?.weight || product.weight || '').trim();
      if (!weight) return null;
      const salePrice = toNumber(variant?.sale_price ?? variant?.salePrice ?? variant?.price, toNumber(product.sale_price ?? product.price, 0));
      return {
        weight,
        mrp: toNumber(variant?.mrp, toNumber(product.mrp, salePrice)),
        sale_price: salePrice,
        price: salePrice,
        stock: Math.max(0, Math.floor(toNumber(variant?.stock, product.stock ?? 0))),
        active: variant?.active === undefined ? true : variant.active === true || variant.active === 'true' || variant.active === 1 || variant.active === '1',
      };
    })
    .filter(Boolean);
  if (!variants.length && product.weight) {
    const salePrice = toNumber(product.sale_price ?? product.price, 0);
    variants.push({
      weight: product.weight,
      mrp: toNumber(product.mrp, salePrice),
      sale_price: salePrice,
      price: salePrice,
      stock: Math.max(0, Math.floor(toNumber(product.stock, 0))),
      active: true,
    });
  }
  const images = Array.from(new Set([
    product.image,
    ...toArray(product.images, []),
    product.benefits_image,
  ].filter(Boolean)));
  return {
    ...product,
    benefits,
    ingredients,
    specs: toObject(product.specs, {}),
    nutrition: toObject(product.nutrition, {}),
    variants,
    images,
    stock: Math.max(0, Math.floor(toNumber(product.stock, variants.reduce((sum, variant) => sum + toNumber(variant.stock, 0), 0)))),
    slug: product.slug || product.id,
  };
}

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);

  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('desc');
  const [selectedImg, setSelectedImg] = useState('');
  const [selectedWeight, setSelectedWeight] = useState('');
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({ total: 0, average: 0, breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });

  // Fetch all products
  useEffect(() => {
    fetch(apiUrl('/api/products'))
      .then(res => res.json())
      .then(data => {
        const normalizedProducts = Array.isArray(data) ? data.map(normalizeProduct) : [];
        setProducts(normalizedProducts);
        const decodedId = decodeURIComponent(id || '');
        const found = normalizedProducts.find(p => p.id === decodedId || p.slug === decodedId || p.title === decodedId);
        if (found) {
          setProduct(found);
          setSelectedImg(found.image || found.images?.[0] || '');
          setSelectedWeight(found.variants?.[0]?.weight || found.weight || '');
        }
      })
      .catch(err => console.error('Failed to load products:', err));
  }, [id]);

  useEffect(() => {
    fetch(apiUrl(`/api/products/${encodeURIComponent(id || '')}/reviews`))
      .then(res => (res.ok ? res.json() : { reviews: [], summary: { total: 0, average: 0, breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } } }))
      .then(data => {
        setReviews(data.reviews || []);
        setReviewSummary(data.summary || { total: 0, average: 0, breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
      })
      .catch(err => console.error('Failed to load reviews:', err));
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 600) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getVariantForWeight = (weight) => {
    if (!product?.variants?.length) return null;
    return product.variants.find((variant) => variant.weight === weight) || product.variants[0];
  };

  const getPriceForWeight = (basePrice, weight) => {
    const variant = getVariantForWeight(weight);
    if (variant) return toNumber(variant.sale_price ?? variant.price, basePrice);
    if (!weight) return basePrice;
    const w = weight.toLowerCase();
    if (w === '100g') return Math.round(basePrice * 0.5);
    if (w === '250g') return basePrice;
    if (w === '500g') return Math.round(basePrice * 1.8);
    if (w === '1kg') return Math.round(basePrice * 3.2);
    return basePrice;
  };
  const displayPrice = product ? getPriceForWeight(product.price, selectedWeight) : 0;
  const selectedVariant = product ? getVariantForWeight(selectedWeight) : null;
  const displayMrp = selectedVariant ? toNumber(selectedVariant.mrp, displayPrice) : toNumber(product?.mrp, displayPrice);
  const displayStock = selectedVariant ? toNumber(selectedVariant.stock, product?.stock) : toNumber(product?.stock, 0);
  const isOutOfStock = displayStock <= 0;

  // SEO dynamic meta tags
  useSEO({
    title: product ? `${product.title} | Rein Oro — Premium Makhana` : 'Loading Product... | Rein Oro',
    description: product ? product.description : 'Sourced from organic wetlands, handpicked and slow-roasted dry fruits fit for royalty.',
    image: product ? product.image : '',
    path: `/product/${id}`
  });

  // JSON-LD structured data injection for Search Engine Optimization
  useEffect(() => {
    if (!product) return;

    let scriptTag = document.getElementById('ld-json-product');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'ld-json-product';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.title,
      "image": [window.location.origin + '/' + product.image],
      "description": product.description,
      "offers": {
        "@type": "Offer",
        "priceCurrency": "INR",
        "price": displayPrice,
        "availability": displayStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "url": window.location.href
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": reviewSummary.average || "4.9",
        "reviewCount": reviewSummary.total || "124"
      }
    };

    scriptTag.textContent = JSON.stringify(structuredData);

    return () => {
      const tag = document.getElementById('ld-json-product');
      if (tag) tag.remove();
    };
  }, [product, displayPrice, displayStock, reviewSummary]);

  if (!product) {
    return (
      <div style={{ padding: '12rem 2rem', textAlign: 'center', backgroundColor: 'var(--color-bg)' }}>
        <p style={{ color: 'var(--color-muted)' }}>Loading product details or product not found...</p>
        <Link to="/shop" className="btn btn-outline" style={{ marginTop: '1.5rem' }}>Back to Shop</Link>
      </div>
    );
  }

  // Gallery images collection
  const gallery = Array.from(new Set([
    ...(product.images || []),
    product.image,
    product.benefits_image || 'images/makhana_bowl_love.png',
    product.image?.includes('makhana') ? 'images/makhana_classic.png' : 'images/almonds_california.png',
    product.ingredients.length > 1 ? product.ingredients[1].img : product.image
  ].filter(Boolean)));

  const handleAddToCart = (e) => {
    e.preventDefault();
    const productToCart = {
      ...product,
      weight: selectedWeight,
      price: displayPrice,
      mrp: displayMrp,
      stock: displayStock,
      selectedVariant
    };
    if (isOutOfStock) return;
    addToCart(productToCart, qty);
  };

  return (
    <main style={{ padding: '8rem 2rem 6rem 2rem', backgroundColor: 'var(--color-bg)' }}>
      {/* Breadcrumb Navigation */}
      <div className="breadcrumb-nav" style={{ maxWidth: '1200px', margin: '0 auto 2.5rem auto', fontSize: '0.78rem', color: 'var(--color-muted)' }}>
        <Link to="/" style={{ color: 'var(--color-muted)', textDecoration: 'none' }}>Home</Link> &nbsp;/&nbsp; 
        <Link to="/shop" style={{ color: 'var(--color-muted)', textDecoration: 'none' }}>Shop</Link> &nbsp;/&nbsp; 
        <span style={{ color: 'var(--color-gold)' }}>{product.title}</span>
      </div>

      <div className="product-hero-container">
        
        {/* Left Column: Gallery */}
        <div className="product-gallery">
          <div className="gallery-wrapper">
            {/* Thumbnails Sidebar */}
            <div className="gallery-thumbnails">
              {gallery.map((imgUrl, i) => (
                <div 
                  key={i} 
                  className={`thumb-item ${selectedImg === imgUrl ? 'active-thumb' : ''}`}
                  onClick={() => setSelectedImg(imgUrl)}
                >
                  <img src={imgUrl} alt="Thumbnail view" />
                </div>
              ))}
            </div>

            {/* Main Visual Display */}
            <div className="gallery-main-img">
              <img 
                id="main-product-display" 
                src={selectedImg} 
                alt={product.title} 
              />
            </div>
          </div>
        </div>

        {/* Right Column: Info details */}
        <section className="product-info-panel">
          
          <div>
            <h1 className="product-detail-title" style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 300, color: 'var(--color-white)', marginBottom: '0.4rem', lineHeight: 1.1 }}>
              {product.title}
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-gold)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
              {product.flavor}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap', margin: '0.5rem 0 1rem 0' }}>
            <div className="product-detail-price" style={{ fontSize: '1.8rem', color: 'var(--color-gold)', fontFamily: 'var(--font-body)', fontWeight: 500 }}>
              ₹{displayPrice}
            </div>
            {displayMrp > displayPrice && (
              <div style={{ fontSize: '1rem', color: 'var(--color-muted)', textDecoration: 'line-through' }}>
                Rs. {displayMrp}
              </div>
            )}
            <div style={{
              border: displayStock > 0 ? '1px solid rgba(74, 124, 89, 0.35)' : '1px solid rgba(255, 107, 107, 0.35)',
              color: displayStock > 0 ? '#dff7e5' : '#ffb4b4',
              background: displayStock > 0 ? 'rgba(74, 124, 89, 0.14)' : 'rgba(255, 107, 107, 0.12)',
              borderRadius: '20px',
              padding: '0.3rem 0.8rem',
              fontSize: '0.75rem',
              fontWeight: 700
            }}>
              {displayStock > 0 ? `${displayStock} in stock` : 'Out of stock'}
            </div>
            <div style={{ 
              backgroundColor: 'rgba(255, 107, 107, 0.1)', 
              border: '1px solid rgba(255, 107, 107, 0.2)', 
              borderRadius: '20px', 
              padding: '0.3rem 0.8rem', 
              fontSize: '0.75rem', 
              color: '#ff6b6b', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.3rem',
              fontWeight: 500
            }}>
              <span>🔥</span> 124 connoisseurs ordered this today
            </div>
          </div>

          <p className="product-detail-description" style={{ fontSize: '0.92rem', color: 'var(--color-muted)', lineHeight: 1.6 }}>
            {product.description}
          </p>

          {/* Weight details row */}
          <div className="weight-selector-row" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '1rem 0' }}>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--color-muted)', letterSpacing: '0.05em' }}>Weight:</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(product.variants?.length ? product.variants.map(v => v.weight) : ['100g', '250g', '500g', '1kg']).map(w => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setSelectedWeight(w)}
                  style={{
                    fontSize: '0.8rem',
                    color: selectedWeight === w ? 'var(--color-white)' : 'var(--color-muted)',
                    fontWeight: 600,
                    border: selectedWeight === w ? '1.5px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.1)',
                    padding: '0.4rem 0.9rem',
                    borderRadius: '2px',
                    backgroundColor: selectedWeight === w ? 'rgba(201,168,76,0.1)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Spinner and Checkout row */}
          <div className="purchase-controls" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div className="qty-spinner" style={{ height: '48px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '2px', display: 'flex', alignItems: 'center' }}>
              <button 
                className="qty-btn dec-qty-btn" 
                onClick={() => setQty(prev => Math.max(1, prev - 1))}
                style={{ width: '40px', height: '100%', background: 'transparent', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', fontSize: '1.1rem' }}
              >
                -
              </button>
              <input 
                type="text" 
                id="product-qty" 
                value={qty} 
                readOnly 
                style={{ width: '40px', textAlign: 'center', border: 'none', background: 'transparent', color: 'var(--color-white)', fontWeight: 600, outline: 'none' }} 
              />
              <button 
                className="qty-btn inc-qty-btn" 
                onClick={() => setQty(prev => prev + 1)}
                style={{ width: '40px', height: '100%', background: 'transparent', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', fontSize: '1.1rem' }}
              >
                +
              </button>
            </div>
            <button 
              className="btn btn-primary add-to-cart-action" 
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              style={{ flex: 1, height: '48px', padding: 0, opacity: isOutOfStock ? 0.55 : 1, cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
            >
              {isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
            </button>
          </div>

          {/* Benefits Checklists */}
          <div className="benefits-checklist-wrapper" style={{ marginTop: '1rem' }}>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--color-white)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.8rem' }}>Benefits:</h4>
            <ul className="benefits-check-list">
              {product.benefits.map((b, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--color-muted)' }}>
                  <svg className="check-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* Ingredients Row */}
          <div className="ingredients-wrapper" style={{ marginTop: '1rem' }}>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--color-white)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.8rem' }}>Key Ingredients:</h4>
            <div className="ingredients-circles-row" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {product.ingredients.map((ing, i) => (
                <div key={i} className="ingredient-circle-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                  <div className="ingredient-img-frame" style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', border: '1px solid rgba(201,168,76,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                    <img src={ing.img} alt={ing.name} style={{ maxWidth: '75%', maxHeight: '75%', objectFit: 'contain' }} />
                  </div>
                  <span className="ingredient-label" style={{ fontSize: '0.68rem', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{ing.name}</span>
                </div>
              ))}
            </div>
          </div>

        </section>

      </div>

      {/* Tabs Section */}
      <section className="product-tabs-section" style={{ maxWidth: '1200px', margin: '5rem auto 0 auto', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '2.5rem' }}>
        {/* Buttons Row */}
        <div className="tabs-header-row" style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '0.8rem' }}>
          {[
            { id: 'desc', label: 'Description' },
            { id: 'specs', label: 'Specifications' },
            { id: 'nutrition', label: 'Nutritional Facts' },
            { id: 'reviews', label: 'Reviews' }
          ].map(tab => (
            <button 
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active-tab-btn' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: activeTab === tab.id ? 'var(--color-gold)' : 'var(--color-muted)',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontWeight: activeTab === tab.id ? 600 : 400,
                borderBottom: activeTab === tab.id ? '2px solid var(--color-gold)' : 'none',
                paddingBottom: '0.9rem',
                marginBottom: '-0.9rem'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Panels Content */}
        <div className="tab-panels-wrapper" style={{ paddingTop: '2rem' }}>
          
          {activeTab === 'desc' && (
            <div className="tab-panel active-tab-panel description-paragraphs" style={{ color: 'var(--color-muted)', fontSize: '0.92rem', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '800px' }}>
              <p>
                {product.title} is an premium gourmet snack prepared for the most discerning palates. Slow-roasted in small batches using premium seeds and kernels, each bite offers an optimal crunch and pristine flavor profile.
              </p>
              <p>
                Perfect for healthy daily snacks or curated corporate gifting, it is completely free from cholesterol, trans fats, or uncertified chemical additives. Enjoy pure taste, crowned in gold.
              </p>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="tab-panel active-tab-panel" style={{ maxWidth: '600px' }}>
              <table id="specs-table-el" className="policy-table" style={{ width: '100%', fontSize: '0.88rem' }}>
                <tbody>
                  {Object.entries(product.specs).map(([key, val]) => (
                    <tr key={key}>
                      <td style={{ fontWeight: '600', color: 'var(--color-white)', padding: '0.8rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{key}</td>
                      <td style={{ color: 'var(--color-muted)', padding: '0.8rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'nutrition' && (
            <div className="tab-panel active-tab-panel" style={{ maxWidth: '600px' }}>
              <table id="nutrition-table-el" className="policy-table" style={{ width: '100%', fontSize: '0.88rem' }}>
                <tbody>
                  {Object.entries(product.nutrition).map(([key, val]) => (
                    <tr key={key}>
                      <td style={{ fontWeight: '600', color: 'var(--color-white)', padding: '0.8rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{key}</td>
                      <td style={{ color: 'var(--color-muted)', padding: '0.8rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="tab-panel active-tab-panel" style={{ color: 'var(--color-muted)', fontSize: '0.92rem' }}>
              <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                <div style={{ minWidth: '200px' }}>
                  <h3 style={{ fontSize: '2.5rem', color: 'var(--color-white)', fontWeight: 300, margin: '0 0 0.5rem 0', fontFamily: 'var(--font-heading)' }}>{reviewSummary.average || '4.9'}</h3>
                  <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '0.5rem' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <svg key={star} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="var(--color-gold)" stroke="var(--color-gold)"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    ))}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>Based on {reviewSummary.total || 124} connoisseur reviews</p>
                </div>
                
                <div style={{ flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {[5, 4, 3, 2, 1].map(stars => {
                    const count = reviewSummary.breakdown?.[stars] || 0;
                    const pct = reviewSummary.total ? Math.round((count / reviewSummary.total) * 100) : (stars === 5 ? 92 : stars === 4 ? 6 : stars === 3 ? 2 : 0);
                    return (
                      <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.8rem' }}>
                        <span style={{ width: '40px', color: 'var(--color-white)' }}>{stars} star</span>
                        <div style={{ flex: 1, height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--color-gold)' }}></div>
                        </div>
                        <span style={{ width: '30px', textAlign: 'right', color: 'var(--color-muted)' }}>{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                {(reviews.length ? reviews : [
                  { name: 'Aditya Roy', created_at: 'May 12, 2026', rating: 5, comment: 'The cheese onion flavoring is sublime. Absolute premium crunch and texture.' },
                  { name: 'Meera Sen', created_at: 'April 28, 2026', rating: 5, comment: 'Hands down the best makhana I have ordered in India. Beautifully packed and completely fresh.' },
                  { name: 'Vikram Malhotra', created_at: 'April 14, 2026', rating: 4, comment: 'Superb quality. The gold visual branding is premium and the shipping was fast.' }
                ]).map((rev, idx) => (
                  <div key={rev.id || idx} style={{ paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                      <strong style={{ color: 'var(--color-white)', fontSize: '0.88rem' }}>{rev.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{rev.created_at || rev.date}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.1rem', marginBottom: '0.6rem' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <svg key={star} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill={star <= rev.rating ? "var(--color-gold)" : "none"} stroke="var(--color-gold)"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      ))}
                    </div>
                    <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* You May Also Love (Related Products) */}
      <section style={{ maxWidth: '1200px', margin: '5rem auto 0 auto', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '3.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 300, color: 'var(--color-white)', marginBottom: '2rem', textAlign: 'center' }}>You May Also Love</h2>
        <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          {products
            .filter(p => p.id !== id && p.slug !== id)
            .slice(0, 4)
            .map(p => (
              <div key={p.id} className="product-card" style={{ border: '1px solid rgba(201,168,76,0.12)', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#141414', display: 'flex', flexDirection: 'column' }}>
                <Link to={`/product/${encodeURIComponent(p.slug || p.id)}`} style={{ textDecoration: 'none' }}>
                  <div style={{ height: '220px', backgroundColor: '#1C1A16', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={p.image} alt={p.title} style={{ maxHeight: '80%', maxWidth: '80%', objectFit: 'contain' }} />
                  </div>
                </Link>
                <div style={{ padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                  <div>
                    <Link to={`/product/${encodeURIComponent(p.slug || p.id)}`} style={{ textDecoration: 'none' }}>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', color: 'var(--color-white)', marginBottom: '0.4rem' }}>{p.title}</h3>
                    </Link>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-gold)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{p.flavor} &bull; {p.weight}</p>
                  </div>
                  <div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.1rem', color: 'var(--color-gold)', fontWeight: 500, marginBottom: '1.2rem' }}>₹{p.price}</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => addToCart(p, 1)}
                      disabled={Number(p.stock || 0) <= 0}
                      style={{ width: '100%', height: '40px', padding: 0, opacity: Number(p.stock || 0) <= 0 ? 0.55 : 1, cursor: Number(p.stock || 0) <= 0 ? 'not-allowed' : 'pointer' }}
                    >
                      {Number(p.stock || 0) <= 0 ? 'Out of Stock' : 'Add to Bag'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* Sticky Bottom Add to Cart Bar */}
      <div className="sticky-add-to-cart-bar" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(10, 10, 10, 0.95)',
        borderTop: '1.5px solid var(--color-gold)',
        padding: '0.8rem 2rem',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 -10px 30px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(10px)',
        transform: showStickyBar ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        pointerEvents: showStickyBar ? 'auto' : 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
            <img src={product.image} alt={product.title} style={{ width: '40px', height: '40px', objectFit: 'contain', backgroundColor: 'var(--color-bg)', borderRadius: '2px' }} />
            <div style={{ textAlign: 'left' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: 'var(--color-white)', margin: 0 }}>{product.title}</h4>
              <p style={{ fontSize: '0.72rem', color: 'var(--color-gold)', margin: 0 }}>{product.flavor} &bull; {selectedWeight}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <span style={{ fontSize: '1.2rem', color: 'var(--color-gold)', fontWeight: 600, fontFamily: 'var(--font-body)' }}>₹{displayPrice}</span>
            <button 
              onClick={handleAddToCart}
              className="btn btn-primary"
              disabled={isOutOfStock}
              style={{ height: '40px', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isOutOfStock ? 0.55 : 1, cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
            >
              {isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
