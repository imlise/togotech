'use strict';

const API = "http://localhost:3000/api/produits";
const API_image = "http://localhost:3000/uploads/"

let produits = [];

document.addEventListener("DOMContentLoaded", async () => {

    TTLayout.initShell({
        page: "produits",
        title: "Produits"
    });

    document.getElementById("app-header").innerHTML =
        TTLayout.renderHeader({
            breadcrumb: [
                {
                    label: "Dashboard",
                    href: "dashboard.html"
                },
                {
                    label: "Produits"
                }
            ]
        }).replace(/^<header class="app-header">|<\/header>$/g, "");

    document
        .getElementById("produitSearch")
        ?.addEventListener(
            "input",
            TT.debounce(e => {

                renderProduits(e.target.value.trim());

            }, 200)
        );

    document
        .getElementById("addProduitBtn")
        ?.addEventListener(
            "click",
            () => openProduitModal()
        );

    await chargerProduits();

});

async function chargerProduits() {

    try {

        const response = await fetch(API);

        if (!response.ok)
            throw new Error();

        produits = await response.json();

        renderProduits();

    }

    catch (err) {

        Toast.error("Impossible de charger les produits.");

        console.error(err);

    }

}

function renderProduits(search = "") {

    let liste = [...produits];

    if (search) {

        const q = search.toLowerCase();

        liste = liste.filter(p =>

            p.nom.toLowerCase().includes(q)

            ||

            p.description.toLowerCase().includes(q)

        );

    }

    const grid = document.getElementById("produitsGrid");

    const empty = document.getElementById("produitsEmpty");

    if (!liste.length) {

        grid.innerHTML = "";

        empty.hidden = false;

        return;

    }

    empty.hidden = true;

    grid.innerHTML = liste.map(produit => {

        return `

        <div class="card product-card">

            <div class="product-head">

                <div></div>

                <div class="dropdown">

                    <button
                        class="btn btn--ghost btn--icon btn--sm dropdown__trigger">

                        <svg width="14"
                             height="14"
                             viewBox="0 0 14 14"
                             fill="none">

                            <circle cx="7"
                                    cy="3"
                                    r="1"
                                    fill="currentColor"/>

                            <circle cx="7"
                                    cy="7"
                                    r="1"
                                    fill="currentColor"/>

                            <circle cx="7"
                                    cy="11"
                                    r="1"
                                    fill="currentColor"/>

                        </svg>

                    </button>

                    <div class="dropdown__menu">

                        <button
                            class="dropdown__item"
                            data-edit="${produit.id}">

                            Modifier

                        </button>

                        <button
                            class="dropdown__item dropdown__item--danger"
                            data-delete="${produit.id}">

                            Supprimer

                        </button>

                    </div>

                </div>

            </div>

            <img
                src="${API_image}${produit.image}"
                class="product-image"
                alt="${produit.nom}">

            <div class="product-body">

                <div class="product-title">

                    ${produit.nom}

                </div>

                <div class="product-description">

                    ${produit.description}

                </div>

                <div class="product-price">

                    ${TT.formatNumber(produit.prixUnitaire)} FCFA

                </div>

                

            </div>

        </div>

        `;

    }).join("");

    initDropdowns();

    bindCardEvents();

}

function initDropdowns() {

    document
        .querySelectorAll(".dropdown")
        .forEach(dropdown => {

            const trigger =
                dropdown.querySelector(".dropdown__trigger");

            trigger?.addEventListener("click", e => {

                e.stopPropagation();

                document
                    .querySelectorAll(".dropdown.is-open")
                    .forEach(d => d.classList.remove("is-open"));

                dropdown.classList.toggle("is-open");

            });

        });

    document.addEventListener("click", () => {

        document
            .querySelectorAll(".dropdown.is-open")
            .forEach(d => d.classList.remove("is-open"));

    });

}

function bindCardEvents() {

    document
        .querySelectorAll("[data-edit]")
        .forEach(button => {

            button.addEventListener("click", () => {

                const produit = produits.find(

                    p => p.id == button.dataset.edit

                );

                openProduitModal(produit);

            });

        });

    document
        .querySelectorAll("[data-delete]")
        .forEach(button => {

            button.addEventListener("click", () => {

                supprimerProduit(button.dataset.delete);

            });

        });

}



