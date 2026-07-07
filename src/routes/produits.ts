// routes/produits.ts

import express from "express";
import {
  createProduit,
  getAllProduits,
  getProduitById,
  getProduitByName,
  updateProduit,
  deleteProduit,
} from "../services/produits";

const router = express.Router();


// GET /api/produits
router.get("/", async (req, res) => {
  try {
    const produits = await getAllProduits();
    res.status(200).json(produits);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des produits.",
      error,
    });
  }
});




// GET /api/produits/nom/:nom
router.get("/nom/:nom", async (req, res) => {
  try {
    const { nom } = req.params;

    const produit = await getProduitByName(nom);

    if (!produit) {
      return res.status(404).json({
        message: "Produit introuvable.",
      });
    }

    res.status(200).json(produit);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération du produit.",
      error,
    });
  }
});


// GET /api/produits/:id
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID invalide.",
      });
    }

    const produit = await getProduitById(id);

    if (!produit) {
      return res.status(404).json({
        message: "Produit introuvable.",
      });
    }

    res.status(200).json(produit);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération du produit.",
      error,
    });
  }
});



// POST /api/produits
router.post("/", async (req, res) => {
  try {
    const result = await createProduit(req.body);

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la création du produit.",
      error,
    });
  }
});


// PUT /api/produits/:id
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID invalide.",
      });
    }

    const result = await updateProduit(id, req.body);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour du produit.",
      error,
    });
  }
});


// DELETE /api/produits/:id
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID invalide.",
      });
    }

    const result = await deleteProduit(id);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression du produit.",
      error,
    });
  }
});

export default router;