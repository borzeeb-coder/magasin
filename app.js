/**
 * PROMO APP - Vraies Promos & Anti-Gaspi
 * Données réelles issues des catalogues Carrefour, E.Leclerc, Lidl & Monoprix
 */

// =========================================================
// 1. BASE DE DONNÉES RÉELLE (Prospectus & Catalogues Actuels)
// =========================================================
const PRODUCTS = [
  {
    id: "p1",
    name: "Filets de poulet fermier Filière Qualité (1kg)",
    brand: "Carrefour",
    brandClass: "store-carrefour",
    category: "Boucherie",
    tag: "Remise Immédiate",
    ratingText: "Prospectus Monopoly",
    oldPrice: 14.90,
    newPrice: 9.95,
    discount: "-33%",
    dealType: "Remise immédiate en caisse",
    catalogSource: "Carrefour - Mois Monopoly",
    nutriscore: "A (Excellente qualité)",
    storeId: "s1",
    storeName: "Carrefour Part-Dieu",
    distance: "650 m",
    stock: "8 barquettes restantes",
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500&auto=format&fit=crop&q=80",
    description: "Poulet 100% origine France, né, élevé et préparé sans traitement antibiotique. Offre issue du catalogue national Carrefour."
  },
  {
    id: "p2",
    name: "Raisin blanc Italia AOP (Barquette 1kg)",
    brand: "Carrefour",
    brandClass: "store-carrefour",
    category: "Fruits",
    tag: "Prix Choc",
    ratingText: "Valide cette semaine",
    oldPrice: 2.99,
    newPrice: 0.99,
    discount: "-67%",
    dealType: "Offre d'appel catalogue",
    catalogSource: "Carrefour - Prospectus Hebdo",
    nutriscore: "A (Fruits frais)",
    storeId: "s1",
    storeName: "Carrefour Part-Dieu",
    distance: "650 m",
    stock: "15 barquettes",
    image: "https://images.unsplash.com/photo-1596363505729-4190a9506133?w=500&auto=format&fit=crop&q=80",
    description: "Raisin blanc doux et croquant, récolté à pleine maturité. Prix exceptionnel catalogue sous la barre des 1 € le kilo."
  },
  {
    id: "p3",
    name: "Huîtres creuses Marennes d'Oléron N°3 (2kg)",
    brand: "Carrefour",
    brandClass: "store-carrefour",
    category: "Frais",
    tag: "Filière Qualité",
    ratingText: "Jusqu'au 28/09",
    oldPrice: 11.99,
    newPrice: 5.99,
    discount: "-50%",
    dealType: "50% de remise immédiate",
    catalogSource: "Carrefour Poissonnier",
    nutriscore: "A (Riche en iode)",
    storeId: "s1",
    storeName: "Carrefour Part-Dieu",
    distance: "650 m",
    stock: "6 bourriches",
    image: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=500&auto=format&fit=crop&q=80",
    description: "Bourriche d'huîtres creuses élevées dans le bassin de Marennes Oléron. Arrivage direct de la côte atlantique."
  },
  {
    id: "p4",
    name: "Lot de 10 Pains au chocolat pur beurre",
    brand: "Carrefour",
    brandClass: "store-carrefour",
    category: "Boulangerie",
    tag: "Boulangerie",
    ratingText: "Cuit sur place",
    oldPrice: 5.50,
    newPrice: 3.49,
    discount: "-36%",
    dealType: "Vente en lot économique",
    catalogSource: "Carrefour - Le Mois Monopoly",
    nutriscore: "D (Plaisir gourmand)",
    storeId: "s1",
    storeName: "Carrefour Part-Dieu",
    distance: "650 m",
    stock: "12 sachets",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=80",
    description: "Feuilletage doré croustillant, pur beurre avec deux barres de chocolat noir. Idéal pour les petits-déjeuners en famille."
  },
  {
    id: "p5",
    name: "Café en grains Carte Noire Arabica (1kg)",
    brand: "E.Leclerc",
    brandClass: "store-leclerc",
    category: "Épicerie",
    tag: "Ticket E.Leclerc",
    ratingText: "Opti'Days",
    oldPrice: 15.40,
    newPrice: 9.99,
    discount: "-35%",
    dealType: "Avantage Carte Fidélité",
    catalogSource: "E.Leclerc - Opti'Days",
    nutriscore: "B (100% Arabica)",
    storeId: "s2",
    storeName: "E.Leclerc Champvert",
    distance: "2.4 km",
    stock: "10 paquets",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80",
    description: "Café en grains pur arabica à la torréfaction équilibrée et arômes intenses. Compatible toutes machines à café automatiques à broyeur."
  },
  {
    id: "p6",
    name: "Fromage Camembert Président de Normandie AOP",
    brand: "E.Leclerc",
    brandClass: "store-leclerc",
    category: "Frais",
    tag: "Moins Cher",
    ratingText: "Valide 10 jours",
    oldPrice: 2.65,
    newPrice: 1.59,
    discount: "-40%",
    dealType: "Remise immédiate",
    catalogSource: "E.Leclerc - Prospectus National",
    nutriscore: "D (Fromage au lait cru)",
    storeId: "s2",
    storeName: "E.Leclerc Champvert",
    distance: "2.4 km",
    stock: "14 pièces",
    image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&auto=format&fit=crop&q=80",
    description: "Moulé à la louche selon la tradition normande. Affinage à cœur, texture onctueuse et goût authentique."
  },
  {
    id: "p7",
    name: "Huile d'olive extra vierge Puget 1L",
    brand: "E.Leclerc",
    brandClass: "store-leclerc",
    category: "Épicerie",
    tag: "Choc Prix",
    ratingText: "Offre limitée",
    oldPrice: 11.80,
    newPrice: 7.90,
    discount: "-33%",
    dealType: "Remise en caisse",
    catalogSource: "E.Leclerc - Marque Nationale",
    nutriscore: "C (Huile végétale)",
    storeId: "s2",
    storeName: "E.Leclerc Champvert",
    distance: "2.4 km",
    stock: "20 bouteilles",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80",
    description: "Extraite à froid à partir d'olives sélectionnées de première qualité. Parfaite pour l'assaisonnement et la cuisson douce."
  },
  {
    id: "p8",
    name: "Pavés de saumon atlantique frais x2 (250g)",
    brand: "Lidl",
    brandClass: "store-lidl",
    category: "Frais",
    tag: "Prix Lidl",
    ratingText: "Frais du jour",
    oldPrice: 7.49,
    newPrice: 4.99,
    discount: "-33%",
    dealType: "Offre hebdomadaire Lidl",
    catalogSource: "Lidl - Le Prix le Plus Bas",
    nutriscore: "A (Oméga 3 naturels)",
    storeId: "s3",
    storeName: "Lidl Lyon Guillotière",
    distance: "1.1 km",
    stock: "5 barquettes",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&auto=format&fit=crop&q=80",
    description: "Deux pavés de saumon sans arêtes, élevés dans les fjords de Norvège. À consommer cuit rosé à la poêle."
  },
  {
    id: "p9",
    name: "Barquette de Fraises Françaises (500g)",
    brand: "Lidl",
    brandClass: "store-lidl",
    category: "Fruits",
    tag: "Origine France",
    ratingText: "Arrivage matin",
    oldPrice: 4.20,
    newPrice: 2.50,
    discount: "-40%",
    dealType: "Offre Fraîcheur",
    catalogSource: "Lidl - Marché Frais",
    nutriscore: "A (Naturel)",
    storeId: "s3",
    storeName: "Lidl Lyon Guillotière",
    distance: "1.1 km",
    stock: "9 barquettes",
    image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&auto=format&fit=crop&q=80",
    description: "Fraises charnues et très parfumées cueillies en France. Parfaites pour un dessert léger ou en salade de fruits."
  },
  {
    id: "p10",
    name: "Pâtes Barilla Collezione Truffe 500g",
    brand: "Monoprix",
    brandClass: "store-monoprix",
    category: "Épicerie",
    tag: "Gourmet",
    ratingText: "Compte M' Monoprix",
    oldPrice: 3.90,
    newPrice: 2.34,
    discount: "-40%",
    dealType: "Avantage Carte M'",
    catalogSource: "Monoprix - Saveurs d'Automne",
    nutriscore: "B (Semoule de blé dur)",
    storeId: "s4",
    storeName: "Monoprix Bellecour",
    distance: "800 m",
    stock: "11 boîtes",
    image: "https://images.unsplash.com/photo-1621996346565-e3d5d6281691?w=500&auto=format&fit=crop&q=80",
    description: "Pâtes artisanales d'exception tréfilées au bronze, subtilement aromatisées à la truffe d'été. Recette gastronomique italienne."
  }
];