function openProduitModal(produit = null) {

    TTComponents.openModal({

        title: produit
            ? "Modifier le produit"
            : "Nouveau produit",

        body: `

        <div class="field">

            <label class="field__label">
                Nom du produit
            </label>

            <input
                id="mNom"
                class="field__input"
                value="${produit?.nom || ""}">

        </div>

        <div class="field">

            <label class="field__label">
                Description
            </label>

            <textarea
                id="mDescription"
                class="field__input"
                rows="4"
                style="padding-top : 5px" >${produit?.description || ""}</textarea>

        </div>

        <div class="field">

            <label class="field__label">
                Prix unitaire
            </label>

            <input
                id="mPrix"
                type="number"
                class="field__input"
                value="${produit?.prixUnitaire || ""}">

        </div>

        

        <div class="field">

            <label class="field__label">
                Image
            </label>

            <input
                type="file"
                id="mImage"
                class="field__input"
                accept="image/*">

        </div>

        <div
            style="
                margin-top:18px;
                display:flex;
                justify-content:center;
            ">

            <img

                id="imagePreview"

                src="${
                    produit
                        ? API_image + produit.image
                        : ''
                }"

                style="
                    max-width:220px;
                    max-height:220px;
                    border-radius:12px;
                    object-fit:cover;
                    ${produit ? "" : "display:none;"}
                ">

        </div>

        `,

        footer: `

            <button
                class="btn btn--secondary"
                id="mCancel">

                Annuler

            </button>

            <button
                class="btn btn--primary"
                id="mSave">

                Enregistrer

            </button>

        `

    });

    document
        .getElementById("mCancel")
        .addEventListener(
            "click",
            TTComponents.closeModal
        );

    const imageInput =
        document.getElementById("mImage");

    const preview =
        document.getElementById("imagePreview");

    imageInput.addEventListener("change", e => {

        const file = e.target.files[0];

        if (!file)
            return;

        const reader = new FileReader();

        reader.onload = event => {

            preview.src = event.target.result;

            preview.style.display = "block";

        };

        reader.readAsDataURL(file);

    });

    document
        .getElementById("mSave")
        .addEventListener("click", () => {

            enregistrerProduit(produit);

        });

}


















async function enregistrerProduit(produit = null) {

    const nom =
        document.getElementById("mNom").value.trim();

    const description =
        document.getElementById("mDescription").value.trim();

    const prix =
        document.getElementById("mPrix").value;

    // const reduction =
    //     document.getElementById("mReduction").value;

    const image =
        document.getElementById("mImage").files[0];

    if (!nom) {

        Toast.error("Le nom est obligatoire.");

        return;

    }

    if (!description) {

        Toast.error("La description est obligatoire.");

        return;

    }

    if (!prix || Number(prix) <= 0) {

        Toast.error("Le prix est invalide.");

        return;

    }

    if (!produit && !image) {

        Toast.error("Veuillez sélectionner une image.");

        return;

    }

    const formData = new FormData();

    formData.append("nom", nom);

    formData.append("description", description);

    formData.append("prixUnitaire", prix);

    // formData.append("reduction", reduction);

    if (image) {

        formData.append("image", image);

    }

    try {

        let response;

        if (produit) {

            response = await fetch(

                `${API}/${produit.id}`,

                {
                    method: "PUT",
                    body: formData,
                }

            );

        } else {

            response = await fetch(

                API,

                {
                    method: "POST",
                    body: formData
                }

            );

        }

        if (!response.ok) {

            throw new Error();

        }

        TTComponents.closeModal();

        await chargerProduits();

        Toast.success(

            produit

                ? "Produit modifié."

                : "Produit ajouté."

        );

    }

    catch (err) {

    console.error("Erreur :", err);

    if (err instanceof Error) {
        console.error(err.message);
    }

    Toast.error("Une erreur est survenue.");

}

}


































async function supprimerProduit(id) {

    const confirmation = await TTComponents.confirm({

        title: "Supprimer le produit",

        message: "Cette action est irréversible.",

        danger: true

    });

    if (!confirmation)
        return;

    try {

        const response = await fetch(

            `${API}/${id}`,

            {
                method: "DELETE"
            }

        );

        if (!response.ok) {

            throw new Error();

        }
        if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || `Erreur HTTP ${response.status}`);
}

        produits = produits.filter(

            produit => produit.id != id

        );

        renderProduits();

        Toast.success(

            "Produit supprimé."

        );

    }

    catch (err) {

        console.error(err);

        Toast.error(

            "Impossible de supprimer le produit."

        );

    }

}