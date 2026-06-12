/* --------------------------------------------------
   REIN ORO LUXURY HERO EXPERIENCE ENGINE
   -------------------------------------------------- */

// Register ScrollTrigger plugin if GSAP is loaded
if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
 gsap.registerPlugin(ScrollTrigger);
} else {
 console.error(
  "GSAP or ScrollTrigger is not loaded. Scroll animations will not run.",
 );
}

// Configuration
const frameCount = 68;
const images = [];
const airpods = { frame: 0 };

// Preloader elements
let preloader;
let preloaderBar;
let preloaderPercent;
let preloaderStatus;

// Canvas elements
let canvas;
let context;

// Build frame path selector
// Frames exist in ./frames/ezgif-frame-001.jpg through ./frames/ezgif-frame-068.jpg
const getFramePath = (index) => {
 const paddedIndex = String(index + 1).padStart(3, "0");
 return `/frames/ezgif-frame-${paddedIndex}.jpg`;
};

// Initialize preloading strategy
let loadedImagesCount = 0;

function preloadImages() {
 if (preloaderStatus) {
  preloaderStatus.textContent = "Selecting ingredients...";
 }

 for (let i = 0; i < frameCount; i++) {
  const img = new Image();

  img.onload = () => {
   loadedImagesCount++;
   updateLoadingProgress();
  };

  img.onerror = () => {
   console.warn(`Failed to preload frame ${i + 1}`);
   loadedImagesCount++;
   updateLoadingProgress();
  };

  img.src = getFramePath(i);
  images.push(img);
 }
}

function updateLoadingProgress() {
 const progressPercent = Math.round((loadedImagesCount / frameCount) * 100);

 // Update DOM
 if (preloaderBar) preloaderBar.style.width = `${progressPercent}%`;
 if (preloaderPercent) preloaderPercent.textContent = `${progressPercent}%`;

 // Luxury progress commentary
 if (preloaderStatus) {
  if (progressPercent < 30) {
   preloaderStatus.textContent = "Selecting ingredients...";
  } else if (progressPercent < 60) {
   preloaderStatus.textContent = "Grading almonds & pistachios...";
  } else if (progressPercent < 90) {
   preloaderStatus.textContent = "Roasting with care...";
  } else {
   preloaderStatus.textContent = "Polishing gold accents...";
  }
 }

 if (loadedImagesCount === frameCount) {
  setTimeout(launchExperience, 600);
 }
}

// Aspect-ratio-aware centering containment drawing function
function drawCanvasFrame(img) {
 if (!img || !canvas || !context) return;

 const canvasW = canvas.width / window.devicePixelRatio;
 const canvasH = canvas.height / window.devicePixelRatio;

 context.fillStyle = "#050505";
 context.fillRect(0, 0, canvasW, canvasH);

 const imgW = img.width;
 const imgH = img.height;

 const scaleRatio = Math.min(canvasW / imgW, canvasH / imgH);

 const nw = imgW * scaleRatio;
 const nh = imgH * scaleRatio;

 const cx = (canvasW - nw) / 2;
 const cy = (canvasH - nh) / 2;

 context.drawImage(img, cx, cy, nw, nh);
}

// Draw current active index
function render() {
 if (!canvas || !context) return;
 const activeFrameIndex = Math.min(
  frameCount - 1,
  Math.max(0, Math.round(airpods.frame)),
 );
 const activeImage = images[activeFrameIndex];
 drawCanvasFrame(activeImage);
}

// Handle Retina-supported resize
function resizeCanvas() {
 if (!canvas || !context) return;
 const devicePixelRatio = window.devicePixelRatio || 1;

 canvas.width = window.innerWidth * devicePixelRatio;
 canvas.height = window.innerHeight * devicePixelRatio;

 canvas.style.width = `${window.innerWidth}px`;
 canvas.style.height = `${window.innerHeight}px`;

 context.scale(devicePixelRatio, devicePixelRatio);

 render();
}

// Master Experience Launch
function launchExperience() {
 if (preloader) {
  preloader.style.opacity = "0";
  preloader.style.pointerEvents = "none";
  setTimeout(() => {
   preloader.style.display = "none";
  }, 800);
 }

 resizeCanvas();
 window.addEventListener("resize", resizeCanvas);

 if (typeof gsap !== "undefined") {
  // Set initial states for scenes BEFORE building scroll animations
  gsap.set(["#scene-2", "#scene-3", "#scene-4", "#scene-5"], {
   autoAlpha: 0,
   y: 60,
   filter: "blur(15px)",
  });

  gsap.set("#scene-2", { x: -30 });
  gsap.set("#scene-3", { x: 30 });
  gsap.set("#scene-4", { x: -30 });

  // Initialize scene-1 with starting animation values
  gsap.set("#scene-1", { autoAlpha: 0, y: 50, filter: "blur(12px)" });
 }

 buildScrollAnimations();
 setupCartInteractions();
 setupProductCardLinks();

 if (typeof gsap !== "undefined") {
  gsap.fromTo(
   "#main-nav",
   { y: -30, opacity: 0 },
   { y: 0, opacity: 1, duration: 1.2, ease: "power4.out", delay: 0.2 },
  );

  // Only run scene 1 entrance animation if we are at the top of the page on load
  if (window.scrollY < 50) {
   window.scene1Entrance = gsap.to("#scene-1", {
    autoAlpha: 1,
    y: 0,
    filter: "blur(0px)",
    duration: 1.8,
    ease: "power3.out",
    delay: 0.4,
   });
  } else {
   // Otherwise, keep it hidden and let the scroll timeline control it
   gsap.set("#scene-1", { autoAlpha: 0, y: -50, filter: "blur(10px)" });
  }
 }
}

// Configure GSAP ScrollTrigger Sequence
function buildScrollAnimations() {
 if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
  console.warn(
   "GSAP / ScrollTrigger not loaded. Skipping scroll animation setup.",
  );
  return;
 }

 const heroContainer = document.getElementById("hero-container");
 if (!heroContainer) return;

 // Navigation scrolled class toggle
 ScrollTrigger.create({
  trigger: "#hero-container",
  start: "top+=40 top",
  onEnter: () => {
   const mainNav = document.getElementById("main-nav");
   if (mainNav) mainNav.classList.add("scrolled");
  },
  onLeaveBack: () => {
   const mainNav = document.getElementById("main-nav");
   if (mainNav) mainNav.classList.remove("scrolled");
  },
 });

 // Main scroll timeline
 const mainTimeline = gsap.timeline({
  scrollTrigger: {
   trigger: "#hero-container",
   start: "top top",
   end: "bottom bottom",
   scrub: 1.2,
   onUpdate: (self) => {
    // Kill standalone entrance animation if the user scrolls down
    if (self.progress > 0.01) {
     if (window.scene1Entrance) {
      window.scene1Entrance.kill();
      window.scene1Entrance = null;
     }
    } else if (self.progress === 0) {
     // Reset scene 1 to active state if scrolled back to very top
     gsap.set("#scene-1", {
      autoAlpha: 1,
      y: 0,
      filter: "blur(0px)",
      overwrite: "auto",
     });
    }

    gsap.to(".scroll-progress", {
     width: `${self.progress * 100}%`,
     duration: 0.1,
     overwrite: "auto",
    });

    if (self.progress > 0.05) {
     gsap.to(".scroll-indicator", { opacity: 0, duration: 0.5 });
    } else {
     gsap.to(".scroll-indicator", { opacity: 1, duration: 0.5 });
    }
   },
  },
 });

 // 1. Frame sequence animation tween
 mainTimeline.to(
  airpods,
  {
   frame: frameCount - 1,
   ease: "none",
   duration: 100,
   onUpdate: render,
  },
  0,
 );

 // 2. Scene 01 Fade Out
 mainTimeline.to(
  "#scene-1",
  {
   autoAlpha: 0,
   y: -50,
   filter: "blur(10px)",
   duration: 6,
   ease: "power2.inOut",
  },
  12,
 );

 // 3. Scene 02
 mainTimeline.to(
  "#scene-2",
  {
   autoAlpha: 1,
   y: 0,
   x: 0,
   filter: "blur(0px)",
   duration: 6,
   ease: "power2.out",
  },
  21,
 );

 mainTimeline.to(
  "#scene-2",
  {
   autoAlpha: 0,
   y: -50,
   filter: "blur(10px)",
   duration: 6,
   ease: "power2.in",
  },
  34,
 );

 // 4. Scene 03
 mainTimeline.to(
  "#scene-3",
  {
   autoAlpha: 1,
   y: 0,
   x: 0,
   filter: "blur(0px)",
   duration: 6,
   ease: "power2.out",
  },
  42,
 );

 mainTimeline.to(
  "#scene-3",
  {
   autoAlpha: 0,
   y: -50,
   filter: "blur(10px)",
   duration: 6,
   ease: "power2.in",
  },
  58,
 );

 // 5. Scene 04
 mainTimeline.to(
  "#scene-4",
  {
   autoAlpha: 1,
   y: 0,
   x: 0,
   filter: "blur(0px)",
   duration: 6,
   ease: "power2.out",
  },
  66,
 );

 mainTimeline.to(
  "#scene-4",
  {
   autoAlpha: 0,
   y: -50,
   filter: "blur(10px)",
   duration: 6,
   ease: "power2.in",
  },
  78,
 );

 // 6. Scene 05
 mainTimeline.to(
  "#scene-5",
  {
   autoAlpha: 1,
   y: 0,
   filter: "blur(0px)",
   duration: 7,
   ease: "power2.out",
  },
  86,
 );
}

// --------------------------------------------------
// LUXURY PERSISTENT CART STATE MANAGEMENT
// --------------------------------------------------
let cart = [];
let discountRate = 0.0;
let appliedPromoCode = "";

// Initialize cart state
function initCartState() {
 const savedCart = localStorage.getItem("rein_oro_cart");
 if (savedCart) {
  try {
   cart = JSON.parse(savedCart);
  } catch (e) {
   console.error("Error parsing cart storage:", e);
   cart = [];
  }
 } else {
  // Pre-populate cart to match mockup items on first visit
  cart = [
   {
    id: "almonds_california",
    name: "California Premium Almonds",
    flavor: "Almonds",
    price: 699,
    qty: 1,
    weight: "250g",
    image: "images/almonds_california.png",
   },
   {
    id: "cashews_roasted",
    name: "California Roasted & Salted Cashews",
    flavor: "Roasted & Salted Cashews",
    price: 749,
    qty: 1,
    weight: "200g",
    image: "images/cashews_roasted.png",
   },
   {
    id: "makhana_cheese_onion",
    name: "Makhana Cheese & Onion",
    flavor: "Cheese & Onion",
    price: 799,
    qty: 1,
    weight: "100g",
    image: "images/makhana_cheese_onion.png",
   },
  ];
  saveCartToStorage();
 }

 // Load promo code state
 const savedPromo = localStorage.getItem("rein_oro_promo");
 if (savedPromo) {
  appliedPromoCode = savedPromo;
  discountRate = 0.1; // 10% discount
 }
}

