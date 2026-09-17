# 🔥 PromoApp - Bons Plans & Anti-Gaspillage

> Application Web mobile interactive prête à être déployée en 1 clic sur **GitHub Pages**.

Découvrez des réductions exclusives près de chez vous, sauvez des produits de qualité du gaspillage et réservez-les directement depuis votre smartphone.

![Aperçu PromoApp](https://images.unsplash.com/photo-1542838132-92c53300491e?w=1000&auto=format&fit=crop&q=80)

---

## ✨ Fonctionnalités Clés

- 📱 **Simulateur Mobile Interactif** : Navigation fluide entre les 4 vues principales (*Accueil*, *Détail*, *Carte*, *Panier*) avec barre d'état et transitions soignées.
- 📑 **Vue Grille 4 Écrans (Maquette)** : Visualisation simultanée des 4 écrans en parallèle avec synchronisation en temps réel.
- 🔎 **Recherche Instantanée & Filtres** : Recherche par mot-clé et filtrage par rayons (Boucherie, Fruits & Légumes, Boulangerie, Frais, Épicerie).
- 🏷️ **Fiche Produit Complète** : Photos HD, calcul des économies réalisées, stock restant et sélecteur de quantité.
- 📍 **Carte Interactive Leaflet (OpenStreetMap)** : Géolocalisation des commerces partenaires sans aucune clé API requise.
- 🛒 **Panier Réactif & Code Promo** : Calcul automatique des remises, support du code promo `ANTIGASPI` (-10% supplémentaire) et persistance locale (`localStorage`).
- 🎟️ **Réservation avec QR Code** : Modal de confirmation avec QR Code généré pour le retrait en caisse.
- 📱 **Immersion Mobile PWA** : Sur smartphone, l'application s'adapte automatiquement en plein écran.

---

## 🚀 Déploiement sur GitHub Pages (Guide Pas-à-Pas)

Cette application est **100% statique** (HTML5, CSS3, JavaScript ES6) : elle ne nécessite **aucun serveur backend** ni commande `npm build`. Elle s'exécute directement dans le navigateur.

### Étape 1 : Créer votre dépôt sur GitHub
1. Connectez-vous sur [GitHub](https://github.com).
2. Rendez-vous sur [github.com/new](https://github.com/new).
3. Choisissez un nom de dépôt (par exemple `promo-app` ou `mon-site`).
4. Laissez le dépôt en **Public** et ne cochez pas "Add a README" (nous avons déjà le nôtre).
5. Cliquez sur **Create repository**.

### Étape 2 : Envoyer le code sur GitHub
Ouvrez un terminal (PowerShell ou Bash) dans le dossier du projet et tapez :

```bash
# 1. Initialiser le dépôt git local
git init

# 2. Ajouter tous les fichiers
git add .

# 3. Créer le premier commit
git commit -m "feat: Déploiement de PromoApp"

# 4. Renommer la branche principale en 'main'
git branch -M main

# 5. Lier votre dépôt distant (remplacez par votre URL GitHub)
git remote add origin https://github.com/VOTRE-PSEUDO/promo-app.git

# 6. Envoyer le code
git push -u origin main
```

### Étape 3 : Activer GitHub Pages
1. Sur la page de votre dépôt GitHub, cliquez sur l'onglet **Settings** (en haut à droite).
2. Dans la barre latérale gauche, cliquez sur **Pages** (dans la section *Code and automation*).
3. Sous **Build and deployment** :
   - Source : sélectionnez **Deploy from a branch**.
   - Branch : sélectionnez **main** et le dossier **/ (root)**.
4. Cliquez sur **Save**.

🎉 **C'est terminé !** Dans les 60 secondes qui suivent, votre application sera accessible publiquement à l'adresse :  
`https://VOTRE-PSEUDO.github.io/promo-app/`

---

## 🛠️ Personnalisation

### Modifier les Produits ou les Magasins
Ouvrez le fichier [`app.js`](./app.js) :
- Modifiez la constante `PRODUCTS` pour changer les noms, photos Unsplash, prix normaux et prix remisés.
- Modifiez la constante `STORES` pour indiquer les coordonnées GPS de votre propre ville (Paris, Marseille, Lyon, Bruxelles, etc.).

### Modifier les Couleurs de la Charte
Ouvrez le fichier [`styles.css`](./styles.css) et adaptez les variables CSS :
```css
:root {
  --accent: #ff5a3c;   /* Couleur principale */
  --accent2: #ff8a3c;  /* Couleur secondaire (dégradés) */
  --pill: #fef4f0;     /* Arrière-plan des badges */
}
```

---

## 📂 Structure du Projet

```
promo-app-github/
├── index.html        # Page principale (Simulateur + Grille 4 écrans)
├── styles.css        # Design system moderne et responsive
├── app.js            # Logique applicative, carte et gestion du panier
└── README.md         # Guide d'utilisation et de déploiement
```

---

*Développé avec soin pour GitHub Pages.*