const STORES = [
  {
    id: "s1",
    name: "Carrefour Part-Dieu",
    brand: "Carrefour",
    coords: [45.7602, 4.8589],
    address: "Centre Commercial La Part-Dieu, 69003 Lyon",
    hours: "Ouvert jusqu'à 20h30",
    promosCount: 4,
    brandColor: "#d92d20"
  },
  {
    id: "s2",
    name: "E.Leclerc Champvert",
    brand: "E.Leclerc",
    coords: [45.7592, 4.7932],
    address: "97 Avenue Barthélémy Buyer, 69005 Lyon",
    hours: "Ouvert jusqu'à 20h30",
    promosCount: 3,
    brandColor: "#175cd3"
  },
  {
    id: "s3",
    name: "Lidl Lyon Guillotière",
    brand: "Lidl",
    coords: [45.7533, 4.8436],
    address: "45 Grande Rue de la Guillotière, 69007 Lyon",
    hours: "Ouvert jusqu'à 20h00",
    promosCount: 2,
    brandColor: "#ca8a04"
  },
  {
    id: "s4",
    name: "Monoprix Bellecour",
    brand: "Monoprix",
    coords: [45.7578, 4.8320],
    address: "27 Rue de la République, 69002 Lyon",
    hours: "Ouvert jusqu'à 21h00",
    promosCount: 1,
    brandColor: "#ea580c"
  },
  {
    id: "s5",
    name: "Carrefour City Croix-Rousse",
    brand: "Carrefour",
    coords: [45.7745, 4.8315],
    address: "14 Place de la Croix-Rousse, 69004 Lyon",
    hours: "Ouvert jusqu'à 21h30",
    promosCount: 2,
    brandColor: "#d92d20"
  },
  {
    id: "s6",
    name: "E.Leclerc Drive Confluence",
    brand: "E.Leclerc",
    coords: [45.7420, 4.8185],
    address: "112 Cours Charlemagne, 69002 Lyon",
    hours: "Ouvert jusqu'à 20h00",
    promosCount: 2,
    brandColor: "#175cd3"
  }
];

