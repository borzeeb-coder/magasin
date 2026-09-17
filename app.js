/**
 * PROMO APP - Bons Plans & Anti-Gaspi
 * Logique applicative & Intégrations interactives
 */

// =========================================================
// 1. BASE DE DONNÉES LOCALE (Produits & Magasins)
// =========================================================
const PRODUCTS = [
  {
    id: "p1",
    name: "Poulet fermier entier Label Rouge",
    category: "Boucherie",
    tag: "Promos",
    ratingText: "Valide aujourd’hui",
    oldPrice: 11.00,
    newPrice: 6.95,
    discount: "-37%",
    storeId: "s1",
    storeName: "Lyon Part-Dieu",
    distance: "600 m",
    stock: "4 restants",
    image: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=500&auto=format&fit=crop&q=80",
    description: "Poulet fermier élevé en plein air, certifié Label Rouge. Date limite de consommation courte : sauvez ce produit du gaspillage tout en faisant des économies !"
  },
  {
    id: "p2",
    name: "Panier fruits & légumes de saison",
    category: "Fruits",
    tag: "Offre",
    ratingText: "Jusqu’au 30/09",
    oldPrice: 4.50,
    newPrice: 2.99,
    discount: "-33%",
    storeId: "s2",
    storeName: "Lyon Bellecour",
    distance: "1.2 km",
    stock: "7 paniers",
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&auto=format&fit=crop&q=80",
    description: "Assortiment vitaminé (pommes, poires, carottes, courgettes) issu de producteurs locaux de la région Auvergne-Rhône-Alpes."
  },
  {
    id: "p3",
    name: "Baguettes tradition & Croissants bio",
    category: "Boulangerie",
    tag: "Anti-gaspi",
    ratingText: "À récupérer ce soir",
    oldPrice: 3.80,
    newPrice: 1.50,
    discount: "-60%",
    storeId: "s3",
    storeName: "Croix-Rousse",
    distance: "850 m",
    stock: "5 lots",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80",
    description: "Lot du soir de votre boulanger artisan : 2 baguettes tradition au levain naturel + 3 viennoiseries pur beurre."
  },
  {
    id: "p4",
    name: "Pavé de saumon d'Écosse frais",
    category: "Frais",
    tag: "Frais du jour",
    ratingText: "Valide aujourd’hui",
    oldPrice: 14.90,
    newPrice: 8.90,
    discount: "-40%",
    storeId: "s1",
    storeName: "Lyon Part-Dieu",
    distance: "600 m",
    stock: "2 barquettes",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&auto=format&fit=crop&q=80",
    description: "Saumon riche en oméga-3, levé le matin même. Idéal pour cuisson à la poêle ou au four en papillote."
  },
  {
    id: "p5",
    name: "Plateau Fromages AOP (Saint-Marcellin & Comté)",
    category: "Frais",
    tag: "Date courte",
    ratingText: "Valide 48h",
    oldPrice: 8.20,
    newPrice: 4.50,
    discount: "-45%",
    storeId: "s5",
    storeName: "Lyon Confluence",
    distance: "2.1 km",
    stock: "6 pièces",
    image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&auto=format&fit=crop&q=80",
    description: "Sélection affinée comprenant un Saint-Marcellin crémeux et 200g de Comté 18 mois d'affinage."
  },
  {
    id: "p6",
    name: "Huile d'olive extra vierge Bio 75cl",
    category: "Épicerie",
    tag: "Déstockage",
    ratingText: "Jusqu'au 15/10",
    oldPrice: 9.90,
    newPrice: 6.50,
    discount: "-34%",
    storeId: "s4",
    storeName: "Lyon Guillotière",
    distance: "1.5 km",
    stock: "10 bouteilles",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80",
    description: "Première pression à froid, origine Provence. Parfait pour sublimer vos salades et plats méditerranéens."
  }
];

const STORES = [
  {
    id: "s1",
    name: "Carrefour Market Part-Dieu",
    coords: [45.7602, 4.8589],
    address: "12 Rue Servient, 69003 Lyon",
    hours: "Ouvert jusqu'à 20h30",
    promosCount: 4
  },
  {
    id: "s2",
    name: "Monoprix Bellecour",
    coords: [45.7578, 4.8320],
    address: "27 Rue de la République, 69002 Lyon",
    hours: "Ouvert jusqu'à 21h00",
    promosCount: 3
  },
  {
    id: "s3",
    name: "Fournil Bio Croix-Rousse",
    coords: [45.7745, 4.8315],
    address: "14 Place de la Croix-Rousse, 69004 Lyon",
    hours: "Ouvert jusqu'à 19h30",
    promosCount: 2
  },
  {
    id: "s4",
    name: "Super U Guillotière",
    coords: [45.7533, 4.8436],
    address: "45 Grande Rue de la Guillotière, 69007 Lyon",
    hours: "Ouvert jusqu'à 20h00",
    promosCount: 3
  },
  {
    id: "s5",
    name: "Casino Confluence",
    coords: [45.7420, 4.8185],
    address: "112 Cours Charlemagne, 69002 Lyon",
    hours: "Ouvert jusqu'à 20h30",
    promosCount: 2
  }
];

