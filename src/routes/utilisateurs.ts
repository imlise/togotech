// routes/utilisateurs.ts

import express from "express";
import {
  createUtilisateur,
  getAllUtilisateurs,
  getUtilisateurById,
  getUtilisateurByName,
  getUtilisateurByEmail,
  updateUtilisateur,
  deleteUtilisateur,
} from "../services/utilisateurs";

const router = express.Router();


// GET /api/utilisateurs
router.get("/", async (req, res) => {
  try {
    const utilisateurs = await getAllUtilisateurs();
    res.status(200).json(utilisateurs);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des utilisateurs.",
      error,
    });
  }
});


// GET /api/utilisateurs/nom/:nom
router.get("/nom/:nom", async (req, res) => {
  try {
    const { nom } = req.params;

    const utilisateur = await getUtilisateurByName(nom);

    if (!utilisateur) {
      return res.status(404).json({
        message: "Utilisateur introuvable.",
      });
    }

    res.status(200).json(utilisateur);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération de l'utilisateur.",
      error,
    });
  }
});


// GET /api/utilisateurs/email/:email
router.get("/email/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const utilisateur = await getUtilisateurByEmail(email);

    if (!utilisateur) {
      return res.status(404).json({
        message: "Utilisateur introuvable.",
      });
    }

    res.status(200).json(utilisateur);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération de l'utilisateur.",
      error,
    });
  }
});


// GET /api/utilisateurs/:id
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID invalide.",
      });
    }

    const utilisateur = await getUtilisateurById(id);

    if (!utilisateur) {
      return res.status(404).json({
        message: "Utilisateur introuvable.",
      });
    }

    res.status(200).json(utilisateur);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération de l'utilisateur.",
      error,
    });
  }
});


// POST /api/utilisateurs
router.post("/", async (req, res) => {
  try {
    await createUtilisateur(req.body);

    res.status(201).json({
      success: true,
      message: "Utilisateur créé avec succès.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la création de l'utilisateur.",
      error,
    });
  }
});


// PUT /api/utilisateurs/:id
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID invalide.",
      });
    }

    await updateUtilisateur(id, req.body);

    res.status(200).json({
      success: true,
      message: "Utilisateur mis à jour avec succès.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la mise à jour de l'utilisateur.",
      error,
    });
  }
});


// DELETE /api/utilisateurs/:id
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID invalide.",
      });
    }

    const result = await deleteUtilisateur(id);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression de l'utilisateur.",
      error,
    });
  }
});

export default router;