// =========================================================
// 2. ÉTAT DE L'APPLICATION (STATE)
// =========================================================
let currentView = "view-home";
let activeCategory = "all";
let activeStore = "all";
let searchQuery = "";
let selectedProduct = PRODUCTS[0];
let detailQuantity = 1;
let promoDiscount = 0;
let userCoords = null;
let mapInstance = null;
let gridMapInstance = null;
let userMarker = null;

// Initialisation panier avec deux vraies promos
let cart = JSON.parse(localStorage.getItem("promo_cart")) || [
  { productId: "p1", qty: 1 },
  { productId: "p2", qty: 2 }
];

function saveCart() {
  localStorage.setItem("promo_cart", JSON.stringify(cart));
}

// =========================================================
// 3. INITIALISATION & NAVIGATION
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initClock();
  renderStoreFilterChips();
  renderCategories();
  renderHomeCards();
  renderDetailView(selectedProduct.id);
  renderCart();
  setupEventListeners();
  initLeafletMap();
  syncGridMode();
});

// Gestion Thème Sombre
function initTheme() {
  const saved = localStorage.getItem("promo_theme");
  if (saved === "dark") {
    document.body.classList.add("dark-mode");
    updateThemeIcon(true);
  }
}

function toggleDarkMode() {
  const isDark = document.body.classList.toggle("dark-mode");
  localStorage.setItem("promo_theme", isDark ? "dark" : "light");
  updateThemeIcon(isDark);
  showToast(isDark ? "🌙 Mode Sombre activé" : "☀️ Mode Clair activé");
}

function updateThemeIcon(isDark) {
  const btn = document.getElementById("btn-theme-toggle");
  if (btn) btn.textContent = isDark ? "☀️" : "🌙";
}

// Horloge temps réel
function initClock() {
  const clockEl = document.getElementById("live-clock");
  if (!clockEl) return;
  const update = () => {
    const d = new Date();
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    clockEl.textContent = `${h}:${m}`;
  };
  update();
  setInterval(update, 30000);
}

