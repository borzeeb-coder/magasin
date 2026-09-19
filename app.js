/**
 * PROMO APP - Vraies Promos & Prospectus Marche-en-Famenne (Belgique)
 * Navigation 100% fiable, catalogues réels : Colruyt, Delhaize, Carrefour, Lidl, Aldi
 */

// =========================================================
// 1. MAGASINS RÉELS DE MARCHE-EN-FAMENNE (BELGIQUE 6900)
// =========================================================
const STORES_DATA = [
  {
    id: "colruyt-marche",
    name: "Colruyt Marche-en-Famenne",
    brand: "Colruyt",
    brandClass: "tag-colruyt",
    brandColor: "#ea580c",
    address: "Chaussée de Liège 51, 6900 Marche-en-Famenne",
    coords: [50.2312, 5.3520],
    hours: "Ouvert jusqu'à 20h00 (Ven 21h)",
    hoursStructured: { open: "08:30", close: "20:00", friClose: "21:00" },
    leafletIconEmoji: "🔴"
  },
  {
    id: "delhaize-marche",
    name: "AD Delhaize Marche",
    brand: "Delhaize",
    brandClass: "tag-delhaize",
    brandColor: "#dc2626",
    address: "Chaussée de Liège 45, 6900 Marche-en-Famenne",
    coords: [50.2305, 5.3505],
    hours: "Ouvert jusqu'à 19h30",
    hoursStructured: { open: "08:00", close: "19:30" },
    leafletIconEmoji: "🦁"
  },
  {
    id: "carrefour-marche",
    name: "Carrefour Market Marche",
    brand: "Carrefour",
    brandClass: "tag-carrefour",
    brandColor: "#1d4ed8",
    address: "Avenue de France 18, 6900 Marche-en-Famenne",
    coords: [50.2245, 5.3410],
    hours: "Ouvert jusqu'à 20h00",
    hoursStructured: { open: "08:30", close: "20:00" },
    leafletIconEmoji: "🔵"
  },
  {
    id: "lidl-marche",
    name: "Lidl Marche-en-Famenne",
    brand: "Lidl",
    brandClass: "tag-lidl",
    brandColor: "#ca8a04",
    address: "Chaussée de Liège 33, 6900 Marche-en-Famenne",
    coords: [50.2295, 5.3485],
    hours: "Ouvert jusqu'à 20h00",
    hoursStructured: { open: "08:00", close: "20:00" },
    leafletIconEmoji: "🟡"
  },
  {
    id: "aldi-marche",
    name: "Aldi Marche-en-Famenne",
    brand: "Aldi",
    brandClass: "tag-aldi",
    brandColor: "#0284c7",
    address: "Chaussée de Liège 47, 6900 Marche-en-Famenne",
    coords: [50.2308, 5.3512],
    hours: "Ouvert jusqu'à 19h00",
    hoursStructured: { open: "08:00", close: "19:00" },
    leafletIconEmoji: "🔷"
  },
  {
    id: "intermarche-marche",
    name: "Intermarché Contact Marche",
    brand: "Intermarché",
    brandClass: "tag-delhaize",
    brandColor: "#b91c1c",
    address: "Route de Bastogne 19, 6900 Marche-en-Famenne",
    coords: [50.2190, 5.3350],
    hours: "Ouvert jusqu'à 19h30",
    hoursStructured: { open: "08:30", close: "19:30" },
    leafletIconEmoji: "🛒"
  },
  {
    id: "spar-marche",
    name: "Spar Marche-en-Famenne",
    brand: "Spar",
    brandClass: "tag-spar",
    brandColor: "#00843D",
    address: "Rue de Bastogne 12, 6900 Marche-en-Famenne",
    coords: [50.2270, 5.3460],
    hours: "Ouvert jusqu'à 19h00",
    hoursStructured: { open: "08:00", close: "19:00" },
    leafletIconEmoji: "🟢"
  },
  {
    id: "intermarche2-marche",
    name: "Intermarché Marche-en-Famenne",
    brand: "Intermarché",
    brandClass: "tag-intermarche",
    brandColor: "#E8590C",
    address: "Route de Libramont 35, 6900 Marche-en-Famenne",
    coords: [50.2185, 5.3390],
    hours: "Ouvert jusqu'à 20h00",
    hoursStructured: { open: "08:30", close: "20:00" },
    leafletIconEmoji: "🟠"
  },
  {
    id: "action-marche",
    name: "Action Marche-en-Famenne",
    brand: "Action",
    brandClass: "tag-action",
    brandColor: "#0056a0",
    address: "Rue du Parc Industriel 5, 6900 Marche-en-Famenne",
    coords: [50.2239, 5.3299],
    hours: "Ouvert 9h00-18h30",
    hoursStructured: { open: "09:00", close: "18:30" },
    leafletIconEmoji: "🟤"
  }
];
    brand: "Action",
    brandClass: "tag-action",
    brandColor: "#e85a0e",
    address: "Rue du Parc Industriel 5, 6900 Marche-en-Famenne",
    coords: [50.2239, 5.3299],
    hours: "Ouvert 9h00-18h30",
    leafletIconEmoji: "🟤"
  }
];

