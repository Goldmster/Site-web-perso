let nom = prompt("Comment tu t'appelles ?")
console.log(nom);
let salut = document.querySelector("#salut");
slaut.textContent = "Bonjour " + nom + " ! ";
if(nom ==="")
    nom = "inconnu";