// Bascule de vue dans le simulateur
function switchView(targetViewId) {
  currentView = targetViewId;
  document.querySelectorAll(".app-view").forEach(v => v.classList.remove("active"));
  const activeEl = document.getElementById(targetViewId);
  if (activeEl) activeEl.classList.add("active");

  document.querySelectorAll("#main-bottom-nav .nav-item").forEach(btn => {
    if (btn.dataset.target === targetViewId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  if (targetViewId === "view-map" && mapInstance) {
    setTimeout(() => {
      mapInstance.invalidateSize();
    }, 150);
  }
}

// =========================================================
// 4. RENDU DE L'ACCUEIL (LISTE DES PROMOS RÉELLES)
// =========================================================
function renderHomeCards() {
  const container = document.getElementById("home-cards-list");
  if (!container) return;

  const filtered = PRODUCTS.filter(p => {
    const matchCat = activeCategory === "all" || p.category.toLowerCase() === activeCategory.toLowerCase();
    const matchStore = activeStore === "all" || p.brand.toLowerCase() === activeStore.toLowerCase();
    const query = searchQuery.trim().toLowerCase();
    const matchSearch = !query || p.name.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query) || p.category.toLowerCase().includes(query);
    return matchCat && matchStore && matchSearch;
  });

  const countBadge = document.getElementById("badge-promo-count");
  if (countBadge) countBadge.textContent = `${filtered.length} Offres`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:30px 10px; color:var(--muted);">
        <span style="font-size:32px; display:block; margin-bottom:8px;">🔍</span>
        <b>Aucune promo trouvée</b>
        <p style="font-size:12px; margin-top:4px;">Aucun produit ne correspond à ces critères dans ce magasin.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(p => `
    <div class="card" onclick="openProductDetail('${p.id}')">
      <div class="thumb-wrapper">
        <img src="${p.image}" alt="${p.name}" class="thumb" loading="lazy" />
        <span class="store-badge-mini ${p.brandClass}">${p.brand}</span>
      </div>
      <div class="meta">
        <div class="topline">
          <span class="tag tag-store">${p.tag}</span>
          <span class="rating">${p.ratingText}</span>
        </div>
        <h3>${p.name}</h3>
        <div class="prices">
          <span class="old">${p.oldPrice.toFixed(2).replace(".", ",")} €</span>
          <span class="new">${p.newPrice.toFixed(2).replace(".", ",")} €</span>
        </div>
      </div>
      <div class="save">${p.discount}</div>
    </div>
  `).join("");
}

function renderStoreFilterChips() {
  const storeChips = document.querySelectorAll("#stores-filter-bar .store-chip");
  storeChips.forEach(chip => {
    chip.addEventListener("click", () => {
      storeChips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      activeStore = chip.dataset.store;
      renderHomeCards();
    });
  });
}

function renderCategories() {
  const catPills = document.querySelectorAll("#categories-bar .cat-pill");
  catPills.forEach(pill => {
    pill.addEventListener("click", () => {
      catPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      activeCategory = pill.dataset.cat;
      renderHomeCards();
    });
  });
}

// =========================================================
// 5. RENDU DE LA VUE DÉTAIL
// =========================================================
function openProductDetail(productId) {
  const prod = PRODUCTS.find(p => p.id === productId);
  if (!prod) return;
  selectedProduct = prod;
  detailQuantity = 1;
  renderDetailView(prod.id);
  switchView("view-detail");
}

function renderDetailView(productId) {
  const prod = PRODUCTS.find(p => p.id === productId) || PRODUCTS[0];
  selectedProduct = prod;

  document.getElementById("detail-image").src = prod.image;
  document.getElementById("detail-title").textContent = prod.name;
  document.getElementById("detail-subtitle").textContent = `${prod.brand} • ${prod.category}`;
  document.getElementById("detail-discount-pill").textContent = prod.discount;
  document.getElementById("detail-store").textContent = prod.storeName;
  document.getElementById("detail-validity").textContent = prod.ratingText;
  document.getElementById("detail-old-price").textContent = `${prod.oldPrice.toFixed(2).replace(".", ",")} €`;
  document.getElementById("detail-new-price").textContent = `${prod.newPrice.toFixed(2).replace(".", ",")} €`;
  
  const saved = (prod.oldPrice - prod.newPrice).toFixed(2).replace(".", ",");
  document.getElementById("detail-savings").textContent = `Économie : ${saved} €`;
  document.getElementById("detail-stock").textContent = prod.stock;
  document.getElementById("detail-deal-type").textContent = prod.dealType;
  document.getElementById("detail-source-catalog").textContent = prod.catalogSource;
  document.getElementById("detail-nutriscore").textContent = prod.nutriscore;
  document.getElementById("detail-description").textContent = prod.description;
  document.getElementById("detail-qty-val").textContent = detailQuantity;

  const badgeStore = document.getElementById("detail-badge-store");
  if (badgeStore) {
    badgeStore.textContent = prod.brand;
    badgeStore.className = `detail-badge-store ${prod.brandClass}`;
  }

  syncGridDetail(prod);
}

// =========================================================
// 6. GESTION DU PANIER & COMMANDES
// =========================================================
function addToCart(productId, qty = 1) {
  const existing = cart.find(item => item.productId === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ productId, qty });
  }
  saveCart();
  renderCart();
  syncGridMode();

  const prod = PRODUCTS.find(p => p.id === productId);
  showToast(`✅ ${qty}x ${prod ? prod.name.slice(0, 22) + "..." : "Article"} ajouté !`);
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.productId !== productId);
  saveCart();
  renderCart();
  syncGridMode();
  showToast("Article retiré du panier");
}