function saveCartToStorage() {
 localStorage.setItem("rein_oro_cart", JSON.stringify(cart));
}

function animateBagBadge() {
 const bagCountBadge = document.querySelector(".bag-count");
 if (bagCountBadge && typeof gsap !== "undefined") {
  gsap.fromTo(
   bagCountBadge,
   { scale: 0.5 },
   { scale: 1.3, duration: 0.15, yoyo: true, repeat: 1, ease: "power2.out" },
  );
 }
}

function openCartDrawer() {
 const drawer = document.getElementById("cart-drawer");
 const overlay = document.getElementById("cart-drawer-overlay");
 if (drawer && overlay) {
  drawer.classList.add("open");
  overlay.classList.add("open");
  document.body.style.overflow = "hidden"; // Prevent background scroll

  // Dynamic animation entry if GSAP is loaded
  if (typeof gsap !== "undefined") {
   gsap.fromTo(
    drawer,
    { x: "100%" },
    { x: "0%", duration: 0.5, ease: "power4.out" },
   );
   gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.4 });
  }
 }
}

function closeCartDrawer() {
 const drawer = document.getElementById("cart-drawer");
 const overlay = document.getElementById("cart-drawer-overlay");
 if (drawer && overlay) {
  if (typeof gsap !== "undefined") {
   gsap.to(drawer, {
    x: "100%",
    duration: 0.4,
    ease: "power3.in",
    onComplete: () => {
     drawer.classList.remove("open");
    },
   });
   gsap.to(overlay, {
    opacity: 0,
    duration: 0.3,
    onComplete: () => {
     overlay.classList.remove("open");
     document.body.style.overflow = "";
    },
   });
  } else {
   drawer.classList.remove("open");
   overlay.classList.remove("open");
   document.body.style.overflow = "";
  }
 }
}

function addToCart(productId, quantity) {
 const product = productDatabase[productId];
 if (!product) return;

 // Parse numeric price from "₹799"
 const priceNum = parseInt(product.price.replace(/[^\d]/g, "")) || 0;

 const existingIndex = cart.findIndex((item) => item.id === productId);
 if (existingIndex > -1) {
  cart[existingIndex].qty += quantity;
 } else {
  cart.push({
   id: productId,
   name: product.title,
   flavor: product.flavor,
   price: priceNum,
   qty: quantity,
   weight: product.weight,
   image: product.image,
  });
 }

 saveCartToStorage();
 renderCart();
 openCartDrawer();
 animateBagBadge();
}

function renderCart() {
 const itemsList = document.getElementById("cart-items-list");
 const emptyMessage = document.getElementById("cart-empty-message");
 const bagCountBadge = document.querySelector(".bag-count");
 const subtitleCount = document.getElementById("cart-subtitle-count");
 const summaryItemCount = document.getElementById("summary-item-count");

 // Totals elements
 const subtotalEl = document.getElementById("cart-summary-subtotal");
 const shippingEl = document.getElementById("cart-summary-shipping");
 const taxEl = document.getElementById("cart-summary-tax");
 const totalEl = document.getElementById("cart-summary-total");

 // Promo elements
 const discountRow = document.getElementById("discount-row");
 const discountEl = document.getElementById("cart-summary-discount");

 // Free shipping elements
 const trackerText = document.getElementById("shipping-tracker-text");
 const progressBar = document.getElementById("shipping-progress-bar");
 const progressTruck = document.getElementById("shipping-progress-truck");

 if (!itemsList) return;

 // Calculate total quantity and subtotal
 let totalQty = 0;
 let subtotal = 0;

 cart.forEach((item) => {
  totalQty += item.qty;
  subtotal += item.price * item.qty;
 });

 // Update count badges
 if (bagCountBadge) bagCountBadge.textContent = totalQty;
 if (subtitleCount) subtitleCount.textContent = totalQty;
 if (summaryItemCount) summaryItemCount.textContent = totalQty;

 // Handle empty state
 if (cart.length === 0) {
  if (emptyMessage) emptyMessage.style.display = "flex";
  itemsList.style.display = "none";

  // Reset prices to zero
  if (subtotalEl) subtotalEl.textContent = "₹0";
  if (shippingEl) shippingEl.textContent = "₹0";
  if (taxEl) taxEl.textContent = "₹0";
  if (totalEl) totalEl.textContent = "₹0";
  if (discountRow) discountRow.style.display = "none";

  // Reset progress bar
  if (trackerText)
   trackerText.innerHTML =
    "You are <strong>₹999</strong> away from FREE shipping!";
  if (progressBar) progressBar.style.width = "0%";
  if (progressTruck) progressTruck.style.left = "0%";

  return;
 }

 // Hide empty state
 if (emptyMessage) emptyMessage.style.display = "none";
 itemsList.style.display = "flex";

 // Render item cards
 itemsList.innerHTML = "";
 cart.forEach((item) => {
  const card = document.createElement("div");
  card.className = "cart-item-card";
  card.setAttribute("data-id", item.id);

  card.innerHTML = `
            <div class="cart-item-img-frame">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-info">
                <div>
                    <h4 class="cart-item-title">${item.name}</h4>
                    <p class="cart-item-flavor">${item.flavor} &bull; ${item.weight}</p>
                </div>
                <div class="cart-item-qty-row">
                    <div class="cart-item-qty-spinner">
                        <button class="cart-item-qty-btn dec-item-qty" aria-label="Decrease quantity">−</button>
                        <input type="text" class="cart-item-qty-input" value="${item.qty}" readonly>
                        <button class="cart-item-qty-btn inc-item-qty" aria-label="Increase quantity">+</button>
                    </div>
                    <span class="cart-item-price">₹${item.price * item.qty}</span>
                </div>
            </div>
            <button class="btn-remove-cart-item" aria-label="Remove item">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        `;
  itemsList.appendChild(card);
 });

 // Add event listeners to newly rendered items
 itemsList.querySelectorAll(".dec-item-qty").forEach((btn) => {
  btn.addEventListener("click", (e) => {
   const card = e.target.closest(".cart-item-card");
   const id = card.getAttribute("data-id");
   const item = cart.find((item) => item.id === id);
   if (item && item.qty > 1) {
    item.qty--;
    saveCartToStorage();
    renderCart();
   }
  });
 });

 itemsList.querySelectorAll(".inc-item-qty").forEach((btn) => {
  btn.addEventListener("click", (e) => {
   const card = e.target.closest(".cart-item-card");
   const id = card.getAttribute("data-id");
   const item = cart.find((item) => item.id === id);
   if (item) {
    item.qty++;
    saveCartToStorage();
    renderCart();
   }
  });
 });

 itemsList.querySelectorAll(".btn-remove-cart-item").forEach((btn) => {
  btn.addEventListener("click", (e) => {
   const card = e.target.closest(".cart-item-card");
   const id = card.getAttribute("data-id");

   // GSAP remove card animation if loaded
   if (typeof gsap !== "undefined") {
    gsap.to(card, {
     x: 50,
     opacity: 0,
     duration: 0.35,
     onComplete: () => {
      cart = cart.filter((item) => item.id !== id);
      saveCartToStorage();
      renderCart();
     },
    });
   } else {
    cart = cart.filter((item) => item.id !== id);
    saveCartToStorage();
    renderCart();
   }
  });
 });

 // Calculations
 let discount = 0;
 if (discountRate > 0) {
  discount = Math.round(subtotal * discountRate);
  if (discountRow) discountRow.style.display = "flex";
  if (discountEl) discountEl.textContent = `-₹${discount}`;
 } else {
  if (discountRow) discountRow.style.display = "none";
 }

 let shipping = 0;
 if (subtotal >= 999) {
  shipping = 0;
  if (shippingEl) shippingEl.textContent = "Free";
 } else {
  shipping = 99; // Flat ₹99 shipping
  if (shippingEl) shippingEl.textContent = `₹${shipping}`;
 }

 const subtotalAfterDiscount = subtotal - discount;
 const tax = Math.round(subtotalAfterDiscount * 0.18);
 const total = subtotalAfterDiscount + shipping + tax;

 if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
 if (taxEl) taxEl.textContent = `₹${tax}`;
 if (totalEl) totalEl.textContent = `₹${total}`;

 // Update Free Shipping Tracker
 const limit = 999;
 const diff = limit - subtotal;
 if (diff <= 0) {
  if (trackerText)
   trackerText.innerHTML = "You have unlocked <strong>FREE shipping!</strong>";
  if (progressBar) progressBar.style.width = "100%";
  if (progressTruck) progressTruck.style.left = "100%";
 } else {
  const percent = Math.min(100, Math.round((subtotal / limit) * 100));
  if (trackerText)
   trackerText.innerHTML = `You are <strong>₹${diff}</strong> away from FREE shipping!`;
  if (progressBar) progressBar.style.width = `${percent}%`;
  if (progressTruck) progressTruck.style.left = `${percent}%`;
 }

 // Update dedicated cart page if present
 if (document.getElementById("cart-page-rows-container")) {
  renderCartPage();
 }
}

function setupCartDrawerLogic() {
 // Backdrop / Close actions
 const closeBtn = document.getElementById("btn-close-drawer");
 const overlay = document.getElementById("cart-drawer-overlay");
 const bagBtns = document.querySelectorAll(".bag-btn");

 if (closeBtn) closeBtn.addEventListener("click", closeCartDrawer);
 if (overlay) overlay.addEventListener("click", closeCartDrawer);

 bagBtns.forEach((btn) => {
  btn.addEventListener("click", (e) => {
   e.preventDefault();
   e.stopPropagation();
   openCartDrawer();
  });
 });

 // Gift Note Toggle
 const giftToggle = document.getElementById("gift-note-toggle");
 const giftWrapper = document.getElementById("gift-note-input-wrapper");
 const giftText = document.getElementById("gift-note-text");

 if (giftToggle && giftWrapper) {
  giftToggle.addEventListener("click", () => {
   giftToggle.classList.toggle("active");
   giftWrapper.classList.toggle("open");
  });
 }

 // Save gift note state on change
 if (giftText) {
  const savedNote = localStorage.getItem("rein_oro_gift_note");
  if (savedNote) {
   giftText.value = savedNote;
   if (giftToggle && giftWrapper) {
    giftToggle.classList.add("active");
    giftWrapper.classList.add("open");
   }
  }
  giftText.addEventListener("input", () => {
   localStorage.setItem("rein_oro_gift_note", giftText.value);
  });
 }

 // Promo Apply
 const promoApplyBtn = document.getElementById("promo-apply-btn");
 const promoInput = document.getElementById("promo-code-input");
 const promoStatus = document.getElementById("promo-status-msg");

 if (promoApplyBtn && promoInput && promoStatus) {
  // If code already loaded
  if (appliedPromoCode) {
   promoInput.value = appliedPromoCode;
   promoStatus.textContent = `Promo code "${appliedPromoCode}" applied! (10% Off)`;
   promoStatus.className = "promo-status-msg success";
  }

  promoApplyBtn.addEventListener("click", () => {
   const code = promoInput.value.trim().toUpperCase();
   if (code === "GOLDEN" || code === "REIN10") {
    appliedPromoCode = code;
    discountRate = 0.1;
    localStorage.setItem("rein_oro_promo", code);
    promoStatus.textContent = `Promo code "${code}" applied successfully!`;
    promoStatus.className = "promo-status-msg success";
    renderCart();
   } else if (code === "") {
    appliedPromoCode = "";
    discountRate = 0.0;
    localStorage.removeItem("rein_oro_promo");
    promoStatus.textContent = "";
    renderCart();
   } else {
    promoStatus.textContent = "Invalid promo code. Try 'GOLDEN' or 'REIN10'";
    promoStatus.className = "promo-status-msg error";
   }
  });
 }

 // Drawer Checkout Redirects to Cart Page
 const checkoutBtn = document.getElementById("btn-proceed-checkout");
 if (checkoutBtn) {
  checkoutBtn.addEventListener("click", () => {
   window.location.href = "cart.html";
  });
 }
}

