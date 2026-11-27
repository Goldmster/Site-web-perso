// ===== Éléments de la page =====
const body = document.body;
const nav = document.querySelector("nav");
const titre = document.querySelector("body > h1");
const secret = document.getElementById("secret");
const liste = document.getElementById("liste");
const prods = document.querySelectorAll(".prod");

// ===== MODE SOMBRE / CLAIR =====
const boutonNuit = document.createElement("button");
boutonNuit.className = "btn-panier";
boutonNuit.textContent = "🌙 Mode nuit";
nav.appendChild(boutonNuit);

boutonNuit.addEventListener("click", () => {
    body.classList.toggle("sombre");
    if (body.classList.contains("sombre")) {
        boutonNuit.textContent = "☀️ Mode jour";
    } else {
        boutonNuit.textContent = "🌙 Mode nuit";
    }
});

// ===== RECHERCHE =====
const champ = document.createElement("input");
champ.placeholder = "🔍 Rechercher une prod...";
champ.style.cssText = "display:block; margin:20px auto; padding:10px; width:300px;";
liste.before(champ);

champ.addEventListener("input", () => {
    const recherche = champ.value.toLowerCase();
    prods.forEach((prod) => {
        const nom = prod.querySelector("#nom").textContent.toLowerCase();
        prod.classList.toggle("cache", !nom.includes(recherche));
    });
});

// ===== PANIER =====
let panier = []; // contient des { nom, prix }

// Le bouton dans la nav
const boutonPanier = document.createElement("button");
boutonPanier.className = "btn-panier";
nav.appendChild(boutonPanier);

// La boîte du panier (on réutilise la classe .carte), cachée au départ
const boitePanier = document.createElement("div");
boitePanier.className = "carte cache";
liste.before(boitePanier);

// Clic sur le bouton = afficher / cacher la boîte
boutonPanier.addEventListener("click", () => {
    boitePanier.classList.toggle("cache");
});

// Met à jour le bouton et la boîte
function majPanier() {
    const total = panier.reduce((somme, article) => somme + article.prix, 0);
    boutonPanier.textContent = `🛒 Panier (${panier.length})`;

    if (panier.length === 0) {
        boitePanier.innerHTML = "<h2>🛒 Panier</h2><p>Ton panier est vide</p>";
    } else {
        const lignes = panier.map((article) => `${article.nom} — ${article.prix} CHF`);
        boitePanier.innerHTML =
            "<h2>🛒 Panier</h2><p>" + lignes.join("<br>") + "</p>" +
            `<p><b>Total : ${total} CHF</b></p>`;
    }
}

// Clic sur "Acheter" : ajoute ou retire la prod
prods.forEach((prod) => {
    const nom = prod.querySelector("#nom").textContent;
    const prix = parseInt(prod.querySelector("#prix").textContent); // "15 CHF" -> 15
    const bouton = prod.querySelector("#achat");

    bouton.addEventListener("click", () => {
        const dejaDedans = panier.some((article) => article.nom === nom);

        if (dejaDedans) {
            panier = panier.filter((article) => article.nom !== nom);
            bouton.textContent = "Acheter";
            prod.classList.remove("danger");
        } else {
            panier.push({ nom, prix });
            bouton.textContent = "Retirer ✓";
            prod.classList.add("danger");
        }
        majPanier();
    });
});

majPanier();

// ===== EASTER EGG : clic sur "My Store" =====
titre.addEventListener("click", () => {
    secret.classList.toggle("cache");
});