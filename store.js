// ===== RÉGLAGES (à changer !) =====
// ⚠️ Compte admin : ces identifiants sont visibles par n'importe qui dans le code.
const ADMIN_PSEUDO = "admin";
const ADMIN_MDP = "admin1234";

// ===== Petites fonctions utiles =====
// Lire / écrire dans la mémoire du navigateur (localStorage)
function lire(cle, defaut) {
    const texte = localStorage.getItem(cle);
    return texte ? JSON.parse(texte) : defaut;
}
function ecrire(cle, valeur) {
    localStorage.setItem(cle, JSON.stringify(valeur));
}
// Crée un élément HTML rapidement
function creer(balise, classe, html) {
    const element = document.createElement(balise);
    element.className = classe;
    element.innerHTML = html || "";
    return element;
}
function nomDe(prod) {
    return prod.querySelector("#nom").textContent;
}

// ===== Éléments de la page =====
const body = document.body;
const nav = document.querySelector("nav");
const titre = document.querySelector("body > h1");
const secret = document.getElementById("secret");
const liste = document.getElementById("liste");

// ===== Données =====
let utilisateurs = lire("utilisateurs", []); // [{ pseudo, mdp }]
let connecte = lire("connecte", null);       // { pseudo, role } ou null
let supprimees = lire("supprimees", []);     // noms des prods supprimées par l'admin
let ajoutees = lire("ajoutees", []);         // prods ajoutées par l'admin
let panier = [];                             // [{ nom, prix }]

function estAdmin() {
    return connecte !== null && connecte.role === "admin";
}

// ===== MODE SOMBRE / CLAIR (bouton en haut à droite) =====
const boutonNuit = creer("button", "btn-panier", "🌙 Mode nuit");
boutonNuit.style.cssText = "position:fixed; top:15px; right:15px; margin:0; z-index:5;";
body.appendChild(boutonNuit);

function appliquerMode(sombre) {
    body.classList.toggle("sombre", sombre);
    boutonNuit.textContent = sombre ? "☀️ Mode jour" : "🌙 Mode nuit";
    localStorage.setItem("mode", sombre ? "sombre" : "clair");
}
appliquerMode(localStorage.getItem("mode") === "sombre");

boutonNuit.addEventListener("click", () => {
    appliquerMode(!body.classList.contains("sombre"));
});

// ===== BOUTONS DE LA NAV =====
const boutonPanier = creer("button", "btn-panier", "");
const boutonConnexion = creer("button", "btn-panier", "");
nav.append(boutonPanier, boutonConnexion);

// ===== BOÎTES (toutes cachées au départ) =====
const STYLE_CHAMP = "display:block; margin:8px auto; padding:8px; width:80%; box-sizing:border-box;";

const champ = creer("input", "", "");
champ.placeholder = "🔍 Rechercher une prod...";
champ.style.cssText = "display:block; margin:20px auto; padding:10px; width:300px;";

const boiteConnexion = creer("div", "carte cache", `
    <h2>👤 Connexion</h2>
    <p class="message"></p>
    <input class="c-pseudo" placeholder="Pseudo" style="${STYLE_CHAMP}">
    <input class="c-mdp" type="password" placeholder="Mot de passe" style="${STYLE_CHAMP}">
    <div class="boutons">
        <button class="c-connexion">Se connecter</button>
        <button class="c-inscription">Créer un compte</button>
    </div>
`);

const boitePanier = creer("div", "carte cache", `
    <h2>🛒 Panier</h2>
    <p class="contenu" style="white-space:pre-line"></p>
`);

const boiteAdmin = creer("div", "carte cache", `
    <h2>🛠 Espace admin</h2>
    <p class="users"></p>
    <h3>Ajouter une prod</h3>
    <input class="a-nom" placeholder="Nom de la prod" style="${STYLE_CHAMP}">
    <input class="a-prix" type="number" placeholder="Prix (CHF)" style="${STYLE_CHAMP}">
    <input class="a-lien" placeholder="Lien SoundCloud (https://...)" style="${STYLE_CHAMP}">
    <div class="boutons">
        <button class="a-ajouter">Ajouter</button>
    </div>
    <p class="message"></p>
`);

liste.before(champ, boiteConnexion, boitePanier, boiteAdmin);