// Interactive shopping cart manager setup
function setupCartInteractions() {
 initCartState();
 setupCartDrawerLogic();
 renderCart();

 document.querySelectorAll(".quick-add-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
   e.preventDefault();
   e.stopPropagation();

   const card = btn.closest(".product-card");
   if (!card) return;

   let productId = card.getAttribute("data-product-id");

   // Fallback auto-detection if attribute is missing
   if (!productId) {
    const img = card.querySelector(".product-img");
    if (img) {
     const src = img.getAttribute("src") || "";
     if (src.includes("makhana_cheese_onion"))
      productId = "makhana_cheese_onion";
     else if (src.includes("makhana_classic")) productId = "makhana_classic";
     else if (src.includes("makhana_periperi")) productId = "makhana_periperi";
     else if (src.includes("makhana_himalayan"))
      productId = "makhana_himalayan";
     else if (src.includes("almonds_california"))
      productId = "almonds_california";
     else if (src.includes("cashews_roasted")) productId = "cashews_roasted";
     else if (src.includes("pistachios_roasted"))
      productId = "pistachios_roasted";
     else if (src.includes("raisins_premium")) productId = "raisins_premium";
     else if (src.includes("gift_box_premium")) productId = "gift_box_premium";
    }
   }

   if (productId) {
    addToCart(productId, 1);

    // Visual effect on the quick add button
    if (typeof gsap !== "undefined") {
     gsap.fromTo(
      btn,
      { scale: 1 },
      {
       scale: 0.82,
       duration: 0.1,
       yoyo: true,
       repeat: 1,
       ease: "power1.inOut",
      },
     );
    }
   }
  });
 });

 // Bind Account button redirects
 document.querySelectorAll('button[aria-label="Account"]').forEach((btn) => {
  btn.style.cursor = "pointer";
  btn.addEventListener("click", (e) => {
   e.preventDefault();
   e.stopPropagation();
   if (localStorage.getItem("rein_oro_user_logged_in") === "true") {
    window.location.href = "dashboard.html";
   } else {
    window.location.href = "login.html";
   }
  });
 });
}

// --------------------------------------------------
// DEDICATED CART PAGE RENDERING & INTERACTION (CART.HTML)
// --------------------------------------------------
function renderCartPage() {
 const rowsContainer = document.getElementById("cart-page-rows-container");
 if (!rowsContainer) return;

 const emptyMessage = document.getElementById("cart-page-empty-message");
 const tableHeader = document.querySelector(".cart-table-columns-header");
 const footerActions = document.querySelector(".cart-page-footer-actions");

 // Page header counts
 const titleCountEl = document.getElementById("cart-page-title-count");
 const summaryCountEl = document.getElementById("cart-page-summary-count");

 // Summary values
 const subtotalEl = document.getElementById("cart-page-subtotal");
 const discountRow = document.getElementById("cart-page-discount-row");
 const discountEl = document.getElementById("cart-page-discount");
 const shippingEl = document.getElementById("cart-page-shipping");
 const taxEl = document.getElementById("cart-page-tax");
 const totalEl = document.getElementById("cart-page-total");

 // Free shipping tracker
 const trackerText = document.getElementById("cart-page-shipping-text");
 const progressBar = document.getElementById("cart-page-shipping-bar");
 const progressTruck = document.getElementById("cart-page-shipping-truck");

 let totalQty = 0;
 let subtotal = 0;

 cart.forEach((item) => {
  totalQty += item.qty;
  subtotal += item.price * item.qty;
 });

 if (titleCountEl) titleCountEl.textContent = totalQty;
 if (summaryCountEl) summaryCountEl.textContent = totalQty;

 if (cart.length === 0) {
  if (emptyMessage) emptyMessage.style.display = "flex";
  if (tableHeader) tableHeader.style.display = "none";
  if (rowsContainer) rowsContainer.style.display = "none";
  if (footerActions) footerActions.style.display = "none";

  if (subtotalEl) subtotalEl.textContent = "₹0";
  if (discountRow) discountRow.style.display = "none";
  if (shippingEl) shippingEl.textContent = "₹0";
  if (taxEl) taxEl.textContent = "₹0";
  if (totalEl) totalEl.textContent = "₹0";

  if (trackerText)
   trackerText.innerHTML =
    "You are <strong>₹999</strong> away from FREE shipping!";
  if (progressBar) progressBar.style.width = "0%";
  if (progressTruck) progressTruck.style.left = "0%";

  return;
 }

 if (emptyMessage) emptyMessage.style.display = "none";
 if (tableHeader) tableHeader.style.display = "grid";
 if (rowsContainer) rowsContainer.style.display = "block";
 if (footerActions) footerActions.style.display = "flex";

 rowsContainer.innerHTML = "";

 cart.forEach((item) => {
  const dbProduct = productDatabase[item.id] || {};
  const benefits = dbProduct.benefits || [];

  const row = document.createElement("div");
  row.className = "cart-page-item-row";
  row.setAttribute("data-id", item.id);

  row.innerHTML = `
            <div class="cart-page-item-product">
                <div class="cart-page-item-img-frame">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-page-item-details">
                    <h4 class="cart-page-item-title">${item.name}</h4>
                    <p class="cart-page-item-flavor">${item.flavor} &bull; ${item.weight}</p>
                    <div class="cart-page-item-stock">
                        <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="currentColor" style="color: #10b981; margin-right: 4px;"><circle cx="12" cy="12" r="10"/></svg>
                        In Stock
                    </div>
                    <div class="cart-page-item-badges">
                        ${benefits
                         .slice(0, 2)
                         .map(
                          (b) =>
                           `<span class="cart-page-item-badge">${b}</span>`,
                         )
                         .join("")}
                    </div>
                    <button class="btn-page-remove-item-text" aria-label="Remove item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        Remove
                    </button>
                </div>
            </div>
            <div class="cart-page-item-price">
                ₹${item.price}
            </div>
            <div class="cart-page-item-qty-col">
                <div class="cart-page-qty-spinner">
                    <button class="cart-page-qty-btn dec-page-item-qty" aria-label="Decrease quantity">−</button>
                    <input type="text" class="cart-page-qty-input" value="${item.qty}" readonly>
                    <button class="cart-page-qty-btn inc-page-item-qty" aria-label="Increase quantity">+</button>
                </div>
                <span class="wishlist-link">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                    Move to Wishlist
                </span>
            </div>
            <div class="cart-page-item-total">
                <span>₹${item.price * item.qty}</span>
                <button class="btn-page-remove-item-cross" aria-label="Remove item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
        `;

  rowsContainer.appendChild(row);
 });

 // Bind click events for quantity updates
 rowsContainer.querySelectorAll(".dec-page-item-qty").forEach((btn) => {
  btn.addEventListener("click", (e) => {
   const row = e.target.closest(".cart-page-item-row");
   const id = row.getAttribute("data-id");
   const item = cart.find((i) => i.id === id);
   if (item && item.qty > 1) {
    item.qty--;
    saveCartToStorage();
    renderCart();
   }
  });
 });

 rowsContainer.querySelectorAll(".inc-page-item-qty").forEach((btn) => {
  btn.addEventListener("click", (e) => {
   const row = e.target.closest(".cart-page-item-row");
   const id = row.getAttribute("data-id");
   const item = cart.find((i) => i.id === id);
   if (item) {
    item.qty++;
    saveCartToStorage();
    renderCart();
   }
  });
 });

 // Bind remove button events
 const removeHandler = (btn) => {
  const row = btn.closest(".cart-page-item-row");
  const id = row.getAttribute("data-id");
  if (typeof gsap !== "undefined") {
   gsap.to(row, {
    x: 50,
    opacity: 0,
    duration: 0.35,
    onComplete: () => {
     cart = cart.filter((i) => i.id !== id);
     saveCartToStorage();
     renderCart();
    },
   });
  } else {
   cart = cart.filter((i) => i.id !== id);
   saveCartToStorage();
   renderCart();
  }
 };

 rowsContainer.querySelectorAll(".btn-page-remove-item-text").forEach((btn) => {
  btn.addEventListener("click", () => removeHandler(btn));
 });

 rowsContainer
  .querySelectorAll(".btn-page-remove-item-cross")
  .forEach((btn) => {
   btn.addEventListener("click", () => removeHandler(btn));
  });

 // Bind wishlist buttons
 rowsContainer.querySelectorAll(".wishlist-link").forEach((btn) => {
  btn.addEventListener("click", (e) => {
   const row = e.target.closest(".cart-page-item-row");
   const id = row.getAttribute("data-id");
   alert("Added to wishlist!");
   if (typeof gsap !== "undefined") {
    gsap.to(row, {
     y: -20,
     opacity: 0,
     duration: 0.3,
     onComplete: () => {
      cart = cart.filter((i) => i.id !== id);
      saveCartToStorage();
      renderCart();
     },
    });
   } else {
    cart = cart.filter((i) => i.id !== id);
    saveCartToStorage();
    renderCart();
   }
  });
 });

 // Totals calculations
 let discount = 0;
 if (discountRate > 0) {
  discount = Math.round(subtotal * discountRate);
  if (discountRow) discountRow.style.display = "flex";
  if (discountEl) discountEl.textContent = `-₹${discount}`;
 } else {
  if (discountRow) discountRow.style.display = "none";
 }

 let shipping = 0;
 if (subtotal >= 999) {
  shipping = 0;
  if (shippingEl) shippingEl.textContent = "Free";
 } else {
  shipping = 99;
  if (shippingEl) shippingEl.textContent = `₹${shipping}`;
 }

 const subtotalAfterDiscount = subtotal - discount;
 const tax = Math.round(subtotalAfterDiscount * 0.18);
 const total = subtotalAfterDiscount + shipping + tax;

 if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
 if (taxEl) taxEl.textContent = `₹${tax}`;
 if (totalEl) totalEl.textContent = `₹${total}`;

 // Free shipping tracker on page
 const limit = 999;
 const diff = limit - subtotal;
 if (diff <= 0) {
  if (trackerText)
   trackerText.innerHTML = "You have unlocked <strong>FREE shipping!</strong>";
  if (progressBar) progressBar.style.width = "100%";
  if (progressTruck) progressTruck.style.left = "100%";
 } else {
  const percent = Math.min(100, Math.round((subtotal / limit) * 100));
  if (trackerText)
   trackerText.innerHTML = `You are <strong>₹${diff}</strong> away from FREE shipping!`;
  if (progressBar) progressBar.style.width = `${percent}%`;
  if (progressTruck) progressTruck.style.left = `${percent}%`;
 }
}

