// ===== Éléments de la page =====
const body = document.body;
const titre = document.querySelector("body > h1");
const zoneStore = document.getElementById("store");
const secret = document.getElementById("secret");
const liste = document.getElementById("liste");
const prods = document.querySelectorAll(".prod");

// ===== 1. MODE NUIT =====
const boutonNuit = document.createElement("button");
boutonNuit.textContent = "🌙 Mode nuit";
boutonNuit.style.marginLeft = "20px";
boutonNuit.style.cursor = "pointer";
document.querySelector("nav").appendChild(boutonNuit);

// On retrouve le choix de la dernière visite
if (localStorage.getItem("mode") === "sombre") {
    body.classList.add("sombre");
    boutonNuit.textContent = "☀️ Mode jour";
}

boutonNuit.addEventListener("click", () => {
    body.classList.toggle("sombre");
    const estSombre = body.classList.contains("sombre");
    boutonNuit.textContent = estSombre ? "☀️ Mode jour" : "🌙 Mode nuit";
    localStorage.setItem("mode", estSombre ? "sombre" : "clair");
});

// ===== 2. BARRE DE RECHERCHE =====
const champ = document.createElement("input");
champ.type = "search";
champ.placeholder = "🔍 Rechercher une prod...";
champ.style.cssText =
    "display:block; margin:20px auto; padding:10px; width:300px; border-radius:8px; border:1px solid #ccc;";
liste.before(champ);

champ.addEventListener("input", () => {
    const recherche = champ.value.toLowerCase();
    prods.forEach((prod) => {
        const nom = prod.querySelector("#nom").textContent.toLowerCase();
        // .cache = display:none (défini dans ton CSS)
        prod.classList.toggle("cache", !nom.includes(recherche));
    });
});

// ===== 3. PANIER =====
let panier = []; // liste de { nom, prix }

function majPanier() {
    if (panier.length === 0) {
        zoneStore.textContent = "🛒 Ton panier est vide";
        return;
    }
    const total = panier.reduce((somme, article) => somme + article.prix, 0);
    const noms = panier.map((article) => article.nom).join(", ");
    zoneStore.textContent = `🛒 ${panier.length} article(s) : ${noms} — Total : ${total} CHF`;
}

prods.forEach((prod) => {
    const nom = prod.querySelector("#nom").textContent;
    const prix = parseInt(prod.querySelector("#prix").textContent); // "15 CHF" -> 15
    const boutonAchat = prod.querySelector("#achat");

    boutonAchat.addEventListener("click", () => {
        const index = panier.findIndex((article) => article.nom === nom);

        if (index === -1) {
            // Pas encore dans le panier : on l'ajoute
            panier.push({ nom, prix });
            boutonAchat.textContent = "Retirer ✓";
            prod.classList.add("danger"); // bordure orange
        } else {
            // Déjà dedans : on le retire
            panier.splice(index, 1);
            boutonAchat.textContent = "Acheter";
            prod.classList.remove("danger");
        }
        majPanier();
    });
});

majPanier();

// ===== 4. EASTER EGG =====
// Un clic sur le titre "My Store" affiche / cache ta section secrète
titre.style.cursor = "pointer";
titre.addEventListener("click", () => {
    secret.classList.toggle("cache");
});