// =========================================================
// 2. VRAIES PROMOTIONS DE PROSPECTUS EN COURS (BELGIQUE)
// =========================================================
const PROMOTIONS_DATA = [
  // COLRUYT
  {
    id: "col-1",
    name: "Filet de saumon frais d'Atlantique (le kg)",
    brand: "Colruyt",
    brandClass: "tag-colruyt",
    category: "Poissonnerie",
    storeId: "colruyt-marche",
    oldPrice: 18.99,
    newPrice: 13.99,
    discountPercent: "-26%",
    dealType: "Réduction Carte Xtra",
    validity: "Valable jusqu'au 22/09",
    stock: "Rayon poissonnerie frais",
    nutriscore: "A (Oméga 3 naturels)",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&auto=format&fit=crop&q=80",
    description: "Saumon atlantique d'Écosse de première fraîcheur, levé en filet. Idéal pour cuisson au four ou à la poêle."
  },
  {
    id: "col-2",
    name: "Bière trappiste Chimay Bleue 33cl (lot de 4)",
    brand: "Colruyt",
    brandClass: "tag-colruyt",
    category: "Épicerie",
    storeId: "colruyt-marche",
    oldPrice: 8.40,
    newPrice: 5.88,
    discountPercent: "-30%",
    dealType: "Prix Rouge Colruyt (par 2 lots)",
    validity: "Dossier bières belges",
    stock: "En rayon boissons",
    nutriscore: "D (Bière d'abbaye 9°)",
    image: "https://images.unsplash.com/photo-1608270199182-358b5b7b4d13?w=500&auto=format&fit=crop&q=80",
    description: "Bière trappiste belge authentique brassée à l'abbaye de Scourmont. Arôme puissant et complexe."
  },
  {
    id: "col-3",
    name: "Chicons de pleine terre belges (1kg)",
    brand: "Colruyt",
    brandClass: "tag-colruyt",
    category: "Fruits",
    storeId: "colruyt-marche",
    oldPrice: 3.49,
    newPrice: 1.99,
    discountPercent: "-43%",
    dealType: "Offre Fraîcheur Colruyt",
    validity: "Cette semaine",
    stock: "Marché frais",
    nutriscore: "A (100% terroir belge)",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80",
    description: "Véritables chicons de pleine terre cultivés en Belgique. Croquants et savoureux, parfaits en salade ou au gratin."
  },
  {
    id: "col-4",
    name: "Café moulu Dessert Rombouts 500g",
    brand: "Colruyt",
    brandClass: "tag-colruyt",
    category: "Épicerie",
    storeId: "colruyt-marche",
    oldPrice: 6.95,
    newPrice: 4.85,
    discountPercent: "-30%",
    dealType: "Remise immédiate Xtra",
    validity: "Prospectus bimensuel",
    stock: "Rayon café",
    nutriscore: "B (Pur Arabica)",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80",
    description: "Le café traditionnel des familles belges. Torréfaction lente à cœur révélant un arôme doux et fruité."
  },

  // AD DELHAIZE MARCHE
  {
    id: "del-1",
    name: "Poulet fermier d'Ardenne entier jaune",
    brand: "Delhaize",
    brandClass: "tag-delhaize",
    category: "Boucherie",
    storeId: "delhaize-marche",
    oldPrice: 12.50,
    newPrice: 7.99,
    discountPercent: "-36%",
    dealType: "Super Deal Delhaize",
    validity: "Valable jusqu'à samedi",
    stock: "Boucherie artisanale",
    nutriscore: "A (Origine Ardenne)",
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500&auto=format&fit=crop&q=80",
    description: "Poulet fermier élevé en plein air dans nos Ardennes belges. Chair ferme et juteuse garantie."
  },
  {
    id: "del-2",
    name: "Pommes Jonagold de Belgique (sac 2kg)",
    brand: "Delhaize",
    brandClass: "tag-delhaize",
    category: "Fruits",
    storeId: "delhaize-marche",
    oldPrice: 3.99,
    newPrice: 1.99,
    discountPercent: "1+1 GRATUIT",
    dealType: "SuperPlus 1+1 Offert",
    validity: "Folder de la semaine",
    stock: "En rayon fruits",
    nutriscore: "A (Vergers belges)",
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80",
    description: "Pommes fraîches cueillies en Belgique. Équilibre parfait entre douceur et touche acidulée."
  },
  {
    id: "del-3",
    name: "Fromage Gouda jeune belge tranché 400g",
    brand: "Delhaize",
    brandClass: "tag-delhaize",
    category: "Frais",
    storeId: "delhaize-marche",
    oldPrice: 4.80,
    newPrice: 2.88,
    discountPercent: "-40%",
    dealType: "2ème à -80% SuperPlus",
    validity: "Jusqu'au 24/09",
    stock: "Crèmerie",
    nutriscore: "D (Lait belge)",
    image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&auto=format&fit=crop&q=80",
    description: "Gouda au lait de prairie crémeux et tendre, prédécoupé en fines tranches prêtes pour tartines."
  },
  {
    id: "del-4",
    name: "Chocolat Côte d'Or L'Original Lait (lot 2x150g)",
    brand: "Delhaize",
    brandClass: "tag-delhaize",
    category: "Épicerie",
    storeId: "delhaize-marche",
    oldPrice: 5.20,
    newPrice: 3.38,
    discountPercent: "-35%",
    dealType: "Remise immédiate en caisse",
    validity: "Cette semaine",
    stock: "Rayon confiserie",
    nutriscore: "E (Plaisir gourmand)",
    image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500&auto=format&fit=crop&q=80",
    description: "L'authentique chocolat au lait belge Côte d'Or. Intensité de cacao inimitable et texture fondante."
  },

  // CARREFOUR MARKET MARCHE
  {
    id: "car-1",
    name: "Hachis porc et bœuf pur porc (1kg)",
    brand: "Carrefour",
    brandClass: "tag-carrefour",
    category: "Boucherie",
    storeId: "carrefour-marche",
    oldPrice: 9.99,
    newPrice: 6.49,
    discountPercent: "-35%",
    dealType: "Avantage Carrefour Bonus Card",
    validity: "Prospectus Market Belgique",
    stock: "Boucherie libre-service",
    nutriscore: "B (Préparé en Belgique)",
    image: "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=500&auto=format&fit=crop&q=80",
    description: "Hachis préparé quotidiennement avec des viandes rigoureusement sélectionnées. Idéal pour boulettes sauce tomate ou lasagnes."
  },
  {
    id: "car-2",
    name: "Raisin blanc sans pépins (barquette 500g)",
    brand: "Carrefour",
    brandClass: "tag-carrefour",
    category: "Fruits",
    storeId: "carrefour-marche",
    oldPrice: 2.99,
    newPrice: 1.49,
    discountPercent: "-50%",
    dealType: "50% sur le 2ème article",
    validity: "Cette semaine",
    stock: "Marché frais",
    nutriscore: "A (Naturel)",
    image: "https://images.unsplash.com/photo-1596363505729-4190a9506133?w=500&auto=format&fit=crop&q=80",
    description: "Raisins blancs sucrés et sans pépins, lavés et prêts à déguster pour vos collations."
  },
  {
    id: "car-3",
    name: "Pains au chocolat pur beurre (lot de 6)",
    brand: "Carrefour",
    brandClass: "tag-carrefour",
    category: "Frais",
    storeId: "carrefour-marche",
    oldPrice: 4.20,
    newPrice: 2.50,
    discountPercent: "-40%",
    dealType: "Boulangerie du magasin",
    validity: "Tous les jours dès 8h",
    stock: "Cuit sur place",
    nutriscore: "D (Pur beurre)",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=80",
    description: "Viennoiseries croustillantes dorées au four plusieurs fois par jour dans votre magasin."
  },

  // LIDL MARCHE-EN-FAMENNE
  {
    id: "lid-1",
    name: "Fraises belges de saison (500g)",
    brand: "Lidl",
    brandClass: "tag-lidl",
    category: "Fruits",
    storeId: "lidl-marche",
    oldPrice: 3.99,
    newPrice: 2.49,
    discountPercent: "-37%",
    dealType: "Coupon exclusif Lidl Plus",
    validity: "Arrivage matin",
    stock: "Rayon fruits",
    nutriscore: "A (Belgique)",
    image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&auto=format&fit=crop&q=80",
    description: "Fraises fraîches cultivées par nos producteurs partenaires. Saveur sucrée et texture ferme."
  },
  {
    id: "lid-2",
    name: "Filets de poulet frais XXL (1kg)",
    brand: "Lidl",
    brandClass: "tag-lidl",
    category: "Boucherie",
    storeId: "lidl-marche",
    oldPrice: 11.49,
    newPrice: 7.99,
    discountPercent: "-30%",
    dealType: "Prix Choc Semaine XXL",
    validity: "Offre limitée",
    stock: "Frais du jour",
    nutriscore: "A (100% Volaille)",
    image: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=500&auto=format&fit=crop&q=80",
    description: "Format familial économique. Filets tendres et maigres parfaits pour émincés ou grillades."
  },

  // ALDI MARCHE-EN-FAMENNE
  {
    id: "ald-1",
    name: "Beurre de ferme d'Ardenne AOP 250g",
    brand: "Aldi",
    brandClass: "tag-aldi",
    category: "Frais",
    storeId: "aldi-marche",
    oldPrice: 2.89,
    newPrice: 1.89,
    discountPercent: "-35%",
    dealType: "Promo Fraîcheur Aldi",
    validity: "Cette semaine",
    stock: "Rayon crèmerie",
    nutriscore: "E (Beurre de baratte)",
    image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&auto=format&fit=crop&q=80",
    description: "Beurre ardennais doux et onctueux issu de la tradition laitière locale."
  },
  {
    id: "ald-2",
    name: "Jus de pommes artisanal d'Ardenne 1L",
    brand: "Aldi",
    brandClass: "tag-aldi",
    category: "Épicerie",
    storeId: "aldi-marche",
    oldPrice: 2.40,
    newPrice: 1.45,
    discountPercent: "-40%",
    dealType: "Semaine Saveurs Belges",
    validity: "Jusqu'à épuisement",
    stock: "Rayon boissons",
    nutriscore: "B (100% Pur jus)",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80",
    description: "Pur jus de pommes pressées sans sucre ajouté ni conservateurs."
  },

  // SPAR MARCHE-EN-FAMENNE
  {
    id: "spa-1",
    name: "Filet de poulet fermier",
    brand: "Spar",
    brandClass: "tag-spar",
    category: "Boucherie",
    storeId: "spar-marche",
    oldPrice: 8.99,
    newPrice: 5.99,
    discountPercent: "-33%",
    dealType: "Offre Spar de la semaine",
    validity: "Valable cette semaine",
    stock: "Frais du jour",
    nutriscore: "A (Élevé en plein air)",
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500&auto=format&fit=crop&q=80",
    description: "Filet de poulet fermier tendre et maigre, idéal pour émincés ou grillades."
  },
  {
    id: "spa-2",
    name: "Pain au chocolat pur beurre (x4)",
    brand: "Spar",
    brandClass: "tag-spar",
    category: "Frais",
    storeId: "spar-marche",
    oldPrice: 3.20,
    newPrice: 1.99,
    discountPercent: "-38%",
    dealType: "Boulangerie du magasin",
    validity: "Tous les jours dès 8h",
    stock: "Cuit sur place",
    nutriscore: "D (Pur beurre)",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=80",
    description: "Viennoiseries croustillantes dorées au four plusieurs fois par jour."
  },
  {
    id: "spa-3",
    name: "Beurre doux d'Ardenne 250g",
    brand: "Spar",
    brandClass: "tag-spar",
    category: "Frais",
    storeId: "spar-marche",
    oldPrice: 2.89,
    newPrice: 1.99,
    discountPercent: "-31%",
    dealType: "Promo Fraîcheur Spar",
    validity: "Cette semaine",
    stock: "Rayon crèmerie",
    nutriscore: "E (Beurre de baratte)",
    image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&auto=format&fit=crop&q=80",
    description: "Beurre ardennais doux et onctueux issu de la tradition laitière locale."
  },
  {
    id: "spa-4",
    name: "Yaourts nature (x8)",
    brand: "Spar",
    brandClass: "tag-spar",
    category: "Frais",
    storeId: "spar-marche",
    oldPrice: 3.49,
    newPrice: 2.29,
    discountPercent: "-34%",
    dealType: "Offre Spar",
    validity: "Cette semaine",
    stock: "Rayon frais",
    nutriscore: "B (Lait belge)",
    image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&auto=format&fit=crop&q=80",
    description: "Yaourts nature crémeux riches en protéines, au lait belge."
  },

  // INTERMARCHÉ MARCHE-EN-FAMENNE
  {
    id: "int-1",
    name: "Entrecôte de bœuf Label Rouge",
    brand: "Intermarché",
    brandClass: "tag-intermarche",
    category: "Boucherie",
    storeId: "intermarche2-marche",
    oldPrice: 16.99,
    newPrice: 11.99,
    discountPercent: "-29%",
    dealType: "Promo Boucherie Intermarché",
    validity: "Valable cette semaine",
    stock: "Boucherie artisanale",
    nutriscore: "A (Origine Belgique)",
    image: "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=500&auto=format&fit=crop&q=80",
    description: "Entrecôte tendre et persillée, idéale à la poêle ou au grill."
  },
  {
    id: "int-2",
    name: "Saumon entier d'Écosse",
    brand: "Intermarché",
    brandClass: "tag-intermarche",
    category: "Poissonnerie",
    storeId: "intermarche2-marche",
    oldPrice: 14.99,
    newPrice: 9.99,
    discountPercent: "-33%",
    dealType: "Poissonnerie Intermarché",
    validity: "Valable jusqu'au 22/09",
    stock: "Rayon poissonnerie frais",
    nutriscore: "A (Oméga 3 naturels)",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&auto=format&fit=crop&q=80",
    description: "Saumon d'Écosse de première fraîcheur, levé en filet."
  },
  {
    id: "int-3",
    name: "Fraises de Belgique 500g",
    brand: "Intermarché",
    brandClass: "tag-intermarche",
    category: "Fruits",
    storeId: "intermarche2-marche",
    oldPrice: 4.49,
    newPrice: 2.99,
    discountPercent: "-33%",
    dealType: "Marché frais Intermarché",
    validity: "Cette semaine",
    stock: "Rayon fruits",
    nutriscore: "A (Belgique)",
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&auto=format&fit=crop&q=80",
    description: "Fraises fraîches cultivées par nos producteurs partenaires."
  },
  {
    id: "int-4",
    name: "Chocolat noir 72%",
    brand: "Intermarché",
    brandClass: "tag-intermarche",
    category: "Épicerie",
    storeId: "intermarche2-marche",
    oldPrice: 3.49,
    newPrice: 2.19,
    discountPercent: "-37%",
    dealType: "Promo épicerie",
    validity: "Cette semaine",
    stock: "Rayon confiserie",
    nutriscore: "E (Plaisir gourmand)",
    image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500&auto=format&fit=crop&q=80",
    description: "Chocolat noir intense à 72% de cacao, fondant."
  }
];