function setupCartPage() {
 const rowsContainer = document.getElementById("cart-page-rows-container");
 if (!rowsContainer) return;

 // Bind Clear Cart
 const clearCartBtn = document.getElementById("btn-clear-cart");
 if (clearCartBtn) {
  clearCartBtn.addEventListener("click", () => {
   if (confirm("Are you sure you want to clear your cart?")) {
    cart = [];
    discountRate = 0.0;
    appliedPromoCode = "";
    localStorage.removeItem("rein_oro_cart");
    localStorage.removeItem("rein_oro_promo");
    renderCart();
   }
  });
 }

 // Bind Checkout Redirect
 const checkoutBtn = document.getElementById("btn-cart-page-checkout");
 if (checkoutBtn) {
  checkoutBtn.addEventListener("click", () => {
   window.location.href = "checkout.html";
  });
 }

 // Initial page render
 renderCartPage();
}

// --------------------------------------------------
// DEDICATED CHECKOUT PAGE RENDERING & INTERACTION (CHECKOUT.HTML)
// --------------------------------------------------
function renderCheckoutSummary() {
 const itemsList = document.getElementById("checkout-summary-items-list");
 if (!itemsList) return;

 const itemsCountEl = document.getElementById("checkout-summary-items-count");

 // Summary values
 const subtotalEl = document.getElementById("checkout-subtotal");
 const discountRow = document.getElementById("checkout-discount-row");
 const discountEl = document.getElementById("checkout-discount");
 const shippingEl = document.getElementById("checkout-shipping");
 const taxEl = document.getElementById("checkout-tax");
 const codRow = document.getElementById("checkout-cod-row");
 const totalEl = document.getElementById("checkout-total");

 let totalQty = 0;
 let subtotal = 0;

 cart.forEach((item) => {
  totalQty += item.qty;
  subtotal += item.price * item.qty;
 });

 if (itemsCountEl) itemsCountEl.textContent = totalQty;

 // Redirect if cart is empty
 if (cart.length === 0) {
  window.location.href = "cart.html";
  return;
 }

 // Render item cards
 let html = "";
 cart.forEach((item) => {
  html += `
            <div class="checkout-summary-item-card">
                <div class="checkout-summary-item-img">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="checkout-summary-item-info">
                    <h4 class="checkout-summary-item-name">${item.name}</h4>
                    <p class="checkout-summary-item-flavor">${item.flavor} &bull; ${item.weight}</p>
                    <div class="checkout-summary-item-qty">Qty: ${item.qty}</div>
                </div>
                <div class="checkout-summary-item-price">₹${item.price * item.qty}</div>
            </div>
        `;
 });
 itemsList.innerHTML = html;

 // Delivery Method
 let shipping = 0;
 const deliveryMethodEl = document.querySelector(
  'input[name="deliveryMethod"]:checked',
 );
 const delivery = deliveryMethodEl ? deliveryMethodEl.value : "standard";

 if (delivery === "standard") {
  if (subtotal >= 999) {
   shipping = 0;
   if (shippingEl) shippingEl.textContent = "FREE";
  } else {
   shipping = 99;
   if (shippingEl) shippingEl.textContent = `₹${shipping}`;
  }
 } else {
  // Express Shipping
  shipping = 149;
  if (shippingEl) shippingEl.textContent = `₹${shipping}`;
 }

 // Payment Method (COD Fee)
 let codFee = 0;
 const paymentMethodEl = document.querySelector(
  'input[name="paymentMethod"]:checked',
 );
 const payment = paymentMethodEl ? paymentMethodEl.value : "upi";

 if (payment === "cod") {
  codFee = 49;
  if (codRow) codRow.style.display = "flex";
 } else {
  codFee = 0;
  if (codRow) codRow.style.display = "none";
 }

 // Promo Discount
 let discount = 0;
 if (discountRate > 0) {
  discount = Math.round(subtotal * discountRate);
  if (discountRow) discountRow.style.display = "flex";
  if (discountEl) discountEl.textContent = `-₹${discount}`;
 } else {
  if (discountRow) discountRow.style.display = "none";
 }

 const subtotalAfterDiscount = subtotal - discount;
 const tax = Math.round(subtotalAfterDiscount * 0.18);
 const total = subtotalAfterDiscount + shipping + tax + codFee;

 if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
 if (taxEl) taxEl.textContent = `₹${tax}`;
 if (totalEl) totalEl.textContent = `₹${total}`;
}