// Raccourcis vers les éléments des boîtes
const messageConnexion = boiteConnexion.querySelector(".message");
const champPseudo = boiteConnexion.querySelector(".c-pseudo");
const champMdp = boiteConnexion.querySelector(".c-mdp");
const contenuPanier = boitePanier.querySelector(".contenu");
const listeUsers = boiteAdmin.querySelector(".users");
const adminNom = boiteAdmin.querySelector(".a-nom");
const adminPrix = boiteAdmin.querySelector(".a-prix");
const adminLien = boiteAdmin.querySelector(".a-lien");
const messageAdmin = boiteAdmin.querySelector(".message");

// ===== RECHERCHE =====
champ.addEventListener("input", () => {
    const recherche = champ.value.toLowerCase();
    document.querySelectorAll(".prod").forEach((prod) => {
        prod.classList.toggle("cache", !nomDe(prod).toLowerCase().includes(recherche));
    });
});

// ===== AUTHENTIFICATION =====
function ouvrirConnexion(texte) {
    messageConnexion.textContent = texte || "";
    boiteConnexion.classList.remove("cache");
    champPseudo.focus();
}

function connecter(pseudo, role) {
    connecte = { pseudo, role };
    ecrire("connecte", connecte);
    champPseudo.value = "";
    champMdp.value = "";
    boiteConnexion.classList.add("cache");
    majInterface();
}

function deconnecter() {
    connecte = null;
    localStorage.removeItem("connecte");
    panier = [];
    boitePanier.classList.add("cache");
    majPanier();
    majInterface();
}

function inscrire() {
    const pseudo = champPseudo.value.trim();
    const mdp = champMdp.value;

    if (pseudo === "" || mdp.length < 4) {
        messageConnexion.textContent = "Pseudo obligatoire et mot de passe de 4 caractères minimum.";
        return;
    }
    const dejaPris =
        pseudo.toLowerCase() === ADMIN_PSEUDO.toLowerCase() ||
        utilisateurs.some((u) => u.pseudo.toLowerCase() === pseudo.toLowerCase());
    if (dejaPris) {
        messageConnexion.textContent = "Ce pseudo existe déjà.";
        return;
    }
    utilisateurs.push({ pseudo, mdp });
    ecrire("utilisateurs", utilisateurs);
    connecter(pseudo, "utilisateur");
}

function seConnecter() {
    const pseudo = champPseudo.value.trim();
    const mdp = champMdp.value;

    if (pseudo === ADMIN_PSEUDO && mdp === ADMIN_MDP) {
        connecter(pseudo, "admin");
    } else if (utilisateurs.some((u) => u.pseudo === pseudo && u.mdp === mdp)) {
        connecter(pseudo, "utilisateur");
    } else {
        messageConnexion.textContent = "Pseudo ou mot de passe incorrect.";
    }
}

boutonConnexion.addEventListener("click", () => {
    if (connecte) {
        deconnecter();
    } else {
        boiteConnexion.classList.toggle("cache");
    }
});
boiteConnexion.querySelector(".c-connexion").addEventListener("click", seConnecter);
boiteConnexion.querySelector(".c-inscription").addEventListener("click", inscrire);
champMdp.addEventListener("keydown", (e) => {
    if (e.key === "Enter") seConnecter();
});

// Met à jour tout ce qui dépend de la connexion
function majInterface() {
    const admin = estAdmin();

    if (connecte) {
        const role = admin ? " — admin" : "";
        boutonConnexion.textContent = `🚪 Déconnexion (${connecte.pseudo}${role})`;
    } else {
        boutonConnexion.textContent = "👤 Connexion";
    }

    // Espace admin + boutons "Supprimer" visibles seulement pour l'admin
    boiteAdmin.classList.toggle("cache", !admin);
    document.querySelectorAll(".supprimer").forEach((bouton) => {
        bouton.classList.toggle("cache", !admin);
    });

    listeUsers.textContent =
        utilisateurs.length === 0
            ? "Aucun utilisateur inscrit."
            : "Utilisateurs inscrits : " + utilisateurs.map((u) => u.pseudo).join(", ");
}

// ===== PANIER =====
boutonPanier.addEventListener("click", () => {
    boitePanier.classList.toggle("cache");
});