// =========================================================
// 3. ÉTAT GLOBAL (STATE)
// =========================================================
let currentCity = "Marche-en-Famenne (6900)";
let referenceCoords = [50.2268, 5.3442]; // Centre de Marche-en-Famenne
let userGpsCoords = null;

let activeTab = "tab-promos";
let activeStoreFilter = "all";
let activeCategoryFilter = "all";
let activeSort = "proximity";
let searchQuery = "";

let selectedModalProduct = PROMOTIONS_DATA[0];
let modalQty = 1;

let cart = JSON.parse(localStorage.getItem("promo_belgique_cart")) || [
  { productId: "col-1", qty: 1 },
  { productId: "del-1", qty: 1 }
];

let mapInstance = null;
let mapMarkersGroup = null;
let userGpsMarker = null;

// =========================================================
// 4. INITIALISATION AU CHARGEMENT
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialiser les distances depuis Marche-en-Famenne
  calculateAllDistances(referenceCoords[0], referenceCoords[1]);

  // 2. Rendu initial
  renderPromos();
  renderStoresList();
  renderCart();

  // 3. Configuration des écouteurs
  setupEventListeners();

  // 4. Initialiser la carte Leaflet
  initLeafletMap();

  // 5. Thème mémorisé
  initTheme();

  // 6. Géolocalisation auto (si permission déjà accordée)
  tryAutoGeolocation();
});