function setupCheckoutPage() {
 const form = document.getElementById("checkout-form");
 if (!form) return;

 // Dynamic Standard Shipping Label
 const standardPriceEl = document.getElementById("checkout-standard-price");
 if (standardPriceEl) {
  let subtotal = 0;
  cart.forEach((item) => {
   subtotal += item.price * item.qty;
  });
  if (subtotal >= 999) {
   standardPriceEl.textContent = "FREE";
  } else {
   standardPriceEl.textContent = "₹99";
  }
 }

 // Bind Delivery Method selection cards toggle
 document.querySelectorAll('input[name="deliveryMethod"]').forEach((radio) => {
  if (radio.checked) {
   radio.closest(".delivery-select-card").classList.add("active");
  }
  radio.addEventListener("change", () => {
   document
    .querySelectorAll(".delivery-select-card")
    .forEach((card) => card.classList.remove("active"));
   radio.closest(".delivery-select-card").classList.add("active");
   renderCheckoutSummary();
  });
 });

 // Bind Payment Method selection cards toggle
 document.querySelectorAll('input[name="paymentMethod"]').forEach((radio) => {
  if (radio.checked) {
   radio.closest(".payment-select-card").classList.add("active");
  }
  radio.addEventListener("change", () => {
   document
    .querySelectorAll(".payment-select-card")
    .forEach((card) => card.classList.remove("active"));
   radio.closest(".payment-select-card").classList.add("active");
   renderCheckoutSummary();
  });
 });

 // Pre-populate saved address
 const savedAddress = localStorage.getItem("rein_oro_checkout_address");
 if (savedAddress) {
  try {
   const addr = JSON.parse(savedAddress);
   if (document.getElementById("fullName"))
    document.getElementById("fullName").value = addr.fullName || "";
   if (document.getElementById("phoneNumber"))
    document.getElementById("phoneNumber").value = addr.phoneNumber || "";
   if (document.getElementById("emailAddress"))
    document.getElementById("emailAddress").value = addr.emailAddress || "";
   if (document.getElementById("address"))
    document.getElementById("address").value = addr.address || "";
   if (document.getElementById("apartment"))
    document.getElementById("apartment").value = addr.apartment || "";
   if (document.getElementById("city"))
    document.getElementById("city").value = addr.city || "";
   if (document.getElementById("state"))
    document.getElementById("state").value = addr.state || "";
   if (document.getElementById("pinCode"))
    document.getElementById("pinCode").value = addr.pinCode || "";
   if (document.getElementById("saveAddress"))
    document.getElementById("saveAddress").checked = true;
  } catch (e) {
   console.error("Error pre-populating saved address data:", e);
  }
 }

 // Bind Promo Code apply in checkout sidebar
 const promoBtn = document.getElementById("checkout-promo-apply-btn");
 const promoInput = document.getElementById("checkout-promo-input");
 const promoStatus = document.getElementById("checkout-promo-status-msg");

 if (promoBtn && promoInput && promoStatus) {
  if (appliedPromoCode) {
   promoInput.value = appliedPromoCode;
   promoStatus.textContent = `Promo code "${appliedPromoCode}" applied! (10% Off)`;
   promoStatus.className = "promo-status-msg success";
  }

  promoBtn.addEventListener("click", () => {
   const code = promoInput.value.trim().toUpperCase();
   if (code === "GOLDEN" || code === "REIN10") {
    appliedPromoCode = code;
    discountRate = 0.1;
    localStorage.setItem("rein_oro_promo", code);
    promoStatus.textContent = `Promo code "${code}" applied successfully!`;
    promoStatus.className = "promo-status-msg success";
    renderCheckoutSummary();
    renderCart(); // keep side drawer synchronized
   } else if (code === "") {
    appliedPromoCode = "";
    discountRate = 0.0;
    localStorage.removeItem("rein_oro_promo");
    promoStatus.textContent = "";
    renderCheckoutSummary();
    renderCart();
   } else {
    promoStatus.textContent = "Invalid promo code. Try 'GOLDEN' or 'REIN10'";
    promoStatus.className = "promo-status-msg error";
   }
  });
 }

 // Form validation and simulated checkout submission
 form.addEventListener("submit", (e) => {
  e.preventDefault();

  let isValid = true;

  // Reset validation classes
  form
   .querySelectorAll(".form-input")
   .forEach((inp) => inp.classList.remove("is-invalid"));
  const termsGroup = form.querySelector(".checkout-terms-agreement");
  if (termsGroup) termsGroup.classList.remove("is-invalid");

  // Validate required fields
  const requiredFields = [
   "fullName",
   "phoneNumber",
   "emailAddress",
   "address",
   "city",
   "state",
   "pinCode",
  ];
  requiredFields.forEach((id) => {
   const el = document.getElementById(id);
   if (!el || !el.value.trim()) {
    if (el) el.classList.add("is-invalid");
    isValid = false;
   }
  });

  // Phone validation
  const phone = document.getElementById("phoneNumber");
  if (
   phone &&
   phone.value.trim() &&
   !/^[+0-9\s-]{10,15}$/.test(phone.value.trim())
  ) {
   phone.classList.add("is-invalid");
   isValid = false;
  }

  // Email validation
  const email = document.getElementById("emailAddress");
  if (
   email &&
   email.value.trim() &&
   !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())
  ) {
   email.classList.add("is-invalid");
   isValid = false;
  }

  // PIN code validation (6 digits)
  const pin = document.getElementById("pinCode");
  if (pin && pin.value.trim() && !/^\d{6}$/.test(pin.value.trim())) {
   pin.classList.add("is-invalid");
   isValid = false;
  }

  // Agree terms validation
  const agree = document.getElementById("agreeTerms");
  if (agree && !agree.checked) {
   if (termsGroup) termsGroup.classList.add("is-invalid");
   isValid = false;
  }

  if (!isValid) {
   const firstError = form.querySelector(".is-invalid");
   if (firstError) {
    firstError.scrollIntoView({ behavior: "smooth", block: "center" });
   }
   return;
  }

  // Save Address selection
  const saveAddressChecked = document.getElementById("saveAddress")
   ? document.getElementById("saveAddress").checked
   : false;
  if (saveAddressChecked) {
   const addressData = {
    fullName: document.getElementById("fullName").value.trim(),
    phoneNumber: document.getElementById("phoneNumber").value.trim(),
    emailAddress: document.getElementById("emailAddress").value.trim(),
    address: document.getElementById("address").value.trim(),
    apartment: document.getElementById("apartment")
     ? document.getElementById("apartment").value.trim()
     : "",
    city: document.getElementById("city").value.trim(),
    state: document.getElementById("state").value || "",
    pinCode: document.getElementById("pinCode").value.trim(),
   };
   localStorage.setItem(
    "rein_oro_checkout_address",
    JSON.stringify(addressData),
   );
  } else {
   localStorage.removeItem("rein_oro_checkout_address");
  }

  // Submit simulated order
  const placeOrderBtn = document.getElementById("btn-place-order");
  if (placeOrderBtn) {
   placeOrderBtn.innerHTML = `
                <svg class="spinner-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite; margin-right: 8px;"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
                Processing Order...
            `;
   placeOrderBtn.disabled = true;

   form
    .querySelectorAll(
     ".form-input, input[type='radio'], input[type='checkbox']",
    )
    .forEach((control) => {
     control.disabled = true;
    });

   setTimeout(() => {
    const orderId = "RO-" + Math.floor(100000 + Math.random() * 900000);

    // Formulate order details
    const now = new Date();
    const months = [
     "Jan",
     "Feb",
     "Mar",
     "Apr",
     "May",
     "Jun",
     "Jul",
     "Aug",
     "Sep",
     "Oct",
     "Nov",
     "Dec",
    ];
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedDate = `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;

    // Estimated delivery: 4 to 6 days from now
    const deliveryStart = new Date();
    deliveryStart.setDate(now.getDate() + 4);
    const deliveryEnd = new Date();
    deliveryEnd.setDate(now.getDate() + 6);

    const startDay = deliveryStart.getDate();
    const startMonth = months[deliveryStart.getMonth()];
    const startYear = deliveryStart.getFullYear();
    const endDay = deliveryEnd.getDate();
    const endMonth = months[deliveryEnd.getMonth()];

    let formattedDelivery = "";
    if (startMonth === endMonth) {
     formattedDelivery = `${startDay} - ${endDay} ${startMonth} ${startYear}`;
    } else {
     formattedDelivery = `${startDay} ${startMonth} - ${endDay} ${endMonth} ${startYear}`;
    }

    // Payment Method name mapping
    const rawPayment = document.querySelector(
     'input[name="paymentMethod"]:checked',
    ).value;
    let paymentMethodName = "Paid Online";
    if (rawPayment === "upi") paymentMethodName = "Paid Online (UPI)";
    else if (rawPayment === "card") paymentMethodName = "Paid Online (Card)";
    else if (rawPayment === "netbanking") paymentMethodName = "Net Banking";
    else if (rawPayment === "wallets")
     paymentMethodName = "Wallets (Paytm/Amazon Pay)";
    else if (rawPayment === "cod") paymentMethodName = "Cash on Delivery (COD)";

    // Calculations tally
    let subtotal = 0;
    cart.forEach((item) => {
     subtotal += item.price * item.qty;
    });

    let discount = 0;
    if (discountRate > 0) {
     discount = Math.round(subtotal * discountRate);
    }

    let shipping = 0;
    const rawDelivery = document.querySelector(
     'input[name="deliveryMethod"]:checked',
    ).value;
    if (rawDelivery === "standard") {
     shipping = subtotal >= 999 ? 0 : 99;
    } else {
     shipping = 149;
    }

    let codFee = rawPayment === "cod" ? 49 : 0;
    const subtotalAfterDiscount = subtotal - discount;
    const tax = Math.round(subtotalAfterDiscount * 0.18);
    const total = subtotalAfterDiscount + shipping + tax + codFee;

    const lastOrder = {
     orderId: orderId,
     date: formattedDate,
     estDelivery: formattedDelivery,
     paymentMethod: paymentMethodName,
     items: [...cart],
     subtotal: subtotal,
     discount: discount,
     shipping: shipping,
     tax: tax,
     codFee: codFee,
     total: total,
    };

    // Save to localStorage
    localStorage.setItem("rein_oro_last_order", JSON.stringify(lastOrder));

    // Clear cart in storage
    cart = [];
    discountRate = 0.0;
    appliedPromoCode = "";
    localStorage.removeItem("rein_oro_cart");
    localStorage.removeItem("rein_oro_promo");
    localStorage.removeItem("rein_oro_gift_note");

    renderCart();

    // Redirect to confirmation page
    window.location.href = "confirmation.html";
   }, 2000);
  }
 });

 // Initial summary rendering
 renderCheckoutSummary();
}

function setupConfirmationPage() {
 const orderIdEl = document.getElementById("conf-order-id");
 if (!orderIdEl) return;

 // Retrieve last order details
 const lastOrderData = localStorage.getItem("rein_oro_last_order");
 if (!lastOrderData) {
  window.location.href = "index.html";
  return;
 }

 try {
  const order = JSON.parse(lastOrderData);

  // Populate Order details
  orderIdEl.textContent = order.orderId;

  const dateEl = document.getElementById("conf-order-date");
  if (dateEl) dateEl.textContent = order.date;

  const deliveryEl = document.getElementById("conf-order-delivery");
  if (deliveryEl) deliveryEl.textContent = order.estDelivery;

  const paymentEl = document.getElementById("conf-order-payment");
  if (paymentEl) paymentEl.textContent = order.paymentMethod;

  // Populate purchased items
  const itemsList = document.getElementById("conf-summary-items-list");
  if (itemsList) {
   let html = "";
   order.items.forEach((item) => {
    html += `
                    <div class="checkout-summary-item-card">
                        <div class="checkout-summary-item-img">
                            <img src="${item.image}" alt="${item.name}">
                        </div>
                        <div class="checkout-summary-item-info">
                            <h4 class="checkout-summary-item-name">${item.name}</h4>
                            <p class="checkout-summary-item-flavor">${item.flavor} &bull; ${item.weight}</p>
                            <div class="checkout-summary-item-qty">Qty: ${item.qty}</div>
                        </div>
                        <div class="checkout-summary-item-price">₹${item.price * item.qty}</div>
                    </div>
                `;
   });
   itemsList.innerHTML = html;
  }

  // Cost Breakdown values
  const subtotalEl = document.getElementById("conf-subtotal");
  if (subtotalEl) subtotalEl.textContent = `₹${order.subtotal}`;

  const discountRow = document.getElementById("conf-discount-row");
  const discountEl = document.getElementById("conf-discount");
  if (order.discount > 0) {
   if (discountRow) discountRow.style.display = "flex";
   if (discountEl) discountEl.textContent = `-₹${order.discount}`;
  } else {
   if (discountRow) discountRow.style.display = "none";
  }

  const shippingEl = document.getElementById("conf-shipping");
  if (shippingEl) {
   shippingEl.textContent =
    order.shipping === 0 ? "Free" : `₹${order.shipping}`;
  }

  const taxEl = document.getElementById("conf-tax");
  if (taxEl) taxEl.textContent = `₹${order.tax}`;

  const codRow = document.getElementById("conf-cod-row");
  if (order.codFee > 0) {
   if (codRow) codRow.style.display = "flex";
  } else {
   if (codRow) codRow.style.display = "none";
  }

  const totalEl = document.getElementById("conf-total");
  if (totalEl) totalEl.textContent = `₹${order.total}`;
 } catch (e) {
  console.error("Error parsing order confirmation data:", e);
  window.location.href = "index.html";
 }
}

// --------------------------------------------------
// DEDICATED LOGIN PAGE (LOGIN.HTML)
// --------------------------------------------------
function setupLoginPage() {
 const form = document.getElementById("login-page-form");
 if (!form) return;

 // Toggle Password Visibility
 const passwordInput = document.getElementById("login-password");
 const toggleBtn = document.getElementById("btn-toggle-password");
 const eyeOpen = document.getElementById("eye-icon-open");
 const eyeClosed = document.getElementById("eye-icon-closed");

 if (toggleBtn && passwordInput && eyeOpen && eyeClosed) {
  toggleBtn.addEventListener("click", () => {
   if (passwordInput.type === "password") {
    passwordInput.type = "text";
    eyeOpen.style.display = "none";
    eyeClosed.style.display = "block";
   } else {
    passwordInput.type = "password";
    eyeOpen.style.display = "block";
    eyeClosed.style.display = "none";
   }
  });
 }

 // Forgot Password simulation
 const forgotLink = document.getElementById("link-forgot-password");
 if (forgotLink) {
  forgotLink.addEventListener("click", (e) => {
   e.preventDefault();
   const emailInput = document.getElementById("login-email");
   const email = emailInput ? emailInput.value.trim() : "";
   if (email) {
    alert(`A password reset link has been simulated and sent to: ${email}`);
   } else {
    const enteredEmail = prompt(
     "Please enter your registered email address to receive a reset link:",
    );
    if (enteredEmail && enteredEmail.trim()) {
     alert(
      `A password reset link has been simulated and sent to: ${enteredEmail.trim()}`,
     );
    }
   }
  });
 }

 // Create Account simulation
 const createLink = document.getElementById("link-create-account");
 if (createLink) {
  createLink.addEventListener("click", (e) => {
   e.preventDefault();
   alert(
    "Account creation is simulated. In a production environment, this would redirect to a registration page.",
   );
  });
 }

 // OTP Login simulation
 const otpBtn = document.getElementById("btn-otp-login");
 if (otpBtn) {
  otpBtn.addEventListener("click", () => {
   const mobile = prompt(
    "Enter your mobile number to receive a one-time passcode:",
   );
   if (mobile) {
    if (!/^[+0-9\s-]{10,15}$/.test(mobile.trim())) {
     alert("Please enter a valid mobile number.");
     return;
    }
    alert(`A simulated 6-digit OTP code has been sent to ${mobile.trim()}.`);
    const code = prompt("Enter the 6-digit OTP sent to your phone:");
    if (code) {
     if (code.trim().length === 6) {
      localStorage.setItem("rein_oro_user_logged_in", "true");
      localStorage.setItem("rein_oro_user_email", "royal.guest@reinoro.com");
      alert(
       "Simulated authentication successful! Welcome to the Royal Circle.",
      );
      window.location.href = "index.html";
     } else {
      alert("Invalid OTP length. Code must be 6 digits.");
     }
    }
   }
  });
 }

 // Standard Credentials Form Submission
 const submitBtn = document.getElementById("btn-login-submit");
 form.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value.trim();
  const pass = passwordInput ? passwordInput.value.trim() : "";

  if (!email || !pass) return;

  if (submitBtn) {
   submitBtn.innerHTML = `
                <svg class="spinner-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
                Verifying Credentials...
            `;
   submitBtn.disabled = true;
  }

  form.querySelectorAll("input, button").forEach((el) => (el.disabled = true));

  setTimeout(() => {
   localStorage.setItem("rein_oro_user_logged_in", "true");
   localStorage.setItem("rein_oro_user_email", email);
   alert(`Simulated Login Successful!\nWelcome back, ${email}`);
   window.location.href = "index.html";
  }, 1500);
 });
}

// --------------------------------------------------
// DEDICATED USER DASHBOARD (DASHBOARD.HTML)
// --------------------------------------------------
function setupDashboardPage() {
 const welcomeNameEl = document.getElementById("dashboard-user-name");
 if (!welcomeNameEl) return;

 // Route Guard: Redirect to login.html if not logged in
 if (localStorage.getItem("rein_oro_user_logged_in") !== "true") {
  window.location.href = "login.html";
  return;
 }

 // Set dynamic username based on storage email prefix
 const email = localStorage.getItem("rein_oro_user_email");
 if (email) {
  const prefix = email.split("@")[0];
  const formattedName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
  welcomeNameEl.textContent = formattedName;
 } else {
  welcomeNameEl.textContent = "Priya"; // Default mockup name fallback
 }

 // Retrieve and prepopulate dynamic recent order from localStorage
 const dynamicOrderContainer = document.getElementById(
  "dynamic-dashboard-order-row",
 );
 if (dynamicOrderContainer) {
  const lastOrderData = localStorage.getItem("rein_oro_last_order");
  if (lastOrderData) {
   try {
    const order = JSON.parse(lastOrderData);
    const itemsCount = order.items.reduce((sum, item) => sum + item.qty, 0);

    dynamicOrderContainer.innerHTML = `
                    <div class="order-log-row">
                        <div class="order-log-item-details">
                            <div class="order-log-icon" style="color: var(--color-gold);">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                            </div>
                            <div class="order-log-meta">
                                <span class="order-id">Order #${order.orderId}</span>
                                <span class="order-date">${order.date} &bull; ${itemsCount} ${itemsCount === 1 ? "Item" : "Items"}</span>
                            </div>
                        </div>
                        <div class="order-log-status-col">
                            <span class="status-badge processing">Processing</span>
                            <span class="order-total-price">₹${order.total}</span>
                        </div>
                    </div>
                `;
   } catch (e) {
    console.error("Error parsing dynamic dashboard order:", e);
   }
  }
 }

 // Bind Sidebar Logout Action
 const logoutBtn = document.getElementById("btn-sidebar-logout");
 if (logoutBtn) {
  logoutBtn.style.cursor = "pointer";
  logoutBtn.addEventListener("click", (e) => {
   e.preventDefault();
   if (confirm("Are you sure you want to log out from your royal account?")) {
    localStorage.removeItem("rein_oro_user_logged_in");
    localStorage.removeItem("rein_oro_user_email");
    alert("You have logged out successfully.");
    window.location.href = "index.html";
   }
  });
 }

 // Bind Dashboard Recommendations Carousel Slider Controls
 const dbLeftArrow = document.querySelector(
  ".dashboard-recommendations-section .arrow-left",
 );
 const dbRightArrow = document.querySelector(
  ".dashboard-recommendations-section .arrow-right",
 );
 const dbSliderTrack = document.getElementById("dashboard-slider-track");

 if (dbLeftArrow && dbRightArrow && dbSliderTrack) {
  let currentTranslate = 0;
  const cardWidth = 270; // Card width + gap

  dbRightArrow.addEventListener("click", () => {
   const viewport = dbSliderTrack.closest(".slider-viewport");
   if (!viewport) return;
   const viewportWidth = viewport.offsetWidth;
   const trackWidth = dbSliderTrack.scrollWidth;
   const maxTranslate = Math.max(0, trackWidth - viewportWidth);

   if (Math.abs(currentTranslate) < maxTranslate) {
    currentTranslate -= cardWidth;
    if (Math.abs(currentTranslate) > maxTranslate) {
     currentTranslate = -maxTranslate;
    }
    dbSliderTrack.style.transform = `translateX(${currentTranslate}px)`;
   }
  });

  dbLeftArrow.addEventListener("click", () => {
   if (currentTranslate < 0) {
    currentTranslate += cardWidth;
    if (currentTranslate > 0) {
     currentTranslate = 0;
    }
    dbSliderTrack.style.transform = `translateX(${currentTranslate}px)`;
   }
  });
 }
}

function setupRecommendationsSlider() {
 const leftArrow = document.querySelector(".arrow-left");
 const rightArrow = document.querySelector(".arrow-right");
 const sliderTrack = document.querySelector(".slider-track");

 if (leftArrow && rightArrow && sliderTrack) {
  let currentTranslate = 0;
  const cardWidth = 270; // Approximation of a card width + gap

  rightArrow.addEventListener("click", () => {
   const viewport = document.querySelector(".slider-viewport");
   if (!viewport) return;
   const viewportWidth = viewport.offsetWidth;
   const trackWidth = sliderTrack.scrollWidth;
   const maxTranslate = Math.max(0, trackWidth - viewportWidth);

   if (Math.abs(currentTranslate) < maxTranslate) {
    currentTranslate -= cardWidth;
    if (Math.abs(currentTranslate) > maxTranslate) {
     currentTranslate = -maxTranslate;
    }
    sliderTrack.style.transform = `translateX(${currentTranslate}px)`;
   }
  });

  leftArrow.addEventListener("click", () => {
   if (currentTranslate < 0) {
    currentTranslate += cardWidth;
    if (currentTranslate > 0) {
     currentTranslate = 0;
    }
    sliderTrack.style.transform = `translateX(${currentTranslate}px)`;
   }
  });
 }
}

// Shop page pricing slider value updates
function setupShopFilters() {
 const priceRange = document.getElementById("priceRange");
 const sliderVal = document.getElementById("sliderVal");
 if (priceRange && sliderVal) {
  priceRange.addEventListener("input", (e) => {
   sliderVal.textContent = `₹${e.target.value}`;
  });
 }
}
// Product database for dynamic details page rendering
const productDatabase = {
 makhana_cheese_onion: {
  name: "Makhana",
  flavor: "Cheese & Onion",
  title: "Makhana Cheese & Onion",
  price: "₹799",
  image: "images/makhana_cheese_onion.png",
  description:
   "Crunchy, light and full of flavor. Our Cheese & Onion Makhana is roasted to perfect-ness with a delicious blend of savoury cheese and onion seasoning.",
  weight: "100g",
  ingredients: [
   { name: "Makhana", img: "images/ingredient_makhana.png" },
   { name: "Cheese Powder", img: "images/ingredient_cheese.png" },
   { name: "Onion Powder", img: "images/ingredient_onion.png" },
   { name: "Rock Salt", img: "images/ingredient_salt.png" },
   { name: "Spices & Herbs", img: "images/ingredient_spices.png" },
  ],
  benefits: [
   "Roasted, Not Fried",
   "Light & Crunchy",
   "Perfectly Seasoned",
   "Rich in Antioxidants",
   "Zero Trans Fat",
  ],
  benefitsImage: "images/makhana_bowl_love.png",
  specs: {
   Brand: "Rein Oro",
   Flavour: "Cheese & Onion",
   "Net Weight": "100g",
   "Diet Type": "Vegetarian",
   "Shelf Life": "6 Months from date of packaging",
   "Country of Origin": "India",
  },
  nutrition: {
   Calories: "385 Kcal",
   Protein: "9.2g",
   "Total Carbohydrates": "68.4g",
   "Dietary Fiber": "7.5g",
   "Total Fat": "7.8g",
   "Trans Fat": "0g",
   Sodium: "280mg",
  },
 },
 makhana_classic: {
  name: "Makhana",
  flavor: "Classic Salted",
  title: "Makhana Classic Salted",
  price: "₹499",
  image: "images/makhana_classic.png",
  description:
   "Crunchy, light and slow roasted to perfection. A timeless classic salted seasoning that brings out the pure, clean flavors of our select makhana.",
  weight: "100g",
  ingredients: [
   { name: "Makhana", img: "images/ingredient_makhana.png" },
   { name: "Rock Salt", img: "images/ingredient_salt.png" },
   { name: "Olive Oil", img: "images/ingredient_spices.png" },
  ],
  benefits: [
   "Roasted, Not Fried",
   "Light & Crunchy",
   "Classic Salted",
   "Rich in Antioxidants",
   "Zero Cholesterol",
  ],
  benefitsImage: "images/makhana_bowl_love.png",
  specs: {
   Brand: "Rein Oro",
   Flavour: "Classic Salted",
   "Net Weight": "100g",
   "Diet Type": "Vegetarian",
   "Shelf Life": "6 Months from date of packaging",
   "Country of Origin": "India",
  },
  nutrition: {
   Calories: "375 Kcal",
   Protein: "9.5g",
   "Total Carbohydrates": "71.2g",
   "Dietary Fiber": "7.8g",
   "Total Fat": "5.6g",
   "Trans Fat": "0g",
   Sodium: "210mg",
  },
 },
 makhana_periperi: {
  name: "Makhana",
  flavor: "Peri Peri",
  title: "Makhana Peri Peri",
  price: "₹499",
  image: "images/makhana_periperi.png",
  description:
   "Infused with a fiery blend of african bird's eye chili, garlic, and citrus. Spicy, tangy, and absolutely addictive for heat seekers.",
  weight: "100g",
  ingredients: [
   { name: "Makhana", img: "images/ingredient_makhana.png" },
   { name: "Peri Peri Seasoning", img: "images/ingredient_spices.png" },
   { name: "Garlic Powder", img: "images/ingredient_onion.png" },
   { name: "Rock Salt", img: "images/ingredient_salt.png" },
  ],
  benefits: [
   "Roasted, Not Fried",
   "Light & Crunchy",
   "Fiery Peri Peri",
   "Boosts Metabolism",
   "Zero Trans Fat",
  ],
  benefitsImage: "images/makhana_bowl_love.png",
  specs: {
   Brand: "Rein Oro",
   Flavour: "Peri Peri Spices",
   "Net Weight": "100g",
   "Diet Type": "Vegetarian",
   "Shelf Life": "6 Months from date of packaging",
   "Country of Origin": "India",
  },
  nutrition: {
   Calories: "390 Kcal",
   Protein: "9.1g",
   "Total Carbohydrates": "66.8g",
   "Dietary Fiber": "7.2g",
   "Total Fat": "8.2g",
   "Trans Fat": "0g",
   Sodium: "320mg",
  },
 },
 makhana_himalayan: {
  name: "Makhana",
  flavor: "Himalayan Salt",
  title: "Makhana Himalayan Salt",
  price: "₹499",
  image: "images/makhana_himalayan.png",
  description:
   "Lightly roasted lotus seeds dusted with pure, mineral-rich pink Himalayan rock salt. Clean, natural, and incredibly refreshing.",
  weight: "100g",
  ingredients: [
   { name: "Makhana", img: "images/ingredient_makhana.png" },
   { name: "Pink Himalayan Salt", img: "images/ingredient_salt.png" },
   { name: "Cold Pressed Oil", img: "images/ingredient_spices.png" },
  ],
  benefits: [
   "Roasted, Not Fried",
   "Mineral Rich Himalayan Salt",
   "Crunchy & Light",
   "Perfect Daily Snack",
   "Zero Trans Fat",
  ],
  benefitsImage: "images/makhana_bowl_love.png",
  specs: {
   Brand: "Rein Oro",
   Flavour: "Himalayan Pink Salt",
   "Net Weight": "100g",
   "Diet Type": "Vegetarian",
   "Shelf Life": "6 Months from date of packaging",
   "Country of Origin": "India",
  },
  nutrition: {
   Calories: "372 Kcal",
   Protein: "9.6g",
   "Total Carbohydrates": "72.4g",
   "Dietary Fiber": "8.0g",
   "Total Fat": "5.2g",
   "Trans Fat": "0g",
   Sodium: "180mg",
  },
 },
 almonds_california: {
  name: "California",
  flavor: "Almonds",
  title: "California Premium Almonds",
  price: "₹699",
  image: "images/almonds_california.png",
  description:
   "Hand-selected, premium California almonds. Uniform in size, double-sorted, and packed with high protein, healthy fats, and antioxidants.",
  weight: "250g",
  ingredients: [
   { name: "Premium Almonds", img: "images/almonds_california.png" },
  ],
  benefits: [
   "Double Sorted",
   "High in Vitamin E",
   "Rich in Protein",
   "Premium California Origin",
   "Boosts Brain Health",
  ],
  benefitsImage: "images/makhana_bowl_love.png",
  specs: {
   Brand: "Rein Oro",
   Flavour: "Natural Premium Almonds",
   "Net Weight": "250g",
   "Diet Type": "Vegetarian",
   "Shelf Life": "9 Months from date of packaging",
   "Country of Origin": "USA (California)",
  },
  nutrition: {
   Calories: "579 Kcal",
   Protein: "21.2g",
   "Total Carbohydrates": "21.6g",
   "Dietary Fiber": "12.5g",
   "Total Fat": "49.9g",
   "Trans Fat": "0g",
   Sodium: "1mg",
  },
 },
 cashews_roasted: {
  name: "California",
  flavor: "Roasted & Salted Cashews",
  title: "California Roasted & Salted Cashews",
  price: "₹749",
  image: "images/cashews_roasted.png",
  description:
   "Slightly sweet, creamy cashew nuts, roasted to a golden hue and sprinkled with pure sea salt. An exquisite and crunchy wellness snack.",
  weight: "200g",
  ingredients: [
   { name: "Creamy Cashews", img: "images/cashews_roasted.png" },
   { name: "Rock Salt", img: "images/ingredient_salt.png" },
  ],
  benefits: [
   "Slow Roasted",
   "Rich & Creamy",
   "Lightly Salted",
   "Healthy Monounsaturated Fats",
   "Handpicked Quality",
  ],
  benefitsImage: "images/makhana_bowl_love.png",
  specs: {
   Brand: "Rein Oro",
   Flavour: "Roasted & Salted Cashews",
   "Net Weight": "200g",
   "Diet Type": "Vegetarian",
   "Shelf Life": "6 Months from date of packaging",
   "Country of Origin": "India",
  },
  nutrition: {
   Calories: "553 Kcal",
   Protein: "18.2g",
   "Total Carbohydrates": "30.2g",
   "Dietary Fiber": "3.3g",
   "Total Fat": "43.8g",
   "Trans Fat": "0g",
   Sodium: "240mg",
  },
 },
 pistachios_roasted: {
  name: "Pistachios",
  flavor: "Roasted & Salted",
  title: "Pistachios Roasted & Salted",
  price: "₹799",
  image: "images/pistachios_roasted.png",
  description:
   "In-shell premium Iranian pistachios, lightly roasted and seasoned with rock salt. Rich in fiber and highly nutritional.",
  weight: "200g",
  ingredients: [
   { name: "Iranian Pistachios", img: "images/pistachios_roasted.png" },
   { name: "Rock Salt", img: "images/ingredient_salt.png" },
  ],
  benefits: [
   "Easy to Shell",
   "Lightly Roasted",
   "Rich in Antioxidants",
   "Highly Nutritious",
   "100% Natural Processed",
  ],
  benefitsImage: "images/makhana_bowl_love.png",
  specs: {
   Brand: "Rein Oro",
   Flavour: "Roasted & Salted Pistachios",
   "Net Weight": "200g",
   "Diet Type": "Vegetarian",
   "Shelf Life": "6 Months from date of packaging",
   "Country of Origin": "Iran",
  },
  nutrition: {
   Calories: "562 Kcal",
   Protein: "20.3g",
   "Total Carbohydrates": "27.5g",
   "Dietary Fiber": "10.3g",
   "Total Fat": "45.3g",
   "Trans Fat": "0g",
   Sodium: "290mg",
  },
 },
 raisins_premium: {
  name: "Raisins",
  flavor: "Premium Selection",
  title: "Green Raisins Premium Selection",
  price: "₹399",
  image: "images/raisins_premium.png",
  description:
   "Naturally sweet, plump green raisins chosen from the finest vineyards. Soft, juicy, and perfect for natural sweetening or snacking.",
  weight: "250g",
  ingredients: [{ name: "Green Raisins", img: "images/raisins_premium.png" }],
  benefits: [
   "Naturally Sun Dried",
   "Zero Added Sugar",
   "Rich in Iron & Fiber",
   "Sweet & Juicy",
   "Ideal Dessert Topping",
  ],
  benefitsImage: "images/makhana_bowl_love.png",
  specs: {
   Brand: "Rein Oro",
   Flavour: "Green Raisins",
   "Net Weight": "250g",
   "Diet Type": "Vegetarian",
   "Shelf Life": "12 Months from date of packaging",
   "Country of Origin": "India",
  },
  nutrition: {
   Calories: "299 Kcal",
   Protein: "3.1g",
   "Total Carbohydrates": "79.2g",
   "Dietary Fiber": "3.7g",
   "Total Fat": "0.5g",
   "Trans Fat": "0g",
   Sodium: "11mg",
  },
 },
 gift_box_premium: {
  name: "Gift Box",
  flavor: "Premium Collection",
  title: "Rein Oro Premium Gift Box Assortment",
  price: "₹1299",
  image: "images/gift_box_premium.png",
  description:
   "An elegant, gold-embossed gift collection containing a curated assortments of our signature makhanas, California almonds, and roasted cashews.",
  weight: "Assorted (500g)",
  ingredients: [
   { name: "Makhana Classic", img: "images/makhana_classic.png" },
   { name: "Roasted Cashews", img: "images/cashews_roasted.png" },
   { name: "California Almonds", img: "images/almonds_california.png" },
  ],
  benefits: [
   "Exquisite Festive Packaging",
   "Gold Embossed Box",
   "Curated Wellness Selection",
   "Perfect for Corporate Gifting",
   "Vacuum Packed Freshness",
  ],
  benefitsImage: "images/gift_box.png",
  specs: {
   Brand: "Rein Oro",
   Flavour: "Assorted Luxury Dry Fruits & Makhana",
   "Net Weight": "500g Assorted",
   "Diet Type": "Vegetarian",
   "Shelf Life": "6 Months from date of packaging",
   "Country of Origin": "India",
  },
  nutrition: {
   Calories: "480 Kcal",
   Protein: "14.5g",
   "Total Carbohydrates": "48.2g",
   "Dietary Fiber": "6.2g",
   "Total Fat": "28.5g",
   "Trans Fat": "0g",
   Sodium: "190mg",
  },
 },
};

// Product details page interactive setup
function setupProductDetails() {
 const mainImg = document.getElementById("main-product-display");
 if (!mainImg) return;
 const thumbnails = document.querySelectorAll(".thumb-item");

 // Dynamic Content Rendering from Database
 const urlParams = new URLSearchParams(window.location.search);
 const productId = urlParams.get("id") || "makhana_cheese_onion";
 const product = productDatabase[productId];

 if (product) {
  // Page title & document header title
  document.title = `Rein Oro | ${product.title}`;

  const currentCrumbEl = document.querySelector(".current-crumb");
  if (currentCrumbEl) currentCrumbEl.textContent = product.title;

  const categoryCrumbEl = document.getElementById("breadcrumb-category");
  if (categoryCrumbEl) {
   categoryCrumbEl.textContent = product.name;
   categoryCrumbEl.setAttribute(
    "href",
    `shop.html?category=${encodeURIComponent(product.name)}`,
   );
  }

  const mainTitleEl = document.querySelector(".product-detail-title");
  if (mainTitleEl) mainTitleEl.textContent = product.title;

  // Price
  const priceEl = document.querySelector(".product-detail-price");
  if (priceEl) priceEl.textContent = product.price;

  // Description
  const descEl = document.querySelector(".product-detail-description");
  if (descEl) descEl.textContent = product.description;

  // Net Weight
  const weightEl = document.querySelector(".active-weight");
  if (weightEl) weightEl.textContent = product.weight;

  // Gallery Main image
  if (mainImg) {
   mainImg.setAttribute("src", product.image);
   mainImg.setAttribute("alt", product.title);
  }

  // Swapping thumb sources
  if (thumbnails.length > 0) {
   thumbnails[0].setAttribute("data-image", product.image);
   thumbnails[0].querySelector("img").setAttribute("src", product.image);
   thumbnails[0].querySelector("img").setAttribute("alt", product.title);

   thumbnails[1].setAttribute("data-image", product.benefitsImage);
   thumbnails[1]
    .querySelector("img")
    .setAttribute("src", product.benefitsImage);

   // Thumbnail 3 close up
   if (product.image.includes("makhana")) {
    thumbnails[2].setAttribute("data-image", "images/makhana_classic.png");
    thumbnails[2]
     .querySelector("img")
     .setAttribute("src", "images/makhana_classic.png");
   } else {
    thumbnails[2].setAttribute("data-image", "images/almonds_california.png");
    thumbnails[2]
     .querySelector("img")
     .setAttribute("src", "images/almonds_california.png");
   }

   // Thumbnail 4 ingredient
   if (product.ingredients.length > 1) {
    const secondIngredientImg = product.ingredients[1].img;
    thumbnails[3].setAttribute("data-image", secondIngredientImg);
    thumbnails[3].querySelector("img").setAttribute("src", secondIngredientImg);
   } else {
    thumbnails[3].setAttribute("data-image", product.image);
    thumbnails[3].querySelector("img").setAttribute("src", product.image);
   }

   // Thumbnail 5 video play
   thumbnails[4].setAttribute("data-image", product.benefitsImage);
   thumbnails[4]
    .querySelector("img")
    .setAttribute("src", product.benefitsImage);
  }

  // Benefits Checklist
  const benefitsContainer = document.querySelector(".benefits-check-list");
  if (benefitsContainer) {
   benefitsContainer.innerHTML = "";
   product.benefits.forEach((benefit) => {
    const li = document.createElement("li");
    li.innerHTML = `
                    <svg class="check-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    ${benefit}
                `;
    benefitsContainer.appendChild(li);
   });
  }

  // Benefits Image
  const benefitsImg = document.querySelector(".benefits-image-wrapper img");
  if (benefitsImg) {
   benefitsImg.setAttribute("src", product.benefitsImage);
   benefitsImg.setAttribute("alt", `Benefits image for ${product.title}`);
  }

  // Ingredients Circles
  const ingredientsCircles = document.querySelector(".ingredients-circles-row");
  if (ingredientsCircles) {
   ingredientsCircles.innerHTML = "";
   product.ingredients.forEach((ing) => {
    const item = document.createElement("div");
    item.className = "ingredient-circle-item";
    item.innerHTML = `
                    <div class="ingredient-img-frame">
                        <img src="${ing.img}" alt="${ing.name}">
                    </div>
                    <span class="ingredient-label">${ing.name}</span>
                `;
    ingredientsCircles.appendChild(item);
   });
  }

  // Specifications Table
  const specsTableBody = document.querySelector("#specs-table-el tbody");
  if (specsTableBody) {
   specsTableBody.innerHTML = "";
   for (const [key, val] of Object.entries(product.specs)) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
                    <td>${key}</td>
                    <td>${val}</td>
                `;
    specsTableBody.appendChild(tr);
   }
  }

  // Nutrition Table
  const nutritionTableBody = document.querySelector(
   "#nutrition-table-el tbody",
  );
  if (nutritionTableBody) {
   nutritionTableBody.innerHTML = "";
   for (const [key, val] of Object.entries(product.nutrition)) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
                    <td>${key}</td>
                    <td>${val}</td>
                `;
    nutritionTableBody.appendChild(tr);
   }
  }

  // Description Tab Paragraphs
  const descParagraphs = document.querySelector(".description-paragraphs");
  if (descParagraphs) {
   const pTags = descParagraphs.querySelectorAll("p");
   if (pTags.length > 0) {
    pTags[0].textContent = `${product.title} is a gourmet snack crafted for those who appreciate the finer things in life. ${product.description}`;
    if (pTags.length > 1) {
     pTags[1].textContent = `High in natural nutrition and carefully selected for optimal crunch and wellness, it's the perfect snack for guilt-free indulgence. Enjoy it anytime, anywhere!`;
    }
   }
  }
 }

 // 1. Gallery Thumbnail Switcher
 if (mainImg && thumbnails.length > 0) {
  thumbnails.forEach((thumb) => {
   thumb.addEventListener("click", () => {
    // Remove active class
    thumbnails.forEach((t) => t.classList.remove("active-thumb"));
    thumb.classList.add("active-thumb");

    // Switch image with a smooth cross-fade animation
    const newSrc = thumb.getAttribute("data-image");
    if (newSrc && mainImg.getAttribute("src") !== newSrc) {
     if (typeof gsap !== "undefined") {
      gsap.to(mainImg, {
       opacity: 0,
       duration: 0.2,
       onComplete: () => {
        mainImg.setAttribute("src", newSrc);
        gsap.to(mainImg, { opacity: 1, duration: 0.3 });
       },
      });
     } else {
      mainImg.setAttribute("src", newSrc);
     }
    }
   });
  });
 }

 // 2. Quantity Spinner
 const qtyInput = document.getElementById("product-qty");
 const decBtn = document.querySelector(".dec-qty-btn");
 const incBtn = document.querySelector(".inc-qty-btn");

 if (qtyInput && decBtn && incBtn) {
  decBtn.addEventListener("click", () => {
   let val = parseInt(qtyInput.value) || 1;
   if (val > 1) {
    qtyInput.value = val - 1;
   }
  });

  incBtn.addEventListener("click", () => {
   let val = parseInt(qtyInput.value) || 1;
   qtyInput.value = val + 1;
  });
 }

 // 3. Tab Navigation
 const tabButtons = document.querySelectorAll(".tab-btn");
 const tabPanels = document.querySelectorAll(".tab-panel");

 if (tabButtons.length > 0 && tabPanels.length > 0) {
  tabButtons.forEach((btn) => {
   btn.addEventListener("click", () => {
    const targetTabId = btn.getAttribute("data-tab");
    const targetPanel = document.getElementById(targetTabId);

    if (targetPanel) {
     // Update buttons
     tabButtons.forEach((b) => b.classList.remove("active-tab-btn"));
     btn.classList.add("active-tab-btn");

     // Update panels
     tabPanels.forEach((p) => p.classList.remove("active-tab-panel"));
     targetPanel.classList.add("active-tab-panel");
    }
   });
  });
 }

 // 4. Add to Cart Main Action
 const addToCartAction = document.querySelector(
  ".btn-detail-primary.add-to-cart-action",
 );

 if (addToCartAction) {
  addToCartAction.addEventListener("click", (e) => {
   e.preventDefault();

   // Get quantity
   const qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;

   // Add to dynamic persistent cart
   addToCart(productId, qty);
  });
 }
}