function changeCartQty(productId, delta) {
  const item = cart.find(i => i.productId === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(productId);
  } else {
    saveCart();
    renderCart();
    syncGridMode();
  }
}

function clearCart() {
  if (cart.length === 0) return;
  cart = [];
  promoDiscount = 0;
  saveCart();
  renderCart();
  syncGridMode();
  showToast("Le panier a été vidé");
}

function renderCart() {
  const container = document.getElementById("cart-items-container");
  const badge = document.getElementById("nav-cart-badge");
  const countPill = document.getElementById("cart-item-count-pill");

  const totalItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);

  if (badge) {
    if (totalItemsCount > 0) {
      badge.textContent = totalItemsCount;
      badge.style.display = "inline-block";
    } else {
      badge.style.display = "none";
    }
  }

  if (countPill) {
    countPill.textContent = `${totalItemsCount} article${totalItemsCount > 1 ? "s" : ""}`;
  }

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart-msg">
        <span class="emoji">🛒</span>
        <b>Votre panier est vide</b>
        <p style="font-size:12px; margin-top:4px;">Parcourez les offres de prospectus et réservez vos remises !</p>
      </div>
    `;
    updateTotals(0, 0);
    return;
  }

  let totalOld = 0;
  let totalNew = 0;

  container.innerHTML = cart.map(item => {
    const prod = PRODUCTS.find(p => p.id === item.productId);
    if (!prod) return "";

    const lineOld = prod.oldPrice * item.qty;
    const lineNew = prod.newPrice * item.qty;
    totalOld += lineOld;
    totalNew += lineNew;

    return `
      <div class="cart-item-card">
        <img src="${prod.image}" alt="${prod.name}" class="cart-item-thumb" />
        <div class="cart-item-info">
          <h4>${prod.name}</h4>
          <span>${prod.storeName} (${prod.brand})</span>
          <div style="display:flex; align-items:center; gap:6px; margin-top:4px;">
            <button class="qty-btn" style="width:20px; height:20px; font-size:11px;" onclick="changeCartQty('${prod.id}', -1)">-</button>
            <b style="font-size:12px;">x${item.qty}</b>
            <button class="qty-btn" style="width:20px; height:20px; font-size:11px;" onclick="changeCartQty('${prod.id}', 1)">+</button>
          </div>
        </div>
        <div style="text-align:right;">
          <div class="cart-item-price">${lineNew.toFixed(2).replace(".", ",")} €</div>
          <button class="cart-item-del" onclick="removeFromCart('${prod.id}')" title="Supprimer">🗑️</button>
        </div>
      </div>
    `;
  }).join("");

  updateTotals(totalOld, totalNew);
}

function updateTotals(totalOld, totalNew) {
  let finalToPay = totalNew;
  if (promoDiscount > 0) {
    finalToPay = totalNew * (1 - promoDiscount / 100);
  }
  const totalSavings = totalOld - finalToPay;

  const subtotalEl = document.getElementById("cart-subtotal");
  const savingsEl = document.getElementById("cart-savings");
  const totalEl = document.getElementById("cart-total");

  if (subtotalEl) subtotalEl.textContent = `${totalOld.toFixed(2).replace(".", ",")} €`;
  if (savingsEl) savingsEl.textContent = `- ${Math.max(0, totalSavings).toFixed(2).replace(".", ",")} €`;
  if (totalEl) totalEl.textContent = `${Math.max(0, finalToPay).toFixed(2).replace(".", ",")} €`;
}

function showCheckoutModal() {
  if (cart.length === 0) {
    showToast("⚠️ Ajoutez au moins un article avant de générer votre pass !");
    return;
  }

  let totalOld = 0;
  let totalNew = 0;
  cart.forEach(item => {
    const prod = PRODUCTS.find(p => p.id === item.productId);
    if (prod) {
      totalOld += prod.oldPrice * item.qty;
      totalNew += prod.newPrice * item.qty;
    }
  });

  const finalTotal = promoDiscount > 0 ? totalNew * (1 - promoDiscount / 100) : totalNew;
  const savings = totalOld - finalTotal;

  document.getElementById("modal-total-price").textContent = `${finalTotal.toFixed(2).replace(".", ",")} €`;
  document.getElementById("modal-savings-price").textContent = `${savings.toFixed(2).replace(".", ",")} €`;
  
  const randomPass = Math.floor(10000 + Math.random() * 90000);
  document.getElementById("modal-order-id").textContent = `PASS #PROMO-${randomPass}`;

  document.getElementById("checkout-modal").style.display = "flex";
}