// =========================================================
// 2. ÉTAT DE L'APPLICATION (STATE)
// =========================================================
let currentView = "view-home";
let activeCategory = "all";
let searchQuery = "";
let selectedProduct = PRODUCTS[0];
let detailQuantity = 1;
let promoDiscount = 0; // pourcentage de rabais additionnel
let mapInstance = null;
let gridMapInstance = null;

// Initialisation du panier avec le produit 1 prérempli (comme dans la maquette)
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
  initClock();
  renderCategories();
  renderHomeCards();
  renderDetailView(selectedProduct.id);
  renderCart();
  setupEventListeners();
  initLeafletMap();
  syncGridMode();
});

// Horloge temps réel pour la barre d'état
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

  // Mise à jour de la barre de navigation
  document.querySelectorAll("#main-bottom-nav .nav-item").forEach(btn => {
    if (btn.dataset.target === targetViewId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Si on passe sur la carte, déclencher un redimensionnement Leaflet
  if (targetViewId === "view-map" && mapInstance) {
    setTimeout(() => {
      mapInstance.invalidateSize();
    }, 150);
  }
}

// =========================================================
// 4. RENDU DE L'ACCUEIL (LISTE PROMOS)
// =========================================================
function renderHomeCards() {
  const container = document.getElementById("home-cards-list");
  if (!container) return;

  const filtered = PRODUCTS.filter(p => {
    const matchCat = activeCategory === "all" || p.category.toLowerCase() === activeCategory.toLowerCase();
    const query = searchQuery.trim().toLowerCase();
    const matchSearch = !query || p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query) || p.storeName.toLowerCase().includes(query);
    return matchCat && matchSearch;
  });

  document.getElementById("badge-promo-count").textContent = `${filtered.length} Offres`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:30px 10px; color:var(--muted);">
        <span style="font-size:32px; display:block; margin-bottom:8px;">🔍</span>
        <b>Aucune promo trouvée</b>
        <p style="font-size:12px; margin-top:4px;">Essayez avec un autre mot-clé ou catégorie.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(p => `
    <div class="card" onclick="openProductDetail('${p.id}')">
      <img src="${p.image}" alt="${p.name}" class="thumb" loading="lazy" />
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
  document.getElementById("detail-subtitle").textContent = prod.category;
  document.getElementById("detail-discount-pill").textContent = prod.discount;
  document.getElementById("detail-store").textContent = prod.storeName;
  document.getElementById("detail-validity").textContent = prod.ratingText;
  document.getElementById("detail-old-price").textContent = `${prod.oldPrice.toFixed(2).replace(".", ",")} €`;
  document.getElementById("detail-new-price").textContent = `${prod.newPrice.toFixed(2).replace(".", ",")} €`;
  
  const saved = (prod.oldPrice - prod.newPrice).toFixed(2).replace(".", ",");
  document.getElementById("detail-savings").textContent = `Économie : ${saved} €`;
  document.getElementById("detail-stock").textContent = prod.stock;
  document.getElementById("detail-distance").textContent = prod.distance;
  document.getElementById("detail-description").textContent = prod.description;
  document.getElementById("detail-qty-val").textContent = detailQuantity;

  // Sync avec la grille
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
  showToast(`✅ ${qty}x ${prod ? prod.name : "Article"} ajouté au panier !`);
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

  // Badge navigation
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
        <p style="font-size:12px; margin-top:4px;">Parcourez les offres et réservez vos produits anti-gaspi !</p>
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
          <span>${prod.storeName}</span>
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

// Modal de commande avec QR Code
function showCheckoutModal() {
  if (cart.length === 0) {
    showToast("⚠️ Ajoutez au moins un article avant de commander !");
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
  document.getElementById("modal-order-id").textContent = `PASS #AG-${randomPass}`;

  document.getElementById("checkout-modal").style.display = "flex";
}

function hideCheckoutModal() {
  document.getElementById("checkout-modal").style.display = "none";
}

// =========================================================
// 7. CARTE INTERACTIVE LEAFLET (OpenStreetMap)
// =========================================================
function initLeafletMap() {
  const mapEl = document.getElementById("leaflet-map");
  if (!mapEl || mapInstance) return;

  // Centré sur Lyon
  mapInstance = L.map("leaflet-map", {
    zoomControl: true,
    attributionControl: false
  }).setView([45.7600, 4.8400], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19
  }).addTo(mapInstance);

  // Marqueurs des magasins
  STORES.forEach(store => {
    const marker = L.circleMarker(store.coords, {
      radius: 9,
      fillColor: "#ff5a3c",
      color: "#ffffff",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.95
    }).addTo(mapInstance);

    marker.bindPopup(`
      <div style="font-family:var(--font); font-size:12px;">
        <strong style="color:#ff5a3c;">${store.name}</strong><br>
        <span>${store.address}</span><br>
        <b style="color:#12b76a;">${store.hours}</b>
      </div>
    `);

    marker.on("click", () => {
      selectStore(store);
    });
  });

  // Recentrage
  const recenterBtn = document.getElementById("btn-map-recenter");
  if (recenterBtn) {
    recenterBtn.addEventListener("click", () => {
      mapInstance.setView([45.7600, 4.8400], 13);
    });
  }
}

function selectStore(store) {
  document.getElementById("store-name").textContent = store.name;
  document.getElementById("store-address").textContent = store.address;
  document.getElementById("store-status").textContent = store.hours;
  document.getElementById("store-promos-count").textContent = `${store.promosCount} promos actives`;

  const btnFilter = document.getElementById("btn-filter-store-promos");
  btnFilter.onclick = () => {
    searchQuery = store.name.split(" ")[0]; // ex: "Carrefour"
    document.getElementById("search-input").value = searchQuery;
    renderHomeCards();
    switchView("view-home");
  };
}

// =========================================================
// 8. SYNCHRONISATION DU MODE GRILLE (4 ÉCRANS)
// =========================================================
function syncGridMode() {
  // 1. Liste du Phone 1
  const gridList = document.getElementById("grid-cards-list");
  if (gridList) {
    gridList.innerHTML = PRODUCTS.slice(0, 3).map(p => `
      <div class="card" onclick="openProductDetail('${p.id}')">
        <img src="${p.image}" class="thumb" alt="${p.name}" />
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

  // 2. Panier du Phone 4
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
                <span class="tag">${prod.name.split(" ")[0]}</span>
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
  const title = document.getElementById("grid-detail-name");
  const pill = document.getElementById("grid-detail-pill");
  const oldP = document.getElementById("grid-detail-old");
  const newP = document.getElementById("grid-detail-new");
  const img = document.getElementById("grid-detail-img");

  if (title) title.textContent = prod.name;
  if (pill) pill.textContent = prod.discount;
  if (oldP) oldP.textContent = `${prod.oldPrice.toFixed(2).replace(".", ",")} €`;
  if (newP) newP.textContent = `${prod.newPrice.toFixed(2).replace(".", ",")} €`;
  if (img) img.src = prod.image;
}

function switchToTabFromGrid(viewId) {
  // Active le mode simulateur et bascule sur la vue choisie
  document.getElementById("btn-mode-simulator").click();
  switchView(viewId);
}

function quickAddCurrentToCart() {
  addToCart(selectedProduct.id, 1);
  showToast("Offre utilisée et ajoutée au panier !");
}

// =========================================================
// 9. ÉCOUTEURS D'ÉVÉNEMENTS (EVENT LISTENERS)
// =========================================================
function setupEventListeners() {
  // Navigation inférieure simulateur
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

  // Recherche synchronisée depuis la grille
  const gridSearch = document.getElementById("grid-search-input");
  if (gridSearch) {
    gridSearch.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      if (searchInput) searchInput.value = searchQuery;
      renderHomeCards();
    });
  }

  // Boutons Retour et Quantité vue détail
  document.getElementById("btn-detail-back").addEventListener("click", () => {
    switchView("view-home");
  });
  document.getElementById("btn-detail-skip").addEventListener("click", () => {
    switchView("view-home");
  });

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

  // Bouton utiliser dans la grille
  const btnGridAdd = document.getElementById("btn-grid-add-detail");
  if (btnGridAdd) {
    btnGridAdd.addEventListener("click", () => {
      quickAddCurrentToCart();
    });
  }

  // Panier : Vider & Commander
  document.getElementById("btn-cart-clear").addEventListener("click", clearCart);
  document.getElementById("btn-cart-checkout").addEventListener("click", showCheckoutModal);
  
  const btnGridClear = document.getElementById("btn-grid-cart-clear");
  if (btnGridClear) btnGridClear.addEventListener("click", clearCart);

  const btnGridCheckout = document.getElementById("btn-grid-cart-checkout");
  if (btnGridCheckout) btnGridCheckout.addEventListener("click", showCheckoutModal);

  // Modals
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

    if (code === "ANTIGASPI" || code === "WELCOME10") {
      promoDiscount = 10;
      feedback.textContent = "🎉 Code appliqué : -10% de réduction immédiate supplémentaire !";
      feedback.className = "promo-feedback success";
      renderCart();
      showToast("Code promo -10% appliqué !");
    } else if (code === "") {
      feedback.textContent = "";
    } else {
      feedback.textContent = "❌ Code invalide. Essayez ANTIGASPI";
      feedback.className = "promo-feedback error";
    }
  });

  // Switch de mode : Simulateur vs Grille
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

  // Modal Guide
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
      fillColor: "#ff5a3c",
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