function majPanier() {
    const total = panier.reduce((somme, article) => somme + article.prix, 0);
    boutonPanier.textContent = `🛒 Panier (${panier.length})`;

    if (panier.length === 0) {
        contenuPanier.textContent = "Ton panier est vide";
    } else {
        const lignes = panier.map((article) => `${article.nom} — ${article.prix} CHF`);
        contenuPanier.textContent = lignes.join("\n") + `\n\nTotal : ${total} CHF`;
    }

    // Bordure orange + texte du bouton sur chaque carte
    document.querySelectorAll(".prod").forEach((prod) => {
        const dedans = panier.some((article) => article.nom === nomDe(prod));
        prod.classList.toggle("danger", dedans);
        prod.querySelector("#achat").textContent = dedans ? "Retirer ✓" : "Acheter";
    });
}

// ===== CARTES DES PRODS =====
// Branche les boutons "Acheter" et "Supprimer" d'une carte
function activerCarte(prod) {
    const nom = nomDe(prod);
    const prix = parseInt(prod.querySelector("#prix").textContent); // "15 CHF" -> 15

    // Acheter : il faut être connecté
    prod.querySelector("#achat").addEventListener("click", () => {
        if (!connecte) {
            ouvrirConnexion("Connecte-toi pour acheter 🙂");
            return;
        }
        if (panier.some((article) => article.nom === nom)) {
            panier = panier.filter((article) => article.nom !== nom);
        } else {
            panier.push({ nom, prix });
        }
        majPanier();
    });

    // Supprimer : réservé à l'admin
    const supprimer = creer("button", "supprimer", "🗑 Supprimer");
    supprimer.classList.toggle("cache", !estAdmin());
    supprimer.addEventListener("click", () => {
        if (!estAdmin()) return;
        if (!confirm(`Supprimer « ${nom} » ?`)) return;

        if (ajoutees.some((p) => p.nom === nom)) {
            ajoutees = ajoutees.filter((p) => p.nom !== nom);
            ecrire("ajoutees", ajoutees);
        } else {
            supprimees.push(nom);
            ecrire("supprimees", supprimees);
        }
        panier = panier.filter((article) => article.nom !== nom);
        prod.remove();
        majPanier();
    });
    prod.querySelector(".boutons").appendChild(supprimer);
}

// Crée une carte pour une prod ajoutée par l'admin
function ajouterCarte(p) {
    const prod = creer("article", "carte prod", `
        <h1 id="nom"></h1>
        <p id="niveau">RnB</p>
        <p id="prix"></p>
        <div class="boutons">
            <button class="bouton-previ"><a id="previ" target="_blank">Prévisualiser</a></button>
            <button id="achat">Acheter</button>
        </div>
    `);
    prod.querySelector("#nom").textContent = p.nom;
    prod.querySelector("#prix").textContent = p.prix + " CHF";

    if (p.lien.startsWith("http")) {
        prod.querySelector("#previ").href = p.lien;
    } else {
        prod.querySelector(".bouton-previ").classList.add("cache");
    }
    liste.appendChild(prod);
    activerCarte(prod);
}

// ===== ESPACE ADMIN : ajouter une prod =====
boiteAdmin.querySelector(".a-ajouter").addEventListener("click", () => {
    if (!estAdmin()) return;

    const nom = adminNom.value.trim();
    const prix = parseInt(adminPrix.value);
    const lien = adminLien.value.trim();

    if (nom === "" || isNaN(prix)) {
        messageAdmin.textContent = "Le nom et le prix sont obligatoires.";
        return;
    }
    const existe = [...document.querySelectorAll(".prod")].some((prod) => nomDe(prod) === nom);
    if (existe) {
        messageAdmin.textContent = "Une prod avec ce nom existe déjà.";
        return;
    }

    const nouvelle = { nom, prix, lien };
    ajoutees.push(nouvelle);
    ecrire("ajoutees", ajoutees);
    ajouterCarte(nouvelle);

    adminNom.value = "";
    adminPrix.value = "";
    adminLien.value = "";
    messageAdmin.textContent = "✅ Prod ajoutée !";
    majPanier();
});

// ===== EASTER EGG : clic sur "My Store" =====
titre.addEventListener("click", () => {
    secret.classList.toggle("cache");
});

// ===== DÉMARRAGE =====
document.querySelectorAll(".prod").forEach((prod) => {
    if (supprimees.includes(nomDe(prod))) {
        prod.remove();
    } else {
        activerCarte(prod);
    }
});
ajoutees.forEach(ajouterCarte);

majPanier();
majInterface();