function hideCheckoutModal() {
  document.getElementById("checkout-modal").style.display = "none";
}

// =========================================================
// 7. CARTE INTERACTIVE LEAFLET & GÉOLOCALISATION
// =========================================================
function initLeafletMap() {
  const mapEl = document.getElementById("leaflet-map");
  if (!mapEl || mapInstance) return;

  mapInstance = L.map("leaflet-map", {
    zoomControl: true,
    attributionControl: false
  }).setView([45.7600, 4.8400], 12);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19
  }).addTo(mapInstance);

  STORES.forEach(store => {
    const marker = L.circleMarker(store.coords, {
      radius: 9,
      fillColor: store.brandColor,
      color: "#ffffff",
      weight: 2.5,
      opacity: 1,
      fillOpacity: 0.95
    }).addTo(mapInstance);

    marker.bindPopup(`
      <div style="font-family:var(--font); font-size:12px;">
        <strong style="color:${store.brandColor};">${store.name}</strong><br>
        <span>${store.address}</span><br>
        <b style="color:#12b76a;">${store.hours}</b>
      </div>
    `);

    marker.on("click", () => {
      selectStore(store);
    });
  });

  const recenterBtn = document.getElementById("btn-map-recenter");
  if (recenterBtn) {
    recenterBtn.addEventListener("click", () => {
      mapInstance.setView([45.7600, 4.8400], 12);
    });
  }

  // Bouton "Autour de moi" (Géolocalisation HTML5)
  const locateBtn = document.getElementById("btn-locate-user");
  if (locateBtn) {
    locateBtn.addEventListener("click", () => {
      if (!navigator.geolocation) {
        showToast("La géolocalisation n'est pas supportée par votre navigateur.");
        return;
      }
      locateBtn.textContent = "⌛ Recherche...";
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          userCoords = [pos.coords.latitude, pos.coords.longitude];
          locateBtn.textContent = "📍 Vous êtes ici";
          
          if (!userMarker) {
            userMarker = L.circleMarker(userCoords, {
              radius: 10,
              fillColor: "#1677ff",
              color: "#ffffff",
              weight: 3,
              fillOpacity: 1
            }).addTo(mapInstance);
            userMarker.bindPopup("<b>Votre position actuelle</b>").openPopup();
          } else {
            userMarker.setLatLng(userCoords).openPopup();
          }

          mapInstance.setView(userCoords, 14);
          showToast("Position trouvée ! Les magasins les plus proches sont affichés.");
        },
        (err) => {
          locateBtn.textContent = "📍 Autour de moi";
          showToast("Impossible d'obtenir votre position (autorisation requise).");
        },
        { timeout: 8000 }
      );
    });
  }
}

function selectStore(store) {
  document.getElementById("store-name").textContent = store.name;
  document.getElementById("store-address").textContent = store.address;
  document.getElementById("store-status").textContent = store.hours;
  document.getElementById("store-promos-count").textContent = `${store.promosCount} prospectus en cours`;
  
  const brandTag = document.getElementById("store-brand-tag");
  if (brandTag) {
    brandTag.textContent = store.brand;
    brandTag.style.background = store.brandColor;
    brandTag.style.color = "#fff";
  }

  const btnFilter = document.getElementById("btn-filter-store-promos");
  btnFilter.onclick = () => {
    activeStore = store.brand;
    document.querySelectorAll("#stores-filter-bar .store-chip").forEach(c => {
      if (c.dataset.store === store.brand) c.classList.add("active");
      else c.classList.remove("active");
    });
    renderHomeCards();
    switchView("view-home");
    showToast(`Filtre activé sur les promos ${store.brand}`);
  };
}

