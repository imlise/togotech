// routes/factures.ts

import express from "express";
import {
  createFacture,
  getAllFactures,
  getFactureById,
  updateFacture,
  deleteFacture,
} from "../services/factures";

const router = express.Router();


// GET /api/factures
router.get("/", async (req, res) => {
  try {
    const factures = await getAllFactures();
    res.status(200).json(factures);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des factures.",
      error,
    });
  }
});


// GET /api/factures/:id
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID invalide.",
      });
    }

    const facture = await getFactureById(id);

    if (!facture) {
      return res.status(404).json({
        message: "Facture introuvable.",
      });
    }

    res.status(200).json(facture);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération de la facture.",
      error,
    });
  }
});


// POST /api/factures
router.post("/", async (req, res) => {
  try {
    const facture = req.body;

    const result = await createFacture(facture);

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la création de la facture.",
      error,
    });
  }
});


// PUT /api/factures/:id
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID invalide.",
      });
    }

    const result = await updateFacture(id, req.body);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour de la facture.",
      error,
    });
  }
});


// DELETE /api/factures/:id
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID invalide.",
      });
    }

    const result = await deleteFacture(id);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression de la facture.",
      error,
    });
  }
});

export default router;