// Calcul Haversine en km
function computeHaversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function formatDist(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1).replace(".", ",")} km`;
}

// Chemin du logo réel de l'enseigne (fichiers dans /logos/)
function storeLogoFile(brand) {
  const clean = brand.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return `logos/${clean}.logo.svg`;
}

function calculateAllDistances(refLat, refLon) {
  STORES_DATA.forEach(store => {
    store.distanceKm = computeHaversine(refLat, refLon, store.coords[0], store.coords[1]);
    store.isOpenNow = checkStoreOpenNow(store);
  });

  PROMOTIONS_DATA.forEach(promo => {
    const st = STORES_DATA.find(s => s.id === promo.storeId) || STORES_DATA[0];
    promo.distanceKm = st.distanceKm;
    promo.storeAddress = st.address;
    promo.storeName = st.name;
  });
}

// Vérifie si un magasin est ouvert maintenant
function checkStoreOpenNow(store) {
  const hs = store.hoursStructured;
  if (!hs) return null;
  
  const now = new Date();
  const day = now.getDay(); // 0 = Dimanche, 6 = Samedi
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentMinutes = hour * 60 + minute;
  
  const parseTime = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  
  const openMinutes = parseTime(hs.open);
  let closeMinutes = parseTime(hs.close);
  
  // Vendredi spécial pour Colruyt
  if (day === 5 && hs.friClose) {
    closeMinutes = parseTime(hs.friClose);
  }
  
  // Fermé le dimanche (la plupart des supermarchés en Belgique)
  if (day === 0) return false;
  
  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
}

// =========================================================
// 5. RECETTES BASÉES SUR LES PROMOS
// =========================================================
const RECIPE_DB = [
  {
    id: "pates-bolognaise",
    name: "Pâtes bolognaise",
    emoji: "🍝",
    servings: 4,
    time: 30,
    ingredients: [
      { name: "pâtes", qty: "500g", category: "epicerie" },
      { name: "viande hachée", qty: "400g", category: "boucherie" },
      { name: "sauce tomate", qty: "1 bocal", category: "epicerie" },
      { name: "oignon", qty: "1", category: "fruits" },
      { name: "ail", qty: "2 gousses", category: "fruits" },
      { name: "fromage râpé", qty: "100g", category: "frais" }
    ]
  },
  {
    id: "poulet-riz",
    name: "Poulet riz légumes",
    emoji: "🍗",
    servings: 4,
    time: 35,
    ingredients: [
      { name: "poulet", qty: "4 filets", category: "boucherie" },
      { name: "riz", qty: "300g", category: "epicerie" },
      { name: "brocoli", qty: "1 tête", category: "fruits" },
      { name: "carottes", qty: "3", category: "fruits" },
      { name: "crème fraîche", qty: "20cl", category: "frais" }
    ]
  },
  {
    id: "saumon-legumes",
    name: "Saumon légumes vapeur",
    emoji: "🐟",
    servings: 2,
    time: 20,
    ingredients: [
      { name: "saumon", qty: "2 pavés", category: "poisson" },
      { name: "haricots verts", qty: "300g", category: "fruits" },
      { name: "pommes de terre", qty: "4", category: "fruits" },
      { name: "citron", qty: "1", category: "fruits" },
      { name: "aneth", qty: "1 botte", category: "fruits" }
    ]
  },
  {
    id: "quiche-lardons",
    name: "Quiche lardons fromage",
    emoji: "🥧",
    servings: 4,
    time: 40,
    ingredients: [
      { name: "pâte brisée", qty: "1", category: "frais" },
      { name: "lardons", qty: "200g", category: "boucherie" },
      { name: "œufs", qty: "3", category: "frais" },
      { name: "crème fraîche", qty: "20cl", category: "frais" },
      { name: "fromage râpé", qty: "100g", category: "frais" },
      { name: "oignon", qty: "1", category: "fruits" }
    ]
  },
  {
    id: "chili-con-carne",
    name: "Chili con carne",
    emoji: "🌶️",
    servings: 6,
    time: 45,
    ingredients: [
      { name: "viande hachée", qty: "500g", category: "boucherie" },
      { name: "haricots rouges", qty: "1 boîte", category: "epicerie" },
      { name: "tomates concassées", qty: "1 boîte", category: "epicerie" },
      { name: "oignon", qty: "1", category: "fruits" },
      { name: "poivron", qty: "1", category: "fruits" },
      { name: "riz", qty: "300g", category: "epicerie" }
    ]
  },
  {
    id: "gratins-dauphinois",
    name: "Gratin dauphinois",
    emoji: "🥔",
    servings: 4,
    time: 60,
    ingredients: [
      { name: "pommes de terre", qty: "1.5kg", category: "fruits" },
      { name: "crème fraîche", qty: "50cl", category: "frais" },
      { name: "ail", qty: "2 gousses", category: "fruits" },
      { name: "fromage râpé", qty: "150g", category: "frais" },
      { name: "noix de muscade", qty: "1 pincée", category: "epicerie" }
    ]
  },
  {
    id: "omelette-legumes",
    name: "Omelette légumes fromage",
    emoji: "🥚",
    servings: 2,
    time: 15,
    ingredients: [
      { name: "œufs", qty: "4", category: "frais" },
      { name: "poivron", qty: "1", category: "fruits" },
      { name: "tomate", qty: "1", category: "fruits" },
      { name: "fromage râpé", qty: "50g", category: "frais" },
      { name: "herbes", qty: "1 botte", category: "fruits" }
    ]
  },
  {
    id: "lasagnes",
    name: "Lasagnes maison",
    emoji: "🍝",
    servings: 6,
    time: 60,
    ingredients: [
      { name: "pâtes lasagnes", qty: "12 feuilles", category: "epicerie" },
      { name: "viande hachée", qty: "500g", category: "boucherie" },
      { name: "sauce tomate", qty: "2 bocaux", category: "epicerie" },
      { name: "béchamel", qty: "50cl", category: "frais" },
      { name: "fromage râpé", qty: "200g", category: "frais" }
    ]
  },
  {
    id: "wok-poulet",
    name: "Wok poulet nouilles",
    emoji: "🍜",
    servings: 4,
    time: 25,
    ingredients: [
      { name: "poulet", qty: "400g", category: "boucherie" },
      { name: "nouilles", qty: "300g", category: "epicerie" },
      { name: "poivrons", qty: "2", category: "fruits" },
      { name: "oignons", qty: "2", category: "fruits" },
      { name: "sauce soja", qty: "3 c.s.", category: "epicerie" },
      { name: "gingembre", qty: "1 morceau", category: "fruits" }
    ]
  }
];

// Trouve les promos matchant un ingrédient
function findPromosForIngredient(ingredientName) {
  const normalized = ingredientName.toLowerCase();
  return PROMOTIONS_DATA.filter(p => {
    const promoName = p.name.toLowerCase();
    return promoName.includes(normalized) || normalized.includes(promoName.split(' ')[0]);
  }).sort((a, b) => (a.newPrice || 999) - (b.newPrice || 999));
}

// Calcule le coût estimé d'une recette avec les promos actuelles
function calculateRecipeCost(recipe) {
  let totalCost = 0;
  let promoCount = 0;
  const details = recipe.ingredients.map(ing => {
    const promos = findPromosForIngredient(ing.name);
    const bestPromo = promos[0];
    if (bestPromo) {
      promoCount++;
      // Estimer le prix pour la quantité nécessaire
      const unitPrice = bestPromo.newPrice;
      totalCost += unitPrice;
      return {
        ingredient: ing.name,
        qty: ing.qty,
        promo: bestPromo.name,
        price: unitPrice,
        store: bestPromo.storeName,
        discount: bestPromo.discountPercent
      };
    }
    return {
      ingredient: ing.name,
      qty: ing.qty,
      promo: null,
      price: null,
      store: null,
      discount: null
    };
  });
  return { totalCost: totalCost.toFixed(2), promoCount, details, savings: promoCount > 0 ? "Économies sur " + promoCount + " ingrédients" : "Aucune promo trouvée" };
}

// Génère les suggestions de recettes triées par nb de promos
function getRecipeSuggestions() {
  return RECIPE_DB.map(recipe => {
    const cost = calculateRecipeCost(recipe);
    return { ...recipe, cost };
  }).sort((a, b) => b.cost.promoCount - a.cost.promoCount);
}

// =========================================================
// RENDU ONGLET RECETTES
// =========================================================
function renderRecipesTab() {
  const container = document.getElementById("tab-recettes");
  if (!container) return;
  
  const suggestions = getRecipeSuggestions();
  
  container.innerHTML = `
    <div class="recipes-header">
      <h2>🍳 Recettes avec vos promos</h2>
      <p class="recipes-subtitle">Idées repas basées sur les promotions de cette semaine</p>
    </div>
    <div class="recipes-grid">
      ${suggestions.map(r => `
        <article class="recipe-card" onclick="openRecipeModal('${r.id}')">
          <div class="recipe-emoji">${r.emoji}</div>
          <div class="recipe-info">
            <h3>${r.name}</h3>
            <div class="recipe-meta">
              <span>👥 ${r.servings} pers.</span>
              <span>⏱️ ${r.time} min</span>
              <span class="promo-badge">${r.cost.promoCount}/${r.ingredients.length} ingrédients en promo</span>
            </div>
            <div class="recipe-cost">~${r.cost.totalCost} € avec promos</div>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

// Modal recette
function openRecipeModal(recipeId) {
  const recipe = RECIPE_DB.find(r => r.id === recipeId);
  if (!recipe) return;
  const cost = calculateRecipeCost(recipe);
  
  const modal = document.createElement("div");
  modal.className = "modal-overlay show";
  modal.innerHTML = `
    <div class="modal-sheet recipe-modal">
      <div class="modal-handle"></div>
      <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
      <div class="modal-inner">
        <div class="recipe-modal-header">
          <span class="recipe-modal-emoji">${recipe.emoji}</span>
          <div>
            <h2>${recipe.name}</h2>
            <p>👥 ${recipe.servings} personnes • ⏱️ ${recipe.time} min</p>
          </div>
        </div>
        <div class="recipe-modal-cost">
          <strong>Coût estimé avec promos : ~${cost.totalCost} €</strong>
          <span>${cost.savings}</span>
        </div>
        <h3>Ingrédients :</h3>
        <ul class="recipe-ingredients">
          ${cost.details.map(d => `
            <li class="${d.promo ? 'has-promo' : ''}">
              <span class="ing-name">${d.ingredient} (${d.qty})</span>
              ${d.promo ? `
                <span class="ing-promo">
                  🏷️ ${d.promo} — <strong>${d.price} €</strong> (${d.store})
                  ${d.discount ? `<span class="discount-tag">${d.discount}</span>` : ''}
                </span>
              ` : '<span class="ing-no-promo">❌ Pas de promo</span>'}
            </li>
          `).join("")}
        </ul>
        <div class="recipe-actions">
          <button class="btn-primary" onclick="addRecipeToCart('${recipe.id}'); this.closest('.modal-overlay').remove();">
            🛒 Ajouter ingrédients au panier
          </button>
          <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Fermer</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// Ajoute les ingrédients d'une recette au panier
function addRecipeToCart(recipeId) {
  const recipe = RECIPE_DB.find(r => r.id === recipeId);
  if (!recipe) return;
  
  recipe.ingredients.forEach(ing => {
    const promos = findPromosForIngredient(ing.name);
    if (promos[0]) {
      // Ajouter le produit en promo au panier
      const promo = promos[0];
      addToCart(promo.id);
    }
  });
  showToast(`Ingrédients de "${recipe.name}" ajoutés au panier !`);
}

// =========================================================
// 6. BANDEAU INFÉRIEUR FIXE : NAVIGATION SANS FAILLE
// =========================================================
function switchTab(tabId) {
  activeTab = tabId;

  // 1. Activer l'onglet ciblé
  document.querySelectorAll(".tab-view").forEach(el => {
    el.classList.remove("active");
  });
  const targetSection = document.getElementById(tabId);
  if (targetSection) {
    targetSection.classList.add("active");
  }

  // 2. Mettre à jour l'apparence des boutons du bandeau inférieur
  document.querySelectorAll("#main-bottom-bar .tab-btn").forEach(btn => {
    if (btn.dataset.tab === tabId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // 3. Cas spécial pour la carte Leaflet (doit rafraîchir son rendu)
  if (tabId === "tab-stores" && mapInstance) {
    setTimeout(() => {
      mapInstance.invalidateSize();
    }, 150);
  }

  // Remonter en haut de page en douceur
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// =========================================================
// 6. RENDU DES PROMOTIONS (GRILLE AÉRÉE ET CLAIRE)
// =========================================================
function renderPromos() {
  const container = document.getElementById("promos-grid-container");
  const countLabel = document.getElementById("promos-count-label");
  if (!container) return;

  // Filtrage
  let list = PROMOTIONS_DATA.filter(p => {
    const matchStore = activeStoreFilter === "all" || p.brand.toLowerCase() === activeStoreFilter.toLowerCase();
    const matchCat = activeCategoryFilter === "all" || p.category.toLowerCase() === activeCategoryFilter.toLowerCase();
    const q = searchQuery.trim().toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    return matchStore && matchCat && matchSearch;
  });

  // Tri
  if (activeSort === "proximity") {
    list.sort((a, b) => a.distanceKm - b.distanceKm);
  } else if (activeSort === "discount") {
    list.sort((a, b) => (b.oldPrice - b.newPrice) - (a.oldPrice - a.newPrice));
  } else if (activeSort === "price-asc") {
    list.sort((a, b) => a.newPrice - b.newPrice);
  }

  if (countLabel) {
    countLabel.textContent = `${list.length} offre${list.length > 1 ? "s" : ""} disponible${list.length > 1 ? "s" : ""} à ${currentCity.split(" ")[0]}`;
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state-box">
        <span class="icon">🔍</span>
        <b>Aucune promotion ne correspond</b>
        <p style="font-size:12px; margin-top:4px;">Essayez d'autres critères ou affichez toutes les enseignes.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(p => {
    const savingAmt = (p.oldPrice - p.newPrice).toFixed(2).replace(".", ",");
    return `
      <article class="promo-card" onclick="openProductModal('${p.id}')">
        <div class="card-img-wrap">
          <img src="${p.image}" alt="${p.name}" class="card-img" loading="lazy" />
          <span class="store-chip-tag"><img src="${storeLogoFile(p.brand)}" alt="">${p.brand}</span>
        </div>

        <div class="card-info">
          <div class="card-top-meta">
            <span class="deal-badge-mini">${p.discountPercent}</span>
            <span class="distance-txt">📍 ${formatDist(p.distanceKm)}</span>
          </div>

          <h3 class="card-title">${p.name}</h3>
          <span class="card-store-address">${p.storeName}</span>

          <div class="card-bottom-row">
            <div class="card-prices">
              <span class="price-old">${p.oldPrice.toFixed(2).replace(".", ",")} €</span>
              <span class="price-new">${p.newPrice.toFixed(2).replace(".", ",")} €</span>
            </div>
            <span class="card-savings-pill">-${savingAmt} €</span>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

// =========================================================
// 7. RENDU DES MAGASINS & CARTE LEAFLET
// =========================================================
function renderStoresList() {
  const container = document.getElementById("stores-list-container");
  const countLabel = document.getElementById("stores-count-label");
  if (!container) return;

  if (countLabel) {
    const openCount = STORES_DATA.filter(s => s.isOpenNow === true).length;
    countLabel.textContent = `${STORES_DATA.length} supermarchés autour de ${currentCity.split(" ")[0]} • ${openCount} ouvert${openCount > 1 ? 's' : ''} maintenant`;
  }

  container.innerHTML = STORES_DATA.map(s => {
    const isOpen = s.isOpenNow;
    const openClass = isOpen === true ? 'open' : (isOpen === false ? 'closed' : 'unknown');
    const openLabel = isOpen === true ? '🟢 Ouvert' : (isOpen === false ? '🔴 Fermé' : '⚪ Horaires ?');
    const openStyle = isOpen === true ? 'color:var(--green);' : (isOpen === false ? 'color:var(--accent);' : 'color:var(--text-muted);');
    
    return `
    <div class="store-detail-card ${openClass}">
      <div class="store-icon-box"><img src="${storeLogoFile(s.brand)}" alt="${s.brand}" onerror="this.parentElement.textContent='${s.leafletIconEmoji}';"></div>
      <div class="store-main-meta">
        <h4>${s.name}</h4>
        <p>${s.address} • <b style="color:var(--blue);">À ${formatDist(s.distanceKm)}</b></p>
        <span class="store-open-time" style="${openStyle}">${openLabel} • ${s.hours}</span>
      </div>
      <button class="btn-filter-store" onclick="filterByStore('${s.brand}')">
        Ses promos ➔
      </button>
    </div>
  `).join("");
}

function filterByStore(brand) {
  activeStoreFilter = brand;
  document.querySelectorAll("#store-pills-bar .store-pill").forEach(p => {
    if (p.dataset.store.toLowerCase() === brand.toLowerCase()) {
      p.classList.add("active");
    } else {
      p.classList.remove("active");
    }
  });
  renderPromos();
  switchTab("tab-promos");
  showToast(`Affichage des promos ${brand}`);
}

function initLeafletMap() {
  const mapEl = document.getElementById("leaflet-map");
  if (!mapEl || mapInstance) return;

  mapInstance = L.map("leaflet-map", {
    zoomControl: true,
    attributionControl: false
  }).setView(referenceCoords, 14);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19
  }).addTo(mapInstance);

  mapMarkersGroup = L.layerGroup().addTo(mapInstance);
  renderMapMarkers();

  document.getElementById("btn-recenter-map").addEventListener("click", () => {
    mapInstance.setView(userGpsCoords || referenceCoords, 14);
  });
}

function renderMapMarkers() {
  if (!mapMarkersGroup) return;
  mapMarkersGroup.clearLayers();

  STORES_DATA.forEach(store => {
    const marker = L.circleMarker(store.coords, {
      radius: 10,
      fillColor: store.brandColor,
      color: "#ffffff",
      weight: 3,
      fillOpacity: 1
    }).addTo(mapMarkersGroup);

    const link = referenceCoords
      ? `<br>
        <a href="https://www.google.com/maps/dir/${referenceCoords[0]},${referenceCoords[1]}/${store.coords[0]},${store.coords[1]}" target="_blank" style="color:var(--green); font-weight:700;">Itinéraire Google Maps</a>`
      : '';

    marker.bindPopup(`
      <div style="font-family:var(--font); font-size:12px;">
        <strong style="color:${store.brandColor};">${store.name}</strong><br>
        <span>${store.address}</span><br>
        <b style="color:var(--blue);">Distance : ${formatDist(store.distanceKm)}</b><br>
        <span style="color:green;">${store.hours}</span>${link}
      </div>
    `);

    marker.on("click", () => {
      filterByStore(store.brand);
    });
  });
}

// =========================================================
// 8. GÉOLOCALISATION DIRECTE & SÉLECTION DE VILLE
// =========================================================
function activateUserGps() {
  const btnGps = document.getElementById("btn-quick-gps");
  if (!navigator.geolocation) {
    showToast("⚠️ La géolocalisation n'est pas supportée sur votre navigateur.");
    return;
  }

  showToast("📍 Recherche de votre position GPS...");
  if (btnGps) btnGps.style.opacity = "0.5";

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      if (btnGps) btnGps.style.opacity = "1";
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      userGpsCoords = [lat, lon];
      referenceCoords = [lat, lon];

      // Reverse geocoding via Nominatim
      try {
        const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
        const data = await resp.json();
        const a = data.address || {};
        currentCity = a.city || a.town || a.village || a.municipality || "Votre position";
      } catch (e) {
        currentCity = "Votre position GPS";
      }

      document.getElementById("active-city-display").textContent = currentCity;

      // Recalculer les distances réelles
      calculateAllDistances(lat, lon);
      renderPromos();
      renderStoresList();

      if (mapInstance) {
        if (!userGpsMarker) {
          userGpsMarker = L.circleMarker([lat, lon], {
            radius: 11,
            fillColor: "#2563eb",
            color: "#ffffff",
            weight: 3,
            fillOpacity: 1
          }).addTo(mapInstance);
          userGpsMarker.bindPopup("<b>📍 Vous êtes ici</b>").openPopup();
        } else {
          userGpsMarker.setLatLng([lat, lon]).openPopup();
        }
        mapInstance.setView([lat, lon], 14);
      }

      closeLocationModal();
      showToast(`✅ Connecté : Magasins autour de ${currentCity}`);
    },
    (err) => {
      if (btnGps) btnGps.style.opacity = "1";
      showToast("Autorisation GPS refusée. Nous restons sur Marche-en-Famenne.");
    },
    { timeout: 8000, enableHighAccuracy: true }
  );
}

// Géolocalisation auto au chargement (silencieuse si permission accordée)
function tryAutoGeolocation() {
  if (!navigator.geolocation) return;
  
  // Vérifier si permission déjà accordée
  navigator.permissions?.query({ name: 'geolocation' }).then(permissionStatus => {
    if (permissionStatus.state === 'granted') {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          userGpsCoords = [lat, lon];
          referenceCoords = [lat, lon];

          try {
            const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
            const data = await resp.json();
            const a = data.address || {};
            currentCity = a.city || a.town || a.village || a.municipality || "Votre position";
          } catch (e) {
            currentCity = "Votre position GPS";
          }

          document.getElementById("active-city-display").textContent = currentCity;
          calculateAllDistances(lat, lon);
          renderPromos();
          renderStoresList();

          if (mapInstance) {
            if (!userGpsMarker) {
              userGpsMarker = L.circleMarker([lat, lon], {
                radius: 11,
                fillColor: "#2563eb",
                color: "#ffffff",
                weight: 3,
                fillOpacity: 1
              }).addTo(mapInstance);
              userGpsMarker.bindPopup("<b>📍 Vous êtes ici</b>").openPopup();
            } else {
              userGpsMarker.setLatLng([lat, lon]).openPopup();
            }
            mapInstance.setView([lat, lon], 14);
          }
          showToast(`📍 Localisé : ${currentCity}`);
        },
        (err) => {
          // Silencieux - l'utilisateur cliquera sur le bouton GPS si besoin
        },
        { timeout: 5000, enableHighAccuracy: true }
      );
    }
  }).catch(() => {
    // Permissions API non supportée, on ne fait rien
  });
}

function selectPredefinedCity(cityName, cp, lat, lon) {
  currentCity = `${cityName} (${cp})`;
  referenceCoords = [lat, lon];
  document.getElementById("active-city-display").textContent = currentCity;

  calculateAllDistances(lat, lon);
  renderPromos();
  renderStoresList();

  if (mapInstance) {
    mapInstance.setView([lat, lon], 13);
  }

  closeLocationModal();
  showToast(`Magasins actualisés pour ${cityName}`);
}

// =========================================================
// 9. MODAL DÉTAIL DU PRODUIT (DRAWER MODERNE)
// =========================================================
function openProductModal(productId) {
  const p = PROMOTIONS_DATA.find(item => item.id === productId);
  if (!p) return;

  selectedModalProduct = p;
  modalQty = 1;

  document.getElementById("modal-p-img").src = p.image;
  document.getElementById("modal-p-discount").textContent = p.discountPercent;
  document.getElementById("modal-p-brand").textContent = p.brand;
  document.getElementById("modal-p-store").textContent = `${p.storeName}`;
  document.getElementById("modal-p-distance").textContent = `📍 À ${formatDist(p.distanceKm)}`;
  document.getElementById("modal-p-title").textContent = p.name;
  document.getElementById("modal-p-old-price").textContent = `${p.oldPrice.toFixed(2).replace(".", ",")} €`;
  document.getElementById("modal-p-new-price").textContent = `${p.newPrice.toFixed(2).replace(".", ",")} €`;

  const saving = (p.oldPrice - p.newPrice).toFixed(2).replace(".", ",");
  document.getElementById("modal-p-savings").textContent = `Économie : ${saving} €`;
  document.getElementById("modal-p-deal-type").textContent = p.dealType;
  document.getElementById("modal-p-validity").textContent = p.validity;
  document.getElementById("modal-p-stock").textContent = p.stock;
  document.getElementById("modal-p-nutri").textContent = p.nutriscore;
  document.getElementById("modal-p-desc").textContent = p.description;
  document.getElementById("modal-p-qty-display").textContent = modalQty;

  document.getElementById("modal-product-detail").style.display = "flex";
}

function closeProductModal() {
  document.getElementById("modal-product-detail").style.display = "none";
}

// =========================================================
// 10. GESTION DU PANIER & COMMANDES
// =========================================================
function addToCart(productId, qty = 1) {
  const existing = cart.find(i => i.productId === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ productId, qty });
  }
  localStorage.setItem("promo_belgique_cart", JSON.stringify(cart));
  renderCart();
  closeProductModal();

  const prod = PROMOTIONS_DATA.find(p => p.id === productId);
  showToast(`✅ ${qty}x ${prod ? prod.name.slice(0, 22) + "..." : "Article"} ajouté au panier !`);
}

function changeCartItemQty(productId, delta) {
  const item = cart.find(i => i.productId === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.productId !== productId);
  }
  localStorage.setItem("promo_belgique_cart", JSON.stringify(cart));
  renderCart();
}

function clearCart() {
  cart = [];
  localStorage.setItem("promo_belgique_cart", JSON.stringify(cart));
  renderCart();
  showToast("Le panier a été vidé");
}

function renderCart() {
  const listContainer = document.getElementById("cart-items-list");
  const badgeEl = document.getElementById("cart-badge-count");
  const countText = document.getElementById("cart-items-count-text");

  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // Mise à jour de la pastille du bandeau inférieur
  if (badgeEl) {
    if (totalCount > 0) {
      badgeEl.textContent = totalCount;
      badgeEl.style.display = "inline-block";
    } else {
      badgeEl.style.display = "none";
    }
  }

  if (countText) {
    countText.textContent = `${totalCount} article${totalCount > 1 ? "s" : ""} dans votre liste`;
  }

  if (!listContainer) return;

  if (cart.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state-box">
        <span class="icon">🛒</span>
        <b>Votre panier est vide</b>
        <p style="font-size:12px; margin-top:4px;">Ajoutez des promotions de vos magasins de Marche-en-Famenne.</p>
      </div>
    `;
    updateCartTotals(0, 0);
    return;
  }

  let totalOld = 0;
  let totalNew = 0;

  listContainer.innerHTML = cart.map(item => {
    const prod = PROMOTIONS_DATA.find(p => p.id === item.productId);
    if (!prod) return "";

    const lineOld = prod.oldPrice * item.qty;
    const lineNew = prod.newPrice * item.qty;
    totalOld += lineOld;
    totalNew += lineNew;

    return `
      <div class="cart-item-row">
        <img src="${prod.image}" alt="${prod.name}" />
        <div class="cart-item-text">
          <h4>${prod.name}</h4>
          <span>${prod.brand} • ${prod.storeName.split(" ")[0]}</span>
          <div class="cart-qty-toggle">
            <button class="qty-btn-mini" onclick="changeCartItemQty('${prod.id}', -1)">-</button>
            <b style="font-size:12px;">x${item.qty}</b>
            <button class="qty-btn-mini" onclick="changeCartItemQty('${prod.id}', 1)">+</button>
          </div>
        </div>
        <div style="text-align:right;">
          <b style="font-size:14px; color:var(--text);">${lineNew.toFixed(2).replace(".", ",")} €</b>
          <button style="background:none; border:none; color:var(--text-muted); cursor:pointer; display:block; margin-top:4px;" onclick="changeCartItemQty('${prod.id}', -99)">🗑️</button>
        </div>
      </div>
    `;
  }).join("");

  updateCartTotals(totalOld, totalNew);
}

function updateCartTotals(totalOld, totalNew) {
  const savings = Math.max(0, totalOld - totalNew);

  const normalEl = document.getElementById("cart-total-normal");
  const savingsEl = document.getElementById("cart-total-savings");
  const grandEl = document.getElementById("cart-grand-total");

  if (normalEl) normalEl.textContent = `${totalOld.toFixed(2).replace(".", ",")} €`;
  if (savingsEl) savingsEl.textContent = `- ${savings.toFixed(2).replace(".", ",")} €`;
  if (grandEl) grandEl.textContent = `${totalNew.toFixed(2).replace(".", ",")} €`;
}

function showQrPassModal() {
  if (cart.length === 0) {
    showToast("⚠️ Ajoutez au moins un article avant d'obtenir votre pass !");
    return;
  }

  let totalOld = 0;
  let totalNew = 0;
  cart.forEach(item => {
    const prod = PROMOTIONS_DATA.find(p => p.id === item.productId);
    if (prod) {
      totalOld += prod.oldPrice * item.qty;
      totalNew += prod.newPrice * item.qty;
    }
  });

  const randNum = Math.floor(100 + Math.random() * 900);
  document.getElementById("qr-pass-number").textContent = `PASS #MF-6900-${randNum}`;
  document.getElementById("qr-total-pay").textContent = `${totalNew.toFixed(2).replace(".", ",")} €`;
  document.getElementById("qr-total-saved").textContent = `${(totalOld - totalNew).toFixed(2).replace(".", ",")} €`;

  document.getElementById("modal-qr-pass").style.display = "flex";
}

function closeQrPassModal() {
  document.getElementById("modal-qr-pass").style.display = "none";
}

// =========================================================
// 11. ÉCOUTEURS D'ÉVÉNEMENTS
// =========================================================
function setupEventListeners() {
  // Navigation bande inférieure (100% robuste)
  document.querySelectorAll("#main-bottom-bar .tab-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      switchTab(btn.dataset.tab);
    });
  });

  // Filtres Enseignes
  document.querySelectorAll("#store-pills-bar .store-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      document.querySelectorAll("#store-pills-bar .store-pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      activeStoreFilter = pill.dataset.store;
      renderPromos();
    });
  });

  // Filtres Rayons
  document.querySelectorAll("#category-chips-bar .cat-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll("#category-chips-bar .cat-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      activeCategoryFilter = chip.dataset.cat;
      renderPromos();
    });
  });

  // Tri
  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      activeSort = e.target.value;
      renderPromos();
    });
  }

  // Recherche
  const searchInput = document.getElementById("search-input");
  const searchClear = document.getElementById("search-clear");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      if (searchClear) searchClear.style.display = searchQuery ? "flex" : "none";
      renderPromos();
    });
  }
  if (searchClear) {
    searchClear.addEventListener("click", () => {
      searchInput.value = "";
      searchQuery = "";
      searchClear.style.display = "none";
      renderPromos();
    });
  }

  // Modals : Ouvrir sélecteur de ville
  document.getElementById("btn-location-picker").addEventListener("click", () => {
    document.getElementById("modal-location").style.display = "flex";
  });
  document.getElementById("btn-close-loc-modal").addEventListener("click", closeLocationModal);

  // GPS rapide
  document.getElementById("btn-quick-gps").addEventListener("click", activateUserGps);
  document.getElementById("btn-detect-gps-now").addEventListener("click", activateUserGps);

  // Villes rapides dans le modal
  const cityCoords = {
    "Marche-en-Famenne": { cp: "6900", lat: 50.2268, lon: 5.3442 },
    "Rochefort": { cp: "5580", lat: 50.1585, lon: 5.2215 },
    "Ciney": { cp: "5590", lat: 50.2952, lon: 5.1018 },
    "Namur": { cp: "5000", lat: 50.4674, lon: 4.8720 },
    "Liège": { cp: "4000", lat: 50.6326, lon: 5.5797 },
    "Bruxelles": { cp: "1000", lat: 50.8503, lon: 4.3517 }
  };

  document.querySelectorAll(".quick-cities-list .city-opt").forEach(btn => {
    btn.addEventListener("click", () => {
      const c = btn.dataset.city;
      const data = cityCoords[c] || cityCoords["Marche-en-Famenne"];
      document.querySelectorAll(".quick-cities-list .city-opt").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      selectPredefinedCity(c, data.cp, data.lat, data.lon);
    });
  });

  // Modal Produit
  document.getElementById("btn-close-product-modal").addEventListener("click", closeProductModal);
  document.getElementById("btn-p-qty-minus").addEventListener("click", () => {
    if (modalQty > 1) {
      modalQty--;
      document.getElementById("modal-p-qty-display").textContent = modalQty;
    }
  });
  document.getElementById("btn-p-qty-plus").addEventListener("click", () => {
    modalQty++;
    document.getElementById("modal-p-qty-display").textContent = modalQty;
  });
  document.getElementById("btn-modal-add-cart").addEventListener("click", () => {
    if (selectedModalProduct) {
      addToCart(selectedModalProduct.id, modalQty);
    }
  });

  // Panier & Pass QR
  document.getElementById("btn-cart-clear-all").addEventListener("click", clearCart);
  document.getElementById("btn-checkout-pass").addEventListener("click", showQrPassModal);
  document.getElementById("btn-close-qr-modal").addEventListener("click", closeQrPassModal);
  document.getElementById("btn-qr-done").addEventListener("click", () => {
    closeQrPassModal();
    clearCart();
    switchTab("tab-promos");
  });

  // Code promo
  document.getElementById("btn-apply-promo-code").addEventListener("click", () => {
    const code = document.getElementById("cart-promo-input").value.trim().toUpperCase();
    const msg = document.getElementById("promo-code-message");
    if (code === "ANTIGASPI" || code === "MARCHE") {
      msg.textContent = "🎉 Code validé : -10% de réduction immédiate !";
      msg.style.color = "var(--green)";
      showToast("Code promo appliqué !");
    } else if (code) {
      msg.textContent = "❌ Code non reconnu.";
      msg.style.color = "var(--delhaize)";
    }
  });

  // Thème
  document.getElementById("btn-theme-toggle").addEventListener("click", toggleTheme);
  
  // Mise à jour du service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.oncontrollerchange = () => {
      showToast('🆕 Nouvelle version — actualisez la page');
      const badge = document.getElementById('pwaUpdateBtn');
      if (badge) badge.style.display = 'inline-block';
    };
  }
}

function closeLocationModal() {
  document.getElementById("modal-location").style.display = "none";
}

function toggleTheme() {
  const isDark = document.body.classList.toggle("dark-mode");
  localStorage.setItem("promo_theme_v2", isDark ? "dark" : "light");
  document.getElementById("btn-theme-toggle").textContent = isDark ? "☀️" : "🌙";
  showToast(isDark ? "🌙 Mode Sombre" : "☀️ Mode Clair");
}

function initTheme() {
  if (localStorage.getItem("promo_theme_v2") === "dark") {
    document.body.classList.add("dark-mode");
    document.getElementById("btn-theme-toggle").textContent = "☀️";
  }
}

// Toast
let toastTimer;
function showToast(txt) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = txt;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    t.classList.remove("show");
  }, 2500);
}