// Make all product cards redirect to product.html on click, preserving cart button actions
function setupProductCardLinks() {
 const productCards = document.querySelectorAll(".product-card");
 productCards.forEach((card) => {
  card.style.cursor = "pointer";

  card.addEventListener("click", (e) => {
   // If clicking the quick add button, let its listener handle it
   if (e.target.closest(".quick-add-btn")) {
    return;
   }

   // Retrieve product ID from attribute
   let productId = card.getAttribute("data-product-id");

   // Fallback auto-detection if attribute is missing
   if (!productId) {
    const img = card.querySelector(".product-img");
    if (img) {
     const src = img.getAttribute("src") || "";
     if (src.includes("makhana_cheese_onion"))
      productId = "makhana_cheese_onion";
     else if (src.includes("makhana_classic")) productId = "makhana_classic";
     else if (src.includes("makhana_periperi")) productId = "makhana_periperi";
     else if (src.includes("makhana_himalayan"))
      productId = "makhana_himalayan";
     else if (src.includes("almonds_california"))
      productId = "almonds_california";
     else if (src.includes("cashews_roasted")) productId = "cashews_roasted";
     else if (src.includes("pistachios_roasted"))
      productId = "pistachios_roasted";
     else if (src.includes("raisins_premium")) productId = "raisins_premium";
     else if (src.includes("gift_box_premium")) productId = "gift_box_premium";
    }
   }

   if (productId) {
    window.location.href = `product.html?id=${productId}`;
   } else {
    window.location.href = "product.html";
   }
  });
 });
}

