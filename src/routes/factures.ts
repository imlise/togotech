// routes/factures.ts

import express from "express";
import {
  createFacture,
  getAllFactures,
  getFactureById,
  updateFacture,
  deleteFacture,
  getFacturesStats,
  getRevenueStats,
  getLigneProduitsByFactureId,
  getNextFactureReference,
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


// GET /api/factures/stats
router.get("/stats", async (req, res) => {
  try {
    const stats = await getFacturesStats();

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des statistiques",
      error,
    });
  }
});



// GET /api/factures/revenue
router.get('/revenue', async (req, res) => {
  try {
    const period = req.query.period === '12months' ? '12months' : '6months';
    const result = await getRevenueStats(period);
    res.json(result.data);
  } catch (err) {
    console.error('❌ Error in /stats/revenue route:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques.' });
  }
});



// GET /api/factures/next-reference?isProforma=true
router.get("/next-reference", async (req, res) => {
  try {
    const isProforma = req.query.isProforma === "true";

    const reference = await getNextFactureReference(isProforma);

    return res.status(200).json({ reference });

  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Erreur lors de la génération de la référence",
      error: error.message,
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

router.get("/:id/lignes", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID invalide",
      });
    }

    const lignes = await getLigneProduitsByFactureId(id);

    return res.status(200).json(lignes);

  } catch (error: any) {
    console.error(error);
    return res.status(500).json({
      message: "Erreur lors de la récupération des lignes produits",
      error: error.message,
    });
  }
});


// POST /api/factures
function toTimestamp(dateString?: string) {
  // return dateString ? new Date(dateString).getTime() : null;
  return dateString ? new Date(dateString) : null;
} 
router.post("/", async (req, res) => {
  try {
    const body = req.body;
    const facture = {
      ...body,
      // dateEcheance: toTimestamp(body.dateEcheance),
      // dateDePaiement: toTimestamp(body.dateDePaiement),
      // dateDeLivraison: toTimestamp(body.dateDeLivraison),
    };

    const result = await createFacture(facture);

    res.status(201).json(result);
  }  catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erreur lors de la création de la facture.",
      error: error instanceof Error 
        ? error.message 
        : error
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