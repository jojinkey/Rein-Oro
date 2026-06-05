import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import useSEO from '../hooks/useSEO.js';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'All';

  useSEO({
    title: 'Shop Gourmet Collection | Rein Oro',
    description: 'Explore the full catalog of royal health snacks, including slow-roasted Flavored Makhanas, Premium Cashews, California Almonds, and Luxury Gift Hampers.',
    image: 'images/makhana_cheese_onion.png',
    path: '/shop'
  });

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [priceMax, setPriceMax] = useState(1500);
  const [selectedFlavors, setSelectedFlavors] = useState([]);
  const [sortBy, setSortBy] = useState('Featured');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch products
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
      })
      .catch(err => console.error('Failed to load products:', err));
  }, []);

  // Filter & Sort Logic
  useEffect(() => {
    let result = [...products];

    // 1. Category Filter
    if (categoryParam !== 'All') {
      result = result.filter(p => p.name.toLowerCase() === categoryParam.toLowerCase() || p.id.includes(categoryParam.toLowerCase()));
    }

    // 2. Price Filter
    result = result.filter(p => p.price <= priceMax);

    // 3. Flavor Filter (Fast Taste checkboxes)
    if (selectedFlavors.length > 0) {
      result = result.filter(p => {
        return selectedFlavors.some(f => p.flavor.toLowerCase().includes(f.toLowerCase()));
      });
    }

    // 4. Sorting
    if (sortBy === 'Price: Low to High') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'Price: High to Low') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'Customer Rating') {
      // Simulate rating sorting by ID
      result.sort((a, b) => b.id.localeCompare(a.id));
    }

    setFilteredProducts(result);
  }, [products, categoryParam, priceMax, selectedFlavors, sortBy]);

  const handleCategoryClick = (cat) => {
    setSearchParams(cat === 'All' ? {} : { category: cat });
  };

  const handleFlavorToggle = (flavor) => {
    setSelectedFlavors(prev => 
      prev.includes(flavor) ? prev.filter(f => f !== flavor) : [...prev, flavor]
    );
  };

  return (
    <main className="cart-page-main">
      <div className="shop-layout-container">
        
        {/* Sidebar Filters */}
        <aside className={`shop-sidebar ${showMobileFilters ? 'open' : ''}`} style={{ alignSelf: 'start' }}>
          
          {/* Categories */}
          <div className="filter-group" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--color-white)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem', borderBottom: '1px solid rgba(201, 168, 76, 0.2)', paddingBottom: '0.5rem' }}>Categories</h3>
            <ul className="category-list" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {['All', 'Makhana', 'Nuts', 'Gift Box'].map(cat => (
                <li key={cat}>
                  <button 
                    onClick={() => handleCategoryClick(cat)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: categoryParam === cat ? 'var(--color-gold)' : 'var(--color-muted)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: categoryParam === cat ? '600' : '400',
                      transition: 'color 0.2s',
                      textTransform: 'capitalize'
                    }}
                  >
                    {cat === 'Nuts' ? 'Premium Nuts' : cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Price Range Slider */}
          <div className="filter-group" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--color-white)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem', borderBottom: '1px solid rgba(201, 168, 76, 0.2)', paddingBottom: '0.5rem' }}>Price Limit</h3>
            <div className="price-slider-wrapper">
              <input 
                type="range" 
                min="100" 
                max="2000" 
                value={priceMax} 
                className="price-slider" 
                id="priceRange"
                onChange={(e) => setPriceMax(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-gold)' }}
              />
              <div className="price-values" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--color-muted)', marginTop: '0.5rem' }}>
                <span>Min: ₹100</span>
                <span id="sliderVal" style={{ color: 'var(--color-gold)', fontWeight: '600' }}>Max: ₹{priceMax}</span>
              </div>
            </div>
          </div>

          {/* Flavor Selection checkboxes */}
          <div className="filter-group" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--color-white)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem', borderBottom: '1px solid rgba(201, 168, 76, 0.2)', paddingBottom: '0.5rem' }}>Flavors</h3>
            <div className="checkbox-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { name: 'Classic Salted', key: 'Classic' },
                { name: 'Peri Peri', key: 'Peri' },
                { name: 'Cheese & Onion', key: 'Cheese' },
                { name: 'Himalayan Salt', key: 'Himalayan' },
                { name: 'Roasted & Salted', key: 'Roasted' }
              ].map(flav => (
                <label key={flav.key} className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--color-muted)', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedFlavors.includes(flav.key)}
                    onChange={() => handleFlavorToggle(flav.key)}
                    style={{ accentColor: 'var(--color-gold)' }}
                  />
                  {flav.name}
                </label>
              ))}
            </div>
          </div>

          {/* Sorting */}
          <div className="filter-group">
            <h3 style={{ fontSize: '0.9rem', color: 'var(--color-white)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem', borderBottom: '1px solid rgba(201, 168, 76, 0.2)', paddingBottom: '0.5rem' }}>Sort By</h3>
            <div className="select-wrapper">
              <select 
                className="sort-select" 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  width: '100%',
                  background: '#0a0a0a',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'var(--color-white)',
                  padding: '0.5rem',
                  fontSize: '0.85rem',
                  borderRadius: '2px',
                  outline: 'none'
                }}
              >
                <option>Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Customer Rating</option>
              </select>
            </div>
          </div>

        </aside>

        {/* Product Grid */}
        <section className="products-catalog">
          <div className="section-header" style={{ marginBottom: '2.5rem', textAlign: 'left' }}>
            <span className="section-subtitle" style={{ fontSize: '0.72rem' }}>Royal Selection</span>
            <h1 className="section-title" style={{ fontSize: '2.2rem' }}>Gourmet Offerings</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginTop: '0.4rem' }}>
              Showing {filteredProducts.length} premium products
            </p>
            <button 
              className="mobile-filter-toggle-btn"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '12px', height: '12px' }}>
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              {showMobileFilters ? 'Hide Filters' : 'Filter & Sort'}
            </button>
          </div>

          {filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', border: '1px dashed rgba(201,168,76,0.15)', borderRadius: '4px' }}>
              <p style={{ color: 'var(--color-muted)' }}>No products match your current filtering criteria.</p>
              <button 
                className="btn btn-outline" 
                onClick={() => { setSearchParams({}); setPriceMax(1500); setSelectedFlavors([]); setSortBy('Featured'); }}
                style={{ marginTop: '1.5rem' }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="products-grid" style={{ marginBottom: '0' }}>
              {filteredProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
        
      </div>
    </main>
  );
}
