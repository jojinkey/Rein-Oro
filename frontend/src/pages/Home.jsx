import React, { useEffect, useRef, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext, CMSContext } from '../App.jsx';
import ProductCard from '../components/ProductCard.jsx';
import useSEO from '../hooks/useSEO.js';

export default function Home() {
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const { getCMSValue } = useContext(CMSContext);

  useSEO({
    title: 'Rein Oro Foods | Premium Makhana & Dry Fruits',
    description: 'Experience premium healthy snacking with naturally sourced makhana and dry fruits from Rein Oro Foods.',
    image: 'images/makhana_cheese_onion.png',
    path: '/'
  });

  const [products, setProducts] = useState([]);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const frameCount = 68;
  const imagesRef = useRef([]);
  const airpodsRef = useRef({ frame: 0 });

  // Fetch products
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        const featured = list.filter((product) => product.featured);
        setProducts((featured.length ? featured : list).slice(0, 4));
      })
      .catch(err => console.error('Failed to load products:', err));
  }, []);

  // Preloading & Animation Setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    let isComponentMounted = true;
    let localGsap = null;
    let localScrollTrigger = null;
    let imagesLoaded = false;
    let gsapLoaded = false;
    let isAnimationsSetup = false;
    let scene1Entrance = null;
    let mainTimeline = null;
    let navTrigger = null;

    imagesRef.current = [];
    airpodsRef.current.frame = 0;

    // Helpers
    const getFramePath = (index) => {
      const paddedIndex = String(index + 1).padStart(3, '0');
      return `frames/ezgif-frame-${paddedIndex}.jpg`;
    };

    const drawCanvasFrame = (img) => {
      if (!img || !canvas || !context) return;

      const devicePixelRatio = window.devicePixelRatio || 1;
      const canvasW = canvas.width / devicePixelRatio;
      const canvasH = canvas.height / devicePixelRatio;

      context.fillStyle = '#050505';
      context.fillRect(0, 0, canvasW, canvasH);

      const imgW = img.width;
      const imgH = img.height;

      const scaleRatio = Math.max(canvasW / imgW, canvasH / imgH);
      const w = imgW * scaleRatio;
      const h = imgH * scaleRatio;
      const x = (canvasW - w) / 2;
      const y = (canvasH - h) / 2;

      context.drawImage(img, x, y, w, h);
    };

    const resizeCanvas = () => {
      const devicePixelRatio = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * devicePixelRatio;
      canvas.height = window.innerHeight * devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

      const currentFrameImg = imagesRef.current[airpodsRef.current.frame];
      if (currentFrameImg) {
        drawCanvasFrame(currentFrameImg);
      }
    };

    const checkAndInit = () => {
      if (imagesLoaded && gsapLoaded && isComponentMounted && !isAnimationsSetup) {
        isAnimationsSetup = true;
        setupAnimations();
      }
    };

    // Preload
    let loadedCount = 0;
    const preloadImages = () => {
      for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.onload = () => {
          if (!isComponentMounted) return;
          loadedCount++;
          if (loadedCount === frameCount) {
            imagesLoaded = true;
            checkAndInit();
          }
        };
        img.onerror = () => {
          if (!isComponentMounted) return;
          loadedCount++;
          if (loadedCount === frameCount) {
            imagesLoaded = true;
            checkAndInit();
          }
        };
        img.src = getFramePath(i);
        imagesRef.current.push(img);
      }
    };

    // Setup Animations
    const setupAnimations = () => {
      if (!isComponentMounted) return;

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      const useScrollFallback =
        window.matchMedia('(max-width: 767px), (max-height: 620px), (prefers-reduced-motion: reduce)').matches;

      if (useScrollFallback) {
        containerRef.current?.classList.add('scroll-fallback');
        localGsap.set(['#scene-1', '#scene-2', '#scene-3', '#scene-4', '#scene-5'], {
          autoAlpha: 1,
          x: 0,
          y: 0,
          filter: 'none'
        });
        return;
      }

      // Draw initial frame
      if (imagesRef.current[0]) {
        drawCanvasFrame(imagesRef.current[0]);
      }

      // Initial States
      localGsap.set(['#scene-2', '#scene-3', '#scene-4', '#scene-5'], {
        autoAlpha: 0,
        y: 60,
        filter: 'blur(15px)'
      });

      localGsap.set('#scene-2', { x: -30 });
      localGsap.set('#scene-3', { x: 30 });
      localGsap.set('#scene-4', { x: -30 });
      localGsap.set('#scene-1', { autoAlpha: 0, y: 50, filter: 'blur(12px)' });

      // Entrance animation
      if (window.scrollY < 50) {
        scene1Entrance = localGsap.to('#scene-1', {
          autoAlpha: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1.8,
          ease: 'power3.out',
          delay: 0.4
        });
      } else {
        localGsap.set('#scene-1', { autoAlpha: 0, y: -50, filter: 'blur(10px)' });
      }

      // Nav bar transitions
      navTrigger = localScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top+=40 top',
        onEnter: () => {
          document.getElementById('main-nav')?.classList.add('scrolled');
        },
        onLeaveBack: () => {
          document.getElementById('main-nav')?.classList.remove('scrolled');
        }
      });

      // Scroll timeline
      mainTimeline = localGsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.2,
          onUpdate: (self) => {
            if (self.progress > 0.01) {
              if (scene1Entrance) {
                scene1Entrance.kill();
                scene1Entrance = null;
              }
            } else if (self.progress === 0) {
              localGsap.set('#scene-1', { autoAlpha: 1, y: 0, filter: 'blur(0px)', overwrite: 'auto' });
            }

            // Sync progress bar
            const progBar = document.querySelector('.scroll-progress');
            if (progBar) progBar.style.width = `${self.progress * 100}%`;

            // Fade indicators
            const indicator = document.querySelector('.scroll-indicator');
            if (indicator) indicator.style.opacity = self.progress > 0.05 ? 0 : 1;
          }
        }
      });

      // Tween 1: Frame sequence
      mainTimeline.to(airpodsRef.current, {
        frame: frameCount - 1,
        ease: 'none',
        duration: 100,
        onUpdate: () => {
          const currentImg = imagesRef.current[Math.round(airpodsRef.current.frame)];
          if (currentImg) drawCanvasFrame(currentImg);
        }
      }, 0);

      // Tween 2: Scene 1 Fade Out
      mainTimeline.to('#scene-1', {
        autoAlpha: 0,
        y: -50,
        filter: 'blur(10px)',
        duration: 6,
        ease: 'power2.inOut'
      }, 12);

      // Tween 3: Scene 2
      mainTimeline.to('#scene-2', {
        autoAlpha: 1,
        y: 0,
        x: 0,
        filter: 'blur(0px)',
        duration: 6,
        ease: 'power2.out'
      }, 21).to('#scene-2', {
        autoAlpha: 0,
        y: -50,
        filter: 'blur(10px)',
        duration: 6,
        ease: 'power2.in'
      }, 34);

      // Tween 4: Scene 3
      mainTimeline.to('#scene-3', {
        autoAlpha: 1,
        y: 0,
        x: 0,
        filter: 'blur(0px)',
        duration: 6,
        ease: 'power2.out'
      }, 42).to('#scene-3', {
        autoAlpha: 0,
        y: -50,
        filter: 'blur(10px)',
        duration: 6,
        ease: 'power2.in'
      }, 58);

      // Tween 5: Scene 4
      mainTimeline.to('#scene-4', {
        autoAlpha: 1,
        y: 0,
        x: 0,
        filter: 'blur(0px)',
        duration: 6,
        ease: 'power2.out'
      }, 66).to('#scene-4', {
        autoAlpha: 0,
        y: -50,
        filter: 'blur(10px)',
        duration: 6,
        ease: 'power2.in'
      }, 78);

      // Tween 6: Scene 5
      mainTimeline.to('#scene-5', {
        autoAlpha: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 7,
        ease: 'power2.out'
      }, 86);

      localScrollTrigger.refresh();
    };

    // Load GSAP & ScrollTrigger dynamically
    Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger')
    ]).then(([gsapModule, ScrollTriggerModule]) => {
      localGsap = gsapModule.default;
      localScrollTrigger = ScrollTriggerModule.ScrollTrigger;
      localGsap.registerPlugin(localScrollTrigger);
      gsapLoaded = true;
      checkAndInit();
    }).catch(err => console.error('Failed to dynamically load GSAP:', err));

    preloadImages();

    return () => {
      isComponentMounted = false;
      window.removeEventListener('resize', resizeCanvas);
      scene1Entrance?.kill();
      mainTimeline?.kill();
      navTrigger?.kill();
      containerRef.current?.classList.remove('scroll-fallback');
      if (localScrollTrigger && containerRef.current) {
        localScrollTrigger.getAll().forEach(trigger => {
          if (trigger.vars?.trigger === containerRef.current) trigger.kill();
        });
      }
    };
  }, []);

  return (
    <main className="home-page-main">
      {/* GSAP Scroll Animation Area */}
      <div id="hero-container" ref={containerRef}>
        <div className="sticky-wrapper">
          <canvas id="hero-canvas" ref={canvasRef}></canvas>
          <div className="cinematic-overlay"></div>

          <div className="scroll-indicator">
            <span className="scroll-text">Scroll to Explore</span>
            <div className="scroll-line">
              <div className="scroll-progress"></div>
            </div>
          </div>

          <div className="scenes-container">
            {/* Scene 1 */}
            <div id="scene-1" className="scene" style={{ display: 'flex' }}>
              <div className="scene-content text-center">
                <span className="eyebrow">{getCMSValue('index.html', '#scene-1 .eyebrow', 'Gourmet Selection')}</span>
                <h1 className="headline">{getCMSValue('index.html', '#scene-1 h1', 'The Gold Standard of Healthy Snacking.')}</h1>
                <p className="body-text">{getCMSValue('index.html', '#scene-1 p', 'Purity Crowned In Gold.')}</p>
              </div>
            </div>

            {/* Scene 2 */}
            <div id="scene-2" className="scene">
              <div className="scene-content text-left">
                <span className="eyebrow">{getCMSValue('index.html', '#scene-2 .eyebrow', 'Artisanal Craft')}</span>
                <h2 className="headline">{getCMSValue('index.html', '#scene-2 h2', 'Carefully Selected. Slowly Roasted.')}</h2>
                <p className="body-text">{getCMSValue('index.html', '#scene-2 p', 'Sourced from organic wetlands, handpicked and slow-roasted to preserve natural minerals.')}</p>
              </div>
            </div>

            {/* Scene 3 */}
            <div id="scene-3" className="scene">
              <div className="scene-content text-right">
                <span className="eyebrow">{getCMSValue('index.html', '#scene-3 .eyebrow', 'Indian Wellness')}</span>
                <h2 className="headline">{getCMSValue('index.html', '#scene-3 h2', 'Traditional Goodness for Modern Lifestyles.')}</h2>
                <p className="body-text">{getCMSValue('index.html', '#scene-3 p', 'Inspired by Indian healthy snacking habits and crafted for everyday nutrition.')}</p>
              </div>
            </div>

            {/* Scene 4 */}
            <div id="scene-4" className="scene">
              <div className="scene-content text-left">
                <span className="eyebrow">{getCMSValue('index.html', '#scene-4 .eyebrow', 'Pure Wellness')}</span>
                <h2 className="headline">{getCMSValue('index.html', '#scene-4 h2', 'Nourishment Made for Everyday Wellness.')}</h2>
                <p className="body-text">{getCMSValue('index.html', '#scene-4 p', 'Packed with antioxidants, high protein, and zero compromises on taste.')}</p>
              </div>
            </div>

            {/* Scene 5 */}
            <div id="scene-5" className="scene">
              <div className="scene-content text-center">
                <span className="eyebrow">{getCMSValue('index.html', '#scene-5 .eyebrow', 'Rein Oro Foods')}</span>
                <h2 className="headline">{getCMSValue('index.html', '#scene-5 h2', 'Purity Crowned in Gold.')}</h2>
                <p className="body-text">{getCMSValue('index.html', '#scene-5 p', 'Experience premium dry fruits and makhana prepared with purity, nutrition, and care.')}</p>
                <div className="cta-group">
                  <button className="btn btn-primary" onClick={() => navigate('/shop')}>Shop Collection</button>
                  <button className="btn btn-outline" onClick={() => navigate('/about')}>Our Story</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Bar */}
      <section className="features-bar">
        <div className="features-container">
          <div className="feature-item">
            <span className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="11" r="3"/></svg>
            </span>
            <div className="feature-text">
              <h4>100% Organic</h4>
              <p>Naturally grown and harvested</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>
            </span>
            <div className="feature-text">
              <h4>Gluten-Free</h4>
              <p>Ideal for wellness & purity</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            </span>
            <div className="feature-text">
              <h4>Quality Assured</h4>
              <p>Double-sorted premium grade</p>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Collection Grid */}
      <section className="signature-collection">
        <div className="section-header">
          <span className="section-subtitle">Exquisite Creations</span>
          <h2 className="section-title">Our Signature Collection</h2>
        </div>
        <div className="products-grid">
          {products.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <div className="section-cta">
          <button className="btn btn-outline" onClick={() => navigate('/shop')}>View All Products</button>
        </div>
      </section>

      {/* Gifting Banner */}
      <section className="gifting-promo" id="gifting-section">
        <div className="gifting-container">
          <div className="gifting-text-col">
            <h2 className="gifting-title">{getCMSValue('index.html', '.gifting-title', 'Bulk Orders & Corporate Gifting')}</h2>
            <p className="gifting-body">{getCMSValue('index.html', '.gifting-body', 'Looking for healthy gifting solutions for your employees, clients, events, or special occasions? Rein Oro Foods offers premium makhana and dry fruit gift packs customized for bulk orders and corporate gifting.')}</p>
            <button className="btn btn-primary" onClick={() => navigate('/contact')}>Send Inquiry</button>
          </div>
          <div className="gifting-image-col">
            <img src={getCMSValue('index.html', '.gift-box-img', 'images/gift_box.png')} alt="Rein Oro Foods makhana gift hamper for bulk orders and corporate gifting" className="gift-box-img" />
          </div>
        </div>
      </section>

      {/* Nature's Finest Roundels */}
      <section className="finest-craft">
        <div className="section-header">
          <span className="section-subtitle">Purity Standard</span>
          <h2 className="section-title">Crafted With Nature's Finest</h2>
        </div>
        <div className="craft-grid">
          <div className="craft-card">
            <div className="craft-img-wrapper">
              <img src={getCMSValue('index.html', '.craft-img-1', 'images/slow_roasted.png')} alt="Slow Roasted" className="craft-img" />
            </div>
            <h3 className="craft-name">Slow Roasted</h3>
            <p className="craft-desc">Dusted with clean pink Himalayan salt</p>
          </div>
          <div className="craft-card">
            <div className="craft-img-wrapper">
              <img src={getCMSValue('index.html', '.craft-img-2', 'images/no_preservatives.png')} alt="No Preservatives" className="craft-img" />
            </div>
            <h3 className="craft-name">No Preservatives</h3>
            <p className="craft-desc">100% natural processing, zero chemicals</p>
          </div>
          <div className="craft-card">
            <div className="craft-img-wrapper">
              <img src={getCMSValue('index.html', '.craft-img-3', 'images/hygienically_packed.png')} alt="Hygienically Packed" className="craft-img" />
            </div>
            <h3 className="craft-name">Hygienic Pack</h3>
            <p className="craft-desc">Double-sealed for crispness and flavor</p>
          </div>
          <div className="craft-card">
            <div className="craft-img-wrapper">
              <img src={getCMSValue('index.html', '.craft-img-4', 'images/finest_selection.png')} alt="Finest Selection" className="craft-img" />
            </div>
            <h3 className="craft-name">Finest Selection</h3>
            <p className="craft-desc">Uniform grade sorted for high crunch</p>
          </div>
        </div>
      </section>

      {/* Trust bar scrolling marquee */}
      <section className="trust-bar">
        <div className="trust-marquee-wrapper">
          <div className="trust-marquee-content">
            {[
              "100% Natural",
              "No Preservatives",
              "Cold-Pressed Oils",
              "Premium Grade A Makhana",
              "Lab Certified",
              "Free Shipping on ₹599+",
              "10,000+ Happy Customers",
              "Pan India Delivery"
            ].map((text, i) => (
              <span key={i} className="trust-marquee-item">
                <span className="trust-ornament">✦</span>
                {text}
              </span>
            ))}
            {[
              "100% Natural",
              "No Preservatives",
              "Cold-Pressed Oils",
              "Premium Grade A Makhana",
              "Lab Certified",
              "Free Shipping on ₹599+",
              "10,000+ Happy Customers",
              "Pan India Delivery"
            ].map((text, i) => (
              <span key={`dup-${i}`} className="trust-marquee-item">
                <span className="trust-ornament">✦</span>
                {text}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