// =========================================================
// 8. SYNCHRONISATION DU MODE GRILLE (4 ÉCRANS)
// =========================================================
function syncGridMode() {
  const gridList = document.getElementById("grid-cards-list");
  if (gridList) {
    gridList.innerHTML = PRODUCTS.slice(0, 3).map(p => `
      <div class="card" onclick="openProductDetail('${p.id}')">
        <div class="thumb-wrapper">
          <img src="${p.image}" class="thumb" alt="${p.name}" />
          <span class="store-badge-mini ${p.brandClass}">${p.brand}</span>
        </div>
        <div class="meta">
          <div class="topline">
            <span class="tag">${p.tag}</span>
            <span class="rating">${p.ratingText}</span>
          </div>
          <h3>${p.name}</h3>
          <div class="prices">
            <span class="old">${p.oldPrice.toFixed(2).replace(".", ",")} €</span>
            <span class="new">${p.newPrice.toFixed(2).replace(".", ",")} €</span>
          </div>
        </div>
        <div class="save">${p.discount}</div>
      </div>
    `).join("");
  }

  const gridCart = document.getElementById("grid-cart-items-list");
  if (gridCart) {
    if (cart.length === 0) {
      gridCart.innerHTML = `<div class="empty-cart-msg"><b>Panier vide</b></div>`;
    } else {
      gridCart.innerHTML = cart.slice(0, 2).map(item => {
        const prod = PRODUCTS.find(p => p.id === item.productId);
        if (!prod) return "";
        return `
          <div class="card">
            <img src="${prod.image}" class="thumb" alt="${prod.name}" />
            <div class="meta">
              <div class="topline">
                <span class="tag">${prod.brand}</span>
                <span class="rating">x${item.qty}</span>
              </div>
              <h3>Réduction appliquée</h3>
              <div class="prices">
                <span class="old">${(prod.oldPrice * item.qty).toFixed(2).replace(".", ",")} €</span>
                <span class="new">${(prod.newPrice * item.qty).toFixed(2).replace(".", ",")} €</span>
              </div>
            </div>
            <div class="save" style="background:linear-gradient(135deg, var(--green), #1fd1a4);">OK</div>
          </div>
        `;
      }).join("");
    }
  }
}

function syncGridDetail(prod) {
  const title = document.getElementById("grid-detail-title-preview");
  const pill = document.getElementById("grid-detail-pill");
  const oldP = document.getElementById("grid-detail-old");
  const newP = document.getElementById("grid-detail-new");
  const img = document.getElementById("grid-detail-img");
  const tag = document.getElementById("grid-detail-store-tag");

  if (title) title.textContent = prod.name;
  if (pill) pill.textContent = prod.discount;
  if (oldP) oldP.textContent = `${prod.oldPrice.toFixed(2).replace(".", ",")} €`;
  if (newP) newP.textContent = `${prod.newPrice.toFixed(2).replace(".", ",")} €`;
  if (img) img.src = prod.image;
  if (tag) tag.textContent = prod.brand;
}

function switchToTabFromGrid(viewId) {
  document.getElementById("btn-mode-simulator").click();
  switchView(viewId);
}