// --------------------------------------------------
// CONTACT US & POLICY SIDEBAR INTERACTIVE BEHAVIORS
// --------------------------------------------------
function setupContactPage() {
 const contactForm = document.getElementById("contact-form-el");
 if (!contactForm) return;

 contactForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const submitBtn = document.getElementById("btn-contact-submit");
  const originalBtnText = submitBtn ? submitBtn.innerHTML : "SEND MESSAGE";

  if (submitBtn) {
   submitBtn.innerHTML = `
                <svg class="spinner-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
                SENDING MESSAGE...
            `;
   submitBtn.disabled = true;
  }

  // Disable all form inputs
  const formElements = contactForm.querySelectorAll("input, textarea, button");
  formElements.forEach((el) => (el.disabled = true));

  setTimeout(() => {
   alert(
    "Thank you for contacting Rein Oro. Our concierge desk will review your request and get back to you shortly.",
   );
   contactForm.reset();

   // Re-enable and restore button
   formElements.forEach((el) => (el.disabled = false));
   if (submitBtn) {
    submitBtn.innerHTML = originalBtnText;
    submitBtn.disabled = false;
   }
  }, 1500);
 });
}

function setupPolicySidebar() {
 const sidebar = document.querySelector(".policy-sidebar");
 const sidebarLinks = document.querySelectorAll(".policy-sidebar-link");
 const sections = document.querySelectorAll(".policy-section");

 if (!sidebar || sidebarLinks.length === 0 || sections.length === 0) return;

 // 1. Smooth offset scrolling on click
 sidebarLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
   const targetId = link.getAttribute("href");
   if (targetId && targetId.startsWith("#")) {
    const targetEl = document.querySelector(targetId);
    if (targetEl) {
     e.preventDefault();

     const headerOffset = 100;
     const elementPosition = targetEl.getBoundingClientRect().top;
     const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

     window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
     });

     // Update URL hash without scroll jumping
     history.pushState(null, null, targetId);

     // Manually set active class
     sidebarLinks.forEach((l) => l.classList.remove("active"));
     link.classList.add("active");
    }
   }
  });
 });

 // 2. Intersection Observer (Scroll Spy)
 if (typeof IntersectionObserver !== "undefined") {
  const observerOptions = {
   root: null,
   rootMargin: "-120px 0px -60% 0px",
   threshold: 0,
  };

  const observer = new IntersectionObserver((entries) => {
   entries.forEach((entry) => {
    if (entry.isIntersecting) {
     const id = entry.target.getAttribute("id");
     if (id) {
      sidebarLinks.forEach((link) => {
       if (link.getAttribute("href") === `#${id}`) {
        link.classList.add("active");
       } else {
        link.classList.remove("active");
       }
      });
     }
    }
   });
  }, observerOptions);

  sections.forEach((section) => observer.observe(section));
 }
}

// Initialize execution using a bulletproof ready check
function init() {
 preloader = document.getElementById("preloader");
 preloaderBar = document.querySelector(".preloader-bar");
 preloaderPercent = document.querySelector(".preloader-percentage");
 preloaderStatus = document.querySelector(".preloader-status");

 canvas = document.getElementById("hero-canvas");
 context = canvas ? canvas.getContext("2d") : null;

 if (canvas) {
  preloadImages();
 } else {
  // If on a subpage without a canvas (e.g. shop.html, product.html)
  if (preloader) {
   preloader.style.opacity = "0";
   preloader.style.pointerEvents = "none";
   setTimeout(() => {
    preloader.style.display = "none";
   }, 800);
  }
  setupCartInteractions();
  setupShopFilters();
  setupProductDetails();
  setupCartPage();
  setupCheckoutPage();
  setupConfirmationPage();
  setupLoginPage();
  setupDashboardPage();
  setupProductCardLinks();
  setupRecommendationsSlider();
  setupContactPage();
  setupPolicySidebar();
 }
}

if (document.readyState === "loading") {
 document.addEventListener("DOMContentLoaded", init);
} else {
 init();
}