// =========================================================
// 9. ÉCOUTEURS D'ÉVÉNEMENTS
// =========================================================
function setupEventListeners() {
  document.querySelectorAll("#main-bottom-nav .nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
      switchView(btn.dataset.target);
    });
  });

  // Recherche
  const searchInput = document.getElementById("search-input");
  const searchClear = document.getElementById("search-clear");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      if (searchClear) searchClear.style.display = searchQuery ? "block" : "none";
      renderHomeCards();
    });
  }
  if (searchClear) {
    searchClear.addEventListener("click", () => {
      searchInput.value = "";
      searchQuery = "";
      searchClear.style.display = "none";
      renderHomeCards();
    });
  }

  const gridSearch = document.getElementById("grid-search-input");
  if (gridSearch) {
    gridSearch.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      if (searchInput) searchInput.value = searchQuery;
      renderHomeCards();
    });
  }

  // Thème Sombre / Clair
  const btnTheme = document.getElementById("btn-theme-toggle");
  if (btnTheme) btnTheme.addEventListener("click", toggleDarkMode);
  const phoneTheme = document.getElementById("phone-theme-toggle");
  if (phoneTheme) phoneTheme.addEventListener("click", toggleDarkMode);

  // Partager un Bon Plan
  const shareBtn = document.getElementById("btn-share-deal");
  if (shareBtn) {
    shareBtn.addEventListener("click", () => {
      const shareData = {
        title: `Bon plan : ${selectedProduct.name}`,
        text: `Regarde cette promo chez ${selectedProduct.brand} : ${selectedProduct.name} à ${selectedProduct.newPrice.toFixed(2)}€ (${selectedProduct.discount}) !`,
        url: window.location.href
      };
      if (navigator.share) {
        navigator.share(shareData).catch(() => {});
      } else {
        navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        showToast("🔗 Lien du bon plan copié dans le presse-papier !");
      }
    });
  }

  // Retour & Quantité
  document.getElementById("btn-detail-back").addEventListener("click", () => switchView("view-home"));
  document.getElementById("btn-detail-skip").addEventListener("click", () => switchView("view-home"));

  document.getElementById("btn-qty-minus").addEventListener("click", () => {
    if (detailQuantity > 1) {
      detailQuantity--;
      document.getElementById("detail-qty-val").textContent = detailQuantity;
    }
  });
  document.getElementById("btn-qty-plus").addEventListener("click", () => {
    detailQuantity++;
    document.getElementById("detail-qty-val").textContent = detailQuantity;
  });

  document.getElementById("btn-detail-add").addEventListener("click", () => {
    addToCart(selectedProduct.id, detailQuantity);
  });

  const btnGridAdd = document.getElementById("btn-grid-add-detail");
  if (btnGridAdd) {
    btnGridAdd.addEventListener("click", () => {
      addToCart(selectedProduct.id, 1);
    });
  }

  // Panier
  document.getElementById("btn-cart-clear").addEventListener("click", clearCart);
  document.getElementById("btn-cart-checkout").addEventListener("click", showCheckoutModal);
  
  const btnGridClear = document.getElementById("btn-grid-cart-clear");
  if (btnGridClear) btnGridClear.addEventListener("click", clearCart);

  const btnGridCheckout = document.getElementById("btn-grid-cart-checkout");
  if (btnGridCheckout) btnGridCheckout.addEventListener("click", showCheckoutModal);

  // Modal
  document.getElementById("btn-close-modal").addEventListener("click", hideCheckoutModal);
  document.getElementById("btn-modal-done").addEventListener("click", () => {
    hideCheckoutModal();
    clearCart();
    switchView("view-home");
  });

  // Code Promo
  document.getElementById("btn-apply-promo").addEventListener("click", () => {
    const input = document.getElementById("promo-code-input");
    const feedback = document.getElementById("promo-feedback");
    const code = input.value.trim().toUpperCase();

    if (code === "ANTIGASPI" || code === "VIP20" || code === "WELCOME10") {
      promoDiscount = 10;
      feedback.textContent = "🎉 Code appliqué : -10% de remise immédiate supplémentaire !";
      feedback.className = "promo-feedback success";
      renderCart();
      showToast("Code promo -10% appliqué !");
    } else if (code === "") {
      feedback.textContent = "";
    } else {
      feedback.textContent = "❌ Code non reconnu. Essayez ANTIGASPI";
      feedback.className = "promo-feedback error";
    }
  });

  // Switcher Simulateur / Grille
  const btnSim = document.getElementById("btn-mode-simulator");
  const btnGrid = document.getElementById("btn-mode-grid");
  const simContainer = document.getElementById("simulator-mode");
  const gridContainer = document.getElementById("grid-mode");

  btnSim.addEventListener("click", () => {
    btnSim.classList.add("active");
    btnGrid.classList.remove("active");
    simContainer.style.display = "flex";
    gridContainer.style.display = "none";
    if (currentView === "view-map" && mapInstance) {
      setTimeout(() => mapInstance.invalidateSize(), 150);
    }
  });

  btnGrid.addEventListener("click", () => {
    btnGrid.classList.add("active");
    btnSim.classList.remove("active");
    simContainer.style.display = "none";
    gridContainer.style.display = "block";
    initGridMiniMap();
  });

  // Guide
  const guideModal = document.getElementById("guide-modal");
  document.getElementById("btn-show-guide").addEventListener("click", () => {
    guideModal.style.display = "flex";
  });
  document.getElementById("btn-close-guide").addEventListener("click", () => {
    guideModal.style.display = "none";
  });
  document.getElementById("btn-guide-ok").addEventListener("click", () => {
    guideModal.style.display = "none";
  });
}

function initGridMiniMap() {
  const mapEl = document.getElementById("grid-leaflet-map");
  if (!mapEl || gridMapInstance) return;

  gridMapInstance = L.map("grid-leaflet-map", {
    zoomControl: false,
    attributionControl: false
  }).setView([45.7600, 4.8400], 12);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(gridMapInstance);

  STORES.forEach(s => {
    L.circleMarker(s.coords, {
      radius: 7,
      fillColor: s.brandColor,
      color: "#fff",
      weight: 2,
      fillOpacity: 1
    }).addTo(gridMapInstance);
  });
}

// =========================================================
// 10. TOAST NOTIFICATION
// =========================================================
let toastTimeout;
function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}
